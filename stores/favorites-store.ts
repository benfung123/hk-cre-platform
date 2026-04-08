'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favorites: string[]
  recentlyViewed: string[]
  isHydrated: boolean
  setHydrated: (value: boolean) => void
  addFavorite: (id: string) => boolean
  removeFavorite: (id: string) => void
  toggleFavorite: (id: string) => boolean
  isFavorite: (id: string) => boolean
  clearAllFavorites: () => void
  addToRecentlyViewed: (id: string) => void
  removeFromRecentlyViewed: (id: string) => void
  clearRecentlyViewed: () => void
}

const MAX_FAVORITES = 50
const MAX_RECENT_ITEMS = 10

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      recentlyViewed: [],
      isHydrated: false,

      setHydrated: (value: boolean) => set({ isHydrated: value }),

      addFavorite: (id: string) => {
        const { favorites } = get()
        if (favorites.includes(id)) return false
        if (favorites.length >= MAX_FAVORITES) return false
        set({ favorites: [...favorites, id] })
        return true
      },

      removeFavorite: (id: string) => {
        const { favorites } = get()
        set({ favorites: favorites.filter(item => item !== id) })
      },

      toggleFavorite: (id: string) => {
        const { favorites, addFavorite, removeFavorite } = get()
        if (favorites.includes(id)) {
          removeFavorite(id)
          return false
        }
        return addFavorite(id)
      },

      isFavorite: (id: string) => {
        return get().favorites.includes(id)
      },

      clearAllFavorites: () => set({ favorites: [] }),

      addToRecentlyViewed: (id: string) => {
        set(state => {
          const current = state.recentlyViewed
          // Remove if already exists to move to front
          const filtered = current.filter(item => item !== id)
          // Add to front and keep only last MAX_RECENT_ITEMS
          const updated = [id, ...filtered].slice(0, MAX_RECENT_ITEMS)
          return { recentlyViewed: updated }
        })
      },

      removeFromRecentlyViewed: (id: string) => {
        set(state => ({
          recentlyViewed: state.recentlyViewed.filter(item => item !== id)
        }))
      },

      clearRecentlyViewed: () => set({ recentlyViewed: [] })
    }),
    {
      name: 'hk-cre-favorites-v2',
      skipHydration: true
    }
  )
)

// Hook to handle hydration properly in components
export function useFavoritesHydration() {
  const store = useFavoritesStore()
  
  // Handle hydration on mount
  if (typeof window !== 'undefined' && !store.isHydrated) {
    store.setHydrated(true)
  }
  
  return store
}
