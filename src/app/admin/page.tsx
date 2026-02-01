'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface Source {
  id: string
  name: string
  rssUrl: string
  country: string
  active: boolean
}

interface FetchResult {
  success: boolean
  summary: {
    sourcesProcessed: number
    articlesAdded: number
    errors: number
  }
}

async function fetchSources(): Promise<Source[]> {
  const res = await fetch('/api/sources')
  if (!res.ok) throw new Error('Failed to fetch sources')
  return res.json()
}

async function createSource(data: Omit<Source, 'id'>): Promise<Source> {
  const res = await fetch('/api/sources', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create source')
  return res.json()
}

async function updateSource(id: string, data: Partial<Source>): Promise<Source> {
  const res = await fetch(`/api/sources/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update source')
  return res.json()
}

async function deleteSource(id: string): Promise<void> {
  const res = await fetch(`/api/sources/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete source')
}

async function fetchFeeds(): Promise<FetchResult> {
  const res = await fetch('/api/cron/fetch-feeds')
  if (!res.ok) throw new Error('Failed to fetch feeds')
  return res.json()
}

function AddSourceDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [rssUrl, setRssUrl] = useState('')
  const [country, setCountry] = useState<'US' | 'KR'>('KR')

  const mutation = useMutation({
    mutationFn: createSource,
    onSuccess: () => {
      setOpen(false)
      setName('')
      setRssUrl('')
      onSuccess()
    },
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">소스 추가</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새 소스 추가</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Techmeme"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rssUrl">RSS URL</Label>
            <Input
              id="rssUrl"
              value={rssUrl}
              onChange={(e) => setRssUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
            />
          </div>
          <div className="space-y-2">
            <Label>국가</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={country === 'KR'}
                  onChange={() => setCountry('KR')}
                />
                Korea
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={country === 'US'}
                  onChange={() => setCountry('US')}
                />
                Global
              </label>
            </div>
          </div>
          <Button
            onClick={() => mutation.mutate({ name, rssUrl, country, active: true })}
            disabled={!name || !rssUrl || mutation.isPending}
            className="w-full"
          >
            {mutation.isPending ? '추가 중...' : '추가'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [fetchStatus, setFetchStatus] = useState<string | null>(null)
  const [authState, setAuthState] = useState<'loading' | 'unauthorized' | 'authorized'>('loading')
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login?redirectTo=/admin')
        return
      }

      // Check if user is admin
      const res = await fetch('/api/auth/check-admin')
      const { isAdmin } = await res.json()

      if (!isAdmin) {
        setAuthState('unauthorized')
        return
      }

      setUserEmail(user.email ?? null)
      setAuthState('authorized')
    }

    checkAuth()
  }, [router])

  const { data: sources, isLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
    enabled: authState === 'authorized',
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateSource(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sources'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSource,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sources'] }),
  })

  const fetchMutation = useMutation({
    mutationFn: fetchFeeds,
    onSuccess: (data) => {
      setFetchStatus(
        `완료: ${data.summary.articlesAdded}개 기사 추가 (${data.summary.errors}개 에러)`
      )
      queryClient.invalidateQueries({ queryKey: ['articles'] })
    },
    onError: () => setFetchStatus('피드 수집 실패'),
  })

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500">인증 확인 중...</div>
      </div>
    )
  }

  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 mb-2">접근 권한 없음</h1>
          <p className="text-zinc-500 mb-4">관리자만 접근할 수 있습니다.</p>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            메인으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold">
                Techisy
              </Link>
              <span className="text-sm text-muted-foreground">Admin</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">{userEmail}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                로그아웃
              </button>
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                ← 메인으로
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-semibold">소스 관리</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMutation.mutate()}
              disabled={fetchMutation.isPending}
            >
              {fetchMutation.isPending ? '수집 중...' : 'Fetch Now'}
            </Button>
            <AddSourceDialog
              onSuccess={() => queryClient.invalidateQueries({ queryKey: ['sources'] })}
            />
          </div>
        </div>

        {fetchStatus && (
          <div className="mb-4 p-3 bg-muted rounded-md text-sm">
            {fetchStatus}
          </div>
        )}

        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>RSS URL</TableHead>
                <TableHead>국가</TableHead>
                <TableHead>활성화</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources?.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                    {source.rssUrl}
                  </TableCell>
                  <TableCell>
                    <span className={source.country === 'KR' ? 'text-blue-600' : ''}>
                      {source.country}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={source.active}
                      onCheckedChange={(checked) =>
                        toggleMutation.mutate({ id: source.id, active: checked })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (confirm(`"${source.name}" 소스를 삭제하시겠습니까?`)) {
                          deleteMutation.mutate(source.id)
                        }
                      }}
                    >
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </main>
    </div>
  )
}
