import Image from 'next/image'
import { Clock } from 'lucide-react'
import type { Article } from '@/types'

interface HeroArticleProps {
  article: Article
}

function formatTimeAgo(date: Date | null): string {
  if (!date) return ''

  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (minutes > 0) return `${minutes}분 전`
  return '방금 전'
}

export function HeroArticle({ article }: HeroArticleProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <article className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-zinc-100 rounded-2xl overflow-hidden">
        {/* Image */}
        <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[420px] overflow-hidden">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-300 to-zinc-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8 lg:p-12 lg:pr-16">
          <span className="inline-block px-3 py-1 text-xs font-medium text-zinc-600 bg-white rounded-full w-fit mb-4">
            {article.source}
          </span>

          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight group-hover:text-zinc-700 transition-colors">
            {article.title}
          </h2>

          {article.publishedAt && (
            <div className="flex items-center gap-1.5 mt-6 text-sm text-zinc-500">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          )}
        </div>
      </article>
    </a>
  )
}
