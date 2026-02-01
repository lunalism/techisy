'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, Search, Loader2, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { Article } from '@/types'

interface SearchResult {
  articles: Article[]
  count: number
  query: string
}

function formatRelativeTime(date: Date | string | null): string {
  if (!date) return ''
  const now = new Date()
  const then = new Date(date)
  const diffMs = now.getTime() - then.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return '방금'
  if (diffMins < 60) return `${diffMins}분 전`
  if (diffHours < 24) return `${diffHours}시간 전`
  if (diffDays < 7) return `${diffDays}일 전`
  return then.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

async function searchArticles(query: string): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return { articles: [], count: 0, query }
  }
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchArticles(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
  })

  const handleClear = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3 px-4 h-14">
          <Link
            href="/"
            className="p-2 -ml-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="기사 검색..."
              className="w-full pl-9 pr-9 py-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="pb-nav">
        {query.length < 2 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm">검색어를 2자 이상 입력하세요</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20 text-zinc-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>검색 중...</span>
          </div>
        ) : data?.articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 px-4">
            {data?.articles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="px-2 py-0.5 text-[10px] font-medium text-white uppercase rounded"
                    style={{ backgroundColor: article.sourceColor || '#6B7280' }}
                  >
                    {article.source}
                  </span>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500">
                    {formatRelativeTime(article.publishedAt)}
                  </span>
                </div>
                <h3 className="text-sm font-medium text-zinc-900 dark:text-white leading-relaxed line-clamp-2">
                  {article.title}
                </h3>
              </a>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
