import Image from 'next/image'
import { Clock } from 'lucide-react'
import type { Article } from '@/types'

interface HeroSectionProps {
  mainArticle: Article
  sideArticle?: Article
  reverse?: boolean
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

function MainArticle({ article }: { article: Article }) {
  const sourceColor = article.sourceColor || '#6B7280'

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group lg:col-span-3"
    >
      {/* Mobile: Image above text */}
      <article className="lg:hidden">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="100vw"
              priority
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800" />
          )}
        </div>
        <div className="pt-4">
          <span
            className="inline-block px-2 py-1 text-xs font-medium text-white uppercase tracking-wide rounded"
            style={{ backgroundColor: sourceColor }}
          >
            {article.source}
          </span>
          <h2 className="mt-2 text-xl font-bold text-zinc-900 dark:text-white leading-snug line-clamp-3 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
            {article.title}
          </h2>
          {article.publishedAt && (
            <div className="flex items-center gap-1.5 mt-3 text-sm text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          )}
        </div>
      </article>

      {/* Desktop: Overlay style */}
      <article className="hidden lg:block relative h-full min-h-[480px] rounded-2xl overflow-hidden">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="75vw"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-300 to-zinc-400 dark:from-zinc-700 dark:to-zinc-800" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-10">
          <span
            className="inline-block px-3 py-1 text-xs font-medium text-white uppercase tracking-wide rounded"
            style={{ backgroundColor: sourceColor }}
          >
            {article.source}
          </span>

          <h2 className="mt-4 text-3xl lg:text-4xl font-bold text-white leading-tight group-hover:text-white/90 transition-colors">
            {article.title}
          </h2>

          {article.publishedAt && (
            <div className="flex items-center gap-1.5 mt-4 text-sm text-white/70">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          )}
        </div>
      </article>
    </a>
  )
}

function SideArticle({ article }: { article: Article }) {
  const sourceColor = article.sourceColor || '#6B7280'

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group lg:col-span-1"
    >
      {/* Mobile: Image above text */}
      <article className="lg:hidden">
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-zinc-100 dark:bg-zinc-800">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
          )}
        </div>
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
          {article.publishedAt && (
            <div className="flex items-center gap-1.5 mt-3 text-sm text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          )}
        </div>
      </article>

      {/* Desktop: Overlay style */}
      <article className="hidden lg:block relative h-full min-h-[480px] rounded-2xl overflow-hidden">
        {article.imageUrl ? (
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="25vw"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <span
            className="inline-block px-2.5 py-1 text-[11px] font-medium text-white uppercase tracking-wide rounded"
            style={{ backgroundColor: sourceColor }}
          >
            {article.source}
          </span>

          <h3 className="mt-3 text-lg font-bold text-white leading-snug line-clamp-3 group-hover:text-white/90 transition-colors">
            {article.title}
          </h3>

          {article.publishedAt && (
            <div className="flex items-center gap-1.5 mt-3 text-xs text-white/70">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTimeAgo(article.publishedAt)}</span>
            </div>
          )}
        </div>
      </article>
    </a>
  )
}

export function HeroSection({ mainArticle, sideArticle, reverse = false }: HeroSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-6">
      {reverse ? (
        <>
          {sideArticle && <SideArticle article={sideArticle} />}
          <MainArticle article={mainArticle} />
        </>
      ) : (
        <>
          <MainArticle article={mainArticle} />
          {sideArticle && <SideArticle article={sideArticle} />}
        </>
      )}
    </div>
  )
}
