'use client'

import { Scale, X, ArrowRight, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCompare } from '@/hooks/use-compare'
import { useFavorites } from '@/hooks/use-favorites'
import { Link } from '@/src/i18n/routing'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { usePropertyData } from '@/hooks/use-property-data'
import { useEffect, useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface PropertyPreview {
  id: string
  name: string
  grade: string
  image_url?: string
}

export function ComparisonBar() {
  const t = useTranslations('compare')
  const tf = useTranslations('favorites')
  const { compareList, compareCount, clearCompare, removeFromCompare, isLoaded } = useCompare()
  const { addFavorite, isFavorite } = useFavorites()
  const { getPropertyById } = usePropertyData()
  const [properties, setProperties] = useState<PropertyPreview[]>([])
  const [showAddAllFavorites, setShowAddAllFavorites] = useState(false)

  useEffect(() => {
    async function loadProperties() {
      if (compareList.length === 0) {
        setProperties([])
        return
      }

      const loaded = (await Promise.all(
        compareList.map(async (id) => {
          const property = await getPropertyById(id)
          return property ? { 
            id: property.id, 
            name: property.name, 
            grade: property.grade || '',
            image_url: undefined
          } : null
        })
      )).filter((p): p is PropertyPreview => p !== null)
      setProperties(loaded)
    }

    loadProperties()
  }, [compareList, getPropertyById])

  // Check if any properties can be added to favorites
  useEffect(() => {
    const hasUnfavorited = properties.some(p => !isFavorite(p.id))
    setShowAddAllFavorites(hasUnfavorited)
  }, [properties, isFavorite])

  const handleAddAllToFavorites = () => {
    let addedCount = 0
    properties.forEach(property => {
      if (!isFavorite(property.id)) {
        addFavorite(property.id)
        addedCount++
      }
    })
    
    // Show feedback (could use toast here)
    if (addedCount > 0) {
      console.log(`Added ${addedCount} properties to favorites`)
    }
  }

  if (!isLoaded || compareCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-background border shadow-lg rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 max-w-[95vw] sm:max-w-none">
        {/* Selected Properties Preview */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-3 py-1.5 rounded-full">
            <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
              {compareCount}
            </div>
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {t('propertiesSelected', { count: compareCount })}
            </span>
          </div>

          {/* Property Thumbnails */}
          <div className="flex items-center gap-1">
            {properties.map((property) => (
              <TooltipProvider key={property.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={cn(
                        "relative group flex items-center gap-2 bg-muted rounded-full pl-1 pr-3 py-1 cursor-pointer hover:bg-accent transition-colors",
                        isFavorite(property.id) && "ring-2 ring-red-200"
                      )}
                    >
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-300">
                        {property.grade}
                      </div>
                      <span className="text-sm truncate max-w-[100px] hidden sm:inline">{property.name}</span>
                      
                      {/* Favorite indicator */}
                      {isFavorite(property.id) && (
                        <Heart className="h-3 w-3 text-red-500 fill-red-500 absolute -top-1 -right-1" />
                      )}
                      
                      <button
                        onClick={() => removeFromCompare(property.id)}
                        className="ml-1 p-0.5 rounded-full hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{property.name}</p>
                    {isFavorite(property.id) && <p className="text-xs text-red-500">{tf('saved')}</p>}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>

        <div className="hidden sm:block h-6 w-px bg-border" />

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Add All to Favorites Button */}
          {showAddAllFavorites && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleAddAllToFavorites}
                  >
                    <Heart className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">{tf('save')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tf('saveAllToFavorites') || 'Save all to favorites'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Link href="/compare" className="flex-1 sm:flex-none">
            <Button size="sm" className="rounded-full w-full sm:w-auto">
              <Scale className="h-4 w-4 mr-2" />
              {t('compareButton')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0"
            onClick={clearCompare}
            title={t('clearAll')}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
