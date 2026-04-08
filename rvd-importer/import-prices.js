/**
 * RVD Price Data Importer (Fixed)
 * Imports sale/price data from his_data_7.xls
 * Fixed to handle actual file structure
 */
const { createClient } = require('@supabase/supabase-js');
const xlsx = require('xlsx');
const path = require('path');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Constants
const SQM_TO_SQFT = 10.764;
const DATA_FILE = path.join(__dirname, 'data', 'his_data_7.xls');

// Price column mappings based on actual his_data_7.xls structure
// Each grade section has: Sheung Wan (Wan), Central, Causeway Bay, Quarry Bay, Tsim Sha Tsui, Mong Kok, Kwun Tong
const PRICE_COLUMN_MAP = {
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
    { col: 30, district: 'Sheung Wan' },
    { col: 33, district: 'Central' },
    { col: 36, district: 'Causeway Bay' },
    { col: 39, district: 'Quarry Bay' },
    { col: 42, district: 'Tsim Sha Tsui' },
    { col: 45, district: 'Mong Kok' },
    { col: 48, district: 'Kwun Tong' },
  ],
  gradeC: [
    { col: 52, district: 'Sheung Wan' },
    { col: 55, district: 'Central' },
    { col: 58, district: 'Causeway Bay' },
    { col: 61, district: 'Quarry Bay' },
    { col: 64, district: 'Tsim Sha Tsui' },
    { col: 67, district: 'Mong Kok' },
    { col: 70, district: 'Kwun Tong' },
  ],
};

/**
 * Extract numeric value from cell - handles parentheses, spaces, and n/a
 */
function extractValue(cell) {
  if (cell === undefined || cell === null) return null;
  if (typeof cell === 'number') return cell;
  if (typeof cell !== 'string') return null;
  
  // Skip n/a values
  if (cell.toLowerCase().includes('n/a')) return null;
  
  // Remove parentheses, spaces, and other non-numeric characters except decimal point
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
        property_type: 'office',
        grade,
        data_type: 'aggregate',
        data_source: 'RVD',
        data_quality_score: 4,
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
 * Import price data from a specific sheet
 */
async function importPriceSheet(wb, sheetName, startYear, isQuarterly = true) {
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
  
  // Build column list dynamically
  const allColumns = [];
  
  // Add Grade A columns if they exist
  for (const col of PRICE_COLUMN_MAP.gradeA) {
    if (col.col < maxCol) {
      allColumns.push({ ...col, grade: 'A' });
    }
  }
  
  // Add Grade B columns if they exist
  for (const col of PRICE_COLUMN_MAP.gradeB) {
    if (col.col < maxCol) {
      allColumns.push({ ...col, grade: 'B' });
    }
  }
  
  // Add Grade C columns if they exist
  for (const col of PRICE_COLUMN_MAP.gradeC) {
    if (col.col < maxCol) {
      allColumns.push({ ...col, grade: 'C' });
    }
  }
  
  console.log(`   Processing ${allColumns.length} district-grade combinations`);
  console.log(`   Grade A: ${PRICE_COLUMN_MAP.gradeA.filter(c => c.col < maxCol).length} districts`);
  console.log(`   Grade B: ${PRICE_COLUMN_MAP.gradeB.filter(c => c.col < maxCol).length} districts`);
  console.log(`   Grade C: ${PRICE_COLUMN_MAP.gradeC.filter(c => c.col < maxCol).length} districts`);
  
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
  let skippedEmpty = 0;
  let skippedInvalid = 0;
  
  // Find data start row - look for year header
  let dataStartRow = 11;
  for (let i = 0; i < Math.min(data.length, 20); i++) {
    const row = data[i];
    if (row && (row[1] === 'Year' || row[1] === '年' || row[1] === 1999 || row[1] === 1982)) {
      dataStartRow = i + 1;
      break;
    }
  }
  
  console.log(`   Data starts at row ${dataStartRow}`);
  
  for (let i = dataStartRow; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length === 0) continue;
    
    rowCount++;
    
    // Check for year in column 1
    if (typeof row[1] === 'number' && row[1] >= 1980 && row[1] <= 2030) {
      currentYear = row[1];
    }
    
    let date;
    let periodLabel;
    
    if (isQuarterly) {
      // Parse quarter from columns
      let quarter = null;
      if (row[3] && row[4] && row[5]) {
        const qStart = row[3]?.toString().trim();
        const qEnd = row[5]?.toString().trim();
        if (qStart && qEnd) {
          quarter = `${qStart}-${qEnd}`;
        }
      }
      
      if (!quarter || !quarter.includes('-')) {
        skippedEmpty++;
        continue;
      }
      
      const monthMap = { '1-3': '02', '4-6': '05', '7-9': '08', '10-12': '11' };
      const month = monthMap[quarter];
      if (!month) {
        skippedInvalid++;
        continue;
      }
      
      date = `${currentYear}-${month}-15`;
      periodLabel = `Q${quarter}/${currentYear}`;
    } else {
      // Annual data
      date = `${currentYear}-06-30`;
      periodLabel = `${currentYear}`;
    }
    
    // Process each district
    for (const { col, district, grade } of allColumns) {
      const priceValue = extractValue(row[col]);
      if (!priceValue || priceValue <= 0) {
        continue;
      }
      
      const propertyId = propertyMap[`${district}-${grade}`];
      if (!propertyId) continue;
      
      // Convert from $/sqm to $/sqft
      const pricePerSqft = priceValue / SQM_TO_SQFT;
      
      transactions.push({
        property_id: propertyId,
        date: date,
        type: 'sale',
        price_per_sqft: Math.round(pricePerSqft * 100) / 100,
        price: Math.round(pricePerSqft * 1000),
        tenant_name: `RVD Sale ${periodLabel}`,
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
        process.stdout.write(`\r   ✅ Imported ${transactionCount} price records (${rowCount} rows processed)`);
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
      process.stdout.write(`\r   ✅ Imported ${transactionCount} price records (${rowCount} rows processed)`);
    }
  }
  
  console.log('');
  if (skippedEmpty > 0) console.log(`   ℹ️ Skipped ${skippedEmpty} empty rows`);
  if (skippedInvalid > 0) console.log(`   ℹ️ Skipped ${skippedInvalid} invalid quarter rows`);
  
  return transactionCount;
}

/**
 * Import price data from all sheets
 */
async function importPriceData() {
  console.log('💰 RVD Price Data Importer (Fixed)');
  console.log('====================================');
  console.log(`Data file: ${DATA_FILE}`);
  console.log('');
  
  // Read Excel file
  console.log('📖 Reading Excel file...');
  const wb = xlsx.readFile(DATA_FILE);
  console.log(`✅ Found sheets: ${wb.SheetNames.join(', ')}`);
  console.log('');
  
  let totalTransactions = 0;
  
  // Import from each sheet
  // Monthly sheet
  totalTransactions += await importPriceSheet(wb, 'Monthly  按月', 1999, false);
  
  // Quarterly sheets
  totalTransactions += await importPriceSheet(wb, 'Quarterly(82-98)  按季(82-98)', 1982, true);
  totalTransactions += await importPriceSheet(wb, 'Quarterly(from 99)  按季(自99年起)', 1999, true);
  
  // Annual sheets
  totalTransactions += await importPriceSheet(wb, 'Annual(86-98)  按年(86-98)', 1986, false);
  totalTransactions += await importPriceSheet(wb, 'Annual(from 99)  按年(自99年起)', 1999, false);
  
  console.log('');
  console.log('📊 Import Summary');
  console.log('=================');
  console.log(`Total price transactions imported: ${totalTransactions}`);
  
  // Get final count
  const { count, error: countError } = await supabase
    .from('transactions')
    .select('*', { count: 'exact', head: true })
    .eq('type', 'sale');
  
  if (!countError) {
    console.log(`Total sale transactions in database: ${count}`);
  }
  
  // Count properties by type
  const { data: typeCounts, error: typeError } = await supabase
    .from('properties')
    .select('property_type, count(*)')
    .group('property_type');
  
  if (!typeError && typeCounts) {
    console.log('\n📊 Properties by type:');
    typeCounts.forEach(tc => {
      console.log(`   ${tc.property_type}: ${tc.count}`);
    });
  }
  
  console.log('');
  console.log('🎉 Price import completed!');
  return totalTransactions;
}

// Run import if called directly
if (require.main === module) {
  importPriceData().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
}

module.exports = { importPriceData };
