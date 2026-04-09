// Stub: data-fetcher - provides market and district statistics
export interface MarketStats {
  totalProperties: number
  avgRentPerSqft: number
  avgPricePerSqft: number
  totalTransactions: number
}

export interface DistrictStats {
  district: string
  count: number
  avgPricePerSqft: number
}

export async function getMarketStats(): Promise<MarketStats> {
  return { totalProperties: 0, avgRentPerSqft: 0, avgPricePerSqft: 0, totalTransactions: 0 }
}

export async function getDistrictStats(): Promise<DistrictStats[]> {
  return []
}
