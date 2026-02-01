'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { TabValue } from '@/types'

interface HeaderProps {
  tab: TabValue
  onTabChange: (tab: TabValue) => void
}

interface AuthState {
  user: { id: string; email: string } | null
  isAdmin: boolean
}

const tabs: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'global', label: 'Global' },
  { value: 'korea', label: 'Korea' },
]

export function Header({ tab, onTabChange }: HeaderProps) {
  const router = useRouter()
  const [auth, setAuth] = useState<AuthState | null>(null)

  useEffect(() => {
    async function fetchAuth() {
      const res = await fetch('/api/auth/user')
      const data = await res.json()
      setAuth(data)
    }
    fetchAuth()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuth({ user: null, isAdmin: false })
    router.refresh()
  }

  return (
    <header className="bg-white sticky top-0 z-10 border-b border-zinc-100">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Techisy
            </h1>
          </Link>

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-1">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  onClick={() => onTabChange(t.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    tab === t.value
                      ? 'bg-zinc-900 text-white'
                      : 'text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4 pl-4 border-l border-zinc-100">
              {auth?.isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  Admin
                </Link>
              )}

              {auth?.user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-zinc-400 hover:text-zinc-900 transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
