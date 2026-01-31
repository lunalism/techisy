'use client'

import Link from 'next/link'

export function Header() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4 py-4">
        <Link href="/" className="inline-block">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Techisy
          </h1>
          <p className="text-sm text-muted-foreground">
            Tech News Aggregator
          </p>
        </Link>
      </div>
    </header>
  )
}
