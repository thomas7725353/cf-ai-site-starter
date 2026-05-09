CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  published_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

INSERT OR IGNORE INTO posts (slug, title, excerpt)
VALUES
  ('hello-cloudflare', 'Hello Cloudflare', 'A starter post served from D1.'),
  ('ai-friendly-ops', 'AI-Friendly Ops', 'Repository-first runbooks make agents safer.');
