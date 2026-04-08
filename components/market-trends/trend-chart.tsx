'use client'

import { useTranslations } from 'next-intl'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TrendChartProps {
  data: Array<Record<string, string | number>>
  series: string[]
  metricType: 'rent' | 'price'
  isLoading?: boolean
}

const districtColors: Record<string, string> = {
  'Central': '#3b82f6',      // blue
  'Admiralty': '#10b981',    // emerald
  'Sheung Wan': '#f59e0b',   // amber
  'Wan Chai': '#8b5cf6',     // purple
  'Causeway Bay': '#ec4899', // pink
  'Tsim Sha Tsui': '#06b6d4', // cyan
  'Mong Kok': '#f97316',     // orange
  'North Point': '#14b8a6',  // teal
  'Quarry Bay': '#6366f1',   // indigo
  'Kowloon Bay': '#84cc16',  // lime
  'Kwun Tong': '#ef4444',    // red
  'Cheung Sha Wan': '#a855f7' // violet
}

const gradeDashArray: Record<string, string> = {
  'A+': '0',     // solid
  'A': '5 5',    // dashed
  'B': '2 2',    // dotted
  'C': '10 5'    // long dash
}

function getSeriesColor(seriesName: string): string {
  // Extract district from series name (e.g., "Central A+")
  const district = seriesName.split(' ')[0]
  return districtColors[district] || '#6b7280'
}

function getSeriesDashArray(seriesName: string): string {
  // Extract grade from series name (e.g., "Central A+")
  const grade = seriesName.split(' ')[1]
  return gradeDashArray[grade] || '0'
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { 
    year: '2-digit', 
    month: 'short' 
  })
}

function formatCurrency(value: number, metricType: 'rent' | 'price'): string {
  if (metricType === 'rent') {
    return `$${value.toFixed(2)}/sqft`
  } else {
    return `$${(value / 1000).toFixed(1)}K/sqft`
  }
}

export function TrendChart({ data, series, metricType, isLoading }: TrendChartProps) {
  const t = useTranslations('marketTrends')

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] md:h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0 || series.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{metricType === 'rent' ? t('chart.rentTrend') : t('chart.priceTrend')}</CardTitle>
          <CardDescription>{t('chart.noData')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px] md:h-[400px]">
          <p className="text-muted-foreground">{t('chart.noDataDescription')}</p>
        </CardContent>
      </Card>
    )
  }

  // Limit to top 6 series for readability
  const visibleSeries = series.slice(0, 6)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{metricType === 'rent' ? t('chart.rentTrend') : t('chart.priceTrend')}</CardTitle>
        <CardDescription>
          {metricType === 'rent' ? t('chart.rentDescription') : t('chart.priceDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data} 
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={formatDate}
                interval="preserveStartEnd"
                minTickGap={30}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                tickFormatter={(value) => 
                  metricType === 'rent' ? `$${value}` : `$${(value / 1000).toFixed(0)}K`
                }
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg max-w-xs">
                        <p className="font-medium mb-2">{formatDate(label as string)}</p>
                        <div className="space-y-1">
                          {payload
                            .filter(p => p.value !== undefined && p.value !== null)
                            .sort((a, b) => (b.value as number) - (a.value as number))
                            .map((entry, index) => (
                              <div key={index} className="flex items-center justify-between gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-0.5"
                                    style={{ 
                                      backgroundColor: entry.color,
                                      borderTop: entry.strokeDasharray !== '0' 
                                        ? `2px dashed ${entry.color}` 
                                        : undefined
                                    }}
                                  />
                                  <span className="truncate">{entry.name}</span>
                                </div>
                                <span className="font-medium">
                                  {formatCurrency(entry.value as number, metricType)}
                                </span>
                              </div>
                            ))}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '1rem' }}
                formatter={(value) => <span className="text-xs">{value}</span>}
              />
              {visibleSeries.map((seriesName) => (
                <Line
                  key={seriesName}
                  type="monotone"
                  dataKey={seriesName}
                  name={seriesName}
                  stroke={getSeriesColor(seriesName)}
                  strokeWidth={2}
                  strokeDasharray={getSeriesDashArray(seriesName)}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}