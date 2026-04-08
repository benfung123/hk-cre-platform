'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useSimpleToast } from '@/components/ui/toast-provider'
import { useTranslations } from 'next-intl'
import type { Property } from '@/types'

const FAVORITES_STORAGE_KEY = 'hk-cre-favorites'
const RECENTLY_VIEWED_KEY = 'hk-cre-recently-viewed'
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
  const [state, setState] = useState<FavoritesState>({
    favorites: [],
    recentlyViewed: []
  })
  const [isLoaded, setIsLoaded] = useState(false)
  const isUpdatingRef = useRef(false)
  const toast = useSimpleToast()
  const t = useTranslations('toast')

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const favoritesStored = localStorage.getItem(FAVORITES_STORAGE_KEY)
      const recentlyViewedStored = localStorage.getItem(RECENTLY_VIEWED_KEY)

      const newState: FavoritesState = {
        favorites: favoritesStored ? JSON.parse(favoritesStored) : [],
        recentlyViewed: recentlyViewedStored ? JSON.parse(recentlyViewedStored) : []
      }

      setState(newState)
    } catch (e) {
      console.error('Failed to parse favorites/recently viewed:', e)
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined' || isUpdatingRef.current) return

    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(state.favorites))
    } catch (e) {
      console.error('Failed to save favorites:', e)
    }
  }, [state.favorites, isLoaded])

  // Save recently viewed to localStorage whenever they change
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined' || isUpdatingRef.current) return

    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(state.recentlyViewed))
    } catch (e) {
      console.error('Failed to save recently viewed:', e)
    }
  }, [state.recentlyViewed, isLoaded])

  /**
   * Add a property to favorites
   * Returns true if added, false if already exists or at max limit
   */
  const addFavorite = useCallback((propertyId: string): boolean => {
    let shouldAdd = false

    setState(prev => {
      if (prev.favorites.includes(propertyId)) {
        toast.info(t('alreadyInFavorites') || 'Already in favorites', undefined, undefined, 'favorites-toast')
        return prev
      }
      if (prev.favorites.length >= MAX_FAVORITES) {
        toast.warning(t('favoritesFull') || 'Favorites list full', undefined, undefined, 'favorites-toast')
        return prev
      }
      shouldAdd = true
      return {
        ...prev,
        favorites: [...prev.favorites, propertyId]
      }
    })

    // Show toast outside setState to avoid cascading renders
    if (shouldAdd) {
      // Use setTimeout to avoid synchronous setState during render issues
      setTimeout(() => {
        toast.success(t('addedToFavorites') || 'Added to watchlist', undefined, undefined, 'favorites-toast')
      }, 0)
    }
    return shouldAdd
  }, [toast, t])

  /**
   * Remove a property from favorites
   */
  const removeFavorite = useCallback((propertyId: string) => {
    let shouldRemove = false
    
    setState(prev => {
      const exists = prev.favorites.includes(propertyId)
      if (exists) {
        shouldRemove = true
      }
      return {
        ...prev,
        favorites: prev.favorites.filter(id => id !== propertyId)
      }
    })
    
    // Show toast outside setState
    if (shouldRemove) {
      setTimeout(() => {
        toast.info(t('removedFromFavorites') || 'Removed from watchlist', undefined, undefined, 'favorites-toast')
      }, 0)
    }
  }, [toast, t])

  /**
   * Toggle a property's favorite status
   * Returns true if now favorited, false if unfavorited
   */
  const toggleFavorite = useCallback((propertyId: string): boolean => {
    let action: 'added' | 'removed' | 'full' | null = null

    setState(prev => {
      const exists = prev.favorites.includes(propertyId)
      if (exists) {
        action = 'removed'
        return {
          ...prev,
          favorites: prev.favorites.filter(id => id !== propertyId)
        }
      }
      if (prev.favorites.length >= MAX_FAVORITES) {
        action = 'full'
        return prev
      }
      action = 'added'
      return {
        ...prev,
        favorites: [...prev.favorites, propertyId]
      }
    })

    // Show toast outside setState using setTimeout
    if (action === 'added') {
      setTimeout(() => {
        toast.success(t('addedToFavorites') || 'Added to watchlist', undefined, undefined, 'favorites-toast')
      }, 0)
      return true
    } else if (action === 'removed') {
      setTimeout(() => {
        toast.info(t('removedFromFavorites') || 'Removed from watchlist', undefined, undefined, 'favorites-toast')
      }, 0)
      return false
    } else if (action === 'full') {
      setTimeout(() => {
        toast.warning(t('favoritesFull') || 'Favorites list full', undefined, undefined, 'favorites-toast')
      }, 0)
    }
    return false
  }, [toast, t])

  /**
   * Check if a property is favorited
   */
  const isFavorite = useCallback((propertyId: string): boolean => {
    return state.favorites.includes(propertyId)
  }, [state.favorites])

  /**
   * Clear all favorites
   */
  const clearAllFavorites = useCallback(() => {
    setState(prev => ({
      ...prev,
      favorites: []
    }))
  }, [])

  /**
   * Add a property to recently viewed
   * - Moves to front if already exists
   * - Keeps only last 10 items
   * - Skips if property is in favorites (optional behavior)
   */
  const addToRecentlyViewed = useCallback((propertyId: string) => {
    setState(prev => {
      // Remove if already exists to move to front
      const filtered = prev.recentlyViewed.filter(id => id !== propertyId)
      
      // Add to front
      const updated = [propertyId, ...filtered].slice(0, MAX_RECENT_ITEMS)
      
      return {
        ...prev,
        recentlyViewed: updated
      }
    })
  }, [])

  /**
   * Clear all recently viewed
   */
  const clearRecentlyViewed = useCallback(() => {
    setState(prev => ({
      ...prev,
      recentlyViewed: []
    }))
  }, [])

  /**
   * Remove a specific property from recently viewed
   */
  const removeFromRecentlyViewed = useCallback((propertyId: string) => {
    setState(prev => ({
      ...prev,
      recentlyViewed: prev.recentlyViewed.filter(id => id !== propertyId)
    }))
  }, [])

  /**
   * Fetch full property data for favorites
   * Filters out any properties that no longer exist in the database
   */
  const getFavorites = useCallback(async (): Promise<Property[]> => {
    if (state.favorites.length === 0) return []

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', state.favorites)

    if (error) {
      console.error('Error fetching favorite properties:', error)
      return []
    }

    // If some properties were deleted from DB, remove them from favorites
    const foundIds = new Set((data as Property[] | null)?.map(p => p.id) || [])
    const missingIds = state.favorites.filter(id => !foundIds.has(id))
    
    if (missingIds.length > 0) {
      console.warn('Some favorites no longer exist, removing:', missingIds)
      setState(prev => ({
        ...prev,
        favorites: prev.favorites.filter(id => !missingIds.includes(id))
      }))
    }

    // Return in the same order as favorites array
    const propertyMap = new Map((data as Property[] | null)?.map(p => [p.id, p]))
    return state.favorites
      .map(id => propertyMap.get(id))
      .filter((p): p is Property => p !== undefined)
  }, [state.favorites])

  /**
   * Fetch full property data for recently viewed
   * Filters out any properties that no longer exist
   */
  const getRecentlyViewed = useCallback(async (): Promise<Property[]> => {
    if (state.recentlyViewed.length === 0) return []

    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .in('id', state.recentlyViewed)

    if (error) {
      console.error('Error fetching recently viewed properties:', error)
      return []
    }

    // Return in the same order as recentlyViewed array
    const propertyMap = new Map((data as Property[] | null)?.map(p => [p.id, p]))
    return state.recentlyViewed
      .map(id => propertyMap.get(id))
      .filter((p): p is Property => p !== undefined)
  }, [state.recentlyViewed])

  return {
    favorites: state.favorites,
    recentlyViewed: state.recentlyViewed,
    isLoaded,
    favoritesCount: state.favorites.length,
    recentlyViewedCount: state.recentlyViewed.length,
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
