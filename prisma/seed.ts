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
    name: 'ZDNet',
    rssUrl: 'https://www.zdnet.com/news/rss.xml',
    country: 'US',
  },
  {
    name: 'Fast Company',
    rssUrl: 'https://www.fastcompany.com/technology/rss', // technology 섹션 전용 (not 종합)
    country: 'US',
  },
  // KR - Korean Tech Media (verified working, tech-only feeds)
  {
    name: '전자신문',
    rssUrl: 'https://rss.etnews.com/03.xml', // IT 섹션 전용 (not Section901 종합)
    country: 'KR',
  },
  {
    name: '플래텀',
    rssUrl: 'https://platum.kr/feed', // 스타트업 전문
    country: 'KR',
  },
  {
    name: '뉴스1 IT',
    rssUrl: 'https://www.news1.kr/rss/it', // IT 섹션 전용
    country: 'KR',
  },
  {
    name: 'AI타임스',
    rssUrl: 'https://cdn.aitimes.com/rss/gn_rss_allArticle.xml', // AI 전문
    country: 'KR',
  },
  {
    name: '테크레시피',
    rssUrl: 'https://techrecipe.co.kr/feed', // 테크 전문
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

  // Deactivate sources not in seed list (e.g., removed/replaced sources)
  const seedUrls = sources.map(s => s.rssUrl)
  const deactivated = await prisma.source.updateMany({
    where: { rssUrl: { notIn: seedUrls } },
    data: { active: false },
  })
  if (deactivated.count > 0) {
    console.log(`\n  - Deactivated ${deactivated.count} sources not in seed list`)
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
