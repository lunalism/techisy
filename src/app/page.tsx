'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { ArticleList } from '@/components/article-list'
import type { TabValue } from '@/types'

export default function Home() {
  const [tab, setTab] = useState<TabValue>('all')

  return (
    <div className="min-h-screen bg-white">
      <Header tab={tab} onTabChange={setTab} />

      <main className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-12">
        <section>
          <h2 className="text-3xl font-bold text-zinc-900 mb-10">
            Latest News
          </h2>
          <ArticleList tab={tab} />
        </section>
      </main>

      <footer className="border-t border-zinc-100 mt-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12 py-8">
          <p className="text-sm text-zinc-400 text-center">
            Techisy - Tech News Aggregator
          </p>
        </div>
      </footer>
    </div>
  )
}
