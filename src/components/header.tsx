'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Search, Loader2 } from 'lucide-react'
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
  const [auth, setAuth] = useState<AuthState | null>(null)
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

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
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  return (
    <header className="bg-white dark:bg-zinc-900 sticky top-0 z-20 border-b border-zinc-100 dark:border-zinc-800">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Techisy
            </h1>
          </Link>

          {/* Desktop Search Input */}
          <div ref={searchRef} className="hidden lg:block flex-1 max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => query.length >= 2 && setShowResults(true)}
                placeholder="기사 검색..."
                className="w-full pl-9 pr-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-base text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
              />
            </div>

            {/* Search Results Dropdown */}
            {showResults && debouncedQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 max-h-96 overflow-y-auto z-50">
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

          <div className="flex items-center gap-6">
            <nav className="flex items-center gap-1">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  onClick={() => onTabChange(t.value)}
                  className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                    tab === t.value
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>

            {/* Desktop only - settings and auth */}
            <div className="hidden lg:flex items-center gap-2 pl-4 border-l border-zinc-100 dark:border-zinc-800">
              <SettingsDropdown />

              {auth?.isAdmin && (
                <Link
                  href="/admin"
                  className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Admin
                </Link>
              )}

              {auth?.user ? (
                <button
                  onClick={handleLogout}
                  className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Logout
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
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
