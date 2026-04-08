'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/use-favorites'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface FavoriteButtonProps {
  propertyId: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
  onAnimationComplete?: () => void
}

export function FavoriteButton({ 
  propertyId, 
  size = 'md', 
  showLabel = false,
  className,
  onAnimationComplete
}: FavoriteButtonProps) {
  const t = useTranslations('favorites')
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)
  
  const isActive = isFavorite(propertyId)
  
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

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Trigger animation
    if (!isActive) {
      setIsAnimating(true)
      setTimeout(() => {
        setIsAnimating(false)
        onAnimationComplete?.()
      }, 400)
    }
    
    toggleFavorite(propertyId)
  }

  if (!isLoaded) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={cn(sizeClasses[size], className)}
        disabled
      >
        <Heart className={cn(iconSizes[size], 'text-muted-foreground')} />
      </Button>
    )
  }

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size={showLabel ? 'default' : 'icon'}
      onClick={handleClick}
      className={cn(
        'transition-all duration-200 relative overflow-hidden',
        isActive && 'bg-red-500 hover:bg-red-600 border-red-500',
        !showLabel && sizeClasses[size],
        className
      )}
    >
      {/* Heart animation burst effect */}
      {isAnimating && (
        <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="absolute w-full h-full bg-red-400 rounded-full animate-ping opacity-25" />
        </span>
      )}
      
      <Heart 
        className={cn(
          iconSizes[size],
          'transition-transform duration-200',
          isActive && 'fill-current',
          isAnimating && 'scale-125',
          showLabel && 'mr-2'
        )} 
      />
      {showLabel && (isActive ? t('saved') : t('save'))}
    </Button>
  )
}
