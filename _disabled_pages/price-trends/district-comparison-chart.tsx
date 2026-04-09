import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import type { DistrictStats } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react'

interface DistrictComparisonChartProps {
  data: DistrictStats[]
  title?: string
  description?: string
  metricType?: 'price' | 'rent' | 'count'
}

export function DistrictComparisonChart({ 
  data, 
  title = "District Comparison",
  description = "Comparison of key metrics across districts",
  metricType = 'price'
}: DistrictComparisonChartProps) {
  
  const chartData = data.map(stat => ({
    name: stat.district,
    value: metricType === 'price' ? stat.avgPricePerSqft : 
           metricType === 'rent' ? stat.avgRentPerSqft || 0 : 
           stat.propertyCount,
    count: stat.transactionCount,
  }))
  
  // Calculate stats
  const values = chartData.map(d => d.value)
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length
  const maxValue = Math.max(...values)
  
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
          <Badge variant="outline" className="text-sm">
            {metricType === 'price' ? 'Avg Price/sqft' : 
             metricType === 'rent' ? 'Avg Rent/sqft' : 'Properties'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Overall Average</p>
            <p className="text-lg font-semibold text-blue-700">
              {metricType === 'price' ? `$${avgValue.toFixed(2)}` : 
               metricType === 'rent' ? `$${avgValue.toFixed(2)}` : 
               `${avgValue.toFixed(0)} properties`}
            </p>
          </div>
          
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Top District</p>
            <p className="text-lg font-semibold text-green-700">
              {chartData.find(d => d.value === maxValue)?.name}
            </p>
          </div>
          
          <div className="p-3 bg-orange-50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Total Transactions</p>
            <p className="text-lg font-semibold text-orange-700">
              {data.reduce((sum, d) => sum + d.transactionCount, 0)}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => 
                  metricType === 'price' ? `$${value}` : 
                  metricType === 'rent' ? `$${value}` : 
                  value.toString()
                }
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'value') {
                    return [
                      metricType === 'price' ? `$${value}` : 
                      metricType === 'rent' ? `$${value}` : 
                      `${value} properties`,
                      metricType === 'price' ? 'Avg Price/sqft' : 
                      metricType === 'rent' ? 'Avg Rent/sqft' : 'Properties'
                    ]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => `District: ${label}`}
              />
              
              <Legend />
              
              <Bar 
                dataKey="value" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                name={metricType === 'price' ? 'Avg Price/sqft' : 
                       metricType === 'rent' ? 'Avg Rent/sqft' : 'Properties'}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <p className="text-xs text-muted-foreground text-center">
          Showing {data.length} districts with {data.reduce((sum, d) => sum + d.transactionCount, 0)} total transactions
        </p>
      </CardContent>
    </Card>
  )
}