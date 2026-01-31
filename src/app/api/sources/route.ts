import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSourceSchema = z.object({
  name: z.string().min(1),
  rssUrl: z.string().url(),
  country: z.enum(['US', 'KR']),
  active: z.boolean().default(true),
})

export async function GET() {
  try {
    const sources = await prisma.source.findMany({
      orderBy: [{ country: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(sources)
  } catch (error) {
    console.error('Failed to fetch sources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sources' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSourceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.issues },
        { status: 400 }
      )
    }

    const source = await prisma.source.create({
      data: parsed.data,
    })

    return NextResponse.json(source, { status: 201 })
  } catch (error) {
    console.error('Failed to create source:', error)
    return NextResponse.json(
      { error: 'Failed to create source' },
      { status: 500 }
    )
  }
}
