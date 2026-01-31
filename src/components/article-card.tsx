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

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="py-5 group">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <h3 className="text-[17px] font-semibold text-zinc-900 leading-snug group-hover:underline underline-offset-2 decoration-zinc-300">
          {article.title}
        </h3>
      </a>
      <div className="mt-2 flex items-center gap-2">
        <span className="inline-flex items-center px-2 py-0.5 text-[11px] font-medium bg-zinc-100 text-zinc-600 rounded">
          {article.source}
        </span>
        {article.publishedAt && (
          <span className="text-xs text-zinc-400">
            {formatTimeAgo(article.publishedAt)}
          </span>
        )}
      </div>
    </article>
  )
}
