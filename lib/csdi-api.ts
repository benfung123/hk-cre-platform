import { CSDI_CONFIG } from './map-config'

export interface CSDIBuilding {
  id: string
  name?: string
  nameEn?: string
  nameZh?: string
  address?: string
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
  properties: {
    buildingHeight?: number
    buildingType?: string
    yearBuilt?: number
    floors?: number
    [key: string]: unknown
  }
}

/**
 * Fetch building data from CSDI WFS API
 * Note: CSDI API has CORS restrictions, so we use a proxy approach
 * or fetch server-side
 */
export async function fetchCSDIBuildings(
  bbox?: { minLng: number; minLat: number; maxLng: number; maxLat: number }
): Promise<CSDIBuilding[]> {
  try {
    // Build WFS query parameters
    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: CSDI_CONFIG.buildingLayerId,
      outputFormat: 'application/json',
      count: CSDI_CONFIG.maxFeatures.toString()
    })

    // Add bounding box filter if provided
    if (bbox) {
      params.append('bbox', `${bbox.minLng},${bbox.minLat},${bbox.maxLng},${bbox.maxLat}`)
    }

    const url = `${CSDI_CONFIG.wfsUrl}?${params.toString()}`
    
    // Note: In production, this should be called server-side or through a proxy
    // due to CORS restrictions
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`CSDI API error: ${response.status}`)
    }

    const data = await response.json()
    return parseCSDIFeatures(data)
  } catch (error) {
    console.error('Error fetching CSDI buildings:', error)
    // Return empty array on error - graceful degradation
    return []
  }
}

/**
 * Parse GeoJSON features from CSDI response
 */
function parseCSDIFeatures(geojson: {
  features?: Array<{
    id?: string
    properties?: Record<string, unknown>
    geometry?: {
      type: string
      coordinates: unknown
    }
  }>
}): CSDIBuilding[] {
  if (!geojson.features || !Array.isArray(geojson.features)) {
    return []
  }

  return geojson.features.map((feature) => ({
    id: feature.id || `building-${Math.random().toString(36).substr(2, 9)}`,
    name: feature.properties?.name as string | undefined,
    nameEn: feature.properties?.name_en as string | undefined,
    nameZh: feature.properties?.name_zh as string | undefined,
    address: feature.properties?.address as string | undefined,
    geometry: feature.geometry as CSDIBuilding['geometry'],
    properties: {
      buildingHeight: feature.properties?.height as number | undefined,
      buildingType: feature.properties?.building_type as string | undefined,
      yearBuilt: feature.properties?.year_built as number | undefined,
      floors: feature.properties?.floors as number | undefined,
      ...feature.properties
    }
  }))
}

/**
 * Search for buildings by name in CSDI data
 */
export async function searchCSDIBuildings(query: string): Promise<CSDIBuilding[]> {
  try {
    const params = new URLSearchParams({
      service: 'WFS',
      version: '2.0.0',
      request: 'GetFeature',
      typeName: CSDI_CONFIG.buildingLayerId,
      outputFormat: 'application/json',
      cql_filter: `name LIKE '%${query}%' OR name_en LIKE '%${query}%' OR name_zh LIKE '%${query}%'`,
      count: '50'
    })

    const url = `${CSDI_CONFIG.wfsUrl}?${params.toString()}`
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`CSDI API error: ${response.status}`)
    }

    const data = await response.json()
    return parseCSDIFeatures(data)
  } catch (error) {
    console.error('Error searching CSDI buildings:', error)
    return []
  }
}

/**
 * Get building footprint polygon for a specific location
 */
export async function getBuildingFootprint(
  lat: number,
  lng: number,
  radius: number = 50
): Promise<CSDIBuilding | null> {
  try {
    // Convert radius from meters to degrees (approximate)
    const radiusDeg = radius / 111000
    const bbox = {
      minLng: lng - radiusDeg,
      minLat: lat - radiusDeg,
      maxLng: lng + radiusDeg,
      maxLat: lat + radiusDeg
    }

    const buildings = await fetchCSDIBuildings(bbox)
    
    if (buildings.length === 0) {
      return null
    }

    // Find the closest building to the given coordinates
    let closest = buildings[0]
    let minDistance = Infinity

    for (const building of buildings) {
      const center = getPolygonCenter(building.geometry)
      const distance = Math.sqrt(
        Math.pow(center.lat - lat, 2) + Math.pow(center.lng - lng, 2)
      )
      
      if (distance < minDistance) {
        minDistance = distance
        closest = building
      }
    }

    return closest
  } catch (error) {
    console.error('Error getting building footprint:', error)
    return null
  }
}

/**
 * Calculate center point of a polygon
 */
function getPolygonCenter(geometry: CSDIBuilding['geometry']): { lat: number; lng: number } {
  let latSum = 0
  let lngSum = 0
  let count = 0

  const processCoords = (coords: number[][]) => {
    for (const coord of coords) {
      lngSum += coord[0]
      latSum += coord[1]
      count++
    }
  }

  if (geometry.type === 'Polygon') {
    // First ring is the outer boundary
    processCoords(geometry.coordinates[0] as number[][])
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of geometry.coordinates) {
      processCoords((polygon as number[][][])[0])
    }
  }

  return {
    lat: latSum / count,
    lng: lngSum / count
  }
}

/**
 * Convert CSDI building geometry to GeoJSON format for Mapbox
 */
export function buildingToGeoJSON(building: CSDIBuilding): GeoJSON.Feature {
  return {
    type: 'Feature',
    id: building.id,
    geometry: building.geometry,
    properties: {
      name: building.name,
      nameEn: building.nameEn,
      nameZh: building.nameZh,
      height: building.properties.buildingHeight,
      ...building.properties
    }
  }
}
