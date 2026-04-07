'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  Calendar, 
  DollarSign, 
  Scale,
  X,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { useComparison } from '@/hooks/use-comparison'
import { usePropertyData } from '@/hooks/use-property-data'
import type { Property, Transaction } from '@/types'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/skeleton'

interface PropertyWithTransactions extends Property {
  transactions: Transaction[]
}

export function ComparisonView() {
  const t = useTranslations()
  const { comparisonList, removeFromComparison, clearComparison } = useComparison()
  const { getPropertyById, getPropertyTransactions } = usePropertyData()
  const [properties, setProperties] = useState<PropertyWithTransactions[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperties() {
      if (comparisonList.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      setLoading(true)
      const loaded = await Promise.all(
        comparisonList.map(async (id) => {
          const property = await getPropertyById(id)
          const transactions = await getPropertyTransactions(id)
          return property ? { ...property, transactions } : null
        })
      )
      setProperties(loaded.filter((p): p is PropertyWithTransactions => p !== null))
      setLoading(false)
    }

    loadProperties()
  }, [comparisonList, getPropertyById, getPropertyTransactions])

  if (loading) {
    return <ComparisonSkeleton />
  }

  if (properties.length === 0) {
    return <EmptyComparison />
  }

  // Calculate stats for comparison
  const getLatestRent = (transactions: Transaction[]) => {
    const leases = transactions.filter(t => t.type === 'lease' && t.price_per_sqft)
    return leases.length > 0 ? leases[0].price_per_sqft : null
  }

  const getAvgRent = (transactions: Transaction[]) => {
    const leases = transactions.filter(t => t.type === 'lease' && t.price_per_sqft)
    if (leases.length === 0) return null
    return leases.reduce((sum, t) => sum + (t.price_per_sqft || 0), 0) / leases.length
  }

  const rents = properties.map(p => getLatestRent(p.transactions))
  const avgRents = properties.map(p => getAvgRent(p.transactions))
  
  const maxRent = Math.max(...rents.filter((r): r is number => r !== null))
  const minRent = Math.min(...rents.filter((r): r is number => r !== null))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Properties
            </Button>
          </Link>
        </div>
        <Button variant="outline" size="sm" onClick={clearComparison}>
          <X className="h-4 w-4 mr-2" />
          Clear All
        </Button>
      </div>

      {/* Comparison Grid */}
      <div className={`grid gap-4 ${properties.length === 2 ? 'grid-cols-1 md:grid-cols-2' : properties.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1'}`}>
        {properties.map((property) => {
          const latestRent = getLatestRent(property.transactions)
          const avgRent = getAvgRent(property.transactions)
          
          return (
            <Card key={property.id} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={() => removeFromComparison(property.id)}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <CardHeader>
                <div className="pr-8">
                  <CardTitle className="text-lg">{property.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
                <Badge className="mt-2">{property.grade}</Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{property.district}</span>
                </div>

                {/* Year Built */}
                {property.year_built && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Built {property.year_built}</span>
                  </div>
                )}

                <Separator />

                {/* Rent Info */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Rent per sqft
                  </h4>
                  
                  {latestRent ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Latest:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${latestRent.toFixed(2)}</span>
                          {latestRent === maxRent && properties.length > 1 && (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          )}
                          {latestRent === minRent && properties.length > 1 && (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                          {latestRent !== maxRent && latestRent !== minRent && properties.length > 1 && (
                            <Minus className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {avgRent && avgRent !== latestRent && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Average:</span>
                          <span className="font-medium">${avgRent.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No rent data</p>
                  )}
                </div>

                <Separator />

                {/* Building Stats */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Building
                  </h4>
                  
                  <div className="space-y-1 text-sm">
                    {property.total_sqft && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Area:</span>
                        <span>{(property.total_sqft / 1000000).toFixed(2)}M sqft</span>
                      </div>
                    )}
                    {property.floors && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Floors:</span>
                        <span>{property.floors}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link href={`/properties/${property.id}`}>
                  <Button className="w-full" variant="outline">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function ComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-96" />
        ))}
      </div>
    </div>
  )
}

function EmptyComparison() {
  return (
    <div className="text-center py-16">
      <Scale className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">No Properties Selected</h2>
      <p className="text-muted-foreground mb-6">
        Select properties from the list to compare them side by side.
      </p>
      <Link href="/properties">
        <Button>
          Browse Properties
        </Button>
      </Link>
    </div>
  )
}
