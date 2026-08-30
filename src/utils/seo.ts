const SITE_URL = 'https://petruc.ci'

function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl
  const p = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`
  return `${SITE_URL}${p}`
}

export const seo = ({
  title,
  description,
  keywords,
  image,
  url,
  imageAlt,
}: {
  title: string
  description?: string
  image?: string
  keywords?: string
  url?: string
  imageAlt?: string
}) => {
  const absImage = image ? absoluteUrl(image) : undefined
  const absUrl = url ? absoluteUrl(url) : SITE_URL

  const tags: Record<string, unknown>[] = [
    { title },
    { name: 'description', content: description },
    ...(keywords ? [{ name: 'keywords', content: keywords }] : []),
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:creator', content: '@leonardopetrucci' },
    { name: 'twitter:site', content: '@leonardopetrucci' },
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: absUrl },
    ...(absImage
      ? [
          { name: 'twitter:image', content: absImage },
          { name: 'twitter:card', content: 'summary_large_image' },
          { property: 'og:image', content: absImage },
          { property: 'og:image:width', content: '1200' },
          { property: 'og:image:height', content: '630' },
          { property: 'og:image:alt', content: imageAlt ?? title },
        ]
      : [{ name: 'twitter:card', content: 'summary' }]),
  ]

  // Drop entries with empty content (e.g. undefined description)
  return tags.filter((t) => {
    const c = (t as { content?: string }).content
    return c !== undefined && c !== ''
  })
}
