'use client'

import { useState, useRef, useEffect } from 'react'
import { Share2, Link, MessageCircle, Check } from 'lucide-react'

interface ShareButtonProps {
  url: string
  title: string
  description?: string
  className?: string
}

export function ShareButton({ url, title, description, className = '' }: ShareButtonProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!showDropdown) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showDropdown])

  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleShare = async (e: React.MouseEvent) => {
    stop(e)
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description || '', url })
      } catch {
        // User cancelled
      }
    } else {
      setShowDropdown((prev) => !prev)
    }
  }

  const copyLink = async (e: React.MouseEvent) => {
    stop(e)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setShowDropdown(false)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  const shareToTwitter = (e: React.MouseEvent) => {
    stop(e)
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      '_blank',
      'width=550,height=420'
    )
    setShowDropdown(false)
  }

  const shareToKakao = (e: React.MouseEvent) => {
    stop(e)
    window.open(
      `https://story.kakao.com/share?url=${encodeURIComponent(url)}`,
      '_blank'
    )
    setShowDropdown(false)
  }

  return (
    <div ref={ref} className={className}>
      <button
        onClick={handleShare}
        className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm transition-colors"
        aria-label="공유"
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Share2 className="w-4 h-4" />
        )}
      </button>

      {copied && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-2 py-1 bg-black/80 text-white text-xs rounded whitespace-nowrap pointer-events-none">
          복사됨!
        </div>
      )}

      {showDropdown && (
        <div
          onClick={stop}
          className="absolute top-full right-0 mt-1 bg-white dark:bg-zinc-800 rounded-lg shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 min-w-[140px] z-50"
        >
          <button
            onClick={copyLink}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <Link className="w-4 h-4" />
            링크 복사
          </button>
          <button
            onClick={shareToTwitter}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            트위터
          </button>
          <button
            onClick={shareToKakao}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            카카오톡
          </button>
        </div>
      )}
    </div>
  )
}
