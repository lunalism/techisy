'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2, Sun, Moon, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { SettingsDropdown } from './settings-dropdown'
import type { TabValue, Article } from '@/types'

interface HeaderProps {
  tab: TabValue
  onTabChange: (tab: TabValue) => void
}

interface AuthState {
  user: { id: string; email: string } | null
  isAdmin: boolean
}

interface SearchResult {
  articles: Article[]
  count: number
  query: string
}

const tabs: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'global', label: 'Global' },
  { value: 'korea', label: 'Korea' },
]

async function searchArticles(query: string): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return { articles: [], count: 0, query }
  }
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export function Header({ tab, onTabChange }: HeaderProps) {
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function fetchAuth() {
      const res = await fetch('/api/auth/user')
      const data = await res.json()
      setAuth(data)
    }
    fetchAuth()
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
        if (!query) {
          setSearchExpanded(false)
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [query])

  // Focus input when search expands
  useEffect(() => {
    if (searchExpanded && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchExpanded])

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchArticles(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setAuth({ user: null, isAdmin: false })
    router.refresh()
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  const handleSearchClose = () => {
    setQuery('')
    setShowResults(false)
    setSearchExpanded(false)
  }

  return (
    <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-zinc-200/50 dark:border-zinc-800/50">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left: Logo + Tabs */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
                <span className="text-blue-600 dark:text-blue-400">Tech</span>isy
              </h1>
            </Link>

            {/* Tabs - Desktop */}
            <nav className="hidden md:flex items-center gap-1">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  onClick={() => onTabChange(t.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    tab === t.value
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Search + Theme + Settings */}
          <div className="flex items-center gap-2">
            {/* Expandable Search */}
            <div ref={searchRef} className="relative">
              {searchExpanded ? (
                <div className="flex items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        setShowResults(true)
                      }}
                      onFocus={() => query.length >= 2 && setShowResults(true)}
                      placeholder="기사 검색..."
                      className="w-48 md:w-64 pl-9 pr-8 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                      onClick={handleSearchClose}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSearchExpanded(true)}
                  className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title="검색"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}

              {/* Search Results Dropdown */}
              {showResults && debouncedQuery.length >= 2 && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 max-h-96 overflow-y-auto z-50">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8 text-zinc-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span>검색 중...</span>
                    </div>
                  ) : data?.articles.length === 0 ? (
                    <div className="py-8 text-center text-zinc-400">
                      검색 결과가 없습니다
                    </div>
                  ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
                      {data?.articles.map((article) => (
                        <a
                          key={article.id}
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                          onClick={() => setShowResults(false)}
                        >
                          <div className="flex items-start gap-2">
                            <span
                              className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium text-white uppercase rounded"
                              style={{ backgroundColor: article.sourceColor || '#6B7280' }}
                            >
                              {article.source}
                            </span>
                            <h4 className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">
                              {article.title}
                            </h4>
                          </div>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            {resolvedTheme && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title={resolvedTheme === 'dark' ? '라이트 모드' : '다크 모드'}
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>
            )}

            {/* Settings Dropdown */}
            <SettingsDropdown auth={auth} onLogout={handleLogout} />
          </div>
        </div>

        {/* Mobile Tabs */}
        <nav className="md:hidden flex items-center justify-center gap-1 pb-3 -mt-1">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => onTabChange(t.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                tab === t.value
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
