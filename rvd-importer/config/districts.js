/**
 * RVD District Configuration - Phase 2 Expansion
 * Hong Kong Commercial Real Estate Platform
 * Supports: Office, Retail, Industrial (Flatted Factories)
 */

// ============================================
// District information with metadata
// ============================================
const DISTRICT_INFO = {
  // Hong Kong Island
  'Sheung Wan': { nameZh: '上環', region: 'Hong Kong Island', retail: true },
  'Central': { nameZh: '中區', region: 'Hong Kong Island', retail: true },
  'Admiralty': { nameZh: '金鐘', region: 'Hong Kong Island', retail: true },
  'Wan Chai': { nameZh: '灣仔', region: 'Hong Kong Island', retail: true },
  'Causeway Bay': { nameZh: '銅鑼灣', region: 'Hong Kong Island', retail: true },
  'North Point': { nameZh: '北角', region: 'Hong Kong Island', retail: false },
  'Quarry Bay': { nameZh: '鰂魚涌', region: 'Hong Kong Island', retail: false },
  'Kennedy Town': { nameZh: '堅尼地城', region: 'Hong Kong Island', retail: false },
  'Aberdeen': { nameZh: '香港仔', region: 'Hong Kong Island', retail: false },
  
  // Kowloon - Core retail districts
  'Tsim Sha Tsui': { nameZh: '尖沙咀', region: 'Kowloon', retail: true },
  'Yau Ma Tei': { nameZh: '油麻地', region: 'Kowloon', retail: true },
  'Mong Kok': { nameZh: '旺角', region: 'Kowloon', retail: true },
  'Jordan': { nameZh: '佐敦', region: 'Kowloon', retail: true },
  'Kowloon Bay': { nameZh: '九龍灣', region: 'Kowloon', retail: false, industrial: true },
  'Kwun Tong': { nameZh: '觀塘', region: 'Kowloon', retail: false, industrial: true },
  'Cheung Sha Wan': { nameZh: '長沙灣', region: 'Kowloon', retail: false, industrial: true },
  'Lai Chi Kok': { nameZh: '荔枝角', region: 'Kowloon', retail: false, industrial: true },
  
  // New Territories - Industrial focus
  'Tsuen Wan': { nameZh: '荃灣', region: 'New Territories', retail: false, industrial: true },
  'Kwai Chung': { nameZh: '葵涌', region: 'New Territories', retail: false, industrial: true },
  'Sha Tin': { nameZh: '沙田', region: 'New Territories', retail: false },
  'Tuen Mun': { nameZh: '屯門', region: 'New Territories', retail: false, industrial: true },
  'Tseung Kwan O': { nameZh: '將軍澳', region: 'New Territories', retail: false },
  'Fanling': { nameZh: '粉嶺', region: 'New Territories', retail: false, industrial: true },
  'Yuen Long': { nameZh: '元朗', region: 'New Territories', retail: true },
};

// ============================================
// Office Data Column Mappings (his_data_6.xls)
// ============================================

// Quarterly data column mappings
const QUARTERLY_COLUMNS = {
  // Grade A: Values are at columns 8, 11, 14, 17, 20, 23, 26 (7 districts)
  gradeA: [
    { col: 8, district: 'Sheung Wan' },
    { col: 11, district: 'Central' },
    { col: 14, district: 'Causeway Bay' },
    { col: 17, district: 'Quarry Bay' },
    { col: 20, district: 'Tsim Sha Tsui' },
    { col: 23, district: 'Mong Kok' },
    { col: 26, district: 'Kwun Tong' },
  ],
  // Grade B: Columns 29, 32, 35, 38, 41, 44, 47
  gradeB: [
    { col: 29, district: 'Sheung Wan' },
    { col: 32, district: 'Central' },
    { col: 35, district: 'Causeway Bay' },
    { col: 38, district: 'Quarry Bay' },
    { col: 41, district: 'Tsim Sha Tsui' },
    { col: 44, district: 'Mong Kok' },
    { col: 47, district: 'Kwun Tong' },
  ],
  // Grade C: Columns 50, 53, 56, 59, 62, 65, 68
  gradeC: [
    { col: 50, district: 'Sheung Wan' },
    { col: 53, district: 'Central' },
    { col: 56, district: 'Causeway Bay' },
    { col: 59, district: 'Quarry Bay' },
    { col: 62, district: 'Tsim Sha Tsui' },
    { col: 65, district: 'Mong Kok' },
    { col: 68, district: 'Kwun Tong' },
  ],
};

// Monthly data column mappings
const MONTHLY_COLUMNS = {
  // Grade A: Values are at columns 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38
  gradeA: [
    { col: 8, district: 'Sheung Wan' },
    { col: 11, district: 'Central' },
    { col: 14, district: 'Wan Chai' },
    { col: 17, district: 'Causeway Bay' },
    { col: 20, district: 'North Point' },
    { col: 23, district: 'Quarry Bay' },
    { col: 26, district: 'Tsim Sha Tsui' },
    { col: 29, district: 'Yau Ma Tei' },
    { col: 32, district: 'Mong Kok' },
    { col: 35, district: 'Kowloon Bay' },
    { col: 38, district: 'Kwun Tong' },
  ],
  // Grade B: Values start at column 41
  gradeB: [
    { col: 41, district: 'Sheung Wan' },
    { col: 44, district: 'Central' },
    { col: 47, district: 'Wan Chai' },
    { col: 50, district: 'Causeway Bay' },
  ]
};

// Price data column mappings (his_data_7.xls)
const PRICE_COLUMNS = {
  gradeA: [
    { col: 8, district: 'Sheung Wan' },
    { col: 11, district: 'Central' },
    { col: 14, district: 'Causeway Bay' },
    { col: 17, district: 'Quarry Bay' },
    { col: 20, district: 'Tsim Sha Tsui' },
    { col: 23, district: 'Mong Kok' },
    { col: 26, district: 'Kwun Tong' },
  ],
  gradeB: [
    { col: 29, district: 'Sheung Wan' },
    { col: 32, district: 'Central' },
    { col: 35, district: 'Causeway Bay' },
    { col: 38, district: 'Quarry Bay' },
    { col: 41, district: 'Tsim Sha Tsui' },
    { col: 44, district: 'Mong Kok' },
    { col: 47, district: 'Kwun Tong' },
  ],
  gradeC: [
    { col: 50, district: 'Sheung Wan' },
    { col: 53, district: 'Central' },
    { col: 56, district: 'Causeway Bay' },
    { col: 59, district: 'Quarry Bay' },
    { col: 62, district: 'Tsim Sha Tsui' },
    { col: 65, district: 'Mong Kok' },
    { col: 68, district: 'Kwun Tong' },
  ],
};

// ============================================
// Retail District Configuration
// ============================================
const RETAIL_DISTRICTS = [
  // Core retail corridors
  { name: 'Tsim Sha Tsui', nameZh: '尖沙咀', region: 'Kowloon', prime: true, retailCorridor: 'Nathan Road / Canton Road' },
  { name: 'Causeway Bay', nameZh: '銅鑼灣', region: 'Hong Kong Island', prime: true, retailCorridor: 'Russell Street / Jardine Crescent' },
  { name: 'Central', nameZh: '中區', region: 'Hong Kong Island', prime: true, retailCorridor: 'Queen\'s Road Central' },
  { name: 'Mong Kok', nameZh: '旺角', region: 'Kowloon', prime: true, retailCorridor: 'Sai Yeung Choi Street / Nathan Road' },
  { name: 'Admiralty', nameZh: '金鐘', region: 'Hong Kong Island', prime: true, retailCorridor: 'Pacific Place / Queensway' },
  { name: 'Wan Chai', nameZh: '灣仔', region: 'Hong Kong Island', prime: false, retailCorridor: 'Hennessy Road / Johnston Road' },
  { name: 'Jordan', nameZh: '佐敦', region: 'Kowloon', prime: false, retailCorridor: 'Nathan Road' },
  { name: 'Yau Ma Tei', nameZh: '油麻地', region: 'Kowloon', prime: false, retailCorridor: 'Nathan Road' },
  { name: 'Sheung Wan', nameZh: '上環', region: 'Hong Kong Island', prime: false, retailCorridor: 'Queen\'s Road Central' },
  { name: 'Yuen Long', nameZh: '元朗', region: 'New Territories', prime: false, retailCorridor: 'Castle Peak Road' },
];

// ============================================
// Industrial District Configuration (Flatted Factories)
// ============================================
const INDUSTRIAL_DISTRICTS = [
  // Primary industrial zones
  { name: 'Kwun Tong', nameZh: '觀塘', region: 'Kowloon', zoneType: 'traditional', mtrAccess: true },
  { name: 'Kwai Chung', nameZh: '葵涌', region: 'New Territories', zoneType: 'logistics', mtrAccess: true },
  { name: 'Tsuen Wan', nameZh: '荃灣', region: 'New Territories', zoneType: 'mixed', mtrAccess: true },
  { name: 'Cheung Sha Wan', nameZh: '長沙灣', region: 'Kowloon', zoneType: 'mixed', mtrAccess: true },
  { name: 'Kowloon Bay', nameZh: '九龍灣', region: 'Kowloon', zoneType: 'modern', mtrAccess: true },
  { name: 'Lai Chi Kok', nameZh: '荔枝角', region: 'Kowloon', zoneType: 'mixed', mtrAccess: true },
  { name: 'Tuen Mun', nameZh: '屯門', region: 'New Territories', zoneType: 'modern', mtrAccess: false },
  { name: 'Fanling', nameZh: '粉嶺', region: 'New Territories', zoneType: 'modern', mtrAccess: true },
  { name: 'Tseung Kwan O', nameZh: '將軍澳', region: 'New Territories', zoneType: 'modern', mtrAccess: true },
  { name: 'Quarry Bay', nameZh: '鰂魚涌', region: 'Hong Kong Island', zoneType: 'traditional', mtrAccess: true },
];

// ============================================
// Synthetic Data Patterns for Missing RVD Files
// ============================================

// Retail rent patterns (HK$/sqft/month) - based on market research
const RETAIL_RENT_PATTERNS = {
  'Tsim Sha Tsui': { min: 80, max: 400, primeMin: 200, primeMax: 600 },
  'Causeway Bay': { min: 90, max: 450, primeMin: 250, primeMax: 800 },
  'Central': { min: 100, max: 500, primeMin: 300, primeMax: 1000 },
  'Mong Kok': { min: 50, max: 250, primeMin: 120, primeMax: 400 },
  'Admiralty': { min: 120, max: 400, primeMin: 200, primeMax: 600 },
  'Wan Chai': { min: 60, max: 200, primeMin: 100, primeMax: 300 },
  'Jordan': { min: 40, max: 150, primeMin: 80, primeMax: 200 },
  'Yau Ma Tei': { min: 35, max: 120, primeMin: 60, primeMax: 180 },
  'Sheung Wan': { min: 50, max: 180, primeMin: 90, primeMax: 250 },
  'Yuen Long': { min: 20, max: 80, primeMin: 40, primeMax: 120 },
};

// Industrial (flatted factory) rent patterns (HK$/sqft/month)
const INDUSTRIAL_RENT_PATTERNS = {
  'Kwun Tong': { min: 12, max: 25, modernMin: 18, modernMax: 35 },
  'Kwai Chung': { min: 10, max: 20, modernMin: 15, modernMax: 28 },
  'Tsuen Wan': { min: 11, max: 22, modernMin: 16, modernMax: 30 },
  'Cheung Sha Wan': { min: 13, max: 24, modernMin: 17, modernMax: 32 },
  'Kowloon Bay': { min: 15, max: 28, modernMin: 20, modernMax: 38 },
  'Lai Chi Kok': { min: 12, max: 23, modernMin: 16, modernMax: 28 },
  'Tuen Mun': { min: 8, max: 16, modernMin: 12, modernMax: 22 },
  'Fanling': { min: 9, max: 17, modernMin: 12, modernMax: 20 },
  'Tseung Kwan O': { min: 14, max: 26, modernMin: 18, modernMax: 32 },
  'Quarry Bay': { min: 18, max: 35, modernMin: 25, modernMax: 45 },
};

module.exports = {
  DISTRICT_INFO,
  QUARTERLY_COLUMNS,
  MONTHLY_COLUMNS,
  PRICE_COLUMNS,
  RETAIL_DISTRICTS,
  INDUSTRIAL_DISTRICTS,
  RETAIL_RENT_PATTERNS,
  INDUSTRIAL_RENT_PATTERNS,
};
