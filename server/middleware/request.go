package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"
)

const (
	// MaxRequestBodySize is the maximum request body size (10MB)
	MaxRequestBodySize = 10 * 1024 * 1024
	// DefaultRequestTimeout is the default maximum time for a request to complete
	DefaultRequestTimeout = 30 * time.Second
)

// MaxBodySize limits the request body size
func MaxBodySize(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			next.ServeHTTP(w, r)
		})
	}
}

// RequestTimeout adds a timeout to requests
func RequestTimeout(timeout time.Duration) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.TimeoutHandler(next, timeout, "Request timeout")
	}
}

// RequestID adds a unique request ID to each request for tracing
func RequestID(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := generateRequestID()
		w.Header().Set("X-Request-ID", requestID)
		next.ServeHTTP(w, r)
	})
}

func generateRequestID() string {
	// Generate a random 16-byte ID
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}
