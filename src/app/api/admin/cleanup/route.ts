import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { shouldIncludeArticle } from '@/lib/article-filter'

export async function POST() {
  try {
    // Get all articles
    const articles = await prisma.article.findMany({
      select: { id: true, title: true },
    })

    // Find non-tech articles
    const toDelete = articles.filter(article => !shouldIncludeArticle(article.title))

    // Delete them
    if (toDelete.length > 0) {
      await prisma.article.deleteMany({
        where: {
          id: { in: toDelete.map(a => a.id) },
        },
      })
    }

    return NextResponse.json({
      success: true,
      deleted: toDelete.length,
      remaining: articles.length - toDelete.length,
      deletedTitles: toDelete.slice(0, 20).map(a => a.title), // Show first 20 for reference
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup articles' },
      { status: 500 }
    )
  }
}
