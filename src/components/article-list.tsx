'use client'

import { useQuery } from '@tanstack/react-query'
import { HeroSection } from './hero-section'
import { ArticleCard } from './article-card'
import { SkeletonHero } from './skeleton-hero'
import { SkeletonCard } from './skeleton-card'
import type { Article, TabValue } from '@/types'

interface ArticleListProps {
  tab: TabValue
}

interface ArticlesResponse {
  articles: Article[]
  nextCursor: string | null
  hasMore: boolean
}

interface Section {
  mainArticle: Article
  sideArticle?: Article
  cards: Article[]
}

async function fetchArticles(tab: TabValue): Promise<ArticlesResponse> {
  const res = await fetch(`/api/articles?tab=${tab}&limit=50`)
  if (!res.ok) throw new Error('Failed to fetch articles')
  return res.json()
}

function chunkArticles(articles: Article[]): Section[] {
  const sections: Section[] = []
  let index = 0

  while (index < articles.length) {
    const mainArticle = articles[index]
    const sideArticle = articles[index + 1]
    const cards = articles.slice(index + 2, index + 10)
    sections.push({ mainArticle, sideArticle, cards })
    index += 10
  }

  return sections
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

  const sections = chunkArticles(data.articles)

  return (
    <div className="space-y-16">
      {sections.map((section, sectionIndex) => (
        <div key={sectionIndex} className="space-y-10">
          {/* Hero Section with alternating layout */}
          <HeroSection
            mainArticle={section.mainArticle}
            sideArticle={section.sideArticle}
            reverse={sectionIndex % 2 === 1}
          />

          {/* 4-Column Grid */}
          {section.cards.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
              {section.cards.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
