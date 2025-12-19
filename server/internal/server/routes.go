package server

import (
	"encoding/json"
	"net/http"
	"os"
	"server/analytics"
	"server/auth"
	"server/campaign"
	"server/donation"
	"server/onboarding"
	"server/paystack"
	"server/user"
	"server/withdrawal"

	"cloud.google.com/go/firestore"
)

// InitRoutes initializes routes with Firestore client
func InitRoutes(client *firestore.Client) {

	// Initialize handlers with Firestore client
	auth.InitAuthHandlers(client) // Initialize auth handlers with Firestore
	campaign.InitCampaignHandlers(client)
	donation.InitDonationHandlers(client)
	user.InitStatsHandler(client)
	user.InitProfileHandlers(client)
	withdrawal.InitWithdrawalHandlers(client)
	onboarding.InitOnboarding(client)
	paystack.InitWebhook(client)
	analytics.InitAnalytics(client)
}

func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	// Get allowed origins from environment or use default
	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}

	// CORS middleware wrapper
	withCORS := func(h http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
			w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type")
			w.Header().Set("Access-Control-Allow-Credentials", "true")

			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}

			h(w, r)
		}
	}

	// Public routes
	mux.HandleFunc("/", s.HelloWorldHandler)
	mux.HandleFunc("/api/health", s.HealthHandler)

	// Auth routes
	mux.HandleFunc("/api/auth/signup", withCORS(auth.CreateUserHandler))
	mux.HandleFunc("/api/auth/custom-token", withCORS(auth.CustomTokenHandler))
	mux.HandleFunc("/api/auth/verify-token", withCORS(auth.VerifyTokenHandler))
	mux.HandleFunc("/api/auth/user", withCORS(auth.SocialUserHandler))
	mux.HandleFunc("/api/auth/user/link", withCORS(auth.VerifyTokenMiddleware(auth.LinkAccountHandler)))
	mux.HandleFunc("/api/auth/user/unlink", withCORS(auth.VerifyTokenMiddleware(auth.UnlinkAccountHandler)))

	// Analytics routes
	mux.HandleFunc("/api/analytics/social-login", withCORS(analytics.SocialLoginAnalyticsHandler))
	mux.HandleFunc("/api/analytics/social-login/stats", withCORS(auth.VerifyTokenMiddleware(analytics.GetSocialLoginStatsHandler)))

	// User routes (protected)
	mux.HandleFunc("/api/user/stats", withCORS(auth.VerifyTokenMiddleware(user.GetUserStatsHandler)))
	mux.HandleFunc("/api/user/profile", withCORS(auth.VerifyTokenMiddleware(user.GetProfile)))
	mux.HandleFunc("/api/user/profile/update", withCORS(auth.VerifyTokenMiddleware(user.UpdateProfile)))

	// Onboarding routes (protected)
	mux.HandleFunc("/api/onboarding/status", withCORS(auth.VerifyTokenMiddleware(onboarding.GetOnboardingStatus)))
	mux.HandleFunc("/api/onboarding/submit", withCORS(auth.VerifyTokenMiddleware(onboarding.SubmitOnboarding)))
	mux.HandleFunc("/api/onboarding/skip", withCORS(auth.VerifyTokenMiddleware(onboarding.SkipOnboarding)))

	// Paystack webhook (public, but signature verified)
	mux.HandleFunc("/api/webhooks/paystack", withCORS(paystack.WebhookHandler))

	// Campaign routes
	// Public routes
	mux.HandleFunc("/api/campaigns", withCORS(campaign.ListCampaigns))
	mux.HandleFunc("/api/campaign", withCORS(campaign.GetCampaign))

	// Protected routes
	mux.HandleFunc("/api/campaign/create", withCORS(auth.VerifyTokenMiddleware(campaign.CreateCampaign)))
	mux.HandleFunc("/api/campaign/update", withCORS(auth.VerifyTokenMiddleware(campaign.UpdateCampaign)))
	mux.HandleFunc("/api/campaign/delete", withCORS(auth.VerifyTokenMiddleware(campaign.DeleteCampaign)))

	// Donation routes
	// Public route (for anonymous donations)
	mux.HandleFunc("/api/donation/create", withCORS(donation.CreateDonation))
	mux.HandleFunc("/api/donations", withCORS(donation.GetDonations))
	mux.HandleFunc("/api/donation", withCORS(donation.GetDonation))

	// Withdrawal routes (protected)
	mux.HandleFunc("/api/withdrawal/create", withCORS(auth.VerifyTokenMiddleware(withdrawal.CreateWithdrawal)))
	mux.HandleFunc("/api/withdrawals", withCORS(auth.VerifyTokenMiddleware(withdrawal.GetWithdrawals)))

	// Legacy/secure route
	mux.HandleFunc("/api/secure/data", withCORS(auth.VerifyTokenMiddleware(auth.SecuredData)))

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := make(map[string]string)
	resp["message"] = "Crowdfunding API Server"
	resp["version"] = "1.0.0"
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}

func (s *Server) HealthHandler(w http.ResponseWriter, r *http.Request) {
	resp := map[string]interface{}{
		"status":  "healthy",
		"service": "crowdfunding-api",
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(resp)
}
