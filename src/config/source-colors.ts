const SOURCE_COLORS: Record<string, string> = {
  // International
  'TechCrunch': '#0A9E01',
  'The Verge': '#E5127D',
  'Wired': '#000000',
  'Ars Technica': '#FF4E00',
  'Engadget': '#000000',
  'Reuters Tech': '#FF6600',
  '9to5Mac': '#2997FF',
  '9to5Google': '#4285F4',
  'Android Authority': '#A4C639',
  'MacRumors': '#333333',
  'Toms Hardware': '#E00000',
  'The Decoder': '#6366F1',
  'VentureBeat': '#7C3AED',
  'Gizmodo': '#222222',
  'CNET': '#E21836',
  'ZDNet': '#E21836',
  'Fast Company': '#000000',

  // Korean
  '디지털투데이': '#0066CC',
  'AI타임스': '#7C3AED',
  '테크M': '#1D4ED8',
  '플래텀': '#3B82F6',
  '전자신문': '#003366',
  '테크42': '#10B981',
  '비석세스': '#F59E0B',
  'ITWorld': '#DC2626',
  '지디넷코리아': '#E31937',
  '요즘IT': '#6366F1',
  'GeekNews': '#FF6600',
}

const DEFAULT_COLOR = '#6B7280'

export function getSourceColor(sourceName: string): string {
  return SOURCE_COLORS[sourceName] || DEFAULT_COLOR
}
