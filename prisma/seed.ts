import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sources = [
  {
    name: 'Techmeme',
    rssUrl: 'https://www.techmeme.com/feed.xml',
    country: 'US',
  },
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
]

async function main() {
  console.log('Seeding sources...')

  for (const source of sources) {
    const result = await prisma.source.upsert({
      where: { rssUrl: source.rssUrl },
      update: {},
      create: source,
    })
    console.log(`  - ${result.name} (${result.country})`)
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
