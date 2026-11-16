import { sql } from 'drizzle-orm'
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

// Timestamps are stored as Unix seconds.
const now = sql`(unixepoch())`

// Facts and derived data live in separate tables: `articles` holds only what the
// source said, `summaries` only what the LLM produced. An article without a
// summary row is simply "not processed yet", and summaries can be deleted and
// regenerated without touching the original data.
//
// Keep new columns nullable or defaulted where possible: adding a column is
// trivial in SQLite, loosening a NOT NULL later means rebuilding the table.

/** A news outlet and the feed we read from it. Adding a source is one row here. */
export const sources = sqliteTable('sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  homepageUrl: text('homepage_url').notNull(),
  feedUrl: text('feed_url').notNull(),
  /** How the source is read. Only 'rss' exists today. */
  kind: text('kind').notNull().default('rss'),
  /** Language of the source's content (ISO 639-1). */
  language: text('language').notNull().default('es'),
  region: text('region'),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
})

/**
 * One item as the source published it.
 * Holds the feed's title and description only; no images, no full article text.
 */
export const articles = sqliteTable(
  'articles',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    sourceId: integer('source_id')
      .notNull()
      .references(() => sources.id, { onDelete: 'cascade' }),
    /** Link to the original article. Also the deduplication key. */
    url: text('url').notNull().unique(),
    titleOriginal: text('title_original').notNull(),
    /** Input for the summary. Never shown on the site. */
    descriptionOriginal: text('description_original'),
    /** When the outlet published the article. */
    publishedAt: integer('published_at', { mode: 'timestamp' }).notNull(),
    /**
     * Current 0-based position in the feed, which is editorially ordered.
     * NULL once the article has dropped out of the feed.
     */
    feedPosition: integer('feed_position'),
    /** Failed summarisation attempts, so a bad item is not retried forever. */
    summaryAttempts: integer('summary_attempts').notNull().default(0),
    /** When we first saw the article. */
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
  },
  (t) => [index('articles_published_at_idx').on(t.publishedAt)],
)

/** Machine-generated English summary of an article. */
export const summaries = sqliteTable('summaries', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  articleId: integer('article_id')
    .notNull()
    .unique()
    .references(() => articles.id, { onDelete: 'cascade' }),
  titleEn: text('title_en').notNull(),
  summaryEn: text('summary_en').notNull(),
  /** Importance 1-10 as judged by the LLM. */
  score: integer('score').notNull(),
  /** Free text; allowed values are enforced by the prompt, not the database. */
  category: text('category'),
  /** Model that produced the summary. */
  model: text('model').notNull(),
  /** Bumped whenever the prompt changes, so stale summaries can be regenerated. */
  promptVersion: integer('prompt_version').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(now),
})

export type Source = typeof sources.$inferSelect
export type Article = typeof articles.$inferSelect
export type Summary = typeof summaries.$inferSelect
