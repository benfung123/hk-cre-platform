'use client'

import { useTranslations } from 'next-intl'
import { CheckCircle2, MapPinOff } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface District {
  name: string
  hasData: boolean
}

interface EnhancedDistrictSelectorProps {
  districts: District[]
  selectedDistricts: string[]
  onToggle: (district: string) => void
  maxSelection?: number
  disabled?: boolean
}

const districtColors = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-rose-500',
  'bg-cyan-500'
]

export function EnhancedDistrictSelector({
  districts,
  selectedDistricts,
  onToggle,
  maxSelection = 3,
  disabled = false
}: EnhancedDistrictSelectorProps) {
  const t = useTranslations('dataTransparency')
  
  const handleToggle = (district: District) => {
    if (!district.hasData || disabled) return
    
    const currentDistricts = selectedDistricts
    const isSelected = currentDistricts.includes(district.name)
    
    if (isSelected) {
      onToggle(district.name)
    } else {
      // Max 3 districts
      if (currentDistricts.length >= maxSelection) {
        onToggle(district.name) // Let parent handle the logic
      } else {
        onToggle(district.name)
      }
    }
  }
  
  return (
    <TooltipProvider>
      <div className="flex flex-wrap gap-2">
        {districts.map((district, index) => {
          const isSelected = selectedDistricts.includes(district.name)
          const colorClass = districtColors[index % districtColors.length]
          const isDisabled = !district.hasData || disabled
          
          const chipContent = (
            <button
              onClick={() => handleToggle(district)}
              disabled={isDisabled}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5",
                isSelected 
                  ? `${colorClass} text-white shadow-sm` 
                  : district.hasData
                    ? 'bg-muted hover:bg-muted/80 text-muted-foreground'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600',
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {district.hasData ? (
                isSelected ? <CheckCircle2 className="h-3 w-3" /> : null
              ) : (
                <MapPinOff className="h-3 w-3" />
              )}
              {district.name}
            </button>
          )
          
          if (!district.hasData) {
            return (
              <Tooltip key={district.name}>
                <TooltipTrigger asChild>
                  {chipContent}
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{t('districts.noDataTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            )
          }
          
          return chipContent
        })}
      </div>
    </TooltipProvider>
  )
}
