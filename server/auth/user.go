package auth

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"server/database"
	"server/firebase"
	"server/models"
	"server/utils"

	firebaseauth "firebase.google.com/go/auth"
	"github.com/lib/pq"
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
	Provider    string `json:"provider"`
}

var (
	authClient *firebaseauth.Client
	authDB     *sql.DB
)

func InitAuthClient() error {
	var err error
	authClient, err = firebase.GetAuthClient()
	if err != nil {
		return fmt.Errorf("failed to initialize auth client: %v", err)
	}
	return nil
}

func GetAuthClient() *firebaseauth.Client {
	return authClient
}

func InitAuthHandlers(db *sql.DB) {
	authDB = db
}

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

	req.Email = strings.TrimSpace(req.Email)
	req.Username = utils.SanitizeString(req.Username, 100)
	req.FirstName = utils.SanitizeString(req.FirstName, 100)
	req.LastName = utils.SanitizeString(req.LastName, 100)

	if !utils.ValidateEmail(req.Email) {
		utils.WriteValidationError(w, "Invalid email address")
		return
	}
	if err := utils.ValidateStringLength(req.Password, 8, 128); err != nil {
		utils.WriteValidationError(w, "Password "+err.Error())
		return
	}

	displayName := req.Username
	if displayName == "" {
		displayName = strings.TrimSpace(strings.Join([]string{req.FirstName, req.LastName}, " "))
	}

	params := (&firebaseauth.UserToCreate{}).
		Email(req.Email).
		Password(req.Password).
		DisplayName(displayName).
		EmailVerified(false)

	u, err := authClient.CreateUser(context.Background(), params)
	if err != nil {
		log.Printf("Error creating user: %v", err)
		switch {
		case strings.Contains(err.Error(), "email-already-exists"):
			utils.WriteValidationError(w, "Email already registered")
		case strings.Contains(err.Error(), "invalid-email"):
			utils.WriteValidationError(w, "Invalid email address")
		case strings.Contains(err.Error(), "weak-password"):
			utils.WriteValidationError(w, "Password is too weak")
		default:
			utils.WriteInternalError(w, err)
		}
		return
	}

	profile := models.UserProfile{
		UID:               u.UID,
		Email:             req.Email,
		DisplayName:       displayName,
		FirstName:         req.FirstName,
		LastName:          req.LastName,
		EmailVerified:     false,
		AuthProviders:     []string{"email"},
		LastLoginAt:       time.Now(),
		LastLoginProvider: "email",
	}
	if err := upsertUserProfile(r.Context(), profile); err != nil {
		log.Printf("Error saving signup profile: %v", err)
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

		ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
		defer cancel()

		token, err := authClient.VerifyIDToken(ctx, idToken[7:])
		if err != nil {
			log.Printf("Token verification failed: %v", err)
			utils.WriteUnauthorized(w, "Invalid or expired token")
			return
		}

		reqCtx := context.WithValue(r.Context(), "auth_uid", token.UID)
		next(w, r.WithContext(reqCtx))
	}
}

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
	if req.UID == "" || !utils.ValidateFirestoreID(req.UID) {
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

func SocialUserHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if authClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("auth client not initialized"))
		return
	}
	if authDB == nil {
		var err error
		authDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	idToken := r.Header.Get("Authorization")
	if idToken == "" || len(idToken) < 7 || idToken[:7] != "Bearer " {
		utils.WriteUnauthorized(w, "Missing or malformed Authorization Bearer token")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 5*time.Second)
	defer cancel()

	token, err := authClient.VerifyIDToken(ctx, idToken[7:])
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
	if req.UID != token.UID {
		utils.WriteUnauthorized(w, "UID mismatch")
		return
	}

	validProviders := map[string]bool{"google": true, "email": true}
	if !validProviders[req.Provider] {
		utils.WriteValidationError(w, "Invalid provider. Supported providers are email and google")
		return
	}
	if req.Email != "" && !utils.ValidateEmail(req.Email) {
		utils.WriteValidationError(w, "Invalid email address")
		return
	}

	req.DisplayName = utils.SanitizeString(req.DisplayName, 200)
	req.PhotoURL = utils.SanitizeString(req.PhotoURL, 500)

	email, _ := token.Claims["email"].(string)
	if req.Email == "" {
		req.Email = email
	}
	emailVerified, _ := token.Claims["email_verified"].(bool)

	profile := models.UserProfile{
		UID:               req.UID,
		Email:             req.Email,
		DisplayName:       req.DisplayName,
		PhotoURL:          req.PhotoURL,
		EmailVerified:     emailVerified,
		AuthProviders:     []string{req.Provider},
		LastLoginAt:       time.Now(),
		LastLoginProvider: req.Provider,
	}

	if err := upsertUserProfile(r.Context(), profile); err != nil {
		log.Printf("Error saving user profile: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "User profile processed successfully",
		"uid":      req.UID,
		"provider": req.Provider,
	})
}

func upsertUserProfile(ctx context.Context, profile models.UserProfile) error {
	if authDB == nil {
		var err error
		authDB, err = database.GetDB()
		if err != nil {
			return err
		}
	}

	ctx, cancel := context.WithTimeout(ctx, 10*time.Second)
	defer cancel()

	existingQuery := `
SELECT uid, COALESCE(email, ''), display_name, first_name, last_name, photo_url, bio, location, phone, website,
       email_verified, auth_providers, last_login_at, last_login_provider, created_at, updated_at
FROM users
WHERE uid = $1`

	existing, err := database.ScanUserProfile(func(dest ...any) error {
		return authDB.QueryRowContext(ctx, existingQuery, profile.UID).Scan(dest...)
	})
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	now := time.Now()
	createdAt := now
	if err == nil {
		createdAt = existing.CreatedAt
		if profile.Email == "" {
			profile.Email = existing.Email
		}
		if profile.DisplayName == "" {
			profile.DisplayName = existing.DisplayName
		}
		if profile.FirstName == "" {
			profile.FirstName = existing.FirstName
		}
		if profile.LastName == "" {
			profile.LastName = existing.LastName
		}
		if profile.PhotoURL == "" {
			profile.PhotoURL = existing.PhotoURL
		}
		if profile.Bio == "" {
			profile.Bio = existing.Bio
		}
		if profile.Location == "" {
			profile.Location = existing.Location
		}
		if profile.Phone == "" {
			profile.Phone = existing.Phone
		}
		if profile.Website == "" {
			profile.Website = existing.Website
		}
		profile.EmailVerified = profile.EmailVerified || existing.EmailVerified
		profile.AuthProviders = mergeProviders(existing.AuthProviders, profile.AuthProviders)
	} else {
		profile.AuthProviders = mergeProviders(nil, profile.AuthProviders)
	}

	if profile.LastLoginAt.IsZero() {
		profile.LastLoginAt = now
	}

	upsert := `
INSERT INTO users (
    uid, email, display_name, first_name, last_name, photo_url, bio, location, phone, website,
    email_verified, auth_providers, last_login_at, last_login_provider, created_at, updated_at
) VALUES (
    $1, NULLIF($2, ''), $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
)
ON CONFLICT (uid) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    photo_url = EXCLUDED.photo_url,
    bio = EXCLUDED.bio,
    location = EXCLUDED.location,
    phone = EXCLUDED.phone,
    website = EXCLUDED.website,
    email_verified = EXCLUDED.email_verified,
    auth_providers = EXCLUDED.auth_providers,
    last_login_at = EXCLUDED.last_login_at,
    last_login_provider = EXCLUDED.last_login_provider,
    updated_at = EXCLUDED.updated_at`

	_, err = authDB.ExecContext(ctx, upsert,
		profile.UID,
		profile.Email,
		profile.DisplayName,
		profile.FirstName,
		profile.LastName,
		profile.PhotoURL,
		profile.Bio,
		profile.Location,
		profile.Phone,
		profile.Website,
		profile.EmailVerified,
		pq.Array(profile.AuthProviders),
		profile.LastLoginAt,
		profile.LastLoginProvider,
		createdAt,
		now,
	)
	return err
}

func mergeProviders(existing, incoming []string) []string {
	seen := make(map[string]bool)
	merged := make([]string, 0, len(existing)+len(incoming))
	for _, provider := range append(existing, incoming...) {
		provider = strings.TrimSpace(provider)
		if provider == "" || seen[provider] {
			continue
		}
		seen[provider] = true
		merged = append(merged, provider)
	}
	return merged
}
