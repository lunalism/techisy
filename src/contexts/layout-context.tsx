'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type LayoutType = 'card' | 'overlay'

interface LayoutContextType {
  layout: LayoutType
  setLayout: (layout: LayoutType) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

const STORAGE_KEY = 'techisy-layout'

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [layout, setLayoutState] = useState<LayoutType>('overlay')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'card' || stored === 'overlay') {
      setLayoutState(stored)
    }
  }, [])

  const setLayout = (newLayout: LayoutType) => {
    setLayoutState(newLayout)
    localStorage.setItem(STORAGE_KEY, newLayout)
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </LayoutContext.Provider>
  )
}

export function useLayout() {
  const context = useContext(LayoutContext)
  if (context === undefined) {
    // Return default values if used outside provider (for SSR)
    return { layout: 'overlay' as LayoutType, setLayout: () => {} }
  }
  return context
}
