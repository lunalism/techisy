// Smart article filtering with 3-tier system:
// 1. ALWAYS_EXCLUDE: High-confidence non-tech patterns — cannot be overridden
// 2. WHITELIST: Tech keywords with word-boundary matching — overrides blacklist
// 3. BLACKLIST: Non-tech keywords with substring matching

// Tier 1: Always exclude regardless of other keywords
// These patterns are NEVER legitimate tech news content
const ALWAYS_EXCLUDE_PATTERNS = [
  // Coupons & Promo Codes
  'promo code', 'promo codes', 'coupon', 'coupon code', 'coupon codes',
  'discount code', 'discount codes', 'voucher',
  // Deals & Sales
  '% off', 'percent off', 'half off', 'save $',
  'best deals', 'top deals', 'deal alert', 'sale alert', 'flash sale',
  // Shopping Events
  'black friday', 'cyber monday', 'prime day',
  // Gift Content
  'gift guide', 'gift ideas', 'gift card',
]

// Tier 2: Tech keywords — matched with \b word boundaries to prevent
// substring false positives (e.g., 'ai' won't match 'said')
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
  'software', 'coding', 'developer', 'api', 'programming', 'open source', 'github',
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

// Tier 3: Non-tech keywords — matched with substring includes
const BLACKLIST_KEYWORDS = [
  // Food & Lifestyle
  'food', 'recipe', 'cooking', 'diet', 'fitness', 'workout', 'muscle', 'nutrition',
  'weight loss', 'meal prep',
  // Gift & Holiday
  'valentine', 'holiday gift', 'christmas gift', 'best gifts',
  'birthday gift',
  // Fashion & Beauty
  'fashion', 'beauty', 'skincare', 'makeup', 'cosmetic', 'hairstyle', 'outfit',
  'fashion week', 'runway',
  // Astrology
  'horoscope', 'zodiac', 'astrology', 'tarot',
  // Entertainment Reviews (non-tech)
  'movie review', 'tv review', 'show review', 'album review',
  'book review', 'concert review', 'film review',
  // Travel
  'travel guide', 'vacation', 'hotel review', 'destination', 'resort', 'tourism',
  // Relationships
  'relationship advice', 'dating tips', 'love life', 'marriage advice',
  // Sports
  'sports score', 'game recap', 'playoff', 'championship', 'tournament',
  'super bowl', 'world cup', 'olympics',
  // Celebrity & Gossip
  'celebrity', 'gossip', 'scandal', 'red carpet', 'paparazzi',
  // Weather
  'weather forecast',
  // Affiliate / Spam
  'affiliate',
]

// Pre-compile whitelist as word-boundary regexes for performance
const WHITELIST_PATTERNS = WHITELIST_KEYWORDS.map(keyword => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`\\b${escaped}\\b`, 'i')
})

/**
 * Checks if an article should be included based on 3-tier filtering.
 *
 * Logic:
 * 1. If ALWAYS_EXCLUDE pattern found → EXCLUDE (cannot be overridden)
 * 2. If whitelist keyword found (word-boundary) → INCLUDE
 * 3. If blacklist keyword found (substring) → EXCLUDE
 * 4. If neither found → INCLUDE
 */
export function shouldIncludeArticle(title: string): boolean {
  const lowerTitle = title.toLowerCase()

  // Tier 1: Mandatory exclusion (deals, promo, coupons)
  if (ALWAYS_EXCLUDE_PATTERNS.some(pattern => lowerTitle.includes(pattern))) {
    return false
  }

  // Tier 2: Whitelist with word-boundary matching
  if (WHITELIST_PATTERNS.some(pattern => pattern.test(title))) {
    return true
  }

  // Tier 3: Blacklist with substring matching
  if (BLACKLIST_KEYWORDS.some(keyword => lowerTitle.includes(keyword.toLowerCase()))) {
    return false
  }

  // Default: include
  return true
}

/**
 * Filters an array of articles, returning only tech-related ones.
 */
export function filterTechArticles<T extends { title: string }>(articles: T[]): T[] {
  return articles.filter(article => shouldIncludeArticle(article.title))
}
