import Image from 'next/image'
import type { Article } from '@/types'

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

function getSourceColor(source: string): { bg: string; text: string; gradient: string } {
  const colors: Record<string, { bg: string; text: string; gradient: string }> = {
    // US Sources
    'TechCrunch': { bg: 'bg-emerald-100', text: 'text-emerald-700', gradient: 'from-emerald-500 to-teal-500' },
    'The Verge': { bg: 'bg-purple-100', text: 'text-purple-700', gradient: 'from-purple-500 to-violet-500' },
    'Wired': { bg: 'bg-slate-100', text: 'text-slate-700', gradient: 'from-slate-600 to-slate-800' },
    'Ars Technica': { bg: 'bg-orange-100', text: 'text-orange-700', gradient: 'from-orange-500 to-red-500' },
    'Engadget': { bg: 'bg-blue-100', text: 'text-blue-700', gradient: 'from-blue-500 to-indigo-500' },
    'Reuters Tech': { bg: 'bg-amber-100', text: 'text-amber-700', gradient: 'from-amber-500 to-orange-500' },
    // KR Sources
    '전자신문': { bg: 'bg-indigo-100', text: 'text-indigo-700', gradient: 'from-indigo-500 to-purple-500' },
    '테크M': { bg: 'bg-sky-100', text: 'text-sky-700', gradient: 'from-sky-500 to-blue-500' },
    '플래텀': { bg: 'bg-rose-100', text: 'text-rose-700', gradient: 'from-rose-500 to-pink-500' },
    '디지털투데이': { bg: 'bg-violet-100', text: 'text-violet-700', gradient: 'from-violet-500 to-purple-500' },
  }
  return colors[source] || { bg: 'bg-zinc-100', text: 'text-zinc-600', gradient: 'from-zinc-400 to-zinc-500' }
}

export function ArticleCard({ article }: ArticleCardProps) {
  const sourceColor = getSourceColor(article.source)

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <article className="h-full bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
        {/* Image or gradient placeholder */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {article.imageUrl ? (
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${sourceColor.gradient} opacity-80`} />
          )}
          {/* Source badge overlay */}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-md ${sourceColor.bg} ${sourceColor.text} shadow-sm`}
            >
              {article.source}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-[15px] font-semibold text-zinc-900 leading-snug line-clamp-2 group-hover:text-zinc-700 transition-colors">
            {article.title}
          </h3>

          {article.publishedAt && (
            <p className="mt-2 text-xs text-zinc-400">
              {formatTimeAgo(article.publishedAt)}
            </p>
          )}
        </div>
      </article>
    </a>
  )
}
