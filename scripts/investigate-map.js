// Detailed investigation script for map display issue
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ceapviibefsimpscktod.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Error: No Supabase key found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigate() {
  console.log('=== MAP DISPLAY ISSUE INVESTIGATION ===\n');

  // 1. Get ALL properties with full details
  const { data: allProperties, error } = await supabase
    .from('properties')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching properties:', error);
    return;
  }

  console.log(`Total properties in database: ${allProperties.length}\n`);

  // 2. Check coordinate status for each property
  let withCoords = 0;
  let withoutCoords = 0;
  let zeroCoords = 0;
  let nullCoords = 0;
  const propertiesWithoutCoords = [];
  const propertiesWithZeroCoords = [];

  allProperties.forEach(p => {
    const hasValidLat = p.lat !== null && p.lat !== undefined && p.lat !== 0;
    const hasValidLng = p.lng !== null && p.lng !== undefined && p.lng !== 0;
    
    if (hasValidLat && hasValidLng) {
      withCoords++;
    } else {
      withoutCoords++;
      if (p.lat === 0 || p.lng === 0) {
        zeroCoords++;
        propertiesWithZeroCoords.push(p);
      } else if (p.lat === null || p.lng === null || p.lat === undefined || p.lng === undefined) {
        nullCoords++;
        propertiesWithoutCoords.push(p);
      }
    }
  });

  console.log('=== COORDINATE ANALYSIS ===');
  console.log(`✓ Properties with VALID coordinates: ${withCoords}`);
  console.log(`✗ Properties WITHOUT valid coordinates: ${withoutCoords}`);
  console.log(`  - With NULL coordinates: ${nullCoords}`);
  console.log(`  - With ZERO coordinates: ${zeroCoords}`);
  console.log(`  - Coverage: ${((withCoords / allProperties.length) * 100).toFixed(1)}%\n`);

  // 3. List properties with zero/null coordinates
  if (propertiesWithZeroCoords.length > 0) {
    console.log('=== Properties with ZERO coordinates (need geocoding) ===');
    propertiesWithZeroCoords.slice(0, 20).forEach(p => {
      console.log(`- ${p.name} (${p.district}): lat=${p.lat}, lng=${p.lng}`);
      console.log(`  Address: ${p.address}`);
    });
    console.log('');
  }

  if (propertiesWithoutCoords.length > 0) {
    console.log('=== Properties with NULL coordinates (need geocoding) ===');
    propertiesWithoutCoords.slice(0, 20).forEach(p => {
      console.log(`- ${p.name} (${p.district}): lat=${p.lat}, lng=${p.lng}`);
      console.log(`  Address: ${p.address}`);
    });
    console.log('');
  }

  // 4. Sample of valid coordinates
  console.log('=== Sample properties with VALID coordinates ===');
  allProperties
    .filter(p => p.lat && p.lng && p.lat !== 0 && p.lng !== 0)
    .slice(0, 10)
    .forEach(p => {
      console.log(`- ${p.name} (${p.district}): lat=${p.lat}, lng=${p.lng}`);
    });
  console.log('');

  // 5. District distribution of properties needing geocoding
  const districtNeedGeocoding = {};
  [...propertiesWithoutCoords, ...propertiesWithZeroCoords].forEach(p => {
    districtNeedGeocoding[p.district] = (districtNeedGeocoding[p.district] || 0) + 1;
  });

  console.log('=== Properties needing geocoding by district ===');
  Object.entries(districtNeedGeocoding)
    .sort((a, b) => b[1] - a[1])
    .forEach(([district, count]) => {
      console.log(`- ${district}: ${count}`);
    });
  console.log('');

  // 6. Check for data that would be filtered out
  const aggregateProperties = allProperties.filter(p => 
    p.name?.includes('Grade') && p.name?.includes('Office')
  );
  console.log(`=== Aggregate properties (filtered from districts list): ${aggregateProperties.length} ===`);
  aggregateProperties.forEach(p => {
    console.log(`- ${p.name}`);
  });

  // Summary for Map component
  console.log('\n=== MAP COMPONENT ANALYSIS ===');
  console.log(`Properties passed to map: ${allProperties.length}`);
  console.log(`Properties that will show markers: ${withCoords}`);
  console.log(`Properties filtered out (no valid coords): ${withoutCoords}`);
}

investigate().catch(console.error);
