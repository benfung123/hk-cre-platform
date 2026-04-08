'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, CheckCircle2, MapPinOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PropertyFiltersProps {
  districts: string[]
  hasResults?: boolean
}

export function PropertyFilters({ districts, hasResults = true }: PropertyFiltersProps) {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentDistrict = searchParams.get('district') || ''
  const currentGrade = searchParams.get('grade') || ''
  const currentSearch = searchParams.get('search') || ''
  const currentType = searchParams.get('type') || ''

  // Office districts (7 districts with data)
  const officeDistricts = [
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

  // Retail/Industrial regions (3 regions)
  const retailIndustrialRegions = [
    { name: 'Hong Kong Island', hasData: true },
    { name: 'Kowloon', hasData: true },
    { name: 'New Territories', hasData: true },
  ]

  // Determine which locations to show based on property type
  const isRetailOrIndustrial = currentType === 'retail' || currentType === 'industrial'
  const locationsToShow = isRetailOrIndustrial ? retailIndustrialRegions : officeDistricts

  // Helper function to get translated location name
  const getLocationTranslation = (location: string) => {
    if (isRetailOrIndustrial) {
      if (location === 'Hong Kong Island') return t('regions.hongKongIsland') || location
      if (location === 'Kowloon') return t('regions.kowloon') || location
      if (location === 'New Territories') return t('regions.newTerritories') || location
    }
    // For districts, use existing translation logic
    const districtKey = location.replace(/\s+/g, '')
    return t(`districts.${districtKey}`) || location
  }

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/properties?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/properties')
  }

  const hasFilters = currentDistrict || currentGrade || currentSearch || currentType

  // Filter to only show districts/regions that exist in the database
  const availableDistrictSet = new Set(districts)
  const filteredLocations = locationsToShow.filter(d => availableDistrictSet.has(d.name))

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('properties.filters.searchPlaceholder')}
              defaultValue={currentSearch}
              onChange={(e) => {
                const timeoutId = setTimeout(() => {
                  handleFilterChange('search', e.target.value)
                }, 300)
                return () => clearTimeout(timeoutId)
              }}
              className="pl-10"
            />
          </div>

          <Select
            value={currentDistrict}
            onValueChange={(value) => handleFilterChange('district', value || '')}
          >
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder={t('properties.filters.allDistricts')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('properties.filters.allDistricts')}</SelectItem>
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {t('dataTransparency.districtList.sections.withData')}
              </div>
              {filteredLocations.filter(d => d.hasData).map((location) => (
                <SelectItem key={location.name} value={location.name} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{getLocationTranslation(location.name)}</span>
                  </div>
                </SelectItem>
              ))}
              {!isRetailOrIndustrial && (
                <>
                  <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">
                    {t('dataTransparency.districtList.sections.comingSoon')}
                  </div>
                  {filteredLocations.filter(d => !d.hasData).map((district) => (
                    <Tooltip key={district.name}>
                      <TooltipTrigger asChild>
                        <div className="px-2 py-1.5 text-sm text-muted-foreground opacity-50 cursor-not-allowed flex items-center gap-2">
                          <MapPinOff className="h-3.5 w-3.5" />
                          <span>{getLocationTranslation(district.name)}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs">{t('dataTransparency.districts.noDataTooltip')}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </>
              )}
            </SelectContent>
          </Select>

          <Select
            value={currentType}
            onValueChange={(value) => handleFilterChange('type', value || '')}
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder={t('propertyType.types.all')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('propertyType.types.all')}</SelectItem>
              <SelectItem value="office">{t('propertyType.types.office')}</SelectItem>
              <SelectItem value="retail">{t('propertyType.types.retail')}</SelectItem>
              <SelectItem value="industrial">{t('propertyType.types.industrial')}</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currentGrade}
            onValueChange={(value) => handleFilterChange('grade', value || '')}
            disabled={currentType !== '' && currentType !== 'office'}
          >
            <SelectTrigger className={cn(
              "w-full sm:w-40",
              currentType !== '' && currentType !== 'office' && "opacity-50"
            )}>
              <SelectValue placeholder={t('properties.filters.allGrades')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t('properties.filters.allGrades')}</SelectItem>
              <SelectItem value="A+">A+</SelectItem>
              <SelectItem value="A">A</SelectItem>
              <SelectItem value="B">B</SelectItem>
              <SelectItem value="C">C</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && hasResults && (
            <Button variant="ghost" onClick={clearFilters}>
              <X className="h-4 w-4 mr-2" />
              {t('properties.filters.clear')}
            </Button>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}
