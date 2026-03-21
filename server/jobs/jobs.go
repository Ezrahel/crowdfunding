package jobs

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"
	"time"

	"server/database"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/riverqueue/river"
	"github.com/riverqueue/river/riverdriver/riverpgxv5"
	"github.com/riverqueue/river/rivermigrate"
)

const (
	JobTypeSocialLoginAnalytics = "social_login_analytics"
	JobTypeFinancialAudit       = "financial_audit"
)

type SocialLoginAnalyticsPayload struct {
	UserID       string    `json:"user_id"`
	Provider     string    `json:"provider"`
	Action       string    `json:"action"`
	Success      bool      `json:"success"`
	ErrorCode    string    `json:"error_code,omitempty"`
	ErrorMessage string    `json:"error_message,omitempty"`
	IPAddress    string    `json:"ip_address,omitempty"`
	UserAgent    string    `json:"user_agent,omitempty"`
	Timestamp    time.Time `json:"timestamp"`
	RequestID    string    `json:"request_id,omitempty"`
}

func (SocialLoginAnalyticsPayload) Kind() string { return JobTypeSocialLoginAnalytics }

type FinancialAuditPayload struct {
	Operation string                 `json:"operation"`
	UserID    string                 `json:"user_id"`
	EntityID  string                 `json:"entity_id"`
	RequestID string                 `json:"request_id"`
	Amount    float64                `json:"amount"`
	Currency  string                 `json:"currency"`
	Metadata  map[string]interface{} `json:"metadata,omitempty"`
}

func (FinancialAuditPayload) Kind() string { return JobTypeFinancialAudit }

type socialLoginAnalyticsWorker struct {
	river.WorkerDefaults[SocialLoginAnalyticsPayload]
}

type financialAuditWorker struct {
	river.WorkerDefaults[FinancialAuditPayload]
}

type manager struct {
	db          *sql.DB
	pgxPool     *pgxpool.Pool
	client      *river.Client[pgx.Tx]
	maxAttempts int
	maxWorkers  int
}

var global *manager

func Init(db *sql.DB) error {
	if global != nil {
		if global.db == nil && db != nil {
			global.db = db
		}
		return nil
	}

	if db == nil {
		var err error
		db, err = database.GetDB()
		if err != nil {
			return err
		}
	}

	databaseURL := strings.TrimSpace(os.Getenv("DATABASE_URL"))
	if databaseURL == "" {
		databaseURL = database.BuildConnectionString()
	}

	pgxPool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		return fmt.Errorf("create river pgx pool: %w", err)
	}

	driver := riverpgxv5.New(pgxPool)
	migrator, err := rivermigrate.New(driver, nil)
	if err != nil {
		pgxPool.Close()
		return fmt.Errorf("create river migrator: %w", err)
	}
	if _, err := migrator.Migrate(context.Background(), rivermigrate.DirectionUp, nil); err != nil {
		pgxPool.Close()
		return fmt.Errorf("migrate river schema: %w", err)
	}

	workers := river.NewWorkers()
	river.AddWorker(workers, &socialLoginAnalyticsWorker{})
	river.AddWorker(workers, &financialAuditWorker{})

	client, err := river.NewClient(driver, &river.Config{
		Queues: map[string]river.QueueConfig{
			river.QueueDefault: {MaxWorkers: envInt("RIVER_QUEUE_MAX_WORKERS", 10)},
		},
		Workers:     workers,
		MaxAttempts: envInt("RIVER_MAX_ATTEMPTS", 3),
	})
	if err != nil {
		pgxPool.Close()
		return fmt.Errorf("create river client: %w", err)
	}

	global = &manager{
		db:          db,
		pgxPool:     pgxPool,
		client:      client,
		maxAttempts: envInt("RIVER_MAX_ATTEMPTS", 3),
		maxWorkers:  envInt("RIVER_QUEUE_MAX_WORKERS", 10),
	}
	log.Printf("[RIVER] initialized; queue=default max_workers=%d max_attempts=%d", global.maxWorkers, global.maxAttempts)
	return nil
}

func Start() {
	if global == nil || global.client == nil {
		return
	}
	if err := global.client.Start(context.Background()); err != nil {
		log.Fatalf("failed to start River client: %v", err)
	}
}

func Shutdown(ctx context.Context) error {
	if global == nil {
		return nil
	}
	var stopErr error
	if global.client != nil {
		stopErr = global.client.Stop(ctx)
	}
	if global.pgxPool != nil {
		global.pgxPool.Close()
	}
	return stopErr
}

func Mode() string {
	return "river"
}

func EnqueueSocialLoginAnalytics(ctx context.Context, payload SocialLoginAnalyticsPayload, requestID string) error {
	if global == nil {
		if err := Init(nil); err != nil {
			return err
		}
	}
	payload.RequestID = requestID
	_, err := global.client.Insert(ctx, payload, nil)
	return err
}

func EnqueueFinancialAudit(ctx context.Context, payload FinancialAuditPayload) error {
	if global == nil {
		if err := Init(nil); err != nil {
			return err
		}
	}
	_, err := global.client.Insert(ctx, payload, nil)
	return err
}

func (w *socialLoginAnalyticsWorker) Work(ctx context.Context, job *river.Job[SocialLoginAnalyticsPayload]) error {
	db, err := getDB()
	if err != nil {
		return err
	}

	payload := job.Args
	if payload.Timestamp.IsZero() {
		payload.Timestamp = time.Now().UTC()
	}

	_, err = db.ExecContext(ctx, `
INSERT INTO social_login_analytics (
    id, user_id, provider, action, success, error_code, error_message, ip_address, user_agent, created_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
		uuid.NewString(),
		payload.UserID,
		payload.Provider,
		payload.Action,
		payload.Success,
		payload.ErrorCode,
		payload.ErrorMessage,
		payload.IPAddress,
		payload.UserAgent,
		payload.Timestamp,
	)
	if err != nil {
		return fmt.Errorf("insert social login analytics: %w", err)
	}
	return nil
}

func (w *financialAuditWorker) Work(ctx context.Context, job *river.Job[FinancialAuditPayload]) error {
	db, err := getDB()
	if err != nil {
		return err
	}

	metadata, err := json.Marshal(job.Args.Metadata)
	if err != nil {
		return fmt.Errorf("marshal financial audit metadata: %w", err)
	}
	if len(metadata) == 0 {
		metadata = []byte("{}")
	}

	_, err = db.ExecContext(ctx, `
INSERT INTO audit_events (
    id, event_type, user_id, entity_id, request_id, amount, currency, metadata, created_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9)`,
		uuid.NewString(),
		job.Args.Operation,
		job.Args.UserID,
		job.Args.EntityID,
		job.Args.RequestID,
		job.Args.Amount,
		job.Args.Currency,
		string(metadata),
		time.Now().UTC(),
	)
	if err != nil {
		return fmt.Errorf("insert audit event: %w", err)
	}

	log.Printf("[AUDIT] [%s] %s | User: %s | Entity: %s | Amount: %.2f %s",
		job.Args.RequestID, job.Args.Operation, job.Args.UserID, job.Args.EntityID, job.Args.Amount, job.Args.Currency)
	return nil
}

func envInt(key string, fallback int) int {
	value := strings.TrimSpace(os.Getenv(key))
	if value == "" {
		return fallback
	}
	var parsed int
	if _, err := fmt.Sscanf(value, "%d", &parsed); err != nil || parsed <= 0 {
		return fallback
	}
	return parsed
}

func getDB() (*sql.DB, error) {
	if global != nil && global.db != nil {
		return global.db, nil
	}
	return database.GetDB()
}
