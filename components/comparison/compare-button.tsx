'use client'

import { Scale, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useComparison } from '@/hooks/use-comparison'
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
  const { isInComparison, toggleComparison, canAddMore, isFull, isLoaded } = useComparison()
  
  const isActive = isInComparison(propertyId)
  
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  if (!isLoaded) {
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

  const button = (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size={showLabel ? 'default' : 'icon'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleComparison(propertyId)
      }}
      disabled={!isActive && !canAddMore}
      className={cn(
        'transition-all duration-200',
        isActive && 'bg-blue-500 hover:bg-blue-600 border-blue-500',
        !showLabel && sizeClasses[size],
        className
      )}
    >
      {isActive ? (
        <X className={cn(iconSizes[size], showLabel && 'mr-2')} />
      ) : (
        <Scale className={cn(iconSizes[size], showLabel && 'mr-2')} />
      )}
      {showLabel && (isActive ? t('remove') : t('add'))}
    </Button>
  )

  if (!isActive && isFull) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={className}>
              {button}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('maxReached')}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}
