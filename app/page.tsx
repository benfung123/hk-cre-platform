import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Building2, TrendingUp, MapPin } from 'lucide-react'
import { getProperties, getMarketStats, getDistrictStats } from '@/lib/data'

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [featuredProperties, marketStats, districtStats] = await Promise.all([
    getProperties().then(props => props.slice(0, 6)),
    getMarketStats(),
    getDistrictStats()
  ])

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="container flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Hong Kong Commercial Real Estate Data
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive data platform for commercial properties, transactions, and market analytics across Hong Kong and Asia.
            </p>
          </div>
          
          <div className="w-full max-w-xl">
            <form action="/properties" className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search by building name, address, or tenant..."
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg">Search</Button>
            </form>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {['Central', 'Admiralty', 'Tsim Sha Tsui', 'Causeway Bay'].map((district) => (
              <Link key={district} href={`/properties?district=${district}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  <MapPin className="h-3 w-3 mr-1" />
                  {district}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Market Stats */}
      <section className="py-12 border-y bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold">{marketStats.totalProperties}</div>
              <div className="text-sm text-muted-foreground">Properties</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">${marketStats.avgRentPerSqft}</div>
              <div className="text-sm text-muted-foreground">Avg Rent/sqft</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{marketStats.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">${marketStats.avgPricePerSqft}</div>
              <div className="text-sm text-muted-foreground">Avg Price/sqft</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Properties</h2>
              <p className="text-muted-foreground">Premium commercial buildings in Hong Kong</p>
            </div>
            <Link href="/properties">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {property.address}
                        </CardDescription>
                      </div>
                      <Badge>{property.grade}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {property.district}
                      </div>
                      {property.year_built && (
                        <div>Built {property.year_built}</div>
                      )}
                    </div>
                    {property.total_sqft && (
                      <div className="mt-2 text-sm">
                        {(property.total_sqft / 1000000).toFixed(1)}M sqft
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* District Overview */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-8">District Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {districtStats.map((stat) => (
              <Card key={stat.district}>
                <CardHeader>
                  <CardTitle className="text-lg">{stat.district}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Properties</span>
                    <span className="font-medium">{stat.propertyCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Avg Price/sqft</span>
                    <span className="font-medium">${stat.avgPricePerSqft}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Transactions</span>
                    <span className="font-medium">{stat.transactionCount}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
