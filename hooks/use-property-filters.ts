'use client'

import { useState, useCallback, useMemo } from 'react'
import type { PropertyType } from '@/components/property-type-filter'

export interface PropertyFiltersState {
  propertyType: PropertyType
  grade: string
  showGradeFilter: boolean
  availableGrades: string[]
}

export function usePropertyFilters() {
  const [propertyType, setPropertyType] = useState<PropertyType>('office')
  const [grade, setGrade] = useState<string>('')
  
  // Reset grade when switching away from office
  const handlePropertyTypeChange = useCallback((type: PropertyType) => {
    setPropertyType(type)
    // Only office has grades - reset when switching to retail/industrial
    if (type !== 'office') {
      setGrade('')
    }
  }, [])
  
  // Show grades only for office type
  const showGradeFilter = useMemo(() => propertyType === 'office', [propertyType])
  
  // Available grades (only for office)
  const availableGrades = useMemo(() => {
    if (propertyType !== 'office') return []
    return ['A+', 'A', 'B', 'C']
  }, [propertyType])
  
  return {
    propertyType,
    grade,
    showGradeFilter,
    availableGrades,
    setPropertyType: handlePropertyTypeChange,
    setGrade
  }
}
