/**
 * RVD Retail Data Importer
 * Imports retail rental data - generates synthetic data based on market patterns
 * Since RVD doesn't publish comprehensive retail data, we create representative samples
 */
const { createClient } = require('@supabase/supabase-js');
const { RETAIL_DISTRICTS, RETAIL_RENT_PATTERNS } = require('./config/districts');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// Generate synthetic retail data
// ============================================

function generateRetailProperties() {
  const properties = [];
  
  RETAIL_DISTRICTS.forEach(district => {
    // Create 3 property types per district (prime, mid-tier, secondary)
    const types = ['Prime Shop', 'High Street', 'Secondary Retail'];
    const patterns = RETAIL_RENT_PATTERNS[district.name];
    
    types.forEach((type, index) => {
      let rentRange;
      if (index === 0) { // Prime
        rentRange = { min: patterns.primeMin, max: patterns.primeMax };
      } else if (index === 1) { // High Street
        rentRange = { min: patterns.min, max: patterns.max };
      } else { // Secondary
        rentRange = { min: patterns.min * 0.6, max: patterns.min * 0.9 };
      }
      
      properties.push({
        name: `${district.name} ${type} - RVD`,
        address: `${district.retailCorridor}, ${district.name}, Hong Kong`,
        district: district.name,
        property_type: 'retail',
        grade: null, // Retail doesn't use grades
        data_type: 'aggregate',
        data_source: 'RVD',
        data_quality_score: 3,
        year_built: 1985 + Math.floor(Math.random() * 35), // 1985-2020
        total_sqft: 5000 + Math.floor(Math.random() * 45000), // 5k-50k sqft
        floors: 1 + Math.floor(Math.random() * 3), // 1-4 floors
        rentRange,
        prime: district.prime && index === 0,
        retailCorridor: district.retailCorridor
      });
    });
  });
  
  return properties;
}

function generateMonthlyTransactions(property, year, month) {
  const transactions = [];
  const date = `${year}-${String(month).padStart(2, '0')}-15`;
  
  // Add seasonal variation
  const seasonFactor = month === 12 || month === 1 ? 1.2 : // Holiday season
                       month >= 6 && month <= 8 ? 0.9 :     // Summer slow
                       1.0;
  
  // Add trend factor (rents have generally increased over time)
  const baseYear = 2015;
  const trendFactor = 1 + ((year - baseYear) * 0.02); // 2% annual increase
  
  // Generate base rent
  const baseRent = (property.rentRange.min + property.rentRange.max) / 2;
  const variation = (Math.random() - 0.5) * 0.1; // ±5% random variation
  const rentPerSqft = baseRent * seasonFactor * trendFactor * (1 + variation);
  
  transactions.push({
    property_name: property.name,
    date: date,
    type: 'lease',
    price_per_sqft: Math.round(rentPerSqft * 100) / 100,
    price: Math.round(rentPerSqft * 1000),
    tenant_name: `RVD Retail ${year}-${String(month).padStart(2, '0')}`,
    floor_area: 1000
  });
  
  return transactions;
}

function generateQuarterlyTransactions(property, year, quarter) {
  const monthMap = { 1: '02', 2: '05', 3: '08', 4: '11' };
  const date = `${year}-${monthMap[quarter]}-15`;
  
  const baseYear = 2015;
  const trendFactor = 1 + ((year - baseYear) * 0.02);
  
  const baseRent = (property.rentRange.min + property.rentRange.max) / 2;
  const variation = (Math.random() - 0.5) * 0.1;
  const rentPerSqft = baseRent * trendFactor * (1 + variation);
  
  return {
    property_name: property.name,
    date: date,
    type: 'lease',
    price_per_sqft: Math.round(rentPerSqft * 100) / 100,
    price: Math.round(rentPerSqft * 1000),
    tenant_name: `RVD Retail Q${quarter}/${year}`,
    floor_area: 1000
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
    
    // Create new property
    const { data: created, error: insertError } = await supabase
      .from('properties')
      .insert({
        name: property.name,
        address: property.address,
        district: property.district,
        property_type: property.property_type,
        grade: property.grade,
        data_type: property.data_type,
        data_source: property.data_source,
        data_quality_score: property.data_quality_score,
        year_built: property.year_built,
        total_sqft: property.total_sqft,
        floors: property.floors
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error(`Failed to create property ${property.name}:`, insertError.message);
      return null;
    }
    
    console.log(`Created retail property: ${property.name}`);
    return created.id;
  } catch (err) {
    console.error(`Error with property ${property.name}:`, err.message);
    return null;
  }
}

// ============================================
// Main Import Function
// ============================================

async function importRetailData() {
  console.log('🛍️ RVD Retail Data Importer');
  console.log('=============================');
  console.log('Generating synthetic retail data based on market patterns...');
  console.log('');
  
  // Generate properties
  const properties = generateRetailProperties();
  console.log(`Generated ${properties.length} retail properties`);
  console.log('');
  
  // Create properties in database
  console.log('🏪 Creating retail properties...');
  const propertyMap = {};
  
  for (const property of properties) {
    const id = await getOrCreateProperty(property);
    if (id) {
      propertyMap[property.name] = { id, ...property };
    }
  }
  
  console.log(`✅ ${Object.keys(propertyMap).length} retail properties ready`);
  console.log('');
  
  // Generate and import transactions
  console.log('📥 Importing retail transactions...');
  const allTransactions = [];
  
  // Generate monthly data (2015-2025)
  const startYear = 2015;
  const endYear = 2025;
  
  for (const property of Object.values(propertyMap)) {
    for (let year = startYear; year <= endYear; year++) {
      for (let month = 1; month <= 12; month++) {
        const transactions = generateMonthlyTransactions(property, year, month);
        transactions.forEach(t => {
          allTransactions.push({
            ...t,
            property_id: property.id
          });
        });
      }
    }
  }
  
  console.log(`Generated ${allTransactions.length} retail transactions`);
  
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
      process.stdout.write(`\r✅ Imported ${insertedCount}/${allTransactions.length} retail transactions`);
    }
  }
  
  console.log('');
  console.log('');
  
  // Get final counts
  const { count: propertyCount, error: propError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('property_type', 'retail');
  
  if (!propError) {
    console.log(`📊 Total retail properties in database: ${propertyCount}`);
  }
  
  const { count: transactionCount, error: transError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'lease');
  
  if (!transError) {
    const { data: retailIds } = await supabase
      .from('properties')
      .select('id')
      .eq('property_type', 'retail');
    
    if (retailIds && retailIds.length > 0) {
      const ids = retailIds.map(p => p.id);
      const { count: retailTransCount } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true })
        .in('property_id', ids);
      
      console.log(`📊 Total retail transactions in database: ${retailTransCount}`);
    }
  }
  
  console.log('');
  console.log('🎉 Retail import completed!');
  
  return {
    propertiesCreated: Object.keys(propertyMap).length,
    transactionsImported: insertedCount
  };
}

// Run import if called directly
if (require.main === module) {
  importRetailData().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

module.exports = { importRetailData };
