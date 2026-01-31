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
  // KR - Korean Tech Media (verified working, tech-only feeds)
  {
    name: '전자신문',
    rssUrl: 'https://rss.etnews.com/Section902.xml', // IT/과학 섹션
    country: 'KR',
  },
  {
    name: '테크M',
    rssUrl: 'https://www.techm.kr/rss/allArticle.xml',
    country: 'KR',
  },
  {
    name: '플래텀',
    rssUrl: 'https://platum.kr/feed',
    country: 'KR',
  },
  {
    name: '디지털투데이',
    rssUrl: 'https://www.digitaltoday.co.kr/rss/allArticle.xml',
    country: 'KR',
  },
]

async function main() {
  console.log('Seeding sources...')

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
