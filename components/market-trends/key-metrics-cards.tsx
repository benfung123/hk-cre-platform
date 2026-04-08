'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, DollarSign, Activity, BarChart3 } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface KeyMetricsCardsProps {
  stats: {
    avgRent: number
    avgPrice: number
    yoyChange: number
    fiveYearChange: number
    currentRent: number
    currentPrice: number
  }
  isLoading?: boolean
  metricType: 'rent' | 'price'
}

export function KeyMetricsCards({ stats, isLoading, metricType }: KeyMetricsCardsProps) {
  const t = useTranslations('marketTrends')

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

  const currentValue = metricType === 'rent' ? stats.currentRent : stats.currentPrice
  const avgValue = metricType === 'rent' ? stats.avgRent : stats.avgPrice

  const metrics = [
    {
      title: metricType === 'rent' ? t('metrics.currentRent') : t('metrics.currentPrice'),
      value: metricType === 'rent' 
        ? `$${currentValue.toFixed(2)}/sqft`
        : `$${(currentValue / 1000).toFixed(1)}K/sqft`,
      subtitle: metricType === 'rent' ? t('metrics.perSqft') : t('metrics.perSqft'),
      icon: DollarSign,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('metrics.avgValue'),
      value: metricType === 'rent'
        ? `$${avgValue.toFixed(2)}/sqft`
        : `$${(avgValue / 1000).toFixed(1)}K/sqft`,
      subtitle: t('metrics.acrossSelected'),
      icon: BarChart3,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: t('metrics.yoyChange'),
      value: `${stats.yoyChange >= 0 ? '+' : ''}${stats.yoyChange.toFixed(1)}%`,
      subtitle: t('metrics.vsLastYear'),
      icon: stats.yoyChange >= 0 ? TrendingUp : TrendingDown,
      color: stats.yoyChange >= 0 ? 'text-emerald-600' : 'text-rose-600',
      bgColor: stats.yoyChange >= 0 ? 'bg-emerald-50' : 'bg-rose-50',
      trend: stats.yoyChange
    },
    {
      title: t('metrics.fiveYearTrend'),
      value: `${stats.fiveYearChange >= 0 ? '+' : ''}${stats.fiveYearChange.toFixed(1)}%`,
      subtitle: t('metrics.vs5YearsAgo'),
      icon: Activity,
      color: stats.fiveYearChange >= 0 ? 'text-blue-600' : 'text-amber-600',
      bgColor: 'bg-blue-50',
      trend: stats.fiveYearChange
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-lg md:text-2xl font-bold truncate">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.subtitle}</p>
            {metric.trend !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium ${
                metric.trend >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {metric.trend >= 0 ? (
                  <><TrendingUp className="h-3 w-3" /> <span>{t('metrics.up')}</span></>
                ) : (
                  <><TrendingDown className="h-3 w-3" /> <span>{t('metrics.down')}</span></>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}