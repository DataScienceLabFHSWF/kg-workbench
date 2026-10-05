#!/bin/sh
# Adapted for KG Workbench from the Supabase self-hosting distribution.
# Copyright 2024 Supabase. Apache-2.0; see LICENSES/Supabase-Apache-2.0.txt at the repository root.
#
# Generate secrets and legacy symmetric JWT API keys for self-hosted Supabase.
#
# Generates the secrets used by this deployment: POSTGRES_PASSWORD,
# JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY, and PG_META_CRYPTO_KEY.
#
# Usage:
#   sh generate-keys.sh              # Interactive: prints keys, prompts to update deploy/.env.server
#   sh generate-keys.sh --update-env # Prints keys and writes them to deploy/.env.server
#   sh generate-keys.sh | tee keys   # Non-interactive: prints keys only
#
# Portions of this code are derived from Inder Singh's setup.sh shell script.
# Copyright 2025 Inder Singh. Licensed under Apache License 2.0.
# Original source: https://github.com/singh-inder/supabase-automated-self-host/blob/main/setup.sh
#

set -e

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
root_dir=$(CDPATH= cd -- "$script_dir/../../.." && pwd)
env_file="$root_dir/deploy/.env.server"

gen_hex() {
    openssl rand -hex "$1"
}

gen_base64() {
    openssl rand -base64 "$1"
}

base64_url_encode() {
    openssl enc -base64 -A | tr '+/' '-_' | tr -d '='
}

gen_token() {
    payload=$1
    payload_base64=$(printf %s "$payload" | base64_url_encode)
    header_base64=$(printf %s "$header" | base64_url_encode)
    signed_content="${header_base64}.${payload_base64}"
    signature=$(printf %s "$signed_content" | openssl dgst -binary -sha256 -hmac "$jwt_secret" | base64_url_encode)
    printf '%s' "${signed_content}.${signature}"
}

if ! command -v openssl >/dev/null 2>&1; then
    echo "Error: openssl is required but not found."
    exit 1
fi

jwt_secret="$(gen_base64 30)"

# Used in gen_token()
header='{"alg":"HS256","typ":"JWT"}'
iat=$(date +%s)
exp=$((iat + 5 * 3600 * 24 * 365)) # 5 years

# Normalizes JSON formatting so that the token matches https://www.jwt.io/ results
anon_payload="{\"role\":\"anon\",\"iss\":\"supabase\",\"iat\":$iat,\"exp\":$exp}"
service_role_payload="{\"role\":\"service_role\",\"iss\":\"supabase\",\"iat\":$iat,\"exp\":$exp}"

#echo "anon_payload=$anon_payload"
#echo "service_role_payload=$service_role_payload"

anon_key=$(gen_token "$anon_payload")
service_role_key=$(gen_token "$service_role_payload")

pg_meta_crypto_key=$(gen_base64 24)

echo ""
echo "JWT_SECRET=${jwt_secret}"
echo ""
#echo "Issued at: $iat"
#echo "Expire: $exp"
echo "ANON_KEY=${anon_key}"
echo "SERVICE_ROLE_KEY=${service_role_key}"
echo ""
echo "PG_META_CRYPTO_KEY=${pg_meta_crypto_key}"
echo ""

postgres_password=$(gen_hex 16)

echo "POSTGRES_PASSWORD=${postgres_password}"
echo ""

if [ "$1" = "--update-env" ]; then
    update_env=true
elif test -t 0; then
    printf "Update %s? (y/N) " "$env_file"
    read -r REPLY
    case "$REPLY" in
        [Yy]) update_env=true ;;
        *) update_env=false ;;
    esac
else
    echo "Running non-interactively. Pass --update-env to write to deploy/.env.server."
    update_env=false
fi

if [ "$update_env" != "true" ]; then
    exit 0
fi

if [ ! -f "$env_file" ]; then
    echo "Error: env file not found: $env_file" >&2
    echo "Create it first by copying deploy/.env.server.example to deploy/.env.server." >&2
    exit 1
fi

echo "Updating $env_file..."

sed \
    -i.old \
    -e "s|^JWT_SECRET=.*$|JWT_SECRET=${jwt_secret}|" \
    -e "s|^ANON_KEY=.*$|ANON_KEY=${anon_key}|" \
    -e "s|^SERVICE_ROLE_KEY=.*$|SERVICE_ROLE_KEY=${service_role_key}|" \
    -e "s|^PG_META_CRYPTO_KEY=.*$|PG_META_CRYPTO_KEY=${pg_meta_crypto_key}|" \
    -e "s|^POSTGRES_PASSWORD=.*$|POSTGRES_PASSWORD=${postgres_password}|" \
    "$env_file"
