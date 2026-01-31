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
      <Skeleton className="h-5 w-full max-w-md mb-2" />
      <Skeleton className="h-4 w-32" />
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
      <div>
        {Array.from({ length: 10 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        기사를 불러오는데 실패했습니다.
      </div>
    )
  }

  if (!data?.articles.length) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        기사가 없습니다.
      </div>
    )
  }

  return (
    <div>
      {data.articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  )
}
