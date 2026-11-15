# The Daily Paella

Spanish news, summarised in English. Headlines from several Spanish newspapers,
mixed in one pan: each story gets a short machine-generated English summary and
a link to the original article.

This is a non-commercial, open-source side project.

## How it works

```
n8n (self-hosted)                            Vercel
RSS feed -> dedupe -> local LLM -> Turso  <-  Nuxt app (cached overview page)
```

- **Ingestion** runs in a self-hosted [n8n](https://n8n.io) workflow. It reads the
  feeds listed in the `sources` table, skips articles that are already stored,
  asks a local LLM for a short English summary, and writes the result to the database.
- **The web app** (this repository) is a Nuxt app on Vercel. It reads recent
  articles from [Turso](https://turso.tech) (SQLite), ranks them, and shows an overview.
  The page is cached, so the database is only queried when the cache refreshes.

## Content rules

- Summaries are generated only from what the RSS feed provides (title and
  description). Full articles are not scraped.
- Summaries are short and are not a substitute for the original article.
- Every story names its source and links to the original.
- No images from the feeds are stored or shown.
- Summaries are labelled as machine-generated.

### Source removal

If you represent a publication listed here and want it removed, please open an
issue in this repository. <!-- TODO: add a contact e-mail address -->

## Development

Requires Node 22+ and pnpm.

```bash
pnpm install
cp .env.example .env   # defaults to a local SQLite file, no account needed
pnpm db:migrate        # create the tables
pnpm db:seed           # insert the initial sources
pnpm dev
```

The local SQLite file works with `pnpm dev` only. A production build
(`pnpm build`) talks to Turso over HTTP and needs a remote database URL.

| Script             | What it does                                         |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev`         | Start the dev server on http://localhost:3000        |
| `pnpm build`       | Production build                                     |
| `pnpm typecheck`   | Type-check the app and server                        |
| `pnpm db:generate` | Generate a SQL migration after editing the schema    |
| `pnpm db:migrate`  | Apply pending migrations                             |
| `pnpm db:seed`     | Insert the initial sources (safe to re-run)          |

### Layout

```
app/                    Pages and layout
server/api/             API routes
server/db/schema.ts     Database schema (Drizzle) and migrations
server/utils/db.ts      Database client
shared/utils/ranking.ts Importance ranking formula
```

## Ingestion contract

The n8n workflow writes to Turso through its
[HTTP API](https://docs.turso.tech/sdk/http/quickstart) (an HTTP Request node
with the database token as a Bearer header). For each feed item it keeps only
the title, description, link and publication date, then inserts:

```sql
INSERT INTO articles
  (source_id, url, title_original, title_en, summary_en, category,
   published_at, feed_position, llm_score, model)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (url) DO NOTHING;
```

- Check whether `url` already exists **before** calling the LLM, so articles are
  not summarised twice.
- `published_at` is a Unix timestamp in seconds.
- `feed_position` is the item's 0-based position in the feed.
- `llm_score` is the model's 1-10 importance rating; `model` is the model name.
- After inserting, refresh the cached page by requesting the site root with the
  header `x-prerender-revalidate: <VERCEL_BYPASS_TOKEN>`.

## Deployment

Deploy to Vercel and add the Turso integration, which sets `TURSO_DATABASE_URL`
and `TURSO_AUTH_TOKEN`. Run `pnpm db:migrate` and `pnpm db:seed` once against the
production database. Set
`VERCEL_BYPASS_TOKEN` to a random string of at least 32 characters.
