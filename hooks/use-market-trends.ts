'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

export interface MarketTrendRecord {
  id: number
  date: string
  district: string
  grade: string
  period_type: 'monthly' | 'quarterly' | 'yearly'
  property_type: 'office' | 'retail' | 'industrial'
  rent_per_sqft: number
  rent_per_sqm: number
  price_per_sqft: number
  price_per_sqm: number
  rent_index: number
  price_index: number
  transaction_count?: number
  created_at?: string
}

export interface MarketTrendSummary {
  totalRecords: number
  districts: string[]
  grades: string[]
  periodTypes: string[]
  dateRange: {
    start: string
    end: string
  } | null
}

export interface MarketTrendsResponse {
  success: boolean
  summary: MarketTrendSummary
  data: MarketTrendRecord[]
}

export interface FilterState {
  districts: string[]
  grades: string[]
  timeRange: '1Y' | '3Y' | '5Y' | '10Y' | 'ALL' | 'CUSTOM'
  customStartDate?: string
  customEndDate?: string
  propertyType: 'office' | 'retail' | 'industrial'
  metricType: 'rent' | 'price'
  periodType: 'monthly' | 'quarterly'
}

const defaultFilters: FilterState = {
  districts: [],
  grades: ['A+', 'A'],
  timeRange: '5Y',
  propertyType: 'office',
  metricType: 'rent',
  periodType: 'monthly'
}

// Get date range based on time range selection
function getDateRangeForTimeRange(timeRange: FilterState['timeRange'], customStart?: string, customEnd?: string): { start: string; end: string } {
  const end = new Date()
  const start = new Date()
  
  switch (timeRange) {
    case '1Y':
      start.setFullYear(end.getFullYear() - 1)
      break
    case '3Y':
      start.setFullYear(end.getFullYear() - 3)
      break
    case '5Y':
      start.setFullYear(end.getFullYear() - 5)
      break
    case '10Y':
      start.setFullYear(end.getFullYear() - 10)
      break
    case 'ALL':
      start.setFullYear(1982)
      break
    case 'CUSTOM':
      if (customStart && customEnd) {
        return { start: customStart, end: customEnd }
      }
      start.setFullYear(end.getFullYear() - 5)
      break
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0]
  }
}

export function useMarketTrends(initialFilters?: Partial<FilterState>) {
  const [filters, setFilters] = useState<FilterState>({ ...defaultFilters, ...initialFilters })
  const [data, setData] = useState<MarketTrendRecord[]>([])
  const [summary, setSummary] = useState<MarketTrendSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const dateRange = getDateRangeForTimeRange(
        filters.timeRange,
        filters.customStartDate,
        filters.customEndDate
      )
      
      // Build query params
      const params = new URLSearchParams({
        propertyType: filters.propertyType,
        periodType: filters.periodType,
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: '5000',
        order: 'asc'
      })
      
      // For now, we fetch all data and filter client-side for multiple districts/grades
      // The API supports single district/grade filtering
      
      const response = await fetch(`/api/market-trends?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch market trends data')
      }
      
      const result: MarketTrendsResponse = await response.json()
      
      if (!result.success) {
        throw new Error('API returned unsuccessful response')
      }
      
      // Client-side filtering for districts and grades
      let filteredData = result.data
      
      if (filters.districts.length > 0) {
        filteredData = filteredData.filter(d => filters.districts.includes(d.district))
      }
      
      if (filters.grades.length > 0) {
        filteredData = filteredData.filter(d => filters.grades.includes(d.grade))
      }
      
      setData(filteredData)
      setSummary(result.summary)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
      console.error('Error fetching market trends:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  // Fetch data when filters change
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate statistics from data
  const stats = useMemo(() => {
    if (data.length === 0) {
      return {
        avgRent: 0,
        avgPrice: 0,
        yoyChange: 0,
        fiveYearChange: 0,
        currentRent: 0,
        currentPrice: 0
      }
    }

    // Get latest data points for each district-grade combination
    const latestByGroup = new Map<string, MarketTrendRecord>()
    data.forEach(record => {
      const key = `${record.district}_${record.grade}`
      const existing = latestByGroup.get(key)
      if (!existing || new Date(record.date) > new Date(existing.date)) {
        latestByGroup.set(key, record)
      }
    })

    const latestRecords = Array.from(latestByGroup.values())
    
    // Calculate current averages
    const currentRent = latestRecords.reduce((sum, r) => sum + r.rent_per_sqft, 0) / latestRecords.length
    const currentPrice = latestRecords.reduce((sum, r) => sum + r.price_per_sqft, 0) / latestRecords.length
    
    // Calculate YoY change
    const now = new Date()
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1)
    
    const currentPeriodData = data.filter(d => {
      const date = new Date(d.date)
      return date.getFullYear() === now.getFullYear() || 
             (date.getFullYear() === now.getFullYear() - 1 && date.getMonth() >= now.getMonth())
    })
    
    const lastYearData = data.filter(d => {
      const date = new Date(d.date)
      return date.getFullYear() === oneYearAgo.getFullYear() && date.getMonth() === oneYearAgo.getMonth()
    })
    
    const currentAvgRent = currentPeriodData.length > 0 
      ? currentPeriodData.reduce((sum, d) => sum + d.rent_per_sqft, 0) / currentPeriodData.length 
      : currentRent
    
    const lastYearAvgRent = lastYearData.length > 0
      ? lastYearData.reduce((sum, d) => sum + d.rent_per_sqft, 0) / lastYearData.length
      : currentAvgRent
    
    const yoyChange = lastYearAvgRent > 0 
      ? ((currentAvgRent - lastYearAvgRent) / lastYearAvgRent) * 100 
      : 0
    
    // Calculate 5-year change
    const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), 1)
    const fiveYearData = data.filter(d => {
      const date = new Date(d.date)
      return date.getFullYear() === fiveYearsAgo.getFullYear() && date.getMonth() === fiveYearsAgo.getMonth()
    })
    
    const fiveYearAvgRent = fiveYearData.length > 0
      ? fiveYearData.reduce((sum, d) => sum + d.rent_per_sqft, 0) / fiveYearData.length
      : currentAvgRent
    
    const fiveYearChange = fiveYearAvgRent > 0
      ? ((currentAvgRent - fiveYearAvgRent) / fiveYearAvgRent) * 100
      : 0

    return {
      avgRent: currentRent,
      avgPrice: currentPrice,
      yoyChange,
      fiveYearChange,
      currentRent,
      currentPrice
    }
  }, [data])

  // Transform data for charts
  const chartData = useMemo(() => {
    if (data.length === 0) return []
    
    // Group by date
    const groupedByDate = new Map<string, Map<string, MarketTrendRecord>>()
    
    data.forEach(record => {
      const dateKey = record.date
      const seriesKey = `${record.district} ${record.grade}`
      
      if (!groupedByDate.has(dateKey)) {
        groupedByDate.set(dateKey, new Map())
      }
      
      const dateGroup = groupedByDate.get(dateKey)!
      
      // If multiple records for same district-grade on same date, keep the latest
      const existing = dateGroup.get(seriesKey)
      if (!existing || new Date(record.created_at || record.date) > new Date(existing.created_at || existing.date)) {
        dateGroup.set(seriesKey, record)
      }
    })
    
    // Convert to chart format
    const chartData: Array<Record<string, string | number>> = []
    
    const sortedDates = Array.from(groupedByDate.keys()).sort()
    
    sortedDates.forEach(date => {
      const dateGroup = groupedByDate.get(date)!
      const point: Record<string, string | number> = { date }
      
      dateGroup.forEach((record, seriesKey) => {
        point[seriesKey] = filters.metricType === 'rent' ? record.rent_per_sqft : record.price_per_sqft
      })
      
      chartData.push(point)
    })
    
    return chartData
  }, [data, filters.metricType])

  // Get unique series names for chart legend
  const chartSeries = useMemo(() => {
    const seriesSet = new Set<string>()
    data.forEach(record => {
      seriesSet.add(`${record.district} ${record.grade}`)
    })
    return Array.from(seriesSet).sort()
  }, [data])

  // Get available districts from summary
  const availableDistricts = useMemo(() => {
    return summary?.districts || []
  }, [summary])

  // Get available grades from summary
  const availableGrades = useMemo(() => {
    return summary?.grades || ['A+', 'A', 'B', 'C']
  }, [summary])

  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  return {
    filters,
    updateFilters,
    resetFilters,
    data,
    summary,
    isLoading,
    error,
    stats,
    chartData,
    chartSeries,
    availableDistricts,
    availableGrades,
    refetch: fetchData
  }
}