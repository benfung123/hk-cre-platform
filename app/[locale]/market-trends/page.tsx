'use client'

import { useTranslations } from 'next-intl'
import { TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  FilterControlBar, 
  TrendChart, 
  KeyMetricsCards,
  DistrictComparisonTable 
} from '@/components/market-trends'
import { useMarketTrends } from '@/hooks/use-market-trends'

export default function MarketTrendsPage() {
  const t = useTranslations('marketTrends')
  const {
    filters,
    updateFilters,
    resetFilters,
    data,
    isLoading,
    error,
    stats,
    chartData,
    chartSeries,
    availableDistricts,
    availableGrades,
    refetch
  } = useMarketTrends()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-8 md:py-12 bg-gradient-to-b from-muted/50 to-background overflow-hidden">
        <div className="container relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{t('page.title')}</h1>
              <p className="text-muted-foreground text-sm md:text-base">{t('page.subtitle')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Control Bar */}
      <div className="container">
        <FilterControlBar
          filters={filters}
          availableDistricts={availableDistricts}
          availableGrades={availableGrades}
          onUpdateFilters={updateFilters}
          onResetFilters={resetFilters}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content */}
      <div className="container py-6 md:py-8">
        <div className="flex flex-col gap-6 md:gap-8">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="outline" size="sm" onClick={refetch}>
                  <RefreshCw className="h-4 w-4 mr-1" />
                  {t('page.retry')}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Key Metrics */}
          <KeyMetricsCards 
            stats={stats} 
            isLoading={isLoading}
            metricType={filters.metricType}
          />

          {/* Trend Chart */}
          <TrendChart 
            data={chartData}
            series={chartSeries}
            metricType={filters.metricType}
            isLoading={isLoading}
          />

          {/* District Comparison Table */}
          <DistrictComparisonTable 
            data={data}
            isLoading={isLoading}
            metricType={filters.metricType}
          />

          {/* Data Source Note */}
          <div className="text-xs text-muted-foreground text-center py-4">
            {t('page.dataSource')}
          </div>
        </div>
      </div>
    </div>
  )
}