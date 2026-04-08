'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSimpleToast } from '@/components/ui/toast-provider'
import { useTranslations } from 'next-intl'

const STORAGE_KEY = 'hk-cre-compare-v2'
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
  const [compareList, setCompareList] = useState<string[] | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const toast = useSimpleToast()
  const t = useTranslations('toast')
  const isClient = useRef(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    isClient.current = true
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        console.log('[useCompare] Loaded from localStorage:', parsed)
        setCompareList(parsed)
      } else {
        console.log('[useCompare] No stored data found, initializing empty')
        setCompareList([])
      }
    } catch (e) {
      console.error('[useCompare] Failed to parse compare list:', e)
      setCompareList([])
    } finally {
      setIsLoaded(true)
      console.log('[useCompare] Initialization complete')
    }
  }, [])

  // Save to localStorage whenever list changes
  useEffect(() => {
    if (!isClient.current || compareList === null) return
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareList))
      console.log('[useCompare] Saved to localStorage:', compareList)
    } catch (e) {
      console.error('[useCompare] Failed to save compare list:', e)
    }
  }, [compareList])

  const addToCompare = useCallback((propertyId: string) => {
    if (compareList === null) return
    
    if (compareList.includes(propertyId)) {
      setTimeout(() => {
        toast.info(t('alreadyInCompare') || 'Already in compare list', undefined, undefined, 'compare-toast')
      }, 0)
      return
    }
    
    if (compareList.length >= MAX_COMPARE) {
      setTimeout(() => {
        toast.warning(t('compareFull') || 'Compare list full (max 3)', undefined, undefined, 'compare-toast')
      }, 0)
      return
    }

    setCompareList(prev => [...(prev || []), propertyId])
    
    setTimeout(() => {
      toast.success(t('addedToCompare') || 'Added to compare', undefined, undefined, 'compare-toast')
    }, 0)
    
    console.log('[useCompare] Added to compare:', propertyId)
  }, [compareList, toast, t])

  const removeFromCompare = useCallback((propertyId: string) => {
    if (compareList === null) return
    
    const exists = compareList.includes(propertyId)
    if (!exists) return

    setCompareList(prev => (prev || []).filter(id => id !== propertyId))
    
    setTimeout(() => {
      toast.info(t('removedFromCompare') || 'Removed from compare', undefined, undefined, 'compare-toast')
    }, 0)
    
    console.log('[useCompare] Removed from compare:', propertyId)
  }, [compareList, toast, t])

  const toggleCompare = useCallback((propertyId: string) => {
    if (compareList === null) return
    
    const exists = compareList.includes(propertyId)
    
    if (exists) {
      setCompareList(prev => (prev || []).filter(id => id !== propertyId))
      setTimeout(() => {
        toast.info(t('removedFromCompare') || 'Removed from compare', undefined, undefined, 'compare-toast')
      }, 0)
      console.log('[useCompare] Toggled off compare:', propertyId)
      return
    }
    
    if (compareList.length >= MAX_COMPARE) {
      setTimeout(() => {
        toast.warning(t('compareFull') || 'Compare list full (max 3)', undefined, undefined, 'compare-toast')
      }, 0)
      return
    }

    setCompareList(prev => [...(prev || []), propertyId])
    setTimeout(() => {
      toast.success(t('addedToCompare') || 'Added to compare', undefined, undefined, 'compare-toast')
    }, 0)
    
    console.log('[useCompare] Toggled on compare:', propertyId)
  }, [compareList, toast, t])

  const isInCompare = useCallback((propertyId: string) => {
    return (compareList || []).includes(propertyId)
  }, [compareList])

  const currentList = compareList || []
  const canAddMore = currentList.length < MAX_COMPARE
  const isFull = currentList.length >= MAX_COMPARE

  const clearCompare = useCallback(() => {
    setCompareList([])
    console.log('[useCompare] Cleared all compare items')
  }, [])

  return {
    compareList: currentList,
    compareCount: currentList.length,
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
