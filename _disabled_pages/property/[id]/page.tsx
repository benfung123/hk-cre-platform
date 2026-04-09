import { PricePerSqftTrendChart } from '@/components/price-trends'
import { RentalYieldTrendChart } from '@/components/price-trends'
import { DistrictComparisonChart } from '@/components/price-trends'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, DollarSign, Percent, MapPin, Building, Calendar } from 'lucide-react'
import { getTransactionByPropertyId } from '@/lib/transaction-fetcher'
import { PropertyWithDetails } from '@/types'

// Mock property data for demonstration
const mockProperty: PropertyWithDetails = {
  id: 'prop-001',
  name: 'Central Plaza',
  address: '18 Harbour Road, Wan Chai',
  district: 'Central',
  grade: 'A+',
  year_built: 2015,
  total_sqft: 500000,
  floors: 48,
  lat: 22.2833,
  lng: 114.1667,
  created_at: '2023-01-15T10:30:00Z',
  updated_at: '2023-01-15T10:30:00Z',
  transactions: [
    {
      id: 'tx-001',
      property_id: 'prop-001',
      type: 'sale',
      price: 120000000,
      price_per_sqft: 2400,
      date: '2023-03-15',
      tenant_name: null,
      floor_area: 50000,
      created_at: '2023-03-15T10:30:00Z'
    },
    {
      id: 'tx-002',
      property_id: 'prop-001',
      type: 'lease',
      price: 120000,
      price_per_sqft: 240,
      date: '2023-06-20',
      tenant_name: 'ABC Corporation',
      floor_area: 500,
      created_at: '2023-06-20T10:30:00Z'
    },
    {
      id: 'tx-003',
      property_id: 'prop-001',
      type: 'lease',
      price: 125000,
      price_per_sqft: 250,
      date: '2023-09-10',
      tenant_name: 'XYZ Limited',
      floor_area: 500,
      created_at: '2023-09-10T10:30:00Z'
    }
  ],
  tenancies: []
}

export default async function PropertyDetailPage() {
  // In a real app, this would fetch the property by ID
  const property = mockProperty
  
  // Filter transactions for this property
  const propertyTransactions = property.transactions || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.name}</h1>
        <p className="text-lg text-gray-600 flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {property.address} • {property.district}
        </p>
      </div>

      {/* Property Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">Grade</CardDescription>
            <CardTitle className="text-2xl font-bold">{property.grade}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">Premium Grade Office</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">Year Built</CardDescription>
            <CardTitle className="text-2xl font-bold">{property.year_built}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Modern high-rise building</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-sm font-medium text-muted-foreground">Total Area</CardDescription>
            <CardTitle className="text-2xl font-bold">{property.total_sqft?.toLocaleString()} sqft</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">48 floors of premium office space</p>
          </CardContent>
        </Card>
      </div>

      {/* Price Trend Charts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Market Performance</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Price per Sqft Trend
                </CardTitle>
                <CardDescription>Historical sale price trends for this property</CardDescription>
              </CardHeader>
              <CardContent>
                <PricePerSqftTrendChart 
                  transactions={propertyTransactions} 
                  title="Central Plaza Price Trend"
                  description="Sale price history for Central Plaza"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="h-5 w-5 text-primary" />
                  Rental Yield Trend
                </CardTitle>
                <CardDescription>Rental yield performance for this property</CardDescription>
              </CardHeader>
              <CardContent>
                <RentalYieldTrendChart 
                  transactions={propertyTransactions} 
                  title="Central Plaza Rental Yield"
                  description="Rental yield history for Central Plaza"
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                District Comparison
              </CardTitle>
              <CardDescription>How Central Plaza compares to other properties in Central district</CardDescription>
            </CardHeader>
            <CardContent>
              <DistrictComparisonChart 
                data={[{
                  district: 'Central',
                  propertyCount: 45,
                  avgPricePerSqft: 2350,
                  transactionCount: 120
                }]}
                metricType="price" 
                title="Central District Comparison"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
        <div className="space-y-4">
          {propertyTransactions.map(transaction => (
            <Card key={transaction.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${transaction.type === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                      {transaction.type === 'sale' ? <DollarSign className="h-4 w-4" /> : <Percent className="h-4 w-4" />}
                    </div>
                    <div>
                      <h3 className="font-semibold">{transaction.type === 'sale' ? 'Sale' : 'Lease'} Transaction</h3>
                      <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {transaction.type === 'sale' ? '$' : '$'}{transaction.price_per_sqft?.toFixed(2)}/sqft
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.type === 'sale' ? 'Sale Price' : 'Monthly Rent'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{transaction.floor_area?.toLocaleString()} sqft</p>
                      <p className="text-sm text-muted-foreground">Area</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}