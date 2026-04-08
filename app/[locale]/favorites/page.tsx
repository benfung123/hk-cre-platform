'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, Heart, ArrowLeft, Clock, TrendingUp, Eye } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { usePropertyData } from '@/hooks/use-property-data'
import type { Property } from '@/types'
import { FavoriteButton } from '@/components/favorites/favorite-button'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

const RECENTLY_VIEWED_KEY = 'hk-cre-recently-viewed'
const MAX_RECENT_ITEMS = 4

export default function FavoritesPage() {
  const t = useTranslations('favorites')
  const { favorites, isLoaded } = useFavorites()
  const { getPropertyById } = usePropertyData()
  const [properties, setProperties] = useState<Property[]>([])
  const [recentlyViewed, setRecentlyViewed] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Load favorites and recently viewed
  useEffect(() => {
    async function loadProperties() {
      if (!isLoaded) return
      
      setLoading(true)
      
      // Load favorites
      if (favorites.length === 0) {
        setProperties([])
      } else {
        const loaded = await Promise.all(
          favorites.map(id => getPropertyById(id))
        )
        setProperties(loaded.filter((p): p is Property => p !== null))
      }

      // Load recently viewed from localStorage
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY)
        if (stored) {
          try {
            const recentIds = JSON.parse(stored) as string[]
            // Filter out favorites from recently viewed
            const nonFavoriteIds = recentIds.filter(id => !favorites.includes(id)).slice(0, MAX_RECENT_ITEMS)
            
            if (nonFavoriteIds.length > 0) {
              const recentProps = await Promise.all(
                nonFavoriteIds.map(id => getPropertyById(id))
              )
              setRecentlyViewed(recentProps.filter((p): p is Property => p !== null))
            } else {
              setRecentlyViewed([])
            }
          } catch (e) {
            console.error('Failed to parse recently viewed:', e)
            setRecentlyViewed([])
          }
        }
      }
      
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

        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
              <p className="text-muted-foreground">
                {t('savedCount', { count: properties.length })}
              </p>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {properties.map((property) => (
              <Link key={property.id} href={`/properties/${property.id}`}>
                <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <CardTitle className="line-clamp-1">{property.name}</CardTitle>
                        <CardDescription className="line-clamp-1">
                          {property.address}
                        </CardDescription>
                      </div>
                      <div onClick={(e) => e.preventDefault()}>
                        <FavoriteButton propertyId={property.id} size="sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{property.grade} Grade</Badge>
                      {property.total_sqft && (
                        <Badge variant="outline" className="text-xs">
                          {(property.total_sqft / 1000000).toFixed(1)}M sqft
                        </Badge>
                      )}
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
                    
                    {property.floors && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        {property.floors} floors
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

        {/* Recently Viewed Section */}
        {recentlyViewed.length > 0 && (
          <div className="space-y-4 pt-8 border-t">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold">Recently Viewed</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentlyViewed.map((property) => (
                <Link key={property.id} href={`/properties/${property.id}`}>
                  <Card className="hover:shadow-md transition-shadow group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                            {property.name}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {property.address}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">{property.grade}</Badge>
                            <span className="text-xs text-muted-foreground">{property.district}</span>
                          </div>
                        </div>
                        <div onClick={(e) => e.preventDefault()} className="ml-2">
                          <FavoriteButton propertyId={property.id} size="sm" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Market Insight Section */}
        {properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Market Tracking</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  You're tracking {properties.length} {properties.length === 1 ? 'property' : 'properties'}
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Recently Viewed</span>
                </div>
                <p className="text-sm text-purple-700 mt-1">
                  {recentlyViewed.length} {recentlyViewed.length === 1 ? 'property' : 'properties'} viewed recently
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-green-900">Explore More</span>
                </div>
                <Link href="/properties">
                  <Button variant="link" className="p-0 h-auto text-sm text-green-700">
                    Browse all properties →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
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
    <div className="text-center py-16 animate-in fade-in zoom-in-95 duration-300">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-red-100 rounded-full blur-3xl opacity-50" />
        <Heart className="h-16 w-16 mx-auto text-red-300 relative z-10 mb-4" />
      </div>
      <h2 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h2>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        {t('emptyDescription')}
      </p>
      <Link href="/properties">
        <Button size="lg" className="gap-2">
          <Building2 className="h-4 w-4" />
          {t('browseButton')}
        </Button>
      </Link>
    </div>
  )
}
