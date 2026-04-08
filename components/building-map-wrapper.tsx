'use client'

import dynamic from 'next/dynamic'
import type { Property } from '@/types'

interface DynamicBuildingMapProps {
  properties: Property[]
  selectedDistrict?: string
  onPropertySelect?: (property: Property) => void
  height?: string
  showFilters?: boolean
  showSearch?: boolean
}

// Dynamically import BuildingMap with SSR disabled
const BuildingMapClient = dynamic(
  () => import('@/components/BuildingMap').then(mod => mod.BuildingMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[450px] bg-muted/50 rounded-lg flex items-center justify-center">
        <div className="text-muted-foreground">Loading map...</div>
      </div>
    )
  }
)

export function BuildingMapWrapper(props: DynamicBuildingMapProps) {
  return <BuildingMapClient {...props} />
}