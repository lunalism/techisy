import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { shouldIncludeArticle } from '@/lib/article-filter'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Admin session check
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user?.email !== 'chris@techisy.io') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if deleteAll is requested
    const { searchParams } = new URL(request.url)
    const deleteAll = searchParams.get('deleteAll') === 'true'

    if (deleteAll) {
      // Delete ALL articles
      const result = await prisma.article.deleteMany()
      return NextResponse.json({
        success: true,
        deleted: result.count,
        remaining: 0,
        mode: 'deleteAll',
      })
    }

    // Default: only delete non-tech articles
    const articles = await prisma.article.findMany({
      select: { id: true, title: true },
    })

    const toDelete = articles.filter(article => !shouldIncludeArticle(article.title))

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
      mode: 'nonTech',
      deletedTitles: toDelete.slice(0, 20).map(a => a.title),
    })
  } catch (error) {
    console.error('Cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup articles' },
      { status: 500 }
    )
  }
}
