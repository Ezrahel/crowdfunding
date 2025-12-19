package analytics

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"server/models"
	"server/utils"

	"cloud.google.com/go/firestore"
)

var analyticsFirestoreClient *firestore.Client

// InitAnalytics initializes analytics handlers with Firestore client
func InitAnalytics(client *firestore.Client) {
	analyticsFirestoreClient = client
}

// SocialLoginAnalyticsHandler handles social login analytics tracking
func SocialLoginAnalyticsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if analyticsFirestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	var req struct {
		UserID       string `json:"user_id"`
		Provider     string `json:"provider"`
		Action       string `json:"action"`
		Success      bool   `json:"success"`
		ErrorCode    string `json:"error_code,omitempty"`
		ErrorMessage string `json:"error_message,omitempty"`
		IPAddress    string `json:"ip_address,omitempty"`
		UserAgent    string `json:"user_agent,omitempty"`
		Timestamp    string `json:"timestamp,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		utils.WriteBadRequest(w, "Invalid request payload")
		return
	}

	// Validate provider
	validProviders := map[string]bool{
		"google":   true,
		"facebook": true,
		"apple":    true,
		"email":    true,
	}
	if !validProviders[req.Provider] {
		utils.WriteValidationError(w, "Invalid provider")
		return
	}

	// Validate action
	validActions := map[string]bool{
		"sign_in":        true,
		"sign_up":        true,
		"link_account":   true,
		"unlink_account": true,
	}
	if !validActions[req.Action] {
		utils.WriteValidationError(w, "Invalid action")
		return
	}

	// Parse timestamp or use current time
	var createdAt time.Time
	if req.Timestamp != "" {
		var err error
		createdAt, err = time.Parse(time.RFC3339, req.Timestamp)
		if err != nil {
			createdAt = time.Now()
		}
	} else {
		createdAt = time.Now()
	}

	// Get IP address from request if not provided
	if req.IPAddress == "" {
		req.IPAddress = getClientIP(r)
	}

	// Get User-Agent from request if not provided
	if req.UserAgent == "" {
		req.UserAgent = r.UserAgent()
	}

	// Create analytics record
	analytics := models.SocialLoginAnalytics{
		ID:           "",
		UserID:       req.UserID,
		Provider:     req.Provider,
		Action:       req.Action,
		Success:      req.Success,
		ErrorCode:    req.ErrorCode,
		ErrorMessage: req.ErrorMessage,
		IPAddress:    req.IPAddress,
		UserAgent:    req.UserAgent,
		CreatedAt:    createdAt,
	}

	// Save to Firestore
	docRef := analyticsFirestoreClient.Collection("social_login_analytics").NewDoc()
	analytics.ID = docRef.ID

	_, err := docRef.Set(r.Context(), analytics)
	if err != nil {
		log.Printf("Error saving analytics: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Analytics recorded successfully",
		"id":      analytics.ID,
	})
}

// getClientIP extracts client IP from request
func getClientIP(r *http.Request) string {
	// Check X-Forwarded-For header (for proxies/load balancers)
	forwarded := r.Header.Get("X-Forwarded-For")
	if forwarded != "" {
		return forwarded
	}

	// Check X-Real-IP header
	realIP := r.Header.Get("X-Real-IP")
	if realIP != "" {
		return realIP
	}

	// Fallback to RemoteAddr
	return r.RemoteAddr
}

// GetSocialLoginStatsHandler returns statistics about social logins
func GetSocialLoginStatsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if analyticsFirestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	// Get date range from query params (default to last 30 days)
	days := 30
	if daysStr := r.URL.Query().Get("days"); daysStr != "" {
		if d, err := parseInt(daysStr); err == nil && d > 0 && d <= 365 {
			days = d
		}
	}

	startDate := time.Now().AddDate(0, 0, -days)

	// Query analytics
	query := analyticsFirestoreClient.Collection("social_login_analytics").
		Where("created_at", ">=", startDate)

	iter := query.Documents(ctx)
	defer iter.Stop()

	stats := map[string]interface{}{
		"total_events":      0,
		"successful_logins": 0,
		"failed_logins":     0,
		"by_provider":       make(map[string]int),
		"by_action":         make(map[string]int),
		"error_breakdown":   make(map[string]int),
	}

	totalEvents := 0
	successfulLogins := 0
	failedLogins := 0
	byProvider := make(map[string]int)
	byAction := make(map[string]int)
	errorBreakdown := make(map[string]int)

	for {
		doc, err := iter.Next()
		if err != nil {
			break
		}

		var analytics models.SocialLoginAnalytics
		if err := doc.DataTo(&analytics); err != nil {
			log.Printf("Error parsing analytics: %v", err)
			continue
		}

		totalEvents++
		if analytics.Success {
			successfulLogins++
		} else {
			failedLogins++
			if analytics.ErrorCode != "" {
				errorBreakdown[analytics.ErrorCode]++
			}
		}

		byProvider[analytics.Provider]++
		byAction[analytics.Action]++
	}

	stats["total_events"] = totalEvents
	stats["successful_logins"] = successfulLogins
	stats["failed_logins"] = failedLogins
	stats["by_provider"] = byProvider
	stats["by_action"] = byAction
	stats["error_breakdown"] = errorBreakdown

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stats)
}

// Helper function to parse integer
func parseInt(s string) (int, error) {
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}
