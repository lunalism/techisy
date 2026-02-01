import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Source } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ articles: [], message: '검색어를 2자 이상 입력해주세요' })
    }

    // Get source colors
    const sources = await prisma.source.findMany()
    const sourceColorMap = new Map<string, string>()
    sources.forEach((s: Source) => sourceColorMap.set(s.name, s.color))

    // Search articles by title
    const articles = await prisma.article.findMany({
      where: {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 20,
    })

    // Add source colors
    const articlesWithColors = articles.map((article) => ({
      ...article,
      sourceColor: sourceColorMap.get(article.source) || '#6B7280',
    }))

    return NextResponse.json({
      articles: articlesWithColors,
      count: articlesWithColors.length,
      query,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    )
  }
}
