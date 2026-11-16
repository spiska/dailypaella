// Forwards tracker events to Umami Cloud. The tracker posts to
// `${data-host-url}/api/send`, so with host URL `<origin>/p` it lands here.
//
// Umami Cloud sits behind its own proxy, which records the address of whoever
// connects to it: our server, not the visitor. Forwarded headers lose to that,
// so the visitor's IP and user agent go into the event itself, where Umami
// gives them priority. Nothing is stored here.
const UPSTREAM = 'https://gateway.umami.is/api/send'

export default defineEventHandler(async (event) => {
  const raw = await readRawBody(event)
  if (!raw) throw createError({ statusCode: 400, statusMessage: 'Empty body' })

  let body: { payload?: Record<string, unknown> }
  try {
    body = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  }

  const userAgent = getRequestHeader(event, 'user-agent') ?? ''
  const ip = getRequestIP(event, { xForwardedFor: true })

  if (body.payload && typeof body.payload === 'object') {
    if (ip) body.payload.ip = ip
    if (userAgent) body.payload.userAgent = userAgent
  }

  const headers: Record<string, string> = { 'content-type': 'application/json', 'user-agent': userAgent }
  if (ip) headers['x-forwarded-for'] = ip

  const response = await fetch(UPSTREAM, { method: 'POST', headers, body: JSON.stringify(body) })
  setResponseStatus(event, response.status)
  setResponseHeader(event, 'content-type', response.headers.get('content-type') ?? 'text/plain')
  return response.text()
})
