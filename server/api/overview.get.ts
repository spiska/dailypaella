import { desc, eq, gte } from 'drizzle-orm'
import { articles, sources } from '../db/schema'

const WINDOW_HOURS = 36
const MAX_CANDIDATES = 200
const MAX_ITEMS = 30

/** The current overview: recent articles, most important first. */
export default defineEventHandler(async () => {
  const db = await useDb()
  const since = new Date(Date.now() - WINDOW_HOURS * 3_600_000)

  const rows = await db
    .select({
      id: articles.id,
      url: articles.url,
      titleEn: articles.titleEn,
      summaryEn: articles.summaryEn,
      category: articles.category,
      publishedAt: articles.publishedAt,
      feedPosition: articles.feedPosition,
      llmScore: articles.llmScore,
      sourceName: sources.name,
      sourceUrl: sources.homepageUrl,
    })
    .from(articles)
    .innerJoin(sources, eq(articles.sourceId, sources.id))
    .where(gte(articles.publishedAt, since))
    .orderBy(desc(articles.publishedAt))
    .limit(MAX_CANDIDATES)

  return rankArticles(rows).slice(0, MAX_ITEMS)
})
