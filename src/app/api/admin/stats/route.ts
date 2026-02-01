import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all sources first (fast query)
    const sources = await prisma.source.findMany({
      select: { name: true, color: true, country: true, active: true },
    })

    const totalSources = sources.length
    const activeSources = sources.filter(s => s.active).length
    const sourceMap = new Map(sources.map(s => [s.name, { color: s.color, country: s.country }]))

    // Basic counts - run sequentially for connection pool stability
    const totalArticles = await prisma.article.count()

    const todayArticles = await prisma.article.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Articles by source - use raw SQL for better performance
    const articlesBySourceRaw = await prisma.$queryRaw<Array<{ source: string; count: bigint }>>`
      SELECT source, COUNT(*) as count
      FROM "Article"
      GROUP BY source
      ORDER BY count DESC
    `

    const articlesBySource = articlesBySourceRaw.map(item => ({
      name: item.source,
      count: Number(item.count),
      color: sourceMap.get(item.source)?.color || '#6B7280',
    }))

    // Articles by country - calculate from articlesBySource
    const krSources = new Set(sources.filter(s => s.country === 'KR').map(s => s.name))
    let krCount = 0
    let usCount = 0

    articlesBySource.forEach(item => {
      if (krSources.has(item.name)) {
        krCount += item.count
      } else {
        usCount += item.count
      }
    })

    // Recent articles
    const recentArticles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        source: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentArticlesWithColor = recentArticles.map(article => ({
      ...article,
      color: sourceMap.get(article.source)?.color || '#6B7280',
    }))

    return NextResponse.json({
      totalArticles,
      todayArticles,
      totalSources,
      activeSources,
      articlesBySource,
      articlesByCountry: {
        KR: krCount,
        US: usCount,
      },
      recentArticles: recentArticlesWithColor,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
