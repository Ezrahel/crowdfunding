package onboarding

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"server/models"
	"server/paystack"
	"server/utils"

	"cloud.google.com/go/firestore"
)

var (
	onboardingFirestoreClient *firestore.Client
	paystackClient            *paystack.Client
)

// InitOnboarding initializes the onboarding handlers with Firestore client
func InitOnboarding(client *firestore.Client) {
	onboardingFirestoreClient = client
	paystackClient = paystack.NewClient()
}

// GetUserUID extracts user ID from request context
func GetUserUID(r *http.Request) (string, error) {
	uidVal := r.Context().Value("auth_uid")
	uid, ok := uidVal.(string)
	if !ok || uid == "" {
		return "", fmt.Errorf("user ID not found in context")
	}
	return uid, nil
}

// GetOnboardingStatus retrieves the onboarding status for the current user
func GetOnboardingStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if onboardingFirestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	userID, err := GetUserUID(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	// Get onboarding document
	doc, err := onboardingFirestoreClient.Collection("onboarding").Doc(userID).Get(r.Context())
	if err != nil {
		// If document doesn't exist, return pending status
		if strings.Contains(err.Error(), "NotFound") {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]interface{}{
				"status":              models.OnboardingStatusPending,
				"has_virtual_account": false,
			})
			return
		}
		log.Printf("Error fetching onboarding: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	var onboarding models.Onboarding
	if err := doc.DataTo(&onboarding); err != nil {
		log.Printf("Error parsing onboarding: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	// Mask sensitive information
	response := map[string]interface{}{
		"status":              onboarding.Status,
		"has_virtual_account": onboarding.VirtualAccountID != "",
		"virtual_account": map[string]interface{}{
			"account_number": onboarding.VirtualAccountNumber,
			"account_name":   onboarding.VirtualAccountName,
			"bank":           onboarding.VirtualAccountBank,
		},
		"created_at":   onboarding.CreatedAt,
		"updated_at":   onboarding.UpdatedAt,
		"completed_at": onboarding.CompletedAt,
	}

	// Only show sensitive info if completed
	if onboarding.Status == models.OnboardingStatusCompleted {
		response["national_id_number"] = maskString(onboarding.NationalIDNumber)
		response["bvn"] = maskString(onboarding.BVN)
		response["tin"] = maskString(onboarding.TIN)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

// SubmitOnboarding handles onboarding submission and creates virtual account
func SubmitOnboarding(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if onboardingFirestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	userID, err := GetUserUID(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	var req models.OnboardingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Validate and sanitize inputs
	req.NationalIDNumber = strings.TrimSpace(req.NationalIDNumber)
	req.BVN = strings.TrimSpace(req.BVN)
	req.TIN = strings.TrimSpace(req.TIN)

	// Validate NIN (Nigerian National Identity Number - 11 digits)
	if req.NationalIDNumber == "" {
		utils.WriteValidationError(w, "National ID Number is required")
		return
	}
	if len(req.NationalIDNumber) != 11 {
		utils.WriteValidationError(w, "National ID Number must be 11 digits")
		return
	}
	if !isNumeric(req.NationalIDNumber) {
		utils.WriteValidationError(w, "National ID Number must contain only digits")
		return
	}

	// Validate BVN (Bank Verification Number - 11 digits)
	if req.BVN == "" {
		utils.WriteValidationError(w, "BVN is required")
		return
	}
	if len(req.BVN) != 11 {
		utils.WriteValidationError(w, "BVN must be 11 digits")
		return
	}
	if !isNumeric(req.BVN) {
		utils.WriteValidationError(w, "BVN must contain only digits")
		return
	}

	// Validate TIN (Tax Identification Number - 9-12 digits)
	if req.TIN == "" {
		utils.WriteValidationError(w, "TIN is required")
		return
	}
	if len(req.TIN) < 9 || len(req.TIN) > 12 {
		utils.WriteValidationError(w, "TIN must be between 9 and 12 digits")
		return
	}
	if !isNumeric(req.TIN) {
		utils.WriteValidationError(w, "TIN must contain only digits")
		return
	}

	// Get user profile to get email and name
	userDoc, err := onboardingFirestoreClient.Collection("users").Doc(userID).Get(r.Context())
	if err != nil {
		log.Printf("Error fetching user profile: %v", err)
		utils.WriteInternalError(w, fmt.Errorf("user profile not found"))
		return
	}

	var userProfile models.UserProfile
	if err := userDoc.DataTo(&userProfile); err != nil {
		log.Printf("Error parsing user profile: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	if userProfile.Email == "" {
		utils.WriteValidationError(w, "User email is required")
		return
	}

	// Check if onboarding already exists and is completed
	existingDoc, err := onboardingFirestoreClient.Collection("onboarding").Doc(userID).Get(r.Context())
	if err == nil {
		var existing models.Onboarding
		if err := existingDoc.DataTo(&existing); err == nil {
			if existing.Status == models.OnboardingStatusCompleted {
				utils.WriteBadRequest(w, "Onboarding already completed")
				return
			}
		}
	}

	// Create virtual account with Paystack
	paystackReq := paystack.VirtualAccountRequest{
		Email:     userProfile.Email,
		FirstName: userProfile.FirstName,
		LastName:  userProfile.LastName,
		Phone:     userProfile.Phone,
	}

	paystackResp, err := paystackClient.CreateVirtualAccount(paystackReq)
	if err != nil {
		log.Printf("Error creating Paystack virtual account: %v", err)
		utils.WriteInternalError(w, fmt.Errorf("failed to create virtual account: %w", err))
		return
	}

	// Create onboarding document
	now := time.Now()
	onboarding := models.Onboarding{
		ID:                   userID,
		UserID:               userID,
		Status:               models.OnboardingStatusCompleted,
		NationalIDNumber:     req.NationalIDNumber,
		BVN:                  req.BVN,
		TIN:                  req.TIN,
		VirtualAccountID:     fmt.Sprintf("%d", paystackResp.Data.Customer.ID),
		VirtualAccountNumber: paystackResp.Data.AccountNumber,
		VirtualAccountName:   paystackResp.Data.AccountName,
		VirtualAccountBank:   paystackResp.Data.Bank.Name,
		PaystackCustomerCode: paystackResp.Data.Customer.CustomerCode,
		CreatedAt:            now,
		UpdatedAt:            now,
		CompletedAt:          &now,
	}

	// Save to Firestore
	_, err = onboardingFirestoreClient.Collection("onboarding").Doc(userID).Set(r.Context(), onboarding)
	if err != nil {
		log.Printf("Error saving onboarding: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	// Log financial operation for audit
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "unknown"
	}
	utils.LogFinancialOperation("ONBOARDING_COMPLETED", userID, userID, requestID, 0, "NGN")

	// Return response (mask sensitive data)
	response := map[string]interface{}{
		"message": "Onboarding completed successfully",
		"status":  onboarding.Status,
		"virtual_account": map[string]interface{}{
			"account_number": onboarding.VirtualAccountNumber,
			"account_name":   onboarding.VirtualAccountName,
			"bank":           onboarding.VirtualAccountBank,
		},
		"completed_at": onboarding.CompletedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// SkipOnboarding marks onboarding as skipped
func SkipOnboarding(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if onboardingFirestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	userID, err := GetUserUID(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	// Check if already completed
	existingDoc, err := onboardingFirestoreClient.Collection("onboarding").Doc(userID).Get(r.Context())
	if err == nil {
		var existing models.Onboarding
		if err := existingDoc.DataTo(&existing); err == nil {
			if existing.Status == models.OnboardingStatusCompleted {
				utils.WriteBadRequest(w, "Cannot skip completed onboarding")
				return
			}
		}
	}

	// Create or update onboarding with skipped status
	now := time.Now()
	onboarding := models.Onboarding{
		ID:        userID,
		UserID:    userID,
		Status:    models.OnboardingStatusSkipped,
		CreatedAt: now,
		UpdatedAt: now,
	}

	_, err = onboardingFirestoreClient.Collection("onboarding").Doc(userID).Set(r.Context(), onboarding)
	if err != nil {
		log.Printf("Error saving skipped onboarding: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Onboarding skipped",
		"status":  onboarding.Status,
	})
}

// Helper functions
func isNumeric(s string) bool {
	for _, char := range s {
		if char < '0' || char > '9' {
			return false
		}
	}
	return true
}

func maskString(s string) string {
	if len(s) <= 4 {
		return "****"
	}
	return "****" + s[len(s)-4:]
}
