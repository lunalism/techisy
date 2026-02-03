import { prisma } from './prisma'

const LOCK_ID = 'fetch-feeds'
const LOCK_TTL_MINUTES = 5

export type LockHolder = 'admin' | 'cron'

export interface LockStatus {
  isLocked: boolean
  lockedBy?: LockHolder
  lockedAt?: Date
  expiresAt?: Date
}

export async function acquireLock(holder: LockHolder): Promise<{ acquired: boolean; status: LockStatus }> {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + LOCK_TTL_MINUTES * 60 * 1000)

  console.log(`[FetchLock] Attempting to acquire lock for ${holder}`)

  try {
    // Check existing lock
    const existing = await prisma.fetchLock.findUnique({
      where: { id: LOCK_ID },
    })
    console.log(`[FetchLock] Existing lock:`, existing ? `by ${existing.lockedBy}, expires ${existing.expiresAt}` : 'none')

    if (existing) {
      // Check if lock is expired (stale)
      if (existing.expiresAt > now) {
        // Lock is still valid - cannot acquire
        return {
          acquired: false,
          status: {
            isLocked: true,
            lockedBy: existing.lockedBy as LockHolder,
            lockedAt: existing.lockedAt,
            expiresAt: existing.expiresAt,
          },
        }
      }
      // Lock is expired - update it (take over)
      await prisma.fetchLock.update({
        where: { id: LOCK_ID },
        data: {
          lockedAt: now,
          lockedBy: holder,
          expiresAt,
        },
      })
    } else {
      // No lock exists - create one
      await prisma.fetchLock.create({
        data: {
          id: LOCK_ID,
          lockedAt: now,
          lockedBy: holder,
          expiresAt,
        },
      })
    }

    console.log(`[FetchLock] Lock acquired by ${holder}, expires at ${expiresAt}`)
    return {
      acquired: true,
      status: {
        isLocked: true,
        lockedBy: holder,
        lockedAt: now,
        expiresAt,
      },
    }
  } catch (error) {
    console.error(`[FetchLock] Error acquiring lock:`, error)
    // If FetchLock table doesn't exist or other DB error, allow fetch to proceed
    // This ensures fetch works even before the table is created
    const errorMessage = error instanceof Error ? error.message : String(error)
    const isTableMissing = errorMessage.includes('does not exist') ||
                           errorMessage.includes('P2021') ||
                           errorMessage.includes('relation')

    if (isTableMissing) {
      console.warn('FetchLock table not found, proceeding without lock')
      return {
        acquired: true, // Allow fetch to proceed
        status: { isLocked: false },
      }
    }

    // Handle race condition where another process created the lock
    console.error('Failed to acquire lock:', error)
    try {
      const currentLock = await prisma.fetchLock.findUnique({
        where: { id: LOCK_ID },
      })

      return {
        acquired: false,
        status: currentLock
          ? {
              isLocked: true,
              lockedBy: currentLock.lockedBy as LockHolder,
              lockedAt: currentLock.lockedAt,
              expiresAt: currentLock.expiresAt,
            }
          : { isLocked: false },
      }
    } catch {
      // If even the fallback query fails, allow fetch to proceed
      console.warn('Lock check failed, proceeding without lock')
      return {
        acquired: true,
        status: { isLocked: false },
      }
    }
  }
}

export async function releaseLock(holder: LockHolder): Promise<boolean> {
  try {
    const existing = await prisma.fetchLock.findUnique({
      where: { id: LOCK_ID },
    })

    // Only release if we own the lock
    if (existing && existing.lockedBy === holder) {
      await prisma.fetchLock.delete({
        where: { id: LOCK_ID },
      })
      return true
    }
    return false
  } catch (error) {
    // If table doesn't exist, just return true (nothing to release)
    const errorMessage = error instanceof Error ? error.message : String(error)
    if (errorMessage.includes('does not exist') ||
        errorMessage.includes('P2021') ||
        errorMessage.includes('relation')) {
      return true
    }
    console.error('Failed to release lock:', error)
    return false
  }
}

export async function getLockStatus(): Promise<LockStatus> {
  const now = new Date()

  try {
    const lock = await prisma.fetchLock.findUnique({
      where: { id: LOCK_ID },
    })

    if (!lock) {
      return { isLocked: false }
    }

    // Check if expired
    if (lock.expiresAt <= now) {
      // Clean up expired lock
      await prisma.fetchLock.delete({
        where: { id: LOCK_ID },
      }).catch(() => {}) // Ignore errors
      return { isLocked: false }
    }

    return {
      isLocked: true,
      lockedBy: lock.lockedBy as LockHolder,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt,
    }
  } catch (error) {
    console.error('Failed to get lock status:', error)
    return { isLocked: false }
  }
}
