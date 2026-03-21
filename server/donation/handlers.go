package donation

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

const donationSelect = `
SELECT id, campaign_id, donor_id, donor_name, donor_email, amount, platform_fee, processing_fee,
       net_amount, fee, tip, total_paid, is_anonymous, message, payment_method,
       COALESCE(transaction_id, ''), status, created_at
FROM donations`

var donationDB *sql.DB

func InitDonationHandlers(db *sql.DB) {
	donationDB = db
}

func GetDonorUID(r *http.Request) (string, error) {
	uidVal := r.Context().Value(AuthIDKey)
	if uidVal == nil {
		return "", nil
	}
	donorID, ok := uidVal.(string)
	if !ok {
		return "", nil
	}
	return donorID, nil
}

func CreateDonation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if donationDB == nil {
		var err error
		donationDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	var req struct {
		CampaignID    string  `json:"campaign_id"`
		DonorName     string  `json:"donor_name"`
		DonorEmail    string  `json:"donor_email"`
		Amount        float64 `json:"amount"`
		Tip           float64 `json:"tip"`
		IsAnonymous   bool    `json:"is_anonymous"`
		Message       string  `json:"message"`
		PaymentMethod string  `json:"payment_method"`
		TransactionID string  `json:"transaction_id"`
		CoverFees     bool    `json:"cover_fees"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	if req.CampaignID == "" || !utils.ValidateFirestoreID(req.CampaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}
	if err := utils.ValidateAmount(req.Amount, 0.01, 10000000); err != nil {
		utils.WriteValidationError(w, "Amount: "+err.Error())
		return
	}
	if req.DonorEmail == "" || !utils.ValidateEmail(req.DonorEmail) {
		utils.WriteValidationError(w, "Invalid donor email address")
		return
	}

	donorID, _ := GetDonorUID(r)
	req.DonorName = utils.SanitizeString(req.DonorName, 200)
	req.Message = utils.SanitizeString(req.Message, 1000)
	req.PaymentMethod = utils.SanitizeString(req.PaymentMethod, 50)
	req.TransactionID = utils.SanitizeString(req.TransactionID, 200)

	campaign, err := database.ScanCampaign(func(dest ...any) error {
		return donationDB.QueryRowContext(r.Context(), `
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
	if campaign.Status != "Active" {
		utils.WriteBadRequest(w, "Donations can only be made to active campaigns")
		return
	}

	if req.TransactionID != "" {
		var exists int
		if err := donationDB.QueryRowContext(r.Context(), `
SELECT COUNT(*) FROM donations WHERE transaction_id = $1 AND status = 'completed'`, req.TransactionID).Scan(&exists); err == nil && exists > 0 {
			utils.WriteBadRequest(w, "Transaction ID already exists")
			return
		}
	}

	platformFee := req.Amount * 0.05
	processingFee := 0.0
	if req.CoverFees {
		processingFee = req.Amount*0.029 + 0.30
	}
	netAmount := req.Amount - platformFee
	totalPaid := req.Amount + processingFee + req.Tip
	fee := platformFee + processingFee

	isNewDonor := false
	if !req.IsAnonymous {
		var existingCount int
		if donorID != "" {
			err = donationDB.QueryRowContext(r.Context(), `
SELECT COUNT(*) FROM donations
WHERE campaign_id = $1 AND donor_id = $2 AND status = 'completed'`, req.CampaignID, donorID).Scan(&existingCount)
		} else {
			err = donationDB.QueryRowContext(r.Context(), `
SELECT COUNT(*) FROM donations
WHERE campaign_id = $1 AND donor_email = $2 AND status = 'completed'`, req.CampaignID, req.DonorEmail).Scan(&existingCount)
		}
		if err == nil {
			isNewDonor = existingCount == 0
		}
	}

	donation := models.Donation{
		ID:            uuid.NewString(),
		CampaignID:    req.CampaignID,
		DonorID:       donorID,
		DonorName:     req.DonorName,
		DonorEmail:    req.DonorEmail,
		Amount:        req.Amount,
		PlatformFee:   platformFee,
		ProcessingFee: processingFee,
		NetAmount:     netAmount,
		Fee:           fee,
		Tip:           req.Tip,
		TotalPaid:     totalPaid,
		IsAnonymous:   req.IsAnonymous,
		Message:       req.Message,
		PaymentMethod: req.PaymentMethod,
		TransactionID: req.TransactionID,
		Status:        "completed",
		CreatedAt:     time.Now(),
	}

	tx, err := donationDB.BeginTx(r.Context(), nil)
	if err != nil {
		utils.WriteInternalError(w, err)
		return
	}
	defer tx.Rollback()

	insert := `
INSERT INTO donations (
    id, campaign_id, donor_id, donor_name, donor_email, amount, platform_fee, processing_fee,
    net_amount, fee, tip, total_paid, is_anonymous, message, payment_method, transaction_id,
    status, created_at
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8,
    $9, $10, $11, $12, $13, $14, $15, NULLIF($16, ''),
    $17, $18
)`
	if _, err := tx.ExecContext(r.Context(), insert,
		donation.ID,
		donation.CampaignID,
		donation.DonorID,
		donation.DonorName,
		donation.DonorEmail,
		donation.Amount,
		donation.PlatformFee,
		donation.ProcessingFee,
		donation.NetAmount,
		donation.Fee,
		donation.Tip,
		donation.TotalPaid,
		donation.IsAnonymous,
		donation.Message,
		donation.PaymentMethod,
		donation.TransactionID,
		donation.Status,
		donation.CreatedAt,
	); err != nil {
		log.Printf("Error creating donation: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	updateQuery := "UPDATE campaigns SET raised = raised + $2, updated_at = $3"
	args := []any{req.CampaignID, netAmount, time.Now()}
	if isNewDonor && !req.IsAnonymous {
		updateQuery += ", donors = donors + 1"
	}
	updateQuery += " WHERE id = $1"
	if _, err := tx.ExecContext(r.Context(), updateQuery, args...); err != nil {
		log.Printf("Error updating campaign donation totals: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	if err := tx.Commit(); err != nil {
		log.Printf("Transaction failed: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "unknown"
	}
	if err := jobs.EnqueueFinancialAudit(r.Context(), jobs.FinancialAuditPayload{
		Operation: "DONATION_CREATED",
		UserID:    donorID,
		EntityID:  req.CampaignID,
		RequestID: requestID,
		Amount:    req.Amount,
		Currency:  "USD",
		Metadata: map[string]interface{}{
			"donation_id":    donation.ID,
			"payment_method": donation.PaymentMethod,
		},
	}); err != nil {
		log.Printf("Error queueing donation audit job: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Donation created successfully",
		"donation": donation,
	})
}

func GetDonations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if donationDB == nil {
		var err error
		donationDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	campaignID := r.URL.Query().Get("campaign_id")
	donorID := r.URL.Query().Get("donor_id")
	status := r.URL.Query().Get("status")
	conditions := make([]string, 0)
	args := make([]any, 0)
	argPos := 1

	if campaignID != "" {
		if !utils.ValidateFirestoreID(campaignID) {
			utils.WriteBadRequest(w, "Invalid campaign ID format")
			return
		}
		conditions = append(conditions, fmt.Sprintf("campaign_id = $%d", argPos))
		args = append(args, campaignID)
		argPos++
	}
	if donorID != "" {
		if !utils.ValidateFirestoreID(donorID) {
			utils.WriteBadRequest(w, "Invalid donor ID format")
			return
		}
		conditions = append(conditions, fmt.Sprintf("donor_id = $%d", argPos))
		args = append(args, donorID)
		argPos++
	}
	if status != "" {
		if !utils.ValidateDonationStatus(status) {
			utils.WriteBadRequest(w, "Invalid donation status")
			return
		}
		conditions = append(conditions, fmt.Sprintf("status = $%d", argPos))
		args = append(args, status)
		argPos++
	}

	query := donationSelect
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += fmt.Sprintf(" ORDER BY created_at DESC LIMIT $%d", argPos)
	args = append(args, 100)

	rows, err := donationDB.QueryContext(r.Context(), query, args...)
	if err != nil {
		log.Printf("Error fetching donations: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	defer rows.Close()

	donations := make([]models.Donation, 0)
	for rows.Next() {
		donation, err := database.ScanDonation(rows.Scan)
		if err != nil {
			log.Printf("Error parsing donation: %v", err)
			continue
		}
		if donation.IsAnonymous {
			donation.DonorName = "Anonymous"
			donation.DonorEmail = ""
		}
		donations = append(donations, donation)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"donations": donations,
		"count":     len(donations),
	})
}

func GetDonation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if donationDB == nil {
		var err error
		donationDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	donationID := r.URL.Query().Get("id")
	if donationID == "" || !utils.ValidateFirestoreID(donationID) {
		utils.WriteBadRequest(w, "Invalid donation ID format")
		return
	}

	donation, err := database.ScanDonation(func(dest ...any) error {
		return donationDB.QueryRowContext(r.Context(), donationSelect+" WHERE id = $1", donationID).Scan(dest...)
	})
	if err == sql.ErrNoRows {
		utils.WriteNotFound(w, "Donation not found")
		return
	}
	if err != nil {
		log.Printf("Error fetching donation: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	requesterUID, _ := GetDonorUID(r)
	if !(donation.IsAnonymous && requesterUID == "") && donation.DonorID != requesterUID {
		var ownerID string
		if err := donationDB.QueryRowContext(r.Context(), "SELECT owner_id FROM campaigns WHERE id = $1", donation.CampaignID).Scan(&ownerID); err != nil || ownerID != requesterUID {
			utils.WriteForbidden(w, "Access denied")
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(donation)
}
