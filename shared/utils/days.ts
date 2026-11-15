// Calendar days on the site follow Spanish time, wherever the server or reader is.
// A day is passed around as a 'YYYY-MM-DD' string.

const TIME_ZONE = 'Europe/Madrid'

const partsFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

function madridParts(at: Date) {
  const parts: Record<string, number> = {}
  for (const { type, value } of partsFormat.formatToParts(at)) {
    if (type !== 'literal') parts[type] = Number(value)
  }
  return parts as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>
}

const pad = (n: number) => String(n).padStart(2, '0')

/** The Madrid calendar day an instant falls on. */
export function madridDay(at: Date): string {
  const p = madridParts(at)
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`
}

/** The instant a Madrid calendar day starts (local midnight). */
export function madridDayStart(day: string): Date {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number]
  const utcMidnight = Date.UTC(y, m - 1, d)
  const p = madridParts(new Date(utcMidnight))
  const offset = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - utcMidnight
  return new Date(utcMidnight - offset)
}

export function addDays(day: string, count: number): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number]
  return new Date(Date.UTC(y, m - 1, d + count)).toISOString().slice(0, 10)
}

export function isValidDay(day: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return false
  return addDays(day, 0) === day
}

const headingFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

/** 'Sunday 15 November 2026' */
export function formatDay(day: string): string {
  return headingFormat.format(new Date(`${day}T00:00:00Z`))
}

const timeFormat = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
})

/** Time of day in Madrid, e.g. '19:30'. */
export function formatMadridTime(at: Date | string): string {
  return timeFormat.format(new Date(at))
}
