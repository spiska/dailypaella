import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema'

let db: ReturnType<typeof createDb> | undefined

function createDb(url: string) {
  return drizzle(neon(url), { schema })
}

export function useDb() {
  if (!db) {
    const url = process.env.DATABASE_URL
    if (!url) {
      throw createError({ statusCode: 503, statusMessage: 'DATABASE_URL is not configured' })
    }
    db = createDb(url)
  }
  return db
}
