'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { DistrictStats } from '@/types'

interface DistrictChartProps {
  data: DistrictStats[]
  type: 'price' | 'count'
}

export function DistrictChart({ data, type }: DistrictChartProps) {
  const chartData = data.map(stat => ({
    name: stat.district,
    value: type === 'price' ? stat.avgPricePerSqft : stat.propertyCount,
  }))

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
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
              type === 'price' ? `$${value}` : value.toString()
            }
          />
          <Tooltip 
            formatter={(value) => 
              type === 'price' ? [`$${value}`, 'Avg Price/sqft'] : [value, 'Properties']
            }
          />
          
          <Bar 
            dataKey="value" 
            fill={type === 'price' ? '#3b82f6' : '#10b981'}
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
