import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Techisy - 글로벌 & 한국 테크 뉴스'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 20,
              fontSize: 48,
              fontWeight: 700,
              color: 'white',
            }}
          >
            T
          </div>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-2px',
            }}
          >
            Techisy
          </div>
        </div>
        <div
          style={{
            fontSize: 32,
            color: '#94a3b8',
            marginTop: 10,
          }}
        >
          글로벌 & 한국 테크 뉴스
        </div>
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['TechCrunch', 'The Verge', 'Ars Technica', '+ 20개 소스'].map(
            (source) => (
              <div
                key={source}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 8,
                  color: '#cbd5e1',
                  fontSize: 18,
                }}
              >
                {source}
              </div>
            )
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
