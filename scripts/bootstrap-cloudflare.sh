#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

repo="${GITHUB_REPOSITORY:-thomas7725353/cf-ai-site-starter}"
database_name="${D1_DATABASE_NAME:-cf_ai_site_db}"
preview_database_name="${D1_PREVIEW_DATABASE_NAME:-cf_ai_site_db_preview}"
kv_name="${KV_NAMESPACE_NAME:-CF_AI_SITE_KV}"
preview_kv_name="${KV_PREVIEW_NAMESPACE_NAME:-CF_AI_SITE_KV_PREVIEW}"
r2_bucket="${R2_BUCKET_NAME:-cf-ai-site-assets}"
preview_r2_bucket="${R2_PREVIEW_BUCKET_NAME:-cf-ai-site-assets-preview}"

require() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

extract_json_id() {
  node -e '
    let input = "";
    process.stdin.on("data", chunk => input += chunk);
    process.stdin.on("end", () => {
      const matches = [...input.matchAll(/\{[\s\S]*?\}/g)];
      for (const match of matches.reverse()) {
        try {
          const parsed = JSON.parse(match[0]);
          const id = parsed.uuid || parsed.id;
          if (id) {
            console.log(id);
            return;
          }
        } catch {}
      }
      process.exit(1);
    });
  '
}

replace_once() {
  local placeholder="$1"
  local value="$2"
  node - "$placeholder" "$value" <<'NODE'
const fs = require("fs");
const [placeholder, value] = process.argv.slice(2);
const path = "wrangler.toml";
const current = fs.readFileSync(path, "utf8");
const next = current.replace(placeholder, value);
if (next === current) {
  console.error(`Placeholder not found: ${placeholder}`);
  process.exit(1);
}
fs.writeFileSync(path, next);
NODE
}

require node
require gh

if ! npx wrangler whoami >/dev/null 2>&1; then
  echo "Wrangler is not authenticated. Run: npx wrangler login" >&2
  exit 1
fi

if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" ]]; then
  echo "Set CLOUDFLARE_ACCOUNT_ID before running this script." >&2
  exit 1
fi

echo "Creating D1 database: $database_name"
d1_id="$(npx wrangler d1 create "$database_name" | extract_json_id)"

echo "Creating preview D1 database: $preview_database_name"
preview_d1_id="$(npx wrangler d1 create "$preview_database_name" | extract_json_id)"

echo "Creating KV namespace: $kv_name"
kv_id="$(npx wrangler kv namespace create "$kv_name" | extract_json_id)"

echo "Creating preview KV namespace: $preview_kv_name"
preview_kv_id="$(npx wrangler kv namespace create "$preview_kv_name" | extract_json_id)"

echo "Creating R2 bucket: $r2_bucket"
npx wrangler r2 bucket create "$r2_bucket" || true

echo "Creating preview R2 bucket: $preview_r2_bucket"
npx wrangler r2 bucket create "$preview_r2_bucket" || true

replace_once "REPLACE_WITH_D1_DATABASE_ID" "$d1_id"
replace_once "REPLACE_WITH_PREVIEW_D1_DATABASE_ID" "$preview_d1_id"
replace_once "REPLACE_WITH_KV_NAMESPACE_ID" "$kv_id"
replace_once "REPLACE_WITH_PREVIEW_KV_NAMESPACE_ID" "$preview_kv_id"

echo "Writing GitHub secret: CLOUDFLARE_ACCOUNT_ID"
printf '%s' "$CLOUDFLARE_ACCOUNT_ID" | gh secret set CLOUDFLARE_ACCOUNT_ID --repo "$repo"

if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "Writing GitHub secret: CLOUDFLARE_API_TOKEN"
  printf '%s' "$CLOUDFLARE_API_TOKEN" | gh secret set CLOUDFLARE_API_TOKEN --repo "$repo"
else
  echo "CLOUDFLARE_API_TOKEN is not set; add it with: gh secret set CLOUDFLARE_API_TOKEN --repo $repo"
fi

echo "Applying remote D1 migrations"
npx wrangler d1 migrations apply "$database_name" --remote
npx wrangler d1 migrations apply "$preview_database_name" --remote

echo "Cloudflare bootstrap complete. Review wrangler.toml, commit the ID updates, then push."
