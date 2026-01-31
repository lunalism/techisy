'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { ArticleList } from '@/components/article-list'
import type { TabValue } from '@/types'

export default function Home() {
  const [tab, setTab] = useState<TabValue>('all')

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header tab={tab} onTabChange={setTab} />

      <main className="mx-auto max-w-6xl px-5 py-6">
        <ArticleList tab={tab} />
      </main>
    </div>
  )
}
