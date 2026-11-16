// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  app: {
    head: {
      title: 'The Daily Paella',
      htmlAttrs: { lang: 'en' },
      link: [
        { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
      meta: [
        {
          name: 'description',
          content: 'Spanish news, summarised in English. Every story links to the original article.',
        },
      ],
    },
  },

  runtimeConfig: {
    public: {
      // Set with NUXT_PUBLIC_UMAMI_WEBSITE_ID; analytics stay off while it is empty.
      umami: {
        websiteId: '',
      },
    },
  },

  // Fonts are self-hosted so visitors make no requests to third parties.
  css: ['@fontsource-variable/inter', '@fontsource-variable/fraunces'],

  // The overview changes a few times a day, so serve it from cache and only
  // touch the database when the cache is refreshed.
  routeRules: {
    '/': { isr: 3600 },
    '/day/**': { isr: 3600 },
  },

  nitro: {
    vercel: {
      config: {
        // Allows refreshing a cached page on demand: request it with the
        // header `x-prerender-revalidate: <token>`.
        bypassToken: process.env.VERCEL_BYPASS_TOKEN,
      },
    },
  },
})
