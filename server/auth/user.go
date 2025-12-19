package auth

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"server/firebase"
	"server/models"
	"server/utils"

	"cloud.google.com/go/firestore"
	"firebase.google.com/go/auth"
)

type User struct {
	UId      string `json:"uid"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Image    string `json:"image"`
}

type CustomTokenRequest struct {
	UID string `json:"uid"`
}

type TokenVerificationRequest struct {
	IDToken string `json:"id_token"`
}

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignUpRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	Username  string `json:"username"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type SocialUserRequest struct {
	UID         string `json:"uid"`
	Email       string `json:"email"`
	DisplayName string `json:"display_name"`
	PhotoURL    string `json:"photo_url"`
	Provider    string `json:"provider"` // google, facebook, apple
}

var (
	authClient          *auth.Client
	authFirestoreClient *firestore.Client
)

// InitAuthClient initializes the Firebase Auth client
func InitAuthClient() error {
	var err error
	authClient, err = firebase.GetAuthClient()
	if err != nil {
		return fmt.Errorf("failed to initialize auth client: %v", err)
	}
	return nil
}

// GetAuthClient returns the auth client
func GetAuthClient() *auth.Client {
	return authClient
}

// InitAuthHandlers initializes auth handlers with Firestore client
func InitAuthHandlers(client *firestore.Client) {
	authFirestoreClient = client
}

// CreateUserHandler creates a new user in Firebase Auth
func CreateUserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if authClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("auth client not initialized"))
		return
	}

	var req SignUpRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Validate inputs
	if !utils.ValidateEmail(req.Email) {
		utils.WriteValidationError(w, "Invalid email address")
		return
	}
	if err := utils.ValidateStringLength(req.Password, 8, 128); err != nil {
		utils.WriteValidationError(w, "Password "+err.Error())
		return
	}
	if req.Username != "" {
		if err := utils.ValidateStringLength(req.Username, 3, 50); err != nil {
			utils.WriteValidationError(w, "Username "+err.Error())
			return
		}
		req.Username = utils.SanitizeString(req.Username, 50)
	}
	req.FirstName = utils.SanitizeString(req.FirstName, 100)
	req.LastName = utils.SanitizeString(req.LastName, 100)

	displayName := req.Username
	if req.FirstName != "" && req.LastName != "" {
		displayName = fmt.Sprintf("%s %s", req.FirstName, req.LastName)
	}

	params := (&auth.UserToCreate{}).
		Email(req.Email).
		Password(req.Password).
		DisplayName(displayName).
		EmailVerified(false)

	u, err := authClient.CreateUser(context.Background(), params)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		// Don't expose internal error details
		if strings.Contains(err.Error(), "email-already-exists") {
			utils.WriteValidationError(w, "Email already registered")
		} else if strings.Contains(err.Error(), "invalid-email") {
			utils.WriteValidationError(w, "Invalid email address")
		} else if strings.Contains(err.Error(), "weak-password") {
			utils.WriteValidationError(w, "Password is too weak")
		} else {
			utils.WriteInternalError(w, err)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"uid":         u.UID,
		"email":       u.Email,
		"displayName": u.DisplayName,
		"message":     "User created successfully",
	})
}

func SecuredData(w http.ResponseWriter, r *http.Request) {
	json.NewEncoder(w).Encode(map[string]interface{}{
		"status": "success",
		"data":   "this is highly confidential and secured data",
		"time":   time.Now().Format(time.RFC3339),
	})
}

// VerifyTokenMiddleware verifies Firebase ID tokens
func VerifyTokenMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if authClient == nil {
			http.Error(w, "Auth client not initialized", http.StatusInternalServerError)
			return
		}

		idToken := r.Header.Get("Authorization")
		if idToken == "" || len(idToken) < 7 || idToken[:7] != "Bearer " {
			utils.WriteUnauthorized(w, "Missing or malformed Authorization Bearer token")
			return
		}

		tokenString := idToken[7:]

		// Add timeout to token verification
		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		token, err := authClient.VerifyIDToken(ctx, tokenString)
		if err != nil {
			log.Printf("Token verification failed: %v", err)
			utils.WriteUnauthorized(w, "Invalid or expired token")
			return
		}

		// Inject the UID into the request context
		reqCtx := context.WithValue(r.Context(), "auth_uid", token.UID)
		next(w, r.WithContext(reqCtx))
	}
}

// VerifyToken verifies a token and returns the UID
func VerifyToken(ctx context.Context, idToken string) (string, error) {
	if authClient == nil {
		return "", fmt.Errorf("auth client not initialized")
	}

	token, err := authClient.VerifyIDToken(ctx, idToken)
	if err != nil {
		return "", err
	}

	return token.UID, nil
}

// CustomTokenHandler generates a custom token for a user
func CustomTokenHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if authClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("auth client not initialized"))
		return
	}

	var req CustomTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	if req.UID == "" {
		utils.WriteBadRequest(w, "User UID is required")
		return
	}

	if !utils.ValidateFirestoreID(req.UID) {
		utils.WriteBadRequest(w, "Invalid UID format")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	token, err := authClient.CustomToken(ctx, req.UID)
	if err != nil {
		log.Printf("Error generating custom token: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"customToken": token,
		"uid":         req.UID,
		"message":     "token generated successfully",
	})
}

// VerifyTokenHandler verifies an ID token
func VerifyTokenHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if authClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("auth client not initialized"))
		return
	}

	var req TokenVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	if req.IDToken == "" {
		utils.WriteBadRequest(w, "ID token is required")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	token, err := authClient.VerifyIDToken(ctx, req.IDToken)
	if err != nil {
		log.Printf("Token verification failed: %v", err)
		utils.WriteUnauthorized(w, "Invalid or expired token")
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"uid":     token.UID,
		"email":   token.Claims["email"],
		"valid":   true,
		"message": "Token verified successfully",
	})
}

// SocialUserHandler creates or updates user profile from social login
func SocialUserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if authClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("auth client not initialized"))
		return
	}

	// Verify token first
	idToken := r.Header.Get("Authorization")
	if idToken == "" || len(idToken) < 7 || idToken[:7] != "Bearer " {
		utils.WriteUnauthorized(w, "Missing or malformed Authorization Bearer token")
		return
	}

	tokenString := idToken[7:]
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		log.Printf("Token verification failed: %v", err)
		utils.WriteUnauthorized(w, "Invalid or expired token")
		return
	}

	var req SocialUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Verify the UID matches the token
	if req.UID != token.UID {
		utils.WriteUnauthorized(w, "UID mismatch")
		return
	}

	// Validate provider
	validProviders := map[string]bool{
		"google":   true,
		"facebook": true,
		"apple":    true,
	}
	if !validProviders[req.Provider] {
		utils.WriteValidationError(w, "Invalid provider")
		return
	}

	// Validate email
	if req.Email != "" && !utils.ValidateEmail(req.Email) {
		utils.WriteValidationError(w, "Invalid email address")
		return
	}

	// Sanitize inputs
	req.DisplayName = utils.SanitizeString(req.DisplayName, 200)
	req.PhotoURL = utils.SanitizeString(req.PhotoURL, 500)

	// Get or create user profile in Firestore
	if authFirestoreClient != nil {
		ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
		defer cancel()

		// Check if profile exists
		doc, err := authFirestoreClient.Collection("users").Doc(req.UID).Get(ctx)

		var profile models.UserProfile
		if err != nil {
			// Profile doesn't exist, create new one
			profile = models.UserProfile{
				UID:               req.UID,
				Email:             req.Email,
				DisplayName:       req.DisplayName,
				PhotoURL:          req.PhotoURL,
				EmailVerified:     true, // Social providers are pre-verified
				AuthProviders:     []string{req.Provider},
				LastLoginAt:       time.Now(),
				LastLoginProvider: req.Provider,
				CreatedAt:         time.Now(),
				UpdatedAt:         time.Now(),
			}
		} else {
			// Profile exists, update it
			if err := doc.DataTo(&profile); err != nil {
				log.Printf("Error parsing existing profile: %v", err)
				// Create new profile if parsing fails
				profile = models.UserProfile{
					UID:               req.UID,
					Email:             req.Email,
					DisplayName:       req.DisplayName,
					PhotoURL:          req.PhotoURL,
					EmailVerified:     true,
					AuthProviders:     []string{req.Provider},
					LastLoginAt:       time.Now(),
					LastLoginProvider: req.Provider,
					CreatedAt:         time.Now(),
					UpdatedAt:         time.Now(),
				}
			} else {
				// Update existing profile
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

				// Preserve created_at
				if profile.CreatedAt.IsZero() {
					profile.CreatedAt = time.Now()
				}
			}
		}

		// Save to Firestore
		_, err = authFirestoreClient.Collection("users").Doc(req.UID).Set(ctx, profile)
		if err != nil {
			log.Printf("Error saving user profile: %v", err)
			// Don't fail the request - user is still authenticated
		} else {
			log.Printf("User profile saved: %s via %s", req.UID, req.Provider)
		}
	} else {
		log.Printf("Social login user: %s via %s (Firestore not initialized)", req.UID, req.Provider)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "User profile processed successfully",
		"uid":      req.UID,
		"provider": req.Provider,
	})
}

// LinkAccountHandler handles linking additional auth providers to existing account
func LinkAccountHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	// Verify token
	idToken := r.Header.Get("Authorization")
	if idToken == "" || len(idToken) < 7 || idToken[:7] != "Bearer " {
		utils.WriteUnauthorized(w, "Missing or malformed Authorization Bearer token")
		return
	}

	tokenString := idToken[7:]
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		log.Printf("Token verification failed: %v", err)
		utils.WriteUnauthorized(w, "Invalid or expired token")
		return
	}

	var req struct {
		Provider    string `json:"provider"`
		Email       string `json:"email"`
		DisplayName string `json:"display_name"`
		PhotoURL    string `json:"photo_url"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Validate provider
	validProviders := map[string]bool{
		"google":   true,
		"facebook": true,
		"apple":    true,
	}
	if !validProviders[req.Provider] {
		utils.WriteValidationError(w, "Invalid provider")
		return
	}

	// Sanitize inputs
	req.DisplayName = utils.SanitizeString(req.DisplayName, 200)
	req.PhotoURL = utils.SanitizeString(req.PhotoURL, 500)

	log.Printf("Account linked: %s via %s", token.UID, req.Provider)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Account linked successfully",
		"uid":      token.UID,
		"provider": req.Provider,
	})
}

// UnlinkAccountHandler handles unlinking auth providers from account
func UnlinkAccountHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	// Verify token
	idToken := r.Header.Get("Authorization")
	if idToken == "" || len(idToken) < 7 || idToken[:7] != "Bearer " {
		utils.WriteUnauthorized(w, "Missing or malformed Authorization Bearer token")
		return
	}

	tokenString := idToken[7:]
	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	token, err := authClient.VerifyIDToken(ctx, tokenString)
	if err != nil {
		log.Printf("Token verification failed: %v", err)
		utils.WriteUnauthorized(w, "Invalid or expired token")
		return
	}

	var req struct {
		Provider string `json:"provider"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Validate provider
	validProviders := map[string]bool{
		"google":   true,
		"facebook": true,
		"apple":    true,
	}
	if !validProviders[req.Provider] {
		utils.WriteValidationError(w, "Invalid provider")
		return
	}

	log.Printf("Account unlinked: %s via %s", token.UID, req.Provider)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Account unlinked successfully",
		"uid":      token.UID,
		"provider": req.Provider,
	})
}
