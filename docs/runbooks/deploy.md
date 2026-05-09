# Deploy Runbook

## Preview

Preview deployment runs from pull requests through `.github/workflows/preview.yml`.

Required GitHub secrets:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

## Production

Production deployment runs after a merge to `main`.

The deploy workflow:

1. Installs npm dependencies.
2. Runs lint, type checks, tests, and build.
3. Applies reviewed D1 migrations to the remote database.
4. Deploys the Worker and assets with Wrangler.

Remote D1 migration application should be treated as a production database mutation and reviewed before merge.
