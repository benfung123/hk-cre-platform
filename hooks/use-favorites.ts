'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'hk-cre-favorites'

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setFavorites(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse favorites:', e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever favorites change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites))
    }
  }, [favorites, isLoaded])

  const addFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) return prev
      return [...prev, propertyId]
    })
  }, [])

  const removeFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => prev.filter(id => id !== propertyId))
  }, [])

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavorites(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId)
      }
      return [...prev, propertyId]
    })
  }, [])

  const isFavorite = useCallback((propertyId: string) => {
    return favorites.includes(propertyId)
  }, [favorites])

  const clearFavorites = useCallback(() => {
    setFavorites([])
  }, [])

  return {
    favorites,
    isLoaded,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    favoritesCount: favorites.length
  }
}
