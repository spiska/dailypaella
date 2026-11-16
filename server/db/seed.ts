// Inserts the initial sources. Safe to run repeatedly.
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { sources } from './schema.ts'

const url = process.env.TURSO_DATABASE_URL
if (!url) throw new Error('TURSO_DATABASE_URL is not set')

const db = drizzle(createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN || undefined }))

await db
  .insert(sources)
  .values([
    {
      slug: 'elpais',
      name: 'El País',
      homepageUrl: 'https://elpais.com',
      feedUrl: 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada',
    },
    {
      slug: '20minutos',
      name: '20minutos',
      homepageUrl: 'https://www.20minutos.es',
      feedUrl: 'https://www.20minutos.es/rss/',
    },
  ])
  .onConflictDoNothing({ target: sources.slug })

console.log('Sources seeded.')
