import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getDistrictStats, getMarketStats } from '@/lib/data'
import { DistrictChart } from '@/components/district-chart'
import { TrendingUp, Building2, DollarSign, Activity } from 'lucide-react'

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const t = await getTranslations()
  
  const [marketStats, districtStats] = await Promise.all([
    getMarketStats(),
    getDistrictStats()
  ])

  // Helper function to get translated district name
  const getDistrictTranslation = (district: string) => {
    const districtKey = district.replace(/\s+/g, '')
    return t(`districts.${districtKey}`) || district
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">{t('nav.analytics')}</h1>
          <p className="text-muted-foreground">
            Market insights and trends for Hong Kong commercial real estate
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('home.stats.properties')}</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketStats.totalProperties}</div>
              <p className="text-xs text-muted-foreground">Across all districts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('home.stats.avgRent')}</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${marketStats.avgRentPerSqft}</div>
              <p className="text-xs text-muted-foreground">Based on lease transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('home.stats.transactions')}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{marketStats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">Sale & lease combined</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t('home.stats.avgPrice')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${marketStats.avgPricePerSqft}</div>
              <p className="text-xs text-muted-foreground">Market average</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="districts" className="w-full">
          <TabsList>
            <TabsTrigger value="districts">District Analysis</TabsTrigger>
            <TabsTrigger value="trends">Market Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="districts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Average Price by District</CardTitle>
                <CardDescription>
                  Comparison of average price per sqft across districts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistrictChart data={districtStats} type="price" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Count by District</CardTitle>
                <CardDescription>
                  Number of commercial properties in each district
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DistrictChart data={districtStats} type="count" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Market Trends</CardTitle>
                <CardDescription>
                  Historical transaction volume and price trends
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <p>Trend analysis coming soon</p>
                  <p className="text-sm">Historical data visualization will be available in the next update</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* District Details Table */}
        <Card>
          <CardHeader>
            <CardTitle>District Breakdown</CardTitle>
            <CardDescription>Detailed statistics by district</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">District</th>
                    <th className="text-right py-3 px-4 font-medium">{t('home.stats.properties')}</th>
                    <th className="text-right py-3 px-4 font-medium">{t('home.stats.transactions')}</th>
                    <th className="text-right py-3 px-4 font-medium">{t('home.stats.avgPrice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {districtStats.map((stat) => (
                    <tr key={stat.district} className="border-b last:border-0">
                      <td className="py-3 px-4">{getDistrictTranslation(stat.district)}</td>
                      <td className="text-right py-3 px-4">{stat.propertyCount}</td>
                      <td className="text-right py-3 px-4">{stat.transactionCount}</td>
                      <td className="text-right py-3 px-4">${stat.avgPricePerSqft}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
