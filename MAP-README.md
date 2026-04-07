# Map Integration for HK CRE Platform

This document describes the map functionality integrated into the HK Commercial Real Estate platform using Mapbox and CSDI (Common Spatial Data Infrastructure) building data.

## Overview

The map integration provides:
- Interactive map display using Mapbox GL JS
- Property markers with grade-based coloring
- MTR station overlays
- Building footprints from CSDI data
- Street view and directions integration
- Multi-language support (English, Traditional Chinese, Simplified Chinese)

## Setup

### 1. Mapbox Token

Add your Mapbox access token to `.env.local`:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoi...your_token_here
```

To get a token:
1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Go to Account → Tokens
3. Create a new public token

### 2. Dependencies

The following dependencies are required (already installed):

```bash
npm install mapbox-gl react-map-gl
npm install @types/mapbox-gl --save-dev
```

## Components

### BuildingMap (`components/BuildingMap.tsx`)

A comprehensive map component for displaying multiple properties.

**Features:**
- Property markers with color coding by grade (A+, A, B, C)
- Search functionality
- MTR station toggle
- Light/Dark map style toggle
- Property popups with details
- Responsive design

**Props:**
```typescript
interface BuildingMapProps {
  properties: Property[]
  selectedDistrict?: string
  onPropertySelect?: (property: Property) => void
  height?: string
  showFilters?: boolean
  showSearch?: boolean
}
```

**Usage:**
```tsx
import { BuildingMap } from '@/components/BuildingMap'

<BuildingMap 
  properties={properties}
  height="500px"
  showFilters={true}
  showSearch={true}
/>
```

### PropertyLocation (`components/PropertyLocation.tsx`)

A detailed map component for single property display.

**Features:**
- Large property marker
- Building footprint outline (from CSDI)
- Nearby MTR stations with distances
- Light/Dark/Satellite map styles
- Google Maps integration (Street View, Directions)
- Building height display (if available)

**Props:**
```typescript
interface PropertyLocationProps {
  property: Property
  height?: string
  showNearbyMTR?: boolean
  showBuildingOutline?: boolean
}
```

**Usage:**
```tsx
import { PropertyLocation } from '@/components/PropertyLocation'

<PropertyLocation 
  property={property}
  height="400px"
  showNearbyMTR={true}
  showBuildingOutline={true}
/>
```

## CSDI Integration

### API Configuration (`lib/map-config.ts`)

```typescript
export const CSDI_CONFIG = {
  baseUrl: 'https://portal.csdi.gov.hk/geoportal/api',
  wfsUrl: 'https://portal.csdi.gov.hk/server/services/Hosted/Building_Footprint_1627296276123/MapServer/WFSServer',
  buildingLayerId: 'Building_Footprint_1627296276123',
  maxFeatures: 1000
}
```

### Data Fetching (`lib/csdi-api.ts`)

Available functions:
- `fetchCSDIBuildings(bbox?)` - Fetch building data within bounding box
- `searchCSDIBuildings(query)` - Search buildings by name
- `getBuildingFootprint(lat, lng, radius)` - Get building at specific location

**Note:** CSDI API has CORS restrictions. For production use, implement server-side fetching or use a proxy.

## Map Configuration

### Default Settings (`lib/map-config.ts`)

```typescript
export const MAP_CONFIG = {
  center: { lat: 22.3193, lng: 114.1694 }, // Hong Kong
  zoom: {
    overview: 11,
    district: 13,
    property: 16
  },
  styles: {
    light: 'mapbox://styles/mapbox/light-v11',
    dark: 'mapbox://styles/mapbox/dark-v11',
    streets: 'mapbox://styles/mapbox/streets-v12',
    satellite: 'mapbox://styles/mapbox/satellite-streets-v12'
  }
}
```

### MTR Stations

Major MTR stations are pre-configured in `lib/map-config.ts` with coordinates and line information.

## Pages Updated

### 1. Home Page (`app/[locale]/page.tsx`)
- Added featured map section
- Displays first 6 properties on map
- Link to full map view

### 2. Properties Page (`app/[locale]/properties/page.tsx`)
- List view (default)
- Map view (full screen)
- Split view (list + map side by side)
- Search and filter integration

### 3. Property Detail Page (`app/[locale]/properties/[id]/page.tsx`)
- Interactive location map
- Nearby MTR stations
- Building footprint (if available)
- Google Maps links (Street View, Directions)

## Styling

### Marker Colors by Grade
- **A+**: Red (#ef4444)
- **A**: Orange (#f97316)
- **B**: Blue (#3b82f6)
- **C**: Gray (#6b7280)

### Dark/Light Mode
Maps automatically adapt to the selected theme. Use the style toggle to switch between:
- Light
- Dark
- Satellite

## Responsive Design

All map components are fully responsive:
- Mobile: Full-width maps with optimized controls
- Tablet: Adjusted layouts
- Desktop: Full feature display

## Performance Considerations

1. **Lazy Loading**: Maps are loaded only when in viewport
2. **Marker Clustering**: Consider implementing for large datasets
3. **Debounced Search**: Search input is debounced to reduce API calls
4. **Cached Data**: Property data is cached at page level

## Future Enhancements

1. **Heatmap Layer**: Display rent/price density
2. **Advanced Filters**: Filter by price range, grade, year built
3. **Drawing Tools**: Allow users to draw search areas
4. **Custom Tile Server**: For offline/controlled map data
5. **3D Buildings**: Enable Mapbox 3D building layer
6. **Route Planning**: Show travel time to MTR stations

## Troubleshooting

### Map not displaying
1. Check `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
2. Verify token has proper scopes (styles:tiles, styles:read)
3. Check browser console for errors

### CSDI data not loading
1. CSDI API requires server-side fetching due to CORS
2. Implement API routes in `/app/api/csdi/*` for production
3. Use mock data for development if needed

### Performance issues
1. Limit number of markers displayed
2. Implement virtual scrolling for large lists
3. Use `React.memo` for map components

## License

Map data © Mapbox, © OpenStreetMap contributors
Building data © CSDI (Common Spatial Data Infrastructure), Hong Kong
