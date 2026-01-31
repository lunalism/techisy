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
    <article className="py-4 border-b border-border last:border-b-0 hover:bg-muted/30 transition-colors -mx-4 px-4">
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        className="group block"
      >
        <h3 className="text-[15px] font-medium text-foreground leading-relaxed group-hover:text-primary/80 transition-colors">
          {article.title}
        </h3>
      </a>
      <p className="mt-1.5 text-sm text-muted-foreground">
        {article.source}
        {article.publishedAt && (
          <>
            <span className="mx-1.5">·</span>
            {formatTimeAgo(article.publishedAt)}
          </>
        )}
      </p>
    </article>
  )
}
