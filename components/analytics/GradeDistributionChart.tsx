'use client'

import { useTranslations } from 'next-intl'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface GradeData {
  grade: string
  count: number
  avgRent: number
  avgPrice: number
}

interface GradeDistributionChartProps {
  data: GradeData[]
}

const gradeColors: Record<string, string> = {
  'A+': '#10b981',
  'A': '#3b82f6',
  'B': '#f59e0b',
  'C': '#64748b'
}

export function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const t = useTranslations('analytics')

  const chartData = data.map(item => ({
    grade: `Grade ${item.grade}`,
    count: item.count,
    avgRent: item.avgRent,
    avgPrice: item.avgPrice,
    fill: gradeColors[item.grade] || '#94a3b8'
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('gradeAnalysis.title')}</CardTitle>
        <CardDescription>{t('gradeAnalysis.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="grade" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('gradeAnalysis.properties')}: {data.count}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('gradeAnalysis.avgRent')}: ${data.avgRent.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {t('gradeAnalysis.avgPrice')}: ${data.avgPrice.toLocaleString()}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend />
              <Bar 
                yAxisId="left"
                dataKey="count" 
                name={t('gradeAnalysis.propertyCount')}
                radius={[4, 4, 0, 0]}
                fill="#3b82f6"
              />
              <Bar 
                yAxisId="right"
                dataKey="avgRent" 
                name={t('gradeAnalysis.avgRentPerSqft')}
                radius={[4, 4, 0, 0]}
                fill="#10b981"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium">{t('gradeAnalysis.grade')}</th>
                <th className="text-right py-2 font-medium">{t('gradeAnalysis.properties')}</th>
                <th className="text-right py-2 font-medium">{t('gradeAnalysis.avgRent')}</th>
                <th className="text-right py-2 font-medium">{t('gradeAnalysis.avgPrice')}</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.grade} className="border-b last:border-0">
                  <td className="py-2">
                    <span 
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{ 
                        backgroundColor: `${gradeColors[item.grade]}20`,
                        color: gradeColors[item.grade]
                      }}
                    >
                      Grade {item.grade}
                    </span>
                  </td>
                  <td className="text-right py-2">{item.count}</td>
                  <td className="text-right py-2">${item.avgRent.toLocaleString()}</td>
                  <td className="text-right py-2">${item.avgPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
