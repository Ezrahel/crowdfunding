# Critical Fixes Required - Action Plan

## 🔴 MUST FIX BEFORE PRODUCTION

### Priority 1: Data Consistency (Fix Immediately)

#### Fix 1: Atomic View Increment
**File:** `server/campaign/handlers.go:196-199`
```go
// BEFORE (BUGGY):
campaign.Views++
firestoreClient.Collection("campaigns").Doc(campaignID).Update(r.Context(), []firestore.Update{
    {Path: "views", Value: campaign.Views},
})

// AFTER (FIXED):
firestoreClient.Collection("campaigns").Doc(campaignID).Update(r.Context(), []firestore.Update{
    {Path: "views", Value: firestore.Increment(1)},
})
```

#### Fix 2: Donation Transaction Rollback
**File:** `server/donation/handlers.go:124-185`
```go
// Move donation creation INSIDE transaction
err = firestoreClient.RunTransaction(r.Context(), func(ctx context.Context, tx *firestore.Transaction) error {
    // Create donation document reference
    donationRef := firestoreClient.Collection("donations").NewDoc()
    donation.ID = donationRef.ID
    
    // Set donation
    if err := tx.Set(donationRef, donation); err != nil {
        return err
    }
    
    // Update campaign (existing logic)
    // ...
    
    return nil
})
```

#### Fix 3: Withdrawal Balance Calculation
**File:** `server/withdrawal/handlers.go:98-103`
```go
// BEFORE:
availableBalance := campaign.Raised

// AFTER:
pendingWithdrawals, _ := firestoreClient.Collection("withdrawals").
    Where("campaign_id", "==", req.CampaignID).
    Where("status", "in", []string{"pending", "processing"}).
    Documents(r.Context()).GetAll()

totalPending := 0.0
for _, w := range pendingWithdrawals {
    var withdrawal models.Withdrawal
    w.DataTo(&withdrawal)
    totalPending += withdrawal.Amount
}

availableBalance := campaign.Raised - totalPending
```

### Priority 2: Security (Fix Immediately)

#### Fix 4: Input Validation Middleware
**Create:** `server/middleware/validation.go`
```go
package middleware

import (
    "net/http"
    "regexp"
    "strings"
)

var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

func ValidateEmail(email string) bool {
    return emailRegex.MatchString(email)
}

func SanitizeString(s string, maxLen int) string {
    s = strings.TrimSpace(s)
    if len(s) > maxLen {
        s = s[:maxLen]
    }
    // Remove potentially dangerous characters
    s = strings.ReplaceAll(s, "<", "&lt;")
    s = strings.ReplaceAll(s, ">", "&gt;")
    return s
}

func MaxBodySize(maxBytes int64) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
            next.ServeHTTP(w, r)
        })
    }
}
```

#### Fix 5: Rate Limiting
**Create:** `server/middleware/ratelimit.go`
```go
package middleware

import (
    "net/http"
    "sync"
    "time"
)

type rateLimiter struct {
    visitors map[string]*visitor
    mu       sync.RWMutex
    rate     int
    window   time.Duration
}

type visitor struct {
    count    int
    resetAt  time.Time
}

func RateLimit(rate int, window time.Duration) func(http.Handler) http.Handler {
    limiter := &rateLimiter{
        visitors: make(map[string]*visitor),
        rate:     rate,
        window:   window,
    }
    
    go limiter.cleanup()
    
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            ip := r.RemoteAddr
            if !limiter.allow(ip) {
                http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
                return
            }
            next.ServeHTTP(w, r)
        })
    }
}

func (rl *rateLimiter) allow(ip string) bool {
    rl.mu.Lock()
    defer rl.mu.Unlock()
    
    v, exists := rl.visitors[ip]
    if !exists || time.Now().After(v.resetAt) {
        rl.visitors[ip] = &visitor{
            count:   1,
            resetAt: time.Now().Add(rl.window),
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
    for {
        time.Sleep(time.Minute)
        rl.mu.Lock()
        for ip, v := range rl.visitors {
            if time.Now().After(v.resetAt) {
                delete(rl.visitors, ip)
            }
        }
        rl.mu.Unlock()
    }
}
```

### Priority 3: Error Handling (Fix Immediately)

#### Fix 6: Standardized Error Responses
**Create:** `server/utils/errors.go`
```go
package utils

import (
    "encoding/json"
    "log"
    "net/http"
)

type APIError struct {
    Message string `json:"message"`
    Code    string `json:"code,omitempty"`
}

func WriteError(w http.ResponseWriter, status int, message string, code string) {
    log.Printf("API Error [%s]: %s", code, message)
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(APIError{
        Message: message,
        Code:    code,
    })
}

func WriteInternalError(w http.ResponseWriter, err error) {
    log.Printf("Internal error: %v", err)
    WriteError(w, http.StatusInternalServerError, "An internal error occurred", "INTERNAL_ERROR")
}
```

#### Fix 7: Fix UpdateCampaign Error Handling
**File:** `server/campaign/handlers.go:373-375`
```go
// BEFORE:
updatedDoc, _ := firestoreClient.Collection("campaigns").Doc(campaignID).Get(r.Context())

// AFTER:
updatedDoc, err := firestoreClient.Collection("campaigns").Doc(campaignID).Get(r.Context())
if err != nil {
    log.Printf("Error fetching updated campaign: %v", err)
    http.Error(w, "Failed to fetch updated campaign", http.StatusInternalServerError)
    return
}
```

### Priority 4: Performance (Fix Before Scale)

#### Fix 8: Optimize User Stats Query
**File:** `server/user/stats.go:102-129`
```go
// Use batch query instead of N+1
campaignIDs := make([]string, 0, len(campaignsSnapshot))
for _, doc := range campaignsSnapshot {
    var campaign models.Campaign
    if err := doc.DataTo(&campaign); err != nil {
        continue
    }
    campaignIDs = append(campaignIDs, campaign.ID)
}

// Batch query donations (Firestore IN supports up to 10 items)
// Split into chunks of 10
donorsMap := make(map[string]bool)
for i := 0; i < len(campaignIDs); i += 10 {
    end := i + 10
    if end > len(campaignIDs) {
        end = len(campaignIDs)
    }
    chunk := campaignIDs[i:end]
    
    donationsQuery := firestoreClient.Collection("donations").
        Where("campaign_id", "in", chunk).
        Where("status", "==", "completed")
    donations, _ := donationsQuery.Documents(ctx).GetAll()
    
    for _, donationDoc := range donations {
        var donation models.Donation
        if err := donationDoc.DataTo(&donation); err != nil {
            continue
        }
        if donation.DonorID != "" {
            donorsMap[donation.DonorID] = true
        }
    }
}
```

#### Fix 9: Add Request Timeout
**File:** `server/internal/server/server.go`
```go
func NewServer() *http.Server {
    // ... existing code ...
    
    server := &http.Server{
        Addr:         fmt.Sprintf(":%d", NewServer.port),
        Handler:      timeoutMiddleware(NewServer.RegisterRoutes()),
        // ... rest of config ...
    }
    
    return server
}

func timeoutMiddleware(next http.Handler) http.Handler {
    return http.TimeoutHandler(next, 30*time.Second, "Request timeout")
}
```

---

## Testing Checklist

After applying fixes, test:

- [ ] View count increments correctly under concurrent load
- [ ] Donation creation and campaign update are atomic
- [ ] Withdrawal balance accounts for pending withdrawals
- [ ] Rate limiting prevents abuse
- [ ] Input validation rejects malicious input
- [ ] Error messages don't leak internal details
- [ ] User stats query completes in < 2 seconds for users with 100 campaigns
- [ ] All endpoints handle timeouts gracefully
- [ ] No memory leaks under sustained load

---

## Estimated Fix Time

- **Critical Fixes (1-7):** 8-12 hours
- **Performance Fixes (8-9):** 4-6 hours
- **Testing:** 4-6 hours
- **Total:** 16-24 hours

---

## Next Steps

1. Review and approve this action plan
2. Create feature branch: `fix/critical-qa-issues`
3. Apply fixes in priority order
4. Write unit tests for each fix
5. Load test after fixes
6. Code review
7. Merge to main

