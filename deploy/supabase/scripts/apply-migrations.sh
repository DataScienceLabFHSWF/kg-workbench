#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
DEFAULT_ENV_FILE="$ROOT_DIR/deploy/.env.server"
MIGRATION_TABLE="${MIGRATION_TABLE:-public.kg_workbench_schema_migrations}"
BASELINE_BEFORE=""
ENV_FILE=""
TARGET="supabase"

usage() {
  cat <<'EOF'
Usage:
  bash deploy/supabase/scripts/apply-migrations.sh [env-file] [--target postgres|supabase] [--baseline-before <filename>]

Examples:
  bash deploy/supabase/scripts/apply-migrations.sh deploy/.env.server
  bash deploy/supabase/scripts/apply-migrations.sh deploy/.env.server --target postgres
  bash deploy/supabase/scripts/apply-migrations.sh deploy/.env.server --baseline-before 20260423000000_ontology-metadata.sql

Options:
  --target <name>              Select the PostgreSQL or Supabase deployment profile.
  --baseline-before <filename>  Mark earlier migration files as already applied without executing them.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)
      if [[ $# -lt 2 || ( "$2" != "postgres" && "$2" != "supabase" ) ]]; then
        echo "Target must be postgres or supabase." >&2
        exit 1
      fi
      TARGET="$2"
      shift 2
      ;;
    --baseline-before)
      if [[ $# -lt 2 ]]; then
        echo "Missing filename for --baseline-before" >&2
        exit 1
      fi
      BASELINE_BEFORE="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      if [[ -n "$ENV_FILE" ]]; then
        echo "Unexpected argument: $1" >&2
        usage >&2
        exit 1
      fi
      ENV_FILE="$1"
      shift
      ;;
  esac
done

ENV_FILE="${ENV_FILE:-$DEFAULT_ENV_FILE}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

shopt -s nullglob
BASELINE_MIGRATIONS=("$ROOT_DIR"/drizzle/baseline/*.sql)
GENERATED_MIGRATIONS=("$ROOT_DIR"/drizzle/*/migration.sql)

if [[ ${#BASELINE_MIGRATIONS[@]} -eq 0 ]]; then
  echo "No baseline migration files found under $ROOT_DIR/drizzle/baseline" >&2
  exit 1
fi

if [[ -n "$BASELINE_BEFORE" ]]; then
  baseline_found=0

  for migration in "${BASELINE_MIGRATIONS[@]}"; do
    migration_name="$(basename "$migration")"

    if [[ "$migration_name" == "$BASELINE_BEFORE" ]]; then
      baseline_found=1
      break
    fi
  done

  if [[ "$baseline_found" -ne 1 ]]; then
    echo "Baseline file not found in drizzle/baseline: $BASELINE_BEFORE" >&2
    exit 1
  fi
fi

DOCKER_COMPOSE=(
  docker compose --env-file "$ENV_FILE"
  -f "$ROOT_DIR/deploy/compose.yaml"
  -f "$ROOT_DIR/deploy/providers/$TARGET.yaml"
)

ensure_migration_table() {
  "${DOCKER_COMPOSE[@]}" exec -T db \
    psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres <<SQL
CREATE TABLE IF NOT EXISTS $MIGRATION_TABLE (
  filename text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
);
SQL
}

migration_applied() {
  local migration_name="$1"
  local result

  result="$("${DOCKER_COMPOSE[@]}" exec -T db \
    psql -X -A -t -q -v migration_file="$migration_name" -U postgres -d postgres <<SQL
SELECT 1
FROM $MIGRATION_TABLE
WHERE filename = :'migration_file'
LIMIT 1;
SQL
)"

  [[ "${result//[[:space:]]/}" == "1" ]]
}

record_migration() {
  local migration_name="$1"

  "${DOCKER_COMPOSE[@]}" exec -T db \
    psql -X -v ON_ERROR_STOP=1 -v migration_file="$migration_name" -U postgres -d postgres <<SQL
INSERT INTO $MIGRATION_TABLE (filename)
VALUES (:'migration_file')
ON CONFLICT (filename) DO NOTHING;
SQL
}

apply_migration() {
  local migration_path="$1"
  local migration_name="$2"

  {
    printf 'BEGIN;\n'
    cat "$migration_path"
    printf '\n'
    printf "INSERT INTO %s (filename) VALUES (:'migration_file') ON CONFLICT (filename) DO NOTHING;\n" "$MIGRATION_TABLE"
    printf 'COMMIT;\n'
  } | "${DOCKER_COMPOSE[@]}" exec -T db \
    psql -X -v ON_ERROR_STOP=1 -v migration_file="$migration_name" -U postgres -d postgres
}

ensure_migration_table

if [[ -n "$BASELINE_BEFORE" ]]; then
  echo "Baselining migrations before $BASELINE_BEFORE using $MIGRATION_TABLE"

  for migration in "${BASELINE_MIGRATIONS[@]}"; do
    migration_name="$(basename "$migration")"

    if [[ "$migration_name" == "$BASELINE_BEFORE" ]]; then
      break
    fi

    if migration_applied "$migration_name"; then
      echo "Skipping $migration_name (already tracked)"
      continue
    fi

    echo "Recording $migration_name without executing it"
    record_migration "$migration_name"
  done
fi

for migration in "${BASELINE_MIGRATIONS[@]}"; do
  migration_name="$(basename "$migration")"

  if migration_applied "$migration_name"; then
    echo "Skipping $migration_name (already applied)"
    continue
  fi

  echo "Applying $migration_name"
  apply_migration "$migration" "$migration_name"
done

for migration in "${GENERATED_MIGRATIONS[@]}"; do
  migration_directory="$(basename "$(dirname "$migration")")"
  migration_name="drizzle/$migration_directory"

  if migration_applied "$migration_name"; then
    echo "Skipping $migration_name (already applied)"
    continue
  fi

  echo "Applying $migration_name"
  apply_migration "$migration" "$migration_name"
done

if [[ "$TARGET" == "supabase" ]]; then
  "${DOCKER_COMPOSE[@]}" exec -T db \
    psql -X -v ON_ERROR_STOP=1 -U postgres -d postgres <<SQL
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('documents', 'documents', false, 52428800)
ON CONFLICT (id) DO NOTHING;
SQL
fi

echo "All migrations applied."
