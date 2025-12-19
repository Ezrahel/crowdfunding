package campaign

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"server/models"
	"server/utils"

	"cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
)

const AuthIDKey = "auth_uid"

var firestoreClient *firestore.Client

// InitCampaignHandlers initializes campaign handlers with Firestore client
func InitCampaignHandlers(client *firestore.Client) {
	firestoreClient = client
}

// GetOwnerUid extracts user ID from request context
func GetOwnerUid(r *http.Request) (string, error) {
	uidVal := r.Context().Value(AuthIDKey)
	owner, ok := uidVal.(string)
	if !ok || owner == "" {
		return "", fmt.Errorf("failed to get user uid")
	}
	return owner, nil
}

// CreateCampaign creates a new campaign in Firestore
func CreateCampaign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	ownerUID, err := GetOwnerUid(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	var req struct {
		Title               string    `json:"title"`
		Description         string    `json:"description"`
		Story               string    `json:"story"`
		Category            string    `json:"category"`
		Goal                float64   `json:"goal"`
		Currency            string    `json:"currency"`
		CoverImage          string    `json:"cover_image"`
		Country             string    `json:"country"`
		Postcode            string    `json:"postcode"`
		WhoFor              string    `json:"who_for"`
		Duration            int       `json:"duration"`
		Deadline            time.Time `json:"deadline"`
		OrganizerName       string    `json:"organizer_name"`
		Location            string    `json:"location"`
		Tags                []string  `json:"tags"`
		AdditionalImages    []string  `json:"additional_images"`
		VideoURL            string    `json:"video_url"`
		BeneficiaryRelation string    `json:"beneficiary_relation"`
		Urgency             string    `json:"urgency"`
		FlexibleGoal        bool      `json:"flexible_goal"`
		Updates             string    `json:"updates"`
		OrganizerEmail      string    `json:"organizer_email"`
		OrganizerPhone      string    `json:"organizer_phone"`
		OrganizerBio        string    `json:"organizer_bio"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Validate input
	req.Title = utils.SanitizeString(req.Title, 200)
	req.Description = utils.SanitizeString(req.Description, 5000)
	req.Story = utils.SanitizeString(req.Story, 50000)
	req.Category = utils.SanitizeString(req.Category, 50)
	req.Country = utils.SanitizeString(req.Country, 100)
	req.Postcode = utils.SanitizeString(req.Postcode, 20)
	req.WhoFor = utils.SanitizeString(req.WhoFor, 200)
	req.OrganizerName = utils.SanitizeString(req.OrganizerName, 200)
	req.Location = utils.SanitizeString(req.Location, 200)

	if err := utils.ValidateStringLength(req.Title, 10, 200); err != nil {
		utils.WriteValidationError(w, "Title "+err.Error())
		return
	}
	if err := utils.ValidateStringLength(req.Description, 0, 5000); err != nil {
		utils.WriteValidationError(w, "Description "+err.Error())
		return
	}
	if err := utils.ValidateAmount(req.Goal, 1.0, 10000000.0); err != nil {
		utils.WriteValidationError(w, "Goal: "+err.Error())
		return
	}
	if req.Duration <= 0 || req.Duration > 365 {
		utils.WriteValidationError(w, "Duration must be between 1 and 365 days")
		return
	}
	if req.Currency != "" && !utils.ValidateCurrency(req.Currency) {
		utils.WriteValidationError(w, "Invalid currency code")
		return
	}
	if req.Category != "" && len(req.Category) > 50 {
		utils.WriteValidationError(w, "Category must not exceed 50 characters")
		return
	}

	now := time.Now()
	deadline := req.Deadline
	if deadline.IsZero() {
		deadline = now.AddDate(0, 0, req.Duration)
	}
	// Validate deadline is in the future
	if deadline.Before(now) || deadline.Equal(now) {
		utils.WriteValidationError(w, "Deadline must be in the future")
		return
	}

	campaign := models.Campaign{
		OwnerID:             ownerUID,
		Title:               req.Title,
		Description:         req.Description,
		Story:               req.Story,
		Category:            req.Category,
		Goal:                req.Goal,
		Raised:              0,
		Currency:            req.Currency,
		CoverImage:          req.CoverImage,
		AdditionalImages:    req.AdditionalImages,
		VideoURL:            req.VideoURL,
		Status:              "Draft", // Start as Draft, can be changed to Active later
		Country:             req.Country,
		Postcode:            req.Postcode,
		WhoFor:              req.WhoFor,
		BeneficiaryRelation: req.BeneficiaryRelation,
		Duration:            req.Duration,
		Deadline:            deadline,
		Urgency:             req.Urgency,
		FlexibleGoal:        req.FlexibleGoal,
		Tags:                req.Tags,
		Updates:             req.Updates,
		Donors:              0,
		Views:               0,
		Shares:              0,
		Completed:           false,
		OrganizerName:       req.OrganizerName,
		OrganizerEmail:      req.OrganizerEmail,
		OrganizerPhone:      req.OrganizerPhone,
		OrganizerBio:        req.OrganizerBio,
		Location:            req.Location,
		CreatedAt:           now,
		UpdatedAt:           now,
	}

	// Generate document reference first to get ID
	docRef := firestoreClient.Collection("campaigns").NewDoc()
	campaign.ID = docRef.ID

	// Add to Firestore with ID already set
	_, err = docRef.Set(r.Context(), campaign)
	if err != nil {
		log.Printf("Error creating campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Campaign created successfully",
		"campaign": campaign,
	})
}

// GetCampaign retrieves a single campaign by ID
func GetCampaign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	campaignID := r.URL.Query().Get("id")
	if campaignID == "" {
		// Try to get from path
		pathParts := strings.Split(r.URL.Path, "/")
		for i, part := range pathParts {
			if part == "campaign" && i+1 < len(pathParts) {
				campaignID = pathParts[i+1]
				break
			}
		}
	}

	if campaignID == "" {
		utils.WriteBadRequest(w, "Campaign ID is required")
		return
	}

	if !utils.ValidateFirestoreID(campaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}

	doc, err := firestoreClient.Collection("campaigns").Doc(campaignID).Get(r.Context())
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
	if err := doc.DataTo(&campaign); err != nil {
		log.Printf("Error parsing campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	// Increment views atomically to prevent race conditions
	_, err = firestoreClient.Collection("campaigns").Doc(campaignID).Update(r.Context(), []firestore.Update{
		{Path: "views", Value: firestore.Increment(1)},
	})
	if err != nil {
		log.Printf("Error incrementing views: %v", err)
		// Continue anyway - view increment failure shouldn't block response
	} else {
		campaign.Views++
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(campaign)
}

// ListCampaigns retrieves campaigns with filtering, search, and pagination
func ListCampaigns(w http.ResponseWriter, r *http.Request) {
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
	collectionRef := firestoreClient.Collection("campaigns")

	// Get query parameters
	category := r.URL.Query().Get("category")
	search := r.URL.Query().Get("search")
	status := r.URL.Query().Get("status")
	ownerID := r.URL.Query().Get("owner_id")
	sortBy := r.URL.Query().Get("sort_by") // newest, ending_soon, most_funded, most_donors
	limitStr := r.URL.Query().Get("limit")

	limit := 20
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	// Validate ownerID if provided
	if ownerID != "" && !utils.ValidateFirestoreID(ownerID) {
		utils.WriteBadRequest(w, "Invalid owner ID format")
		return
	}

	// Build query by chaining Where clauses (returns Query, not CollectionRef)
	var query firestore.Query = collectionRef.Query
	if category != "" && category != "all" {
		query = query.Where("category", "==", category)
	}
	if status != "" {
		query = query.Where("status", "==", status)
	} else {
		// Default to active campaigns
		query = query.Where("status", "==", "Active")
	}
	if ownerID != "" {
		query = query.Where("owner_id", "==", ownerID)
	}

	// Apply sorting
	switch sortBy {
	case "ending_soon":
		query = query.OrderBy("deadline", firestore.Asc)
	case "most_funded":
		query = query.OrderBy("raised", firestore.Desc)
	case "most_donors":
		query = query.OrderBy("donors", firestore.Desc)
	default: // newest
		query = query.OrderBy("created_at", firestore.Desc)
	}

	query = query.Limit(limit)

	// Execute query
	iter := query.Documents(ctx)
	var campaigns []models.Campaign

	for {
		doc, err := iter.Next()
		if err == iterator.Done {
			break
		}
		if err != nil {
			log.Printf("Error iterating campaigns: %v", err)
			break
		}

		var campaign models.Campaign
		if err := doc.DataTo(&campaign); err != nil {
			log.Printf("Error parsing campaign: %v", err)
			continue
		}

		// Apply search filter if provided (in-memory for now - should use Firestore text search in production)
		if search != "" {
			searchLower := strings.ToLower(utils.SanitizeString(search, 100))
			titleMatch := strings.Contains(strings.ToLower(campaign.Title), searchLower)
			descMatch := strings.Contains(strings.ToLower(campaign.Description), searchLower)
			locationMatch := strings.Contains(strings.ToLower(campaign.Location), searchLower)
			if !titleMatch && !descMatch && !locationMatch {
				continue
			}
		}

		campaigns = append(campaigns, campaign)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"campaigns": campaigns,
		"count":     len(campaigns),
	})
}

// UpdateCampaign updates an existing campaign
func UpdateCampaign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		http.Error(w, "Firestore client not initialized", http.StatusInternalServerError)
		return
	}

	campaignID := r.URL.Query().Get("id")
	if campaignID == "" {
		utils.WriteBadRequest(w, "Campaign ID is required")
		return
	}

	if !utils.ValidateFirestoreID(campaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}

	ownerUID, err := GetOwnerUid(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	// Verify ownership
	doc, err := firestoreClient.Collection("campaigns").Doc(campaignID).Get(r.Context())
	if err != nil {
		if strings.Contains(err.Error(), "NotFound") {
			utils.WriteNotFound(w, "Campaign not found")
			return
		}
		log.Printf("Error fetching campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	var existingCampaign models.Campaign
	if err := doc.DataTo(&existingCampaign); err != nil {
		log.Printf("Error parsing campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	if existingCampaign.OwnerID != ownerUID {
		utils.WriteForbidden(w, "You don't own this campaign")
		return
	}

	// Parse update request
	var updates map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Remove fields that shouldn't be updated directly
	delete(updates, "id")
	delete(updates, "owner_id")
	delete(updates, "raised")
	delete(updates, "donors")
	delete(updates, "created_at")

	// Validate and sanitize updates
	if title, ok := updates["title"].(string); ok {
		updates["title"] = utils.SanitizeString(title, 200)
		if err := utils.ValidateStringLength(updates["title"].(string), 10, 200); err != nil {
			utils.WriteValidationError(w, "Title "+err.Error())
			return
		}
	}
	if status, ok := updates["status"].(string); ok {
		if !utils.ValidateCampaignStatus(status) {
			utils.WriteValidationError(w, "Invalid campaign status")
			return
		}
	}
	if currency, ok := updates["currency"].(string); ok && currency != "" {
		if !utils.ValidateCurrency(currency) {
			utils.WriteValidationError(w, "Invalid currency code")
			return
		}
	}

	updates["updated_at"] = time.Now()

	// Update in Firestore
	_, err = firestoreClient.Collection("campaigns").Doc(campaignID).Set(r.Context(), updates, firestore.MergeAll)
	if err != nil {
		log.Printf("Error updating campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	// Fetch updated campaign
	updatedDoc, err := firestoreClient.Collection("campaigns").Doc(campaignID).Get(r.Context())
	if err != nil {
		log.Printf("Error fetching updated campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	var updatedCampaign models.Campaign
	if err := updatedDoc.DataTo(&updatedCampaign); err != nil {
		log.Printf("Error parsing updated campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":  "Campaign updated successfully",
		"campaign": updatedCampaign,
	})
}

// DeleteCampaign deletes a campaign
func DeleteCampaign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		http.Error(w, "Firestore client not initialized", http.StatusInternalServerError)
		return
	}

	campaignID := r.URL.Query().Get("id")
	if campaignID == "" {
		utils.WriteBadRequest(w, "Campaign ID is required")
		return
	}

	if !utils.ValidateFirestoreID(campaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}

	ownerUID, err := GetOwnerUid(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	// Verify ownership
	doc, err := firestoreClient.Collection("campaigns").Doc(campaignID).Get(r.Context())
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
	if err := doc.DataTo(&campaign); err != nil {
		log.Printf("Error parsing campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	if campaign.OwnerID != ownerUID {
		utils.WriteForbidden(w, "You don't own this campaign")
		return
	}

	// Delete campaign
	_, err = firestoreClient.Collection("campaigns").Doc(campaignID).Delete(r.Context())
	if err != nil {
		log.Printf("Error deleting campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Campaign deleted successfully",
	})
}
