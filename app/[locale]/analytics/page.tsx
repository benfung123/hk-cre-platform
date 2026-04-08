import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  MetricsCards, 
  GradeDistributionChart, 
  DistrictComparisonTable,
  TrendChart 
} from '@/components/analytics'
import { BarChart3 } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface AnalyticsData {
  totalProperties: number
  avgRent: number
  avgPrice: number
  totalTransactions: number
  gradeDistribution: Array<{
    grade: string
    count: number
    avgRent: number
    avgPrice: number
  }>
  districtSummary: Array<{
    district: string
    count: number
    avgRent: number
    avgPrice: number
  }>
}

async function getAnalyticsData(): Promise<AnalyticsData> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  try {
    const response = await fetch(`${baseUrl}/api/analytics/overview`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch analytics data')
    }
    
    return response.json()
  } catch (error) {
    console.error('Error fetching analytics:', error)
    // Return default data if API fails
    return {
      totalProperties: 0,
      avgRent: 0,
      avgPrice: 0,
      totalTransactions: 0,
      gradeDistribution: [],
      districtSummary: []
    }
  }
}

export default async function AnalyticsPage() {
  const t = await getTranslations()
  const data = await getAnalyticsData()

  return (
    <div className="flex flex-col">
      {/* Hero Banner */}
      <section className="relative py-12 bg-gradient-to-b from-muted/50 to-background overflow-hidden">
        <div className="container relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('nav.analytics')}</h1>
              <p className="text-muted-foreground">
                {t('analytics.page.subtitle')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="container py-8">
        <div className="flex flex-col gap-8">
          {/* Key Metrics */}
          <Suspense fallback={<MetricsSkeleton />}>
            <MetricsCards 
              totalProperties={data.totalProperties}
              avgRent={data.avgRent}
              avgPrice={data.avgPrice}
              totalTransactions={data.totalTransactions}
            />
          </Suspense>

          {/* Trend Chart */}
          <Suspense fallback={<ChartSkeleton />}>
            <TrendChart />
          </Suspense>

          {/* Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Grade Distribution */}
            <Suspense fallback={<ChartSkeleton />}>
              <GradeDistributionChart data={data.gradeDistribution} />
            </Suspense>

            {/* Top Districts Card */}
            <Card>
              <CardHeader>
                <CardTitle>{t('analytics.topDistricts.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.districtSummary.slice(0, 5).map((district, index) => (
                    <div key={district.district} className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{district.district}</span>
                          <span className="text-sm text-muted-foreground">
                            {district.count} {t('analytics.properties')}
                          </span>
                        </div>
                        <div className="mt-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary rounded-full"
                            style={{ 
                              width: `${(district.count / (data.districtSummary[0]?.count || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* District Comparison Table */}
          <Suspense fallback={<TableSkeleton />}>
            <DistrictComparisonTable data={data.districtSummary} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-80 w-full" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
