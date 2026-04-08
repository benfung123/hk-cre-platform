import { createClient } from '@/lib/supabase/server'
import { getProperties, getDistricts, getGradeDistribution } from '@/lib/data'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test') || 'all'
  
  // Test different queries
  const results: Record<string, any> = {}
  
  if (test === 'all' || test === 'direct') {
    const supabase = await createClient()
    
    // 1. Total count
    const { count: totalCount, error: totalError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
    
    results.directTotal = { count: totalCount, error: totalError?.message }
    
    // 2. All properties (like homepage)
    const { data: allData, error: allError } = await supabase
      .from('properties')
      .select('id, name, district, grade')
      .order('name')
    
    results.directAll = { 
      count: allData?.length, 
      error: allError?.message
    }
  }
  
  if (test === 'all' || test === 'lib') {
    // Test getProperties (like homepage - no filters)
    try {
      const allProps = await getProperties()
      results.libNoFilters = { count: allProps.length }
    } catch (e: any) {
      results.libNoFilters = { error: e.message }
    }
    
    // Test getProperties with empty filters (like properties page)
    try {
      const filteredProps = await getProperties({
        district: undefined,
        grade: undefined,
        search: undefined
      })
      results.libEmptyFilters = { count: filteredProps.length }
    } catch (e: any) {
      results.libEmptyFilters = { error: e.message }
    }
    
    // Test getDistricts
    try {
      const districts = await getDistricts()
      results.libDistricts = { count: districts.length, districts }
    } catch (e: any) {
      results.libDistricts = { error: e.message }
    }
    
    // Test getGradeDistribution
    try {
      const grades = await getGradeDistribution()
      results.libGrades = { count: grades.length, grades }
    } catch (e: any) {
      results.libGrades = { error: e.message }
    }
  }
  
  // Test specific filters
  if (test === 'filters') {
    const testCases = [
      { name: 'district=Central', filters: { district: 'Central' } },
      { name: 'grade=A+', filters: { grade: 'A+' } },
      { name: 'district=Central&grade=A+', filters: { district: 'Central', grade: 'A+' } },
    ]
    
    results.filterTests = []
    for (const tc of testCases) {
      try {
        const props = await getProperties(tc.filters as any)
        results.filterTests.push({ name: tc.name, count: props.length })
      } catch (e: any) {
        results.filterTests.push({ name: tc.name, error: e.message })
      }
    }
  }
  
  return Response.json(results)
}
