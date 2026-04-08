'use client'

import { useEffect } from 'react'
import { initDiagnostics } from '@/lib/diagnostics'

/**
 * Client-side diagnostics initializer
 * Exposes window.hkCreDiagnostics for debugging
 */
export function DiagnosticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initDiagnostics()
  }, [])

  return <>{children}</>
}
