'use client'

import { useQuery } from '@tanstack/react-query'
import { ArticleCard } from './article-card'
import type { Article, TabValue } from '@/types'

interface ArticleListProps {
  tab: TabValue
}

interface ArticlesResponse {
  articles: Article[]
  nextCursor: string | null
  hasMore: boolean
}

async function fetchArticles(tab: TabValue): Promise<ArticlesResponse> {
  const res = await fetch(`/api/articles?tab=${tab}&limit=50`)
  if (!res.ok) throw new Error('Failed to fetch articles')
  return res.json()
}

function ArticleSkeleton() {
  return (
    <div className="py-5 animate-pulse">
      <div className="h-5 bg-zinc-100 rounded w-full max-w-lg mb-3" />
      <div className="flex items-center gap-2">
        <div className="h-5 bg-zinc-100 rounded w-16" />
        <div className="h-4 bg-zinc-50 rounded w-12" />
      </div>
    </div>
  )
}

export function ArticleList({ tab }: ArticleListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', tab],
    queryFn: () => fetchArticles(tab),
    staleTime: 1000 * 60 * 5,
  })

  if (isLoading) {
    return (
      <div className="divide-y divide-zinc-100">
        {Array.from({ length: 5 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-400 text-sm">기사를 불러오는데 실패했습니다.</p>
      </div>
    )
  }

  if (!data?.articles.length) {
    return (
      <div className="py-16 text-center">
        <p className="text-zinc-400 text-sm">아직 기사가 없습니다.</p>
        <p className="text-zinc-300 text-xs mt-1">
          Admin에서 피드를 수집해주세요.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-zinc-100">
      {data.articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
