'use client'

import { useTranslations } from 'next-intl'
import { Info, MapPin } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Progress } from '@/components/ui/progress'

interface DistrictCoverageBannerProps {
  coveredDistricts: number
  totalDistricts: number
}

export function DistrictCoverageBanner({ 
  coveredDistricts, 
  totalDistricts 
}: DistrictCoverageBannerProps) {
  const t = useTranslations('dataTransparency')
  const coveragePercent = Math.round((coveredDistricts / totalDistricts) * 100)
  
  return (
    <Alert className="bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900">
      <MapPin className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
        {t('coverage.title')}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3.5 w-3.5 cursor-help text-amber-600/70" />
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-sm">
              <p className="text-xs">{t('coverage.tooltip')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-400">
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <div className="flex justify-between text-xs mb-1">
              <span>{t('coverage.progressLabel', { covered: coveredDistricts, total: totalDistricts })}</span>
              <span className="font-medium">{coveragePercent}%</span>
            </div>
            <Progress value={coveragePercent} className="h-2 bg-amber-200 dark:bg-amber-900" />
          </div>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {t('coverage.dataSource')}
          </span>
        </div>
      </AlertDescription>
    </Alert>
  )
}
