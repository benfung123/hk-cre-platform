import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, MapPin, Building2, Calendar, DollarSign, Users } from 'lucide-react'
import { getPropertyById, getPropertyTransactions, getPropertyTenancies } from '@/lib/data'

interface PropertyPageProps {
  params: Promise<{
    id: string
  }>
}

// Force dynamic rendering since we need database access
export const dynamic = 'force-dynamic'

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params
  const [property, transactions, tenancies] = await Promise.all([
    getPropertyById(id),
    getPropertyTransactions(id),
    getPropertyTenancies(id)
  ])

  if (!property) {
    notFound()
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Back Button */}
        <Link href="/properties">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Button>
        </Link>

        {/* Property Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{property.name}</h1>
              <p className="text-lg text-muted-foreground">{property.address}</p>
            </div>
            <Badge className="text-lg px-4 py-1">Grade {property.grade}</Badge>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {property.district}
            </div>
            {property.year_built && (
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                Built {property.year_built}
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Property Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Floor Area</CardDescription>
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
              <CardDescription>Number of Floors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{property.floors || 'N/A'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Current Tenants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenancies.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Map Placeholder */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-muted h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Map View</p>
                <p className="text-sm text-muted-foreground">
                  Lat: {property.lat}, Lng: {property.lng}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for Transactions and Tenancies */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">
              <DollarSign className="h-4 w-4 mr-2" />
              Transactions ({transactions.length})
            </TabsTrigger>
            <TabsTrigger value="tenancies">
              <Users className="h-4 w-4 mr-2" />
              Tenancies ({tenancies.length})
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
                              {transaction.type === 'sale' ? 'Sale' : 'Lease'}
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
                No transactions recorded
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
                              <span className="text-muted-foreground">From: </span>
                              {new Date(tenancy.lease_start).toLocaleDateString()}
                            </div>
                          )}
                          {tenancy.lease_end && (
                            <div>
                              <span className="text-muted-foreground">To: </span>
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
                No tenancies recorded
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
