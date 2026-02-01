export interface Article {
  id: string
  title: string
  url: string
  source: string
  sourceUrl: string | null
  imageUrl: string | null
  publishedAt: Date | null
  createdAt: Date
  clusterId: string | null
  sourceColor?: string
}

export interface Source {
  id: string
  name: string
  rssUrl: string
  country: 'KR' | 'US'
  active: boolean
  color: string
}

export type TabValue = 'all' | 'global' | 'korea'
