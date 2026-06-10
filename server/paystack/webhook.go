package paystack

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"crypto/sha512"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"math"
	"net/http"
	"os"
	"server/models"
	"server/utils"
	"strings"
	"time"

	"server/database"
)

var webhookDB *sql.DB

func InitWebhook(db *sql.DB) {
	webhookDB = db
}

func WebhookHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if webhookDB == nil {
		var err error
		webhookDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	signature := r.Header.Get("x-paystack-signature")
	if signature == "" {
		utils.WriteUnauthorized(w, "Missing webhook signature")
		return
	}

	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading webhook body: %v", err)
		utils.WriteBadRequest(w, "Invalid request body")
		return
	}

	secretKey := os.Getenv("PAYSTACK_SECRET_KEY")
	if !verifySignature(body, signature, secretKey) {
		log.Printf("Invalid webhook signature")
		utils.WriteUnauthorized(w, "Invalid webhook signature")
		return
	}

	var event WebhookEvent
	if err := json.Unmarshal(body, &event); err != nil {
		log.Printf("Error parsing webhook event: %v", err)
		utils.WriteBadRequest(w, "Invalid event data")
		return
	}

	eventKey, reference := buildWebhookEventKey(&event, body)
	alreadyProcessed, err := reserveWebhookEvent(r.Context(), eventKey, event.Event, reference, signature, body)
	if err != nil {
		log.Printf("Error reserving webhook event: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	if alreadyProcessed {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "duplicate_ignored"})
		return
	}

	tx, err := webhookDB.BeginTx(r.Context(), nil)
	if err != nil {
		markWebhookEventFailed(r.Context(), eventKey, fmt.Sprintf("begin transaction: %v", err))
		utils.WriteInternalError(w, err)
		return
	}

	if err := processWebhookEventTx(r.Context(), tx, &event); err != nil {
		tx.Rollback()
		markWebhookEventFailed(r.Context(), eventKey, err.Error())
		log.Printf("Error processing webhook event: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	if err := tx.Commit(); err != nil {
		markWebhookEventFailed(r.Context(), eventKey, fmt.Sprintf("commit transaction: %v", err))
		log.Printf("Error committing webhook event: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	if err := markWebhookEventProcessed(r.Context(), eventKey); err != nil {
		log.Printf("Error marking webhook event processed: %v", err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

type WebhookEvent struct {
	Event string          `json:"event"`
	Data  json.RawMessage `json:"data"`
}

type VirtualAccountEvent struct {
	Customer struct {
		CustomerCode string `json:"customer_code"`
		Email        string `json:"email"`
	} `json:"customer"`
	AccountNumber string `json:"account_number"`
	AccountName   string `json:"account_name"`
	Bank          struct {
		Name string `json:"name"`
	} `json:"bank"`
	Active bool `json:"active"`
}

type ChargeSuccessEvent struct {
	Reference string `json:"reference"`
	Amount    int64  `json:"amount"`
	Currency  string `json:"currency"`
	Status    string `json:"status"`
	Channel   string `json:"channel"`
	PaidAt    string `json:"paid_at"`
	Customer  struct {
		Email string `json:"email"`
	} `json:"customer"`
	Metadata map[string]interface{} `json:"metadata"`
}

func processWebhookEventTx(ctx context.Context, tx *sql.Tx, event *WebhookEvent) error {
	switch event.Event {
	case "dedicatedaccount.assign", "dedicatedaccount.success", "dedicatedaccount.update":
		var accountEvent VirtualAccountEvent
		if err := json.Unmarshal(event.Data, &accountEvent); err != nil {
			return fmt.Errorf("failed to parse dedicated account event: %w", err)
		}
		return updateOnboardingWithVirtualAccountTx(ctx, tx, accountEvent.Customer.CustomerCode, accountEvent)
	case "charge.success":
		var chargeEvent ChargeSuccessEvent
		if err := json.Unmarshal(event.Data, &chargeEvent); err != nil {
			return fmt.Errorf("failed to parse charge success event: %w", err)
		}
		return reconcileChargeSuccessTx(ctx, tx, chargeEvent)
	default:
		log.Printf("Unhandled webhook event: %s", event.Event)
		return nil
	}
}

func reconcileChargeSuccessTx(ctx context.Context, tx *sql.Tx, chargeEvent ChargeSuccessEvent) error {
	if strings.ToLower(chargeEvent.Status) != "success" {
		return nil
	}
	if strings.TrimSpace(chargeEvent.Reference) == "" {
		return fmt.Errorf("charge.success missing reference")
	}

	donation, err := findDonationForCharge(ctx, tx, chargeEvent)
	if err == sql.ErrNoRows {
		return fmt.Errorf("no donation found for Paystack reference %s", chargeEvent.Reference)
	}
	if err != nil {
		return err
	}

	amountPaid := float64(chargeEvent.Amount) / 100.0
	if donation.TotalPaid > 0 && math.Abs(donation.TotalPaid-amountPaid) > 0.01 {
		return fmt.Errorf("amount mismatch for donation %s: expected %.2f got %.2f", donation.ID, donation.TotalPaid, amountPaid)
	}

	if donation.Status == "completed" {
		log.Printf("Donation %s already completed for reference %s", donation.ID, chargeEvent.Reference)
		return nil
	}

	isNewDonor, err := isFirstCompletedDonation(ctx, tx, donation)
	if err != nil {
		return err
	}

	paymentMethod := donation.PaymentMethod
	if paymentMethod == "" {
		paymentMethod = chargeEvent.Channel
	}

	if _, err := tx.ExecContext(ctx, `
UPDATE donations
SET status = 'completed',
    transaction_id = $2,
    payment_method = $3
WHERE id = $1`, donation.ID, chargeEvent.Reference, paymentMethod); err != nil {
		return fmt.Errorf("update donation status: %w", err)
	}

	updateQuery := "UPDATE campaigns SET raised = raised + $2, updated_at = $3"
	args := []any{donation.CampaignID, donation.NetAmount, time.Now().UTC()}
	if isNewDonor && !donation.IsAnonymous {
		updateQuery += ", donors = donors + 1"
	}
	updateQuery += " WHERE id = $1"
	if _, err := tx.ExecContext(ctx, updateQuery, args...); err != nil {
		return fmt.Errorf("update campaign totals after charge success: %w", err)
	}

	log.Printf("Reconciled Paystack charge.success for donation %s reference %s", donation.ID, chargeEvent.Reference)
	return nil
}

func findDonationForCharge(ctx context.Context, tx *sql.Tx, chargeEvent ChargeSuccessEvent) (models.Donation, error) {
	selectByReference := `
SELECT id, campaign_id, donor_id, donor_name, donor_email, amount, platform_fee, processing_fee,
       net_amount, fee, tip, total_paid, is_anonymous, message, payment_method,
       COALESCE(transaction_id, ''), status, created_at
FROM donations
WHERE transaction_id = $1
LIMIT 1`
	donation, err := database.ScanDonation(func(dest ...any) error {
		return tx.QueryRowContext(ctx, selectByReference, chargeEvent.Reference).Scan(dest...)
	})
	if err == nil {
		return donation, nil
	}
	if err != sql.ErrNoRows {
		return models.Donation{}, fmt.Errorf("query donation by reference: %w", err)
	}

	if donationID := metadataString(chargeEvent.Metadata, "donation_id"); donationID != "" {
		selectByID := `
SELECT id, campaign_id, donor_id, donor_name, donor_email, amount, platform_fee, processing_fee,
       net_amount, fee, tip, total_paid, is_anonymous, message, payment_method,
       COALESCE(transaction_id, ''), status, created_at
FROM donations
WHERE id = $1
LIMIT 1`
		return database.ScanDonation(func(dest ...any) error {
			return tx.QueryRowContext(ctx, selectByID, donationID).Scan(dest...)
		})
	}

	return models.Donation{}, sql.ErrNoRows
}

func isFirstCompletedDonation(ctx context.Context, tx *sql.Tx, donation models.Donation) (bool, error) {
	if donation.IsAnonymous {
		return false, nil
	}

	var existingCount int
	if donation.DonorID != "" {
		err := tx.QueryRowContext(ctx, `
SELECT COUNT(*) FROM donations
WHERE campaign_id = $1 AND donor_id = $2 AND status = 'completed' AND id <> $3`, donation.CampaignID, donation.DonorID, donation.ID).Scan(&existingCount)
		return existingCount == 0, err
	}

	err := tx.QueryRowContext(ctx, `
SELECT COUNT(*) FROM donations
WHERE campaign_id = $1 AND donor_email = $2 AND status = 'completed' AND id <> $3`, donation.CampaignID, donation.DonorEmail, donation.ID).Scan(&existingCount)
	return existingCount == 0, err
}

func updateOnboardingWithVirtualAccountTx(ctx context.Context, tx *sql.Tx, customerCode string, accountEvent VirtualAccountEvent) error {
	onboarding, err := database.ScanOnboarding(func(dest ...any) error {
		return tx.QueryRowContext(ctx, `
SELECT id, user_id, status, national_id_number, bvn, tin, virtual_account_id,
       virtual_account_number, virtual_account_name, virtual_account_bank,
       paystack_customer_code, created_at, updated_at, completed_at
FROM onboarding
WHERE paystack_customer_code = $1
LIMIT 1`, customerCode).Scan(dest...)
	})
	if err == sql.ErrNoRows {
		log.Printf("No onboarding found for customer code: %s", customerCode)
		return nil
	}
	if err != nil {
		return fmt.Errorf("failed to query onboarding: %w", err)
	}

	status := onboarding.Status
	completedAt := onboarding.CompletedAt
	if accountEvent.Active {
		status = models.OnboardingStatusCompleted
		if completedAt == nil {
			now := time.Now().UTC()
			completedAt = &now
		}
	}

	_, err = tx.ExecContext(ctx, `
UPDATE onboarding
SET virtual_account_number = $2,
    virtual_account_name = $3,
    virtual_account_bank = $4,
    status = $5,
    completed_at = $6,
    updated_at = $7
WHERE id = $1`,
		onboarding.ID,
		accountEvent.AccountNumber,
		accountEvent.AccountName,
		accountEvent.Bank.Name,
		status,
		completedAt,
		time.Now().UTC(),
	)
	if err != nil {
		return fmt.Errorf("failed to update onboarding: %w", err)
	}

	log.Printf("Updated onboarding for user %s with virtual account details", onboarding.UserID)
	return nil
}

func reserveWebhookEvent(ctx context.Context, eventKey, eventType, reference, signature string, payload []byte) (bool, error) {
	result, err := webhookDB.ExecContext(ctx, `
INSERT INTO paystack_webhook_events (
    event_key, event_type, paystack_reference, signature, payload, processing_status, received_at
) VALUES ($1, $2, $3, $4, $5::jsonb, 'received', $6)
ON CONFLICT (event_key) DO NOTHING`, eventKey, eventType, reference, signature, string(payload), time.Now().UTC())
	if err != nil {
		return false, fmt.Errorf("insert webhook event: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, err
	}
	if rowsAffected > 0 {
		return false, nil
	}

	var status string
	if err := webhookDB.QueryRowContext(ctx, `
SELECT processing_status
FROM paystack_webhook_events
WHERE event_key = $1`, eventKey).Scan(&status); err != nil {
		return false, fmt.Errorf("query webhook event status: %w", err)
	}
	if status == "processed" {
		return true, nil
	}

	_, err = webhookDB.ExecContext(ctx, `
UPDATE paystack_webhook_events
SET event_type = $2,
    paystack_reference = $3,
    signature = $4,
    payload = $5::jsonb,
    processing_status = 'received',
    last_error = '',
    received_at = $6,
    processed_at = NULL
WHERE event_key = $1`, eventKey, eventType, reference, signature, string(payload), time.Now().UTC())
	if err != nil {
		return false, fmt.Errorf("reset webhook event status: %w", err)
	}
	return false, nil
}

func markWebhookEventProcessed(ctx context.Context, eventKey string) error {
	_, err := webhookDB.ExecContext(ctx, `
UPDATE paystack_webhook_events
SET processing_status = 'processed',
    last_error = '',
    processed_at = $2
WHERE event_key = $1`, eventKey, time.Now().UTC())
	return err
}

func markWebhookEventFailed(ctx context.Context, eventKey, lastError string) {
	if _, err := webhookDB.ExecContext(ctx, `
UPDATE paystack_webhook_events
SET processing_status = 'failed',
    last_error = $2
WHERE event_key = $1`, eventKey, lastError); err != nil {
		log.Printf("Error storing webhook failure for %s: %v", eventKey, err)
	}
}

func buildWebhookEventKey(event *WebhookEvent, body []byte) (string, string) {
	reference := ""
	suffix := ""
	switch event.Event {
	case "charge.success":
		var chargeEvent ChargeSuccessEvent
		if err := json.Unmarshal(event.Data, &chargeEvent); err == nil {
			reference = strings.TrimSpace(chargeEvent.Reference)
			suffix = reference
		}
	case "dedicatedaccount.assign", "dedicatedaccount.success", "dedicatedaccount.update":
		var accountEvent VirtualAccountEvent
		if err := json.Unmarshal(event.Data, &accountEvent); err == nil {
			suffix = strings.TrimSpace(accountEvent.Customer.CustomerCode)
			if accountEvent.AccountNumber != "" {
				suffix += ":" + strings.TrimSpace(accountEvent.AccountNumber)
			}
		}
	}

	if suffix == "" {
		hash := sha256.Sum256(body)
		suffix = hex.EncodeToString(hash[:])
	}
	return fmt.Sprintf("%s:%s", event.Event, suffix), reference
}

func metadataString(metadata map[string]interface{}, key string) string {
	if metadata == nil {
		return ""
	}
	value, ok := metadata[key]
	if !ok || value == nil {
		return ""
	}
	if s, ok := value.(string); ok {
		return strings.TrimSpace(s)
	}
	return strings.TrimSpace(fmt.Sprintf("%v", value))
}

func verifySignature(payload []byte, signature, secret string) bool {
	if secret == "" {
		return false
	}
	mac := hmac.New(sha512.New, []byte(secret))
	mac.Write(payload)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}
