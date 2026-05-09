export interface Env {
  APP_ENV: string;
  TURNSTILE_SITE_KEY: string;
  TURNSTILE_SECRET_KEY?: string;
  DB: D1Database;
  CONFIG: KVNamespace;
  FILES: R2Bucket;
  ASSETS: Fetcher;
}

type PostRow = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
};

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return json(await health(env));
    }

    if (url.pathname === "/api/posts") {
      return json(await listPosts(env));
    }

    if (url.pathname === "/api/turnstile/siteverify" && request.method === "POST") {
      return json(await verifyTurnstile(request, env));
    }

    if (url.pathname.startsWith("/api/")) {
      return json({ error: "not_found" }, 404);
    }

    return env.ASSETS.fetch(request);
  }
};

async function health(env: Env) {
  return {
    ok: true,
    service: "cf-ai-site-starter-api",
    env: env.APP_ENV,
    database: await databaseStatus(env),
    timestamp: new Date().toISOString()
  };
}

async function databaseStatus(env: Env): Promise<"ok" | "unavailable"> {
  try {
    await env.DB.prepare("SELECT 1 AS ok").first();
    return "ok";
  } catch {
    return "unavailable";
  }
}

async function listPosts(env: Env): Promise<{ posts: PostRow[] }> {
  const result = await env.DB.prepare(
    "SELECT id, slug, title, excerpt, published_at FROM posts ORDER BY published_at DESC LIMIT 20"
  ).all<PostRow>();

  return { posts: result.results ?? [] };
}

async function verifyTurnstile(request: Request, env: Env) {
  if (!env.TURNSTILE_SECRET_KEY) {
    return { ok: false, error: "turnstile_not_configured" };
  }

  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  if (!body?.token) {
    return { ok: false, error: "missing_token" };
  }

  const form = new FormData();
  form.append("secret", env.TURNSTILE_SECRET_KEY);
  form.append("response", body.token);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: form
  });
  const verification = (await response.json()) as { success?: boolean; ["error-codes"]?: string[] };

  return {
    ok: Boolean(verification.success),
    errors: verification["error-codes"] ?? []
  };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: jsonHeaders
  });
}
