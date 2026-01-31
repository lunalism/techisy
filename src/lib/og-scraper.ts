import * as cheerio from 'cheerio'

const TIMEOUT = 5000

export async function scrapeOgImage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Techisy/1.0)',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) return null

    const html = await response.text()
    const $ = cheerio.load(html)

    // Try og:image first
    let imageUrl = $('meta[property="og:image"]').attr('content')

    // Fallback to twitter:image
    if (!imageUrl) {
      imageUrl = $('meta[name="twitter:image"]').attr('content')
    }

    // Fallback to twitter:image:src
    if (!imageUrl) {
      imageUrl = $('meta[name="twitter:image:src"]').attr('content')
    }

    if (!imageUrl) return null

    // Handle relative URLs
    if (imageUrl.startsWith('/')) {
      const urlObj = new URL(url)
      imageUrl = `${urlObj.origin}${imageUrl}`
    }

    // Validate it's a proper URL
    try {
      new URL(imageUrl)
      return imageUrl
    } catch {
      return null
    }
  } catch {
    return null
  }
}
