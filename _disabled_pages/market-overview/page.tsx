import { PricePerSqftTrendChart } from '@/components/price-trends'
import { RentalYieldTrendChart } from '@/components/price-trends'
import { DistrictComparisonChart } from '@/components/price-trends'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react'
import { getMarketStats, getDistrictStats } from '@/lib/data-fetcher'
import { getTransactionsByDistrict } from '@/lib/transaction-fetcher'
import { Transaction } from '@/types'

export default async function MarketOverviewPage() {
  // Fetch market statistics
  const marketStats = await getMarketStats()
  
  // Fetch district statistics
  const districtStats = await getDistrictStats()
  
  // Fetch transactions for price trend chart
  const allTransactions: Transaction[] = await getTransactionsByDistrict('all')
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Overview</h1>
        <p className="text-lg text-gray-600">Comprehensive analysis of Hong Kong commercial real estate market trends</p>
      </div>

      {/* Key Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium text-muted-foreground">Total Properties</CardDescription>
              <Badge variant="outline" className="text-xs">HK CRE</Badge>
            </div>
            <CardTitle className="text-2xl font-bold">{marketStats.totalProperties.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+{((marketStats.totalProperties - 150) / 150 * 100).toFixed(1)}% from last quarter</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium text-muted-foreground">Avg Price/sqft</CardDescription>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">${marketStats.avgPricePerSqft.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+{(marketStats.avgPricePerSqft - 90).toFixed(2)}% from baseline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium text-muted-foreground">Avg Rent/sqft</CardDescription>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">${marketStats.avgRentPerSqft.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+{(marketStats.avgRentPerSqft - 95).toFixed(2)}% from baseline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-sm font-medium text-muted-foreground">Total Transactions</CardDescription>
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{marketStats.totalTransactions.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+{(marketStats.totalTransactions - 7000).toLocaleString()} this year</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Price per Sqft Trend (1Y)
              </CardTitle>
              <CardDescription>Historical sale price trends across all districts</CardDescription>
            </CardHeader>
            <CardContent>
              <PricePerSqftTrendChart 
                transactions={allTransactions} 
                timeRange="1Y" 
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Rental Yield Trend (1Y)
              </CardTitle>
              <CardDescription>Rental yield performance across commercial properties</CardDescription>
            </CardHeader>
            <CardContent>
              <RentalYieldTrendChart 
                transactions={allTransactions} 
                timeRange="1Y" 
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                District Comparison
              </CardTitle>
              <CardDescription>Price per sqft comparison across key districts</CardDescription>
            </CardHeader>
            <CardContent>
              <DistrictComparisonChart 
                data={districtStats} 
                metricType="price" 
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="text-sm font-medium text-muted-foreground">Time Range:</span>
        <button className="px-3 py-1 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors">
          1Y
        </button>
        <button className="px-3 py-1 border border-input rounded-md text-sm hover:bg-accent transition-colors">
          3Y
        </button>
        <button className="px-3 py-1 border border-input rounded-md text-sm hover:bg-accent transition-colors">
          5Y
        </button>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top Performing District
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">Central</p>
            <p className="text-sm text-muted-foreground mt-1">+8.2% YoY growth in transaction volume</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Most Affordable District
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">Kwun Tong</p>
            <p className="text-sm text-muted-foreground mt-1">$78/sqft average price (15% below city avg)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-500" />
              Investment Opportunity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">Sheung Wan</p>
            <p className="text-sm text-muted-foreground mt-1">Highest rental yield at 4.8% with strong growth potential</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}