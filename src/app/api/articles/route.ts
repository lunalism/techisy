import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import type { Source } from '@prisma/client'

const querySchema = z.object({
  tab: z.enum(['all', 'global', 'korea']).default('all'),
  limit: z.coerce.number().min(1).max(100).default(50),
  cursor: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = querySchema.safeParse({
      tab: searchParams.get('tab') || 'all',
      limit: searchParams.get('limit') || 50,
      cursor: searchParams.get('cursor') || undefined,
    })

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 })
    }

    const { tab, limit, cursor } = parsed.data

    // Get sources by country for filtering
    const sources = await prisma.source.findMany({
      where: { active: true },
    })

    // Create source color map
    const sourceColorMap = new Map<string, string>()
    sources.forEach((s: Source) => sourceColorMap.set(s.name, s.color))

    const globalSources = sources
      .filter((s: Source) => s.country === 'US')
      .map((s: Source) => s.name)
    const koreaSources = sources
      .filter((s: Source) => s.country === 'KR')
      .map((s: Source) => s.name)

    // Build where clause based on tab
    const whereClause =
      tab === 'global'
        ? { source: { in: globalSources } }
        : tab === 'korea'
          ? { source: { in: koreaSources } }
          : {}

    const articles = await prisma.article.findMany({
      where: {
        ...whereClause,
        ...(cursor ? { id: { lt: cursor } } : {}),
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit + 1,
    })

    const hasMore = articles.length > limit
    const data = hasMore ? articles.slice(0, -1) : articles
    const nextCursor = hasMore ? data[data.length - 1]?.id : null

    // Add sourceColor to each article
    const articlesWithColors = data.map((article) => ({
      ...article,
      sourceColor: sourceColorMap.get(article.source) || '#6B7280',
    }))

    return NextResponse.json({
      articles: articlesWithColors,
      nextCursor,
      hasMore,
    })
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}
