'use client'

import { useState } from 'react'
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
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

interface DistrictData {
  district: string
  count: number
  avgRent: number
  avgPrice: number
}

interface DistrictComparisonTableProps {
  data: DistrictData[]
}

type SortKey = 'district' | 'count' | 'avgRent' | 'avgPrice'
type SortOrder = 'asc' | 'desc'

export function DistrictComparisonTable({ data }: DistrictComparisonTableProps) {
  const t = useTranslations('analytics')
  const [sortKey, setSortKey] = useState<SortKey>('count')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('desc')
    }
  }

  const sortedData = [...data].sort((a, b) => {
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

  const getSortIcon = (key: SortKey) => {
    if (sortKey !== key) return <ArrowUpDown className="h-3 w-3 ml-1" />
    return sortOrder === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const SortButton = ({ columnKey, children }: { columnKey: SortKey; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(columnKey)}
      className="h-8 flex items-center font-medium"
    >
      {children}
      {getSortIcon(columnKey)}
    </Button>
  )

  // Get translated district name
  const getDistrictName = (district: string) => {
    const districtKey = district.replace(/\s+/g, '')
    return t(`districts.${districtKey}`) || district
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('districtAnalysis.title')}</CardTitle>
        <CardDescription>{t('districtAnalysis.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortButton columnKey="district">{t('districtAnalysis.district')}</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton columnKey="count">{t('districtAnalysis.properties')}</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton columnKey="avgRent">{t('districtAnalysis.avgRent')}</SortButton>
                </TableHead>
                <TableHead className="text-right">
                  <SortButton columnKey="avgPrice">{t('districtAnalysis.avgPrice')}</SortButton>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((item) => (
                <TableRow key={item.district}>
                  <TableCell className="font-medium">{getDistrictName(item.district)}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                  <TableCell className="text-right">${item.avgRent.toLocaleString()}</TableCell>
                  <TableCell className="text-right">${item.avgPrice.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground">
          {t('districtAnalysis.totalDistricts', { count: data.length })}
        </div>
      </CardContent>
    </Card>
  )
}
