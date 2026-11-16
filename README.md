# The Daily Paella

Spanish news, summarised in English. Headlines from several Spanish newspapers,
mixed in one pan: each story gets a short machine-generated English summary and
a link to the original article.

## How it works

The site is a Nuxt app hosted on Vercel, backed by a [Turso](https://turso.tech)
(SQLite) database. It shows the summarised stories day by day, the most
important stories of each day first. Pages are cached, so the database is only
queried when the cache refreshes.

The database is filled by a separate process that is not part of this
repository.

## Content rules

- Summaries are generated only from what the RSS feed provides (title and
  description). Full articles are not scraped.
- Summaries are short and are not a substitute for the original article.
- Every story names its source and links to the original.
- No images from the feeds are stored or shown.
- Summaries are labelled as machine-generated.

### Analytics

The site counts visits and clicks on article links with
[Umami](https://umami.is), which uses no cookies and stores no personal data.
Analytics are off unless `NUXT_PUBLIC_UMAMI_WEBSITE_ID` is set.

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
shared/utils/days.ts    Calendar-day helpers (Spanish time)
```

## Deployment

Deploy to Vercel and add the Turso integration, which sets `TURSO_DATABASE_URL`
and `TURSO_AUTH_TOKEN`. Run `pnpm db:migrate` and `pnpm db:seed` once against the
production database.

Optionally set `VERCEL_BYPASS_TOKEN` to a random string of at least 32
characters to allow refreshing the cached pages on demand.

To enable analytics, set `NUXT_PUBLIC_UMAMI_WEBSITE_ID` to the website ID from
Umami. Scope it to the Production environment so preview deployments are not
counted.
