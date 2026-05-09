# Cloudflare MCP Handoff

Date: 2026-05-09

## Project

- Local path: `/Users/andy/RustroverProjects/cf-ai-site-starter`
- GitHub repo: `https://github.com/thomas7725353/cf-ai-site-starter`
- Default branch: `main`
- Latest pushed commit before this handoff: `85f0fbc ci: opt actions into node 24 runtime`

## Current State

- The starter project is created and pushed.
- GitHub Actions `CI` is green.
- GitHub Actions `Deploy` is green, but it currently skips real Cloudflare deployment because repository secrets are not configured.
- `docs/superpowers/plans/` is ignored and must never be pushed.
- `dist/`, `node_modules/`, and `*.tsbuildinfo` are ignored.

## Cloudflare Auth State

- Cloudflare Codex plugin is enabled in `~/.codex/config.toml`.
- `codex mcp list` shows:
  - `cloudflare-api`
  - URL: `https://mcp.cloudflare.com/mcp`
  - Auth: `OAuth`
  - Status: `enabled`
- `codex mcp login cloudflare-api` completed successfully in the previous session.
- The current session did not receive Cloudflare MCP tools after OAuth, likely because MCP tool injection happens when the Codex session starts.
- `npx wrangler whoami` still reports not authenticated. Wrangler OAuth and Cloudflare MCP OAuth are separate.

## Goal After Restart

Use Cloudflare MCP, if available in the new session, to create and bind the Cloudflare resources for this repo.

Target Cloudflare account email selected during OAuth: `tx991020@gmail.com`

Create these resources:

- D1 production database: `cf_ai_site_db`
- D1 preview database: `cf_ai_site_db_preview`
- KV production namespace: `CF_AI_SITE_KV`
- KV preview namespace: `CF_AI_SITE_KV_PREVIEW`
- R2 production bucket: `cf-ai-site-assets`
- R2 preview bucket: `cf-ai-site-assets-preview`

Then update `wrangler.toml` placeholders:

- `REPLACE_WITH_D1_DATABASE_ID`
- `REPLACE_WITH_PREVIEW_D1_DATABASE_ID`
- `REPLACE_WITH_KV_NAMESPACE_ID`
- `REPLACE_WITH_PREVIEW_KV_NAMESPACE_ID`

R2 bindings only need bucket names, already present in `wrangler.toml`.

## First Checks After Restart

From the project root:

```bash
cd /Users/andy/RustroverProjects/cf-ai-site-starter
codex mcp list
git status --short
gh run list --repo thomas7725353/cf-ai-site-starter --limit 5
```

In the assistant tool list, check whether a Cloudflare MCP namespace/tool appears. The expected MCP server is `cloudflare-api`; the plugin README says it exposes `search()` and `execute()`.

If the Cloudflare MCP tool appears, use it first instead of Wrangler for account/resource creation.

## Fallback If MCP Tools Still Do Not Appear

Use Wrangler bootstrap:

```bash
cd /Users/andy/RustroverProjects/cf-ai-site-starter
npx wrangler login
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-deploy-token
./scripts/bootstrap-cloudflare.sh
git add wrangler.toml
git commit -m "chore: bind cloudflare resources"
git push
```

Do not commit or print `CLOUDFLARE_API_TOKEN`.

## GitHub Secrets Still Needed For Actions Deployment

Even if MCP creates Cloudflare resources, GitHub Actions still needs:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

Set them with:

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID --repo thomas7725353/cf-ai-site-starter
gh secret set CLOUDFLARE_API_TOKEN --repo thomas7725353/cf-ai-site-starter
```

If Cloudflare MCP can create a limited deploy token safely, use the minimum permissions required for Workers, D1, KV, R2, Pages/assets deploy, and account read. Otherwise ask the user to create the token in the Cloudflare dashboard and paste it only into the secret prompt, not into chat or files.

## Verification Commands

Local:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

GitHub:

```bash
gh run list --repo thomas7725353/cf-ai-site-starter --limit 5
gh secret list --repo thomas7725353/cf-ai-site-starter
```

Cloudflare, after resources are bound:

```bash
npx wrangler d1 migrations apply cf_ai_site_db --remote --env production
npx wrangler deploy --env production
```

## Important Safety Rules

- Do not modify `~/.codex/auth.json`.
- Do not commit secrets, `.env`, `.dev.vars`, `.wrangler/`, `dist/`, `node_modules/`, or `docs/superpowers/plans/`.
- Production Cloudflare resource mutations should be explicit and traceable in this handoff or a runbook.
