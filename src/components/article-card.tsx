import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (minutes > 0) return `${minutes}m ago`
  return 'just now'
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Card className="border-0 border-b border-border rounded-none shadow-none hover:bg-muted/50 transition-colors">
      <CardContent className="px-0 py-4">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block"
        >
          <h3 className="text-base font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
            {article.title}
          </h3>
        </a>
        <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Badge variant="secondary" className="font-normal">
            {article.source}
          </Badge>
          {article.publishedAt && (
            <span>{formatTimeAgo(article.publishedAt)}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
