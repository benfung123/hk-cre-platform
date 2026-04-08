'use client'

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
}

export function FavoriteButton({ 
  propertyId, 
  size = 'md', 
  showLabel = false,
  className 
}: FavoriteButtonProps) {
  const t = useTranslations('favorites')
  const { isFavorite, toggleFavorite, isLoaded } = useFavorites()
  
  const isActive = isFavorite(propertyId)
  
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
        <Heart className={cn(iconSizes[size], 'text-muted-foreground')} />
      </Button>
    )
  }

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size={showLabel ? 'default' : 'icon'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(propertyId)
      }}
      className={cn(
        'transition-all duration-200',
        isActive && 'bg-red-500 hover:bg-red-600 border-red-500',
        !showLabel && sizeClasses[size],
        className
      )}
    >
      <Heart 
        className={cn(
          iconSizes[size],
          isActive && 'fill-current',
          showLabel && 'mr-2'
        )} 
      />
      {showLabel && (isActive ? t('saved') : t('save'))}
    </Button>
  )
}
