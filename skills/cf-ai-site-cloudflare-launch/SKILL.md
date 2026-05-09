---
name: cf-ai-site-cloudflare-launch
description: Use when bootstrapping or repairing this repo's GitHub Actions plus Cloudflare Workers, D1, KV, R2 deployment path for cf-ai-site-starter.
---

# CF AI Site Cloudflare Launch

## Scope

Use this for `/Users/andy/RustroverProjects/cf-ai-site-starter` when wiring the repo to Cloudflare and GitHub Actions. Keep GitHub as source of truth: express deploy behavior in repo files, commit to `main`, and let Actions deploy production.

Do not commit tokens, `.dev.vars`, `.env`, `.wrangler/`, `dist/`, `node_modules/`, or `docs/superpowers/plans/`.

## Known Resources

Account:

```text
email: tx991020@gmail.com
account_id: ad59371c9ca78f9556cb6a91a3fa7d0d
```

Production bindings:

```text
D1: cf_ai_site_db
KV: CF_AI_SITE_KV
R2: cf-ai-site-assets
Worker: cf-ai-site-starter-api
workers.dev: https://cf-ai-site-starter-api.tx991020.workers.dev
custom domain: https://blog.gorustai.com
```

Preview bindings:

```text
D1: cf_ai_site_db_preview
KV: CF_AI_SITE_KV_PREVIEW
R2: cf-ai-site-assets-preview
```

## Workflow

1. Read repo state first:

```bash
rtk git status --short --branch
rtk sed -n '1,220p' wrangler.toml
rtk sed -n '1,180p' .github/workflows/deploy.yml
```

2. Prefer Cloudflare MCP only if it is authenticated. If MCP returns `Authentication error [code: 10000]`, use Wrangler OAuth instead:

```bash
rtk codex mcp list
rtk npx wrangler whoami
rtk npx wrangler login
```

3. Create or verify resources before editing IDs:

```bash
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler d1 list --json
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler kv namespace list
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler r2 bucket list
```

Create missing resources with:

```bash
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler d1 create cf_ai_site_db
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler d1 create cf_ai_site_db_preview
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler kv namespace create CF_AI_SITE_KV
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler kv namespace create CF_AI_SITE_KV_PREVIEW
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler r2 bucket create cf-ai-site-assets
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler r2 bucket create cf-ai-site-assets-preview
```

4. Write `wrangler.toml` resource IDs manually and remove placeholders. R2 needs bucket names only. Keep `account_id` set.

5. Store GitHub secrets. Never print or commit token values:

```bash
printf '%s' 'ad59371c9ca78f9556cb6a91a3fa7d0d' | gh secret set CLOUDFLARE_ACCOUNT_ID --repo thomas7725353/cf-ai-site-starter
gh secret set CLOUDFLARE_API_TOKEN --repo thomas7725353/cf-ai-site-starter
gh secret list --repo thomas7725353/cf-ai-site-starter
```

Minimum token permissions used by the final workflow:

```text
Account - Workers Scripts - Edit
Account - Workers KV Storage - Edit
Account - D1 - Edit
Account - Workers R2 Storage - Edit
Account - Account Settings - Read
Zone - Zone - Read
Zone - Workers Routes - Edit
Zone - DNS - Edit
Account Resources: Include - Tx991020@gmail.com's Account
Zone Resources: Include - gorustai.com
```

If a token appears in chat, tell the user to revoke it and regenerate it.

## Verification

Before committing:

```bash
rtk rg -n 'REPLACE_WITH|account_id = ""' wrangler.toml
rtk npm run lint
rtk npm run typecheck
rtk npm test
rtk npm run build
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler deploy --dry-run --env production
```

After push:

```bash
rtk gh run list --repo thomas7725353/cf-ai-site-starter --limit 5
rtk gh run watch <deploy-run-id> --repo thomas7725353/cf-ai-site-starter --exit-status
rtk curl -I https://blog.gorustai.com
rtk curl -sS https://blog.gorustai.com/api/health
```

Healthy API response includes:

```json
{"ok":true,"service":"cf-ai-site-starter-api","env":"production","database":"ok"}
```

## Common Failures

- `Cloudflare API error: 10000: Authentication error` from MCP: MCP OAuth is stale or unavailable in this session. Use Wrangler OAuth or fix MCP login in a new session.
- GitHub Deploy says secrets are missing: set both `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN`.
- GitHub Deploy fails on `/zones/.../workers/routes`: token lacks Zone `Workers Routes - Edit` or Zone `Zone - Read` for `gorustai.com`.
- `wrangler.toml` includes custom domains and `workers_dev` is absent: Wrangler may disable `workers.dev` for that deployment. Verify the custom domain, not only workers.dev.
