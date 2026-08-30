import { defineEventHandler, getHeader, sendRedirect, getRequestURL } from 'h3'

export default defineEventHandler((event) => {
  const host = getHeader(event, 'host')?.split(':')[0]?.toLowerCase()
  if (host === 'petruc.ci' || host === 'www.petruc.ci') {
    const url = getRequestURL(event)
    const target = `https://leonardo.petruc.ci${url.pathname}${url.search}`
    if (event.node?.res) {
      event.node.res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
      event.node.res.setHeader('Pragma', 'no-cache')
    }
    return sendRedirect(event, target, 302)
  }
})
