'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Clock, X, Heart, Eye, Trash2 } from 'lucide-react'
import { useFavorites } from '@/hooks/use-favorites'
import { FavoriteButton } from './favorite-button'
import { useTranslations } from 'next-intl'
import type { Property } from '@/types'

interface RecentlyViewedProps {
  /** Maximum number of items to display (default: 10) */
  limit?: number
  /** Show title header (default: true) */
  showTitle?: boolean
  /** Show clear all button (default: true) */
  showClearButton?: boolean
  /** Layout direction (default: 'horizontal') */
  layout?: 'horizontal' | 'vertical' | 'grid'
  /** Callback when an item is clicked */
  onItemClick?: (property: Property) => void
  /** Exclude these property IDs from display */
  excludeIds?: string[]
  /** Additional CSS classes */
  className?: string
}

/**
 * Recently Viewed Properties Component
 * 
 * Displays a scrollable list of recently viewed properties with:
 * - Add to favorites button
 * - Remove from history
 * - Clear all history
 * - Responsive layout options
 */
export function RecentlyViewed({
  limit = 10,
  showTitle = true,
  showClearButton = true,
  layout = 'horizontal',
  onItemClick,
  excludeIds = [],
  className = ''
}: RecentlyViewedProps) {
  const t = useTranslations('favorites')
  const { recentlyViewed, isLoaded, getRecentlyViewed, clearRecentlyViewed, removeFromRecentlyViewed } = useFavorites()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  // Load properties data
  useEffect(() => {
    async function loadProperties() {
      if (!isLoaded) return
      
      if (recentlyViewed.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const loaded = await getRecentlyViewed()
        // Filter out excluded IDs and apply limit
        const filtered = loaded
          .filter(p => !excludeIds.includes(p.id))
          .slice(0, limit)
        setProperties(filtered)
      } catch (e) {
        console.error('Failed to load recently viewed:', e)
      } finally {
        setLoading(false)
      }
    }

    loadProperties()
  }, [recentlyViewed, isLoaded, getRecentlyViewed, excludeIds, limit])

  // Don't render if no items and not loading
  if (!loading && properties.length === 0) {
    return null
  }

  const handleClearAll = () => {
    if (confirm(t('clearHistoryConfirm') || 'Clear all recently viewed properties?')) {
      clearRecentlyViewed()
    }
  }

  const handleRemove = (e: React.MouseEvent, propertyId: string) => {
    e.preventDefault()
    e.stopPropagation()
    removeFromRecentlyViewed(propertyId)
    setProperties(prev => prev.filter(p => p.id !== propertyId))
  }

  const containerClasses = {
    horizontal: 'flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent',
    vertical: 'flex flex-col gap-3',
    grid: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'
  }

  if (loading) {
    return (
      <div className={className}>
        {showTitle && (
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        )}
        <div className={containerClasses[layout]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className={layout === 'horizontal' ? 'h-32 w-64 flex-shrink-0' : 'h-24'} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">{t('recentlyViewed')}</h2>
            <Badge variant="secondary" className="text-xs">
              {properties.length}
            </Badge>
          </div>
          {showClearButton && properties.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {t('clearHistory')}
            </Button>
          )}
        </div>
      )}

      {/* Items */}
      <div className={containerClasses[layout]}>
        {properties.map((property) => (
          <RecentlyViewedCard
            key={property.id}
            property={property}
            layout={layout}
            onClick={() => onItemClick?.(property)}
            onRemove={(e) => handleRemove(e, property.id)}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Individual recently viewed card
 */
interface RecentlyViewedCardProps {
  property: Property
  layout: 'horizontal' | 'vertical' | 'grid'
  onClick?: () => void
  onRemove?: (e: React.MouseEvent) => void
}

function RecentlyViewedCard({ property, layout, onClick, onRemove }: RecentlyViewedCardProps) {
  const t = useTranslations('favorites')

  const cardContent = (
    <Card className="h-full hover:shadow-md transition-shadow group relative">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
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
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-2">
            <div onClick={(e) => e.preventDefault()}>
              <FavoriteButton propertyId={property.id} size="sm" />
            </div>
            {onRemove && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={onRemove}
                title={t('removeFromHistory') || 'Remove from history'}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (onClick) {
    return (
      <div onClick={onClick} className="cursor-pointer">
        {cardContent}
      </div>
    )
  }

  return (
    <Link href={`/properties/${property.id}`} className="block">
      {cardContent}
    </Link>
  )
}

/**
 * Compact inline version for embedding in other components
 */
export function RecentlyViewedInline({ 
  limit = 5,
  className = '' 
}: { 
  limit?: number
  className?: string 
}) {
  const t = useTranslations('favorites')
  const { recentlyViewed, isLoaded, getRecentlyViewed } = useFavorites()
  const [properties, setProperties] = useState<Property[]>([])

  useEffect(() => {
    async function load() {
      if (!isLoaded || recentlyViewed.length === 0) return
      const loaded = await getRecentlyViewed()
      setProperties(loaded.slice(0, limit))
    }
    load()
  }, [recentlyViewed, isLoaded, getRecentlyViewed, limit])

  if (!isLoaded || properties.length === 0) return null

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        <Eye className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">
          {t('recentlyViewed')}
        </span>
      </div>
      <div className="flex gap-2 flex-wrap">
        {properties.map((property) => (
          <Link key={property.id} href={`/properties/${property.id}`}>
            <Badge 
              variant="secondary" 
              className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
            >
              {property.name}
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RecentlyViewed
