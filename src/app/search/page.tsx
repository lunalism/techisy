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

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

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

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="p-2 text-zinc-500">
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
              className="w-full pl-10 pr-10 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-base"
            />
            {query && (
              <button
                onClick={() => { setQuery(''); inputRef.current?.focus() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {query.length < 2 ? (
          <div className="text-center py-16 text-zinc-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">검색어를 2자 이상 입력하세요</p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16 text-zinc-400">
            <Loader2 className="w-6 h-6 mx-auto mb-2 animate-spin" />
            <p className="text-sm">검색 중...</p>
          </div>
        ) : data?.articles.length === 0 ? (
          <div className="text-center py-16 text-zinc-400">
            <p className="text-sm">검색 결과가 없습니다</p>
          </div>
        ) : (
          <div>
            {data?.articles.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block py-3 border-b border-zinc-100 dark:border-zinc-800"
              >
                <span
                  className="inline-block px-2 py-0.5 text-[10px] font-medium text-white rounded mb-1"
                  style={{ backgroundColor: article.sourceColor || '#6B7280' }}
                >
                  {article.source}
                </span>
                <p className="text-sm text-zinc-900 dark:text-white mb-1">
                  {article.title}
                </p>
                <span className="text-xs text-zinc-400">
                  {formatRelativeTime(article.publishedAt)}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
