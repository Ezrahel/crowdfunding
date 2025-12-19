package middleware

import (
	"context"
	"net/http"
	"strings"
	"sync"
	"time"
)

type rateLimiter struct {
	visitors map[string]*visitor
	mu       sync.RWMutex
	rate     int
	window   time.Duration
	ctx      context.Context
	cancel   context.CancelFunc
}

type visitor struct {
	count   int
	resetAt time.Time
}

// RateLimit creates a rate limiting middleware
func RateLimit(rate int, window time.Duration) func(http.Handler) http.Handler {
	ctx, cancel := context.WithCancel(context.Background())
	limiter := &rateLimiter{
		visitors: make(map[string]*visitor),
		rate:     rate,
		window:   window,
		ctx:      ctx,
		cancel:   cancel,
	}

	// Start cleanup goroutine
	go limiter.cleanup()

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := getClientIP(r)
			if !limiter.allow(ip) {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusTooManyRequests)
				w.Write([]byte(`{"message":"Rate limit exceeded","code":"RATE_LIMIT_EXCEEDED"}`))
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// Stop stops the rate limiter cleanup goroutine
func (rl *rateLimiter) Stop() {
	if rl.cancel != nil {
		rl.cancel()
	}
}

func (rl *rateLimiter) allow(ip string) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()

	now := time.Now()
	v, exists := rl.visitors[ip]

	if !exists || now.After(v.resetAt) {
		rl.visitors[ip] = &visitor{
			count:   1,
			resetAt: now.Add(rl.window),
		}
		return true
	}

	if v.count >= rl.rate {
		return false
	}

	v.count++
	return true
}

func (rl *rateLimiter) cleanup() {
	ticker := time.NewTicker(time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-rl.ctx.Done():
			// Cleanup on shutdown
			rl.mu.Lock()
			rl.visitors = make(map[string]*visitor)
			rl.mu.Unlock()
			return
		case <-ticker.C:
			rl.mu.Lock()
			now := time.Now()
			for ip, v := range rl.visitors {
				if now.After(v.resetAt) {
					delete(rl.visitors, ip)
				}
			}
			rl.mu.Unlock()
		}
	}
}

func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (for proxies)
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		ips := strings.Split(forwarded, ",")
		if len(ips) > 0 {
			return strings.TrimSpace(ips[0])
		}
	}

	// Check X-Real-IP header
	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	// Fall back to RemoteAddr
	ip := r.RemoteAddr
	if idx := strings.LastIndex(ip, ":"); idx != -1 {
		ip = ip[:idx]
	}
	return ip
}
