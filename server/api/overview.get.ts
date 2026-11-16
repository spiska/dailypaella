import { and, asc, desc, eq, gte, lt } from 'drizzle-orm'
import { articles, sources, summaries } from '../db/schema'

const HOME_DAYS = 2
const MAX_ROWS = 1000

/**
 * Summarised articles grouped by Madrid calendar day, newest day first. Within a
 * day stories are chronological, newest first; importance (`score`) is returned
 * so the page can show it visually instead of reordering.
 *
 * - `?day=YYYY-MM-DD` returns that single day.
 * - Without `day` it returns the latest day that has stories plus the day before.
 *
 * `older` / `newer` are the nearest days outside the returned range that have
 * stories, for navigation.
 */
export default defineEventHandler(async (event) => {
  const db = await useDb()
  const requested = getQuery(event).day

  // Only articles that already have a summary are ever shown.
  const summarised = () =>
    db.select({ publishedAt: articles.publishedAt }).from(articles).innerJoin(summaries, eq(summaries.articleId, articles.id))

  let lastDay: string
  let dayCount: number

  if (requested === undefined) {
    const [latest] = await summarised().orderBy(desc(articles.publishedAt)).limit(1)
    if (!latest) return { days: [], older: null, newer: null }
    lastDay = madridDay(latest.publishedAt)
    dayCount = HOME_DAYS
  } else {
    if (typeof requested !== 'string' || !isValidDay(requested)) {
      throw createError({ statusCode: 400, statusMessage: 'day must be a valid YYYY-MM-DD date' })
    }
    lastDay = requested
    dayCount = 1
  }

  const firstDay = addDays(lastDay, -(dayCount - 1))
  const start = madridDayStart(firstDay)
  const end = madridDayStart(addDays(lastDay, 1))

  const [rows, [older], [newer]] = await Promise.all([
    db
      .select({
        id: articles.id,
        url: articles.url,
        titleEn: summaries.titleEn,
        summaryEn: summaries.summaryEn,
        category: summaries.category,
        score: summaries.score,
        publishedAt: articles.publishedAt,
        sourceName: sources.name,
        sourceUrl: sources.homepageUrl,
      })
      .from(articles)
      .innerJoin(summaries, eq(summaries.articleId, articles.id))
      .innerJoin(sources, eq(articles.sourceId, sources.id))
      .where(and(gte(articles.publishedAt, start), lt(articles.publishedAt, end)))
      .orderBy(desc(articles.publishedAt), desc(articles.id))
      .limit(MAX_ROWS),
    summarised().where(lt(articles.publishedAt, start)).orderBy(desc(articles.publishedAt)).limit(1),
    summarised().where(gte(articles.publishedAt, end)).orderBy(asc(articles.publishedAt)).limit(1),
  ])

  // Rows arrive newest first; grouping keeps that order within each day.
  const byDay = new Map<string, typeof rows>()
  for (const row of rows) {
    const day = madridDay(row.publishedAt)
    const group = byDay.get(day)
    if (group) group.push(row)
    else byDay.set(day, [row])
  }

  const days = [...byDay.entries()]
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([day, items]) => ({ day, items }))

  return {
    days,
    older: older ? madridDay(older.publishedAt) : null,
    newer: newer ? madridDay(newer.publishedAt) : null,
  }
})
