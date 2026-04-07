// Map configuration for HK CRE Platform
export const MAP_CONFIG = {
  // Hong Kong center coordinates
  center: {
    lat: 22.3193,
    lng: 114.1694
  },
  // Default zoom levels for Amap
  zoom: {
    overview: 11,
    district: 13,
    property: 16
  },
  // Amap style options (using Amap built-in styles)
  styles: {
    light: 'normal',      // Standard map
    dark: 'dark',         // Dark mode
    streets: 'normal',    // Streets view
    satellite: 'satellite' // Satellite view
  },
  // Hong Kong bounds (approximate)
  bounds: {
    minLat: 22.15,
    maxLat: 22.55,
    minLng: 113.8,
    maxLng: 114.5
  }
}

// CSDI API Configuration
export const CSDI_CONFIG = {
  baseUrl: 'https://portal.csdi.gov.hk/geoportal/api',
  wfsUrl: 'https://portal.csdi.gov.hk/server/services/Hosted/Building_Footprint_1627296276123/MapServer/WFSServer',
  // Building layer ID
  buildingLayerId: 'Building_Footprint_1627296276123',
  // Max features to fetch
  maxFeatures: 1000
}

// MTR Station data (major stations for reference)
export const MTR_STATIONS = [
  { name: 'Central', nameZh: '中環', lat: 22.2818, lng: 114.1581, lines: ['TWL', 'ISL'] },
  { name: 'Admiralty', nameZh: '金鐘', lat: 22.2793, lng: 114.1645, lines: ['TWL', 'ISL', 'EAL', 'SIL'] },
  { name: 'Tsim Sha Tsui', nameZh: '尖沙咀', lat: 22.2975, lng: 114.1722, lines: ['TWL'] },
  { name: 'Causeway Bay', nameZh: '銅鑼灣', lat: 22.2802, lng: 114.1839, lines: ['ISL'] },
  { name: 'Wan Chai', nameZh: '灣仔', lat: 22.2775, lng: 114.1730, lines: ['ISL'] },
  { name: 'North Point', nameZh: '北角', lat: 22.2911, lng: 114.2003, lines: ['ISL', 'TKL'] },
  { name: 'Quarry Bay', nameZh: '鰂魚涌', lat: 22.2876, lng: 114.2097, lines: ['ISL', 'TKL'] },
  { name: 'Kowloon Bay', nameZh: '九龍灣', lat: 22.3231, lng: 114.2139, lines: ['KTL'] },
  { name: 'Kwun Tong', nameZh: '觀塘', lat: 22.3123, lng: 114.2266, lines: ['KTL'] },
  { name: 'Mong Kok', nameZh: '旺角', lat: 22.3193, lng: 114.1694, lines: ['TWL', 'KTL'] },
  { name: 'Jordan', nameZh: '佐敦', lat: 22.3049, lng: 114.1717, lines: ['TWL'] },
  { name: 'Sheung Wan', nameZh: '上環', lat: 22.2867, lng: 114.1520, lines: ['TWL'] },
  { name: 'Hong Kong', nameZh: '香港', lat: 22.2846, lng: 114.1581, lines: ['TCL', 'AEL'] },
]

// District centers for map navigation
export const DISTRICT_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Central': { lat: 22.2818, lng: 114.1581, zoom: 15 },
  'Admiralty': { lat: 22.2793, lng: 114.1645, zoom: 15 },
  'Wan Chai': { lat: 22.2775, lng: 114.1730, zoom: 15 },
  'Causeway Bay': { lat: 22.2802, lng: 114.1839, zoom: 15 },
  'Tsim Sha Tsui': { lat: 22.2975, lng: 114.1722, zoom: 15 },
  'Mong Kok': { lat: 22.3193, lng: 114.1694, zoom: 15 },
  'North Point': { lat: 22.2911, lng: 114.2003, zoom: 15 },
  'Quarry Bay': { lat: 22.2876, lng: 114.2097, zoom: 15 },
  'Kowloon Bay': { lat: 22.3231, lng: 114.2139, zoom: 15 },
  'Kwun Tong': { lat: 22.3123, lng: 114.2266, zoom: 15 },
}
