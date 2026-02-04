'use client'

import Image from 'next/image'
import { Clock } from 'lucide-react'
import type { Article } from '@/types'
import { useLayout } from '@/contexts/layout-context'

interface ArticleCardProps {
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

export function ArticleCard({ article }: ArticleCardProps) {
  const { layout } = useLayout()
  const sourceColor = article.sourceColor || '#6B7280'

  // Card layout (image above, text below)
  if (layout === 'card') {
    return (
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block group"
      >
        <article className="h-full">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
            {article.imageUrl ? (
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
            )}
          </div>

          {/* Content */}
          <div className="pt-4">
            <span
              className="inline-block px-2 py-1 text-xs font-medium text-white uppercase tracking-wide rounded"
              style={{ backgroundColor: sourceColor }}
            >
              {article.source}
            </span>

            <h3 className="mt-2 text-lg font-bold text-zinc-900 dark:text-white leading-snug line-clamp-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
              {article.title}
            </h3>

            {article.description && (
              <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                {article.description}
              </p>
            )}

            {article.publishedAt && (
              <div className="flex items-center gap-1.5 mt-2 text-sm text-zinc-400">
                <Clock className="w-3.5 h-3.5" />
                <span>{formatTimeAgo(article.publishedAt)}</span>
              </div>
            )}
          </div>
        </article>
      </a>
    )
  }

  // Overlay layout (text on image)
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <article className="relative aspect-[4/3] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
        {/* Image */}
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span
            className="inline-block px-2 py-1 text-[10px] font-medium text-white uppercase tracking-wide rounded"
            style={{ backgroundColor: sourceColor }}
          >
            {article.source}
          </span>

          <h3 className="mt-2 text-base font-bold text-white leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
            {article.title}
          </h3>

          {article.description && (
            <p className="mt-1.5 text-xs text-white/60 leading-relaxed line-clamp-2">
              {article.description}
            </p>
          )}

          {article.publishedAt && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-white/70">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          )}
        </div>
      </article>
    </a>
  )
}
