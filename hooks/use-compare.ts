'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSimpleToast } from '@/components/ui/toast-provider'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'hk-cre-compare'
const MAX_COMPARE = 3

export interface CompareItem {
  id: string;
  name: string;
  grade: string;
  rent_per_sqft: number;
  price_per_sqft: number;
  total_area: number;
  year_built: number;
  floors: number;
  district: string;
  image_url?: string;
}

export function useCompare() {
  const [compareList, setCompareList] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const toast = useSimpleToast()
  const t = useTranslations('toast')

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setCompareList(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse compare list:', e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever list changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList))
    }
  }, [compareList, isLoaded])

  const addToCompare = useCallback((propertyId: string) => {
    let action: 'added' | 'already' | 'full' | null = null

    setCompareList(prev => {
      if (prev.includes(propertyId)) {
        action = 'already'
        return prev
      }
      if (prev.length >= MAX_COMPARE) {
        action = 'full'
        return prev
      }
      action = 'added'
      return [...prev, propertyId]
    })

    // Show toast outside setState using setTimeout
    if (action === 'added') {
      setTimeout(() => {
        toast.success(t('addedToCompare') || 'Added to compare', undefined, undefined, 'compare-toast')
      }, 0)
    } else if (action === 'already') {
      setTimeout(() => {
        toast.info(t('alreadyInCompare') || 'Already in compare list', undefined, undefined, 'compare-toast')
      }, 0)
    } else if (action === 'full') {
      setTimeout(() => {
        toast.warning(t('compareFull') || 'Compare list full (max 3)', undefined, undefined, 'compare-toast')
      }, 0)
    }
  }, [toast, t])

  const removeFromCompare = useCallback((propertyId: string) => {
    let shouldRemove = false
    
    setCompareList(prev => {
      const exists = prev.includes(propertyId)
      if (exists) {
        shouldRemove = true
      }
      return prev.filter(id => id !== propertyId)
    })
    
    // Show toast outside setState
    if (shouldRemove) {
      setTimeout(() => {
        toast.info(t('removedFromCompare') || 'Removed from compare', undefined, undefined, 'compare-toast')
      }, 0)
    }
  }, [toast, t])

  const toggleCompare = useCallback((propertyId: string) => {
    let action: 'added' | 'removed' | 'full' | null = null

    setCompareList(prev => {
      if (prev.includes(propertyId)) {
        action = 'removed'
        return prev.filter(id => id !== propertyId)
      }
      if (prev.length >= MAX_COMPARE) {
        action = 'full'
        return prev
      }
      action = 'added'
      return [...prev, propertyId]
    })

    // Show toast outside setState using setTimeout
    if (action === 'added') {
      setTimeout(() => {
        toast.success(t('addedToCompare') || 'Added to compare', undefined, undefined, 'compare-toast')
      }, 0)
    } else if (action === 'removed') {
      setTimeout(() => {
        toast.info(t('removedFromCompare') || 'Removed from compare', undefined, undefined, 'compare-toast')
      }, 0)
    } else if (action === 'full') {
      setTimeout(() => {
        toast.warning(t('compareFull') || 'Compare list full (max 3)', undefined, undefined, 'compare-toast')
      }, 0)
    }
  }, [toast, t])

  const isInCompare = useCallback((propertyId: string) => {
    return compareList.includes(propertyId)
  }, [compareList])

  const canAddMore = compareList.length < MAX_COMPARE
  const isFull = compareList.length >= MAX_COMPARE

  const clearCompare = useCallback(() => {
    setCompareList([])
  }, [])

  return {
    compareList,
    compareCount: compareList.length,
    isLoaded,
    addToCompare,
    removeFromCompare,
    toggleCompare,
    isInCompare,
    canAddMore,
    isFull,
    clearCompare,
    maxCompare: MAX_COMPARE
  }
}
