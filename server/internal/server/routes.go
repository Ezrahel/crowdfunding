package server

import (
	"database/sql"
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
)

func InitRoutes(db *sql.DB) {
	auth.InitAuthHandlers(db)
	campaign.InitCampaignHandlers(db)
	donation.InitDonationHandlers(db)
	user.InitStatsHandler(db)
	user.InitProfileHandlers(db)
	withdrawal.InitWithdrawalHandlers(db)
	onboarding.InitOnboarding(db)
	paystack.InitWebhook(db)
	analytics.InitAnalytics(db)
}

func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
	if allowedOrigin == "" {
		allowedOrigin = "http://localhost:3000"
	}

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

	mux.HandleFunc("/", s.HelloWorldHandler)
	mux.HandleFunc("/api/health", s.HealthHandler)

	mux.HandleFunc("/api/auth/signup", withCORS(auth.CreateUserHandler))
	mux.HandleFunc("/api/auth/custom-token", withCORS(auth.CustomTokenHandler))
	mux.HandleFunc("/api/auth/verify-token", withCORS(auth.VerifyTokenHandler))
	mux.HandleFunc("/api/auth/user", withCORS(auth.SocialUserHandler))

	mux.HandleFunc("/api/analytics/social-login", withCORS(analytics.SocialLoginAnalyticsHandler))
	mux.HandleFunc("/api/analytics/social-login/stats", withCORS(auth.VerifyTokenMiddleware(analytics.GetSocialLoginStatsHandler)))

	mux.HandleFunc("/api/user/stats", withCORS(auth.VerifyTokenMiddleware(user.GetUserStatsHandler)))
	mux.HandleFunc("/api/user/profile", withCORS(auth.VerifyTokenMiddleware(user.GetProfile)))
	mux.HandleFunc("/api/user/profile/update", withCORS(auth.VerifyTokenMiddleware(user.UpdateProfile)))

	mux.HandleFunc("/api/onboarding/status", withCORS(auth.VerifyTokenMiddleware(onboarding.GetOnboardingStatus)))
	mux.HandleFunc("/api/onboarding/submit", withCORS(auth.VerifyTokenMiddleware(onboarding.SubmitOnboarding)))
	mux.HandleFunc("/api/onboarding/skip", withCORS(auth.VerifyTokenMiddleware(onboarding.SkipOnboarding)))

	mux.HandleFunc("/api/webhooks/paystack", withCORS(paystack.WebhookHandler))

	mux.HandleFunc("/api/campaigns", withCORS(campaign.ListCampaigns))
	mux.HandleFunc("/api/campaign", withCORS(campaign.GetCampaign))
	mux.HandleFunc("/api/campaign/create", withCORS(auth.VerifyTokenMiddleware(campaign.CreateCampaign)))
	mux.HandleFunc("/api/campaign/update", withCORS(auth.VerifyTokenMiddleware(campaign.UpdateCampaign)))
	mux.HandleFunc("/api/campaign/delete", withCORS(auth.VerifyTokenMiddleware(campaign.DeleteCampaign)))

	mux.HandleFunc("/api/donation/create", withCORS(donation.CreateDonation))
	mux.HandleFunc("/api/donations", withCORS(donation.GetDonations))
	mux.HandleFunc("/api/donation", withCORS(donation.GetDonation))

	mux.HandleFunc("/api/withdrawal/create", withCORS(auth.VerifyTokenMiddleware(withdrawal.CreateWithdrawal)))
	mux.HandleFunc("/api/withdrawals", withCORS(auth.VerifyTokenMiddleware(withdrawal.GetWithdrawals)))

	mux.HandleFunc("/api/secure/data", withCORS(auth.VerifyTokenMiddleware(auth.SecuredData)))

	return mux
}

func (s *Server) HelloWorldHandler(w http.ResponseWriter, r *http.Request) {
	resp := map[string]string{
		"message": "Crowdfunding API Server",
		"version": "1.0.0",
	}
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
