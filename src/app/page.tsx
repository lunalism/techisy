'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { ArticleList } from '@/components/article-list'
import { BottomNav } from '@/components/bottom-nav'
import type { TabValue } from '@/types'

export default function Home() {
  const [tab, setTab] = useState<TabValue>('all')

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Header tab={tab} onTabChange={setTab} />

      <main className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-12">
        <section>
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-10">
            Latest News
          </h2>
          <ArticleList tab={tab} />
        </section>
      </main>

      <footer className="border-t border-zinc-100 dark:border-zinc-800 mt-16 mb-20 lg:mb-0">
        <div className="mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 py-8">
          <p className="text-sm text-zinc-400 text-center">
            Techisy - Tech News Aggregator
          </p>
        </div>
      </footer>

      <BottomNav />
    </div>
  )
}
