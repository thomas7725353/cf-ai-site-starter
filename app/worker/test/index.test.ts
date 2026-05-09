import { describe, expect, it } from "vitest";
import worker, { type Env } from "../src/index";

function env(overrides: Partial<Env> = {}): Env {
  return {
    APP_ENV: "test",
    TURNSTILE_SITE_KEY: "site-key",
    DB: {
      prepare(sql: string) {
        return {
          first: async () => ({ ok: 1 }),
          all: async () => ({
            results: sql.includes("FROM posts")
              ? [
                  {
                    id: 1,
                    slug: "hello-cloudflare",
                    title: "Hello Cloudflare",
                    excerpt: "A starter post served from D1.",
                    published_at: "2026-05-09T00:00:00.000Z"
                  }
                ]
              : []
          })
        };
      }
    } as unknown as D1Database,
    CONFIG: {} as KVNamespace,
    FILES: {} as R2Bucket,
    ASSETS: {
      fetch: async () => new Response("asset")
    } as unknown as Fetcher,
    ...overrides
  };
}

describe("worker", () => {
  it("returns health with database status", async () => {
    const response = await worker.fetch(new Request("https://example.com/api/health"), env());
    const body = (await response.json()) as { ok: boolean; database: string; env: string };

    expect(response.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.database).toBe("ok");
    expect(body.env).toBe("test");
  });

  it("lists posts from D1", async () => {
    const response = await worker.fetch(new Request("https://example.com/api/posts"), env());
    const body = (await response.json()) as { posts: Array<{ slug: string }> };

    expect(body.posts).toHaveLength(1);
    expect(body.posts[0]?.slug).toBe("hello-cloudflare");
  });

  it("returns api 404 as json", async () => {
    const response = await worker.fetch(new Request("https://example.com/api/missing"), env());
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(404);
    expect(body.error).toBe("not_found");
  });

  it("delegates non-api routes to assets", async () => {
    const response = await worker.fetch(new Request("https://example.com/"), env());

    expect(await response.text()).toBe("asset");
  });
});
