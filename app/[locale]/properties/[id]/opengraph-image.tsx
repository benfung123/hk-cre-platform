import { ImageResponse } from 'next/og'
import { getPropertyById } from '@/lib/data'

export const runtime = 'edge'

export const alt = 'Property Details'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface OgImageProps {
  params: Promise<{
    id: string
  }>
}

export default async function OpenGraphImage({ params }: OgImageProps) {
  const { id } = await params
  const property = await getPropertyById(id)

  if (!property) {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)',
            color: 'white',
            fontSize: 48,
            fontWeight: 'bold',
          }}
        >
          Property Not Found
        </div>
      ),
      { ...size }
    )
  }

  // Get property icon based on grade
  const getPropertyIcon = (grade: string) => {
    switch (grade) {
      case 'A+':
        return '🏢'
      case 'A':
        return '🏢'
      case 'B':
        return '🏠'
      case 'C':
        return '🏭'
      default:
        return '🏢'
    }
  }

  // Format price/rent info
  const formatPriceInfo = () => {
    if (property.total_sqft) {
      const sqft = (property.total_sqft / 1000000).toFixed(1)
      return `${sqft}M sqft`
    }
    return null
  }

  const priceInfo = formatPriceInfo()

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #1e40af 100%)',
          padding: 60,
          position: 'relative',
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Top bar with brand */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 40,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
              }}
            >
              🏙️
            </div>
            <span
              style={{
                color: 'white',
                fontSize: 24,
                fontWeight: 600,
              }}
            >
              HK CRE Platform
            </span>
          </div>
          <div
            style={{
              background: 'rgba(255,255,255,0.2)',
              padding: '8px 16px',
              borderRadius: 20,
              color: 'white',
              fontSize: 18,
              fontWeight: 600,
            }}
          >
            {property.grade} Grade
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 20,
            zIndex: 1,
          }}
        >
          {/* Property icon and name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 20,
            }}
          >
            <div
              style={{
                fontSize: 72,
              }}
            >
              {getPropertyIcon(property.grade)}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                flex: 1,
              }}
            >
              <h1
                style={{
                  color: 'white',
                  fontSize: 56,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  margin: 0,
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                }}
              >
                {property.name}
              </h1>
              <p
                style={{
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: 28,
                  margin: 0,
                }}
              >
                {property.address}
              </p>
            </div>
          </div>

          {/* Details row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 24,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.15)',
                padding: '12px 20px',
                borderRadius: 12,
              }}
            >
              <span style={{ fontSize: 24 }}>📍</span>
              <span
                style={{
                  color: 'white',
                  fontSize: 22,
                  fontWeight: 500,
                }}
              >
                {property.district}
              </span>
            </div>

            {property.year_built && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.15)',
                  padding: '12px 20px',
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 24 }}>📅</span>
                <span
                  style={{
                    color: 'white',
                    fontSize: 22,
                    fontWeight: 500,
                  }}
                >
                  Built {property.year_built}
                </span>
              </div>
            )}

            {priceInfo && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(255,255,255,0.15)',
                  padding: '12px 20px',
                  borderRadius: 12,
                }}
              >
                <span style={{ fontSize: 24 }}>📊</span>
                <span
                  style={{
                    color: 'white',
                    fontSize: 22,
                    fontWeight: 500,
                  }}
                >
                  {priceInfo}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 40,
            paddingTop: 30,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            zIndex: 1,
          }}
        >
          <span
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 18,
            }}
          >
            Hong Kong Commercial Real Estate Platform
          </span>
          <span
            style={{
              color: 'rgba(255,255,255,0.7)',
              fontSize: 18,
            }}
          >
            hk-cre-platform.vercel.app
          </span>
        </div>
      </div>
    ),
    { ...size }
  )
}
