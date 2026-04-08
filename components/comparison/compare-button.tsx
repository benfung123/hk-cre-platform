'use client'

import { useEffect, useState } from 'react'
import { Scale, Check, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCompareStore } from '@/stores/compare-store'
import { useSimpleToast } from '@/components/ui/toast-provider'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface CompareButtonProps {
  propertyId: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export function CompareButton({ 
  propertyId, 
  size = 'md', 
  showLabel = false,
  className 
}: CompareButtonProps) {
  const t = useTranslations('compare')
  const toast = useSimpleToast()
  const tToast = useTranslations('toast')
  
  // Get store values
  const { compareList, addToCompare, removeFromCompare, isInCompare, canAddMore, setHydrated } = useCompareStore()
  
  // Handle hydration
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true)
  }, [setHydrated])
  
  const isActive = isInCompare(propertyId)
  const canAdd = canAddMore()
  const isListFull = compareList.length >= 3
  
  const sizeClasses = {
    sm: 'h-9 w-9 min-h-[36px] min-w-[36px] sm:h-8 sm:w-8',
    md: 'h-11 w-11 min-h-[44px] min-w-[44px] sm:h-10 sm:w-10',
    lg: 'h-12 w-12 min-h-[48px] min-w-[48px]'
  }
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  // Show loading state before hydration
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(sizeClasses[size], className)}
        disabled
      >
        <Scale className={cn(iconSizes[size], 'text-muted-foreground')} />
      </Button>
    )
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (isActive) {
      removeFromCompare(propertyId)
      toast.info(tToast('removedFromCompare') || 'Removed from compare', undefined, undefined, 'compare-toast')
    } else {
      const success = addToCompare(propertyId)
      if (success) {
        toast.success(tToast('addedToCompare') || 'Added to compare', undefined, undefined, 'compare-toast')
      } else if (isListFull) {
        toast.warning(tToast('compareFull') || 'Compare list full (max 3)', undefined, undefined, 'compare-toast')
      } else {
        toast.info(tToast('alreadyInCompare') || 'Already in compare list', undefined, undefined, 'compare-toast')
      }
    }
  }

  const button = (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size={showLabel ? 'default' : 'icon'}
      onClick={handleClick}
      disabled={!isActive && !canAdd}
      className={cn(
        'transition-all duration-200',
        isActive && 'bg-blue-500 hover:bg-blue-600 border-blue-500 text-white',
        !showLabel && sizeClasses[size],
        className
      )}
    >
      {isActive ? (
        <>
          <Check className={cn(iconSizes[size], showLabel && 'mr-2')} />
          {showLabel && t('remove')}
        </>
      ) : (
        <>
          <Scale className={cn(iconSizes[size], showLabel && 'mr-2')} />
          {showLabel && t('add')}
        </>
      )}
    </Button>
  )

  if (!isActive && isListFull) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={className}>
              <Button
                variant="ghost"
                size={showLabel ? 'default' : 'icon'}
                disabled
                className={cn(
                  'text-muted-foreground',
                  !showLabel && sizeClasses[size],
                  className
                )}
              >
                <Lock className={cn(iconSizes[size], showLabel && 'mr-2')} />
                {showLabel && t('compareFull')}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('compareFullTooltip') || 'Compare list full (3/3) - remove a property to add more'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}
