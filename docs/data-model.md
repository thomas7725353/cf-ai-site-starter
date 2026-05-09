# Data Model

## D1 Tables

### posts

Stores public content cards shown by the frontend.

| Column | Type | Notes |
| --- | --- | --- |
| `id` | INTEGER | Primary key |
| `slug` | TEXT | Unique URL-safe identifier |
| `title` | TEXT | Display title |
| `excerpt` | TEXT | Short summary |
| `published_at` | TEXT | ISO-like UTC timestamp |

## KV

`CONFIG` is reserved for small runtime flags and public configuration values.

## R2

`FILES` stores uploaded or generated assets that should not live in Git.
