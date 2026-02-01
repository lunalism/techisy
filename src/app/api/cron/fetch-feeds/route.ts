import { NextRequest, NextResponse } from 'next/server'
import { fetchAllFeeds } from '@/lib/rss-fetcher'

const SOURCES_PER_GROUP = 5

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
    // Parse group parameter (1-5 for pagination, undefined for all)
    const groupParam = request.nextUrl.searchParams.get('group')
    const group = groupParam ? parseInt(groupParam, 10) : undefined

    let fetchOptions: { skip?: number; take?: number } | undefined
    if (group && group >= 1 && group <= 5) {
      fetchOptions = {
        skip: (group - 1) * SOURCES_PER_GROUP,
        take: SOURCES_PER_GROUP,
      }
    }

    const results = await fetchAllFeeds(fetchOptions)

    const totalAdded = results.reduce((sum, r) => sum + r.added, 0)
    const totalUpdated = results.reduce((sum, r) => sum + r.updated, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)

    return NextResponse.json({
      success: true,
      group: group ?? 'all',
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
