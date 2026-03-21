package database

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"strings"
	"time"

	"server/models"

	"github.com/lib/pq"
)

var db *sql.DB

func BuildConnectionString() string {
	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL != "" {
		return databaseURL
	}

	host := envOrDefault("PGHOST", "localhost")
	port := envOrDefault("PGPORT", "5432")
	user := envOrDefault("PGUSER", "postgres")
	password := os.Getenv("PGPASSWORD")
	name := envOrDefault("PGDATABASE", "crowdfunding")
	sslMode := envOrDefault("PGSSLMODE", "disable")
	return fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=%s", user, password, host, port, name, sslMode)
}

func Init() error {
	if db != nil {
		return nil
	}

	databaseURL := BuildConnectionString()

	conn, err := sql.Open("postgres", databaseURL)
	if err != nil {
		return fmt.Errorf("open postgres connection: %w", err)
	}

	conn.SetMaxOpenConns(25)
	conn.SetMaxIdleConns(25)
	conn.SetConnMaxLifetime(30 * time.Minute)

	if err := conn.Ping(); err != nil {
		return fmt.Errorf("ping postgres: %w", err)
	}

	if err := ensureSchema(conn); err != nil {
		return fmt.Errorf("ensure postgres schema: %w", err)
	}

	db = conn
	return nil
}

func GetDB() (*sql.DB, error) {
	if db == nil {
		if err := Init(); err != nil {
			return nil, err
		}
	}
	return db, nil
}

func envOrDefault(key, fallback string) string {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	return value
}

func ensureSchema(conn *sql.DB) error {
	const schema = `
CREATE TABLE IF NOT EXISTS users (
    uid TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    display_name TEXT NOT NULL DEFAULT '',
    first_name TEXT NOT NULL DEFAULT '',
    last_name TEXT NOT NULL DEFAULT '',
    photo_url TEXT NOT NULL DEFAULT '',
    bio TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    auth_providers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    last_login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_login_provider TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS campaigns (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    story TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL DEFAULT '',
    goal DOUBLE PRECISION NOT NULL DEFAULT 0,
    raised DOUBLE PRECISION NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'USD',
    cover_image TEXT NOT NULL DEFAULT '',
    additional_images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    video_url TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'Draft',
    country TEXT NOT NULL DEFAULT '',
    postcode TEXT NOT NULL DEFAULT '',
    who_for TEXT NOT NULL DEFAULT '',
    beneficiary_relation TEXT NOT NULL DEFAULT '',
    duration INTEGER NOT NULL DEFAULT 0,
    deadline TIMESTAMPTZ NOT NULL,
    urgency TEXT NOT NULL DEFAULT '',
    flexible_goal BOOLEAN NOT NULL DEFAULT FALSE,
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    updates TEXT NOT NULL DEFAULT '',
    donors INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    shares INTEGER NOT NULL DEFAULT 0,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    organizer_name TEXT NOT NULL DEFAULT '',
    organizer_email TEXT NOT NULL DEFAULT '',
    organizer_phone TEXT NOT NULL DEFAULT '',
    organizer_bio TEXT NOT NULL DEFAULT '',
    location TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS idx_campaigns_owner_id ON campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status_created_at ON campaigns(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);

CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    donor_id TEXT NOT NULL DEFAULT '',
    donor_name TEXT NOT NULL DEFAULT '',
    donor_email TEXT NOT NULL DEFAULT '',
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    platform_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
    processing_fee DOUBLE PRECISION NOT NULL DEFAULT 0,
    net_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    fee DOUBLE PRECISION NOT NULL DEFAULT 0,
    tip DOUBLE PRECISION NOT NULL DEFAULT 0,
    total_paid DOUBLE PRECISION NOT NULL DEFAULT 0,
    is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
    message TEXT NOT NULL DEFAULT '',
    payment_method TEXT NOT NULL DEFAULT '',
    transaction_id TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id_created_at ON donations(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id_created_at ON donations(donor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);

CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    campaign_id TEXT NOT NULL,
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    fee DOUBLE PRECISION NOT NULL DEFAULT 0,
    net_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    method TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    account_details JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    processed_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_campaign_id_created_at ON withdrawals(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id_created_at ON withdrawals(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS onboarding (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending',
    national_id_number TEXT NOT NULL DEFAULT '',
    bvn TEXT NOT NULL DEFAULT '',
    tin TEXT NOT NULL DEFAULT '',
    virtual_account_id TEXT NOT NULL DEFAULT '',
    virtual_account_number TEXT NOT NULL DEFAULT '',
    virtual_account_name TEXT NOT NULL DEFAULT '',
    virtual_account_bank TEXT NOT NULL DEFAULT '',
    paystack_customer_code TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ NULL
);
CREATE INDEX IF NOT EXISTS idx_onboarding_customer_code ON onboarding(paystack_customer_code);

CREATE TABLE IF NOT EXISTS social_login_analytics (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL DEFAULT '',
    provider TEXT NOT NULL,
    action TEXT NOT NULL,
    success BOOLEAN NOT NULL DEFAULT FALSE,
    error_code TEXT NOT NULL DEFAULT '',
    error_message TEXT NOT NULL DEFAULT '',
    ip_address TEXT NOT NULL DEFAULT '',
    user_agent TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_social_login_created_at ON social_login_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_login_provider_action ON social_login_analytics(provider, action);

CREATE TABLE IF NOT EXISTS audit_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT '',
    entity_id TEXT NOT NULL DEFAULT '',
    request_id TEXT NOT NULL DEFAULT '',
    amount DOUBLE PRECISION NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT '',
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_events_created_at ON audit_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_events_event_type ON audit_events(event_type);

CREATE TABLE IF NOT EXISTS campaign_updates (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_campaign_updates_campaign_id ON campaign_updates(campaign_id, created_at DESC);
`

	_, err := conn.Exec(schema)
	return err
}

func ScanCampaign(scan func(dest ...any) error) (models.Campaign, error) {
	var campaign models.Campaign
	var additionalImages []string
	var tags []string
	err := scan(
		&campaign.ID,
		&campaign.OwnerID,
		&campaign.Title,
		&campaign.Description,
		&campaign.Story,
		&campaign.Category,
		&campaign.Goal,
		&campaign.Raised,
		&campaign.Currency,
		&campaign.CoverImage,
		pq.Array(&additionalImages),
		&campaign.VideoURL,
		&campaign.Status,
		&campaign.Country,
		&campaign.Postcode,
		&campaign.WhoFor,
		&campaign.BeneficiaryRelation,
		&campaign.Duration,
		&campaign.Deadline,
		&campaign.Urgency,
		&campaign.FlexibleGoal,
		pq.Array(&tags),
		&campaign.Updates,
		&campaign.Donors,
		&campaign.Views,
		&campaign.Shares,
		&campaign.Completed,
		&campaign.CreatedAt,
		&campaign.UpdatedAt,
		&campaign.OrganizerName,
		&campaign.OrganizerEmail,
		&campaign.OrganizerPhone,
		&campaign.OrganizerBio,
		&campaign.Location,
	)
	if err != nil {
		return models.Campaign{}, err
	}
	campaign.AdditionalImages = additionalImages
	campaign.Tags = tags
	return campaign, nil
}

func ScanDonation(scan func(dest ...any) error) (models.Donation, error) {
	var donation models.Donation
	err := scan(
		&donation.ID,
		&donation.CampaignID,
		&donation.DonorID,
		&donation.DonorName,
		&donation.DonorEmail,
		&donation.Amount,
		&donation.PlatformFee,
		&donation.ProcessingFee,
		&donation.NetAmount,
		&donation.Fee,
		&donation.Tip,
		&donation.TotalPaid,
		&donation.IsAnonymous,
		&donation.Message,
		&donation.PaymentMethod,
		&donation.TransactionID,
		&donation.Status,
		&donation.CreatedAt,
	)
	if err != nil {
		return models.Donation{}, err
	}
	return donation, nil
}

func ScanUserProfile(scan func(dest ...any) error) (models.UserProfile, error) {
	var profile models.UserProfile
	var authProviders []string
	err := scan(
		&profile.UID,
		&profile.Email,
		&profile.DisplayName,
		&profile.FirstName,
		&profile.LastName,
		&profile.PhotoURL,
		&profile.Bio,
		&profile.Location,
		&profile.Phone,
		&profile.Website,
		&profile.EmailVerified,
		pq.Array(&authProviders),
		&profile.LastLoginAt,
		&profile.LastLoginProvider,
		&profile.CreatedAt,
		&profile.UpdatedAt,
	)
	if err != nil {
		return models.UserProfile{}, err
	}
	profile.AuthProviders = authProviders
	return profile, nil
}

func ScanWithdrawal(scan func(dest ...any) error) (models.Withdrawal, error) {
	var withdrawal models.Withdrawal
	var accountDetails []byte
	var processedAt sql.NullTime
	err := scan(
		&withdrawal.ID,
		&withdrawal.UserID,
		&withdrawal.CampaignID,
		&withdrawal.Amount,
		&withdrawal.Fee,
		&withdrawal.NetAmount,
		&withdrawal.Method,
		&withdrawal.Status,
		&accountDetails,
		&withdrawal.CreatedAt,
		&processedAt,
	)
	if err != nil {
		return models.Withdrawal{}, err
	}
	withdrawal.AccountDetails = map[string]any{}
	if len(accountDetails) > 0 {
		if err := json.Unmarshal(accountDetails, &withdrawal.AccountDetails); err != nil {
			return models.Withdrawal{}, err
		}
	}
	if processedAt.Valid {
		withdrawal.ProcessedAt = &processedAt.Time
	}
	return withdrawal, nil
}

func ScanOnboarding(scan func(dest ...any) error) (models.Onboarding, error) {
	var onboarding models.Onboarding
	var completedAt sql.NullTime
	err := scan(
		&onboarding.ID,
		&onboarding.UserID,
		&onboarding.Status,
		&onboarding.NationalIDNumber,
		&onboarding.BVN,
		&onboarding.TIN,
		&onboarding.VirtualAccountID,
		&onboarding.VirtualAccountNumber,
		&onboarding.VirtualAccountName,
		&onboarding.VirtualAccountBank,
		&onboarding.PaystackCustomerCode,
		&onboarding.CreatedAt,
		&onboarding.UpdatedAt,
		&completedAt,
	)
	if err != nil {
		return models.Onboarding{}, err
	}
	if completedAt.Valid {
		onboarding.CompletedAt = &completedAt.Time
	}
	return onboarding, nil
}

func ScanSocialLoginAnalytics(scan func(dest ...any) error) (models.SocialLoginAnalytics, error) {
	var analytics models.SocialLoginAnalytics
	err := scan(
		&analytics.ID,
		&analytics.UserID,
		&analytics.Provider,
		&analytics.Action,
		&analytics.Success,
		&analytics.ErrorCode,
		&analytics.ErrorMessage,
		&analytics.IPAddress,
		&analytics.UserAgent,
		&analytics.CreatedAt,
	)
	if err != nil {
		return models.SocialLoginAnalytics{}, err
	}
	return analytics, nil
}

func ToJSON(value any) ([]byte, error) {
	if value == nil {
		return []byte("{}"), nil
	}
	return json.Marshal(value)
}
