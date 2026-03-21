#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_LOG="${ROOT_DIR}/tmp-river-api.log"
API_PID=""

cleanup() {
  if [[ -n "${API_PID}" ]] && kill -0 "${API_PID}" >/dev/null 2>&1; then
    kill "${API_PID}" >/dev/null 2>&1 || true
    wait "${API_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

cd "${ROOT_DIR}/.."
docker compose -f "server/docker-compose.local.yml" up -d

until docker compose -f "server/docker-compose.local.yml" ps --format json | grep -q '"State":"running"'; do
  sleep 2
  echo "Waiting for Postgres to start..."
done

cd "${ROOT_DIR}"
export DATABASE_URL="postgres://postgres:postgres@localhost:5432/crowdfunding?sslmode=disable"
export RIVER_MAX_ATTEMPTS=3
export RIVER_QUEUE_MAX_WORKERS=10
export PORT=8090

/usr/local/go/bin/go run ./cmd/api >"${API_LOG}" 2>&1 &
API_PID=$!

echo "API started with PID ${API_PID}. Waiting for health endpoint..."
until curl -fsS http://localhost:8090/api/health >/dev/null; do
  sleep 2
done

REQUEST_BODY='{"user_id":"river-runtime-test","provider":"google","action":"sign_in","success":true}'
RESPONSE="$(curl -fsS -X POST http://localhost:8090/api/analytics/social-login -H 'Content-Type: application/json' -d "${REQUEST_BODY}")"
echo "Analytics response: ${RESPONSE}"

sleep 5

docker exec crowdfunding-postgres psql -U postgres -d crowdfunding -c "SELECT id, user_id, provider, action, success, created_at FROM social_login_analytics ORDER BY created_at DESC LIMIT 5;"

echo "Recent API log lines:"
tail -n 30 "${API_LOG}"
