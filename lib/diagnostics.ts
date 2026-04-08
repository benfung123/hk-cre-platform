/**
 * Diagnostic utilities for localStorage persistence debugging
 * 
 * Usage in browser console:
 *   window.hkCreDiagnostics.checkStorage()
 *   window.hkCreDiagnostics.clearAll()
 *   window.hkCreDiagnostics.testFavorites()
 */

const STORAGE_KEYS = {
  favorites: 'hk-cre-favorites-v2',
  recentlyViewed: 'hk-cre-recently-viewed-v2',
  compare: 'hk-cre-compare-v2'
}

export function initDiagnostics() {
  if (typeof window === 'undefined') return

  const diagnostics = {
    /**
     * Check current localStorage state
     */
    checkStorage() {
      console.group('🔍 HK CRE Storage Diagnostics')
      
      Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
        const value = localStorage.getItem(key)
        const parsed = value ? JSON.parse(value) : []
        console.log(`${name}:`, {
          key,
          count: Array.isArray(parsed) ? parsed.length : 'N/A',
          data: parsed
        })
      })
      
      console.groupEnd()
      return 'Storage check complete - see console output'
    },

    /**
     * Clear all HK CRE storage
     */
    clearAll() {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
      console.log('✅ Cleared all HK CRE storage')
      return 'Storage cleared'
    },

    /**
     * Test adding favorites
     */
    testFavorites(propertyId = 'test-property-123') {
      const key = STORAGE_KEYS.favorites
      const current = JSON.parse(localStorage.getItem(key) || '[]')
      
      if (!current.includes(propertyId)) {
        current.push(propertyId)
        localStorage.setItem(key, JSON.stringify(current))
        console.log(`✅ Added test favorite: ${propertyId}`)
      } else {
        console.log(`ℹ️ Property already in favorites: ${propertyId}`)
      }
      
      this.checkStorage()
      return 'Test complete'
    },

    /**
     * Test adding to compare
     */
    testCompare(propertyId = 'test-property-456') {
      const key = STORAGE_KEYS.compare
      const current = JSON.parse(localStorage.getItem(key) || '[]')
      
      if (current.length >= 3) {
        console.log('⚠️ Compare list is full (max 3)')
        return 'Compare list full'
      }
      
      if (!current.includes(propertyId)) {
        current.push(propertyId)
        localStorage.setItem(key, JSON.stringify(current))
        console.log(`✅ Added to compare: ${propertyId}`)
      } else {
        console.log(`ℹ️ Property already in compare: ${propertyId}`)
      }
      
      this.checkStorage()
      return 'Test complete'
    },

    /**
     * Monitor storage changes in real-time
     */
    monitor() {
      console.log('👁️ Starting storage monitoring...')
      
      const handler = (e: StorageEvent) => {
        if (Object.values(STORAGE_KEYS).includes(e.key || '')) {
          console.log('📦 Storage changed:', {
            key: e.key,
            oldValue: e.oldValue ? JSON.parse(e.oldValue) : null,
            newValue: e.newValue ? JSON.parse(e.newValue) : null
          })
        }
      }
      
      window.addEventListener('storage', handler)
      console.log('✅ Monitoring started - open another tab to see cross-tab sync')
      
      return () => {
        window.removeEventListener('storage', handler)
        console.log('🛑 Monitoring stopped')
      }
    },

    /**
     * Get storage keys (for debugging)
     */
    getKeys() {
      return STORAGE_KEYS
    }
  }

  // Expose to window
  ;(window as any).hkCreDiagnostics = diagnostics
  
  console.log('🔧 HK CRE Diagnostics initialized')
  console.log('Available commands:')
  console.log('  window.hkCreDiagnostics.checkStorage()')
  console.log('  window.hkCreDiagnostics.clearAll()')
  console.log('  window.hkCreDiagnostics.testFavorites()')
  console.log('  window.hkCreDiagnostics.testCompare()')
  console.log('  window.hkCreDiagnostics.monitor()')
}
