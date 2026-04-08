'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft, 
  MapPin, 
  Building2, 
  DollarSign, 
  Scale,
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  Maximize2,
  BarChart3
} from 'lucide-react'
import { useCompare } from '@/hooks/use-compare'
import { usePropertyData } from '@/hooks/use-property-data'
import type { Property, Transaction } from '@/types'
import { useTranslations } from 'next-intl'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface PropertyWithTransactions extends Property {
  transactions: Transaction[]
}

// Grade colors for visual coding
const gradeColors: Record<string, string> = {
  'A+': 'bg-emerald-500 text-white',
  'A': 'bg-green-500 text-white',
  'B': 'bg-yellow-500 text-black',
  'C': 'bg-orange-500 text-white'
}

// Grade ranking for comparison (higher is better)
const gradeRank: Record<string, number> = {
  'A+': 4,
  'A': 3,
  'B': 2,
  'C': 1
}

export function ComparisonView() {
  const t = useTranslations('compare')
  const tp = useTranslations('propertyDetail')
  const { compareList, removeFromCompare, clearCompare } = useCompare()
  const { getPropertyById, getPropertyTransactions } = usePropertyData()
  const [properties, setProperties] = useState<PropertyWithTransactions[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProperties() {
      if (compareList.length === 0) {
        setProperties([])
        setLoading(false)
        return
      }

      setLoading(true)
      const loaded = await Promise.all(
        compareList.map(async (id) => {
          const property = await getPropertyById(id)
          const transactions = await getPropertyTransactions(id)
          return property ? { ...property, transactions } : null
        })
      )
      setProperties(loaded.filter(p => p !== null) as PropertyWithTransactions[])
      setLoading(false)
    }

    loadProperties()
  }, [compareList, getPropertyById, getPropertyTransactions])

  if (loading) {
    return <ComparisonSkeleton />
  }

  if (properties.length === 0) {
    return <EmptyComparison />
  }

  // Calculate stats for comparison highlighting
  const getLatestRent = (transactions: Transaction[]) => {
    const leases = transactions.filter(t => t.type === 'lease' && t.price_per_sqft)
    return leases.length > 0 ? leases[0].price_per_sqft : null
  }

  const getAvgRent = (transactions: Transaction[]) => {
    const leases = transactions.filter(t => t.type === 'lease' && t.price_per_sqft)
    if (leases.length === 0) return null
    return leases.reduce((sum, t) => sum + (t.price_per_sqft || 0), 0) / leases.length
  }

  const getLatestSalePrice = (transactions: Transaction[]) => {
    const sales = transactions.filter(t => t.type === 'sale' && t.price_per_sqft)
    return sales.length > 0 ? sales[0].price_per_sqft : null
  }

  // Calculate cap rate (estimated: annual rent / price)
  const getCapRate = (transactions: Transaction[]) => {
    const avgRent = getAvgRent(transactions)
    const latestPrice = getLatestSalePrice(transactions)
    if (!avgRent || !latestPrice || latestPrice === 0) return null
    // Assuming 12 months rent, cap rate = (monthly rent * 12) / price
    // Rent and price are both per sqft, so calculation works
    return ((avgRent * 12) / latestPrice) * 100
  }

  const rents = properties.map(p => getLatestRent(p.transactions)).filter((r): r is number => r !== null)
  const prices = properties.map(p => getLatestSalePrice(p.transactions)).filter((p): p is number => p !== null)
  const capRates = properties.map(p => getCapRate(p.transactions)).filter((c): c is number => c !== null)
  const years = properties.map(p => p.year_built).filter((y): y is number => y !== null)
  const areas = properties.map(p => p.total_sqft).filter((a): a is number => a !== null)
  const grades = properties.map(p => p.grade).filter(g => g !== null) as string[]
  
  const maxRent = rents.length > 0 ? Math.max(...rents) : null
  const minRent = rents.length > 0 ? Math.min(...rents) : null
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null
  const minPrice = prices.length > 0 ? Math.min(...prices) : null
  const maxCapRate = capRates.length > 0 ? Math.max(...capRates) : null
  const minCapRate = capRates.length > 0 ? Math.min(...capRates) : null
  const newestYear = years.length > 0 ? Math.max(...years) : null
  const oldestYear = years.length > 0 ? Math.min(...years) : null
  const largestArea = areas.length > 0 ? Math.max(...areas) : null
  const smallestArea = areas.length > 0 ? Math.min(...areas) : null
  const bestGrade = grades.length > 0 
    ? grades.reduce((best, g) => (gradeRank[g] > gradeRank[best] ? g : best), grades[0])
    : null

  // Get grid layout based on number of properties
  const getGridClass = () => {
    if (properties.length === 1) return 'grid-cols-1 max-w-2xl mx-auto'
    if (properties.length === 2) return 'grid-cols-1 md:grid-cols-2'
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToProperties')}
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('propertiesSelected', { count: properties.length })}
          </span>
          <Button variant="outline" size="sm" onClick={clearCompare}>
            <X className="h-4 w-4 mr-2" />
            {t('clearAll')}
          </Button>
        </div>
      </div>

      {/* Comparison Summary */}
      {properties.length > 1 && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{t('comparisonSummary')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {rents.length > 0 && (
                <div>
                  <span className="text-muted-foreground">{t('rentRange')}:</span>
                  <div className="font-medium">${minRent?.toFixed(2)} - ${maxRent?.toFixed(2)}</div>
                </div>
              )}
              {years.length > 0 && (
                <div>
                  <span className="text-muted-foreground">{t('yearRange')}:</span>
                  <div className="font-medium">{oldestYear} - {newestYear}</div>
                </div>
              )}
              {areas.length > 0 && (
                <div>
                  <span className="text-muted-foreground">{t('areaRange')}:</span>
                  <div className="font-medium">{(smallestArea! / 1000000).toFixed(1)}M - {(largestArea! / 1000000).toFixed(1)}M sqft</div>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">{t('districts')}:</span>
                <div className="font-medium">{[...new Set(properties.map(p => p.district))].length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparison Grid */}
      <div className={`grid gap-4 ${getGridClass()}`}>
        {properties.map((property) => {
          const latestRent = getLatestRent(property.transactions)
          const avgRent = getAvgRent(property.transactions)
          const latestPrice = getLatestSalePrice(property.transactions)
          const capRate = getCapRate(property.transactions)
          
          // Determine highlighting based on "better" criteria
          // Lower rent = better (green), higher rent = worse (red)
          const rentIsBetter = latestRent !== null && minRent !== null && latestRent === minRent && properties.length > 1
          const rentIsWorse = latestRent !== null && maxRent !== null && latestRent === maxRent && properties.length > 1
          
          // Lower price = better (green), higher price = worse (red)
          const priceIsBetter = latestPrice !== null && minPrice !== null && latestPrice === minPrice && properties.length > 1
          const priceIsWorse = latestPrice !== null && maxPrice !== null && latestPrice === maxPrice && properties.length > 1
          
          // Higher cap rate = better (green), lower cap rate = worse (red)
          const capRateIsBetter = capRate !== null && maxCapRate !== null && capRate === maxCapRate && properties.length > 1
          const capRateIsWorse = capRate !== null && minCapRate !== null && capRate === minCapRate && properties.length > 1
          
          // Newer building = better (green)
          const yearIsBetter = property.year_built !== null && newestYear !== null && property.year_built === newestYear && properties.length > 1
          const yearIsWorse = property.year_built !== null && oldestYear !== null && property.year_built === oldestYear && properties.length > 1
          
          // Larger area = neutral (just highlight the largest)
          const isLargestArea = property.total_sqft !== null && largestArea !== null && property.total_sqft === largestArea && properties.length > 1
          const isSmallestArea = property.total_sqft !== null && smallestArea !== null && property.total_sqft === smallestArea && properties.length > 1
          
          // Grade comparison
          const gradeIsBetter = bestGrade !== null && property.grade === bestGrade && properties.length > 1
          
          return (
            <Card key={property.id} className="relative overflow-hidden">
              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => removeFromCompare(property.id)}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Property Image Placeholder */}
              <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800 flex items-center justify-center relative">
                <Building2 className="h-12 w-12 text-blue-400 dark:text-blue-600" />
                <div className="absolute top-2 left-2">
                  <Badge className={cn("font-bold", gradeColors[property.grade] || 'bg-gray-500')}>
                    Grade {property.grade}
                  </Badge>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg pr-8">{property.name}</CardTitle>
                <CardDescription className="line-clamp-1">{property.address}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* District - Neutral, no highlighting */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{property.district}</span>
                </div>

                <Separator />

                {/* Grade Comparison */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    {t('grade')}
                  </h4>
                  <div className={cn(
                    "flex items-center justify-between p-2 rounded",
                    gradeIsBetter && "bg-green-100/50 dark:bg-green-950/30"
                  )}>
                    <span className="text-sm text-muted-foreground">{t('grade')}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(gradeColors[property.grade] || 'bg-gray-500')}>
                        {property.grade}
                      </Badge>
                      {gradeIsBetter && properties.length > 1 && (
                        <span className="text-xs text-green-600 font-medium">{t('better')}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Rent Info */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4" />
                    {t('rent')}
                  </h4>
                  
                  {latestRent ? (
                    <div className="space-y-1">
                      <div className={cn(
                        "flex items-center justify-between p-2 rounded",
                        rentIsBetter && "bg-green-100/50 dark:bg-green-950/30",
                        rentIsWorse && "bg-red-100/50 dark:bg-red-950/30"
                      )}>
                        <span className="text-sm text-muted-foreground">{t('latest')}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            rentIsBetter && "text-green-600 dark:text-green-400",
                            rentIsWorse && "text-red-600 dark:text-red-400"
                          )}>
                            ${latestRent.toFixed(2)}
                          </span>
                          {rentIsBetter && <TrendingDown className="h-4 w-4 text-green-500" />}
                          {rentIsWorse && <TrendingUp className="h-4 w-4 text-red-500" />}
                          {!rentIsBetter && !rentIsWorse && properties.length > 1 && <Minus className="h-4 w-4 text-gray-400" />}
                        </div>
                      </div>
                      
                      {avgRent && avgRent !== latestRent && (
                        <div className="flex items-center justify-between p-2">
                          <span className="text-sm text-muted-foreground">{t('average')}</span>
                          <span className="font-medium">${avgRent.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 bg-muted rounded">{t('noRentData')}</p>
                  )}
                </div>

                <Separator />

                {/* Price Info (if available) */}
                {latestPrice && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4" />
                        {t('price')}
                      </h4>
                      <div className={cn(
                        "flex items-center justify-between p-2 rounded",
                        priceIsBetter && "bg-green-100/50 dark:bg-green-950/30",
                        priceIsWorse && "bg-red-100/50 dark:bg-red-950/30"
                      )}>
                        <span className="text-sm text-muted-foreground">{t('latest')}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            priceIsBetter && "text-green-600 dark:text-green-400",
                            priceIsWorse && "text-red-600 dark:text-red-400"
                          )}>
                            ${latestPrice.toLocaleString()}
                          </span>
                          {priceIsBetter && <TrendingDown className="h-4 w-4 text-green-500" />}
                          {priceIsWorse && <TrendingUp className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Cap Rate (if calculable) */}
                {capRate && (
                  <>
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2 text-sm">
                        <TrendingUp className="h-4 w-4" />
                        {t('capRate', { defaultValue: 'Cap Rate' })}
                      </h4>
                      <div className={cn(
                        "flex items-center justify-between p-2 rounded",
                        capRateIsBetter && "bg-green-100/50 dark:bg-green-950/30",
                        capRateIsWorse && "bg-red-100/50 dark:bg-red-950/30"
                      )}>
                        <span className="text-sm text-muted-foreground">{t('estimated')}</span>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            capRateIsBetter && "text-green-600 dark:text-green-400",
                            capRateIsWorse && "text-red-600 dark:text-red-400"
                          )}>
                            {capRate.toFixed(2)}%
                          </span>
                          {capRateIsBetter && <TrendingUp className="h-4 w-4 text-green-500" />}
                          {capRateIsWorse && <TrendingDown className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Building Stats */}
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4" />
                    {t('building')}
                  </h4>
                  
                  <div className="space-y-1 text-sm">
                    {property.total_sqft && (
                      <div className={cn(
                        "flex justify-between p-1 rounded",
                        isLargestArea && "bg-green-100/50 dark:bg-green-950/30",
                        isSmallestArea && "bg-muted"
                      )}>
                        <span className="text-muted-foreground">{t('area')}</span>
                        <span className={cn(
                          isLargestArea && "font-medium text-green-600 dark:text-green-400"
                        )}>
                          {(property.total_sqft / 1000000).toFixed(2)}M sqft
                          {isLargestArea && properties.length > 1 && (
                            <span className="ml-1 text-xs text-green-600">{t('better')}</span>
                          )}
                        </span>
                      </div>
                    )}
                    {property.floors && (
                      <div className="flex justify-between p-1">
                        <span className="text-muted-foreground">{tp('numberOfFloors')}</span>
                        <span>{property.floors}</span>
                      </div>
                    )}
                    {property.year_built && (
                      <div className={cn(
                        "flex justify-between p-1 rounded",
                        yearIsBetter && "bg-green-100/50 dark:bg-green-950/30",
                        yearIsWorse && "bg-red-100/50 dark:bg-red-950/30"
                      )}>
                        <span className="text-muted-foreground">{t('yearBuilt')}</span>
                        <span className={cn(
                          yearIsBetter && "font-medium text-green-600 dark:text-green-400",
                          yearIsWorse && "font-medium text-red-600 dark:text-red-400"
                        )}>
                          {property.year_built}
                          {yearIsBetter && properties.length > 1 && (
                            <span className="ml-1 text-xs">{t('better')}</span>
                          )}
                          {yearIsWorse && properties.length > 1 && (
                            <span className="ml-1 text-xs">{t('worse')}</span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Recent Transactions Summary */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">{t('recentTransactions')}</h4>
                  {property.transactions.length > 0 ? (
                    <div className="space-y-1">
                      {property.transactions.slice(0, 3).map((transaction) => (
                        <div key={transaction.id} className="flex justify-between text-sm p-1 bg-muted rounded">
                          <span className="text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString('en-HK', { month: 'short', year: 'numeric' })}
                          </span>
                          <span className="font-medium">
                            {transaction.type === 'lease' ? 'Lease' : 'Sale'}
                            {transaction.price_per_sqft && ` @ $${transaction.price_per_sqft.toFixed(0)}`}
                          </span>
                        </div>
                      ))}
                      {property.transactions.length > 3 && (
                        <p className="text-xs text-center text-muted-foreground">
                          +{property.transactions.length - 3} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground p-2 bg-muted rounded">{t('noTransactions')}</p>
                  )}
                </div>

                <Link href={`/properties/${property.id}`}>
                  <Button className="w-full" variant="outline">
                    <Maximize2 className="h-4 w-4 mr-2" />
                    {t('viewDetails')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function ComparisonSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-[600px]" />
        ))}
      </div>
    </div>
  )
}

function EmptyComparison() {
  const t = useTranslations('compare')
  return (
    <div className="text-center py-16">
      <Scale className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">{t('emptyTitle')}</h2>
      <p className="text-muted-foreground mb-6">
        {t('emptyDescription')}
      </p>
      <Link href="/properties">
        <Button>
          {t('browseProperties')}
        </Button>
      </Link>
    </div>
  )
}
