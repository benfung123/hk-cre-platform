import { Suspense } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { PropertyList } from '@/components/property-list'
import { PropertyFilters } from '@/components/property-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { getProperties, getDistricts } from '@/lib/data'

interface PropertiesPageProps {
  searchParams: Promise<{
    district?: string
    grade?: string
    search?: string
  }>
}

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic'

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const params = await searchParams
  const t = await getTranslations()
  
  const [properties, districts] = await Promise.all([
    getProperties({
      district: params.district,
      grade: params.grade,
      search: params.search
    }),
    getDistricts()
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="relative py-12 bg-gradient-to-b from-muted/50 to-background overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/banner-properties.png"
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        </div>
        <div className="container relative z-10">
          <h1 className="text-3xl font-bold">{t('properties.page.title')}</h1>
          <p className="text-muted-foreground">
            {t('properties.page.subtitle')}
          </p>
        </div>
      </section>

      <div className="container py-8">
        <div className="flex flex-col gap-8">
          <PropertyFilters districts={districts} />

          <Suspense fallback={<PropertyListSkeleton />}>
            <PropertyList properties={properties} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function PropertyListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-64" />
      ))}
    </div>
  )
}
