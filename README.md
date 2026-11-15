# The Daily Paella

Spanish news, summarised in English. Headlines from several Spanish newspapers,
mixed in one pan: each story gets a short machine-generated English summary and
a link to the original article.

## How it works

```
n8n (self-hosted)                            Vercel
RSS feed -> dedupe -> local LLM -> Turso  <-  Nuxt app (cached overview page)
```

- **Ingestion** runs in two self-hosted [n8n](https://n8n.io) workflows. One syncs
  the feeds listed in the `sources` table into the database. The other asks a
  local LLM for a short English summary of each new article.
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

Ingestion is split into two n8n workflows that only share the database. Both
write to Turso through its [HTTP API](https://docs.turso.tech/sdk/http/quickstart)
(an HTTP Request node with the database token as a Bearer header).

The schema keeps facts and derived data apart: `articles` holds only what the
feed said, `summaries` only what the LLM produced. An article without a row in
`summaries` is simply not processed yet.

### 1. Sync workflow (writes `articles`)

Runs often and makes no LLM calls. For each enabled source it fetches the feed,
keeps only title, description (HTML stripped), link, publication date and
position, and runs the following in one transaction:

```sql
-- Articles that dropped out of the feed lose their position.
UPDATE articles SET feed_position = NULL
WHERE source_id = ? AND feed_position IS NOT NULL;

-- Once per feed item.
INSERT INTO articles
  (source_id, url, title_original, description_original, published_at, feed_position)
VALUES (?, ?, ?, ?, ?, ?)
ON CONFLICT (url) DO UPDATE SET feed_position = excluded.feed_position;
```

- `published_at` is a Unix timestamp in seconds.
- `feed_position` is the item's 0-based position in the feed.

### 2. Summary workflow (writes `summaries`)

Picks recent articles that have no summary yet, most prominent first:

```sql
SELECT a.id, a.title_original, a.description_original
FROM articles a
LEFT JOIN summaries s ON s.article_id = a.id
WHERE s.id IS NULL
  AND a.summary_attempts < 3
  AND a.published_at >= unixepoch() - 48 * 3600
ORDER BY a.feed_position IS NULL, a.feed_position, a.published_at DESC
LIMIT 30;
```

For each one it asks the LLM for an English title, a 2-3 sentence summary, an
importance score and a category, then stores the result:

```sql
INSERT INTO summaries
  (article_id, title_en, summary_en, score, category, model, prompt_version)
VALUES (?, ?, ?, ?, ?, ?, ?)
ON CONFLICT (article_id) DO NOTHING;
```

If the LLM call fails or returns something invalid:

```sql
UPDATE articles SET summary_attempts = summary_attempts + 1 WHERE id = ?;
```

- `score` is the model's 1-10 importance rating; `model` is the model name.
- `prompt_version` is an integer that is bumped whenever the prompt changes.
- This workflow must not run in parallel with itself.

### Regenerating summaries

After changing the prompt or the model, delete the stale summaries and the
summary workflow will recreate them on its next runs:

```sql
DELETE FROM summaries WHERE prompt_version < ?;
UPDATE articles SET summary_attempts = 0;
```

### Removing a source

Deleting a row from `sources` also deletes its articles and their summaries.

## Deployment

Deploy to Vercel and add the Turso integration, which sets `TURSO_DATABASE_URL`
and `TURSO_AUTH_TOKEN`. Run `pnpm db:migrate` and `pnpm db:seed` once against the
production database. Set
`VERCEL_BYPASS_TOKEN` to a random string of at least 32 characters.
