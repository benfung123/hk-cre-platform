'use client'

import { useTranslations } from 'next-intl'
import { MapPin, Building2, Factory, Store } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface CoverageData {
  propertyType: 'office' | 'retail' | 'industrial'
  coveredDistricts: number
  totalDistricts: number
  propertyCount: number
}

interface DataCoverageInfoProps {
  coverage: CoverageData[]
}

const propertyTypeIcons = {
  office: Building2,
  retail: Store,
  industrial: Factory
}

export function DataCoverageInfo({ coverage }: DataCoverageInfoProps) {
  const t = useTranslations('dataTransparency.coverageInfo')
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-muted-foreground" />
        <h4 className="font-medium">{t('title')}</h4>
      </div>
      
      <p className="text-xs text-muted-foreground">
        {t('description')}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {coverage.map((item) => {
          const Icon = propertyTypeIcons[item.propertyType]
          const percent = Math.round((item.coveredDistricts / item.totalDistricts) * 100)
          
          return (
            <div 
              key={item.propertyType}
              className="p-3 rounded-lg bg-muted/50 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium capitalize">
                  {t(`propertyTypes.${item.propertyType}`)}
                </span>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {t('districtsLabel')}
                  </span>
                  <span className="font-medium">
                    {item.coveredDistricts}/{item.totalDistricts}
                  </span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                {t('propertiesCount', { count: item.propertyCount })}
              </p>
            </div>
          )
        })}
      </div>
      
      <Separator />
      
      <p className="text-xs text-muted-foreground">
        {t('disclaimer')}
      </p>
    </div>
  )
}
