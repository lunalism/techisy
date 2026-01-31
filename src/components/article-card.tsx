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

function getSourceColor(source: string): string {
  const colors: Record<string, string> = {
    'Techmeme': 'bg-rose-100 text-rose-700',
    'TechCrunch': 'bg-emerald-100 text-emerald-700',
    'The Verge': 'bg-purple-100 text-purple-700',
    '바이라인네트워크': 'bg-blue-100 text-blue-700',
    '디지털투데이': 'bg-amber-100 text-amber-700',
    '아이티데일리': 'bg-cyan-100 text-cyan-700',
    '블로터': 'bg-green-100 text-green-700',
    '지디넷코리아': 'bg-orange-100 text-orange-700',
  }
  return colors[source] || 'bg-zinc-100 text-zinc-600'
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <article className="h-full bg-white border border-zinc-200 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
        <div className="flex flex-col h-full">
          <span
            className={`self-start px-2.5 py-1 text-[11px] font-semibold rounded-md ${getSourceColor(article.source)}`}
          >
            {article.source}
          </span>

          <h3 className="mt-3 text-[15px] font-semibold text-zinc-900 leading-snug line-clamp-3 flex-1">
            {article.title}
          </h3>

          {article.publishedAt && (
            <p className="mt-3 text-xs text-zinc-400">
              {formatTimeAgo(article.publishedAt)}
            </p>
          )}
        </div>
      </article>
    </a>
  )
}
