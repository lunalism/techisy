import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalArticles, totalSources, activeSources] = await Promise.all([
      prisma.article.count(),
      prisma.source.count(),
      prisma.source.count({ where: { active: true } }),
    ])

    return NextResponse.json({
      totalArticles,
      totalSources,
      activeSources,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
