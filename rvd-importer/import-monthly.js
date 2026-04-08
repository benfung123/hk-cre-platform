/**
 * RVD Monthly Data Importer
 * Imports monthly rental data from his_data_6.xls
 */
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const path = require('path');

// Load configuration
const { MONTHLY_COLUMNS } = require('./config/districts');

// Supabase configuration - use environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Constants
const SQM_TO_SQFT = 10.764;
const DATA_FILE = path.join(__dirname, 'data', 'his_data_6.xls');
const SHEET_NAME = 'Monthly  按月';

/**
 * Extract numeric value from cell (handles parentheses, spaces, etc.)
 */
function extractValue(cell) {
  if (cell === undefined || cell === null) return null;
  if (typeof cell === 'number') return cell;
  if (typeof cell !== 'string') return null;
  
  // Remove parentheses, spaces, and other non-numeric characters
  const cleaned = cell.replace(/[()\s\-\/]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Create or get property from database
 */
async function getOrCreateProperty(district, grade) {
  const name = `${district} Grade ${grade} Office - RVD`;
  
  try {
    // Check if property exists
    const { data: existing, error: selectError } = await supabase
      .from('properties')
      .select('id')
      .eq('name', name)
      .single();
    
    if (existing) {
      return existing.id;
    }
    
    // Create new property
    const { data: created, error: insertError } = await supabase
      .from('properties')
      .insert({
        name,
        address: `${district}, Hong Kong`,
        district,
        grade,
        year_built: 1995,
        total_sqft: 500000,
        floors: 25
      })
      .select('id')
      .single();
    
    if (insertError) {
      console.error(`Failed to create property ${name}:`, insertError.message);
      return null;
    }
    
    console.log(`Created property: ${name}`);
    return created.id;
  } catch (err) {
    console.error(`Error with property ${name}:`, err.message);
    return null;
  }
}

/**
 * Import monthly rent data
 */
async function importMonthlyData() {
  console.log('📊 RVD Monthly Data Importer');
  console.log('============================');
  console.log(`Data file: ${DATA_FILE}`);
  console.log(`Sheet: ${SHEET_NAME}`);
  console.log('');
  
  // Read Excel file
  console.log('📖 Reading Excel file...');
  const wb = xlsx.readFile(DATA_FILE);
  const ws = wb.Sheets[SHEET_NAME];
  
  if (!ws) {
    console.error(`❌ Sheet "${SHEET_NAME}" not found!`);
    console.log('Available sheets:', wb.SheetNames);
    return;
  }
  
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
  console.log(`✅ Found ${data.length} rows`);
  console.log('');
  
  // Determine available columns based on data width
  const maxCol = Math.max(...data.map(row => row?.length || 0));
  
  // Build column list dynamically
  const allColumns = [];
  
  // Add Grade A columns if they exist
  for (const col of MONTHLY_COLUMNS.gradeA) {
    if (col.col < maxCol) {
      allColumns.push({ ...col, grade: 'A' });
    }
  }
  
  // Add Grade B columns if they exist
  for (const col of MONTHLY_COLUMNS.gradeB) {
    if (col.col < maxCol) {
      allColumns.push({ ...col, grade: 'B' });
    }
  }
  
  console.log(`Processing ${allColumns.length} district-grade combinations`);
  console.log(`Grade A: ${MONTHLY_COLUMNS.gradeA.filter(c => c.col < maxCol).length} districts`);
  console.log(`Grade B: ${MONTHLY_COLUMNS.gradeB.filter(c => c.col < maxCol).length} districts`);
  
  // Build property map
  console.log('🏢 Setting up properties...');
  const propertyMap = {};
  
  for (const { district, grade } of allColumns) {
    const propertyId = await getOrCreateProperty(district, grade);
    if (propertyId) {
      propertyMap[`${district}-${grade}`] = propertyId;
    }
  }
  
  console.log(`✅ ${Object.keys(propertyMap).length} properties ready`);
  console.log('');
  
  // Parse data rows
  console.log('📥 Importing monthly transactions...');
  const transactions = [];
  let currentYear = 1999;
  let rowCount = 0;
  let transactionCount = 0;
  
  // Data starts from row 11 (0-indexed: 10)
  for (let i = 11; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    rowCount++;
    
    // Check for year in column 1
    if (typeof row[1] === 'number' && row[1] >= 1990 && row[1] <= 2030) {
      currentYear = row[1];
    }
    
    // Get month from column 5
    const month = row[5];
    if (!month || typeof month !== 'number' || month < 1 || month > 12) {
      continue;
    }
    
    const date = `${currentYear}-${String(month).padStart(2, '0')}-15`;
    
    // Process each district column
    for (const { col, district, grade } of allColumns) {
      const rentValue = extractValue(row[col]);
      if (!rentValue || rentValue <= 0) continue;
      
      const propertyId = propertyMap[`${district}-${grade}`];
      if (!propertyId) continue;
      
      // Convert from $/sqm/month to $/sqft/month
      const rentPerSqft = rentValue / SQM_TO_SQFT;
      
      transactions.push({
        property_id: propertyId,
        date: date,
        type: 'lease',
        price_per_sqft: Math.round(rentPerSqft * 100) / 100,
        price: Math.round(rentPerSqft * 1000), // Estimated for 1000 sqft
        tenant_name: `RVD Monthly ${currentYear}-${String(month).padStart(2, '0')}`,
        floor_area: 1000
      });
      
      transactionCount++;
    }
    
    // Batch insert every 100 records
    if (transactions.length >= 100) {
      const { error } = await supabase.from('transactions').insert(transactions);
      if (error) {
        console.error(`Insert error at row ${i}:`, error.message);
      } else {
        process.stdout.write(`\r✅ Imported ${transactionCount} transactions (${rowCount} rows processed)`);
      }
      transactions.length = 0;
    }
  }
  
  // Insert remaining transactions
  if (transactions.length > 0) {
    const { error } = await supabase.from('transactions').insert(transactions);
    if (error) {
      console.error('Final insert error:', error.message);
    } else {
      process.stdout.write(`\r✅ Imported ${transactionCount} transactions (${rowCount} rows processed)`);
    }
  }
  
  console.log('');
  console.log('');
  
  // Get final count
  const { count, error: countError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'lease');
  
  if (!countError) {
    console.log(`📊 Total lease transactions in database: ${count}`);
  }
  
  console.log('');
  console.log('🎉 Monthly import completed!');
  return transactionCount;
}

// Run import if called directly
if (require.main === module) {
  importMonthlyData().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

module.exports = { importMonthlyData };
