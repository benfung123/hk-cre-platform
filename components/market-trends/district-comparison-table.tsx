'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { MarketTrendRecord } from '@/hooks/use-market-trends'
import { Skeleton } from '@/components/ui/skeleton'

interface DistrictComparisonTableProps {
  data: MarketTrendRecord[]
  isLoading?: boolean
  metricType: 'rent' | 'price'
}

interface DistrictSummary {
  district: string
  currentValue: number
  yoyChange: number
  avgValue: number
  dataPoints: number
  trend: 'up' | 'down' | 'flat'
}

type SortKey = 'district' | 'currentValue' | 'yoyChange' | 'avgValue' | 'dataPoints'
type SortOrder = 'asc' | 'desc'

export function DistrictComparisonTable({ data, isLoading, metricType }: DistrictComparisonTableProps) {
  const t = useTranslations('marketTrends')
  const [sortKey, setSortKey] = useState<SortKey>('currentValue')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  // Calculate district summaries
  const districtSummaries = useMemo(() => {
    const districtMap = new Map<string, MarketTrendRecord[]>()
    
    // Group by district
    data.forEach(record => {
      if (!districtMap.has(record.district)) {
        districtMap.set(record.district, [])
      }
      districtMap.get(record.district)!.push(record)
    })
    
    const summaries: DistrictSummary[] = []
    
    districtMap.forEach((records, district) => {
      // Sort by date descending
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      const currentRecord = records[0]
      const currentValue = metricType === 'rent' 
        ? currentRecord?.rent_per_sqft || 0 
        : currentRecord?.price_per_sqft || 0
      
      // Calculate average
      const avgValue = records.reduce((sum, r) => 
        sum + (metricType === 'rent' ? r.rent_per_sqft : r.price_per_sqft), 0
      ) / records.length
      
      // Calculate YoY change
      const currentDate = currentRecord ? new Date(currentRecord.date) : new Date()
      const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1)
      
      const lastYearRecord = records.find(r => {
        const date = new Date(r.date)
        return date.getFullYear() === oneYearAgo.getFullYear() && 
               date.getMonth() === oneYearAgo.getMonth()
      })
      
      const lastYearValue = lastYearRecord 
        ? (metricType === 'rent' ? lastYearRecord.rent_per_sqft : lastYearRecord.price_per_sqft)
        : currentValue
      
      const yoyChange = lastYearValue > 0 
        ? ((currentValue - lastYearValue) / lastYearValue) * 100 
        : 0
      
      const trend = yoyChange > 1 ? 'up' : yoyChange < -1 ? 'down' : 'flat'
      
      summaries.push({
        district,
        currentValue,
        yoyChange,
        avgValue,
        dataPoints: records.length,
        trend
      })
    })
    
    return summaries
  }, [data, metricType])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const sortedData = useMemo(() => {
    return [...districtSummaries].sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      return sortOrder === 'asc'
        ? (aValue as number) - (bValue as number)
        : (bValue as number) - (aValue as number)
    })
  }, [districtSummaries, sortKey, sortOrder])

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 ml-1" />
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const formatValue = (value: number) => {
    if (metricType === 'rent') {
      return `$${value.toFixed(2)}/sqft`
    } else {
      return `$${(value / 1000).toFixed(1)}K/sqft`
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (districtSummaries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('table.districtComparison')}</CardTitle>
          <CardDescription>{t('table.noDataDescription')}</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">{t('table.selectDistricts')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('table.districtComparison')}</CardTitle>
        <CardDescription>{t('table.comparisonDescription')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('district')}
                    className="h-8 flex items-center font-medium"
                  >
                    {t('table.district')}
                    {getSortIcon('district')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('currentValue')}
                    className="h-8 flex items-center font-medium"
                  >
                    {t('table.currentValue')}
                    {getSortIcon('currentValue')}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('yoyChange')}
                    className="h-8 flex items-center font-medium"
                  >
                    {t('table.yoyChange')}
                    {getSortIcon('yoyChange')}
                  </Button>
                </TableHead>
                <TableHead className="text-right hidden md:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('avgValue')}
                    className="h-8 flex items-center font-medium"
                  >
                    {t('table.avgValue')}
                    {getSortIcon('avgValue')}
                  </Button>
                </TableHead>
                <TableHead className="text-right hidden sm:table-cell">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('dataPoints')}
                    className="h-8 flex items-center font-medium"
                  >
                    {t('table.dataPoints')}
                    {getSortIcon('dataPoints')}
                  </Button>
                </TableHead>
                <TableHead className="text-center">{t('table.trend')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.district}>
                  <TableCell className="font-medium">{item.district}</TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatValue(item.currentValue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`
                      inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                      ${item.yoyChange >= 0 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-rose-50 text-rose-700'
                      }
                    `}>
                      {item.yoyChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {item.yoyChange > 0 ? '+' : ''}{item.yoyChange.toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                    {formatValue(item.avgValue)}
                  </TableCell>
                  <TableCell className="text-right hidden sm:table-cell text-muted-foreground">
                    {item.dataPoints}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.trend === 'up' && <TrendingUp className="h-4 w-4 text-emerald-500 mx-auto" />}
                    {item.trend === 'down' && <TrendingDown className="h-4 w-4 text-rose-500 mx-auto" />}
                    {item.trend === 'flat' && <Minus className="h-4 w-4 text-muted-foreground mx-auto" />}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          {t('table.showingDistricts', { count: sortedData.length })}
        </div>
      </CardContent>
    </Card>
  )
}