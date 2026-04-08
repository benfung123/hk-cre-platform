'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import { Card, CardContent } from '@/components/ui/card'
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
import { useTranslations, useLocale } from 'next-intl'

interface BuildingMapProps {
  properties: Property[]
  selectedDistrict?: string
  onPropertySelect?: (property: Property) => void
  height?: string
  showFilters?: boolean
  showSearch?: boolean
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
  const locale = useLocale()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [AMap, setAMap] = useState<any>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapStyle, setMapStyle] = useState<keyof typeof MAP_CONFIG.styles>('light')
  const [showMTR, setShowMTR] = useState(false)
  const [markers, setMarkers] = useState<any[]>([])
  const [mtrMarkers, setMtrMarkers] = useState<any[]>([])
  const [infoWindow, setInfoWindow] = useState<any>(null)

  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY

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

  // DEBUG: Log properties received by the map
  useEffect(() => {
    console.log('[BuildingMap] Properties received:', properties.length)
    console.log('[BuildingMap] Properties with valid coordinates:', 
      properties.filter(p => p.lat && p.lng && p.lat !== 0 && p.lng !== 0).length)
    console.log('[BuildingMap] Sample properties:', properties.slice(0, 3).map(p => ({
      name: p.name,
      lat: p.lat,
      lng: p.lng
    })))
  }, [properties])

  // Initialize Amap
  useEffect(() => {
    if (!amapKey) {
      console.log('[BuildingMap] No AMap key found')
      return
    }
    if (!mapContainerRef.current) {
      console.log('[BuildingMap] Map container not ready')
      return
    }
    if (mapInstance) {
      console.log('[BuildingMap] Map already initialized')
      return
    }

    console.log('[BuildingMap] Initializing AMap with key:', amapKey.substring(0, 8) + '...')

    AMapLoader.load({
      key: amapKey,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.MapType', 'AMap.InfoWindow']
    }).then((AMap) => {
      console.log('[BuildingMap] AMap loaded successfully')
      setAMap(AMap)
      
      if (!mapContainerRef.current) return
      
      const map = new AMap.Map(mapContainerRef.current, {
        zoom: MAP_CONFIG.zoom.overview,
        center: [MAP_CONFIG.center.lng, MAP_CONFIG.center.lat],
        viewMode: '2D',
        mapStyle: `amap://styles/${MAP_CONFIG.styles.light}`
      })

      // Add controls
      map.addControl(new AMap.Scale())
      map.addControl(new AMap.ToolBar({
        position: 'RB'
      }))

      // Create info window
      const iw = new AMap.InfoWindow({
        offset: new AMap.Pixel(0, -30),
        closeWhenClickMap: true
      })
      setInfoWindow(iw)

      setMapInstance(map)
      mapRef.current = map
      console.log('[BuildingMap] Map instance created')
    }).catch((error) => {
      console.error('[BuildingMap] Failed to load Amap:', error)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [amapKey])

  // Update map style
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setMapStyle(`amap://styles/${MAP_CONFIG.styles[mapStyle]}`)
    }
  }, [mapInstance, mapStyle])

  // Get marker color based on grade
  const getGradeColor = useCallback((grade: string) => {
    switch (grade) {
      case 'A+': return '#ef4444' // Red
      case 'A': return '#f97316'  // Orange
      case 'B': return '#3b82f6'  // Blue
      case 'C': return '#6b7280'  // Gray
      default: return '#6b7280'
    }
  }, [])

  // Create marker content
  const createMarkerContent = useCallback((property: Property) => {
    const color = getGradeColor(property.grade)
    const div = document.createElement('div')
    div.className = 'cursor-pointer transition-transform hover:scale-110'
    div.innerHTML = `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: ${color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        border: 2px solid white;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2H2v10h10V2zM22 2h-10v10h10V2zM12 14H2v8h10v-8zM22 14h-10v8h10v-8z"/>
        </svg>
      </div>
    `
    return div
  }, [getGradeColor])

  // Create MTR marker content
  const createMTRMarkerContent = useCallback(() => {
    const div = document.createElement('div')
    div.innerHTML = `
      <div style="
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #dc2626;
        border: 2px solid white;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
      "></div>
    `
    return div
  }, [])

  // Handle property click
  const handlePropertyClick = useCallback((property: Property) => {
    setSelectedProperty(property)
    
    if (mapInstance && property.lng && property.lat) {
      mapInstance.setZoomAndCenter(MAP_CONFIG.zoom.property, [property.lng, property.lat])
      
      // Show info window
      if (infoWindow) {
        const content = `
          <div style="padding: 12px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
            <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${property.name}</h3>
            <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${property.address}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="background-color: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${property.grade}</span>
              <span style="font-size: 12px; color: #6b7280;">${property.district}</span>
            </div>
            ${property.total_sqft ? `<p style="font-size: 12px;">${(property.total_sqft / 1000000).toFixed(1)}M sqft</p>` : ''}
            <a href="/${locale}/properties/${property.id}" style="font-size: 12px; color: #3b82f6; text-decoration: none; margin-top: 8px; display: block;">View Details →</a>
          </div>
        `
        infoWindow.setContent(content)
        infoWindow.open(mapInstance, [property.lng, property.lat])
      }
    }
    
    onPropertySelect?.(property)
  }, [mapInstance, infoWindow, onPropertySelect, locale])

  // Update property markers
  useEffect(() => {
    if (!mapInstance || !AMap) {
      console.log('[BuildingMap] Map instance not ready:', { mapInstance: !!mapInstance, AMap: !!AMap })
      return
    }

    console.log('[BuildingMap] Creating markers for', filteredProperties.length, 'properties')

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null))
    
    // Create new markers
    const newMarkers: any[] = []
    let skippedCount = 0
    
    filteredProperties.forEach((property) => {
      if (!property.lat || !property.lng) {
        skippedCount++
        return
      }
      
      const marker = new AMap.Marker({
        position: [property.lng, property.lat],
        content: createMarkerContent(property),
        anchor: 'bottom-center',
        offset: new AMap.Pixel(0, -16)
      })
      
      marker.on('click', () => handlePropertyClick(property))
      marker.setMap(mapInstance)
      newMarkers.push(marker)
    })
    
    console.log(`[BuildingMap] Created ${newMarkers.length} markers, skipped ${skippedCount} (no coordinates)`)
    setMarkers(newMarkers)
  }, [filteredProperties, mapInstance, AMap, createMarkerContent, handlePropertyClick])

  // Update MTR markers
  useEffect(() => {
    if (!mapInstance || !AMap) return

    // Clear existing MTR markers
    mtrMarkers.forEach(marker => marker.setMap(null))
    
    if (!showMTR) {
      setMtrMarkers([])
      return
    }
    
    // Create MTR markers
    const newMarkers: any[] = []
    
    MTR_STATIONS.forEach((station) => {
      const marker = new AMap.Marker({
        position: [station.lng, station.lat],
        content: createMTRMarkerContent(),
        anchor: 'center',
        title: station.name
      })
      
      marker.setMap(mapInstance)
      newMarkers.push(marker)
    })
    
    setMtrMarkers(newMarkers)
  }, [showMTR, mapInstance, AMap, createMTRMarkerContent])

  // Navigate to district
  const navigateToDistrict = useCallback((district: string) => {
    const center = DISTRICT_CENTERS[district]
    if (center && mapInstance) {
      mapInstance.setZoomAndCenter(center.zoom, [center.lng, center.lat])
    }
  }, [mapInstance])

  if (!amapKey) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Map configuration required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please set NEXT_PUBLIC_AMAP_KEY in your environment
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

        {/* Map Container */}
        <div 
          ref={mapContainerRef}
          className="w-full h-full"
          style={{ backgroundColor: '#f0f0f0' }}
        />
      </div>
    </Card>
  )
}
