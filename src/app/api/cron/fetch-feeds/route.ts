import { NextRequest, NextResponse } from 'next/server'
import { fetchAllFeeds } from '@/lib/rss-fetcher'

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
    const results = await fetchAllFeeds()

    const totalAdded = results.reduce((sum, r) => sum + r.added, 0)
    const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

    return NextResponse.json({
      success: true,
      summary: {
        sourcesProcessed: results.length,
        articlesAdded: totalAdded,
        imagesUpdated: totalUpdated,
        errors: totalErrors,
      },
      details: results,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feeds' },
      { status: 500 }
    )
  }
}
