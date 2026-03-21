package withdrawal

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
	"server/utils"

	"github.com/google/uuid"
)

const AuthIDKey = "auth_uid"

const withdrawalSelect = `
SELECT id, user_id, campaign_id, amount, fee, net_amount, method, status, account_details, created_at, processed_at
FROM withdrawals`

var withdrawalDB *sql.DB

func InitWithdrawalHandlers(db *sql.DB) {
	withdrawalDB = db
}

func GetUserUID(r *http.Request) (string, error) {
	uidVal := r.Context().Value(AuthIDKey)
	userID, ok := uidVal.(string)
	if !ok || userID == "" {
		return "", fmt.Errorf("failed to get user uid")
	}
	return userID, nil
}

func CreateWithdrawal(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if withdrawalDB == nil {
		var err error
		withdrawalDB, err = database.GetDB()
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

	var req struct {
		CampaignID     string                 `json:"campaign_id"`
		Amount         float64                `json:"amount"`
		Method         string                 `json:"method"`
		AccountDetails map[string]interface{} `json:"account_details"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	if req.CampaignID == "" || !utils.ValidateFirestoreID(req.CampaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}
	if err := utils.ValidateAmount(req.Amount, 1.0, 10000000.0); err != nil {
		utils.WriteValidationError(w, "Amount: "+err.Error())
		return
	}
	if !utils.ValidateWithdrawalMethod(req.Method) {
		utils.WriteValidationError(w, "Invalid withdrawal method")
		return
	}

	campaign, err := database.ScanCampaign(func(dest ...any) error {
		return withdrawalDB.QueryRowContext(r.Context(), `
SELECT id, owner_id, title, description, story, category, goal, raised, currency, cover_image,
       additional_images, video_url, status, country, postcode, who_for, beneficiary_relation,
       duration, deadline, urgency, flexible_goal, tags, updates, donors, views, shares,
       completed, created_at, updated_at, organizer_name, organizer_email, organizer_phone,
       organizer_bio, location
FROM campaigns
WHERE id = $1`, req.CampaignID).Scan(dest...)
	})
	if err == sql.ErrNoRows {
		utils.WriteNotFound(w, "Campaign not found")
		return
	}
	if err != nil {
		log.Printf("Error fetching campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	if campaign.OwnerID != userID {
		utils.WriteForbidden(w, "You don't own this campaign")
		return
	}

	var totalPending float64
	if err := withdrawalDB.QueryRowContext(r.Context(), `
SELECT COALESCE(SUM(amount), 0) FROM withdrawals
WHERE campaign_id = $1 AND status IN ('pending', 'processing')`, req.CampaignID).Scan(&totalPending); err != nil {
		log.Printf("Error fetching pending withdrawals: %v", err)
	}

	availableBalance := campaign.Raised - totalPending
	if availableBalance <= 0 {
		utils.WriteValidationError(w, "No funds available for withdrawal")
		return
	}
	if req.Amount > availableBalance {
		utils.WriteValidationError(w, fmt.Sprintf("Insufficient funds. Available: %.2f, Requested: %.2f", availableBalance, req.Amount))
		return
	}

	fee := 0.0
	switch req.Method {
	case "paypal":
		fee = req.Amount * 0.025
	case "debit_card":
		fee = req.Amount * 0.03
	}
	netAmount := req.Amount - fee

	accountDetailsJSON, err := database.ToJSON(req.AccountDetails)
	if err != nil {
		utils.WriteInternalError(w, err)
		return
	}

	withdrawal := models.Withdrawal{
		ID:             uuid.NewString(),
		UserID:         userID,
		CampaignID:     req.CampaignID,
		Amount:         req.Amount,
		Fee:            fee,
		NetAmount:      netAmount,
		Method:         req.Method,
		Status:         "pending",
		AccountDetails: req.AccountDetails,
		CreatedAt:      time.Now(),
	}

	if _, err := withdrawalDB.ExecContext(r.Context(), `
INSERT INTO withdrawals (id, user_id, campaign_id, amount, fee, net_amount, method, status, account_details, created_at)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
		withdrawal.ID, withdrawal.UserID, withdrawal.CampaignID, withdrawal.Amount, withdrawal.Fee,
		withdrawal.NetAmount, withdrawal.Method, withdrawal.Status, string(accountDetailsJSON), withdrawal.CreatedAt,
	); err != nil {
		log.Printf("Error creating withdrawal: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "unknown"
	}
	if err := jobs.EnqueueFinancialAudit(r.Context(), jobs.FinancialAuditPayload{
		Operation: "WITHDRAWAL_CREATED",
		UserID:    userID,
		EntityID:  req.CampaignID,
		RequestID: requestID,
		Amount:    req.Amount,
		Currency:  "USD",
		Metadata: map[string]interface{}{
			"withdrawal_id": withdrawal.ID,
			"method":        withdrawal.Method,
		},
	}); err != nil {
		log.Printf("Error queueing withdrawal audit job: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Withdrawal request created successfully",
		"withdrawal": withdrawal,
	})
}

func GetWithdrawals(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if withdrawalDB == nil {
		var err error
		withdrawalDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	campaignID := r.URL.Query().Get("campaign_id")
	userID, _ := GetUserUID(r)
	conditions := make([]string, 0)
	args := make([]any, 0)
	argPos := 1

	if campaignID != "" {
		conditions = append(conditions, fmt.Sprintf("campaign_id = $%d", argPos))
		args = append(args, campaignID)
		argPos++
	}
	if userID != "" {
		conditions = append(conditions, fmt.Sprintf("user_id = $%d", argPos))
		args = append(args, userID)
		argPos++
	}

	query := withdrawalSelect
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argPos)
	args = append(args, 100)

	rows, err := withdrawalDB.QueryContext(r.Context(), query, args...)
	if err != nil {
		log.Printf("Error fetching withdrawals: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	defer rows.Close()

	withdrawals := make([]models.Withdrawal, 0)
	for rows.Next() {
		withdrawal, err := database.ScanWithdrawal(rows.Scan)
		if err != nil {
			log.Printf("Error parsing withdrawal: %v", err)
			continue
		}
		withdrawals = append(withdrawals, withdrawal)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"withdrawals": withdrawals,
		"count":       len(withdrawals),
	})
}
