package campaign

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"time"

	"server/database"
	"server/models"
	"server/utils"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

const AuthIDKey = "auth_uid"

const campaignSelect = `
SELECT id, owner_id, title, description, story, category, goal, raised, currency, cover_image,
       additional_images, video_url, status, country, postcode, who_for, beneficiary_relation,
       duration, deadline, urgency, flexible_goal, tags, updates, donors, views, shares,
       completed, created_at, updated_at, organizer_name, organizer_email, organizer_phone,
       organizer_bio, location
FROM campaigns`

var campaignDB *sql.DB

func InitCampaignHandlers(db *sql.DB) {
	campaignDB = db
}

func GetOwnerUid(r *http.Request) (string, error) {
	uidVal := r.Context().Value(AuthIDKey)
	owner, ok := uidVal.(string)
	if !ok || owner == "" {
		return "", fmt.Errorf("failed to get user uid")
	}
	return owner, nil
}

func CreateCampaign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if campaignDB == nil {
		var err error
		campaignDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
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

	req.Title = utils.SanitizeString(req.Title, 200)
	req.Description = utils.SanitizeString(req.Description, 5000)
	req.Story = utils.SanitizeString(req.Story, 50000)
	req.Category = utils.SanitizeString(req.Category, 50)
	req.Currency = strings.ToUpper(utils.SanitizeString(req.Currency, 3))
	req.CoverImage = utils.SanitizeString(req.CoverImage, 1000)
	req.Country = utils.SanitizeString(req.Country, 100)
	req.Postcode = utils.SanitizeString(req.Postcode, 20)
	req.WhoFor = utils.SanitizeString(req.WhoFor, 200)
	req.OrganizerName = utils.SanitizeString(req.OrganizerName, 200)
	req.Location = utils.SanitizeString(req.Location, 200)
	req.VideoURL = utils.SanitizeString(req.VideoURL, 1000)
	req.BeneficiaryRelation = utils.SanitizeString(req.BeneficiaryRelation, 100)
	req.Urgency = utils.SanitizeString(req.Urgency, 50)
	req.Updates = utils.SanitizeString(req.Updates, 10000)
	req.OrganizerEmail = utils.SanitizeString(req.OrganizerEmail, 320)
	req.OrganizerPhone = utils.SanitizeString(req.OrganizerPhone, 30)
	req.OrganizerBio = utils.SanitizeString(req.OrganizerBio, 2000)
	req.Tags = sanitizeStringSlice(req.Tags, 50, 20)
	req.AdditionalImages = sanitizeStringSlice(req.AdditionalImages, 1000, 20)

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
	if req.Currency == "" {
		req.Currency = "USD"
	}
	if !utils.ValidateCurrency(req.Currency) {
		utils.WriteValidationError(w, "Invalid currency code")
		return
	}
	if req.OrganizerEmail != "" && !utils.ValidateEmail(req.OrganizerEmail) {
		utils.WriteValidationError(w, "Invalid organizer email")
		return
	}

	now := time.Now()
	deadline := req.Deadline
	if deadline.IsZero() {
		deadline = now.AddDate(0, 0, req.Duration)
	}
	if !deadline.After(now) {
		utils.WriteValidationError(w, "Deadline must be in the future")
		return
	}

	campaign := models.Campaign{
		ID:                  uuid.NewString(),
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
		Status:              "Draft",
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
		CreatedAt:           now,
		UpdatedAt:           now,
		OrganizerName:       req.OrganizerName,
		OrganizerEmail:      req.OrganizerEmail,
		OrganizerPhone:      req.OrganizerPhone,
		OrganizerBio:        req.OrganizerBio,
		Location:            req.Location,
	}

	insert := `
INSERT INTO campaigns (
    id, owner_id, title, description, story, category, goal, raised, currency, cover_image,
    additional_images, video_url, status, country, postcode, who_for, beneficiary_relation,
    duration, deadline, urgency, flexible_goal, tags, updates, donors, views, shares,
    completed, created_at, updated_at, organizer_name, organizer_email, organizer_phone,
    organizer_bio, location
) VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15, $16, $17,
    $18, $19, $20, $21, $22, $23, $24, $25, $26,
    $27, $28, $29, $30, $31, $32,
    $33, $34
)`

	_, err = campaignDB.ExecContext(r.Context(), insert,
		campaign.ID,
		campaign.OwnerID,
		campaign.Title,
		campaign.Description,
		campaign.Story,
		campaign.Category,
		campaign.Goal,
		campaign.Raised,
		campaign.Currency,
		campaign.CoverImage,
		pq.Array(campaign.AdditionalImages),
		campaign.VideoURL,
		campaign.Status,
		campaign.Country,
		campaign.Postcode,
		campaign.WhoFor,
		campaign.BeneficiaryRelation,
		campaign.Duration,
		campaign.Deadline,
		campaign.Urgency,
		campaign.FlexibleGoal,
		pq.Array(campaign.Tags),
		campaign.Updates,
		campaign.Donors,
		campaign.Views,
		campaign.Shares,
		campaign.Completed,
		campaign.CreatedAt,
		campaign.UpdatedAt,
		campaign.OrganizerName,
		campaign.OrganizerEmail,
		campaign.OrganizerPhone,
		campaign.OrganizerBio,
		campaign.Location,
	)
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

func GetCampaign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if campaignDB == nil {
		var err error
		campaignDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	campaignID := r.URL.Query().Get("id")
	if campaignID == "" {
		pathParts := strings.Split(r.URL.Path, "/")
		for i, part := range pathParts {
			if part == "campaign" && i+1 < len(pathParts) {
				campaignID = pathParts[i+1]
				break
			}
		}
	}
	if campaignID == "" || !utils.ValidateFirestoreID(campaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}

	campaign, err := database.ScanCampaign(func(dest ...any) error {
		return campaignDB.QueryRowContext(r.Context(), campaignSelect+" WHERE id = $1", campaignID).Scan(dest...)
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

	if _, err := campaignDB.ExecContext(r.Context(), "UPDATE campaigns SET views = views + 1, updated_at = $2 WHERE id = $1", campaignID, time.Now()); err == nil {
		campaign.Views++
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(campaign)
}

func ListCampaigns(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if campaignDB == nil {
		var err error
		campaignDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	category := r.URL.Query().Get("category")
	search := utils.SanitizeString(r.URL.Query().Get("search"), 100)
	status := r.URL.Query().Get("status")
	ownerID := r.URL.Query().Get("owner_id")
	sortBy := r.URL.Query().Get("sort_by")
	limit := 20
	if limitStr := r.URL.Query().Get("limit"); limitStr != "" {
		if parsed, err := strconv.Atoi(limitStr); err == nil && parsed > 0 && parsed <= 100 {
			limit = parsed
		}
	}
	if ownerID != "" && !utils.ValidateFirestoreID(ownerID) {
		utils.WriteBadRequest(w, "Invalid owner ID format")
		return
	}

	conditions := make([]string, 0)
	args := make([]any, 0)
	argPos := 1
	if category != "" && category != "all" {
		conditions = append(conditions, fmt.Sprintf("category = $%d", argPos))
		args = append(args, category)
		argPos++
	}
	if status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argPos))
		args = append(args, status)
		argPos++
	} else {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argPos))
		args = append(args, "Active")
		argPos++
	}
	if ownerID != "" {
		conditions = append(conditions, fmt.Sprintf("owner_id = $%d", argPos))
		args = append(args, ownerID)
		argPos++
	}
	if search != "" {
		conditions = append(conditions, fmt.Sprintf("(title ILIKE $%d OR description ILIKE $%d OR location ILIKE $%d)", argPos, argPos, argPos))
		args = append(args, "%"+search+"%")
		argPos++
	}

	orderBy := "created_at DESC"
	switch sortBy {
	case "ending_soon":
		orderBy = "deadline ASC"
	case "most_funded":
		orderBy = "raised DESC"
	case "most_donors":
		orderBy = "donors DESC"
	}

	query := campaignSelect
	if len(conditions) > 0 {
		query += " WHERE " + strings.Join(conditions, " AND ")
	}
	query += " ORDER BY " + orderBy + fmt.Sprintf(" LIMIT $%d", argPos)
	args = append(args, limit)

	rows, err := campaignDB.QueryContext(r.Context(), query, args...)
	if err != nil {
		log.Printf("Error listing campaigns: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	defer rows.Close()

	campaigns := make([]models.Campaign, 0)
	for rows.Next() {
		campaign, err := database.ScanCampaign(rows.Scan)
		if err != nil {
			log.Printf("Error parsing campaign: %v", err)
			continue
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

func UpdateCampaign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if campaignDB == nil {
		var err error
		campaignDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	campaignID := r.URL.Query().Get("id")
	if campaignID == "" || !utils.ValidateFirestoreID(campaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}
	ownerUID, err := GetOwnerUid(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	var ownerID string
	if err := campaignDB.QueryRowContext(r.Context(), "SELECT owner_id FROM campaigns WHERE id = $1", campaignID).Scan(&ownerID); err == sql.ErrNoRows {
		utils.WriteNotFound(w, "Campaign not found")
		return
	} else if err != nil {
		log.Printf("Error fetching campaign owner: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	if ownerID != ownerUID {
		utils.WriteForbidden(w, "You don't own this campaign")
		return
	}

	var updates map[string]any
	if err := json.NewDecoder(r.Body).Decode(&updates); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	setClauses := make([]string, 0)
	args := make([]any, 0)
	argPos := 1
	appendField := func(column string, value any) {
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", column, argPos))
		args = append(args, value)
		argPos++
	}

	for key, value := range updates {
		switch key {
		case "title":
			v, ok := value.(string)
			if !ok {
				continue
			}
			v = utils.SanitizeString(v, 200)
			if err := utils.ValidateStringLength(v, 10, 200); err != nil {
				utils.WriteValidationError(w, "Title "+err.Error())
				return
			}
			appendField("title", v)
		case "description":
			appendField("description", utils.SanitizeString(asString(value), 5000))
		case "story":
			appendField("story", utils.SanitizeString(asString(value), 50000))
		case "category":
			appendField("category", utils.SanitizeString(asString(value), 50))
		case "goal":
			v, ok := asFloat(value)
			if !ok || utils.ValidateAmount(v, 1, 10000000) != nil {
				utils.WriteValidationError(w, "Goal: invalid amount")
				return
			}
			appendField("goal", v)
		case "currency":
			v := strings.ToUpper(utils.SanitizeString(asString(value), 3))
			if !utils.ValidateCurrency(v) {
				utils.WriteValidationError(w, "Invalid currency code")
				return
			}
			appendField("currency", v)
		case "cover_image":
			appendField("cover_image", utils.SanitizeString(asString(value), 1000))
		case "country":
			appendField("country", utils.SanitizeString(asString(value), 100))
		case "postcode":
			appendField("postcode", utils.SanitizeString(asString(value), 20))
		case "who_for":
			appendField("who_for", utils.SanitizeString(asString(value), 200))
		case "duration":
			v, ok := asInt(value)
			if !ok || v <= 0 || v > 365 {
				utils.WriteValidationError(w, "Duration must be between 1 and 365 days")
				return
			}
			appendField("duration", v)
		case "deadline":
			deadline, err := parseTime(value)
			if err != nil || !deadline.After(time.Now()) {
				utils.WriteValidationError(w, "Deadline must be a future RFC3339 timestamp")
				return
			}
			appendField("deadline", deadline)
		case "organizer_name":
			appendField("organizer_name", utils.SanitizeString(asString(value), 200))
		case "location":
			appendField("location", utils.SanitizeString(asString(value), 200))
		case "tags":
			appendField("tags", pq.Array(asStringSlice(value, 50, 20)))
		case "additional_images":
			appendField("additional_images", pq.Array(asStringSlice(value, 1000, 20)))
		case "video_url":
			appendField("video_url", utils.SanitizeString(asString(value), 1000))
		case "beneficiary_relation":
			appendField("beneficiary_relation", utils.SanitizeString(asString(value), 100))
		case "urgency":
			appendField("urgency", utils.SanitizeString(asString(value), 50))
		case "flexible_goal":
			v, ok := value.(bool)
			if ok {
				appendField("flexible_goal", v)
			}
		case "updates":
			appendField("updates", utils.SanitizeString(asString(value), 10000))
		case "organizer_email":
			v := utils.SanitizeString(asString(value), 320)
			if v != "" && !utils.ValidateEmail(v) {
				utils.WriteValidationError(w, "Invalid organizer email")
				return
			}
			appendField("organizer_email", v)
		case "organizer_phone":
			appendField("organizer_phone", utils.SanitizeString(asString(value), 30))
		case "organizer_bio":
			appendField("organizer_bio", utils.SanitizeString(asString(value), 2000))
		case "status":
			v := utils.SanitizeString(asString(value), 20)
			if !utils.ValidateCampaignStatus(v) {
				utils.WriteValidationError(w, "Invalid campaign status")
				return
			}
			appendField("status", v)
		case "completed":
			if v, ok := value.(bool); ok {
				appendField("completed", v)
			}
		case "shares":
			if v, ok := asInt(value); ok {
				appendField("shares", v)
			}
		}
	}

	appendField("updated_at", time.Now())
	if len(setClauses) == 1 {
		utils.WriteBadRequest(w, "No valid campaign fields provided")
		return
	}
	args = append(args, campaignID)

	query := "UPDATE campaigns SET " + strings.Join(setClauses, ", ") + fmt.Sprintf(" WHERE id = $%d", argPos)
	if _, err := campaignDB.ExecContext(r.Context(), query, args...); err != nil {
		log.Printf("Error updating campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	updatedCampaign, err := database.ScanCampaign(func(dest ...any) error {
		return campaignDB.QueryRowContext(r.Context(), campaignSelect+" WHERE id = $1", campaignID).Scan(dest...)
	})
	if err != nil {
		log.Printf("Error fetching updated campaign: %v", err)
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

func DeleteCampaign(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodDelete {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if campaignDB == nil {
		var err error
		campaignDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	campaignID := r.URL.Query().Get("id")
	if campaignID == "" || !utils.ValidateFirestoreID(campaignID) {
		utils.WriteBadRequest(w, "Invalid campaign ID format")
		return
	}
	ownerUID, err := GetOwnerUid(r)
	if err != nil {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	var ownerID string
	if err := campaignDB.QueryRowContext(r.Context(), "SELECT owner_id FROM campaigns WHERE id = $1", campaignID).Scan(&ownerID); err == sql.ErrNoRows {
		utils.WriteNotFound(w, "Campaign not found")
		return
	} else if err != nil {
		log.Printf("Error fetching campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	if ownerID != ownerUID {
		utils.WriteForbidden(w, "You don't own this campaign")
		return
	}

	if _, err := campaignDB.ExecContext(r.Context(), "DELETE FROM campaigns WHERE id = $1", campaignID); err != nil {
		log.Printf("Error deleting campaign: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Campaign deleted successfully"})
}

func sanitizeStringSlice(values []string, maxLen, maxItems int) []string {
	cleaned := make([]string, 0, len(values))
	for _, value := range values {
		value = utils.SanitizeString(value, maxLen)
		if value == "" {
			continue
		}
		cleaned = append(cleaned, value)
		if len(cleaned) >= maxItems {
			break
		}
	}
	return cleaned
}

func asString(value any) string {
	v, _ := value.(string)
	return v
}

func asFloat(value any) (float64, bool) {
	switch v := value.(type) {
	case float64:
		return v, true
	case float32:
		return float64(v), true
	case int:
		return float64(v), true
	case int64:
		return float64(v), true
	default:
		return 0, false
	}
}

func asInt(value any) (int, bool) {
	switch v := value.(type) {
	case float64:
		return int(v), true
	case int:
		return v, true
	case int32:
		return int(v), true
	case int64:
		return int(v), true
	default:
		return 0, false
	}
}

func asStringSlice(value any, maxLen, maxItems int) []string {
	items, ok := value.([]any)
	if !ok {
		if values, ok := value.([]string); ok {
			return sanitizeStringSlice(values, maxLen, maxItems)
		}
		return nil
	}
	result := make([]string, 0, len(items))
	for _, item := range items {
		if str, ok := item.(string); ok {
			str = utils.SanitizeString(str, maxLen)
			if str == "" {
				continue
			}
			result = append(result, str)
			if len(result) >= maxItems {
				break
			}
		}
	}
	return result
}

func parseTime(value any) (time.Time, error) {
	str, ok := value.(string)
	if !ok {
		return time.Time{}, fmt.Errorf("invalid time")
	}
	return time.Parse(time.RFC3339, str)
}
