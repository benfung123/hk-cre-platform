'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  Building2,
  Grid3X3,
  List,
  Filter,
  Search,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { BuildingMap } from '@/components/BuildingMap'
import type { Property } from '@/types'
import { useTranslations } from 'next-intl'
import { FavoriteButton } from '@/components/favorites/favorite-button'
import { CompareButton } from '@/components/comparison/compare-button'
import { ComparisonBar } from '@/components/comparison/comparison-bar'
import { SourceBadge } from '@/components/data-source'
import { EmptyState } from '@/components/empty-state'
import { useFavoritesStore } from '@/stores/favorites-store'

interface PropertyListProps {
  properties: Property[]
}

type ViewMode = 'list' | 'map' | 'split'

export function PropertyList({ properties }: PropertyListProps) {
  const t = useTranslations()
  const searchParams = useSearchParams()
  
  // Initialize view mode from URL on first render only
  const initialViewMode = useMemo(() => {
    const view = searchParams.get('view')
    if (view === 'map' || view === 'split' || view === 'list') {
      return view as ViewMode
    }
    return 'list' as ViewMode
  }, [searchParams])
  
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode)
  const [mounted, setMounted] = useState(false)
  
  // Get store values
  const { addToRecentlyViewed, setHydrated } = useFavoritesStore()
  
  // Handle hydration on mount only
  useEffect(() => {
    setMounted(true)
    setHydrated(true)
  }, [setHydrated])
  
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filter properties based on search
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties
    
    const query = searchQuery.toLowerCase()
    return properties.filter(property => 
      property.name.toLowerCase().includes(query) ||
      property.address.toLowerCase().includes(query) ||
      property.district.toLowerCase().includes(query)
    )
  }, [properties, searchQuery])

  // Track property view for recently viewed
  const trackPropertyView = useCallback((propertyId: string) => {
    addToRecentlyViewed(propertyId)
  }, [addToRecentlyViewed])

  // Helper function to get translated district name
  const getDistrictTranslation = (district: string) => {
    const districtKey = district.replace(/\s+/g, '')
    return t(`districts.${districtKey}`) || district
  }

  if (filteredProperties.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">{t('properties.noResults.title')}</h3>
        <p className="text-muted-foreground">{t('properties.noResults.subtitle')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle & Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
          <Button
            variant={viewMode === 'map' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('map')}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Map
          </Button>
          <Button
            variant={viewMode === 'split' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('split')}
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            Split
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        Showing <span className="font-medium">{filteredProperties.length}</span> of{' '}
        <span className="font-medium">{properties.length}</span> properties
      </p>

      {/* Empty State */}
      {filteredProperties.length === 0 && (
        <EmptyState />
      )}

      {/* Content based on view mode */}
      {viewMode === 'map' && (
        <BuildingMap 
          properties={filteredProperties}
          height="600px"
          showFilters={true}
          showSearch={false}
        />
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List Side */}
          <div className="space-y-4 max-h-[600px] overflow-y-auto">
            {filteredProperties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`} onClick={() => trackPropertyView(property.id)}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{property.name}</CardTitle>
                        <CardDescription className="text-sm">{property.address}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1">
                        <SourceBadge 
                          source="rvd" 
                          lastUpdated={property.updated_at}
                          reliability="high"
                          className="hidden sm:inline-flex"
                        />
                        <Badge>{property.grade}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {getDistrictTranslation(property.district)}
                      </div>
                      {property.year_built && (
                        <div>Built {property.year_built}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Map Side */}
          <BuildingMap 
            properties={filteredProperties}
            height="600px"
            showFilters={false}
            showSearch={false}
          />
        </div>
      )}

      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="relative group">
              <Link href={`/properties/${property.id}`} onClick={() => trackPropertyView(property.id)}>
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {property.address}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <SourceBadge 
                          source="rvd" 
                          lastUpdated={property.updated_at}
                          reliability="high"
                          className="hidden sm:inline-flex"
                        />
                        <Badge>{property.grade}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{getDistrictTranslation(property.district)}</span>
                      </div>
                      {property.year_built && (
                        <div className="flex-shrink-0">Built {property.year_built}</div>
                      )}
                    </div>
                    {property.total_sqft && (
                      <div className="mt-2 text-sm">
                        {(property.total_sqft / 1000000).toFixed(1)}M {t('properties.card.totalArea')}
                      </div>
                    )}
                    {/* Spacer for action buttons to prevent layout shift */}
                    <div className="h-10" />
                  </CardContent>
                </Card>
              </Link>
              
              {/* Action Buttons - Always visible on all devices */}
              <div className="absolute bottom-4 right-4 flex gap-2 z-10">
                <CompareButton propertyId={property.id} size="sm" />
                <FavoriteButton propertyId={property.id} size="sm" />
              </div>
            </div>
          ))}
        </div>
      )}

      <ComparisonBar />
    </div>
  )
}
