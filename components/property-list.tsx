import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2 } from 'lucide-react'
import type { Property } from '@/types'

interface PropertyListProps {
  properties: Property[]
}

export function PropertyList({ properties }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No properties found</h3>
        <p className="text-muted-foreground">Try adjusting your filters</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Link key={property.id} href={`/properties/${property.id}`}>
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                  <CardDescription className="line-clamp-1">
                    {property.address}
                  </CardDescription>
                </div>
                <Badge className="ml-2 shrink-0">{property.grade}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {property.district}
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  {property.year_built && (
                    <div>
                      <span className="text-muted-foreground">Built: </span>
                      {property.year_built}
                    </div>
                  )}
                  {property.floors && (
                    <div>
                      <span className="text-muted-foreground">Floors: </span>
                      {property.floors}
                    </div>
                  )}
                </div>
                
                {property.total_sqft && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Total Area: </span>
                    {(property.total_sqft / 1000000).toFixed(1)}M sqft
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
