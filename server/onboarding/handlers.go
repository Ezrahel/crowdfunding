package onboarding

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"server/database"
	"server/jobs"
	"server/models"
	"server/paystack"
	"server/utils"
)

var (
	onboardingDB     *sql.DB
	paystackClient   *paystack.Client
	onboardingSelect = `
SELECT id, user_id, status, national_id_number, bvn, tin, virtual_account_id,
       virtual_account_number, virtual_account_name, virtual_account_bank,
       paystack_customer_code, created_at, updated_at, completed_at
FROM onboarding`
)

func InitOnboarding(db *sql.DB) {
	onboardingDB = db
	paystackClient = paystack.NewClient()
}

func GetUserUID(r *http.Request) (string, error) {
	uidVal := r.Context().Value("auth_uid")
	uid, ok := uidVal.(string)
	if !ok || uid == "" {
		return "", fmt.Errorf("user ID not found in context")
	}
	return uid, nil
}

func GetOnboardingStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if onboardingDB == nil {
		var err error
		onboardingDB, err = database.GetDB()
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

	onboarding, err := database.ScanOnboarding(func(dest ...any) error {
		return onboardingDB.QueryRowContext(r.Context(), onboardingSelect+" WHERE user_id = $1", userID).Scan(dest...)
	})
	if err == sql.ErrNoRows {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":              models.OnboardingStatusPending,
			"has_virtual_account": false,
		})
		return
	}
	if err != nil {
		log.Printf("Error fetching onboarding: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

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
	if onboarding.Status == models.OnboardingStatusCompleted {
		response["national_id_number"] = maskString(onboarding.NationalIDNumber)
		response["bvn"] = maskString(onboarding.BVN)
		response["tin"] = maskString(onboarding.TIN)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}

func SubmitOnboarding(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if onboardingDB == nil {
		var err error
		onboardingDB, err = database.GetDB()
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

	var req models.OnboardingRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	req.NationalIDNumber = strings.TrimSpace(req.NationalIDNumber)
	req.BVN = strings.TrimSpace(req.BVN)
	req.TIN = strings.TrimSpace(req.TIN)
	if req.NationalIDNumber == "" || len(req.NationalIDNumber) != 11 || !isNumeric(req.NationalIDNumber) {
		utils.WriteValidationError(w, "National ID Number must be 11 digits")
		return
	}
	if req.BVN == "" || len(req.BVN) != 11 || !isNumeric(req.BVN) {
		utils.WriteValidationError(w, "BVN must be 11 digits")
		return
	}
	if req.TIN == "" || len(req.TIN) < 9 || len(req.TIN) > 12 || !isNumeric(req.TIN) {
		utils.WriteValidationError(w, "TIN must be between 9 and 12 digits")
		return
	}

	profile, err := database.ScanUserProfile(func(dest ...any) error {
		return onboardingDB.QueryRowContext(r.Context(), `
SELECT uid, COALESCE(email, ''), display_name, first_name, last_name, photo_url, bio, location, phone, website,
       email_verified, auth_providers, last_login_at, last_login_provider, created_at, updated_at
FROM users
WHERE uid = $1`, userID).Scan(dest...)
	})
	if err != nil {
		log.Printf("Error fetching user profile: %v", err)
		utils.WriteInternalError(w, fmt.Errorf("user profile not found"))
		return
	}
	if profile.Email == "" {
		utils.WriteValidationError(w, "User email is required")
		return
	}

	existing, err := database.ScanOnboarding(func(dest ...any) error {
		return onboardingDB.QueryRowContext(r.Context(), onboardingSelect+" WHERE user_id = $1", userID).Scan(dest...)
	})
	if err == nil && existing.Status == models.OnboardingStatusCompleted {
		utils.WriteBadRequest(w, "Onboarding already completed")
		return
	}
	if err != nil && err != sql.ErrNoRows {
		utils.WriteInternalError(w, err)
		return
	}

	paystackReq := paystack.VirtualAccountRequest{
		Email:     profile.Email,
		FirstName: profile.FirstName,
		LastName:  profile.LastName,
		Phone:     profile.Phone,
	}
	paystackResp, err := paystackClient.CreateVirtualAccount(paystackReq)
	if err != nil {
		log.Printf("Error creating Paystack virtual account: %v", err)
		utils.WriteInternalError(w, fmt.Errorf("failed to create virtual account: %w", err))
		return
	}

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
	if err == nil {
		onboarding.CreatedAt = existing.CreatedAt
	}

	upsert := `
INSERT INTO onboarding (
    id, user_id, status, national_id_number, bvn, tin, virtual_account_id,
    virtual_account_number, virtual_account_name, virtual_account_bank, paystack_customer_code,
    created_at, updated_at, completed_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7,
    $8, $9, $10, $11,
    $12, $13, $14
)
ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    status = EXCLUDED.status,
    national_id_number = EXCLUDED.national_id_number,
    bvn = EXCLUDED.bvn,
    tin = EXCLUDED.tin,
    virtual_account_id = EXCLUDED.virtual_account_id,
    virtual_account_number = EXCLUDED.virtual_account_number,
    virtual_account_name = EXCLUDED.virtual_account_name,
    virtual_account_bank = EXCLUDED.virtual_account_bank,
    paystack_customer_code = EXCLUDED.paystack_customer_code,
    updated_at = EXCLUDED.updated_at,
    completed_at = EXCLUDED.completed_at`

	if _, err := onboardingDB.ExecContext(r.Context(), upsert,
		onboarding.ID,
		onboarding.UserID,
		onboarding.Status,
		onboarding.NationalIDNumber,
		onboarding.BVN,
		onboarding.TIN,
		onboarding.VirtualAccountID,
		onboarding.VirtualAccountNumber,
		onboarding.VirtualAccountName,
		onboarding.VirtualAccountBank,
		onboarding.PaystackCustomerCode,
		onboarding.CreatedAt,
		onboarding.UpdatedAt,
		onboarding.CompletedAt,
	); err != nil {
		log.Printf("Error saving onboarding: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "unknown"
	}
	if err := jobs.EnqueueFinancialAudit(r.Context(), jobs.FinancialAuditPayload{
		Operation: "ONBOARDING_COMPLETED",
		UserID:    userID,
		EntityID:  userID,
		RequestID: requestID,
		Amount:    0,
		Currency:  "NGN",
		Metadata: map[string]interface{}{
			"virtual_account_id":     onboarding.VirtualAccountID,
			"paystack_customer_code": onboarding.PaystackCustomerCode,
		},
	}); err != nil {
		log.Printf("Error queueing onboarding audit job: %v", err)
	}

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

func SkipOnboarding(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if onboardingDB == nil {
		var err error
		onboardingDB, err = database.GetDB()
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

	existing, err := database.ScanOnboarding(func(dest ...any) error {
		return onboardingDB.QueryRowContext(r.Context(), onboardingSelect+" WHERE user_id = $1", userID).Scan(dest...)
	})
	if err == nil && existing.Status == models.OnboardingStatusCompleted {
		utils.WriteBadRequest(w, "Cannot skip completed onboarding")
		return
	}
	if err != nil && err != sql.ErrNoRows {
		utils.WriteInternalError(w, err)
		return
	}

	now := time.Now()
	createdAt := now
	if err == nil {
		createdAt = existing.CreatedAt
	}

	if _, err := onboardingDB.ExecContext(r.Context(), `
INSERT INTO onboarding (id, user_id, status, created_at, updated_at)
VALUES ($1, $2, $3, $4, $5)
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at`,
		userID, userID, models.OnboardingStatusSkipped, createdAt, now,
	); err != nil {
		log.Printf("Error saving skipped onboarding: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Onboarding skipped",
		"status":  models.OnboardingStatusSkipped,
	})
}

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
