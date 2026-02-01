'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AdminSidebar } from '@/components/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authState, setAuthState] = useState<'loading' | 'authorized' | 'unauthorized'>('loading')

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirectTo=/admin')
        return
      }

      const res = await fetch('/api/auth/check-admin')
      const { isAdmin } = await res.json()

      if (!isAdmin) {
        setAuthState('unauthorized')
        return
      }

      setAuthState('authorized')
    }

    checkAuth()
  }, [router])

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-zinc-500">인증 확인 중...</div>
      </div>
    )
  }

  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">접근 권한 없음</h1>
          <p className="text-zinc-500">관리자만 접근할 수 있습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden">
      <AdminSidebar />
      <main className="ml-64 h-screen overflow-y-auto bg-zinc-50">
        {children}
      </main>
    </div>
  )
}
