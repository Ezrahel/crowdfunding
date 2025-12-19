package paystack

import (
	"context"
	"crypto/hmac"
	"crypto/sha512"
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

	"cloud.google.com/go/firestore"
)

var webhookFirestoreClient *firestore.Client

// InitWebhook initializes webhook handler with Firestore client
func InitWebhook(client *firestore.Client) {
	webhookFirestoreClient = client
}

// WebhookHandler handles Paystack webhook events
func WebhookHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	// Verify webhook signature
	signature := r.Header.Get("x-paystack-signature")
	if signature == "" {
		utils.WriteUnauthorized(w, "Missing webhook signature")
		return
	}

	// Read request body
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading webhook body: %v", err)
		utils.WriteBadRequest(w, "Invalid request body")
		return
	}

	// Verify signature
	secretKey := os.Getenv("PAYSTACK_SECRET_KEY")
	if !verifySignature(body, signature, secretKey) {
		log.Printf("Invalid webhook signature")
		utils.WriteUnauthorized(w, "Invalid webhook signature")
		return
	}

	// Parse webhook event
	var event WebhookEvent
	if err := json.Unmarshal(body, &event); err != nil {
		log.Printf("Error parsing webhook event: %v", err)
		utils.WriteBadRequest(w, "Invalid event data")
		return
	}

	// Process event
	if err := processWebhookEvent(&event); err != nil {
		log.Printf("Error processing webhook event: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"status": "success",
	})
}

// WebhookEvent represents a Paystack webhook event
type WebhookEvent struct {
	Event string          `json:"event"`
	Data  json.RawMessage `json:"data"`
}

// VirtualAccountEvent represents virtual account related events
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

// processWebhookEvent processes different webhook event types
func processWebhookEvent(event *WebhookEvent) error {
	switch event.Event {
	case "dedicatedaccount.assign":
		return handleDedicatedAccountAssign(event.Data)
	case "dedicatedaccount.success":
		return handleDedicatedAccountSuccess(event.Data)
	case "dedicatedaccount.update":
		return handleDedicatedAccountUpdate(event.Data)
	case "charge.success":
		// Handle successful payment to virtual account
		return handleChargeSuccess(event.Data)
	default:
		log.Printf("Unhandled webhook event: %s", event.Event)
		return nil
	}
}

// handleDedicatedAccountAssign handles when a virtual account is assigned
func handleDedicatedAccountAssign(data json.RawMessage) error {
	var accountEvent VirtualAccountEvent
	if err := json.Unmarshal(data, &accountEvent); err != nil {
		return fmt.Errorf("failed to parse account assign event: %w", err)
	}

	// Update onboarding record with virtual account details
	return updateOnboardingWithVirtualAccount(accountEvent.Customer.CustomerCode, accountEvent)
}

// handleDedicatedAccountSuccess handles successful virtual account creation
func handleDedicatedAccountSuccess(data json.RawMessage) error {
	var accountEvent VirtualAccountEvent
	if err := json.Unmarshal(data, &accountEvent); err != nil {
		return fmt.Errorf("failed to parse account success event: %w", err)
	}

	// Update onboarding record
	return updateOnboardingWithVirtualAccount(accountEvent.Customer.CustomerCode, accountEvent)
}

// handleDedicatedAccountUpdate handles virtual account updates
func handleDedicatedAccountUpdate(data json.RawMessage) error {
	var accountEvent VirtualAccountEvent
	if err := json.Unmarshal(data, &accountEvent); err != nil {
		return fmt.Errorf("failed to parse account update event: %w", err)
	}

	// Update onboarding record
	return updateOnboardingWithVirtualAccount(accountEvent.Customer.CustomerCode, accountEvent)
}

// handleChargeSuccess handles successful payment to virtual account
func handleChargeSuccess(data json.RawMessage) error {
	// This can be used to automatically credit user accounts when payments are received
	// For now, just log it
	log.Printf("Charge success event received")
	return nil
}

// updateOnboardingWithVirtualAccount updates onboarding record with virtual account details
func updateOnboardingWithVirtualAccount(customerCode string, accountEvent VirtualAccountEvent) error {
	if webhookFirestoreClient == nil {
		return fmt.Errorf("firestore client not initialized")
	}

	// Find onboarding by Paystack customer code
	query := webhookFirestoreClient.Collection("onboarding").
		Where("paystack_customer_code", "==", customerCode).
		Limit(1)

	ctx := context.Background()
	docs, err := query.Documents(ctx).GetAll()
	if err != nil {
		return fmt.Errorf("failed to query onboarding: %w", err)
	}

	if len(docs) == 0 {
		log.Printf("No onboarding found for customer code: %s", customerCode)
		return nil
	}

	doc := docs[0]
	var onboarding models.Onboarding
	if err := doc.DataTo(&onboarding); err != nil {
		return fmt.Errorf("failed to parse onboarding: %w", err)
	}

	// Update virtual account details
	updates := map[string]interface{}{
		"virtual_account_number": accountEvent.AccountNumber,
		"virtual_account_name":   accountEvent.AccountName,
		"virtual_account_bank":   accountEvent.Bank.Name,
		"updated_at":             time.Now(),
	}

	if accountEvent.Active {
		updates["status"] = models.OnboardingStatusCompleted
		if onboarding.CompletedAt == nil {
			now := time.Now()
			updates["completed_at"] = now
		}
	}

	_, err = doc.Ref.Set(ctx, updates, firestore.MergeAll)
	if err != nil {
		return fmt.Errorf("failed to update onboarding: %w", err)
	}

	log.Printf("Updated onboarding for user %s with virtual account details", onboarding.UserID)
	return nil
}

// verifySignature verifies Paystack webhook signature using HMAC SHA512
func verifySignature(payload []byte, signature, secret string) bool {
	if secret == "" {
		return false
	}

	// Paystack uses HMAC SHA512 (not simple hash concatenation)
	mac := hmac.New(sha512.New, []byte(secret))
	mac.Write(payload)
	expectedSignature := hex.EncodeToString(mac.Sum(nil))

	// Use constant-time comparison to prevent timing attacks
	return hmac.Equal([]byte(signature), []byte(expectedSignature))
}
