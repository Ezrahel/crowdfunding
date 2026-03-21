# Server

Go API for the crowdfunding platform. The backend now uses:
- Firebase Authentication for identity verification
- PostgreSQL for application data
- River for PostgreSQL-backed background jobs

## Core Services

The API starts three backend subsystems:
- Firebase Auth client
- PostgreSQL connection plus automatic schema bootstrap
- River client plus workers for asynchronous jobs

Current background job types:
- `social_login_analytics`
- `financial_audit`

River stores jobs in PostgreSQL, so there is no separate Kafka or broker dependency anymore.

## Environment

Use [`.env.example`](/home/ditech/Documents/crowdfunding/server/.env.example) as the base configuration.

Important variables:
- `DATABASE_URL` or the `PG*` variables for PostgreSQL
- `RIVER_MAX_ATTEMPTS` for retry/discard behavior
- `RIVER_QUEUE_MAX_WORKERS` for in-process worker concurrency

## Local Development

Start PostgreSQL locally with Docker Compose:

```bash
docker compose -f server/docker-compose.local.yml up -d
```

Recommended local worker settings:

```bash
RIVER_MAX_ATTEMPTS=3
RIVER_QUEUE_MAX_WORKERS=10
```

## Queue Behavior

The background job layer provides:
- PostgreSQL-backed job persistence through River
- Automatic River schema migrations at startup
- In-process workers with configurable concurrency
- Built-in retry handling based on `RIVER_MAX_ATTEMPTS`
- A simpler single-database operational model

Unlike Kafka, River does not require a separate broker, topic, or dead-letter topic for this project. Jobs are inserted into PostgreSQL and worked from there.

## Running the API

Build the application:

```bash
make build
```

Run the application:

```bash
make run
```

Live reload the application:

```bash
make watch
```

Run the test suite:

```bash
make test
```

Validate the local River/PostgreSQL runtime stack:

```bash
./scripts/validate-river-runtime.sh
```
