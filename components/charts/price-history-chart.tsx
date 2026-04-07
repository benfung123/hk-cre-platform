'use client'

import { useMemo } from 'react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Transaction } from '@/types'

interface PriceHistoryChartProps {
  transactions: Transaction[]
  title?: string
  description?: string
}

export function PriceHistoryChart({ 
  transactions, 
  title = "Price History",
  description = "Historical transaction prices over time"
}: PriceHistoryChartProps) {
  
  const chartData = useMemo(() => {
    // Filter and sort lease transactions
    const leaseTransactions = transactions
      .filter(t => t.type === 'lease' && t.price_per_sqft && t.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(t => ({
        date: new Date(t.date).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        }),
        fullDate: t.date,
        price: t.price_per_sqft,
        priceFormatted: `$${t.price_per_sqft?.toFixed(2)}`,
        area: t.floor_area
      }))
    
    return leaseTransactions
  }, [transactions])

  const stats = useMemo(() => {
    if (chartData.length === 0) return null
    
    const prices = chartData.map(d => d.price).filter((p): p is number => p !== null && p !== undefined)
    if (prices.length === 0) return null
    
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    const min = Math.min(...prices)
    const max = Math.max(...prices)
    
    return { avg, min, max }
  }, [chartData])

  if (chartData.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Average</p>
              <p className="text-lg font-semibold">${stats.avg.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Lowest</p>
              <p className="text-lg font-semibold text-green-600">${stats.min.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground">Highest</p>
              <p className="text-lg font-semibold text-red-600">${stats.max.toFixed(2)}</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price per sqft']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Based on {chartData.length} lease transaction{chartData.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  )
}
