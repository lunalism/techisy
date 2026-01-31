'use client'

import { useQuery } from '@tanstack/react-query'
import { ArticleCard } from './article-card'
import { Skeleton } from '@/components/ui/skeleton'
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
    <div className="py-4 border-b border-border">
      <Skeleton className="h-5 w-full max-w-lg mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}

export function ArticleList({ tab }: ArticleListProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['articles', tab],
    queryFn: () => fetchArticles(tab),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  if (isLoading) {
    return (
      <div className="space-y-0">
        {Array.from({ length: 10 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Failed to load articles. Please try again.
      </div>
    )
  }

  if (!data?.articles.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        No articles found. Try fetching feeds first.
      </div>
    )
  }

  return (
    <div className="space-y-0">
      {data.articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
