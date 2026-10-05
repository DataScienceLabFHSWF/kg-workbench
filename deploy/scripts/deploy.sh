#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TARGET="${1:-}"
COMMAND="${2:-up}"
ENV_FILE="${3:-$ROOT_DIR/deploy/.env.server}"

if [[ "$TARGET" != "postgres" && "$TARGET" != "supabase" ]]; then
  echo "Usage: bash deploy/scripts/deploy.sh <postgres|supabase> [up|down|logs|ps|migrate] [env-file]" >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

COMPOSE=(
  docker compose --env-file "$ENV_FILE"
  -f "$ROOT_DIR/deploy/compose.yaml"
  -f "$ROOT_DIR/deploy/providers/$TARGET.yaml"
)

case "$COMMAND" in
  up)
    "${COMPOSE[@]}" up -d
    ;;
  down|logs|ps)
    "${COMPOSE[@]}" "$COMMAND"
    ;;
  migrate)
    bash "$ROOT_DIR/deploy/scripts/apply-migrations.sh" "$ENV_FILE" --target "$TARGET"
    ;;
  *)
    echo "Unsupported command: $COMMAND" >&2
    exit 1
    ;;
esac
