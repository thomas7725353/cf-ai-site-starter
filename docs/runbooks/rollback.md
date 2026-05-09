# Rollback Runbook

## Worker Rollback

1. Find the last healthy deployment:

```bash
npx wrangler deployments list --env production
```

2. Roll back with Wrangler after human approval:

```bash
npx wrangler rollback --env production
```

## D1 Rollback

D1 migrations are forward-only by default. Create a reviewed compensating migration instead of editing or deleting applied migrations.

## R2/KV Rollback

R2 and KV changes should be restored from backups or generated metadata. Do not bulk delete production keys or objects without a written recovery plan.
