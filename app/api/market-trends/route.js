/**
 * Market Trends API Endpoint
 * GET /api/market-trends
 * 
 * Query Parameters:
 * - district: Filter by district name (optional)
 * - grade: Filter by grade A/B/C (optional)
 * - startDate: Start date (YYYY-MM-DD) (optional)
 * - endDate: End date (YYYY-MM-DD) (optional)
 * - periodType: monthly/quarterly/yearly (optional)
 * - propertyType: office/retail/industrial (optional, default: office)
 * - limit: Maximum records to return (default: 1000)
 * - orderBy: Field to order by (default: date)
 * - order: asc/desc (default: desc)
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const district = searchParams.get('district');
    const grade = searchParams.get('grade');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const periodType = searchParams.get('periodType');
    const propertyType = searchParams.get('propertyType') || 'office';
    const limit = parseInt(searchParams.get('limit') || '1000');
    const orderBy = searchParams.get('orderBy') || 'date';
    const order = searchParams.get('order') || 'desc';
    
    // Build query
    let query = supabase
      .from('market_trends')
      .select('*')
      .eq('property_type', propertyType)
      .order(orderBy, { ascending: order === 'asc' })
      .limit(limit);
    
    // Apply filters
    if (district) {
      query = query.eq('district', district);
    }
    
    if (grade) {
      query = query.eq('grade', grade.toUpperCase());
    }
    
    if (periodType) {
      query = query.eq('period_type', periodType.toLowerCase());
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      console.error('Supabase error:', error);
      return Response.json(
        { error: 'Database error', details: error.message },
        { status: 500 }
      );
    }
    
    // Get summary statistics
    const summary = {
      totalRecords: data.length,
      districts: [...new Set(data.map(d => d.district))].sort(),
      grades: [...new Set(data.map(d => d.grade))].sort(),
      periodTypes: [...new Set(data.map(d => d.period_type))].sort(),
      dateRange: data.length > 0 ? {
        start: data[data.length - 1]?.date,
        end: data[0]?.date
      } : null
    };
    
    return Response.json({
      success: true,
      summary,
      data
    });
    
  } catch (err) {
    console.error('API error:', err);
    return Response.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}
