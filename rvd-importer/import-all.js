/**
 * Master Import Script
 * Runs all RVD data importers
 */
const { importMonthlyData } = require('./import-monthly');
const { importQuarterlyData } = require('./import-quarterly');
const { importPriceData } = require('./import-prices');

async function runAllImports() {
  console.log('🚀 RVD Master Import Script');
  console.log('============================');
  console.log('Starting comprehensive data import...');
  console.log('');
  
  const results = {
    monthly: 0,
    quarterly: 0,
    prices: 0,
    errors: []
  };
  
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 1: Monthly Rent Data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.monthly = await importMonthlyData();
  } catch (err) {
    console.error('❌ Monthly import failed:', err.message);
    results.errors.push(`Monthly: ${err.message}`);
  }
  
  console.log('');
  
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 2: Quarterly Rent Data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.quarterly = await importQuarterlyData();
  } catch (err) {
    console.error('❌ Quarterly import failed:', err.message);
    results.errors.push(`Quarterly: ${err.message}`);
  }
  
  console.log('');
  
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('STEP 3: Price/Sale Data');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    results.prices = await importPriceData();
  } catch (err) {
    console.error('❌ Price import failed:', err.message);
    results.errors.push(`Prices: ${err.message}`);
  }
  
  // Final summary
  console.log('');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║           IMPORT SUMMARY REPORT                    ║');
  console.log('╠════════════════════════════════════════════════════╣');
  console.log(`║ Monthly Rent Transactions:    ${String(results.monthly).padStart(6)}             ║`);
  console.log(`║ Quarterly Rent Transactions:  ${String(results.quarterly).padStart(6)}             ║`);
  console.log(`║ Price/Sale Transactions:      ${String(results.prices).padStart(6)}             ║`);
  console.log('╠════════════════════════════════════════════════════╣');
  console.log(`║ TOTAL:                        ${String(results.monthly + results.quarterly + results.prices).padStart(6)}             ║`);
  console.log('╚════════════════════════════════════════════════════╝');
  
  if (results.errors.length > 0) {
    console.log('');
    console.log('⚠️ Errors encountered:');
    results.errors.forEach(err => console.log(`  - ${err}`));
  }
  
  return results;
}

// Run if called directly
if (require.main === module) {
  runAllImports().catch(err => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { runAllImports };
