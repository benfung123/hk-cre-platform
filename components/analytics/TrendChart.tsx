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
  Area,
  AreaChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

// Mock data for 12-month trend - in production this would come from the API
const mockTrendData = [
  { month: 'Jan 2025', rent: 45, transactions: 12 },
  { month: 'Feb 2025', rent: 47, transactions: 15 },
  { month: 'Mar 2025', rent: 46, transactions: 18 },
  { month: 'Apr 2025', rent: 48, transactions: 22 },
  { month: 'May 2025', rent: 50, transactions: 25 },
  { month: 'Jun 2025', rent: 49, transactions: 20 },
  { month: 'Jul 2025', rent: 52, transactions: 28 },
  { month: 'Aug 2025', rent: 53, transactions: 30 },
  { month: 'Sep 2025', rent: 51, transactions: 26 },
  { month: 'Oct 2025', rent: 54, transactions: 32 },
  { month: 'Nov 2025', rent: 55, transactions: 35 },
  { month: 'Dec 2025', rent: 56, transactions: 38 },
  { month: 'Jan 2026', rent: 58, transactions: 42 },
]

interface TrendChartProps {
  data?: { month: string; rent: number; transactions: number }[]
}

export function TrendChart({ data = mockTrendData }: TrendChartProps) {
  const t = useTranslations('analytics')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('trendAnalysis.title')}</CardTitle>
        <CardDescription>{t('trendAnalysis.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-blue-600">
                          {t('trendAnalysis.avgRent')}: ${payload[0].value}
                        </p>
                        <p className="text-sm text-emerald-600">
                          {t('trendAnalysis.transactions')}: {payload[1]?.value}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="rent" 
                name={t('trendAnalysis.avgRent')}
                stroke="#3b82f6" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRent)" 
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="transactions" 
                name={t('trendAnalysis.transactions')}
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
