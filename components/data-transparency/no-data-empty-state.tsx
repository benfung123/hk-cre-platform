'use client'

import { useTranslations } from 'next-intl'
import { MapPinOff, Database, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface NoDataEmptyStateProps {
  districtName: string
  onViewAvailableDistricts?: () => void
}

export function NoDataEmptyState({ 
  districtName, 
  onViewAvailableDistricts 
}: NoDataEmptyStateProps) {
  const t = useTranslations('dataTransparency.emptyState')
  
  return (
    <Card className="border-dashed">
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <MapPinOff className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-lg font-medium mb-2">
          {t('title', { district: districtName })}
        </h3>
        
        <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
          {t('description')}
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-muted-foreground mb-6">
          <div className="flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5" />
            <span>{t('reason.dataCollection')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{t('reason.comingSoon')}</span>
          </div>
        </div>
        
        {onViewAvailableDistricts && (
          <Button variant="outline" onClick={onViewAvailableDistricts}>
            {t('viewAvailableButton')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
