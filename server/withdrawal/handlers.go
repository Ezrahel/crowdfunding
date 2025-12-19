package withdrawal

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"server/models"
	"server/utils"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

const AuthIDKey = "auth_uid"

var firestoreClient *firestore.Client

// InitWithdrawalHandlers initializes withdrawal handlers with Firestore client
func InitWithdrawalHandlers(client *firestore.Client) {
	firestoreClient = client
}

// GetUserUID extracts user ID from request context
func GetUserUID(r *http.Request) (string, error) {
	uidVal := r.Context().Value(AuthIDKey)
	userID, ok := uidVal.(string)
	if !ok || userID == "" {
		return "", fmt.Errorf("failed to get user uid")
	}
	return userID, nil
}

// CreateWithdrawal creates a new withdrawal request
func CreateWithdrawal(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
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

	// Validate
	if req.CampaignID == "" {
		utils.WriteBadRequest(w, "Campaign ID is required")
		return
	}
	if !utils.ValidateFirestoreID(req.CampaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}
	if err := utils.ValidateAmount(req.Amount, 1.0, 10000000.0); err != nil {
		utils.WriteValidationError(w, "Amount: "+err.Error())
		return
	}
	if req.Method == "" {
		utils.WriteValidationError(w, "Withdrawal method is required")
		return
	}
	if !utils.ValidateWithdrawalMethod(req.Method) {
		utils.WriteValidationError(w, "Invalid withdrawal method")
		return
	}

	// Verify campaign exists and user owns it
	campaignDoc, err := firestoreClient.Collection("campaigns").Doc(req.CampaignID).Get(r.Context())
	if err != nil {
		if strings.Contains(err.Error(), "NotFound") {
			utils.WriteNotFound(w, "Campaign not found")
			return
		}
		log.Printf("Error fetching campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	var campaign models.Campaign
	if err := campaignDoc.DataTo(&campaign); err != nil {
		log.Printf("Error parsing campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	if campaign.OwnerID != userID {
		utils.WriteForbidden(w, "You don't own this campaign")
		return
	}

	// Calculate available balance (subtract pending withdrawals)
	pendingWithdrawals, err := firestoreClient.Collection("withdrawals").
		Where("campaign_id", "==", req.CampaignID).
		Where("status", "in", []interface{}{"pending", "processing"}).
		Documents(r.Context()).GetAll()

	if err != nil {
		log.Printf("Error fetching pending withdrawals: %v", err)
		// Continue with conservative estimate
	}

	totalPending := 0.0
	for _, wDoc := range pendingWithdrawals {
		var withdrawal models.Withdrawal
		if err := wDoc.DataTo(&withdrawal); err == nil {
			totalPending += withdrawal.Amount
		}
	}

	availableBalance := campaign.Raised - totalPending
	if req.Amount > availableBalance {
		utils.WriteValidationError(w, fmt.Sprintf("Insufficient funds. Available: %.2f, Requested: %.2f", availableBalance, req.Amount))
		return
	}
	if availableBalance <= 0 {
		utils.WriteValidationError(w, "No funds available for withdrawal")
		return
	}

	// Calculate fee based on method
	fee := 0.0
	switch req.Method {
	case "bank":
		fee = 0.0 // Bank transfers typically free
	case "paypal":
		fee = req.Amount * 0.025 // 2.5% fee
	case "debit_card":
		fee = req.Amount * 0.03 // 3% fee
	}

	netAmount := req.Amount - fee

	// Create withdrawal
	withdrawal := models.Withdrawal{
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

	// Add to Firestore
	docRef, _, err := firestoreClient.Collection("withdrawals").Add(r.Context(), withdrawal)
	if err != nil {
		log.Printf("Error creating withdrawal: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	withdrawal.ID = docRef.ID

	// Log financial operation for audit
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "unknown"
	}
	utils.LogFinancialOperation("WITHDRAWAL_CREATED", userID, req.CampaignID, requestID, req.Amount, "USD")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":    "Withdrawal request created successfully",
		"withdrawal": withdrawal,
	})
}

// GetWithdrawals retrieves withdrawals for a user or campaign
func GetWithdrawals(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	ctx := r.Context()
	// Start with collection reference
	collectionRef := firestoreClient.Collection("withdrawals")

	// Get query parameters
	campaignID := r.URL.Query().Get("campaign_id")
	userID, _ := GetUserUID(r)

	// Build query by chaining Where clauses (returns Query, not CollectionRef)
	var query firestore.Query = collectionRef.Query
	if campaignID != "" {
		query = query.Where("campaign_id", "==", campaignID)
	}
	if userID != "" {
		query = query.Where("user_id", "==", userID)
	}

	// Order by creation date (newest first)
	query = query.OrderBy("created_at", firestore.Desc).Limit(100)

	iter := query.Documents(ctx)
	var withdrawals []models.Withdrawal

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Error iterating withdrawals: %v", err)
			break
		}

		var withdrawal models.Withdrawal
		if err := doc.DataTo(&withdrawal); err != nil {
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
