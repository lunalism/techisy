import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const RETENTION_DAYS = 7
const MIN_ARTICLES = 100

export async function GET(request: NextRequest) {
  // Verify cron secret in production
  const authHeader = request.headers.get('authorization')
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Calculate cutoff date (7 days ago)
    const cutoffDate = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000)

    // Count total articles
    const totalArticles = await prisma.article.count()

    // Count articles older than cutoff
    const oldArticlesCount = await prisma.article.count({
      where: {
        createdAt: { lt: cutoffDate },
      },
    })

    // Don't delete if it would leave fewer than MIN_ARTICLES
    const articlesToKeep = totalArticles - oldArticlesCount
    if (articlesToKeep < MIN_ARTICLES && totalArticles >= MIN_ARTICLES) {
      return NextResponse.json({
        success: true,
        message: `Skipped cleanup to maintain minimum ${MIN_ARTICLES} articles`,
        stats: {
          totalArticles,
          oldArticles: oldArticlesCount,
          deleted: 0,
        },
      })
    }

    // Delete old articles
    const result = await prisma.article.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
      },
    })

    console.log(`[Cleanup] Deleted ${result.count} articles older than ${RETENTION_DAYS} days`)

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} articles older than ${RETENTION_DAYS} days`,
      stats: {
        totalBefore: totalArticles,
        oldArticles: oldArticlesCount,
        deleted: result.count,
        totalAfter: totalArticles - result.count,
        cutoffDate: cutoffDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup old articles' },
      { status: 500 }
    )
  }
}
