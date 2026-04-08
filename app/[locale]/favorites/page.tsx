'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Building2, 
  Heart, 
  ArrowLeft, 
  Clock, 
  TrendingUp, 
  Eye,
  Trash2,
  Scale,
  CheckSquare,
  Square,
  X
} from 'lucide-react'
import { useFavoritesStore } from '@/stores/favorites-store'
import { useCompareStore } from '@/stores/compare-store'
import { useSimpleToast } from '@/components/ui/toast-provider'
import type { Property } from '@/types'
import { FavoriteButton } from '@/components/favorites/favorite-button'
import { HomeRecentlyViewed } from '@/components/favorites/home-recently-viewed'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { CompareButton } from '@/components/comparison/compare-button'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase/client'

export default function FavoritesPage() {
  const t = useTranslations('favorites')
  const tToast = useTranslations('toast')
  const toast = useSimpleToast()
  
  // Get store values
  const { 
    favorites, 
    clearAllFavorites,
    removeFavorite,
    setHydrated 
  } = useFavoritesStore()
  
  const { 
    compareList, 
    addToCompare, 
    removeFromCompare, 
    isInCompare,
    canAddMore,
    setHydrated: setCompareHydrated
  } = useCompareStore()
  
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [showCompareMode, setShowCompareMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const hasLoadedRef = useRef(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    setHydrated(true)
    setCompareHydrated(true)
  }, [setHydrated, setCompareHydrated])

  // Load favorites data - only run once when mounted
  useEffect(() => {
    async function loadProperties() {
      if (!mounted || hasLoadedRef.current) {
        return
      }
      
      console.log('[FavoritesPage] Loading properties, favorites count:', favorites.length)
      hasLoadedRef.current = true
      setLoading(true)
      try {
        if (favorites.length === 0) {
          setProperties([])
        } else {
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .in('id', favorites)
          
          if (error) throw error
          
          // Sort by favorites order
          const propertyMap = new Map((data as Property[] | null)?.map(p => [p.id, p]))
          const sorted = favorites
            .map(id => propertyMap.get(id))
            .filter((p): p is Property => p !== undefined)
          
          setProperties(sorted)
        }
      } catch (e) {
        console.error('[FavoritesPage] Failed to load favorites:', e)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [mounted, favorites])

  // Reload when page becomes visible (user navigates back)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === 'visible' && mounted && hasLoadedRef.current) {
        console.log('[FavoritesPage] Page visible, reloading favorites')
        hasLoadedRef.current = false // Reset to allow reload
        setLoading(true)
        
        // Reload favorites data
        if (favorites.length === 0) {
          setProperties([])
          setLoading(false)
          hasLoadedRef.current = true
        } else {
          supabase
            .from('properties')
            .select('*')
            .in('id', favorites)
            .then(({ data, error }) => {
              if (error) {
                console.error('[FavoritesPage] Failed to reload favorites:', error)
              } else {
                const propertyMap = new Map((data as Property[] | null)?.map(p => [p.id, p]))
                const sorted = favorites
                  .map(id => propertyMap.get(id))
                  .filter((p): p is Property => p !== undefined)
                setProperties(sorted)
              }
              setLoading(false)
              hasLoadedRef.current = true
            })
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [mounted, favorites])

  // Sync selected items with compare list
  useEffect(() => {
    setSelectedForCompare(new Set(compareList))
  }, [compareList])

  const handleClearAll = () => {
    if (confirm(t('clearAllConfirm') || 'Are you sure you want to remove all saved properties?')) {
      clearAllFavorites()
      toast.info(tToast('favoritesCleared') || 'All favorites cleared', undefined, undefined, 'favorites-toast')
    }
  }

  const handleRemove = (id: string) => {
    removeFavorite(id)
    setProperties(prev => prev.filter(p => p.id !== id))
    toast.info(tToast('removedFromFavorites') || 'Removed from watchlist', undefined, undefined, 'favorites-toast')
  }

  const handleToggleCompare = (propertyId: string) => {
    if (isInCompare(propertyId)) {
      removeFromCompare(propertyId)
      toast.info(tToast('removedFromCompare') || 'Removed from compare', undefined, undefined, 'compare-toast')
    } else if (canAddMore()) {
      const success = addToCompare(propertyId)
      if (success) {
        toast.success(tToast('addedToCompare') || 'Added to compare', undefined, undefined, 'compare-toast')
      }
    } else {
      toast.warning(tToast('compareFull') || 'Compare list full', undefined, undefined, 'compare-toast')
    }
  }

  const handleCompareSelected = () => {
    // Add all selected to compare list
    let addedCount = 0
    selectedForCompare.forEach(id => {
      if (!isInCompare(id)) {
        if (addToCompare(id)) {
          addedCount++
        }
      }
    })
    
    if (addedCount > 0) {
      toast.success(tToast('addedToCompare') || `Added ${addedCount} to compare`, undefined, undefined, 'compare-toast')
    }
    setShowCompareMode(false)
  }

  // Show loading skeleton while data is loading
  if (!mounted || loading) {
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
          
          {properties.length > 0 && (
            <div className="flex items-center gap-2">
              {!showCompareMode ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCompareMode(true)}
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    {t('selectForCompare')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('clearAll')}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleCompareSelected}
                    disabled={selectedForCompare.size === 0}
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    {t('addToCompare', { count: selectedForCompare.size })}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCompareMode(false)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    {t('cancel')}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Title Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
              <p className="text-muted-foreground">
                {t('pageDescription')}
              </p>
            </div>
          </div>
          
          {properties.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {t('savedCount', { count: properties.length })}
            </p>
          )}
        </div>

        {/* Favorites Grid */}
        {properties.length > 0 ? (
          <>
            <div className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
              showCompareMode && "animate-in fade-in duration-300"
            )}>
              {properties.map((property) => (
                <FavoriteCard
                  key={property.id}
                  property={property}
                  showCompareMode={showCompareMode}
                  isSelected={selectedForCompare.has(property.id)}
                  isInCompare={isInCompare(property.id)}
                  onToggleCompare={() => handleToggleCompare(property.id)}
                  onRemove={() => handleRemove(property.id)}
                  canAddMore={canAddMore()}
                />
              ))}
            </div>

            {/* Market Insights */}
            <MarketInsights properties={properties} />
          </>
        ) : (
          <EmptyFavorites />
        )}

        {/* Recently Viewed Section */}
        <div className="pt-8 border-t">
          <HomeRecentlyViewed />
        </div>
      </div>
    </div>
  )
}

/**
 * Individual Favorite Card Component
 */
interface FavoriteCardProps {
  property: Property
  showCompareMode: boolean
  isSelected: boolean
  isInCompare: boolean
  onToggleCompare: () => void
  onRemove: () => void
  canAddMore: boolean
}

function FavoriteCard({ 
  property, 
  showCompareMode, 
  isSelected, 
  isInCompare,
  onToggleCompare,
  onRemove,
  canAddMore
}: FavoriteCardProps) {
  const t = useTranslations('favorites')

  const cardContent = (
    <Card className={cn(
      "h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden",
      showCompareMode && isSelected && "ring-2 ring-blue-500 ring-offset-2",
      isInCompare && !showCompareMode && "border-blue-200 bg-blue-50/30"
    )}>
      {/* Compare Selection Overlay */}
      {showCompareMode && (
        <div 
          className="absolute inset-0 z-20 cursor-pointer bg-black/5 hover:bg-black/10 transition-colors"
          onClick={(e) => {
            e.preventDefault()
            onToggleCompare()
          }}
        >
          <div className="absolute top-4 right-4">
            <div className={cn(
              "w-6 h-6 rounded border-2 flex items-center justify-center transition-colors",
              isSelected 
                ? "bg-blue-500 border-blue-500" 
                : "bg-white border-gray-300"
            )}>
              {isSelected && <CheckSquare className="h-4 w-4 text-white" />}
              {!isSelected && <Square className="h-4 w-4 text-gray-300" />}
            </div>
          </div>
        </div>
      )}

      <CardHeader className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <CardTitle className="line-clamp-1">{property.name}</CardTitle>
            <CardDescription className="line-clamp-1">
              {property.address}
            </CardDescription>
          </div>
          
          {!showCompareMode && (
            <div 
              className="z-10"
              onClick={(e) => e.preventDefault()}
            >
              <FavoriteButton propertyId={property.id} size="sm" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="secondary">{property.grade} Grade</Badge>
          {property.total_sqft && (
            <Badge variant="outline" className="text-xs">
              {(property.total_sqft / 1000000).toFixed(1)}M sqft
            </Badge>
          )}
          {isInCompare && !showCompareMode && (
            <Badge variant="default" className="text-xs bg-blue-500">
              <Scale className="h-3 w-3 mr-1" />
              {t('inCompare')}
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

        {/* Action Buttons */}
        {!showCompareMode && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <CompareButton 
              propertyId={property.id} 
              size="sm" 
              showLabel 
            />
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (showCompareMode) {
    return cardContent
  }

  return (
    <Link href={`/properties/${property.id}`} className="block">
      {cardContent}
    </Link>
  )
}

/**
 * Market Insights Component
 */
function MarketInsights({ properties }: { properties: Property[] }) {
  const t = useTranslations('favorites')
  
  const grades = properties.reduce((acc, p) => {
    acc[p.grade] = (acc[p.grade] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const districts = new Set(properties.map(p => p.district)).size

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 border-t">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-blue-900">{t('marketTracking')}</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            {t('trackingCount', { count: properties.length })}
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-900">{t('grades.title') || 'Grade Distribution'}</span>
          </div>
          <div className="flex gap-2 mt-2 flex-wrap">
            {Object.entries(grades).map(([grade, count]) => (
              <Badge key={grade} variant="outline" className="text-xs">
                {grade}: {count}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">{districts} {t('districts.title') || 'Districts'}</span>
          </div>
          <Link href="/properties">
            <Button variant="link" className="p-0 h-auto text-sm text-green-700">
              {t('browseAll')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Empty State Component
 */
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

/**
 * Loading Skeleton Component
 */
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
