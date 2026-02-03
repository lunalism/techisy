import Parser from 'rss-parser'
import { prisma } from './prisma'
import { scrapeOgImage } from './og-scraper'
import { shouldIncludeArticle } from './article-filter'

const RSS_TIMEOUT_MS = 5000

const parser = new Parser({
  timeout: RSS_TIMEOUT_MS,
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; Techisy/1.0)',
  },
})

// Get count of active sources for dynamic group calculation
export async function getActiveSourceCount(): Promise<number> {
  return prisma.source.count({ where: { active: true } })
}

// Parse publish date with fallbacks
function parsePublishDate(item: Parser.Item): Date {
  // Try isoDate first (already parsed by rss-parser)
  if (item.isoDate) {
    return new Date(item.isoDate)
  }
  // Try pubDate string
  if (item.pubDate) {
    const parsed = new Date(item.pubDate)
    if (!isNaN(parsed.getTime())) {
      return parsed
    }
  }
  // Fallback to current time
  return new Date()
}

export interface FetchResult {
  source: string
  added: number
  updated: number
  filtered: number
  errors: string[]
}

// Helper to add timeout to any promise
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), ms)
    ),
  ])
}

export async function fetchRssFeed(
  rssUrl: string,
  sourceName: string
): Promise<FetchResult> {
  const result: FetchResult = {
    source: sourceName,
    added: 0,
    updated: 0,
    filtered: 0,
    errors: [],
  }

  try {
    const feed = await withTimeout(
      parser.parseURL(rssUrl),
      RSS_TIMEOUT_MS,
      `Timeout after ${RSS_TIMEOUT_MS / 1000}s`
    )

    for (const item of feed.items) {
      if (!item.title || !item.link) continue

      // Smart filter: skip non-tech articles
      if (!shouldIncludeArticle(item.title)) {
        result.filtered++
        continue
      }

      try {
        // Check if article exists
        const existing = await prisma.article.findUnique({
          where: { url: item.link },
        })

        if (existing) {
          // Update image if missing
          if (!existing.imageUrl) {
            const imageUrl = await scrapeOgImage(item.link)
            if (imageUrl) {
              await prisma.article.update({
                where: { url: item.link },
                data: { imageUrl },
              })
              result.updated++
            }
          }
        } else {
          // Create new article with image
          const imageUrl = await scrapeOgImage(item.link)
          await prisma.article.create({
            data: {
              title: item.title,
              url: item.link,
              source: sourceName,
              sourceUrl: rssUrl,
              imageUrl,
              publishedAt: parsePublishDate(item),
            },
          })
          result.added++
        }
      } catch (err) {
        if (!(err instanceof Error && err.message.includes('Unique constraint'))) {
          result.errors.push(`Failed to save: ${item.title}`)
        }
      }
    }
  } catch (err) {
    result.errors.push(`Failed to fetch feed: ${err instanceof Error ? err.message : 'Unknown error'}`)
  }

  return result
}

export async function fetchAllFeeds(options?: {
  skip?: number
  take?: number
}): Promise<FetchResult[]> {
  const sources = await prisma.source.findMany({
    where: { active: true },
    orderBy: { id: 'asc' },
    skip: options?.skip,
    take: options?.take,
  })

  const results: FetchResult[] = []

  for (const source of sources) {
    const result = await fetchRssFeed(source.rssUrl, source.name)
    results.push(result)
  }

  return results
}

// Update images for articles without images
export async function updateMissingImages(): Promise<{ updated: number; failed: number }> {
  const articles = await prisma.article.findMany({
    where: { imageUrl: null },
    take: 50,
  })

  let updated = 0
  let failed = 0

  for (const article of articles) {
    try {
      const imageUrl = await scrapeOgImage(article.url)
      if (imageUrl) {
        await prisma.article.update({
          where: { id: article.id },
          data: { imageUrl },
        })
        updated++
      } else {
        failed++
      }
    } catch {
      failed++
    }
  }

  return { updated, failed }
}
