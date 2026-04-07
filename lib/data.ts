import { createClient } from '@/lib/supabase/server'
import type { Property, Transaction, Tenancy, MarketStats, DistrictStats } from '@/types'

export async function getProperties(filters?: {
  district?: string
  grade?: string
  search?: string
}): Promise<Property[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('properties')
    .select('*')
    .order('name')

  if (filters?.district) {
    query = query.eq('district', filters.district)
  }

  if (filters?.grade) {
    query = query.eq('grade', filters.grade)
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
  
  const { data, error } = await supabase
    .from('properties')
    .select('district')

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
