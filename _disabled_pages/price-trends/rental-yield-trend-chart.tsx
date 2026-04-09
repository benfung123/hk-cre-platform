import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'
import type { Transaction } from '@/types'

interface RentalYieldTrendChartProps {
  transactions: Transaction[]
  title?: string
  description?: string
  timeRange?: '1Y' | '3Y' | '5Y'
}

interface ChartDataPoint {
  date: string
  fullDate: string
  yield: number
  yieldFormatted: string
  price: number | null
  rent: number | null
}

export function RentalYieldTrendChart({ 
  transactions, 
  title = "Rental Yield Trend",
  description = "Historical rental yield trends over time",
  timeRange = '1Y'
}: RentalYieldTrendChartProps) {
  
  const { chartData, stats, trendAnalysis } = useMemo(() => {
    // Filter and sort lease transactions with both price and rent data
    const leaseTransactions = transactions
      .filter(t => t.type === 'lease' && t.price_per_sqft && t.price && t.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Calculate rental yield: (annual rent / property price) * 100
    const yieldTransactions = leaseTransactions.map(t => ({
      ...t,
      yield: (t.price * 12 / t.price_per_sqft) * 100 // Annual rent / price * 100
    }))
    
    // Filter by time range
    const now = new Date()
    let filteredTransactions = yieldTransactions
    
    if (timeRange === '1Y') {
      const oneYearAgo = new Date()
      oneYearAgo.setFullYear(now.getFullYear() - 1)
      filteredTransactions = yieldTransactions.filter(t => new Date(t.date) >= oneYearAgo)
    } else if (timeRange === '3Y') {
      const threeYearsAgo = new Date()
      threeYearsAgo.setFullYear(now.getFullYear() - 3)
      filteredTransactions = yieldTransactions.filter(t => new Date(t.date) >= threeYearsAgo)
    } else if (timeRange === '5Y') {
      const fiveYearsAgo = new Date()
      fiveYearsAgo.setFullYear(now.getFullYear() - 5)
      filteredTransactions = yieldTransactions.filter(t => new Date(t.date) >= fiveYearsAgo)
    }
    
    const chartData: ChartDataPoint[] = filteredTransactions.map(t => ({
      date: new Date(t.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      }),
      fullDate: t.date,
      yield: t.yield,
      yieldFormatted: `${t.yield.toFixed(2)}%`,
      price: t.price,
      rent: t.price_per_sqft
    }))
    
    // Calculate linear trend line
    if (chartData.length >= 2) {
      const n = chartData.length
      const sumX = chartData.reduce((sum, _, i) => sum + i, 0)
      const sumY = chartData.reduce((sum, d) => sum + d.yield, 0)
      const sumXY = chartData.reduce((sum, d, i) => sum + i * d.yield, 0)
      const sumXX = chartData.reduce((sum, _, i) => sum + i * i, 0)
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
      const intercept = (sumY - slope * sumX) / n
      
      chartData.forEach((d, i) => {
        d.yield = slope * i + intercept
      })
    }
    
    // Calculate stats
    const yields = chartData.map(d => d.yield).filter(Boolean)
    let stats = null
    let trendAnalysis = null
    
    if (yields.length > 0) {
      const avg = yields.reduce((a, b) => a + b, 0) / yields.length
      const min = Math.min(...yields)
      const max = Math.max(...yields)
      
      // Calculate YoY change if we have enough data points
      if (chartData.length >= 2) {
        const firstYield = chartData[0].yield
        const lastYield = chartData[chartData.length - 1].yield
        const yoyChange = ((lastYield - firstYield) / firstYield) * 100
        
        // Calculate trend direction (last 3 vs first 3 points)
        let trendDirection: 'up' | 'down' | 'stable' = 'stable'
        if (chartData.length >= 6) {
          const firstThree = chartData.slice(0, 3).reduce((sum, d) => sum + d.yield, 0) / 3
          const lastThree = chartData.slice(-3).reduce((sum, d) => sum + d.yield, 0) / 3
          
          if (lastThree > firstThree * 1.05) trendDirection = 'up'
          else if (lastThree < firstThree * 0.95) trendDirection = 'down'
        }
        
        trendAnalysis = {
          yoyChange,
          trendDirection,
          firstDate: chartData[0].fullDate,
          lastDate: chartData[chartData.length - 1].fullDate
        }
      }
      
      stats = { avg, min, max }
    }
    
    return { chartData, stats, trendAnalysis }
  }, [transactions, timeRange])

  if (chartData.length === 0) {
    return null
  }

  const getTrendIcon = () => {
    if (!trendAnalysis) return <Minus className="h-4 w-4" />
    switch (trendAnalysis.trendDirection) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendBadge = () => {
    if (!trendAnalysis) return null
    const isUp = trendAnalysis.yoyChange > 0
    const isSignificant = Math.abs(trendAnalysis.yoyChange) > 0.5
    
    return (
      <Badge 
        variant={isSignificant ? (isUp ? 'default' : 'destructive') : 'secondary'}
        className="gap-1"
      >
        {getTrendIcon()}
        {trendAnalysis.yoyChange > 0 ? '+' : ''}{trendAnalysis.yoyChange.toFixed(2)}%
      </Badge>
    )
  }

  const formatDateRange = () => {
    if (!trendAnalysis) return ''
    const first = new Date(trendAnalysis.firstDate).toLocaleDateString('en-US', { 
      month: 'short', year: 'numeric' 
    })
    const last = new Date(trendAnalysis.lastDate).toLocaleDateString('en-US', { 
      month: 'short', year: 'numeric' 
    })
    return `${first} - ${last}`
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {getTrendBadge()}
        </div>
        
        {trendAnalysis && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatDateRange()}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Average</p>
              <p className="text-lg font-semibold text-blue-700">{stats.avg.toFixed(2)}%</p>
            </div>
            
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Lowest</p>
              <p className="text-lg font-semibold text-green-700">{stats.min.toFixed(2)}%</p>
            </div>
            
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Highest</p>
              <p className="text-lg font-semibold text-orange-700">{stats.max.toFixed(2)}%</p>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                angle={-45}
                textAnchor="end"
                height={60}
                stroke="#9ca3af"
              />
              
              <YAxis 
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickFormatter={(value) => `${value}%`}
                stroke="#9ca3af"
                domain={['auto', 'auto']}
              />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as ChartDataPoint
                    return (
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium mb-1">{label}</p>
                        <div className="space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">Yield: </span>
                            <span className="font-semibold text-primary">{data.yieldFormatted}</span>
                          </p>
                          {data.price && data.rent && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Price: </span>
                              <span>${data.price.toLocaleString()}</span>
                            </p>
                          )}
                          {data.price && data.rent && (
                            <p className="text-sm">
                              <span className="text-muted-foreground">Rent: </span>
                              <span>${data.rent.toFixed(2)}/sqft</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              
              {/* Area fill */}
              <Area
                type="monotone"
                dataKey="yield"
                stroke="none"
                fill="url(#yieldGradient)"
              />
              
              {/* Trend line */}
              {chartData.some(d => d.yield) && (
                <Line 
                  type="monotone" 
                  dataKey="yield" 
                  stroke="#059669" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Trend"
                />
              )}
              
              {/* Actual yield line */}
              <Line 
                type="monotone" 
                dataKey="yield" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, stroke: '#fff', r: 5 }}
                activeDot={{ r: 7, stroke: '#10b981', strokeWidth: 2, fill: '#fff' }}
                name="Rental Yield"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Based on {chartData.length} lease transaction{chartData.length !== 1 ? 's' : ''}
        </p>
      </CardContent>
    </Card>
  )
}