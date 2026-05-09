# Architecture

This project keeps the deployable application and its operating knowledge in one repository.

## Request Flow

1. Cloudflare receives browser traffic.
2. Static frontend assets are served from the Worker assets binding.
3. API requests under `/api/*` are handled by `app/worker/src/index.ts`.
4. The Worker reads relational data from D1, operational flags from KV, and files from R2.
5. Turnstile verification is available as an API boundary for forms and write actions.

## AI-Friendly Boundaries

Agents should use GitHub as the change boundary, Cloudflare Docs MCP for platform lookup, and Cloudflare Observability MCP for diagnosis. Production mutations need human approval.
