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

## Bootstrap

If Cloudflare resources do not exist yet, run:

```bash
npx wrangler login
export CLOUDFLARE_ACCOUNT_ID=your-account-id
export CLOUDFLARE_API_TOKEN=your-deploy-token
./scripts/bootstrap-cloudflare.sh
```

The script creates production and preview D1 databases, KV namespaces, R2 buckets, writes GitHub secrets, applies migrations, and replaces resource ID placeholders in `wrangler.toml`.
