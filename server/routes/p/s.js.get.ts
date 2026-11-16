// Serves the Umami tracker from our own domain so content blockers that block
// cloud.umami.is do not stop it. The neutral path is deliberate.
const UPSTREAM = 'https://cloud.umami.is/script.js'

export default defineCachedEventHandler(
  async (event) => {
    const script = await $fetch<string>(UPSTREAM, { responseType: 'text' })
    setResponseHeader(event, 'content-type', 'application/javascript; charset=utf-8')
    return script
  },
  { name: 'umami-script', maxAge: 60 * 60 * 6, swr: true },
)
