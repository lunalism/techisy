'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Source {
  id: string
  name: string
  country: string
  color: string
}

async function fetchSources(): Promise<Source[]> {
  const res = await fetch('/api/sources')
  if (!res.ok) throw new Error('Failed to fetch sources')
  return res.json()
}

async function updateColor(id: string, color: string): Promise<Source> {
  const res = await fetch(`/api/sources/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ color }),
  })
  if (!res.ok) throw new Error('Failed to update color')
  return res.json()
}

function ColorEditor({ source, onSave }: { source: Source; onSave: (color: string) => void }) {
  const [color, setColor] = useState(source.color)
  const [isEditing, setIsEditing] = useState(false)

  const handleSave = () => {
    if (color !== source.color) {
      onSave(color)
    }
    setIsEditing(false)
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div
        className="w-10 h-10 rounded-lg shadow-inner flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      <div className="flex-1 min-w-0">
        <div className="font-medium text-zinc-900 dark:text-white">{source.name}</div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">{source.country}</div>
      </div>

      {isEditing ? (
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer"
          />
          <Input
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-28 font-mono text-sm"
            placeholder="#000000"
          />
          <Button size="sm" onClick={handleSave}>
            저장
          </Button>
          <Button size="sm" variant="ghost" onClick={() => {
            setColor(source.color)
            setIsEditing(false)
          }}>
            취소
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-zinc-600 dark:text-zinc-400">{source.color}</span>
          <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
            수정
          </Button>
        </div>
      )}
    </div>
  )
}

export default function ColorsPage() {
  const queryClient = useQueryClient()

  const { data: sources, isLoading } = useQuery({
    queryKey: ['sources'],
    queryFn: fetchSources,
  })

  const colorMutation = useMutation({
    mutationFn: ({ id, color }: { id: string; color: string }) =>
      updateColor(id, color),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] })
    },
  })

  const krSources = sources?.filter(s => s.country === 'KR') || []
  const usSources = sources?.filter(s => s.country === 'US') || []

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">색상 관리</h1>
      <p className="text-zinc-500 dark:text-zinc-400 mb-8">각 소스의 브랜드 색상을 설정합니다.</p>

      {isLoading ? (
        <div className="text-zinc-500 dark:text-zinc-400">로딩 중...</div>
      ) : (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              한국 매체 ({krSources.length})
            </h2>
            <div className="space-y-2">
              {krSources.map((source) => (
                <ColorEditor
                  key={source.id}
                  source={source}
                  onSave={(color) => colorMutation.mutate({ id: source.id, color })}
                />
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              해외 매체 ({usSources.length})
            </h2>
            <div className="space-y-2">
              {usSources.map((source) => (
                <ColorEditor
                  key={source.id}
                  source={source}
                  onSave={(color) => colorMutation.mutate({ id: source.id, color })}
                />
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
