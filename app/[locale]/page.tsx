import { getTranslations } from 'next-intl/server'
import { Link } from '@/src/i18n/routing'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, MapPin, ChevronDown } from 'lucide-react'
import { getProperties, getMarketStats, getDistrictStats } from '@/lib/data'
import { BuildingMapWrapper } from '@/components/building-map-wrapper'
import { HomeRecentlyViewed } from '@/components/favorites/home-recently-viewed'
import Image from 'next/image'

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
      {/* Hero Section - Full Width Immersive */}
      <section className="relative w-full h-[85vh] min-h-[600px]">
        {/* Background image - full bleed */}
        <div className="absolute inset-0">
          <Image
            src="/hero-banner-new.jpg"
            fill
            className="object-cover"
            alt="Hong Kong Commercial Real Estate"
            priority
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        </div>

        {/* Content - centered */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 max-w-4xl">
            {t('home.hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
            {t('home.hero.subtitle')}
          </p>

          {/* Search bar - prominent */}
          <div className="w-full max-w-3xl">
            <form action="/properties" className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder={t('home.hero.searchPlaceholder')}
                  className="pl-10 h-14 text-lg bg-white/95 backdrop-blur-sm border-0 shadow-xl"
                />
              </div>
              <Button type="submit" size="lg" className="h-14 px-8">
                {t('home.hero.searchButton')}
              </Button>
            </form>
          </div>

          {/* District Quick Links */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {['Central', 'Admiralty', 'Tsim Sha Tsui', 'Causeway Bay'].map((district) => (
              <Link key={district} href={`/properties?district=${district}`}>
                <Badge 
                  variant="secondary" 
                  className="cursor-pointer bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm"
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  {getDistrictTranslation(district)}
                </Badge>
              </Link>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-4 mt-8">
            <Link href="/properties">
              <Button size="lg" className="bg-white text-black hover:bg-white/90">
                {t('home.hero.explore')}
              </Button>
            </Link>
            <Link href="/analytics">
              <Button 
                size="lg" 
                variant="outline" 
                className="text-white border-white hover:bg-white/20"
              >
                {t('home.hero.learnMore')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/70" />
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

      {/* Recently Viewed Section */}
      <section className="py-12 border-b bg-background">
        <div className="container">
          <HomeRecentlyViewed />
        </div>
      </section>

      {/* Featured Map Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">{t('home.map.title')}</h2>
              <p className="text-muted-foreground">{t('home.map.subtitle')}</p>
            </div>
            <Link href="/properties?view=map">
              <Button variant="outline">{t('home.map.viewFullMap')}</Button>
            </Link>
          </div>
          
          <BuildingMapWrapper 
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
