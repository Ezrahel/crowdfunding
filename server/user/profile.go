package user

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"server/models"
	"server/utils"

	"cloud.google.com/go/firestore"
)

var profileFirestoreClient *firestore.Client

// InitProfileHandlers initializes profile handlers with Firestore client
func InitProfileHandlers(client *firestore.Client) {
	profileFirestoreClient = client
}

// GetUserUID extracts user ID from request context
func GetUserUID(r *http.Request) (string, error) {
	uidVal := r.Context().Value("auth_uid")
	userID, ok := uidVal.(string)
	if !ok || userID == "" {
		return "", fmt.Errorf("failed to get user uid")
	}
	return userID, nil
}

// GetProfile retrieves user profile
func GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if profileFirestoreClient == nil {
		http.Error(w, "Firestore client not initialized", http.StatusInternalServerError)
		return
	}

	userID, err := GetUserUID(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Try to get profile from Firestore
	doc, err := profileFirestoreClient.Collection("users").Doc(userID).Get(r.Context())
	if err != nil {
		// Profile doesn't exist yet, return empty profile
		profile := models.UserProfile{
			UID:       userID,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(profile)
		return
	}

	var profile models.UserProfile
	if err := doc.DataTo(&profile); err != nil {
		log.Printf("Error parsing profile: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(profile)
}

// UpdateProfile updates user profile
func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if profileFirestoreClient == nil {
		http.Error(w, "Firestore client not initialized", http.StatusInternalServerError)
		return
	}

	userID, err := GetUserUID(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var updates models.UserProfile
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Sanitize and validate inputs
	updates.DisplayName = utils.SanitizeString(updates.DisplayName, 200)
	updates.FirstName = utils.SanitizeString(updates.FirstName, 100)
	updates.LastName = utils.SanitizeString(updates.LastName, 100)
	updates.Bio = utils.SanitizeString(updates.Bio, 2000)
	updates.Location = utils.SanitizeString(updates.Location, 200)
	updates.Phone = utils.SanitizeString(updates.Phone, 20)
	updates.Website = utils.SanitizeString(updates.Website, 500)

	// Validate email if provided
	if updates.Email != "" && !utils.ValidateEmail(updates.Email) {
		utils.WriteValidationError(w, "Invalid email address")
		return
	}

	// Validate string lengths
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

	// Ensure UID matches
	updates.UID = userID
	updates.UpdatedAt = time.Now()

	// Get existing profile to preserve created_at
	doc, err := profileFirestoreClient.Collection("users").Doc(userID).Get(r.Context())
	if err != nil {
		// Profile doesn't exist, set created_at
		updates.CreatedAt = time.Now()
	} else {
		var existing models.UserProfile
		if err := doc.DataTo(&existing); err == nil {
			updates.CreatedAt = existing.CreatedAt
		} else {
			updates.CreatedAt = time.Now()
		}
	}

	// Get existing profile to merge with updates
	doc, err = profileFirestoreClient.Collection("users").Doc(userID).Get(r.Context())
	var existingProfile models.UserProfile
	if err == nil {
		// Profile exists, merge updates
		if err := doc.DataTo(&existingProfile); err == nil {
			// Preserve fields that weren't updated
			if updates.Email == "" {
				updates.Email = existingProfile.Email
			}
			if updates.DisplayName == "" {
				updates.DisplayName = existingProfile.DisplayName
			}
			if updates.PhotoURL == "" {
				updates.PhotoURL = existingProfile.PhotoURL
			}
			if len(updates.AuthProviders) == 0 {
				updates.AuthProviders = existingProfile.AuthProviders
			}
			updates.CreatedAt = existingProfile.CreatedAt
		}
	}

	// Update in Firestore
	_, err = profileFirestoreClient.Collection("users").Doc(userID).Set(r.Context(), updates)
	if err != nil {
		log.Printf("Error updating profile: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Profile updated successfully",
		"profile": updates,
	})
}
