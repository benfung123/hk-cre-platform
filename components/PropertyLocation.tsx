'use client'

import type { GeoJSON } from 'geojson'
import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import AMapLoader from '@amap/amap-jsapi-loader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Building2, 
  Train,
  ExternalLink,
  Navigation
} from 'lucide-react'
import { MAP_CONFIG, MTR_STATIONS } from '@/lib/map-config'
import { getBuildingFootprint, type CSDIBuilding } from '@/lib/csdi-api'
import type { Property } from '@/types'
import { useTranslations } from 'next-intl'

interface PropertyLocationProps {
  property: Property
  height?: string
  showNearbyMTR?: boolean
  showBuildingOutline?: boolean
}

interface NearbyStation {
  name: string
  nameZh: string
  distance: number // in meters
  lines: string[]
}

export function PropertyLocation({
  property,
  height = '400px',
  showNearbyMTR = true,
  showBuildingOutline = true
}: PropertyLocationProps) {
  const t = useTranslations()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [AMap, setAMap] = useState<any>(null)
  const [buildingData, setBuildingData] = useState<CSDIBuilding | null>(null)
  const [loading, setLoading] = useState(false)
  const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'satellite'>('light')
  const [polygon, setPolygon] = useState<any>(null)
  const [mtrMarkers, setMtrMarkers] = useState<any[]>([])

  const amapKey = process.env.NEXT_PUBLIC_AMAP_KEY

  // Calculate nearby MTR stations
  const nearbyStations: NearbyStation[] = useMemo(() => {
    if (!property.lat || !property.lng || !showNearbyMTR) return []
    
    const propLat = property.lat
    const propLng = property.lng
    
    return MTR_STATIONS
      .map(station => {
        // Calculate distance using Haversine formula
        const R = 6371000 // Earth's radius in meters
        const dLat = (station.lat - propLat) * Math.PI / 180
        const dLng = (station.lng - propLng) * Math.PI / 180
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(propLat * Math.PI / 180) * 
                  Math.cos(station.lat * Math.PI / 180) *
                  Math.sin(dLng/2) * Math.sin(dLng/2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        const distance = R * c
        
        return {
          name: station.name,
          nameZh: station.nameZh,
          distance: Math.round(distance),
          lines: station.lines
        }
      })
      .filter(s => s.distance <= 1000) // Within 1km
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3) // Top 3 closest
  }, [property.lat, property.lng, showNearbyMTR])

  // Fetch building footprint data
  useEffect(() => {
    if (!showBuildingOutline || !property.lat || !property.lng) return
    
    setLoading(true)
    getBuildingFootprint(property.lat, property.lng, 100)
      .then(data => {
        setBuildingData(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [property.lat, property.lng, showBuildingOutline])

  // Initialize Amap
  useEffect(() => {
    if (!amapKey || !mapContainerRef.current || mapInstance) return

    AMapLoader.load({
      key: amapKey,
      version: '2.0',
      plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Polygon', 'AMap.Marker', 'AMap.InfoWindow']
    }).then((AMap) => {
      setAMap(AMap)
      
      if (!mapContainerRef.current) return
      
      const center: [number, number] = property.lng && property.lat 
        ? [property.lng, property.lat]
        : [MAP_CONFIG.center.lng, MAP_CONFIG.center.lat]
      
      const map = new AMap.Map(mapContainerRef.current, {
        zoom: MAP_CONFIG.zoom.property,
        center: center,
        viewMode: '2D',
        mapStyle: `amap://styles/${MAP_CONFIG.styles.light}`
      })

      // Add controls
      map.addControl(new AMap.Scale())
      map.addControl(new AMap.ToolBar({
        position: 'RB'
      }))

      setMapInstance(map)
      mapRef.current = map
    }).catch((error) => {
      console.error('Failed to load Amap:', error)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.destroy()
        mapRef.current = null
      }
    }
  }, [amapKey, property.lat, property.lng])

  // Update map style
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setMapStyle(`amap://styles/${MAP_CONFIG.styles[mapStyle]}`)
    }
  }, [mapInstance, mapStyle])

  // Add building outline polygon
  useEffect(() => {
    if (!mapInstance || !AMap || !buildingData?.geometry) return

    // Remove existing polygon
    if (polygon) {
      mapInstance.remove(polygon)
    }

    // Convert geometry coordinates to Amap format
    const coords = buildingData.geometry.coordinates
    let path: number[][] = []

    if (buildingData.geometry.type === 'Polygon') {
      // First ring is the outer boundary
      path = (coords[0] as number[][]).map(coord => [coord[0], coord[1]])
    } else if (buildingData.geometry.type === 'MultiPolygon') {
      // Use the first polygon
      const firstPolygon = coords[0] as number[][][]
      path = firstPolygon[0].map(coord => [coord[0], coord[1]])
    }

    if (path.length > 0) {
      const newPolygon = new AMap.Polygon({
        path: path,
        strokeColor: '#3b82f6',
        strokeWeight: 2,
        strokeOpacity: 0.8,
        fillColor: '#3b82f6',
        fillOpacity: 0.3
      })

      mapInstance.add(newPolygon)
      setPolygon(newPolygon)
    }
  }, [buildingData, mapInstance, AMap])

  // Add property marker
  useEffect(() => {
    if (!mapInstance || !AMap || !property.lng || !property.lat) return

    // Create property marker content
    const markerContent = document.createElement('div')
    markerContent.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #3b82f6;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border: 2px solid white;
        position: relative;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2H2v10h10V2zM22 2h-10v10h10V2zM12 14H2v8h10v-8zM22 14h-10v8h10v-8z"/>
        </svg>
        <div style="
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          border-top: 12px solid #3b82f6;
        "></div>
      </div>
    `

    const marker = new AMap.Marker({
      position: [property.lng, property.lat],
      content: markerContent,
      anchor: 'bottom-center',
      offset: new AMap.Pixel(0, -20)
    })

    // Create info window
    const infoWindow = new AMap.InfoWindow({
      content: `
        <div style="padding: 12px; min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
          <h3 style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${property.name}</h3>
          <p style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${property.address}</p>
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
            <span style="background-color: #f3f4f6; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${property.grade}</span>
            <span style="font-size: 12px; color: #6b7280;">${property.district}</span>
          </div>
          ${buildingData?.properties.buildingHeight ? `<p style="font-size: 12px;">Height: ${buildingData.properties.buildingHeight}m</p>` : ''}
          <div style="display: flex; gap: 8px; margin-top: 8px;">
            <a href="https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #3b82f6; text-decoration: none; display: flex; align-items: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
              Street View
            </a>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}" target="_blank" rel="noopener noreferrer" style="font-size: 12px; color: #3b82f6; text-decoration: none; display: flex; align-items: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 4px;">
                <polygon points="3 11 22 2 13 21 11 13 3 11"/>
              </svg>
              Directions
            </a>
          </div>
        </div>
      `,
      offset: new AMap.Pixel(0, -30)
    })

    marker.on('click', () => {
      infoWindow.open(mapInstance, [property.lng, property.lat])
    })

    marker.setMap(mapInstance)
    
    // Open info window by default
    infoWindow.open(mapInstance, [property.lng, property.lat])

    return () => {
      marker.setMap(null)
      infoWindow.close()
    }
  }, [mapInstance, AMap, property, buildingData])

  // Add MTR station markers
  useEffect(() => {
    if (!mapInstance || !AMap) return

    // Clear existing markers
    mtrMarkers.forEach(marker => marker.setMap(null))

    const newMarkers: any[] = []

    nearbyStations.forEach((station) => {
      const stationData = MTR_STATIONS.find(s => s.name === station.name)
      if (!stationData) return

      const markerContent = document.createElement('div')
      markerContent.innerHTML = `
        <div style="
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background-color: #dc2626;
          border: 2px solid white;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          cursor: pointer;
        "></div>
      `

      const marker = new AMap.Marker({
        position: [stationData.lng, stationData.lat],
        content: markerContent,
        anchor: 'center',
        title: station.name
      })

      // Create tooltip
      const infoWindow = new AMap.InfoWindow({
        content: `
          <div style="padding: 8px; font-size: 12px; font-family: system-ui, -apple-system, sans-serif;">
            <strong>${station.name}</strong> (${station.distance}m)
          </div>
        `,
        offset: new AMap.Pixel(0, -15)
      })

      marker.on('mouseover', () => {
        infoWindow.open(mapInstance, [stationData.lng, stationData.lat])
      })

      marker.on('mouseout', () => {
        infoWindow.close()
      })

      marker.setMap(mapInstance)
      newMarkers.push(marker)
    })

    setMtrMarkers(newMarkers)

    return () => {
      newMarkers.forEach(marker => marker.setMap(null))
    }
  }, [nearbyStations, mapInstance, AMap])

  if (!amapKey) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">{property.address}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Map configuration required
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!property.lat || !property.lng) {
    return (
      <Card className="w-full" style={{ height }}>
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">Location data not available</p>
            <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Map Card */}
      <Card className="w-full overflow-hidden" style={{ height }}>
        <div className="relative h-full">
          {/* Map Style Toggle */}
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            <Button
              variant={mapStyle === 'light' ? 'default' : 'secondary'}
              size="sm"
              className="bg-white/90 backdrop-blur-sm shadow-lg"
              onClick={() => setMapStyle('light')}
            >
              Light
            </Button>
            <Button
              variant={mapStyle === 'dark' ? 'default' : 'secondary'}
              size="sm"
              className="bg-white/90 backdrop-blur-sm shadow-lg"
              onClick={() => setMapStyle('dark')}
            >
              Dark
            </Button>
            <Button
              variant={mapStyle === 'satellite' ? 'default' : 'secondary'}
              size="sm"
              className="bg-white/90 backdrop-blur-sm shadow-lg"
              onClick={() => setMapStyle('satellite')}
            >
              Satellite
            </Button>
          </div>

          {/* Map Container */}
          <div 
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ backgroundColor: '#f0f0f0' }}
          />
        </div>
      </Card>

      {/* Nearby MTR Stations */}
      {nearbyStations.length > 0 && showNearbyMTR && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center">
              <Train className="w-4 h-4 mr-2" />
              Nearby MTR Stations
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {nearbyStations.map((station, index) => (
                <div key={station.name}>
                  {index > 0 && <Separator className="my-2" />}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{station.name}</p>
                      <p className="text-xs text-muted-foreground">{station.nameZh}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{station.distance}m</p>
                      <div className="flex gap-1 mt-1">
                        {station.lines.map(line => (
                          <Badge 
                            key={line} 
                            variant="outline" 
                            className="text-[10px] px-1 py-0"
                          >
                            {line}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
