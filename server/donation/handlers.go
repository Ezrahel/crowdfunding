package donation

import (
	"context"
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

// InitDonationHandlers initializes donation handlers with Firestore client
func InitDonationHandlers(client *firestore.Client) {
	firestoreClient = client
}

// GetDonorUID extracts user ID from request context (optional for anonymous donations)
func GetDonorUID(r *http.Request) (string, error) {
	uidVal := r.Context().Value(AuthIDKey)
	if uidVal == nil {
		return "", nil // Anonymous donation allowed
	}
	donorID, ok := uidVal.(string)
	if !ok {
		return "", nil
	}
	return donorID, nil
}

// CreateDonation creates a new donation
func CreateDonation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		http.Error(w, "Firestore client not initialized", http.StatusInternalServerError)
		return
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

	// Validate
	if req.CampaignID == "" {
		utils.WriteBadRequest(w, "Campaign ID is required")
		return
	}
	if !utils.ValidateFirestoreID(req.CampaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}
	if req.Amount <= 0 {
		utils.WriteValidationError(w, "Amount must be greater than zero")
		return
	}
	if req.DonorEmail == "" {
		utils.WriteValidationError(w, "Donor email is required")
		return
	}

	// Get donor ID (optional)
	donorID, _ := GetDonorUID(r)

	// Verify campaign exists
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

	// Validate campaign status before allowing donation
	if campaign.Status != "Active" {
		utils.WriteBadRequest(w, "Donations can only be made to active campaigns")
		return
	}

	// Check for duplicate transaction ID to prevent double-charging
	if req.TransactionID != "" {
		existingDonations, _ := firestoreClient.Collection("donations").
			Where("transaction_id", "==", req.TransactionID).
			Where("status", "==", "completed").
			Limit(1).
			Documents(r.Context()).GetAll()

		if len(existingDonations) > 0 {
			utils.WriteBadRequest(w, "Transaction ID already exists")
			return
		}
	}

	// Calculate fees
	// 5% platform fee (always deducted from donation amount)
	platformFee := req.Amount * 0.05

	// 2.9% + $0.30 processing fee (only if user covers fees)
	processingFee := 0.0
	if req.CoverFees {
		processingFee = req.Amount*0.029 + 0.30
	}

	// Net amount that goes to campaign (donation - platform fee)
	netAmount := req.Amount - platformFee

	// Total amount paid by donor
	totalPaid := req.Amount + processingFee + req.Tip

	// Legacy fee field for compatibility (total of all fees)
	fee := platformFee + processingFee

	// Validate amount
	if err := utils.ValidateAmount(req.Amount, 0.01, 10000000.0); err != nil {
		utils.WriteValidationError(w, "Amount: "+err.Error())
		return
	}

	// Validate email
	if !utils.ValidateEmail(req.DonorEmail) {
		utils.WriteValidationError(w, "Invalid email address")
		return
	}

	// Sanitize inputs
	req.DonorName = utils.SanitizeString(req.DonorName, 200)
	req.Message = utils.SanitizeString(req.Message, 1000)
	req.PaymentMethod = utils.SanitizeString(req.PaymentMethod, 50)
	req.TransactionID = utils.SanitizeString(req.TransactionID, 200)

	// Check if this is a new donor BEFORE transaction (more efficient)
	var isNewDonor bool
	if !req.IsAnonymous {
		if donorID != "" {
			existingDonations, _ := firestoreClient.Collection("donations").
				Where("campaign_id", "==", req.CampaignID).
				Where("donor_id", "==", donorID).
				Where("status", "==", "completed").
				Limit(1).
				Documents(r.Context()).GetAll()
			isNewDonor = len(existingDonations) == 0
		} else {
			existingDonations, _ := firestoreClient.Collection("donations").
				Where("campaign_id", "==", req.CampaignID).
				Where("donor_email", "==", req.DonorEmail).
				Where("status", "==", "completed").
				Limit(1).
				Documents(r.Context()).GetAll()
			isNewDonor = len(existingDonations) == 0
		}
	}

	// Create donation document reference
	donationRef := firestoreClient.Collection("donations").NewDoc()
	donation := models.Donation{
		ID:            donationRef.ID,
		CampaignID:    req.CampaignID,
		DonorID:       donorID,
		DonorName:     req.DonorName,
		DonorEmail:    req.DonorEmail,
		Amount:        req.Amount,
		PlatformFee:   platformFee,
		ProcessingFee: processingFee,
		NetAmount:     netAmount,
		Fee:           fee, // Legacy field for compatibility
		Tip:           req.Tip,
		TotalPaid:     totalPaid,
		IsAnonymous:   req.IsAnonymous,
		Message:       req.Message,
		PaymentMethod: req.PaymentMethod,
		TransactionID: req.TransactionID,
		Status:        "completed", // In production, start as "pending" until payment confirmed
		CreatedAt:     time.Now(),
	}

	// Use transaction to ensure atomicity: create donation AND update campaign
	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	err = firestoreClient.RunTransaction(ctx, func(ctx context.Context, tx *firestore.Transaction) error {
		// Create donation
		if err := tx.Set(donationRef, donation); err != nil {
			return fmt.Errorf("failed to create donation: %w", err)
		}

		// Update campaign
		campaignRef := firestoreClient.Collection("campaigns").Doc(req.CampaignID)
		// Verify campaign exists (we don't need the document data, just verify it exists)
		_, err := tx.Get(campaignRef)
		if err != nil {
			return fmt.Errorf("failed to get campaign: %w", err)
		}

		// Build updates for campaign
		// Only increment raised by net amount (after platform fee deduction)
		updates := []firestore.Update{
			{Path: "raised", Value: firestore.Increment(netAmount)},
			{Path: "updated_at", Value: time.Now()},
		}

		// Increment donor count if new donor
		if isNewDonor && !req.IsAnonymous {
			updates = append(updates, firestore.Update{
				Path:  "donors",
				Value: firestore.Increment(1),
			})
		}

		return tx.Update(campaignRef, updates)
	})

	if err != nil {
		log.Printf("Transaction failed: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	// Log financial operation for audit
	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "unknown"
	}
	utils.LogFinancialOperation("DONATION_CREATED", donorID, req.CampaignID, requestID, req.Amount, "USD")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Donation created successfully",
		"donation": donation,
	})
}

// GetDonations retrieves donations with optional filters
func GetDonations(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if firestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	ctx := r.Context()
	// Start with collection reference
	collectionRef := firestoreClient.Collection("donations")

	// Get query parameters
	campaignID := r.URL.Query().Get("campaign_id")
	donorID := r.URL.Query().Get("donor_id")
	status := r.URL.Query().Get("status")

	// Build query by chaining Where clauses (returns Query, not CollectionRef)
	var query firestore.Query = collectionRef.Query
	if campaignID != "" {
		if !utils.ValidateFirestoreID(campaignID) {
			utils.WriteBadRequest(w, "Invalid campaign ID format")
			return
		}
		query = query.Where("campaign_id", "==", campaignID)
	}
	if donorID != "" {
		if !utils.ValidateFirestoreID(donorID) {
			utils.WriteBadRequest(w, "Invalid donor ID format")
			return
		}
		query = query.Where("donor_id", "==", donorID)
	}
	if status != "" {
		if !utils.ValidateDonationStatus(status) {
			utils.WriteBadRequest(w, "Invalid donation status")
			return
		}
		query = query.Where("status", "==", status)
	}

	// Order by creation date (newest first)
	query = query.OrderBy("created_at", firestore.Desc).Limit(100)

	iter := query.Documents(ctx)
	var donations []models.Donation

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Error iterating donations: %v", err)
			break
		}

		var donation models.Donation
		if err := doc.DataTo(&donation); err != nil {
			log.Printf("Error parsing donation: %v", err)
			continue
		}

		// Hide donor info if anonymous
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

// GetDonation retrieves a single donation by ID
func GetDonation(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	donationID := r.URL.Query().Get("id")
	if donationID == "" {
		utils.WriteBadRequest(w, "Donation ID is required")
		return
	}

	if !utils.ValidateFirestoreID(donationID) {
		utils.WriteBadRequest(w, "Invalid donation ID format")
		return
	}

	doc, err := firestoreClient.Collection("donations").Doc(donationID).Get(r.Context())
	if err != nil {
		if strings.Contains(err.Error(), "NotFound") {
			utils.WriteNotFound(w, "Donation not found")
			return
		}
		log.Printf("Error fetching donation: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	var donation models.Donation
	if err := doc.DataTo(&donation); err != nil {
		log.Printf("Error parsing donation: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	// Check if requester is the donor or campaign owner
	requesterUID, _ := GetDonorUID(r)

	// If anonymous and no requester, allow access (public donation)
	if donation.IsAnonymous && requesterUID == "" {
		// Allow access to anonymous donations
	} else if donation.DonorID != requesterUID {
		// Check if requester is campaign owner
		campaignDoc, err := firestoreClient.Collection("campaigns").Doc(donation.CampaignID).Get(r.Context())
		if err != nil {
			utils.WriteForbidden(w, "Access denied")
			return
		}
		var campaign models.Campaign
		if err := campaignDoc.DataTo(&campaign); err != nil {
			utils.WriteForbidden(w, "Access denied")
			return
		}
		if campaign.OwnerID != requesterUID {
			utils.WriteForbidden(w, "Access denied")
			return
		}
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(donation)
}
