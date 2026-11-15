import * as schema from '../db/schema'

let db: ReturnType<typeof createDb> | undefined

async function createDb(url: string) {
  const connection = { url, authToken: process.env.TURSO_AUTH_TOKEN }

  if (url.startsWith('file:')) {
    // Local SQLite file for development. Needs the native libSQL binding, which
    // is not included in the production bundle, so it is only loaded on demand.
    const { drizzle } = await import('drizzle-orm/libsql')
    return drizzle({ connection, schema })
  }

  // Remote Turso database over HTTP; no native code, safe for serverless.
  const { drizzle } = await import('drizzle-orm/libsql/web')
  return drizzle({ connection, schema })
}

export function useDb() {
  if (!db) {
    const url = process.env.TURSO_DATABASE_URL
    if (!url) {
      throw createError({ statusCode: 503, statusMessage: 'TURSO_DATABASE_URL is not configured' })
    }
    db = createDb(url)
  }
  return db
}
