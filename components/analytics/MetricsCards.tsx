'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, DollarSign, TrendingUp, BarChart3 } from 'lucide-react'

interface MetricsCardsProps {
  totalProperties: number
  avgRent: number
  avgPrice: number
  totalTransactions: number
}

export function MetricsCards({ 
  totalProperties, 
  avgRent, 
  avgPrice, 
  totalTransactions 
}: MetricsCardsProps) {
  const t = useTranslations('analytics')

  const metrics = [
    {
      title: t('metrics.totalProperties'),
      value: totalProperties.toLocaleString(),
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('metrics.avgRent'),
      value: `$${avgRent.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50'
    },
    {
      title: t('metrics.avgPrice'),
      value: `$${avgPrice.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      title: t('metrics.totalTransactions'),
      value: totalTransactions.toLocaleString(),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${metric.bgColor}`}>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
