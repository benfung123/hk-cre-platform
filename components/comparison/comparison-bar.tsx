'use client'

import { Scale, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useComparison } from '@/hooks/use-comparison'
import { Link } from '@/src/i18n/routing'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

export function ComparisonBar() {
  const t = useTranslations('compare')
  const { comparisonList, comparisonCount, clearComparison, isLoaded } = useComparison()

  if (!isLoaded || comparisonCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-background border shadow-lg rounded-full px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
            {comparisonCount}
          </div>
          <span className="text-sm font-medium">
            {t('propertiesSelected', { count: comparisonCount })}
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <Link href="/compare">
            <Button size="sm" className="rounded-full">
              <Scale className="h-4 w-4 mr-2" />
              {t('compareButton')}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="rounded-full h-8 w-8 p-0"
            onClick={clearComparison}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
