'use client'

import { useState, useCallback } from 'react'
import type { Property, Transaction, Tenancy } from '@/types'
import { supabase } from '@/lib/supabase/client'

export function usePropertyData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getPropertyById = useCallback(async (id: string): Promise<Property | null> => {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching property:', error)
      return null
    }

    return data
  }, []) // Empty deps ensures stable function reference

  const getPropertyTransactions = useCallback(async (propertyId: string): Promise<Transaction[]> => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('property_id', propertyId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching transactions:', error)
      return []
    }

    return data || []
  }, [])

  const getPropertyTenancies = useCallback(async (propertyId: string): Promise<Tenancy[]> => {
    const { data, error } = await supabase
      .from('tenancies')
      .select('*')
      .eq('property_id', propertyId)
      .order('lease_start', { ascending: false })

    if (error) {
      console.error('Error fetching tenancies:', error)
      return []
    }

    return data || []
  }, [])

  return {
    loading,
    error,
    getPropertyById,
    getPropertyTransactions,
    getPropertyTenancies
  }
}
