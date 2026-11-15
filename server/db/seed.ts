// Inserts the initial sources. Safe to run repeatedly.
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { sources } from './schema.ts'

const url = process.env.DATABASE_URL
if (!url) throw new Error('DATABASE_URL is not set')

const db = drizzle(neon(url))

await db
  .insert(sources)
  .values([
    {
      slug: 'elpais',
      name: 'El País',
      homepageUrl: 'https://elpais.com',
      feedUrl: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
    },
  ])
  .onConflictDoNothing({ target: sources.slug })

console.log('Sources seeded.')
