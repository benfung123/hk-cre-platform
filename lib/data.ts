import { createClient } from '@/lib/supabase/server'
import type { Property, Transaction, Tenancy, MarketStats, DistrictStats } from '@/types'

export async function getProperties(filters?: {
  district?: string
  grade?: string
  search?: string
  includeAggregates?: boolean
}): Promise<Property[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('properties')
    .select('*')
    .order('name')

  // Note: data_type filter temporarily disabled - column needs to be added to DB
  // if (!filters?.includeAggregates) {
  //   query = query.or('data_type.eq.individual,data_type.is.null')
  // }

  if (filters?.district) {
    query = query.eq('district', filters.district)
  }

  if (filters?.grade) {
    query = query.eq('grade', filters.grade)
    // Grades only apply to office buildings - exclude retail/industrial
    query = query
      .not('name', 'ilike', '%Shop%')
      .not('name', 'ilike', '%Retail%')
      .not('name', 'ilike', '%Flatted Factory%')
      .not('name', 'ilike', '%Industrial%')
      .not('name', 'ilike', '%Logistics%')
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching properties:', error)
    throw new Error('Failed to fetch properties')
  }

  return data || []
}

export async function getGradeDistribution(): Promise<{ grade: string; count: number }[]> {
  const supabase = await createClient()
  
  // Only count office properties for grade distribution
  // Grades (A+, A, B, C) only apply to office buildings, not retail or industrial
  const { data, error } = await supabase
    .from('properties')
    .select('grade, name')
    .not('name', 'ilike', '%Shop%')
    .not('name', 'ilike', '%Retail%')
    .not('name', 'ilike', '%Flatted Factory%')
    .not('name', 'ilike', '%Industrial%')
    .not('name', 'ilike', '%Logistics%')

  if (error) {
    console.error('Error fetching grade distribution:', error)
    return []
  }

  const distribution = data?.reduce((acc, curr) => {
    const grade = curr.grade || 'Unknown'
    acc[grade] = (acc[grade] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(distribution || {})
    .map(([grade, count]) => ({ grade, count }))
    .sort((a, b) => b.count - a.count)
}

export async function getPropertyById(id: string): Promise<Property | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching property:', error)
    return null
  }

  return data
}

export async function getPropertyTransactions(propertyId: string): Promise<Transaction[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('property_id', propertyId)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

export async function getPropertySales(propertyId: string): Promise<Transaction[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('property_id', propertyId)
    .eq('type', 'sale')
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching sales:', error)
    return []
  }

  return data || []
}

export async function getPropertyTenancies(propertyId: string): Promise<Tenancy[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('tenancies')
    .select('*')
    .eq('property_id', propertyId)
    .order('lease_start', { ascending: false })

  if (error) {
    console.error('Error fetching tenancies:', error)
    return []
  }

  return data || []
}

export async function getDistricts(): Promise<string[]> {
  const supabase = await createClient()

  // Filter out aggregate properties (RVD grouped data with "Grade X Office" in name)
  const { data, error } = await supabase
    .from('properties')
    .select('district')
    .not('name', 'ilike', '%Grade%A%Office%')
    .not('name', 'ilike', '%Grade%B%Office%')
    .not('name', 'ilike', '%Grade%C%Office%')

  if (error) {
    console.error('Error fetching districts:', error)
    return []
  }

  const districts = [...new Set(data?.map(p => p.district))].sort()
  return districts
}

export async function getMarketStats(): Promise<MarketStats> {
  const supabase = await createClient()
  
  const [{ count: totalProperties }, { data: transactions }] = await Promise.all([
    supabase.from('properties').select('*', { count: 'exact', head: true }),
    supabase.from('transactions').select('price_per_sqft, type')
  ])

  const leaseTransactions = transactions?.filter(t => t.type === 'lease') || []
  const avgRentPerSqft = leaseTransactions.length > 0
    ? leaseTransactions.reduce((sum, t) => sum + (t.price_per_sqft || 0), 0) / leaseTransactions.length
    : 0

  const avgPricePerSqft = transactions && transactions.length > 0
    ? transactions.reduce((sum, t) => sum + (t.price_per_sqft || 0), 0) / transactions.length
    : 0

  return {
    totalProperties: totalProperties || 0,
    avgRentPerSqft: Math.round(avgRentPerSqft),
    totalTransactions: transactions?.length || 0,
    avgPricePerSqft: Math.round(avgPricePerSqft)
  }
}

export async function getDistrictStats(): Promise<DistrictStats[]> {
  const supabase = await createClient()
  
  const { data: properties, error } = await supabase
    .from('properties')
    .select(`
      district,
      transactions:transactions(price_per_sqft)
    `)

  if (error) {
    console.error('Error fetching district stats:', error)
    return []
  }

  const statsMap = new Map<string, { count: number; prices: number[] }>()

  properties?.forEach(p => {
    const district = p.district
    const existing = statsMap.get(district) || { count: 0, prices: [] }
    existing.count++
    
    const prices = (p.transactions as unknown as { price_per_sqft: number }[])
      ?.map(t => t.price_per_sqft)
      ?.filter(Boolean) || []
    existing.prices.push(...prices)
    
    statsMap.set(district, existing)
  })

  return Array.from(statsMap.entries()).map(([district, data]) => ({
    district,
    propertyCount: data.count,
    avgPricePerSqft: data.prices.length > 0
      ? Math.round(data.prices.reduce((a, b) => a + b, 0) / data.prices.length)
      : 0,
    transactionCount: data.prices.length
  })).sort((a, b) => b.propertyCount - a.propertyCount)
}

export async function getDistrictAverageForProperty(district: string): Promise<number> {
  const supabase = await createClient()
  
  // First, get all property IDs in the district
  const { data: properties, error: propertyError } = await supabase
    .from('properties')
    .select('id')
    .eq('district', district)

  if (propertyError || !properties || properties.length === 0) {
    return 0
  }

  const propertyIds = properties.map(p => p.id)

  // Then get all lease transactions for those properties
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('price_per_sqft')
    .eq('type', 'lease')
    .not('price_per_sqft', 'is', null)
    .in('property_id', propertyIds)

  if (error || !transactions || transactions.length === 0) {
    console.error('Error fetching district average:', error)
    return 0
  }

  const prices = transactions
    .map(t => t.price_per_sqft)
    .filter((p): p is number => p !== null && p !== undefined)

  if (prices.length === 0) return 0

  return prices.reduce((sum, p) => sum + p, 0) / prices.length
}

export async function searchProperties(query: string): Promise<Property[]> {
  const supabase = await createClient()
  
  // Search in properties
  const { data: properties, error } = await supabase
    .from('properties')
    .select('*')
    .or(`name.ilike.%${query}%,address.ilike.%${query}%`)

  if (error) {
    console.error('Error searching properties:', error)
    return []
  }

  // Also search by tenant name in transactions and tenancies
  const [{ data: transactions }, { data: tenancies }] = await Promise.all([
    supabase.from('transactions').select('property_id').ilike('tenant_name', `%${query}%`),
    supabase.from('tenancies').select('property_id').ilike('tenant_name', `%${query}%`)
  ])

  const propertyIdsFromTenants = new Set([
    ...(transactions?.map(t => t.property_id) || []),
    ...(tenancies?.map(t => t.property_id) || [])
  ])

  if (propertyIdsFromTenants.size > 0) {
    const { data: tenantProperties } = await supabase
      .from('properties')
      .select('*')
      .in('id', Array.from(propertyIdsFromTenants))

    const existingIds = new Set(properties?.map(p => p.id) || [])
    const additionalProperties = tenantProperties?.filter(p => !existingIds.has(p.id)) || []
    
    return [...(properties || []), ...additionalProperties]
  }

  return properties || []
}
