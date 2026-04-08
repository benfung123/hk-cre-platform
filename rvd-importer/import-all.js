/**
 * Master Import Script - Phase 2 Expansion
 * Runs all RVD data importers with comprehensive reporting
 */
const { importMonthlyData } = require('./import-monthly');
const { importQuarterlyData } = require('./import-quarterly');
const { importPriceData } = require('./import-prices');
const { importRetailData } = require('./import-retail');
const { importFlattedFactoryData } = require('./import-flatted-factories');

// Supabase for verification
const { createClient } = require('@supabase/supabase-js');
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

async function getPropertyCounts() {
  if (!supabaseUrl || !supabaseKey) return null;
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // Get all properties and count manually (since .group() isn't available)
    const { data: allProperties, error: propError } = await supabase
      .from('properties')
      .select('name, grade');
    
    if (propError) return null;
    
    // Count by inferred property type
    const counts = {
      office: 0,
      retail: 0,
      flatted_factory: 0,
      total: 0
    };
    
    allProperties.forEach(p => {
      counts.total++;
      if (p.name.includes('Retail') || p.grade === 'Retail') {
        counts.retail++;
      } else if (p.name.includes('Industrial') || p.grade === 'Industrial') {
        counts.flatted_factory++;
      } else {
        counts.office++;
      }
    });
    
    // Get transaction counts by type
    const { count: leaseCount, error: leaseError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'lease');
    
    const { count: saleCount, error: saleError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'sale');
    
    return {
      byType: [
        { property_type: 'office', count: counts.office },
        { property_type: 'retail', count: counts.retail },
        { property_type: 'flatted_factory', count: counts.flatted_factory }
      ],
      transactions: {
        lease: leaseCount || 0,
        sale: saleCount || 0
      }
    };
  } catch (err) {
    console.error('Error getting counts:', err.message);
    return null;
  }
}

async function runAllImports() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║        HK CRE PLATFORM - RVD DATA IMPORT - PHASE 2             ║');
  console.log('║              Office + Retail + Industrial                      ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const startTime = Date.now();
  
  const results = {
    office: { monthly: 0, quarterly: 0, prices: 0, errors: [] },
    retail: { properties: 0, transactions: 0, errors: [] },
    industrial: { properties: 0, transactions: 0, errors: [] },
    total: { properties: 0, transactions: 0 }
  };
  
  // ============================================================
  // STEP 1: Office Monthly Data
  // ============================================================
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1/5: Office Monthly Rent Data (his_data_6.xls)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.office.monthly = await importMonthlyData();
  } catch (err) {
    console.error('❌ Monthly import failed:', err.message);
    results.office.errors.push(`Monthly: ${err.message}`);
  }
  
  console.log('');
  
  // ============================================================
  // STEP 2: Office Quarterly Data
  // ============================================================
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2/5: Office Quarterly Rent Data (his_data_6.xls)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.office.quarterly = await importQuarterlyData();
  } catch (err) {
    console.error('❌ Quarterly import failed:', err.message);
    results.office.errors.push(`Quarterly: ${err.message}`);
  }
  
  console.log('');
  
  // ============================================================
  // STEP 3: Office Price Data
  // ============================================================
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3/5: Office Sale/Price Data (his_data_7.xls)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.office.prices = await importPriceData();
  } catch (err) {
    console.error('❌ Price import failed:', err.message);
    results.office.errors.push(`Prices: ${err.message}`);
  }
  
  console.log('');
  
  // ============================================================
  // STEP 4: Retail Data
  // ============================================================
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 4/5: Retail Data (Synthetic - Market-based patterns)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const retailResult = await importRetailData();
    results.retail.properties = retailResult.propertiesCreated;
    results.retail.transactions = retailResult.transactionsImported;
  } catch (err) {
    console.error('❌ Retail import failed:', err.message);
    results.retail.errors.push(err.message);
  }
  
  console.log('');
  
  // ============================================================
  // STEP 5: Industrial/Flatted Factory Data
  // ============================================================
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 5/5: Industrial/Flatted Factory Data (Synthetic)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    const industrialResult = await importFlattedFactoryData();
    results.industrial.properties = industrialResult.propertiesCreated;
    results.industrial.transactions = industrialResult.transactionsImported;
  } catch (err) {
    console.error('❌ Industrial import failed:', err.message);
    results.industrial.errors.push(err.message);
  }
  
  console.log('');
  
  // ============================================================
  // FINAL SUMMARY
  // ============================================================
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(1);
  
  const counts = await getPropertyCounts();
  
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    IMPORT SUMMARY REPORT                       ║');
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║ OFFICE DATA                                                    ║');
  console.log(`║   Monthly Transactions:    ${String(results.office.monthly).padStart(6)}                          ║`);
  console.log(`║   Quarterly Transactions:  ${String(results.office.quarterly).padStart(6)}                          ║`);
  console.log(`║   Sale Transactions:       ${String(results.office.prices).padStart(6)}                          ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║ RETAIL DATA                                                    ║');
  console.log(`║   Properties Created:      ${String(results.retail.properties).padStart(6)}                          ║`);
  console.log(`║   Transactions Imported:   ${String(results.retail.transactions).padStart(6)}                          ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║ INDUSTRIAL DATA                                                ║');
  console.log(`║   Properties Created:      ${String(results.industrial.properties).padStart(6)}                          ║`);
  console.log(`║   Transactions Imported:   ${String(results.industrial.transactions).padStart(6)}                          ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log('║ TOTALS                                                         ║');
  const officeTotal = results.office.monthly + results.office.quarterly + results.office.prices;
  const retailTotal = results.retail.transactions;
  const industrialTotal = results.industrial.transactions;
  const grandTotal = officeTotal + retailTotal + industrialTotal;
  
  console.log(`║   Office Transactions:     ${String(officeTotal).padStart(6)}                          ║`);
  console.log(`║   Retail Transactions:     ${String(retailTotal).padStart(6)}                          ║`);
  console.log(`║   Industrial Transactions: ${String(industrialTotal).padStart(6)}                          ║`);
  console.log('╠════════════════════════════════════════════════════════════════╣');
  console.log(`║   GRAND TOTAL:            ${String(grandTotal).padStart(6)}                          ║`);
  console.log(`║   Duration:                ${String(duration + 's').padStart(6)}                          ║`);
  console.log('╚════════════════════════════════════════════════════════════════╝');
  
  // Database verification
  if (counts) {
    console.log('');
    console.log('📊 Database Verification');
    console.log('========================');
    console.log('Properties by Type:');
    counts.byType.forEach(tc => {
      const icon = tc.property_type === 'office' ? '🏢' :
                   tc.property_type === 'retail' ? '🛍️' :
                   tc.property_type === 'flatted_factory' ? '🏭' : '🏠';
      console.log(`   ${icon} ${tc.property_type}: ${tc.count}`);
    });
    
    console.log('');
    console.log('Transactions:');
    console.log(`   📄 Lease: ${counts.transactions.lease}`);
    console.log(`   💰 Sale:  ${counts.transactions.sale}`);
    console.log(`   📊 Total: ${counts.transactions.lease + counts.transactions.sale}`);
  }
  
  // Error summary
  const allErrors = [
    ...results.office.errors.map(e => `Office: ${e}`),
    ...results.retail.errors.map(e => `Retail: ${e}`),
    ...results.industrial.errors.map(e => `Industrial: ${e}`)
  ];
  
  if (allErrors.length > 0) {
    console.log('');
    console.log('⚠️  Errors encountered:');
    allErrors.forEach(err => console.log(`   - ${err}`));
  }
  
  console.log('');
  console.log('🎉 Phase 2 Import Complete!');
  
  return {
    ...results,
    counts,
    duration: parseFloat(duration)
  };
}

// Run if called directly
if (require.main === module) {
  runAllImports().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runAllImports };
