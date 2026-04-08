'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSimpleToast } from '@/components/ui/toast-provider'
import { useTranslations } from 'next-intl'
import type { Property } from '@/types'

const FAVORITES_STORAGE_KEY = 'hk-cre-favorites-v2'
const RECENTLY_VIEWED_KEY = 'hk-cre-recently-viewed-v2'
const MAX_FAVORITES = 50
const MAX_RECENT_ITEMS = 10

interface FavoritesState {
  favorites: string[]
  recentlyViewed: string[]
}

interface UseFavoritesReturn extends FavoritesState {
  isLoaded: boolean
  favoritesCount: number
  recentlyViewedCount: number
  addFavorite: (propertyId: string) => boolean
  removeFavorite: (propertyId: string) => void
  toggleFavorite: (propertyId: string) => boolean
  isFavorite: (propertyId: string) => boolean
  clearAllFavorites: () => void
  addToRecentlyViewed: (propertyId: string) => void
  clearRecentlyViewed: () => void
  getFavorites: () => Promise<Property[]>
  getRecentlyViewed: () => Promise<Property[]>
  removeFromRecentlyViewed: (propertyId: string) => void
}

/**
 * Custom hook for managing favorites and recently viewed properties
 * 
 * Features:
 * - Persist favorites to localStorage (guest users)
 * - Track recently viewed properties (last 10)
 * - Prevent duplicates in favorites
 * - Optional max limit for favorites (50 for guests)
 * - SSR-safe with hydration handling
 * - Optimistic UI updates
 */
export function useFavorites(): UseFavoritesReturn {
  // Initialize with null to detect loading state properly
  const [favorites, setFavorites] = useState<string[] | null>(null)
  const [recentlyViewed, setRecentlyViewed] = useState<string[] | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const toast = useSimpleToast()
  const t = useTranslations('toast')
  const isClient = useRef(false)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    isClient.current = true
    
    try {
      const favoritesStored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      const recentlyViewedStored = localStorage.getItem(RECENTLY_VIEWED_KEY)

      console.log('[useFavorites] Loading from localStorage:', {
        favoritesStored: favoritesStored ? JSON.parse(favoritesStored) : [],
        recentlyViewedStored: recentlyViewedStored ? JSON.parse(recentlyViewedStored) : []
      })

      setFavorites(favoritesStored ? JSON.parse(favoritesStored) : [])
      setRecentlyViewed(recentlyViewedStored ? JSON.parse(recentlyViewedStored) : [])
    } catch (e) {
      console.error('[useFavorites] Failed to parse favorites/recently viewed:', e)
      setFavorites([])
      setRecentlyViewed([])
    } finally {
      setIsLoaded(true)
      console.log('[useFavorites] Initialization complete')
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isClient.current || favorites === null) return

    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites))
      console.log('[useFavorites] Saved favorites to localStorage:', favorites)
    } catch (e) {
      console.error('[useFavorites] Failed to save favorites:', e)
    }
  }, [favorites])

  // Save recently viewed to localStorage whenever they change
  useEffect(() => {
    if (!isClient.current || recentlyViewed === null) return

    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(recentlyViewed))
      console.log('[useFavorites] Saved recently viewed to localStorage:', recentlyViewed)
    } catch (e) {
      console.error('[useFavorites] Failed to save recently viewed:', e)
    }
  }, [recentlyViewed])

  /**
   * Add a property to favorites
   * Returns true if added, false if already exists or at max limit
   */
  const addFavorite = useCallback((propertyId: string): boolean => {
    if (favorites === null) return false
    
    if (favorites.includes(propertyId)) {
      toast.info(t('alreadyInFavorites') || 'Already in favorites', undefined, undefined, 'favorites-toast')
      return false
    }
    
    if (favorites.length >= MAX_FAVORITES) {
      toast.warning(t('favoritesFull') || 'Favorites list full', undefined, undefined, 'favorites-toast')
      return false
    }

    setFavorites(prev => [...(prev || []), propertyId])
    
    setTimeout(() => {
      toast.success(t('addedToFavorites') || 'Added to watchlist', undefined, undefined, 'favorites-toast')
    }, 0)
    
    console.log('[useFavorites] Added favorite:', propertyId)
    return true
  }, [favorites, toast, t])

  /**
   * Remove a property from favorites
   */
  const removeFavorite = useCallback((propertyId: string) => {
    if (favorites === null) return
    
    const exists = favorites.includes(propertyId)
    if (!exists) return

    setFavorites(prev => (prev || []).filter(id => id !== propertyId))
    
    setTimeout(() => {
      toast.info(t('removedFromFavorites') || 'Removed from watchlist', undefined, undefined, 'favorites-toast')
    }, 0)
    
    console.log('[useFavorites] Removed favorite:', propertyId)
  }, [favorites, toast, t])

  /**
   * Toggle a property's favorite status
   * Returns true if now favorited, false if unfavorited
   */
  const toggleFavorite = useCallback((propertyId: string): boolean => {
    if (favorites === null) return false
    
    const exists = favorites.includes(propertyId)
    
    if (exists) {
      setFavorites(prev => (prev || []).filter(id => id !== propertyId))
      setTimeout(() => {
        toast.info(t('removedFromFavorites') || 'Removed from watchlist', undefined, undefined, 'favorites-toast')
      }, 0)
      console.log('[useFavorites] Toggled off favorite:', propertyId)
      return false
    }
    
    if (favorites.length >= MAX_FAVORITES) {
      setTimeout(() => {
        toast.warning(t('favoritesFull') || 'Favorites list full', undefined, undefined, 'favorites-toast')
      }, 0)
      return false
    }

    setFavorites(prev => [...(prev || []), propertyId])
    setTimeout(() => {
      toast.success(t('addedToFavorites') || 'Added to watchlist', undefined, undefined, 'favorites-toast')
    }, 0)
    
    console.log('[useFavorites] Toggled on favorite:', propertyId)
    return true
  }, [favorites, toast, t])

  /**
   * Check if a property is favorited
   */
  const isFavorite = useCallback((propertyId: string): boolean => {
    return (favorites || []).includes(propertyId)
  }, [favorites])

  /**
   * Clear all favorites
   */
  const clearAllFavorites = useCallback(() => {
    setFavorites([])
    console.log('[useFavorites] Cleared all favorites')
  }, [])

  /**
   * Add a property to recently viewed
   * - Moves to front if already exists
   * - Keeps only last 10 items
   */
  const addToRecentlyViewed = useCallback((propertyId: string) => {
    setRecentlyViewed(prev => {
      const current = prev || []
      // Remove if already exists to move to front
      const filtered = current.filter(id => id !== propertyId)
      // Add to front
      const updated = [propertyId, ...filtered].slice(0, MAX_RECENT_ITEMS)
      console.log('[useFavorites] Added to recently viewed:', propertyId)
      return updated
    })
  }, [])

  /**
   * Clear all recently viewed
   */
  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([])
    console.log('[useFavorites] Cleared all recently viewed')
  }, [])

  /**
   * Remove a specific property from recently viewed
   */
  const removeFromRecentlyViewed = useCallback((propertyId: string) => {
    setRecentlyViewed(prev => (prev || []).filter(id => id !== propertyId))
    console.log('[useFavorites] Removed from recently viewed:', propertyId)
  }, [])

  /**
   * Fetch full property data for favorites
   * Filters out any properties that no longer exist in the database
   */
  const getFavorites = useCallback(async (): Promise<Property[]> => {
    const currentFavorites = favorites || []
    if (currentFavorites.length === 0) return []

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', currentFavorites)

    if (error) {
      console.error('[useFavorites] Error fetching favorite properties:', error)
      return []
    }

    // If some properties were deleted from DB, remove them from favorites
    const foundIds = new Set((data as Property[] | null)?.map(p => p.id) || [])
    const missingIds = currentFavorites.filter(id => !foundIds.has(id))
    
    if (missingIds.length > 0) {
      console.warn('[useFavorites] Some favorites no longer exist, removing:', missingIds)
      setFavorites(prev => (prev || []).filter(id => !missingIds.includes(id)))
    }

    // Return in the same order as favorites array
    const propertyMap = new Map((data as Property[] | null)?.map(p => [p.id, p]))
    return currentFavorites
      .map(id => propertyMap.get(id))
      .filter((p): p is Property => p !== undefined)
  }, [favorites])

  /**
   * Fetch full property data for recently viewed
   * Filters out any properties that no longer exist
   */
  const getRecentlyViewed = useCallback(async (): Promise<Property[]> => {
    const currentRecent = recentlyViewed || []
    if (currentRecent.length === 0) return []

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', currentRecent)

    if (error) {
      console.error('[useFavorites] Error fetching recently viewed properties:', error)
      return []
    }

    // Return in the same order as recentlyViewed array
    const propertyMap = new Map((data as Property[] | null)?.map(p => [p.id, p]))
    return currentRecent
      .map(id => propertyMap.get(id))
      .filter((p): p is Property => p !== undefined)
  }, [recentlyViewed])

  return {
    favorites: favorites || [],
    recentlyViewed: recentlyViewed || [],
    isLoaded,
    favoritesCount: (favorites || []).length,
    recentlyViewedCount: (recentlyViewed || []).length,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearAllFavorites,
    addToRecentlyViewed,
    clearRecentlyViewed,
    getFavorites,
    getRecentlyViewed,
    removeFromRecentlyViewed
  }
}

export default useFavorites
