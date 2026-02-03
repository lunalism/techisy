import { NextResponse } from 'next/server'
import { getActiveSourceCount } from '@/lib/rss-fetcher'
import { SOURCES_PER_GROUP } from '@/app/api/cron/fetch-feeds/route'

export async function GET() {
  try {
    const totalSources = await getActiveSourceCount()
    const totalGroups = Math.ceil(totalSources / SOURCES_PER_GROUP)

    return NextResponse.json({
      totalSources,
      totalGroups,
      sourcesPerGroup: SOURCES_PER_GROUP,
    })
  } catch (error) {
    console.error('Failed to get source info:', error)
    return NextResponse.json(
      { error: 'Failed to get source info' },
      { status: 500 }
    )
  }
}
