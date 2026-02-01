'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { Article } from '@/types'

interface SearchBarProps {
  onClose?: () => void
  isMobile?: boolean
}

interface SearchResult {
  articles: Article[]
  count: number
  query: string
}

async function searchArticles(query: string): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return { articles: [], count: 0, query }
  }
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

export function SearchBar({ onClose, isMobile }: SearchBarProps) {
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
    <div className={`${isMobile ? 'p-4' : ''}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="기사 검색..."
          className="w-full pl-10 pr-10 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300 dark:focus:ring-zinc-600"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {debouncedQuery.length >= 2 && (
        <div className={`mt-3 ${isMobile ? 'max-h-[60vh] overflow-y-auto' : 'absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 z-50'}`}>
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
                  className="block p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  onClick={onClose}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 px-2 py-0.5 text-[10px] font-medium text-white uppercase rounded"
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
  )
}
