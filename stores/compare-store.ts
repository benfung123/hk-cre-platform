'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface CompareState {
  compareList: string[]
  isHydrated: boolean
  setHydrated: (value: boolean) => void
  addToCompare: (id: string) => boolean
  removeFromCompare: (id: string) => void
  toggleCompare: (id: string) => boolean
  isInCompare: (id: string) => boolean
  clearCompare: () => void
  canAddMore: () => boolean
  isFull: () => boolean
}

const MAX_COMPARE = 3

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      compareList: [],
      isHydrated: false,

      setHydrated: (value: boolean) => set({ isHydrated: value }),

      addToCompare: (id: string) => {
        const { compareList } = get()
        if (compareList.includes(id)) return false
        if (compareList.length >= MAX_COMPARE) return false
        set({ compareList: [...compareList, id] })
        return true
      },

      removeFromCompare: (id: string) => {
        const { compareList } = get()
        set({ compareList: compareList.filter(item => item !== id) })
      },

      toggleCompare: (id: string) => {
        const { compareList, addToCompare, removeFromCompare } = get()
        if (compareList.includes(id)) {
          removeFromCompare(id)
          return false
        }
        return addToCompare(id)
      },

      isInCompare: (id: string) => {
        return get().compareList.includes(id)
      },

      clearCompare: () => set({ compareList: [] }),

      canAddMore: () => {
        return get().compareList.length < MAX_COMPARE
      },

      isFull: () => {
        return get().compareList.length >= MAX_COMPARE
      }
    }),
    {
      name: 'hk-cre-compare-v2',
      skipHydration: true
    }
  )
)

// Hook to handle hydration properly in components
export function useCompareHydration() {
  const store = useCompareStore()
  
  // Handle hydration on mount
  if (typeof window !== 'undefined' && !store.isHydrated) {
    store.setHydrated(true)
  }
  
  return store
}
