import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sources = [
  // Global
  {
    name: 'Techmeme',
    rssUrl: 'https://www.techmeme.com/feed.xml',
    country: 'US',
  },
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
  // Korea
  {
    name: '바이라인네트워크',
    rssUrl: 'https://byline.network/feed/',
    country: 'KR',
  },
  {
    name: '디지털투데이',
    rssUrl: 'https://www.digitaltoday.co.kr/rss/allArticle.xml',
    country: 'KR',
  },
  {
    name: '아이티데일리',
    rssUrl: 'https://www.itdaily.kr/rss/S1N9.xml',
    country: 'KR',
  },
]

async function main() {
  console.log('Seeding sources...')

  // 기존 404 에러 나는 소스들 비활성화
  const bloter = await prisma.source.findFirst({
    where: { rssUrl: 'https://www.bloter.net/feed' },
  })
  if (bloter) {
    await prisma.source.update({
      where: { id: bloter.id },
      data: { active: false },
    })
    console.log('  - 블로터 비활성화')
  }

  const zdnet = await prisma.source.findFirst({
    where: { rssUrl: 'https://zdnet.co.kr/rss/newsall.xml' },
  })
  if (zdnet) {
    await prisma.source.update({
      where: { id: zdnet.id },
      data: { active: false },
    })
    console.log('  - 지디넷 비활성화')
  }

  for (const source of sources) {
    const result = await prisma.source.upsert({
      where: { rssUrl: source.rssUrl },
      update: { name: source.name, country: source.country },
      create: source,
    })
    console.log(`  + ${result.name} (${result.country})`)
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
