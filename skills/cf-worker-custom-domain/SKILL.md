---
name: cf-worker-custom-domain
description: Use when binding, changing, or diagnosing a Cloudflare Workers custom domain for this repo, especially blog.gorustai.com and gorustai.com DNS conflicts.
---

# CF Worker Custom Domain

## Scope

Use this in `cf-ai-site-starter` when routing `cf-ai-site-starter-api` to a Cloudflare-managed domain. DNS, SSL/TLS, routes, and domain routing are production-affecting changes; get explicit user confirmation for the exact hostname before mutating them.

Current intended hostname:

```text
blog.gorustai.com -> cf-ai-site-starter-api
```

## Preflight

Check zone and conflicts before editing:

```bash
rtk npx wrangler whoami
rtk dig +short blog.gorustai.com @1.1.1.1
rtk curl -I https://cf-ai-site-starter-api.tx991020.workers.dev
rtk curl -sS https://cf-ai-site-starter-api.tx991020.workers.dev/api/health
```

If using Cloudflare MCP, verify:

```text
zone: gorustai.com
status: active
zone_id: 075febed74b656ff63681f3b11377655
account_id: ad59371c9ca78f9556cb6a91a3fa7d0d
```

## Repo Configuration

The durable source-of-truth change is in `wrangler.toml` under production:

```toml
[[env.production.routes]]
pattern = "blog.gorustai.com"
custom_domain = true
```

Then validate locally:

```bash
rtk env CLOUDFLARE_ACCOUNT_ID=ad59371c9ca78f9556cb6a91a3fa7d0d npx wrangler deploy --dry-run --env production
rtk npm run lint
rtk npm run typecheck
rtk npm test
rtk npm run build
```

Commit and push the config:

```bash
rtk git add wrangler.toml
rtk git commit -m "chore: route production to blog domain"
rtk git push
```

## DNS Conflict Handling

Cloudflare Workers Custom Domain conflicts with externally managed `A`, `AAAA`, or `CNAME` records for the same hostname.

Observed failure:

```text
Hostname 'blog.gorustai.com' already has externally managed DNS records (A, CNAME, etc).
Either delete them, try a different hostname, or use the option 'override_existing_dns_record' to override. [code: 100117]
```

Fix options:

- Preferred: delete the conflicting `blog.gorustai.com` A/CNAME/AAAA record in Cloudflare DNS, then redeploy.
- If local Wrangler OAuth has enough permissions, an interactive `npx wrangler deploy --env production` can prompt to override the record.
- Do not point `blog.gorustai.com` to `47.82.217.220` if the goal is Workers custom domain routing.

`gorustai.com` root and `www.gorustai.com` were already in use during this setup:

```text
gorustai.com      A      47.82.217.220     proxied
www.gorustai.com  CNAME  gorustai.com      proxied
```

Use `blog.gorustai.com` or another unused subdomain to avoid taking over the existing root site.

## GitHub Actions Token Permissions

GitHub deploy needs zone-level route permissions in addition to account storage/worker permissions. If Actions fails with:

```text
/zones/.../workers/routes
Authentication error [code: 10000]
```

Regenerate or update `CLOUDFLARE_API_TOKEN` with:

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

Write it only through the terminal prompt:

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo thomas7725353/cf-ai-site-starter
```

## Verification

After deployment:

```bash
rtk gh run list --repo thomas7725353/cf-ai-site-starter --workflow Deploy --limit 5
rtk gh run view <run-id> --repo thomas7725353/cf-ai-site-starter --log | rg -n 'blog.gorustai.com|Current Version ID|Authentication error|ERROR'
rtk dig +short blog.gorustai.com @1.1.1.1
rtk curl -I https://blog.gorustai.com
rtk curl -sS https://blog.gorustai.com/api/health
```

Expected deploy log:

```text
Deployed cf-ai-site-starter-api triggers
blog.gorustai.com (custom domain)
Current Version ID: <uuid>
```

Expected API health:

```json
{"ok":true,"service":"cf-ai-site-starter-api","env":"production","database":"ok"}
```

If `dig @1.1.1.1` resolves but local `curl` says `Could not resolve host`, wait for local resolver cache or verify temporarily with `curl --resolve blog.gorustai.com:443:<cloudflare-ip>`.
