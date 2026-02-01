'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { HeroSection } from './hero-section'
import { ArticleCard } from './article-card'
import { SkeletonHero } from './skeleton-hero'
import { SkeletonCard } from './skeleton-card'
import { Loader2 } from 'lucide-react'
import type { Article, TabValue } from '@/types'

interface ArticleListProps {
  tab: TabValue
}

interface ArticlesResponse {
  articles: Article[]
  nextCursor: string | null
  hasMore: boolean
}

const ARTICLES_PER_PAGE = 20

async function fetchArticles(tab: TabValue, cursor?: string): Promise<ArticlesResponse> {
  const params = new URLSearchParams({
    tab,
    limit: String(ARTICLES_PER_PAGE),
  })
  if (cursor) {
    params.set('cursor', cursor)
  }

  const res = await fetch(`/api/articles?${params}`)
  if (!res.ok) throw new Error('Failed to fetch articles')
  return res.json()
}

export function ArticleList({ tab }: ArticleListProps) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['articles', tab],
    queryFn: ({ pageParam }) => fetchArticles(tab, pageParam as string | undefined),
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
    staleTime: 1000 * 60 * 5,
  })

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  )

  useEffect(() => {
    const element = loadMoreRef.current
    if (!element) return

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0,
    })

    observerRef.current.observe(element)

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [handleObserver])

  if (isLoading) {
    return (
      <div className="space-y-16">
        <SkeletonHero />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
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

  // Flatten all articles from all pages
  const allArticles = data?.pages.flatMap((page) => page.articles) ?? []

  if (!allArticles.length) {
    return (
      <div className="py-24 text-center">
        <p className="text-zinc-400">아직 기사가 없습니다.</p>
        <p className="text-zinc-300 text-sm mt-2">
          Admin에서 피드를 수집해주세요.
        </p>
      </div>
    )
  }

  // First section gets hero treatment
  const heroMain = allArticles[0]
  const heroSide = allArticles[1]
  const remainingArticles = allArticles.slice(2)

  return (
    <div className="space-y-12">
      {/* Hero Section - only for first articles */}
      <HeroSection
        mainArticle={heroMain}
        sideArticle={heroSide}
      />

      {/* Grid of remaining articles */}
      {remainingArticles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          {remainingArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {isFetchingNextPage ? (
          <div className="flex items-center gap-2 text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>더 불러오는 중...</span>
          </div>
        ) : hasNextPage ? (
          <div className="h-10" /> // Invisible trigger area
        ) : allArticles.length > ARTICLES_PER_PAGE ? (
          <p className="text-zinc-400 text-sm">더 이상 기사가 없습니다</p>
        ) : null}
      </div>
    </div>
  )
}
