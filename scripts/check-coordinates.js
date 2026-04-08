// Script to check property coordinates in Supabase
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ceapviibefsimpscktod.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('Error: No Supabase key found. Please set SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCoordinates() {
  console.log('=== Property Coordinates Investigation ===\n');

  // 1. Count total properties
  const { count: totalCount, error: countError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting properties:', countError);
    return;
  }

  console.log(`Total properties: ${totalCount}`);

  // 2. Count properties with coordinates
  const { count: withCoordsCount, error: coordsError } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  if (coordsError) {
    console.error('Error counting properties with coordinates:', coordsError);
    return;
  }

  console.log(`Properties WITH coordinates: ${withCoordsCount}`);
  console.log(`Properties WITHOUT coordinates: ${totalCount - withCoordsCount}`);
  console.log(`Coverage: ${((withCoordsCount / totalCount) * 100).toFixed(1)}%\n`);

  // 3. List properties that have coordinates
  console.log('=== Properties WITH coordinates ===');
  const { data: withCoords, error: withCoordsError } = await supabase
    .from('properties')
    .select('id, name, address, district, lat, lng, grade')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .limit(10);

  if (withCoordsError) {
    console.error('Error fetching properties with coordinates:', withCoordsError);
  } else {
    withCoords.forEach(p => {
      console.log(`- ${p.name} (${p.district}): lat=${p.lat}, lng=${p.lng}`);
    });
  }

  // 4. List properties WITHOUT coordinates
  console.log('\n=== Sample properties WITHOUT coordinates ===');
  const { data: withoutCoords, error: withoutCoordsError } = await supabase
    .from('properties')
    .select('id, name, address, district, grade')
    .is('lat', null)
    .is('lng', null)
    .limit(10);

  if (withoutCoordsError) {
    console.error('Error fetching properties without coordinates:', withoutCoordsError);
  } else {
    withoutCoords.forEach(p => {
      console.log(`- ${p.name} (${p.district}): ${p.address}`);
    });
  }

  // 5. Check data_type distribution
  console.log('\n=== Data Type Distribution ===');
  const { data: dataTypes, error: dataTypesError } = await supabase
    .from('properties')
    .select('data_type');

  if (dataTypesError) {
    console.error('Error fetching data types:', dataTypesError);
  } else {
    const distribution = dataTypes.reduce((acc, p) => {
      acc[p.data_type || 'null'] = (acc[p.data_type || 'null'] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(distribution).forEach(([type, count]) => {
      console.log(`- ${type}: ${count}`);
    });
  }
}

checkCoordinates().catch(console.error);
