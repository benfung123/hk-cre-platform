'use client'

import { RecentlyViewed } from '@/components/favorites/recently-viewed'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'
import { Suspense } from 'react'

/**
 * Client-side wrapper for Recently Viewed section on homepage
 * This component handles the localStorage access which must be client-side
 */
export function HomeRecentlyViewed() {
  const t = useTranslations('favorites')

  return (
    <Suspense fallback={<RecentlyViewedSkeleton />}>
      <RecentlyViewed 
        layout="horizontal"
        limit={5}
        showClearButton={false}
        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      />
    </Suspense>
  )
}

function RecentlyViewedSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-6 w-40" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-64 flex-shrink-0" />
        ))}
      </div>
    </div>
  )
}

export default HomeRecentlyViewed
