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
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">{t('properties.page.title')}</h1>
          <p className="text-muted-foreground">
            {t('properties.page.subtitle')}
          </p>
        </div>

        <PropertyFilters districts={districts} />

        <Suspense fallback={<PropertyListSkeleton />}>
          <PropertyList properties={properties} />
        </Suspense>
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
