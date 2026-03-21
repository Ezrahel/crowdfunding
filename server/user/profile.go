package user

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"server/database"
	"server/models"
	"server/utils"

	"github.com/lib/pq"
)

var profileDB *sql.DB

func InitProfileHandlers(db *sql.DB) {
	profileDB = db
}

func GetUserUID(r *http.Request) (string, error) {
	uidVal := r.Context().Value("auth_uid")
	userID, ok := uidVal.(string)
	if !ok || userID == "" {
		return "", fmt.Errorf("failed to get user uid")
	}
	return userID, nil
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if profileDB == nil {
		var err error
		profileDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	userID, err := GetUserUID(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	query := `
SELECT uid, COALESCE(email, ''), display_name, first_name, last_name, photo_url, bio, location, phone, website,
       email_verified, auth_providers, last_login_at, last_login_provider, created_at, updated_at
FROM users
WHERE uid = $1`

	profile, err := database.ScanUserProfile(func(dest ...any) error {
		return profileDB.QueryRowContext(r.Context(), query, userID).Scan(dest...)
	})
	if err == sql.ErrNoRows {
		profile = models.UserProfile{UID: userID, CreatedAt: time.Now(), UpdatedAt: time.Now()}
	} else if err != nil {
		log.Printf("Error fetching profile: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(profile)
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if profileDB == nil {
		var err error
		profileDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	userID, err := GetUserUID(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	var updates models.UserProfile
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	updates.DisplayName = utils.SanitizeString(updates.DisplayName, 200)
	updates.FirstName = utils.SanitizeString(updates.FirstName, 100)
	updates.LastName = utils.SanitizeString(updates.LastName, 100)
	updates.Bio = utils.SanitizeString(updates.Bio, 2000)
	updates.Location = utils.SanitizeString(updates.Location, 200)
	updates.Phone = utils.SanitizeString(updates.Phone, 20)
	updates.Website = utils.SanitizeString(updates.Website, 500)
	updates.PhotoURL = utils.SanitizeString(updates.PhotoURL, 500)
	updates.Email = utils.SanitizeString(updates.Email, 320)

	if updates.Email != "" && !utils.ValidateEmail(updates.Email) {
		utils.WriteValidationError(w, "Invalid email address")
		return
	}
	if updates.DisplayName != "" {
		if err := utils.ValidateStringLength(updates.DisplayName, 1, 200); err != nil {
			utils.WriteValidationError(w, "Display name "+err.Error())
			return
		}
	}
	if updates.Bio != "" {
		if err := utils.ValidateStringLength(updates.Bio, 0, 2000); err != nil {
			utils.WriteValidationError(w, "Bio "+err.Error())
			return
		}
	}

	selectQuery := `
SELECT uid, COALESCE(email, ''), display_name, first_name, last_name, photo_url, bio, location, phone, website,
       email_verified, auth_providers, last_login_at, last_login_provider, created_at, updated_at
FROM users
WHERE uid = $1`

	existing, err := database.ScanUserProfile(func(dest ...any) error {
		return profileDB.QueryRowContext(r.Context(), selectQuery, userID).Scan(dest...)
	})
	if err != nil && err != sql.ErrNoRows {
		log.Printf("Error loading profile for update: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	now := time.Now()
	profile := existing
	if err == sql.ErrNoRows {
		profile = models.UserProfile{UID: userID, CreatedAt: now, UpdatedAt: now}
	}

	profile.UID = userID
	if updates.Email != "" {
		profile.Email = updates.Email
	}
	if updates.DisplayName != "" {
		profile.DisplayName = updates.DisplayName
	}
	if updates.FirstName != "" {
		profile.FirstName = updates.FirstName
	}
	if updates.LastName != "" {
		profile.LastName = updates.LastName
	}
	if updates.PhotoURL != "" {
		profile.PhotoURL = updates.PhotoURL
	}
	if updates.Bio != "" || existing.Bio == "" {
		profile.Bio = updates.Bio
	}
	if updates.Location != "" || existing.Location == "" {
		profile.Location = updates.Location
	}
	if updates.Phone != "" || existing.Phone == "" {
		profile.Phone = updates.Phone
	}
	if updates.Website != "" || existing.Website == "" {
		profile.Website = updates.Website
	}
	if len(profile.AuthProviders) == 0 {
		profile.AuthProviders = []string{"email"}
	}
	if profile.LastLoginAt.IsZero() {
		profile.LastLoginAt = now
	}
	if profile.LastLoginProvider == "" && len(profile.AuthProviders) > 0 {
		profile.LastLoginProvider = profile.AuthProviders[len(profile.AuthProviders)-1]
	}
	profile.UpdatedAt = now

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

	_, err = profileDB.ExecContext(r.Context(), upsert,
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
		profile.CreatedAt,
		profile.UpdatedAt,
	)
	if err != nil {
		log.Printf("Error updating profile: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Profile updated successfully",
		"profile": profile,
	})
}
