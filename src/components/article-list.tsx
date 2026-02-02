'use client'

import { useEffect, useRef, useCallback, useMemo } from 'react'
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
const HERO_ARTICLES = 2
const GRID_ARTICLES = 16 // 4 columns x 4 rows

// Remove duplicate articles by URL and title
function deduplicateArticles(articles: Article[]): Article[] {
  const seenUrls = new Set<string>()
  const seenTitles = new Set<string>()
  return articles.filter((article) => {
    // Check URL duplicate
    if (seenUrls.has(article.url)) {
      return false
    }
    // Check title duplicate (normalize: lowercase, trim)
    const normalizedTitle = article.title.toLowerCase().trim()
    if (seenTitles.has(normalizedTitle)) {
      return false
    }
    seenUrls.add(article.url)
    seenTitles.add(normalizedTitle)
    return true
  })
}

// Split articles into sections (hero 2 + grid 16 = 18 per section)
interface Section {
  heroMain: Article
  heroSide: Article | undefined
  gridArticles: Article[]
  reverse: boolean
}

function splitIntoSections(articles: Article[]): Section[] {
  const sections: Section[] = []
  let index = 0
  let sectionIndex = 0

  while (index < articles.length) {
    const heroMain = articles[index]
    if (!heroMain) break // Safety check

    const heroSide = articles[index + 1]
    const gridStart = index + HERO_ARTICLES
    const gridEnd = Math.min(gridStart + GRID_ARTICLES, articles.length)
    const gridArticles = gridStart < articles.length
      ? articles.slice(gridStart, gridEnd)
      : []

    sections.push({
      heroMain,
      heroSide,
      gridArticles,
      reverse: sectionIndex % 2 === 1,
    })

    // Ensure progress to avoid infinite loop
    const nextIndex = Math.max(gridEnd, index + 1)
    if (nextIndex <= index) break
    index = nextIndex
    sectionIndex++
  }

  return sections
}

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

  // Flatten all articles from all pages and deduplicate
  const allArticles = useMemo(() => {
    const articles = data?.pages.flatMap((page) => page.articles) ?? []
    return deduplicateArticles(articles)
  }, [data])

  // Split into sections for repeating hero pattern
  const sections = useMemo(() => splitIntoSections(allArticles), [allArticles])

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

  return (
    <div className="space-y-12">
      {sections.map((section, idx) => {
        if (!section.heroMain) return null
        return (
          <div key={idx} className="space-y-12">
            {/* Hero Section */}
            <HeroSection
              mainArticle={section.heroMain}
              sideArticle={section.heroSide}
              reverse={section.reverse}
            />

            {/* Grid of articles (4 columns x 4 rows) */}
            {section.gridArticles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
                {section.gridArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            )}
          </div>
        )
      })}

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
