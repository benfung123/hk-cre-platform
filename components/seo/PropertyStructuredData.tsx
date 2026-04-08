import type { Property } from '@/types'

interface PropertyStructuredDataProps {
  property: Property
}

/**
 * Generates Schema.org RealEstateListing structured data for SEO
 * Follows Google Real Estate Listing structured data guidelines
 * @see https://schema.org/RealEstateListing
 */
export function PropertyStructuredData({ property }: PropertyStructuredDataProps) {
  const baseUrl = 'https://hk-cre-platform.vercel.app'
  
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.name,
    description: `${property.name} - ${property.grade} Grade Office Building`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: property.address,
      addressLocality: property.district,
      addressCountry: 'HK',
    },
    floorSize: property.total_sqft
      ? {
          '@type': 'QuantitativeValue',
          value: property.total_sqft,
          unitCode: 'FTK', // Square feet
        }
      : undefined,
    yearBuilt: property.year_built || undefined,
    url: `${baseUrl}/properties/${property.id}`,
    dateModified: property.updated_at || new Date().toISOString(),
    // Additional properties for commercial real estate
    ...(property.grade && {
      additionalProperty: [
        {
          '@type': 'PropertyValue',
          name: 'Building Grade',
          value: property.grade,
        },
      ],
    }),
    // Geolocation if available
    ...(property.lat &&
      property.lng && {
        geo: {
          '@type': 'GeoCoordinates',
          latitude: property.lat,
          longitude: property.lng,
        },
      }),
  }

  // Remove undefined values
  const cleanJsonLd = JSON.stringify(jsonLd, (key, value) =>
    value === undefined ? undefined : value
  )

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: cleanJsonLd }}
    />
  )
}
