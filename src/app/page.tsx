'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArticleList } from '@/components/article-list'
import type { TabValue } from '@/types'

export default function Home() {
  const [tab, setTab] = useState<TabValue>('all')

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <Tabs value={tab} onValueChange={(v) => setTab(v as TabValue)}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
          <TabsTrigger value="korea">Korea</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ArticleList tab="all" />
        </TabsContent>

        <TabsContent value="global">
          <ArticleList tab="global" />
        </TabsContent>

        <TabsContent value="korea">
          <ArticleList tab="korea" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
