'use client'

import { useState, useCallback, useMemo } from 'react'
import Map, { 
  Marker, 
  Popup, 
  NavigationControl,
  FullscreenControl,
  ScaleControl,
  Source,
  Layer,
  type MapRef
} from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MapPin, 
  Building2, 
  Layers, 
  Search,
  X,
  Maximize2,
  Filter
} from 'lucide-react'
import { MAP_CONFIG, DISTRICT_CENTERS, MTR_STATIONS } from '@/lib/map-config'
import type { Property } from '@/types'
import { useTranslations } from 'next-intl'

interface BuildingMapProps {
  properties: Property[]
  selectedDistrict?: string
  onPropertySelect?: (property: Property) => void
  height?: string
  showFilters?: boolean
  showSearch?: boolean
}

interface MapViewState {
  longitude: number
  latitude: number
  zoom: number
}

export function BuildingMap({
  properties,
  selectedDistrict,
  onPropertySelect,
  height = '500px',
  showFilters = true,
  showSearch = true
}: BuildingMapProps) {
  const t = useTranslations()
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: MAP_CONFIG.center.lng,
    latitude: MAP_CONFIG.center.lat,
    zoom: MAP_CONFIG.zoom.overview
  })
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_CONFIG.styles>('light')
  const [showMTR, setShowMTR] = useState(false)

  // Filter properties based on search
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties
    const query = searchQuery.toLowerCase()
    return properties.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.address.toLowerCase().includes(query) ||
      p.district.toLowerCase().includes(query)
    )
  }, [properties, searchQuery])

  // Navigate to district
  const navigateToDistrict = useCallback((district: string) => {
    const center = DISTRICT_CENTERS[district]
    if (center) {
      setViewState({
        longitude: center.lng,
        latitude: center.lat,
        zoom: center.zoom
      })
    }
  }, [])

  // Handle property marker click
  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property)
    setViewState({
      longitude: property.lng || MAP_CONFIG.center.lng,
      latitude: property.lat || MAP_CONFIG.center.lat,
      zoom: MAP_CONFIG.zoom.property
    })
    onPropertySelect?.(property)
  }, [onPropertySelect])

  // Get marker color based on grade
  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return '#ef4444' // Red
      case 'A': return '#f97316'  // Orange
      case 'B': return '#3b82f6'  // Blue
      case 'C': return '#6b7280'  // Gray
      default: return '#6b7280'
    }
  }

  // Build GeoJSON for properties with coordinates
  const propertiesGeoJSON = useMemo(() => {
    const features = filteredProperties
      .filter(p => p.lat && p.lng)
      .map(p => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [p.lng, p.lat]
        },
        properties: {
          id: p.id,
          name: p.name,
          grade: p.grade,
          district: p.district
        }
      }))
    
    return {
      type: 'FeatureCollection' as const,
      features
    }
  }, [filteredProperties])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!mapboxToken) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Map configuration required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please set NEXT_PUBLIC_MAPBOX_TOKEN in your environment
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full overflow-hidden" style={{ height }}>
      <div className="relative h-full">
        {/* Search Bar */}
        {showSearch && (
          <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('properties.filters.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 backdrop-blur-sm shadow-lg"
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
            
            {/* Map Style Toggle */}
            <Button
              variant="secondary"
              size="icon"
              className="bg-white/90 backdrop-blur-sm shadow-lg"
              onClick={() => setMapStyle(prev => prev === 'light' ? 'dark' : 'light')}
            >
              <Layers className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="absolute top-16 left-4 z-10 flex flex-col gap-2">
            <Button
              variant={showMTR ? 'default' : 'secondary'}
              size="sm"
              className="bg-white/90 backdrop-blur-sm shadow-lg"
              onClick={() => setShowMTR(!showMTR)}
            >
              <MapPin className="h-4 w-4 mr-2" />
              MTR Stations
            </Button>
            
            {selectedDistrict && (
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/90 backdrop-blur-sm shadow-lg"
                onClick={() => navigateToDistrict(selectedDistrict)}
              >
                <Maximize2 className="h-4 w-4 mr-2" />
                {selectedDistrict}
              </Button>
            )}
          </div>
        )}

        {/* Property Count */}
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-lg px-3 py-2 text-sm">
            <span className="font-medium">{filteredProperties.length}</span>
            {' '}properties shown
          </div>
        </div>

        {/* Map */}
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_CONFIG.styles[mapStyle]}
          mapboxAccessToken={mapboxToken}
          minZoom={10}
          maxZoom={18}
        >
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />
          <ScaleControl position="bottom-right" />

          {/* Property Markers */}
          {filteredProperties.map((property) => {
            if (!property.lat || !property.lng) return null
            
            return (
              <Marker
                key={property.id}
                longitude={property.lng}
                latitude={property.lat}
                anchor="bottom"
                onClick={() => handlePropertyClick(property)}
              >
                <div
                  className="cursor-pointer transition-transform hover:scale-110"
                  onMouseEnter={() => setHoveredProperty(property)}
                  onMouseLeave={() => setHoveredProperty(null)}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                    style={{ backgroundColor: getGradeColor(property.grade) }}
                  >
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                </div>
              </Marker>
            )
          })}

          {/* MTR Station Markers */}
          {showMTR && MTR_STATIONS.map((station) => (
            <Marker
              key={station.name}
              longitude={station.lng}
              latitude={station.lat}
              anchor="center"
            >
              <div className="w-4 h-4 rounded-full bg-red-600 border-2 border-white shadow-md" />
            </Marker>
          ))}

          {/* Property Popup */}
          {selectedProperty && (
            <Popup
              longitude={selectedProperty.lng || 0}
              latitude={selectedProperty.lat || 0}
              anchor="top"
              onClose={() => setSelectedProperty(null)}
              closeButton={true}
              closeOnClick={false}
              offset={15}
            >
              <div className="p-2 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{selectedProperty.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{selectedProperty.address}</p>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedProperty.grade}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {selectedProperty.district}
                  </span>
                </div>
                {selectedProperty.total_sqft && (
                  <p className="text-xs">
                    {(selectedProperty.total_sqft / 1000000).toFixed(1)}M sqft
                  </p>
                )}
                <a
                  href={`/properties/${selectedProperty.id}`}
                  className="text-xs text-primary hover:underline mt-2 block"
                >
                  View Details →
                </a>
              </div>
            </Popup>
          )}

          {/* Hover Popup */}
          {hoveredProperty && hoveredProperty.id !== selectedProperty?.id && (
            <Popup
              longitude={hoveredProperty.lng || 0}
              latitude={hoveredProperty.lat || 0}
              anchor="top"
              closeButton={false}
              closeOnClick={false}
              offset={10}
            >
              <div className="p-1">
                <p className="text-xs font-medium">{hoveredProperty.name}</p>
              </div>
            </Popup>
          )}
        </Map>
      </div>
    </Card>
  )
}
