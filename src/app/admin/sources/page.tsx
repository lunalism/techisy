'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
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
  color: string
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
            onClick={() => mutation.mutate({ name, rssUrl, country, active: true, color: '#6B7280' })}
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

export default function SourcesPage() {
  const queryClient = useQueryClient()
  const [fetchStatus, setFetchStatus] = useState<string | null>(null)

  const { data: sources, isLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">소스 관리</h1>
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
        <div className="mb-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm text-zinc-900 dark:text-zinc-100">
          {fetchStatus}
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">로딩 중...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>색상</TableHead>
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
                  <TableCell>
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: source.color }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{source.name}</TableCell>
                  <TableCell className="text-sm text-zinc-500 max-w-xs truncate">
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
                      className="text-red-600 hover:text-red-700"
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
      </div>
    </div>
  )
}
