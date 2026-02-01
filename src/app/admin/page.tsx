'use client'

import { useQuery } from '@tanstack/react-query'
import { Newspaper, Calendar, Rss, Globe, Clock } from 'lucide-react'

interface SourceStat {
  name: string
  count: number
  color: string
}

interface RecentArticle {
  id: string
  title: string
  source: string
  createdAt: string
  color: string
}

interface Stats {
  totalArticles: number
  todayArticles: number
  totalSources: number
  activeSources: number
  articlesBySource: SourceStat[]
  articlesByCountry: { KR: number; US: number }
  recentArticles: RecentArticle[]
}

async function fetchStats(): Promise<Stats> {
  const res = await fetch('/api/admin/stats')
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}일 전`
  if (hours > 0) return `${hours}시간 전`
  if (minutes > 0) return `${minutes}분 전`
  return '방금 전'
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  })

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-8">대시보드</h1>
        <div className="text-zinc-500">로딩 중...</div>
      </div>
    )
  }

  const maxArticleCount = stats?.articlesBySource[0]?.count || 1

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">대시보드</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Newspaper className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">총 기사</p>
              <p className="text-3xl font-bold text-zinc-900">
                {stats?.totalArticles.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">오늘 수집</p>
              <p className="text-3xl font-bold text-zinc-900">
                {stats?.todayArticles.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Rss className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">활성 소스</p>
              <p className="text-3xl font-bold text-zinc-900">
                {stats?.activeSources}
                <span className="text-sm font-normal text-zinc-400 ml-1">
                  / {stats?.totalSources}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Globe className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">국가별 비율</p>
              <p className="text-lg font-bold text-zinc-900">
                <span className="text-blue-600">KR</span> {stats?.articlesByCountry.KR.toLocaleString()}
                <span className="text-zinc-300 mx-2">|</span>
                <span className="text-zinc-600">US</span> {stats?.articlesByCountry.US.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles by Source */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">소스별 기사 수</h2>
          <div className="space-y-3">
            {stats?.articlesBySource.slice(0, 10).map((source) => (
              <div key={source.name} className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: source.color }}
                />
                <span className="text-sm text-zinc-700 w-28 truncate">{source.name}</span>
                <div className="flex-1 h-6 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(source.count / maxArticleCount) * 100}%`,
                      backgroundColor: source.color,
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-zinc-900 w-12 text-right">
                  {source.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">최근 수집 기사</h2>
          <div className="space-y-4">
            {stats?.recentArticles.map((article) => (
              <div key={article.id} className="flex items-start gap-3">
                <div
                  className="w-1 h-12 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: article.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 line-clamp-2">
                    {article.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: article.color }}
                    >
                      {article.source}
                    </span>
                    <span className="text-xs text-zinc-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(article.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
