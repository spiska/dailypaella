import { defineConfig } from 'drizzle-kit'

try {
  process.loadEnvFile()
} catch {
  // No .env file; rely on the environment.
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dbCredentials: { url: process.env.DATABASE_URL! },
})
