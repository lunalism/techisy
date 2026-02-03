'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Check, LayoutGrid, Layers, Shield, LogOut, LogIn } from 'lucide-react'
import { useLayout } from '@/contexts/layout-context'

interface AuthState {
  user: { id: string; email: string } | null
  isAdmin: boolean
}

interface SettingsDropdownProps {
  auth?: AuthState | null
  onLogout?: () => void
}

const layoutOptions = [
  { value: 'card', label: '카드형', icon: LayoutGrid },
  { value: 'overlay', label: '오버레이', icon: Layers },
]

export function SettingsDropdown({ auth, onLogout }: SettingsDropdownProps) {
  const { layout, setLayout } = useLayout()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg text-zinc-400">
        <Settings className="w-4 h-4" />
      </button>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        title="설정"
      >
        <Settings className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-2 z-50">
          {/* Layout Section */}
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            레이아웃 (모바일)
          </div>
          {layoutOptions.map((option) => {
            const Icon = option.icon
            const isSelected = layout === option.value

            return (
              <button
                key={option.value}
                onClick={() => {
                  setLayout(option.value as 'card' | 'overlay')
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
                  isSelected
                    ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-white'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 text-left">{option.label}</span>
                {isSelected && <Check className="w-4 h-4 text-zinc-900 dark:text-white" />}
              </button>
            )
          })}

          {/* Divider */}
          <div className="my-2 border-t border-zinc-200 dark:border-zinc-700" />

          {/* Account Section */}
          <div className="px-3 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            계정
          </div>

          {auth?.isAdmin && (
            <Link
              href="/admin"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              <Shield className="w-4 h-4" />
              <span className="flex-1 text-left">Admin</span>
            </Link>
          )}

          {auth?.user ? (
            <button
              onClick={() => {
                onLogout?.()
                setIsOpen(false)
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="flex-1 text-left">로그아웃</span>
            </button>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="flex-1 text-left">로그인</span>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
