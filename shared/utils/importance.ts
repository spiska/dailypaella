export type Importance = 'major' | 'standard' | 'minor'

/**
 * Maps the LLM's 1-10 score to a display tier. Thresholds follow the scoring
 * guide in the summary prompt: 8+ is a major national or international story,
 * 1-4 is minor, lifestyle, opinion or promotional content.
 */
export function importance(score: number): Importance {
  if (score >= 8) return 'major'
  if (score <= 4) return 'minor'
  return 'standard'
}
