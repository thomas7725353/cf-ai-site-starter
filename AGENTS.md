# Agent Operating Rules

## Source Of Truth

GitHub is the only source of truth for code, migrations, deployment workflows, and runbooks. Do not make production changes directly in a dashboard when a repository change can express the same operation.

## Allowed By Default

- Read repository code, docs, Actions logs, and Cloudflare documentation.
- Run local tests, type checks, builds, and Wrangler dry-run style commands.
- Create pull requests, comments, and draft deployment changes.
- Use Cloudflare Docs MCP for current platform documentation.
- Use Cloudflare Observability MCP for logs, traces, errors, and request diagnostics.

## Requires Human Approval

- Creating, deleting, or mutating production Cloudflare resources.
- Applying remote D1 migrations.
- Rotating GitHub or Cloudflare credentials.
- Changing DNS, SSL/TLS, access policies, or domain routing.
- Deploying to production outside the `main` branch workflow.

## Never Commit

- `.dev.vars`, `.env`, API tokens, OAuth tokens, private keys, database dumps, or production logs with sensitive data.
- Generated `.wrangler/` state or local build output.

## MCP Boundaries

- GitHub MCP can inspect issues, pull requests, review comments, workflow runs, and repository files.
- Cloudflare Docs MCP is read-only documentation lookup.
- Cloudflare Observability MCP is for diagnosis and incident support.
- Cloudflare API MCP, if enabled later, should start read-only or be limited to a test account.

## Deployment Model

- Pull requests run CI and preview workflows.
- Merges to `main` run production deployment.
- D1 migrations live in `migrations/` and must be reviewed before remote application.
- Rollback steps live in `docs/runbooks/rollback.md`.
