/**
 * RVD Quarterly Data Importer
 * Imports quarterly rental data from his_data_6.xls with all 3 grades (A, B, C)
 */
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const path = require('path');

// Load configuration
const { QUARTERLY_COLUMNS } = require('./config/districts');

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

/**
 * Extract numeric value from cell
 */
function extractValue(cell) {
  if (cell === undefined || cell === null) return null;
  if (typeof cell === 'number') return cell;
  if (typeof cell !== 'string') return null;
  
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
 * Import quarterly data from a specific sheet
 */
async function importQuarterlySheet(wb, sheetName, startYear) {
  console.log(`\n📖 Processing sheet: ${sheetName}`);
  
  const ws = wb.Sheets[sheetName];
  if (!ws) {
    console.log(`⚠️ Sheet "${sheetName}" not found, skipping`);
    return 0;
  }
  
  const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
  console.log(`   Found ${data.length} rows`);
  
  // Determine available columns based on data width
  const maxCol = Math.max(...data.map(row => row?.length || 0));
  console.log(`   Max columns: ${maxCol}`);
  
  // Build column list dynamically based on available data
  const allColumns = [];
  
  // Always add Grade A columns
  for (const col of QUARTERLY_COLUMNS.gradeA) {
    if (col.col < maxCol) {
      allColumns.push({ ...col, grade: 'A' });
    }
  }
  
  // Add Grade B if columns exist
  for (const col of QUARTERLY_COLUMNS.gradeB) {
    if (col.col < maxCol) {
      allColumns.push({ ...col, grade: 'B' });
    }
  }
  
  // Add Grade C if columns exist
  for (const col of QUARTERLY_COLUMNS.gradeC) {
    if (col.col < maxCol) {
      allColumns.push({ ...col, grade: 'C' });
    }
  }
  
  console.log(`   Processing ${allColumns.length} district-grade combinations`);
  console.log(`   Grade A: ${QUARTERLY_COLUMNS.gradeA.filter(c => c.col < maxCol).length} districts`);
  console.log(`   Grade B: ${QUARTERLY_COLUMNS.gradeB.filter(c => c.col < maxCol).length} districts`);
  console.log(`   Grade C: ${QUARTERLY_COLUMNS.gradeC.filter(c => c.col < maxCol).length} districts`);
  
  // Build property map
  const propertyMap = {};
  for (const { district, grade } of allColumns) {
    const propertyId = await getOrCreateProperty(district, grade);
    if (propertyId) {
      propertyMap[`${district}-${grade}`] = propertyId;
    }
  }
  
  console.log(`   ✅ ${Object.keys(propertyMap).length} properties ready`);
  
  // Parse data rows
  const transactions = [];
  let currentYear = startYear;
  let rowCount = 0;
  let transactionCount = 0;
  
  // Data starts from row 12 (0-indexed: 11)
  for (let i = 11; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    rowCount++;
    
    // Check for year in column 1
    if (typeof row[1] === 'number' && row[1] >= 1980 && row[1] <= 2030) {
      currentYear = row[1];
    }
    
    // Parse quarter from columns 3-5
    let quarter = null;
    if (row[3] && row[4] && row[5]) {
      const qStart = row[3]?.toString().trim();
      const qEnd = row[5]?.toString().trim();
      if (qStart && qEnd) {
        quarter = `${qStart}-${qEnd}`;
      }
    }
    
    if (!quarter || !quarter.includes('-')) continue;
    
    // Map quarter to month for date
    const monthMap = { '1-3': '02', '4-6': '05', '7-9': '08', '10-12': '11' };
    const month = monthMap[quarter];
    if (!month) continue;
    
    const date = `${currentYear}-${month}-15`;
    
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
        price: Math.round(rentPerSqft * 1000),
        tenant_name: `RVD Q${quarter}/${currentYear}`,
        floor_area: 1000
      });
      
      transactionCount++;
    }
    
    // Batch insert every 100 records
    if (transactions.length >= 100) {
      const { error } = await supabase.from('transactions').insert(transactions);
      if (error) {
        console.error(`   Insert error at row ${i}:`, error.message);
      } else {
        process.stdout.write(`\r   ✅ Imported ${transactionCount} transactions (${rowCount} rows processed)`);
      }
      transactions.length = 0;
    }
  }
  
  // Insert remaining transactions
  if (transactions.length > 0) {
    const { error } = await supabase.from('transactions').insert(transactions);
    if (error) {
      console.error('   Final insert error:', error.message);
    } else {
      process.stdout.write(`\r   ✅ Imported ${transactionCount} transactions (${rowCount} rows processed)`);
    }
  }
  
  console.log('');
  return transactionCount;
}

/**
 * Import quarterly rent data from all sheets
 */
async function importQuarterlyData() {
  console.log('📊 RVD Quarterly Data Importer');
  console.log('===============================');
  console.log(`Data file: ${DATA_FILE}`);
  console.log('');
  
  // Read Excel file
  console.log('📖 Reading Excel file...');
  const wb = xlsx.readFile(DATA_FILE);
  console.log(`✅ Found sheets: ${wb.SheetNames.join(', ')}`);
  console.log('');
  
  let totalTransactions = 0;
  
  // Import from each quarterly sheet
  // Sheet: Quarterly(82-98) - Data from 1982-1998
  totalTransactions += await importQuarterlySheet(wb, 'Quarterly(82-98)  按季(82-98)', 1982);
  
  // Sheet: Quarterly(from 99) - Data from 1999 onwards
  totalTransactions += await importQuarterlySheet(wb, 'Quarterly(from 99)  按季(自99年起)', 1999);
  
  console.log('');
  console.log('📊 Import Summary');
  console.log('=================');
  console.log(`Total transactions imported: ${totalTransactions}`);
  
  // Get final count
  const { count, error: countError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'lease');
  
  if (!countError) {
    console.log(`Total lease transactions in database: ${count}`);
  }
  
  // Count properties
  const { count: propertyCount, error: propError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });
  
  if (!propError) {
    console.log(`Total properties in database: ${propertyCount}`);
  }
  
  console.log('');
  console.log('🎉 Quarterly import completed!');
  return totalTransactions;
}

// Run import if called directly
if (require.main === module) {
  importQuarterlyData().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

module.exports = { importQuarterlyData };
