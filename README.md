# Cloudflare AI Site Starter

AI-friendly full-stack starter for Cloudflare Pages, Workers, D1, R2, KV, Turnstile, GitHub Actions, and MCP-assisted operations.

## Stack

- Frontend: Vite + TypeScript, deployed with Cloudflare Pages
- API: Cloudflare Workers
- Database: Cloudflare D1
- Object storage: Cloudflare R2
- Cache/config: Cloudflare KV
- Bot protection: Turnstile
- CI/CD: GitHub Actions + Wrangler
- AI assistance: GitHub MCP, Cloudflare Docs MCP, Cloudflare Observability MCP

## Local Setup

```bash
npm install
npm run typecheck
npm test
npm run build
npm run dev
```

## Cloudflare Setup

Create resources once, then update `wrangler.toml` IDs:

```bash
npx wrangler login
npx wrangler d1 create cf_ai_site_db
npx wrangler kv namespace create CF_AI_SITE_KV
npx wrangler r2 bucket create cf-ai-site-assets
npx wrangler d1 migrations apply cf_ai_site_db --remote
```

Add GitHub repository secrets:

```bash
gh secret set CLOUDFLARE_ACCOUNT_ID
gh secret set CLOUDFLARE_API_TOKEN
```

The API token should be scoped to the smallest Cloudflare account permissions needed for Workers, Pages, D1, KV, and R2 deployment.

## Endpoints

- `GET /api/health` returns worker and D1 health data.
- `GET /api/posts` lists published posts from D1.
- `POST /api/turnstile/siteverify` verifies a Turnstile token with Cloudflare.

## Agent Rules

Read `AGENTS.md` before changing code or operations. Production Cloudflare mutations require explicit human approval unless a runbook says otherwise.
