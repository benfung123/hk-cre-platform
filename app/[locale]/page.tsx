import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin } from 'lucide-react'
import { getProperties, getMarketStats, getDistrictStats } from '@/lib/data'
import { BuildingMap } from '@/components/BuildingMap'

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const t = await getTranslations()
  
  const [featuredProperties, marketStats, districtStats] = await Promise.all([
    getProperties().then(props => props.slice(0, 6)),
    getMarketStats(),
    getDistrictStats()
  ])

  // Helper function to get translated district name
  const getDistrictTranslation = (district: string) => {
    const districtKey = district.replace(/\s+/g, '')
    return t(`districts.${districtKey}`) || district
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-b from-muted/50 to-background">
        <div className="container flex flex-col items-center text-center space-y-8">
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t('home.hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.hero.subtitle')}
            </p>
          </div>
          
          <div className="w-full max-w-xl">
            <form action="/properties" className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder={t('home.hero.searchPlaceholder')}
                  className="pl-10 h-12"
                />
              </div>
              <Button type="submit" size="lg">{t('home.hero.searchButton')}</Button>
            </form>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            {['Central', 'Admiralty', 'Tsim Sha Tsui', 'Causeway Bay'].map((district) => (
              <Link key={district} href={`/properties?district=${district}`}>
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  <MapPin className="h-3 w-3 mr-1" />
                  {getDistrictTranslation(district)}
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
              <div className="text-sm text-muted-foreground">{t('home.stats.properties')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">${marketStats.avgRentPerSqft}</div>
              <div className="text-sm text-muted-foreground">{t('home.stats.avgRent')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{marketStats.totalTransactions}</div>
              <div className="text-sm text-muted-foreground">{t('home.stats.transactions')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">${marketStats.avgPricePerSqft}</div>
              <div className="text-sm text-muted-foreground">{t('home.stats.avgPrice')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Explore on Map</h2>
              <p className="text-muted-foreground">Browse commercial properties across Hong Kong</p>
            </div>
            <Link href="/properties?view=map">
              <Button variant="outline">View Full Map</Button>
            </Link>
          </div>
          
          <BuildingMap 
            properties={featuredProperties}
            height="450px"
            showFilters={true}
            showSearch={true}
          />
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">{t('home.featured.title')}</h2>
              <p className="text-muted-foreground">{t('home.featured.subtitle')}</p>
            </div>
            <Link href="/properties">
              <Button variant="outline">{t('home.featured.viewAll')}</Button>
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
                        {getDistrictTranslation(property.district)}
                      </div>
                      {property.year_built && (
                        <div>{t('properties.card.built')} {property.year_built}</div>
                      )}
                    </div>
                    {property.total_sqft && (
                      <div className="mt-2 text-sm">
                        {(property.total_sqft / 1000000).toFixed(1)}M {t('properties.card.totalArea')}
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
          <h2 className="text-3xl font-bold mb-8">{t('home.districts.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {districtStats.map((stat) => (
              <Card key={stat.district}>
                <CardHeader>
                  <CardTitle className="text-lg">{getDistrictTranslation(stat.district)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('home.stats.properties')}</span>
                    <span className="font-medium">{stat.propertyCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('home.stats.avgPrice')}</span>
                    <span className="font-medium">${stat.avgPricePerSqft}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t('home.stats.transactions')}</span>
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
