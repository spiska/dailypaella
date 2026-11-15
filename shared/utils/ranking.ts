export interface RankingSignals {
  publishedAt: Date
  feedPosition: number | null
  llmScore: number | null
}

const NEUTRAL_LLM_SCORE = 5
const MAX_POSITION_BONUS = 2
const HALF_LIFE_HOURS = 12

/**
 * Placeholder importance formula: LLM score plus a bonus for sitting high in the
 * feed, halved every 12 hours of age. Tune freely; the raw signals stay in the DB.
 */
export function rankScore(a: RankingSignals, now: Date = new Date()): number {
  const base = a.llmScore ?? NEUTRAL_LLM_SCORE
  const positionBonus = a.feedPosition == null ? 0 : MAX_POSITION_BONUS / (1 + a.feedPosition / 5)
  const ageHours = Math.max(0, (now.getTime() - a.publishedAt.getTime()) / 3_600_000)
  return (base + positionBonus) * 0.5 ** (ageHours / HALF_LIFE_HOURS)
}

export function rankArticles<T extends RankingSignals>(items: T[], now: Date = new Date()): T[] {
  return items
    .map((item) => ({ item, score: rankScore(item, now) }))
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item)
}
