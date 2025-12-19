# Firestore Client in Auth Package - Explanation & Solution

## 🔍 Problem Explanation

### Current Situation

In `server/auth/user.go` at lines 355-356, there's a comment:
```go
// Note: We need Firestore client here, but it's not available in auth package
// For now, we'll just log. In production, you'd want to update the user profile
```

### Why This Is a Problem

The `SocialUserHandler` function needs to:
1. ✅ Verify the Firebase Auth token (works - has `authClient`)
2. ✅ Validate the request (works)
3. ❌ **Create/update user profile in Firestore** (doesn't work - no Firestore client)

Currently, it only logs the event but doesn't actually save the user profile data to Firestore. This means:
- User profiles aren't being created/updated when users sign in with social providers
- The `AuthProviders` array isn't being tracked
- `LastLoginAt` and `LastLoginProvider` aren't being updated
- Profile data from social providers (display name, photo URL) isn't being saved

### Architecture Pattern in This Codebase

Looking at other packages, they follow this pattern:

**Example from `server/user/profile.go`:**
```go
var profileFirestoreClient *firestore.Client

// InitProfileHandlers initializes profile handlers with Firestore client
func InitProfileHandlers(client *firestore.Client) {
    profileFirestoreClient = client
}
```

**Example from `server/campaign/handlers.go`:**
```go
var firestoreClient *firestore.Client

// InitCampaignHandlers initializes campaign handlers with Firestore client
func InitCampaignHandlers(client *firestore.Client) {
    firestoreClient = client
}
```

**Then in `server/internal/server/routes.go`:**
```go
func InitRoutes(client *firestore.Client) {
    // Initialize handlers with Firestore client
    campaign.InitCampaignHandlers(client)
    donation.InitDonationHandlers(client)
    user.InitProfileHandlers(client)
    // ... etc
}
```

## ✅ Solution

We need to follow the same pattern for the `auth` package:

1. **Add Firestore client variable** to `server/auth/user.go`
2. **Add initialization function** to receive the Firestore client
3. **Call initialization** from `server/internal/server/routes.go`
4. **Use Firestore client** in `SocialUserHandler` to create/update profiles

## 📝 Implementation

### Step 1: Add Firestore Client to Auth Package

Add to `server/auth/user.go`:
```go
var (
    authClient *auth.Client
    authFirestoreClient *firestore.Client  // NEW
)

// InitAuthHandlers initializes auth handlers with Firestore client
func InitAuthHandlers(client *firestore.Client) {
    authFirestoreClient = client
}
```

### Step 2: Update SocialUserHandler

Replace the logging-only code with actual Firestore operations:
```go
// Get or create user profile in Firestore
if authFirestoreClient != nil {
    // Check if profile exists
    doc, err := authFirestoreClient.Collection("users").Doc(req.UID).Get(r.Context())
    
    var profile models.UserProfile
    if err != nil {
        // Profile doesn't exist, create new one
        profile = models.UserProfile{
            UID:              req.UID,
            Email:            req.Email,
            DisplayName:      req.DisplayName,
            PhotoURL:         req.PhotoURL,
            EmailVerified:    true, // Social providers are pre-verified
            AuthProviders:    []string{req.Provider},
            LastLoginAt:      time.Now(),
            LastLoginProvider: req.Provider,
            CreatedAt:        time.Now(),
            UpdatedAt:        time.Now(),
        }
    } else {
        // Profile exists, update it
        doc.DataTo(&profile)
        profile.UpdatedAt = time.Now()
        profile.LastLoginAt = time.Now()
        profile.LastLoginProvider = req.Provider
        
        // Add provider if not already in list
        providerExists := false
        for _, p := range profile.AuthProviders {
            if p == req.Provider {
                providerExists = true
                break
            }
        }
        if !providerExists {
            profile.AuthProviders = append(profile.AuthProviders, req.Provider)
        }
        
        // Update fields if provided and not empty
        if req.DisplayName != "" {
            profile.DisplayName = req.DisplayName
        }
        if req.PhotoURL != "" {
            profile.PhotoURL = req.PhotoURL
        }
        if req.Email != "" {
            profile.Email = req.Email
        }
    }
    
    // Save to Firestore
    _, err = authFirestoreClient.Collection("users").Doc(req.UID).Set(r.Context(), profile)
    if err != nil {
        log.Printf("Error saving user profile: %v", err)
        // Don't fail the request - user is still authenticated
    }
}
```

### Step 3: Update Routes Initialization

In `server/internal/server/routes.go`, add:
```go
func InitRoutes(client *firestore.Client) {
    firestoreClient = client
    
    // Initialize handlers with Firestore client
    auth.InitAuthHandlers(client)  // NEW
    campaign.InitCampaignHandlers(client)
    // ... rest
}
```

## 🎯 Benefits

After implementing this:

1. ✅ **User profiles are created** when users sign in with social providers
2. ✅ **Profile data is updated** (display name, photo URL, email)
3. ✅ **Auth providers are tracked** in the `AuthProviders` array
4. ✅ **Login history is tracked** (`LastLoginAt`, `LastLoginProvider`)
5. ✅ **Consistent architecture** with other packages
6. ✅ **Better data integrity** - all user data in one place

## 🔒 Safety Considerations

- **Error handling**: If Firestore save fails, don't fail the authentication (user is still logged in)
- **Validation**: Only update fields that are provided and valid
- **Idempotency**: Multiple calls with same data won't cause issues
- **Atomic operations**: Use Firestore transactions if needed for critical updates

## 📊 Current vs. After Fix

### Current (Logging Only):
```
User signs in with Google
  → Token verified ✅
  → Request validated ✅
  → Logged to console ✅
  → Profile NOT saved ❌
```

### After Fix (Full Implementation):
```
User signs in with Google
  → Token verified ✅
  → Request validated ✅
  → Profile created/updated in Firestore ✅
  → AuthProviders tracked ✅
  → LastLoginAt updated ✅
  → Response sent ✅
```

---

**This fix ensures that social login users have complete profiles in Firestore, enabling all features that depend on user profile data.**

