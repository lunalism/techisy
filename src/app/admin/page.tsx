'use client'

import { useQuery } from '@tanstack/react-query'
import { Rss, FileText, Globe } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  totalArticles: number
  totalSources: number
  activeSources: number
}

async function fetchStats(): Promise<Stats> {
  const res = await fetch('/api/admin/stats')
  if (!res.ok) throw new Error('Failed to fetch stats')
  return res.json()
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchStats,
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">대시보드</h1>

      {isLoading ? (
        <div className="text-zinc-500">로딩 중...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">총 기사</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats?.totalArticles.toLocaleString() || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Rss className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">활성 소스</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats?.activeSources || 0}
                  <span className="text-sm font-normal text-zinc-400 ml-1">
                    / {stats?.totalSources || 0}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Globe className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-zinc-500">총 소스</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats?.totalSources || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/sources"
          className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200 hover:border-zinc-300 transition-colors"
        >
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">소스 관리</h2>
          <p className="text-sm text-zinc-500">RSS 소스 추가, 수정, 삭제</p>
        </Link>

        <Link
          href="/admin/colors"
          className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200 hover:border-zinc-300 transition-colors"
        >
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">색상 관리</h2>
          <p className="text-sm text-zinc-500">소스별 브랜드 색상 설정</p>
        </Link>
      </div>
    </div>
  )
}
