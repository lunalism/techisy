// Smart article filtering: whitelist overrides blacklist

const WHITELIST_KEYWORDS = [
  // AI & ML
  'ai', 'artificial intelligence', 'machine learning', 'llm', 'gpt', 'claude', 'gemini', 'chatgpt',
  'deepseek', 'openai', 'anthropic', 'neural network', 'deep learning',
  // Startups & Business
  'startup', 'funding', 'venture', 'ipo', 'acquisition', 'series a', 'series b', 'series c',
  'unicorn', 'valuation',
  // Big Tech
  'apple', 'google', 'microsoft', 'amazon', 'meta', 'nvidia', 'tesla', 'samsung', 'intel', 'amd',
  'qualcomm', 'tsmc', 'ibm', 'oracle', 'salesforce', 'adobe', 'netflix', 'spotify',
  // Products
  'iphone', 'android', 'mac', 'macbook', 'windows', 'linux', 'ipad', 'pixel', 'galaxy',
  'airpods', 'vision pro', 'quest',
  // Hardware
  'chip', 'semiconductor', 'processor', 'gpu', 'cpu', 'memory', 'ram', 'ssd', 'hardware',
  // Robotics & Autonomous
  'robot', 'robotics', 'autonomous', 'self-driving', 'waymo', 'cruise', 'autopilot',
  // Crypto & Blockchain
  'crypto', 'blockchain', 'bitcoin', 'ethereum', 'web3', 'nft', 'defi',
  // Security
  'cybersecurity', 'hack', 'breach', 'privacy', 'security', 'ransomware', 'malware', 'phishing',
  // Software & Development
  'software', 'app', 'code', 'developer', 'api', 'programming', 'open source', 'github',
  // Cloud & Infrastructure
  'cloud', 'data center', 'server', 'aws', 'azure', 'kubernetes', 'docker',
  // XR
  'vr', 'ar', 'metaverse', 'headset', 'mixed reality', 'augmented reality', 'virtual reality',
  // Telecom
  '5g', 'wi-fi', 'wifi', 'network', 'telecom', 'broadband',
  // EV & Energy
  'electric vehicle', 'ev', 'battery', 'charging', 'renewable', 'solar',
  // Space
  'drone', 'satellite', 'spacex', 'rocket', 'nasa', 'space',
  // Gaming Tech
  'playstation', 'xbox', 'nintendo', 'steam', 'gaming pc', 'rtx', 'geforce',
]

const BLACKLIST_KEYWORDS = [
  // Food & Lifestyle
  'food', 'recipe', 'cooking', 'diet', 'fitness', 'workout', 'muscle', 'nutrition',
  'weight loss', 'meal prep',
  // Gift Guides
  'valentine', 'gift guide', 'holiday gift', 'christmas gift', 'best gifts',
  'gift ideas', 'birthday gift',
  // Fashion & Beauty
  'fashion', 'beauty', 'skincare', 'makeup', 'cosmetic', 'hairstyle', 'outfit',
  // Astrology
  'horoscope', 'zodiac', 'astrology', 'tarot',
  // Entertainment Reviews (non-tech)
  'movie review', 'tv review', 'netflix review', 'show review', 'album review',
  'book review', 'concert review',
  // Travel
  'travel guide', 'vacation', 'hotel review', 'destination', 'resort', 'tourism',
  // Relationships
  'relationship advice', 'dating tips', 'love life', 'marriage advice',
  // Sports
  'sports score', 'game recap', 'playoff', 'championship', 'tournament',
  'super bowl', 'world cup', 'olympics',
  // Celebrity
  'celebrity', 'gossip', 'scandal', 'red carpet', 'paparazzi',
  // Deals/Promo (often non-tech spam)
  'promo code', 'coupon code', 'discount code', 'affiliate',
]

/**
 * Checks if an article should be included based on smart filtering.
 *
 * Logic:
 * 1. If whitelist keyword found → INCLUDE (blacklist ignored)
 * 2. If no whitelist but blacklist found → EXCLUDE
 * 3. If neither found → INCLUDE
 */
export function shouldIncludeArticle(title: string): boolean {
  const lowerTitle = title.toLowerCase()

  // Check whitelist first - if found, always include
  const hasWhitelist = WHITELIST_KEYWORDS.some(keyword =>
    lowerTitle.includes(keyword.toLowerCase())
  )
  if (hasWhitelist) {
    return true
  }

  // Check blacklist - if found and no whitelist, exclude
  const hasBlacklist = BLACKLIST_KEYWORDS.some(keyword =>
    lowerTitle.includes(keyword.toLowerCase())
  )
  if (hasBlacklist) {
    return false
  }

  // Neither found - include by default
  return true
}

/**
 * Filters an array of articles, returning only tech-related ones.
 */
export function filterTechArticles<T extends { title: string }>(articles: T[]): T[] {
  return articles.filter(article => shouldIncludeArticle(article.title))
}
