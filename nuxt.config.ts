// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'The Daily Paella',
      htmlAttrs: { lang: 'en' },
      meta: [
        {
          name: 'description',
          content: 'Spanish news, summarised in English. Every story links to the original article.',
        },
      ],
    },
  },

  // The overview changes a few times a day, so serve it from cache and only
  // touch the database when the cache is refreshed.
  routeRules: {
    '/': { isr: 3600 },
  },

  nitro: {
    vercel: {
      config: {
        // Lets the ingestion workflow refresh the cached page right after new
        // articles land: request `/` with header `x-prerender-revalidate: <token>`.
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      },
    },
  },
})
