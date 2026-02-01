import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Basic counts
    const [totalArticles, todayArticles, totalSources, activeSources] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({
        where: {
          createdAt: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.source.count(),
      prisma.source.count({ where: { active: true } }),
    ])

    // Get all sources with colors
    const sources = await prisma.source.findMany({
      select: { name: true, color: true, country: true },
    })
    const sourceMap = new Map(sources.map(s => [s.name, { color: s.color, country: s.country }]))

    // Articles by source
    const articlesBySourceRaw = await prisma.article.groupBy({
      by: ['source'],
      _count: { source: true },
      orderBy: { _count: { source: 'desc' } },
    })

    const articlesBySource = articlesBySourceRaw.map(item => ({
      name: item.source,
      count: item._count.source,
      color: sourceMap.get(item.source)?.color || '#6B7280',
    }))

    // Articles by country
    const krSources = sources.filter(s => s.country === 'KR').map(s => s.name)
    const usSources = sources.filter(s => s.country === 'US').map(s => s.name)

    const [krCount, usCount] = await Promise.all([
      prisma.article.count({ where: { source: { in: krSources } } }),
      prisma.article.count({ where: { source: { in: usSources } } }),
    ])

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
