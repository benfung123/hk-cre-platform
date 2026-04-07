'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'hk-cre-comparison'
const MAX_COMPARE = 3

export function useComparison() {
  const [comparisonList, setComparisonList] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setComparisonList(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse comparison list:', e)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save to localStorage whenever list changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comparisonList))
    }
  }, [comparisonList, isLoaded])

  const addToComparison = useCallback((propertyId: string) => {
    setComparisonList(prev => {
      if (prev.includes(propertyId)) return prev
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, propertyId]
    })
  }, [])

  const removeFromComparison = useCallback((propertyId: string) => {
    setComparisonList(prev => prev.filter(id => id !== propertyId))
  }, [])

  const toggleComparison = useCallback((propertyId: string) => {
    setComparisonList(prev => {
      if (prev.includes(propertyId)) {
        return prev.filter(id => id !== propertyId)
      }
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, propertyId]
    })
  }, [])

  const isInComparison = useCallback((propertyId: string) => {
    return comparisonList.includes(propertyId)
  }, [comparisonList])

  const canAddMore = comparisonList.length < MAX_COMPARE
  const isFull = comparisonList.length >= MAX_COMPARE

  const clearComparison = useCallback(() => {
    setComparisonList([])
  }, [])

  return {
    comparisonList,
    comparisonCount: comparisonList.length,
    isLoaded,
    addToComparison,
    removeFromComparison,
    toggleComparison,
    isInComparison,
    canAddMore,
    isFull,
    clearComparison,
    maxCompare: MAX_COMPARE
  }
}
