import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { acquireLock, releaseLock, getLockStatus, type LockHolder } from '@/lib/fetch-lock'

async function getHolder(request: NextRequest): Promise<LockHolder | null> {
  if (process.env.NODE_ENV !== 'production') {
    return 'admin'
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
    return 'cron'
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user?.email === 'chris@techisy.io') {
      return 'admin'
    }
  } catch (e) {
    console.error('Auth check failed:', e)
  }

  return null
}

// POST /api/cron/fetch-feeds/lock - Acquire lock
export async function POST(request: NextRequest) {
  const holder = await getHolder(request)
  if (!holder) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await acquireLock(holder)

  if (!result.acquired) {
    const lockedBy = result.status.lockedBy === 'admin' ? 'Admin' : 'Cron'
    return NextResponse.json(
      {
        error: 'Already fetching',
        message: `${lockedBy}에서 이미 수집 중입니다. 잠시 후 다시 시도해주세요.`,
        lockedBy: result.status.lockedBy,
        expiresAt: result.status.expiresAt,
      },
      { status: 409 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Lock acquired',
    expiresAt: result.status.expiresAt,
  })
}

// DELETE /api/cron/fetch-feeds/lock - Release lock
export async function DELETE(request: NextRequest) {
  const holder = await getHolder(request)
  if (!holder) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const released = await releaseLock(holder)

  return NextResponse.json({
    success: true,
    released,
  })
}

// GET /api/cron/fetch-feeds/lock - Check lock status
export async function GET(request: NextRequest) {
  const holder = await getHolder(request)
  if (!holder) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const status = await getLockStatus()

  return NextResponse.json(status)
}
