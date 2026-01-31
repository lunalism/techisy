import Parser from 'rss-parser'
import { prisma } from './prisma'

const parser = new Parser()

export interface FeedItem {
  title: string
  link: string
  pubDate?: string
  isoDate?: string
}

export interface FetchResult {
  source: string
  added: number
  errors: string[]
}

export async function fetchRssFeed(
  rssUrl: string,
  sourceName: string
): Promise<FetchResult> {
  const result: FetchResult = {
    source: sourceName,
    added: 0,
    errors: [],
  }

  try {
    const feed = await parser.parseURL(rssUrl)

    for (const item of feed.items) {
      if (!item.title || !item.link) continue

      try {
        await prisma.article.upsert({
          where: { url: item.link },
          update: {},
          create: {
            title: item.title,
            url: item.link,
            source: sourceName,
            sourceUrl: rssUrl,
            publishedAt: item.isoDate ? new Date(item.isoDate) : null,
          },
        })
        result.added++
      } catch (err) {
        // Skip duplicate URLs silently
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

export async function fetchAllFeeds(): Promise<FetchResult[]> {
  const sources = await prisma.source.findMany({
    where: { active: true },
  })

  const results: FetchResult[] = []

  for (const source of sources) {
    const result = await fetchRssFeed(source.rssUrl, source.name)
    results.push(result)
  }

  return results
}
