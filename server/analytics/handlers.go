package analytics

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"server/database"
	"server/jobs"
	"server/utils"
)

var analyticsDB *sql.DB

func InitAnalytics(db *sql.DB) {
	analyticsDB = db
}

func SocialLoginAnalyticsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if analyticsDB == nil {
		var err error
		analyticsDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
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

	validProviders := map[string]bool{"google": true, "email": true}
	if !validProviders[req.Provider] {
		utils.WriteValidationError(w, "Invalid provider")
		return
	}
	validActions := map[string]bool{"sign_in": true, "sign_up": true}
	if !validActions[req.Action] {
		utils.WriteValidationError(w, "Invalid action")
		return
	}

	createdAt := time.Now().UTC()
	if req.Timestamp != "" {
		if parsed, err := time.Parse(time.RFC3339, req.Timestamp); err == nil {
			createdAt = parsed
		}
	}
	if req.IPAddress == "" {
		req.IPAddress = getClientIP(r)
	}
	if req.UserAgent == "" {
		req.UserAgent = r.UserAgent()
	}

	requestID := r.Header.Get("X-Request-ID")
	if requestID == "" {
		requestID = "unknown"
	}

	payload := jobs.SocialLoginAnalyticsPayload{
		UserID:       req.UserID,
		Provider:     req.Provider,
		Action:       req.Action,
		Success:      req.Success,
		ErrorCode:    req.ErrorCode,
		ErrorMessage: req.ErrorMessage,
		IPAddress:    req.IPAddress,
		UserAgent:    req.UserAgent,
		Timestamp:    createdAt,
	}

	if err := jobs.EnqueueSocialLoginAnalytics(r.Context(), payload, requestID); err != nil {
		log.Printf("Error queueing analytics job: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "Analytics job queued successfully",
		"queued":  true,
	})
}

func getClientIP(r *http.Request) string {
	if forwarded := r.Header.Get("X-Forwarded-For"); forwarded != "" {
		return forwarded
	}
	if realIP := r.Header.Get("X-Real-IP"); realIP != "" {
		return realIP
	}
	return r.RemoteAddr
}

func GetSocialLoginStatsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if analyticsDB == nil {
		var err error
		analyticsDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	days := 30
	if daysStr := r.URL.Query().Get("days"); daysStr != "" {
		if d, err := parseInt(daysStr); err == nil && d > 0 && d <= 365 {
			days = d
		}
	}
	startDate := time.Now().AddDate(0, 0, -days)

	rows, err := analyticsDB.QueryContext(r.Context(), `
SELECT id, user_id, provider, action, success, error_code, error_message, ip_address, user_agent, created_at
FROM social_login_analytics
WHERE created_at >= $1`, startDate)
	if err != nil {
		utils.WriteInternalError(w, err)
		return
	}
	defer rows.Close()

	stats := map[string]interface{}{
		"total_events":      0,
		"successful_logins": 0,
		"failed_logins":     0,
		"by_provider":       map[string]int{},
		"by_action":         map[string]int{},
		"error_breakdown":   map[string]int{},
	}
	totalEvents := 0
	successfulLogins := 0
	failedLogins := 0
	byProvider := make(map[string]int)
	byAction := make(map[string]int)
	errorBreakdown := make(map[string]int)

	for rows.Next() {
		entry, err := database.ScanSocialLoginAnalytics(rows.Scan)
		if err != nil {
			log.Printf("Error parsing analytics: %v", err)
			continue
		}
		totalEvents++
		if entry.Success {
			successfulLogins++
		} else {
			failedLogins++
			if entry.ErrorCode != "" {
				errorBreakdown[entry.ErrorCode]++
			}
		}
		byProvider[entry.Provider]++
		byAction[entry.Action]++
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

func parseInt(s string) (int, error) {
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}
