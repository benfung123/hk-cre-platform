/**
 * RVD District Configuration
 * Hong Kong Commercial Real Estate Platform
 * Complete list of Hong Kong districts with column mappings
 */

// District information (name mappings)
const DISTRICT_INFO = {
  'Sheung Wan': { nameZh: '上環', region: 'Hong Kong Island' },
  'Central': { nameZh: '中區', region: 'Hong Kong Island' },
  'Admiralty': { nameZh: '金鐘', region: 'Hong Kong Island' },
  'Wan Chai': { nameZh: '灣仔', region: 'Hong Kong Island' },
  'Causeway Bay': { nameZh: '銅鑼灣', region: 'Hong Kong Island' },
  'North Point': { nameZh: '北角', region: 'Hong Kong Island' },
  'Quarry Bay': { nameZh: '鰂魚涌', region: 'Hong Kong Island' },
  'Kennedy Town': { nameZh: '堅尼地城', region: 'Hong Kong Island' },
  'Aberdeen': { nameZh: '香港仔', region: 'Hong Kong Island' },
  'Tsim Sha Tsui': { nameZh: '尖沙咀', region: 'Kowloon' },
  'Yau Ma Tei': { nameZh: '油麻地', region: 'Kowloon' },
  'Mong Kok': { nameZh: '旺角', region: 'Kowloon' },
  'Kowloon Bay': { nameZh: '九龍灣', region: 'Kowloon' },
  'Kwun Tong': { nameZh: '觀塘', region: 'Kowloon' },
  'Cheung Sha Wan': { nameZh: '長沙灣', region: 'Kowloon' },
  'Tsuen Wan': { nameZh: '荃灣', region: 'New Territories' },
  'Sha Tin': { nameZh: '沙田', region: 'New Territories' },
  'Tuen Mun': { nameZh: '屯門', region: 'New Territories' },
  'Tseung Kwan O': { nameZh: '將軍澳', region: 'New Territories' },
};

// Quarterly data column mappings (his_data_6.xls)
// Based on actual Excel structure - values are at header column + 1
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

// Monthly data column mappings (his_data_6.xls - Monthly sheet)
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
  // Similar structure to quarterly
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

module.exports = {
  DISTRICT_INFO,
  QUARTERLY_COLUMNS,
  MONTHLY_COLUMNS,
  PRICE_COLUMNS,
};
