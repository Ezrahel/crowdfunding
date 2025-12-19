package models

import (
	"time"
)

// Campaign represents a fundraising campaign
type Campaign struct {
	ID                  string    `json:"id" firestore:"id"`
	OwnerID             string    `json:"owner_id" firestore:"owner_id"`
	Title               string    `json:"title" firestore:"title"`
	Description         string    `json:"description" firestore:"description"`
	Story               string    `json:"story" firestore:"story"`
	Category            string    `json:"category" firestore:"category"`
	Goal                float64   `json:"goal" firestore:"goal"`
	Raised              float64   `json:"raised" firestore:"raised"`
	Currency            string    `json:"currency" firestore:"currency"`
	CoverImage          string    `json:"cover_image" firestore:"cover_image"`
	AdditionalImages    []string  `json:"additional_images" firestore:"additional_images"`
	VideoURL            string    `json:"video_url" firestore:"video_url"`
	Status              string    `json:"status" firestore:"status"` // Draft, Active, Completed, Cancelled
	Country             string    `json:"country" firestore:"country"`
	Postcode            string    `json:"postcode" firestore:"postcode"`
	WhoFor              string    `json:"who_for" firestore:"who_for"`
	BeneficiaryRelation string    `json:"beneficiary_relation" firestore:"beneficiary_relation"`
	Duration            int       `json:"duration" firestore:"duration"` // days
	Deadline            time.Time `json:"deadline" firestore:"deadline"`
	Urgency             string    `json:"urgency" firestore:"urgency"`
	FlexibleGoal        bool      `json:"flexible_goal" firestore:"flexible_goal"`
	Tags                []string  `json:"tags" firestore:"tags"`
	Updates             string    `json:"updates" firestore:"updates"`
	Donors              int       `json:"donors" firestore:"donors"`
	Views               int       `json:"views" firestore:"views"`
	Shares              int       `json:"shares" firestore:"shares"`
	Completed           bool      `json:"completed" firestore:"completed"`
	CreatedAt           time.Time `json:"created_at" firestore:"created_at"`
	UpdatedAt           time.Time `json:"updated_at" firestore:"updated_at"`
	OrganizerName       string    `json:"organizer_name" firestore:"organizer_name"`
	OrganizerEmail      string    `json:"organizer_email" firestore:"organizer_email"`
	OrganizerPhone      string    `json:"organizer_phone" firestore:"organizer_phone"`
	OrganizerBio        string    `json:"organizer_bio" firestore:"organizer_bio"`
	Location            string    `json:"location" firestore:"location"`
}

// Donation represents a donation to a campaign
type Donation struct {
	ID            string    `json:"id" firestore:"id"`
	CampaignID    string    `json:"campaign_id" firestore:"campaign_id"`
	DonorID       string    `json:"donor_id" firestore:"donor_id"`
	DonorName     string    `json:"donor_name" firestore:"donor_name"`
	DonorEmail    string    `json:"donor_email" firestore:"donor_email"`
	Amount        float64   `json:"amount" firestore:"amount"`                 // Donation amount before fees
	PlatformFee   float64   `json:"platform_fee" firestore:"platform_fee"`     // 5% platform fee
	ProcessingFee float64   `json:"processing_fee" firestore:"processing_fee"` // 2.9% + $0.30 (if covered)
	NetAmount     float64   `json:"net_amount" firestore:"net_amount"`         // Amount that goes to campaign (Amount - PlatformFee)
	Fee           float64   `json:"fee" firestore:"fee"`                       // Total fees (platform + processing, deprecated but kept for compatibility)
	Tip           float64   `json:"tip" firestore:"tip"`
	TotalPaid     float64   `json:"total_paid" firestore:"total_paid"` // Total amount paid by donor
	IsAnonymous   bool      `json:"is_anonymous" firestore:"is_anonymous"`
	Message       string    `json:"message" firestore:"message"`
	PaymentMethod string    `json:"payment_method" firestore:"payment_method"`
	TransactionID string    `json:"transaction_id" firestore:"transaction_id"`
	Status        string    `json:"status" firestore:"status"` // pending, completed, failed, refunded
	CreatedAt     time.Time `json:"created_at" firestore:"created_at"`
}

// UserStats represents user statistics for dashboard
type UserStats struct {
	TotalCampaigns     int     `json:"total_campaigns"`
	ActiveCampaigns    int     `json:"active_campaigns"`
	CompletedCampaigns int     `json:"completed_campaigns"`
	TotalRaised        float64 `json:"total_raised"`
	TotalGoal          float64 `json:"total_goal"`
	TotalDonations     int     `json:"total_donations"`
	TotalDonors        int     `json:"total_donors"`
	AvgDonation        float64 `json:"avg_donation"`
	ConversionRate     float64 `json:"conversion_rate"`
	MonthlyGrowth      float64 `json:"monthly_growth"`
	TotalViews         int     `json:"total_views"`
	SocialShares       int     `json:"social_shares"`
}

// UserProfile represents user profile information
type UserProfile struct {
	UID               string    `json:"uid" firestore:"uid"`
	Email             string    `json:"email" firestore:"email"`
	DisplayName       string    `json:"display_name" firestore:"display_name"`
	FirstName         string    `json:"first_name" firestore:"first_name"`
	LastName          string    `json:"last_name" firestore:"last_name"`
	PhotoURL          string    `json:"photo_url" firestore:"photo_url"`
	Bio               string    `json:"bio" firestore:"bio"`
	Location          string    `json:"location" firestore:"location"`
	Phone             string    `json:"phone" firestore:"phone"`
	Website           string    `json:"website" firestore:"website"`
	EmailVerified     bool      `json:"email_verified" firestore:"email_verified"`
	AuthProviders     []string  `json:"auth_providers" firestore:"auth_providers"` // List of linked providers: ["google", "facebook", "apple", "email"]
	LastLoginAt       time.Time `json:"last_login_at" firestore:"last_login_at"`
	LastLoginProvider string    `json:"last_login_provider" firestore:"last_login_provider"`
	CreatedAt         time.Time `json:"created_at" firestore:"created_at"`
	UpdatedAt         time.Time `json:"updated_at" firestore:"updated_at"`
}

// SocialLoginAnalytics represents analytics data for social logins
type SocialLoginAnalytics struct {
	ID           string    `json:"id" firestore:"id"`
	UserID       string    `json:"user_id" firestore:"user_id"`
	Provider     string    `json:"provider" firestore:"provider"` // google, facebook, apple
	Action       string    `json:"action" firestore:"action"`     // sign_in, sign_up, link_account
	Success      bool      `json:"success" firestore:"success"`
	ErrorCode    string    `json:"error_code" firestore:"error_code,omitempty"`
	ErrorMessage string    `json:"error_message" firestore:"error_message,omitempty"`
	IPAddress    string    `json:"ip_address" firestore:"ip_address,omitempty"`
	UserAgent    string    `json:"user_agent" firestore:"user_agent,omitempty"`
	CreatedAt    time.Time `json:"created_at" firestore:"created_at"`
}

// Withdrawal represents a withdrawal request
type Withdrawal struct {
	ID             string                 `json:"id" firestore:"id"`
	UserID         string                 `json:"user_id" firestore:"user_id"`
	CampaignID     string                 `json:"campaign_id" firestore:"campaign_id"`
	Amount         float64                `json:"amount" firestore:"amount"`
	Fee            float64                `json:"fee" firestore:"fee"`
	NetAmount      float64                `json:"net_amount" firestore:"net_amount"`
	Method         string                 `json:"method" firestore:"method"` // bank, paypal, debit_card
	Status         string                 `json:"status" firestore:"status"` // pending, processing, completed, failed
	AccountDetails map[string]interface{} `json:"account_details" firestore:"account_details"`
	CreatedAt      time.Time              `json:"created_at" firestore:"created_at"`
	ProcessedAt    *time.Time             `json:"processed_at" firestore:"processed_at,omitempty"`
}

// CampaignUpdate represents an update posted to a campaign
type CampaignUpdate struct {
	ID         string    `json:"id" firestore:"id"`
	CampaignID string    `json:"campaign_id" firestore:"campaign_id"`
	Title      string    `json:"title" firestore:"title"`
	Content    string    `json:"content" firestore:"content"`
	Images     []string  `json:"images" firestore:"images"`
	CreatedAt  time.Time `json:"created_at" firestore:"created_at"`
}
