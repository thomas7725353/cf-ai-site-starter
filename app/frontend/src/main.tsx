import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { Activity, Bot, Database, FileBox, GitBranch, ShieldCheck } from "lucide-react";
import "./styles.css";

type Health = {
  ok: boolean;
  env: string;
  service: string;
  database: "ok" | "unavailable";
  timestamp: string;
};

type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
};

function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/health").then((response) => response.json() as Promise<Health>),
      fetch("/api/posts").then((response) => response.json() as Promise<{ posts: Post[] }>)
    ]).then(([healthResult, postsResult]) => {
      setHealth(healthResult);
      setPosts(postsResult.posts);
    });
  }, []);

  return (
    <main>
      <section className="hero">
        <div>
          <p className="eyebrow">GitHub + Actions + Cloudflare + MCP</p>
          <h1>Cloudflare AI Site Starter</h1>
          <p className="summary">
            A repository-first starter for personal sites, content tools, file-backed utilities, and lightweight SaaS MVPs.
          </p>
        </div>
        <div className="status-panel" aria-label="Runtime status">
          <div className="status-row">
            <Activity size={20} />
            <span>{health?.ok ? "Worker online" : "Checking Worker"}</span>
          </div>
          <div className="status-row">
            <Database size={20} />
            <span>D1 {health?.database ?? "checking"}</span>
          </div>
          <div className="status-row">
            <GitBranch size={20} />
            <span>{health?.env ?? "development"}</span>
          </div>
        </div>
      </section>

      <section className="capabilities" aria-label="Cloudflare capabilities">
        <Capability icon={<Database />} title="D1" text="Relational content and app state through reviewed SQL migrations." />
        <Capability icon={<FileBox />} title="R2" text="Durable object storage for generated assets, uploads, and public files." />
        <Capability icon={<ShieldCheck />} title="Turnstile" text="Bot protection boundary for forms and write operations." />
        <Capability icon={<Bot />} title="MCP" text="Docs and observability are available to agents without production write access." />
      </section>

      <section className="posts" aria-label="D1 posts">
        <div className="section-heading">
          <h2>D1 content</h2>
          <span>{posts.length} rows</span>
        </div>
        <div className="post-grid">
          {posts.map((post) => (
            <article key={post.slug}>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <time>{new Date(post.published_at).toLocaleDateString()}</time>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Capability(props: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <article className="capability">
      <div className="capability-icon">{props.icon}</div>
      <h2>{props.title}</h2>
      <p>{props.text}</p>
    </article>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
