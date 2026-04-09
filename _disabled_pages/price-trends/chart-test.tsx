import { PricePerSqftTrendChart } from './price-per-sqft-trend-chart'
import { RentalYieldTrendChart } from './rental-yield-trend-chart'
import { DistrictComparisonChart } from './district-comparison-chart'
import { Transaction, DistrictStats } from '@/types'

// Test data for verification
const testTransactions: Transaction[] = [
  {
    id: 'tx-1',
    property_id: 'prop-1',
    type: 'sale',
    price: 10000000,
    price_per_sqft: 2000,
    date: '2023-01-15',
    tenant_name: null,
    floor_area: 5000,
    created_at: '2023-01-15T10:30:00Z'
  },
  {
    id: 'tx-2',
    property_id: 'prop-2',
    type: 'lease',
    price: 100000,
    price_per_sqft: 200,
    date: '2023-02-20',
    tenant_name: 'ABC Corp',
    floor_area: 500,
    created_at: '2023-02-20T10:30:00Z'
  },
  {
    id: 'tx-3',
    property_id: 'prop-3',
    type: 'sale',
    price: 12000000,
    price_per_sqft: 2400,
    date: '2023-03-10',
    tenant_name: null,
    floor_area: 5000,
    created_at: '2023-03-10T10:30:00Z'
  },
  {
    id: 'tx-4',
    property_id: 'prop-4',
    type: 'lease',
    price: 125000,
    price_per_sqft: 250,
    date: '2023-04-05',
    tenant_name: 'XYZ Ltd',
    floor_area: 500,
    created_at: '2023-04-05T10:30:00Z'
  }
]

const testDistrictStats: DistrictStats[] = [
  {
    district: 'Central',
    propertyCount: 45,
    avgPricePerSqft: 2350,
    transactionCount: 120
  },
  {
    district: 'Admiralty',
    propertyCount: 32,
    avgPricePerSqft: 2280,
    transactionCount: 95
  },
  {
    district: 'Sheung Wan',
    propertyCount: 28,
    avgPricePerSqft: 2150,
    transactionCount: 87
  },
  {
    district: 'Wan Chai',
    propertyCount: 36,
    avgPricePerSqft: 2080,
    transactionCount: 102
  }
]

export function ChartTest() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-900">Chart Component Tests</h2>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Price per Sqft Trend Chart</h3>
        <PricePerSqftTrendChart 
          transactions={testTransactions} 
          timeRange="1Y" 
        />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">Rental Yield Trend Chart</h3>
        <RentalYieldTrendChart 
          transactions={testTransactions} 
          timeRange="1Y" 
        />
      </div>
      
      <div>
        <h3 className="text-xl font-semibold mb-4">District Comparison Chart</h3>
        <DistrictComparisonChart 
          data={testDistrictStats} 
          metricType="price" 
        />
      </div>
    </div>
  )
}
