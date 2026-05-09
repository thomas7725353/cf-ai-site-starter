# Observability Runbook

Use Cloudflare Observability MCP or Wrangler logs for diagnosis.

## Common Checks

```bash
npx wrangler tail cf-ai-site-starter-api --env production
npx wrangler deployments list --env production
```

Check these first:

- Worker exceptions
- D1 query failures
- R2 permission failures
- Turnstile siteverify errors
- Recent deployment SHA

Do not rotate credentials or change production bindings during diagnosis without human approval.
