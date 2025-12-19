package user

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"server/models"
	"server/utils"

	"cloud.google.com/go/firestore"
)

var firestoreClient *firestore.Client

// InitStatsHandler initializes the stats handler with Firestore client
func InitStatsHandler(client *firestore.Client) {
	firestoreClient = client
}

// GetUserStatsHandler returns user statistics for the dashboard
func GetUserStatsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		utils.WriteError(w, http.StatusMethodNotAllowed, "Method not allowed", "METHOD_NOT_ALLOWED")
		return
	}

	if firestoreClient == nil {
		utils.WriteInternalError(w, fmt.Errorf("firestore client not initialized"))
		return
	}

	// Get user ID from context (set by auth middleware)
	uidVal := r.Context().Value("auth_uid")
	userID, ok := uidVal.(string)
	if !ok || userID == "" {
		utils.WriteUnauthorized(w, "Authentication required")
		return
	}

	ctx := r.Context()
	stats := models.UserStats{}

	// Get all campaigns for this user (with limit to prevent memory issues)
	campaignsQuery := firestoreClient.Collection("campaigns").Where("owner_id", "==", userID).Limit(1000)
	campaignsSnapshot, err := campaignsQuery.Documents(ctx).GetAll()
	if err != nil {
		log.Printf("Error fetching campaigns: %v", err)
		utils.WriteInternalError(w, err)
		return
	}

	stats.TotalCampaigns = len(campaignsSnapshot)
	now := time.Now()

	for _, doc := range campaignsSnapshot {
		var campaign models.Campaign
		if err := doc.DataTo(&campaign); err != nil {
			log.Printf("Error parsing campaign: %v", err)
			continue
		}

		stats.TotalGoal += campaign.Goal
		stats.TotalRaised += campaign.Raised
		stats.TotalViews += campaign.Views
		stats.SocialShares += campaign.Shares

		// Check campaign status
		if campaign.Completed {
			stats.CompletedCampaigns++
		} else if campaign.Status == "Active" && campaign.Deadline.After(now) {
			stats.ActiveCampaigns++
		}
	}

	// Get all donations made by this user (with limit)
	donationsQuery := firestoreClient.Collection("donations").
		Where("donor_id", "==", userID).
		Limit(10000) // Reasonable limit
	donationsSnapshot, err := donationsQuery.Documents(ctx).GetAll()
	if err != nil {
		log.Printf("Error fetching donations: %v", err)
		// Continue with partial stats
	} else {
		stats.TotalDonations = len(donationsSnapshot)
		totalDonationAmount := 0.0
		completedCount := 0
		for _, doc := range donationsSnapshot {
			var donation models.Donation
			if err := doc.DataTo(&donation); err != nil {
				continue
			}
			if donation.Status == "completed" {
				totalDonationAmount += donation.Amount
				completedCount++
			}
		}
		if completedCount > 0 {
			stats.AvgDonation = totalDonationAmount / float64(completedCount)
		}
	}

	// Get unique donors across all user's campaigns (optimized batch query)
	donorsMap := make(map[string]bool)
	campaignIDs := make([]string, 0, len(campaignsSnapshot))

	for _, doc := range campaignsSnapshot {
		var campaign models.Campaign
		if err := doc.DataTo(&campaign); err != nil {
			continue
		}
		campaignIDs = append(campaignIDs, campaign.ID)
	}

	// Batch query donations (Firestore IN supports up to 10 items per query)
	// Split into chunks of 10 to avoid query limits
	for i := 0; i < len(campaignIDs); i += 10 {
		end := i + 10
		if end > len(campaignIDs) {
			end = len(campaignIDs)
		}
		chunk := campaignIDs[i:end]

		// Query donations for this chunk of campaigns
		donationsQuery := firestoreClient.Collection("donations").
			Where("campaign_id", "in", chunk).
			Where("status", "==", "completed")

		donations, err := donationsQuery.Documents(ctx).GetAll()
		if err != nil {
			log.Printf("Error fetching donations for chunk: %v", err)
			continue
		}

		for _, donationDoc := range donations {
			var donation models.Donation
			if err := donationDoc.DataTo(&donation); err != nil {
				continue
			}
			if donation.DonorID != "" {
				donorsMap[donation.DonorID] = true
			}
		}
	}
	stats.TotalDonors = len(donorsMap)

	// Calculate conversion rate (donors / views)
	if stats.TotalViews > 0 {
		stats.ConversionRate = (float64(stats.TotalDonors) / float64(stats.TotalViews)) * 100
	}

	// Calculate monthly growth (simplified - compare this month to last month)
	// This is a placeholder - in production, you'd calculate actual growth
	// Calculate monthly growth: compare current month with previous month
	// For now, set to 0.0 as this requires historical data tracking
	stats.MonthlyGrowth = 0.0

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(stats)
}
