'use client'

import Link from 'next/link'
import type { TabValue } from '@/types'

interface HeaderProps {
  tab: TabValue
  onTabChange: (tab: TabValue) => void
}

const tabs: { value: TabValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'global', label: 'Global' },
  { value: 'korea', label: 'Korea' },
]

export function Header({ tab, onTabChange }: HeaderProps) {
  return (
    <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-10 border-b border-zinc-200">
      <div className="mx-auto max-w-6xl px-5">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="inline-block">
            <h1 className="text-lg font-bold tracking-tight text-zinc-900">
              Techisy
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            <nav className="flex items-center bg-zinc-100 rounded-full p-1">
              {tabs.map((t) => (
                <button
                  key={t.value}
                  onClick={() => onTabChange(t.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all ${
                    tab === t.value
                      ? 'bg-white text-zinc-900 shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
            <Link
              href="/admin"
              className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
