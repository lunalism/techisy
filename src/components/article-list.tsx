'use client'

import { useQuery } from '@tanstack/react-query'
import { HeroArticle } from './hero-article'
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

function HeroSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-zinc-100 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[16/10] lg:aspect-auto lg:min-h-[400px] bg-zinc-200" />
      <div className="flex flex-col justify-center p-8 lg:p-12">
        <div className="h-6 w-24 bg-zinc-200 rounded-full mb-4" />
        <div className="space-y-3">
          <div className="h-8 bg-zinc-200 rounded w-full" />
          <div className="h-8 bg-zinc-200 rounded w-4/5" />
        </div>
        <div className="h-4 w-20 bg-zinc-200 rounded mt-6" />
      </div>
    </div>
  )
}

function ArticleSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[16/10] bg-zinc-100 rounded-xl" />
      <div className="pt-4">
        <div className="h-3 w-16 bg-zinc-100 rounded" />
        <div className="space-y-2 mt-2">
          <div className="h-5 bg-zinc-100 rounded w-full" />
          <div className="h-5 bg-zinc-100 rounded w-3/4" />
        </div>
        <div className="h-3 w-20 bg-zinc-50 rounded mt-3" />
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
      <div className="space-y-16">
        <HeroSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <ArticleSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-24 text-center">
        <p className="text-zinc-400">기사를 불러오는데 실패했습니다.</p>
      </div>
    )
  }

  if (!data?.articles.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-zinc-400">아직 기사가 없습니다.</p>
        <p className="text-zinc-300 text-sm mt-2">
          Admin에서 피드를 수집해주세요.
        </p>
      </div>
    )
  }

  const [heroArticle, ...restArticles] = data.articles

  return (
    <div className="space-y-16">
      {/* Hero Article */}
      {heroArticle && <HeroArticle article={heroArticle} />}

      {/* Article Grid */}
      {restArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-12">
          {restArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
