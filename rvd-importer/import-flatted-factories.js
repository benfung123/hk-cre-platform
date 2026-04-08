/**
 * RVD Flatted Factory Data Importer
 * Imports industrial/flatted factory rental data
 * Generates synthetic data based on market patterns
 */
const { createClient } = require('@supabase/supabase-js');
const { INDUSTRIAL_DISTRICTS, INDUSTRIAL_RENT_PATTERNS } = require('./config/districts');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// Generate synthetic industrial data
// ============================================

function generateFlattedFactoryProperties() {
  const properties = [];
  
  INDUSTRIAL_DISTRICTS.forEach(district => {
    // Create 4 property types per district
    const types = [
      { name: 'Modern Industrial Building', category: 'modern' },
      { name: 'Flatted Factory Estate', category: 'traditional' },
      { name: 'Industrial/Office Hybrid', category: 'mixed' },
      { name: 'Logistics Centre', category: 'logistics' }
    ];
    
    const patterns = INDUSTRIAL_RENT_PATTERNS[district.name];
    
    types.forEach((type, index) => {
      let rentRange;
      if (type.category === 'modern' || type.category === 'logistics') {
        rentRange = { min: patterns.modernMin, max: patterns.modernMax };
      } else {
        rentRange = { min: patterns.min, max: patterns.max };
      }
      
      // Year built varies by type
      let yearBuilt;
      if (type.category === 'traditional') {
        yearBuilt = 1965 + Math.floor(Math.random() * 25); // 1965-1990
      } else if (type.category === 'modern') {
        yearBuilt = 1995 + Math.floor(Math.random() * 30); // 1995-2025
      } else {
        yearBuilt = 1980 + Math.floor(Math.random() * 35); // 1980-2015
      }
      
      properties.push({
        name: `${district.name} ${type.name} - RVD`,
        address: `${district.zoneType === 'logistics' ? 'Container Terminal Area' : 'Industrial Estate'}, ${district.name}, Hong Kong`,
        district: district.name,
        property_type: 'flatted_factory',
        grade: null, // Industrial doesn't use grades
        data_type: 'aggregate',
        data_source: 'RVD',
        data_quality_score: 3,
        year_built: yearBuilt,
        total_sqft: 20000 + Math.floor(Math.random() * 180000), // 20k-200k sqft
        floors: 5 + Math.floor(Math.random() * 20), // 5-25 floors
        rentRange,
        mtrAccess: district.mtrAccess,
        zoneType: district.zoneType
      });
    });
  });
  
  return properties;
}

function generateMonthlyTransactions(property, year, month) {
  const date = `${year}-${String(month).padStart(2, '0')}-15`;
  
  // Industrial rents have less seasonal variation than retail
  const seasonFactor = month >= 1 && month <= 3 ? 0.95 : // Post-holiday slow
                       month >= 10 && month <= 12 ? 1.05 : // Pre-holiday activity
                       1.0;
  
  // Trend factor
  const baseYear = 2015;
  const trendFactor = 1 + ((year - baseYear) * 0.015); // 1.5% annual increase (slower than retail)
  
  // Generate base rent with variation
  const baseRent = (property.rentRange.min + property.rentRange.max) / 2;
  const variation = (Math.random() - 0.5) * 0.08; // ±4% random variation (less volatile)
  const rentPerSqft = baseRent * seasonFactor * trendFactor * (1 + variation);
  
  return {
    property_id: property.id,
    date: date,
    type: 'lease',
    price_per_sqft: Math.round(rentPerSqft * 100) / 100,
    price: Math.round(rentPerSqft * 5000), // Industrial spaces are larger
    tenant_name: `RVD Industrial ${year}-${String(month).padStart(2, '0')}`,
    floor_area: 5000
  };
}

// ============================================
// Database Operations
// ============================================

async function getOrCreateProperty(property) {
  try {
    // Check if property exists
    const { data: existing, error: selectError } = await supabase
      .from('properties')
      .select('id')
      .eq('name', property.name)
      .single();
    
    if (existing) {
      return existing.id;
    }
    
    // Create new property (only use columns that exist)
    const propertyData = {
      name: property.name,
      address: property.address,
      district: property.district,
      grade: 'A', // Use valid grade - industrial properties don't use grading system
      year_built: property.year_built,
      total_sqft: property.total_sqft,
      floors: property.floors
    };
    
    const { data: created, error: insertError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select('id')
      .single();
    
    if (insertError) {
      console.error(`Failed to create property ${property.name}:`, insertError.message);
      return null;
    }
    
    console.log(`Created industrial property: ${property.name}`);
    return created.id;
  } catch (err) {
    console.error(`Error with property ${property.name}:`, err.message);
    return null;
  }
}

// ============================================
// Main Import Function
// ============================================

async function importFlattedFactoryData() {
  console.log('🏭 RVD Flatted Factory Data Importer');
  console.log('=====================================');
  console.log('Generating synthetic industrial data based on market patterns...');
  console.log('');
  
  // Generate properties
  const properties = generateFlattedFactoryProperties();
  console.log(`Generated ${properties.length} flatted factory properties`);
  console.log('');
  
  // Create properties in database
  console.log('🏢 Creating industrial properties...');
  const propertyMap = {};
  
  for (const property of properties) {
    const id = await getOrCreateProperty(property);
    if (id) {
      propertyMap[property.name] = { id, ...property };
    }
  }
  
  console.log(`✅ ${Object.keys(propertyMap).length} industrial properties ready`);
  console.log('');
  
  // Generate and import transactions
  console.log('📥 Importing industrial transactions...');
  const allTransactions = [];
  
  // Generate monthly data (2015-2025)
  const startYear = 2015;
  const endYear = 2025;
  
  for (const property of Object.values(propertyMap)) {
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        // Sample every month but with some gaps (industrial data is less frequent)
        if (Math.random() > 0.7) continue; // 30% of months have data
        
        const transaction = generateMonthlyTransactions(property, year, month);
        allTransactions.push(transaction);
      }
    }
  }
  
  console.log(`Generated ${allTransactions.length} industrial transactions`);
  
  // Batch insert transactions
  const batchSize = 100;
  let insertedCount = 0;
  
  for (let i = 0; i < allTransactions.length; i += batchSize) {
    const batch = allTransactions.slice(i, i + batchSize);
    const { error } = await supabase.from('transactions').insert(batch);
    
    if (error) {
      console.error(`Insert error at batch ${i/batchSize}:`, error.message);
    } else {
      insertedCount += batch.length;
      process.stdout.write(`\r✅ Imported ${insertedCount}/${allTransactions.length} industrial transactions`);
    }
  }
  
  console.log('');
  console.log('');
  
  // Get final counts
  const { count: propertyCount, error: propError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('property_type', 'flatted_factory');
  
  if (!propError) {
    console.log(`📊 Total flatted factory properties in database: ${propertyCount}`);
  }
  
  const { data: industrialIds } = await supabase
    .from('properties')
    .select('id')
    .eq('property_type', 'flatted_factory');
  
  if (industrialIds && industrialIds.length > 0) {
    const ids = industrialIds.map(p => p.id);
    const { count: industrialTransCount } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .in('property_id', ids);
    
    console.log(`📊 Total industrial transactions in database: ${industrialTransCount}`);
  }
  
  console.log('');
  console.log('🎉 Flatted factory import completed!');
  
  return {
    propertiesCreated: Object.keys(propertyMap).length,
    transactionsImported: insertedCount
  };
}

// Run import if called directly
if (require.main === module) {
  importFlattedFactoryData().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

module.exports = { importFlattedFactoryData };
