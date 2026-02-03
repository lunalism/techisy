import { NextRequest, NextResponse } from 'next/server'
import { fetchAllFeeds, getActiveSourceCount } from '@/lib/rss-fetcher'
import { createClient } from '@/lib/supabase/server'

export const SOURCES_PER_GROUP = 3

// Shared authentication logic
async function checkAuth(request: NextRequest): Promise<{ authorized: boolean; error?: NextResponse }> {
  if (process.env.NODE_ENV !== 'production') {
    return { authorized: true }
  }

  const authHeader = request.headers.get('authorization')
  const isValidCron = authHeader === `Bearer ${process.env.CRON_SECRET}`

  if (isValidCron) {
    return { authorized: true }
  }

  // Check admin session
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === 'chris@techisy.io') {
      return { authorized: true }
    }
  } catch (e) {
    console.error('Auth check failed:', e)
  }

  return {
    authorized: false,
    error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
  }
}

// Shared fetch logic
async function handleFetchFeeds(request: NextRequest): Promise<NextResponse> {
  try {
    // Get total source count for dynamic group calculation
    const totalSources = await getActiveSourceCount()
    const totalGroups = Math.ceil(totalSources / SOURCES_PER_GROUP)

    // Parse and validate group parameter
    const groupParam = request.nextUrl.searchParams.get('group')
    const group = groupParam ? parseInt(groupParam, 10) : undefined

    // Validate group parameter
    if (group !== undefined) {
      if (isNaN(group) || group < 1) {
        return NextResponse.json(
          { error: 'Invalid group parameter. Must be a positive integer.' },
          { status: 400 }
        )
      }
      if (group > totalGroups) {
        // Return empty result for out-of-range groups (graceful handling)
        return NextResponse.json({
          success: true,
          group,
          groupInfo: { totalSources, totalGroups, sourcesPerGroup: SOURCES_PER_GROUP },
          summary: {
            sourcesProcessed: 0,
            articlesAdded: 0,
            imagesUpdated: 0,
            errors: 0,
          },
          details: [],
        })
      }
    }

    let fetchOptions: { skip?: number; take?: number } | undefined
    if (group && group >= 1 && group <= totalGroups) {
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
      groupInfo: { totalSources, totalGroups, sourcesPerGroup: SOURCES_PER_GROUP },
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

// POST handler (recommended)
export async function POST(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.error!

  return handleFetchFeeds(request)
}

// GET handler (deprecated, kept for backwards compatibility)
export async function GET(request: NextRequest) {
  const auth = await checkAuth(request)
  if (!auth.authorized) return auth.error!

  return handleFetchFeeds(request)
}
