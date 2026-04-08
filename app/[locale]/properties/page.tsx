import { Suspense } from 'react'
import { getLocale, getTranslations } from 'next-intl/server'
import { PropertyList } from '@/components/property-list'
import { PropertyFilters } from '@/components/property-filters'
import { Skeleton } from '@/components/ui/skeleton'
import { getProperties, getDistricts } from '@/lib/data'
import { DataFreshnessIndicator } from '@/components/data-source'
import { Database, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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

  // Get the most recent update date from properties
  const mostRecentUpdate = properties.length > 0 
    ? properties.reduce((latest, p) => 
        new Date(p.updated_at) > new Date(latest) ? p.updated_at : latest,
        properties[0].updated_at
      )
    : new Date().toISOString()

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
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{t('properties.page.title')}</h1>
              <p className="text-muted-foreground">
                {t('properties.page.subtitle')}
              </p>
            </div>
            
            {/* Data Freshness Indicator */}
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-background/80 backdrop-blur-sm rounded-lg border shadow-sm cursor-help">
                      <Database className="h-4 w-4 text-primary" />
                      <DataFreshnessIndicator 
                        lastUpdated={mostRecentUpdate}
                        showLabel={true}
                      />
                      <Info className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">Data Source Information</p>
                      <p className="text-xs text-muted-foreground">
                        Property data is sourced from the Hong Kong Rating and Valuation Department (RVD). 
                        Updates are processed regularly to ensure accuracy.
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last data refresh: {new Date(mostRecentUpdate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
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
