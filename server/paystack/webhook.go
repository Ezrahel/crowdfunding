package paystack

import (
	"crypto/hmac"
	"crypto/sha512"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"server/models"
	"server/utils"
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

	if err := processWebhookEvent(&event); err != nil {
		log.Printf("Error processing webhook event: %v", err)
		utils.WriteInternalError(w, err)
		return
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

func processWebhookEvent(event *WebhookEvent) error {
	switch event.Event {
	case "dedicatedaccount.assign", "dedicatedaccount.success", "dedicatedaccount.update":
		var accountEvent VirtualAccountEvent
		if err := json.Unmarshal(event.Data, &accountEvent); err != nil {
			return fmt.Errorf("failed to parse dedicated account event: %w", err)
		}
		return updateOnboardingWithVirtualAccount(accountEvent.Customer.CustomerCode, accountEvent)
	case "charge.success":
		log.Printf("Charge success event received")
		return nil
	default:
		log.Printf("Unhandled webhook event: %s", event.Event)
		return nil
	}
}

func updateOnboardingWithVirtualAccount(customerCode string, accountEvent VirtualAccountEvent) error {
	if webhookDB == nil {
		var err error
		webhookDB, err = database.GetDB()
		if err != nil {
			return err
		}
	}

	onboarding, err := database.ScanOnboarding(func(dest ...any) error {
		return webhookDB.QueryRow(`
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
			now := time.Now()
			completedAt = &now
		}
	}

	_, err = webhookDB.Exec(`
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
		time.Now(),
	)
	if err != nil {
		return fmt.Errorf("failed to update onboarding: %w", err)
	}

	log.Printf("Updated onboarding for user %s with virtual account details", onboarding.UserID)
	return nil
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
