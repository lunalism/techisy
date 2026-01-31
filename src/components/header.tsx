'use client'

import Link from 'next/link'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { TabValue } from '@/types'

interface HeaderProps {
  tab: TabValue
  onTabChange: (tab: TabValue) => void
}

export function Header({ tab, onTabChange }: HeaderProps) {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-10">
      <div className="mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/" className="inline-block">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Techisy
            </h1>
          </Link>

          <Tabs value={tab} onValueChange={(v) => onTabChange(v as TabValue)}>
            <TabsList className="h-8">
              <TabsTrigger value="all" className="text-xs px-3 h-7">
                All
              </TabsTrigger>
              <TabsTrigger value="global" className="text-xs px-3 h-7">
                Global
              </TabsTrigger>
              <TabsTrigger value="korea" className="text-xs px-3 h-7">
                Korea
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </header>
  )
}
