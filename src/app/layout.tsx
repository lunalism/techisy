import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Providers } from '@/components/providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Techisy - 글로벌 & 한국 테크 뉴스',
  description:
    'TechCrunch, The Verge 등 해외 테크 뉴스와 한국 테크 뉴스를 한눈에. 매일 업데이트되는 테크 뉴스 애그리게이터.',
  keywords: '테크 뉴스, tech news, IT 뉴스, 스타트업, AI, 기술 뉴스',
  authors: [{ name: 'Techisy' }],
  metadataBase: new URL('https://techisy.vercel.app'),
  openGraph: {
    title: 'Techisy - 글로벌 & 한국 테크 뉴스',
    description:
      'TechCrunch, The Verge 등 해외 테크 뉴스와 한국 테크 뉴스를 한눈에. 매일 업데이트되는 테크 뉴스 애그리게이터.',
    url: 'https://techisy.vercel.app',
    siteName: 'Techisy',
    type: 'website',
    locale: 'ko_KR',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Techisy - 글로벌 & 한국 테크 뉴스',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Techisy - 글로벌 & 한국 테크 뉴스',
    description:
      'TechCrunch, The Verge 등 해외 테크 뉴스와 한국 테크 뉴스를 한눈에.',
    images: ['/opengraph-image'],
  },
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning className="overflow-x-hidden max-w-[100vw]">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 overflow-x-hidden max-w-[100vw]`}
      >
        <Providers>{children}</Providers>
        {/* Eruda for mobile debugging - REMOVE AFTER DEBUGGING */}
        <Script src="https://cdn.jsdelivr.net/npm/eruda" strategy="afterInteractive" />
        <Script id="eruda-init" strategy="afterInteractive">
          {`if (typeof eruda !== 'undefined') eruda.init();`}
        </Script>
      </body>
    </html>
  )
}
