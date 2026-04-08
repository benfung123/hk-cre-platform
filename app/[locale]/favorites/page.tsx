'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, Heart, ArrowLeft } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { usePropertyData } from '@/hooks/use-property-data'
import type { Property } from '@/types'
import { FavoriteButton } from '@/components/favorites/favorite-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

export default function FavoritesPage() {
  const t = useTranslations('favorites')
  const { favorites, isLoaded } = useFavorites()
  const { getPropertyById } = usePropertyData()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperties() {
      if (!isLoaded) return
      
      if (favorites.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      setLoading(true)
      const loaded = await Promise.all(
        favorites.map(id => getPropertyById(id))
      )
      setProperties(loaded.filter((p): p is Property => p !== null))
      setLoading(false)
    }

    loadProperties()
  }, [favorites, isLoaded, getPropertyById])

  if (!isLoaded || loading) {
    return <FavoritesSkeleton />
  }

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/properties">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('backToProperties')}
              </Button>
            </Link>
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">
            {t('savedCount', { count: properties.length })}
          </p>
        </div>

        {/* Properties Grid */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {property.address}
                        </CardDescription>
                      </div>
                      <div onClick={(e) => e.preventDefault()}>
                        <FavoriteButton propertyId={property.id} size="sm" />
                      </div>
                    </div>
                    <Badge className="mt-2">{property.grade}</Badge>
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
                        {(property.total_sqft / 1000000).toFixed(1)}M sqft total area
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyFavorites />
        )}
      </div>
    </div>
  )
}

function FavoritesSkeleton() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      </div>
    </div>
  )
}

function EmptyFavorites() {
  const t = useTranslations('favorites')
  return (
    <div className="text-center py-16">
      <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h2>
      <p className="text-muted-foreground mb-6">
        {t('emptyDescription')}
      </p>
      <Link href="/properties">
        <Button>
          <Building2 className="h-4 w-4 mr-2" />
          {t('browseButton')}
        </Button>
      </Link>
    </div>
  )
}
