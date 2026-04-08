import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, MapPin, Calendar, DollarSign, Users, Heart } from 'lucide-react'
import { getPropertyById, getPropertyTransactions, getPropertyTenancies } from '@/lib/data'
import { PropertyLocation } from '@/components/PropertyLocation'
import { PriceHistoryChart } from '@/components/charts/price-history-chart'
import { SourceBadge, DataFreshnessIndicator, DataProvenanceDrawer } from '@/components/data-source'
import { FavoriteButton } from '@/components/favorites/favorite-button'
import { PropertyStructuredData } from '@/components/seo/PropertyStructuredData'

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { id } = await params
  const t = await getTranslations()
  const property = await getPropertyById(id)
  
  if (!property) {
    return {
      title: t('propertyDetail.notFound'),
    }
  }
  
  const baseUrl = 'https://hk-cre-platform.vercel.app'
  
  return {
    title: property.name,
    description: `${property.name} - ${property.grade} Grade Office Building in ${property.district}. ${property.total_sqft ? (property.total_sqft / 1000000).toFixed(2) + 'M sqft' : ''}`,
    keywords: ['香港寫字樓', '商業地產', property.name, property.district, property.grade],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/properties/${property.id}`,
    },
    openGraph: {
      type: 'website',
      url: `${baseUrl}/properties/${property.id}`,
      title: property.name,
      description: `${property.name} - ${property.grade} Grade Office Building in ${property.district}`,
      siteName: 'HK CRE Platform',
    },
  }
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const t = await getTranslations()
  
  const [property, transactions, tenancies] = await Promise.all([
    getPropertyById(id),
    getPropertyTransactions(id),
    getPropertyTenancies(id)
  ])

  if (!property) {
    notFound()
  }

  // Helper function to get translated district name
  const getDistrictTranslation = (district: string) => {
    const districtKey = district.replace(/\s+/g, '')
    return t(`districts.${districtKey}`) || district
  }

  return (
    <>
      <PropertyStructuredData property={property} />
      
      {/* Subtle Banner */}
      <div className="relative h-24 bg-gradient-to-r from-blue-50 to-blue-100 overflow-hidden">
        <img
          src="/banner-property-detail.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      </div>
      
      <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Back Button */}
        <Link href="/properties">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('propertyDetail.back')}
          </Button>
        </Link>

        {/* Property Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <p className="text-lg text-muted-foreground">{property.address}</p>
              <div className="flex items-center gap-2 mt-2">
                <SourceBadge 
                  source="rvd"
                  lastUpdated={property.updated_at}
                  reliability="high"
                />
                <DataFreshnessIndicator 
                  lastUpdated={property.updated_at}
                  showLabel={false}
                />
                <DataProvenanceDrawer 
                  dataSources={[
                    {
                      source: 'rvd',
                      lastUpdated: property.updated_at,
                      reliability: 'high',
                      fieldName: 'Property Information',
                      methodology: 'Data sourced from RVD rental statistics and property records.'
                    },
                    {
                      source: 'csdi',
                      lastUpdated: property.updated_at,
                      reliability: 'high',
                      fieldName: 'Location & Spatial Data',
                      methodology: 'Geographic coordinates and building footprint from CSDI.'
                    }
                  ]}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <FavoriteButton propertyId={property.id} showLabel />
              <Badge className="text-lg px-4 py-1">{t('propertyDetail.grade')} {property.grade}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {getDistrictTranslation(property.district)}
            </div>
            {property.year_built && (
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                {t('properties.card.built')} {property.year_built}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('propertyDetail.totalFloorArea')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {property.total_sqft 
                  ? `${(property.total_sqft / 1000000).toFixed(2)}M sqft`
                  : 'N/A'}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('propertyDetail.numberOfFloors')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{property.floors || 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>{t('propertyDetail.currentTenants')}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenancies.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Price History Chart */}
        <PriceHistoryChart 
          transactions={transactions}
          title="Rental Price History"
          description="Historical rental rates per square foot"
        />

        {/* Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PropertyLocation 
              property={property} 
              height="400px"
              showNearbyMTR={true}
              showBuildingOutline={true}
            />
          </div>
          
          {/* Location Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('propertyDetail.mapView')}</CardTitle>
              <CardDescription>{property.address}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.lat && property.lng && (
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Latitude</span>
                    <span>{property.lat.toFixed(6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Longitude</span>
                    <span>{property.lng.toFixed(6)}</span>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(property.name + ' ' + property.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    Open in Google Maps
                  </Button>
                </a>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${property.lat},${property.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="w-full" size="sm">
                    Get Directions
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Transactions and Tenancies */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">
              <DollarSign className="h-4 w-4 mr-2" />
              {t('propertyDetail.tabs.transactions')} ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="tenancies">
              <Users className="h-4 w-4 mr-2" />
              {t('propertyDetail.tabs.tenancies')} ({tenancies.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="transactions" className="space-y-4">
            {transactions.length > 0 ? (
              <div className="grid gap-4">
                {transactions.map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={transaction.type === 'sale' ? 'default' : 'secondary'}>
                              {transaction.type === 'sale' ? t('propertyDetail.transaction.sale') : t('propertyDetail.transaction.lease')}
                            </Badge>
                            {transaction.tenant_name && (
                              <span className="text-sm">{transaction.tenant_name}</span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {transaction.price && (
                            <div className="font-medium">
                              ${transaction.price.toLocaleString()}
                            </div>
                          )}
                          {transaction.price_per_sqft && (
                            <div className="text-sm text-muted-foreground">
                              ${transaction.price_per_sqft}/sqft
                            </div>
                          )}
                          {transaction.floor_area && (
                            <div className="text-sm text-muted-foreground">
                              {transaction.floor_area.toLocaleString()} sqft
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('propertyDetail.noTransactions')}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tenancies" className="space-y-4">
            {tenancies.length > 0 ? (
              <div className="grid gap-4">
                {tenancies.map((tenancy) => (
                  <Card key={tenancy.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <div className="font-medium">{tenancy.tenant_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {tenancy.industry || 'Industry N/A'}
                          </div>
                          {(tenancy.floor || tenancy.unit) && (
                            <div className="text-sm">
                              {tenancy.floor} {tenancy.unit && `Unit ${tenancy.unit}`}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right text-sm">
                          {tenancy.lease_start && (
                            <div>
                              <span className="text-muted-foreground">{t('propertyDetail.transaction.from')}: </span>
                              {new Date(tenancy.lease_start).toLocaleDateString()}
                            </div>
                          )}
                          {tenancy.lease_end && (
                            <div>
                              <span className="text-muted-foreground">{t('propertyDetail.transaction.to')}: </span>
                              {new Date(tenancy.lease_end).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t('propertyDetail.noTenancies')}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  )
}
