package user

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"server/database"
	"server/models"
	"server/utils"

	"github.com/lib/pq"
)

var statsDB *sql.DB

func InitStatsHandler(db *sql.DB) {
	statsDB = db
}

func GetUserStatsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}
	if statsDB == nil {
		var err error
		statsDB, err = database.GetDB()
		if err != nil {
			utils.WriteInternalError(w, err)
			return
		}
	}

	uidVal := r.Context().Value("auth_uid")
	userID, ok := uidVal.(string)
	if !ok || userID == "" {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	stats := models.UserStats{}
	now := time.Now()

	campaignRows, err := statsDB.QueryContext(r.Context(), `
SELECT id, owner_id, title, description, story, category, goal, raised, currency, cover_image,
       additional_images, video_url, status, country, postcode, who_for, beneficiary_relation,
       duration, deadline, urgency, flexible_goal, tags, updates, donors, views, shares,
       completed, created_at, updated_at, organizer_name, organizer_email, organizer_phone,
       organizer_bio, location
FROM campaigns
WHERE owner_id = $1`, userID)
	if err != nil {
		log.Printf("Error fetching campaigns: %v", err)
		utils.WriteInternalError(w, err)
		return
	}
	defer campaignRows.Close()

	campaignIDs := make([]string, 0)
	for campaignRows.Next() {
		campaign, err := database.ScanCampaign(campaignRows.Scan)
		if err != nil {
			log.Printf("Error parsing campaign: %v", err)
			continue
		}
		campaignIDs = append(campaignIDs, campaign.ID)
		stats.TotalCampaigns++
		stats.TotalGoal += campaign.Goal
		stats.TotalRaised += campaign.Raised
		stats.TotalViews += campaign.Views
		stats.SocialShares += campaign.Shares
		if campaign.Completed {
			stats.CompletedCampaigns++
		} else if campaign.Status == "Active" && campaign.Deadline.After(now) {
			stats.ActiveCampaigns++
		}
	}
	if err := campaignRows.Err(); err != nil {
		log.Printf("Campaign row iteration error: %v", err)
	}

	if err := statsDB.QueryRowContext(r.Context(), `
SELECT COUNT(*), COALESCE(AVG(amount) FILTER (WHERE status = 'completed'), 0)
FROM donations
WHERE donor_id = $1`, userID).Scan(&stats.TotalDonations, &stats.AvgDonation); err != nil {
		log.Printf("Error fetching donation stats: %v", err)
	}

	if len(campaignIDs) > 0 {
		if err := statsDB.QueryRowContext(r.Context(), `
SELECT COUNT(DISTINCT CASE WHEN donor_id <> '' THEN donor_id ELSE donor_email END)
FROM donations
WHERE campaign_id = ANY($1) AND status = 'completed'`, pq.Array(campaignIDs)).Scan(&stats.TotalDonors); err != nil {
			log.Printf("Error fetching donor stats: %v", err)
		}
	}

	if stats.TotalViews > 0 {
		stats.ConversionRate = (float64(stats.TotalDonors) / float64(stats.TotalViews)) * 100
	}
	stats.MonthlyGrowth = 0

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stats)
}
