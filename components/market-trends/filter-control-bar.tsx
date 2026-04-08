'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X, Filter, TrendingUp, DollarSign, Building2, Store, Factory } from 'lucide-react'
import { FilterState } from '@/hooks/use-market-trends'
import { cn } from '@/lib/utils'

interface FilterControlBarProps {
  filters: FilterState
  availableDistricts: string[]
  availableGrades: string[]
  onUpdateFilters: (filters: Partial<FilterState>) => void
  onResetFilters: () => void
  isLoading?: boolean
  showPropertyTypeFilter?: boolean
  districtsWithData?: string[]
}

const timeRangeOptions = [
  { value: '1Y', label: '1 Year' },
  { value: '3Y', label: '3 Years' },
  { value: '5Y', label: '5 Years' },
  { value: '10Y', label: '10 Years' },
  { value: 'ALL', label: 'All Time' }
] as const

const districtColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500'
]

export type PropertyType = 'office' | 'retail' | 'industrial'

interface PropertyTypeOption {
  value: PropertyType
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export function FilterControlBar({
  filters,
  availableDistricts: _availableDistricts,
  availableGrades,
  onUpdateFilters,
  onResetFilters,
  isLoading,
  showPropertyTypeFilter = false,
  districtsWithData: _districtsWithData = []
}: FilterControlBarProps) {
  const t = useTranslations('marketTrends')
  const tp = useTranslations('propertyType')

  // All 18 Hong Kong districts with data availability
  const allDistricts = [
    { name: 'Central', hasData: true },
    { name: 'Causeway Bay', hasData: true },
    { name: 'Sheung Wan', hasData: true },
    { name: 'Tsim Sha Tsui', hasData: true },
    { name: 'Mong Kok', hasData: true },
    { name: 'Quarry Bay', hasData: true },
    { name: 'Kwun Tong', hasData: true },
    { name: 'Admiralty', hasData: false },
    { name: 'Wan Chai', hasData: false },
    { name: 'Yau Ma Tei', hasData: false },
    { name: 'North Point', hasData: false },
    { name: 'Kowloon Bay', hasData: false },
    { name: 'Cheung Sha Wan', hasData: false },
    { name: 'Lai Chi Kok', hasData: false },
    { name: 'Tsuen Wan', hasData: false },
    { name: 'Sha Tin', hasData: false },
    { name: 'Tai Koo', hasData: false },
    { name: 'Aberdeen', hasData: false },
  ]

  const propertyTypeOptions: PropertyTypeOption[] = [
    { value: 'office', label: tp('types.office'), icon: Building2, color: 'bg-blue-500' },
    { value: 'retail', label: tp('types.retail'), icon: Store, color: 'bg-emerald-500' },
    { value: 'industrial', label: tp('types.industrial'), icon: Factory, color: 'bg-amber-500' },
  ]

  const handleDistrictToggle = (district: string) => {
    const currentDistricts = filters.districts
    const isSelected = currentDistricts.includes(district)
    
    if (isSelected) {
      onUpdateFilters({
        districts: currentDistricts.filter(d => d !== district)
      })
    } else {
      // Max 3 districts
      if (currentDistricts.length >= 3) {
        onUpdateFilters({
          districts: [...currentDistricts.slice(1), district]
        })
      } else {
        onUpdateFilters({
          districts: [...currentDistricts, district]
        })
      }
    }
  }

  const handleGradeToggle = (grade: string) => {
    const currentGrades = filters.grades
    const isSelected = currentGrades.includes(grade)
    
    if (isSelected) {
      onUpdateFilters({
        grades: currentGrades.filter(g => g !== grade)
      })
    } else {
      onUpdateFilters({
        grades: [...currentGrades, grade]
      })
    }
  }

  const handlePropertyTypeChange = (type: PropertyType) => {
    onUpdateFilters({ propertyType: type })
    // Reset grades when switching away from office
    if (type !== 'office') {
      onUpdateFilters({ grades: [] })
    } else {
      onUpdateFilters({ grades: ['A+', 'A'] })
    }
  }

  // Show grades only for office type
  const showGradeFilter = filters.propertyType === 'office'

  const hasActiveFilters = 
    filters.districts.length > 0 || 
    filters.grades.length !== 2 || // Default is ['A+', 'A']
    filters.timeRange !== '5Y' ||
    filters.metricType !== 'rent' ||
    (filters.propertyType !== 'office' && filters.propertyType !== undefined)

  return (
    <Card className="sticky top-14 z-40 border-b shadow-sm">
      <CardContent className="py-4">
        <div className="flex flex-col gap-4">
          {/* Property Type Filter - Only show when enabled */}
          {showPropertyTypeFilter && (
            <div className="pb-3 border-b">
              <Label className="text-xs font-medium mb-2 block">{t('filters.propertyType')}</Label>
              <div className="flex flex-wrap gap-2">
                {propertyTypeOptions.map((type) => {
                  const Icon = type.icon
                  const isSelected = filters.propertyType === type.value
                  
                  return (
                    <button
                      key={type.value}
                      onClick={() => handlePropertyTypeChange(type.value)}
                      disabled={isLoading}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                        "border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        isSelected
                          ? `${type.color} text-white border-transparent shadow-sm`
                          : 'bg-background border-border text-foreground hover:bg-muted',
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{type.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top row - Main filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* District Selector */}
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs font-medium mb-2 block">{t('filters.district')}</Label>
              <div className="flex flex-wrap gap-2">
                {allDistricts.map((district, index) => {
                  const isSelected = filters.districts.includes(district.name)
                  const colorClass = districtColors[index % districtColors.length]
                  const hasData = district.hasData
                  
                  return (
                    <button
                      key={district.name}
                      onClick={() => hasData && handleDistrictToggle(district.name)}
                      disabled={isLoading || !hasData}
                      title={hasData ? district.name : `${district.name} - Data coming soon`}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                        isSelected 
                          ? `${colorClass} text-white shadow-sm` 
                          : hasData
                            ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600',
                        isLoading && "opacity-50"
                      )}
                    >
                      {!hasData && (
                        <span className="text-[10px]">○</span>
                      )}
                      {district.name}
                    </button>
                  )
                })}
              </div>
              {filters.districts.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.districts.map((district, index) => (
                    <Badge 
                      key={district} 
                      variant="secondary"
                      className={`${districtColors[index % districtColors.length]} text-white cursor-pointer`}
                      onClick={() => handleDistrictToggle(district)}
                    >
                      {district}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Time Range Selector */}
            <div className="min-w-[120px]">
              <Label className="text-xs font-medium mb-2 block">{t('filters.timeRange')}</Label>
              <Select
                value={filters.timeRange}
                onValueChange={(value) => {
                  if (value) onUpdateFilters({ timeRange: value as FilterState['timeRange'] })
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Metric Type Toggle */}
            <div className="min-w-[100px]">
              <Label className="text-xs font-medium mb-2 block">{t('filters.metric')}</Label>
              <div className="flex rounded-md border overflow-hidden">
                <button
                  onClick={() => onUpdateFilters({ metricType: 'rent' })}
                  disabled={isLoading}
                  className={`
                    flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors
                    ${filters.metricType === 'rent' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-muted'
                    }
                    disabled:opacity-50
                  `}
                >
                  <DollarSign className="h-3 w-3" />
                  {t('metrics.rent')}
                </button>
                <button
                  onClick={() => onUpdateFilters({ metricType: 'price' })}
                  disabled={isLoading}
                  className={`
                    flex-1 px-3 py-2 text-xs font-medium flex items-center justify-center gap-1 transition-colors
                    ${filters.metricType === 'price' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background hover:bg-muted'
                    }
                    disabled:opacity-50
                  `}
                >
                  <TrendingUp className="h-3 w-3" />
                  {t('metrics.price')}
                </button>
              </div>
            </div>
          </div>

          {/* Bottom row - Grades and Reset */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t">
            {showGradeFilter && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{t('filters.grade')}:</span>
                <div className="flex gap-1">
                  {availableGrades.map(grade => {
                    const isSelected = filters.grades.includes(grade)
                    return (
                      <button
                        key={grade}
                        onClick={() => handleGradeToggle(grade)}
                        disabled={isLoading}
                        className={`
                          px-2 py-1 rounded text-xs font-medium transition-colors
                          ${isSelected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }
                          disabled:opacity-50
                        `}
                      >
                        {grade}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetFilters}
                disabled={isLoading}
                className="text-xs"
              >
                <Filter className="h-3 w-3 mr-1" />
                Reset Filters
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
