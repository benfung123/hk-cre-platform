'use client'

import type { GeoJSON } from 'geojson'
import { useState, useEffect, useMemo } from 'react'
import Map, { 
  Marker, 
  Popup, 
  NavigationControl,
  Source,
  Layer,
  type MapRef
} from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  MapPin, 
  Building2, 
  Train,
  ExternalLink,
  Navigation,
  Layers
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
  const [buildingData, setBuildingData] = useState<CSDIBuilding | null>(null)
  const [loading, setLoading] = useState(false)
  const [mapStyle, setMapStyle] = useState<'light' | 'dark' | 'satellite'>('light')
  const [showPopup, setShowPopup] = useState(true)

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

  // Building outline GeoJSON
  const buildingGeoJSON = useMemo(() => {
    if (!buildingData?.geometry) return null
    
    const geometry = buildingData.geometry as GeoJSON.Geometry
    
    return {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        geometry: geometry,
        properties: {
          name: buildingData.name || property.name,
          height: buildingData.properties.buildingHeight
        }
      }]
    } as GeoJSON.FeatureCollection
  }, [buildingData, property.name])

  // Map initial view
  const initialView = useMemo(() => ({
    longitude: property.lng || MAP_CONFIG.center.lng,
    latitude: property.lat || MAP_CONFIG.center.lat,
    zoom: MAP_CONFIG.zoom.property
  }), [property.lat, property.lng])

  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!mapboxToken) {
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

  const mapStyleUrl = mapStyle === 'satellite' 
    ? MAP_CONFIG.styles.satellite 
    : MAP_CONFIG.styles[mapStyle]

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

          {/* Map */}
          <Map
            initialViewState={initialView}
            style={{ width: '100%', height: '100%' }}
            mapStyle={mapStyleUrl}
            mapboxAccessToken={mapboxToken}
            minZoom={14}
            maxZoom={20}
          >
            <NavigationControl position="bottom-right" />

            {/* Building Outline */}
            {buildingGeoJSON && showBuildingOutline && (
              <Source id="building-outline" type="geojson" data={buildingGeoJSON}>
                <Layer
                  id="building-fill"
                  type="fill"
                  paint={{
                    'fill-color': '#3b82f6',
                    'fill-opacity': 0.3
                  }}
                />
                <Layer
                  id="building-line"
                  type="line"
                  paint={{
                    'line-color': '#3b82f6',
                    'line-width': 2
                  }}
                />
              </Source>
            )}

            {/* Property Marker */}
            <Marker
              longitude={property.lng}
              latitude={property.lat}
              anchor="bottom"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-white"
                >
                  <Building2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-primary" />
              </div>
            </Marker>

            {/* MTR Station Markers */}
            {nearbyStations.map((station) => {
              const stationData = MTR_STATIONS.find(s => s.name === station.name)
              if (!stationData) return null
              
              return (
                <Marker
                  key={station.name}
                  longitude={stationData.lng}
                  latitude={stationData.lat}
                  anchor="center"
                >
                  <div className="group relative">
                    <div className="w-5 h-5 rounded-full bg-red-600 border-2 border-white shadow-md cursor-pointer hover:scale-110 transition-transform"
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {station.name} ({station.distance}m)
                    </div>
                  </div>
                </Marker>
              )
            })}

            {/* Property Popup */}
            {showPopup && (
              <Popup
                longitude={property.lng}
                latitude={property.lat}
                anchor="top"
                onClose={() => setShowPopup(false)}
                closeButton={true}
                closeOnClick={false}
                offset={20}
              >
                <div className="p-2 min-w-[220px]">
                  <h3 className="font-semibold text-sm mb-1">{property.name}</h3>
                  <p className="text-xs text-muted-foreground mb-2">{property.address}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {property.grade}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {property.district}
                    </span>
                  </div>
                  {buildingData?.properties.buildingHeight && (
                    <p className="text-xs">
                      Height: {buildingData.properties.buildingHeight}m
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Street View
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      <Navigation className="w-3 h-3 mr-1" />
                      Directions
                    </a>
                  </div>
                </div>
              </Popup>
            )}
          </Map>
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
