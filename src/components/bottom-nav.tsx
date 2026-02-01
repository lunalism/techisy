'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Home, Search, Settings, User, Sun, Moon, Monitor, X, LayoutGrid, Layers } from 'lucide-react'
import { useLayout } from '@/contexts/layout-context'

const themeOptions = [
  { value: 'light', label: '라이트', icon: Sun },
  { value: 'dark', label: '다크', icon: Moon },
  { value: 'system', label: '시스템', icon: Monitor },
]

const layoutOptions = [
  { value: 'card', label: '카드형', icon: LayoutGrid },
  { value: 'overlay', label: '오버레이', icon: Layers },
]

interface AuthState {
  user: { id: string; email: string } | null
  isAdmin: boolean
}

export function BottomNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { layout, setLayout } = useLayout()
  const [mounted, setMounted] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [auth, setAuth] = useState<AuthState | null>(null)

  useEffect(() => {
    setMounted(true)

    async function fetchAuth() {
      const res = await fetch('/api/auth/user')
      const data = await res.json()
      setAuth(data)
    }
    fetchAuth()
  }, [])

  const isHome = pathname === '/'
  const isSearch = pathname === '/search'
  const isLoggedIn = !!auth?.user
  const isAdmin = auth?.isAdmin ?? false

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 lg:hidden pb-safe">
        <div className="flex items-center justify-around h-16">
          {/* Home */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isHome
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <Home className="w-6 h-6" />
            <span className="text-xs mt-1">홈</span>
          </Link>

          {/* Search */}
          <Link
            href="/search"
            className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
              isSearch
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-400 dark:text-zinc-500'
            }`}
          >
            <Search className="w-6 h-6" />
            <span className="text-xs mt-1">검색</span>
          </Link>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex flex-col items-center justify-center flex-1 h-full text-zinc-400 dark:text-zinc-500 transition-colors"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-1">설정</span>
          </button>

          {/* Login / Admin */}
          {isLoggedIn ? (
            isAdmin ? (
              <Link
                href="/admin"
                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                  pathname.startsWith('/admin')
                    ? 'text-zinc-900 dark:text-white'
                    : 'text-zinc-400 dark:text-zinc-500'
                }`}
              >
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">Admin</span>
              </Link>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 h-full text-zinc-400 dark:text-zinc-500">
                <User className="w-6 h-6" />
                <span className="text-xs mt-1">프로필</span>
              </div>
            )
          ) : (
            <Link
              href="/login"
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                pathname === '/login'
                  ? 'text-zinc-900 dark:text-white'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs mt-1">로그인</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Settings Bottom Sheet */}
      {showSettings && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setShowSettings(false)}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 rounded-t-2xl lg:hidden pb-safe animate-slide-up">
            <div className="p-4">
              {/* Handle */}
              <div className="w-10 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />

              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">설정</h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme Options */}
              <div className="mb-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">테마</p>
                <div className="space-y-1">
                  {mounted && themeOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = theme === option.value

                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setTheme(option.value)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{option.label}</span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Layout Options */}
              <div className="mb-4">
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">레이아웃</p>
                <div className="space-y-1">
                  {mounted && layoutOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = layout === option.value

                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          setLayout(option.value as 'card' | 'overlay')
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                          isSelected
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                            : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="flex-1 text-left">{option.label}</span>
                        {isSelected && (
                          <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
