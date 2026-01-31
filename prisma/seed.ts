import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sources = [
  // US - Global Tech Media
  {
    name: 'TechCrunch',
    rssUrl: 'https://techcrunch.com/feed/',
    country: 'US',
  },
  {
    name: 'The Verge',
    rssUrl: 'https://www.theverge.com/rss/index.xml',
    country: 'US',
  },
  {
    name: 'Wired',
    rssUrl: 'https://www.wired.com/feed/rss',
    country: 'US',
  },
  {
    name: 'Ars Technica',
    rssUrl: 'https://feeds.arstechnica.com/arstechnica/index',
    country: 'US',
  },
  {
    name: 'Engadget',
    rssUrl: 'https://www.engadget.com/rss.xml',
    country: 'US',
  },
  {
    name: 'Reuters Tech',
    rssUrl: 'https://www.reuters.com/technology/rss',
    country: 'US',
  },
  // KR - Korean Tech Media
  {
    name: '블로터',
    rssUrl: 'https://www.bloter.net/feed',
    country: 'KR',
  },
  {
    name: '지디넷코리아',
    rssUrl: 'https://zdnet.co.kr/rss/newsall.xml',
    country: 'KR',
  },
  {
    name: '전자신문',
    rssUrl: 'https://rss.etnews.com/Section901.xml',
    country: 'KR',
  },
  {
    name: '바이라인네트워크',
    rssUrl: 'https://byline.network/feed/',
    country: 'KR',
  },
  {
    name: 'IT조선',
    rssUrl: 'https://it.chosun.com/rss/',
    country: 'KR',
  },
  {
    name: '디지털데일리',
    rssUrl: 'https://www.ddaily.co.kr/rss/rss.xml',
    country: 'KR',
  },
]

async function main() {
  console.log('Cleaning up old data...')

  // Delete Techmeme source and its articles
  const techmeme = await prisma.source.findFirst({
    where: { name: 'Techmeme' },
  })
  if (techmeme) {
    await prisma.article.deleteMany({
      where: { source: 'Techmeme' },
    })
    await prisma.source.delete({
      where: { id: techmeme.id },
    })
    console.log('  - Techmeme 삭제 완료')
  }

  // Deactivate old invalid sources
  const oldSources = ['디지털투데이', '아이티데일리']
  for (const name of oldSources) {
    const source = await prisma.source.findFirst({ where: { name } })
    if (source) {
      await prisma.source.update({
        where: { id: source.id },
        data: { active: false },
      })
      console.log(`  - ${name} 비활성화`)
    }
  }

  console.log('\nSeeding new sources...')

  for (const source of sources) {
    const result = await prisma.source.upsert({
      where: { rssUrl: source.rssUrl },
      update: { name: source.name, country: source.country, active: true },
      create: { ...source, active: true },
    })
    console.log(`  + ${result.name} (${result.country})`)
  }

  console.log('\nSeeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
