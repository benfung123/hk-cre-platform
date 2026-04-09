import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface GradeDistribution {
  grade: string
  count: number
  avgRent: number
  avgPrice: number
}

interface DistrictSummary {
  district: string
  count: number
  avgRent: number
  avgPrice: number
}

interface AnalyticsOverview {
  totalProperties: number
  avgRent: number
  avgPrice: number
  totalTransactions: number
  gradeDistribution: GradeDistribution[]
  districtSummary: DistrictSummary[]
}

export async function GET() {
  try {
    const supabase = await createClient()

    // Get total properties count (excluding aggregate data)
    const { count: totalProperties, error: countError } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .not('name', 'ilike', '%Grade%A%Office%')
      .not('name', 'ilike', '%Grade%B%Office%')
      .not('name', 'ilike', '%Grade%C%Office%')

    if (countError) {
      console.error('Error fetching property count:', countError)
      return NextResponse.json(
        { error: 'Failed to fetch property count' },
        { status: 500 }
      )
    }

    // Get all transactions for calculating averages
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    // Calculate average rent (from lease transactions)
    const leaseTransactions = transactions?.filter(t => t.type === 'lease') || []
    const avgRent = leaseTransactions.length > 0
      ? Math.round(leaseTransactions.reduce((sum, t) => sum + (t.price_per_sqft || 0), 0) / leaseTransactions.length)
      : 0

    // Calculate average price (from all transactions)
    const avgPrice = transactions && transactions.length > 0
      ? Math.round(transactions.reduce((sum, t) => sum + (t.price_per_sqft || 0), 0) / transactions.length)
      : 0

    const totalTransactions = transactions?.length || 0

    // Get grade distribution with averages
    const { data: gradeData, error: gradeError } = await supabase
      .from('properties')
      .select('grade, id')
      .not('grade', 'is', null)
      .not('name', 'ilike', '%Shop%')
      .not('name', 'ilike', '%Retail%')
      .not('name', 'ilike', '%Flatted Factory%')
      .not('name', 'ilike', '%Industrial%')
      .not('name', 'ilike', '%Logistics%')

    if (gradeError) {
      console.error('Error fetching grade data:', gradeError)
      return NextResponse.json(
        { error: 'Failed to fetch grade data' },
        { status: 500 }
      )
    }

    // Get transactions for grade calculation
    const { data: allTransactions, error: allTransError } = await supabase
      .from('transactions')
      .select('property_id, price_per_sqft, type')

    if (allTransError) {
      console.error('Error fetching all transactions:', allTransError)
      return NextResponse.json(
        { error: 'Failed to fetch transactions for grades' },
        { status: 500 }
      )
    }

    // Build grade distribution with averages
    const gradeMap = new Map<string, { 
      count: number
      rents: number[]
      prices: number[]
    }>()

    gradeData?.forEach(property => {
      const grade = property.grade || 'Unknown'
      if (!gradeMap.has(grade)) {
        gradeMap.set(grade, { count: 0, rents: [], prices: [] })
      }
      const gradeInfo = gradeMap.get(grade)!
      gradeInfo.count++
      
      // Find transactions for this property
      const propertyTransactions = allTransactions?.filter(t => t.property_id === property.id) || []
      propertyTransactions.forEach(t => {
        if (t.price_per_sqft) {
          gradeInfo.prices.push(t.price_per_sqft)
          if (t.type === 'lease') {
            gradeInfo.rents.push(t.price_per_sqft)
          }
        }
      })
    })

    const gradeDistribution: GradeDistribution[] = Array.from(gradeMap.entries())
      .map(([grade, data]) => ({
        grade,
        count: data.count,
        avgRent: data.rents.length > 0 
          ? Math.round(data.rents.reduce((a, b) => a + b, 0) / data.rents.length)
          : 0,
        avgPrice: data.prices.length > 0
          ? Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length)
          : 0
      }))
      .sort((a, b) => {
        const gradeOrder = ['A+', 'A', 'B', 'C']
        const indexA = gradeOrder.indexOf(a.grade)
        const indexB = gradeOrder.indexOf(b.grade)
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return a.grade.localeCompare(b.grade)
      })

    // Get district summary
    const { data: districtData, error: districtError } = await supabase
      .from('properties')
      .select('district, id')
      .not('name', 'ilike', '%Grade%A%Office%')
      .not('name', 'ilike', '%Grade%B%Office%')
      .not('name', 'ilike', '%Grade%C%Office%')

    if (districtError) {
      console.error('Error fetching district data:', districtError)
      return NextResponse.json(
        { error: 'Failed to fetch district data' },
        { status: 500 }
      )
    }

    // Build district summary
    const districtMap = new Map<string, {
      count: number
      rents: number[]
      prices: number[]
    }>()

    districtData?.forEach(property => {
      const district = property.district
      if (!districtMap.has(district)) {
        districtMap.set(district, { count: 0, rents: [], prices: [] })
      }
      const districtInfo = districtMap.get(district)!
      districtInfo.count++
      
      // Find transactions for this property
      const propertyTransactions = allTransactions?.filter(t => t.property_id === property.id) || []
      propertyTransactions.forEach(t => {
        if (t.price_per_sqft) {
          districtInfo.prices.push(t.price_per_sqft)
          if (t.type === 'lease') {
            districtInfo.rents.push(t.price_per_sqft)
          }
        }
      })
    })

    const districtSummary: DistrictSummary[] = Array.from(districtMap.entries())
      .map(([district, data]) => ({
        district,
        count: data.count,
        avgRent: data.rents.length > 0
          ? Math.round(data.rents.reduce((a, b) => a + b, 0) / data.rents.length)
          : 0,
        avgPrice: data.prices.length > 0
          ? Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length)
          : 0
      }))
      .sort((a, b) => b.count - a.count)

    const response: AnalyticsOverview = {
      totalProperties: totalProperties || 0,
      avgRent,
      avgPrice,
      totalTransactions,
      gradeDistribution,
      districtSummary
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
