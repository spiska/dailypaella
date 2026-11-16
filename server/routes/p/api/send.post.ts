// Forwards tracker events to Umami Cloud. The tracker posts to
// `${data-host-url}/api/send`, so with host URL `<origin>/p` it lands here.
// The visitor's user agent and IP are passed on exactly as Umami would have
// received them directly; nothing is stored here.
const UPSTREAM = 'https://gateway.umami.is/api/send'

export default defineEventHandler(async (event) => {
  const body = await readRawBody(event)
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Empty body' })

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'user-agent': getRequestHeader(event, 'user-agent') ?? '',
  }
  const ip = getRequestIP(event, { xForwardedFor: true })
  if (ip) headers['x-forwarded-for'] = ip

  const response = await fetch(UPSTREAM, { method: 'POST', headers, body })
  setResponseStatus(event, response.status)
  setResponseHeader(event, 'content-type', response.headers.get('content-type') ?? 'text/plain')
  return response.text()
})
