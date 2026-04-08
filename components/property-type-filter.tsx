'use client'

import { useTranslations } from 'next-intl'
import { Building2, Store, Factory, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

export type PropertyType = 'office' | 'retail' | 'industrial' | 'all'

interface PropertyTypeFilterProps {
  value: PropertyType
  onChange: (type: PropertyType) => void
  disabled?: boolean
  showCounts?: boolean
  counts?: Record<PropertyType, number>
}

interface PropertyTypeOption {
  value: PropertyType
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

const propertyTypes: PropertyTypeOption[] = [
  { value: 'all', icon: Layers, color: 'bg-slate-500', bgColor: 'bg-slate-100 dark:bg-slate-800' },
  { value: 'office', icon: Building2, color: 'bg-blue-500', bgColor: 'bg-blue-50 dark:bg-blue-950' },
  { value: 'retail', icon: Store, color: 'bg-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-950' },
  { value: 'industrial', icon: Factory, color: 'bg-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-950' }
]

export function PropertyTypeFilter({ 
  value, 
  onChange, 
  disabled = false,
  showCounts = false,
  counts = { all: 0, office: 0, retail: 0, industrial: 0 }
}: PropertyTypeFilterProps) {
  const t = useTranslations('propertyType')
  
  return (
    <div className="flex flex-wrap gap-2">
      {propertyTypes.map((type) => {
        const Icon = type.icon
        const isSelected = value === type.value
        const isDisabled = disabled
        
        return (
          <button
            key={type.value}
            onClick={() => !isDisabled && onChange(type.value)}
            disabled={isDisabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              isSelected
                ? `${type.color} text-white border-transparent shadow-sm`
                : `bg-background border-border text-foreground hover:${type.bgColor}`,
              isDisabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{t(`types.${type.value}`)}</span>
            {showCounts && counts[type.value] > 0 && (
              <span className={cn(
                "ml-1 px-1.5 py-0.5 text-xs rounded-full",
                isSelected ? "bg-white/20" : "bg-muted-foreground/10"
              )}>
                {counts[type.value]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
