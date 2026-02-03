'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Newspaper, Calendar, Rss, Globe, Clock, Trash2, RefreshCw, Loader2 } from 'lucide-react'
import {
  SkeletonStatsCard,
  SkeletonSourceBar,
  SkeletonRecentArticle,
} from '@/components/skeleton-stats'

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

interface FetchProgress {
  currentGroup: number
  totalGroups: number
  articlesAdded: number
  sourcesProcessed: number
  errors: string[]
}

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [fetchProgress, setFetchProgress] = useState<FetchProgress | null>(null)

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 2, // 2 minutes cache
  })

  const maxArticleCount = stats?.articlesBySource[0]?.count || 1

  const handleCleanupAll = async () => {
    if (!confirm('정말 모든 기사를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    setIsDeleting(true)
    try {
      const res = await fetch('/api/admin/cleanup?deleteAll=true', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        alert(`${data.deleted}개 기사가 삭제되었습니다.`)
        queryClient.invalidateQueries({ queryKey: ['admin-stats'] })
      } else {
        alert(`오류: ${data.error}`)
      }
    } catch {
      alert('삭제 중 오류가 발생했습니다.')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleFetchAll = async () => {
    // Step 1: Acquire lock first
    try {
      const lockRes = await fetch('/api/cron/fetch-feeds/lock', { method: 'POST' })
      const lockData = await lockRes.json()

      if (lockRes.status === 409) {
        alert(lockData.message || '다른 프로세스에서 이미 수집 중입니다.')
        return
      }

      if (!lockRes.ok) {
        alert('락 획득 실패: ' + (lockData.error || '알 수 없는 오류'))
        return
      }
    } catch (e) {
      console.error('Lock acquisition failed:', e)
      alert('락 획득 중 오류가 발생했습니다.')
      return
    }

    // Step 2: Get dynamic group count
    let totalGroups = 10 // fallback
    try {
      const infoRes = await fetch('/api/admin/sources/info')
      if (infoRes.ok) {
        const info = await infoRes.json()
        totalGroups = info.totalGroups || 10
      }
    } catch {
      console.error('Failed to get source info, using default groups')
    }

    setFetchProgress({
      currentGroup: 0,
      totalGroups,
      articlesAdded: 0,
      sourcesProcessed: 0,
      errors: [],
    })

    let totalAdded = 0
    let totalSources = 0
    const errors: string[] = []

    // Step 3: Fetch all groups
    try {
      for (let group = 1; group <= totalGroups; group++) {
        try {
          setFetchProgress((prev) => prev && ({ ...prev, currentGroup: group }))

          const res = await fetch(`/api/cron/fetch-feeds?group=${group}`, { method: 'POST' })
          const data = await res.json()

          if (res.ok && data.summary) {
            totalAdded += data.summary.articlesAdded || 0
            totalSources += data.summary.sourcesProcessed || 0
            if (data.summary.errors > 0) {
              errors.push(`그룹 ${group}: ${data.summary.errors}개 에러`)
            }
            setFetchProgress((prev) => prev && ({
              ...prev,
              articlesAdded: totalAdded,
              sourcesProcessed: totalSources,
              errors: [...errors],
            }))
          } else {
            errors.push(`그룹 ${group}: ${data.error || 'API 에러'}`)
            setFetchProgress((prev) => prev && ({
              ...prev,
              errors: [...errors],
            }))
          }
        } catch (e) {
          const errorMsg = e instanceof Error ? e.message : '네트워크 에러'
          errors.push(`그룹 ${group}: ${errorMsg}`)
          setFetchProgress((prev) => prev && ({
            ...prev,
            errors: [...errors],
          }))
        }
      }
    } finally {
      // Step 4: Always release lock when done (success or error)
      try {
        await fetch('/api/cron/fetch-feeds/lock', { method: 'DELETE' })
      } catch (e) {
        console.error('Failed to release lock:', e)
      }
    }

    setFetchProgress(null)
    queryClient.invalidateQueries({ queryKey: ['admin-stats'] })

    if (errors.length > 0) {
      alert(`수집 완료 (일부 에러)\n소스: ${totalSources}개\n기사: ${totalAdded}개\n\n에러:\n${errors.join('\n')}`)
    } else {
      alert(`수집 완료!\n소스: ${totalSources}개\n기사: ${totalAdded}개`)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">대시보드</h1>
        <div className="flex gap-3">
          <button
            onClick={handleFetchAll}
            disabled={fetchProgress !== null}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors min-w-[180px]"
          >
            {fetchProgress ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {fetchProgress.currentGroup}/{fetchProgress.totalGroups} · {fetchProgress.articlesAdded}개
                </span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Fetch Now</span>
              </>
            )}
          </button>
          <button
            onClick={handleCleanupAll}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            {isDeleting ? '삭제 중...' : 'Cleanup All'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {isLoading ? (
          <>
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
            <SkeletonStatsCard />
          </>
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Newspaper className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">총 기사</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {stats?.totalArticles.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <Calendar className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">오늘 수집</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {stats?.todayArticles.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Rss className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">활성 소스</p>
                  <p className="text-3xl font-bold text-zinc-900 dark:text-white">
                    {stats?.activeSources}
                    <span className="text-sm font-normal text-zinc-400 ml-1">
                      / {stats?.totalSources}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">국가별 비율</p>
                  <p className="text-lg font-bold text-zinc-900 dark:text-white">
                    <span className="text-blue-600 dark:text-blue-400">KR</span> {stats?.articlesByCountry.KR.toLocaleString()}
                    <span className="text-zinc-300 dark:text-zinc-600 mx-2">|</span>
                    <span className="text-zinc-600 dark:text-zinc-400">US</span> {stats?.articlesByCountry.US.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Articles by Source */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">소스별 기사 수</h2>
          <div className="space-y-3">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <SkeletonSourceBar key={i} />
              ))
            ) : (
              stats?.articlesBySource.slice(0, 10).map((source) => (
                <div key={source.name} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-sm text-zinc-700 dark:text-zinc-300 w-28 truncate">{source.name}</span>
                  <div className="flex-1 h-6 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(source.count / maxArticleCount) * 100}%`,
                        backgroundColor: source.color,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-white w-12 text-right">
                    {source.count.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Articles */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">최근 수집 기사</h2>
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRecentArticle key={i} />
              ))
            ) : (
              stats?.recentArticles.map((article) => (
                <div key={article.id} className="flex items-start gap-3">
                  <div
                    className="w-1 h-12 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: article.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 dark:text-white line-clamp-2">
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
