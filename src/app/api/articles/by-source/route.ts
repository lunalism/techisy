import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sourceName = searchParams.get('source')

    if (!sourceName) {
      return NextResponse.json(
        { error: 'Source name is required' },
        { status: 400 }
      )
    }

    const result = await prisma.article.deleteMany({
      where: { source: sourceName },
    })

    return NextResponse.json({
      success: true,
      deleted: result.count,
    })
  } catch (error) {
    console.error('Failed to delete articles:', error)
    return NextResponse.json(
      { error: 'Failed to delete articles' },
      { status: 500 }
    )
  }
}
