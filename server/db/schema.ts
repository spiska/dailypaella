import { boolean, index, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'

/** A news outlet and the RSS feed we read from it. Adding a source is one row here. */
export const sources = pgTable('sources', {
  id: serial('id').primaryKey(),
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  homepageUrl: text('homepage_url').notNull(),
  feedUrl: text('feed_url').notNull(),
  region: text('region'),
  enabled: boolean('enabled').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

/**
 * One feed item with its machine-generated English summary.
 * Only RSS title + description are ever processed; no images, no full article text.
 */
export const articles = pgTable(
  'articles',
  {
    id: serial('id').primaryKey(),
    sourceId: integer('source_id')
      .notNull()
      .references(() => sources.id),
    /** Link to the original article. Also the deduplication key. */
    url: text('url').notNull().unique(),
    titleOriginal: text('title_original').notNull(),
    titleEn: text('title_en').notNull(),
    summaryEn: text('summary_en').notNull(),
    category: text('category'),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),

    // Ranking signals are stored separately so the formula can change without reprocessing.
    /** 0-based position in the feed at ingestion time (front-page feeds are editorially ordered). */
    feedPosition: integer('feed_position'),
    /** Importance 1-10 as judged by the LLM during summarisation. */
    llmScore: integer('llm_score'),

    /** Model that produced the summary. */
    model: text('model').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('articles_published_at_idx').on(t.publishedAt)],
)

export type Source = typeof sources.$inferSelect
export type Article = typeof articles.$inferSelect
