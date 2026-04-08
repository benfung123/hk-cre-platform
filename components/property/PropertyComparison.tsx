'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  Layers,
  TrendingUp,
  TrendingDown,
  Minus,
  Maximize2,
} from 'lucide-react'
import type { Property } from '@/types'

interface PropertyComparisonProps {
  /** Properties to compare (2-4 items recommended) */
  properties: Property[]
  /** Optional rental data for each property (price per sqft) */
  rentalData?: Record<string, number | null>
}

/**
 * PropertyComparison Component
 * 
 * A side-by-side comparison layout for comparing 2-4 properties.
 * Displays building specs, location, pricing, and amenities in a responsive table format.
 * 
 * @example
 * ```tsx
 * <PropertyComparison 
 *   properties={[propertyA, propertyB, propertyC]}
 *   rentalData={{ 'prop-1': 45.5, 'prop-2': 52.0, 'prop-3': 38.0 }}
 * />
 * ```
 */
export function PropertyComparison({
  properties,
  rentalData = {},
}: PropertyComparisonProps) {
  if (properties.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Select at least 2 properties to compare
        </CardContent>
      </Card>
    )
  }

  if (properties.length > 4) {
    console.warn('PropertyComparison: Comparing more than 4 properties may affect layout')
  }

  // Calculate grid columns based on property count
  const gridCols =
    properties.length === 2
      ? 'grid-cols-1 md:grid-cols-2'
      : properties.length === 3
        ? 'grid-cols-1 md:grid-cols-3'
        : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'

  // Get rent values for highlighting
  const rentValues = properties
    .map((p) => rentalData[p.id])
    .filter((r): r is number => r !== null && r !== undefined)

  const maxRent = rentValues.length > 0 ? Math.max(...rentValues) : null
  const minRent = rentValues.length > 0 ? Math.min(...rentValues) : null

  return (
    <div className="space-y-6">
      {/* Comparison Table - Desktop View */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-4 font-medium text-muted-foreground w-48">
                  Feature
                </th>
                {properties.map((property) => (
                  <th key={property.id} className="p-4 text-left min-w-[200px]">
                    <div className="space-y-2">
                      <div className="font-semibold">{property.name}</div>
                      <Badge variant="secondary">{property.grade}</Badge>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {/* Basic Info Section */}
              <ComparisonRow
                icon={<MapPin className="h-4 w-4" />}
                label="District"
                properties={properties}
                renderValue={(p) => p.district}
              />
              <ComparisonRow
                icon={<Building2 className="h-4 w-4" />}
                label="Address"
                properties={properties}
                renderValue={(p) => p.address}
                truncate
              />

              <tr className="bg-muted/30">
                <td colSpan={properties.length + 1} className="p-2 px-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Building Specifications
                  </span>
                </td>
              </tr>

              {/* Building Specs Section */}
              <ComparisonRow
                icon={<Calendar className="h-4 w-4" />}
                label="Year Built"
                properties={properties}
                renderValue={(p) => p.year_built?.toString() || 'N/A'}
              />
              <ComparisonRow
                icon={<Maximize2 className="h-4 w-4" />}
                label="Total Floor Area"
                properties={properties}
                renderValue={(p) =>
                  p.total_sqft
                    ? `${(p.total_sqft / 1000000).toFixed(2)}M sqft`
                    : 'N/A'
                }
              />
              <ComparisonRow
                icon={<Layers className="h-4 w-4" />}
                label="Number of Floors"
                properties={properties}
                renderValue={(p) => p.floors?.toString() || 'N/A'}
              />

              <tr className="bg-muted/30">
                <td colSpan={properties.length + 1} className="p-2 px-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Pricing
                  </span>
                </td>
              </tr>

              {/* Pricing Section */}
              <ComparisonRow
                icon={<DollarSign className="h-4 w-4" />}
                label="Rent per sqft"
                properties={properties}
                renderValue={(p) => {
                  const rent = rentalData[p.id]
                  if (rent === null || rent === undefined) return 'No data'
                  return (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${rent.toFixed(2)}</span>
                      {rent === maxRent && properties.length > 1 && (
                        <TrendingUp className="h-4 w-4 text-red-500" />
                      )}
                      {rent === minRent && properties.length > 1 && (
                        <TrendingDown className="h-4 w-4 text-green-500" />
                      )}
                      {rent !== maxRent &&
                        rent !== minRent &&
                        properties.length > 1 && (
                          <Minus className="h-4 w-4 text-gray-400" />
                        )}
                    </div>
                  )
                }}
              />

              {/* Amenities Section (placeholder for future) */}
              <tr className="bg-muted/30">
                <td colSpan={properties.length + 1} className="p-2 px-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amenities
                  </span>
                </td>
              </tr>
              <ComparisonRow
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                properties={properties}
                renderValue={(p) =>
                  p.lat && p.lng ? `${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}` : 'N/A'
                }
              />
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile View - Stacked Cards */}
      <div className={`grid ${gridCols} gap-4 md:hidden`}>
        {properties.map((property) => {
          const rent = rentalData[property.id]
          const isHighestRent = rent === maxRent && properties.length > 1
          const isLowestRent = rent === minRent && properties.length > 1

          return (
            <Card key={property.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{property.name}</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {property.grade}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-2">
                  <ComparisonItem
                    icon={<MapPin className="h-4 w-4" />}
                    label="District"
                    value={property.district}
                  />
                  <ComparisonItem
                    icon={<Building2 className="h-4 w-4" />}
                    label="Address"
                    value={property.address}
                    truncate
                  />
                </div>

                <Separator />

                {/* Building Specs */}
                <div className="space-y-2">
                  <ComparisonItem
                    icon={<Calendar className="h-4 w-4" />}
                    label="Year Built"
                    value={property.year_built?.toString() || 'N/A'}
                  />
                  <ComparisonItem
                    icon={<Maximize2 className="h-4 w-4" />}
                    label="Total Area"
                    value={
                      property.total_sqft
                        ? `${(property.total_sqft / 1000000).toFixed(2)}M sqft`
                        : 'N/A'
                    }
                  />
                  <ComparisonItem
                    icon={<Layers className="h-4 w-4" />}
                    label="Floors"
                    value={property.floors?.toString() || 'N/A'}
                  />
                </div>

                <Separator />

                {/* Pricing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Rent/sqft
                    </span>
                    <div className="flex items-center gap-2">
                      {rent !== null && rent !== undefined ? (
                        <>
                          <span className="font-medium">${rent.toFixed(2)}</span>
                          {isHighestRent && (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          )}
                          {isLowestRent && (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          )}
                          {!isHighestRent && !isLowestRent && properties.length > 1 && (
                            <Minus className="h-4 w-4 text-gray-400" />
                          )}
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Legend */}
      {rentValues.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="font-medium">Legend:</span>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-red-500" />
            <span>Highest rent</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="h-4 w-4 text-green-500" />
            <span>Lowest rent</span>
          </div>
          <div className="flex items-center gap-1">
            <Minus className="h-4 w-4 text-gray-400" />
            <span>Mid-range</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper component for table rows
interface ComparisonRowProps {
  icon: React.ReactNode
  label: string
  properties: Property[]
  renderValue: (property: Property) => React.ReactNode
  truncate?: boolean
}

function ComparisonRow({
  icon,
  label,
  properties,
  renderValue,
  truncate,
}: ComparisonRowProps) {
  return (
    <tr className="hover:bg-muted/50 transition-colors">
      <td className="p-4 font-medium text-muted-foreground">
        <div className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
        </div>
      </td>
      {properties.map((property) => (
        <td key={property.id} className="p-4">
          <span className={truncate ? 'line-clamp-2' : ''}>{renderValue(property)}</span>
        </td>
      ))}
    </tr>
  )
}

// Helper component for mobile comparison items
interface ComparisonItemProps {
  icon: React.ReactNode
  label: string
  value: string
  truncate?: boolean
}

function ComparisonItem({ icon, label, value, truncate }: ComparisonItemProps) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground flex items-center gap-2">
        {icon}
        {label}
      </span>
      <span className={`text-sm font-medium ${truncate ? 'line-clamp-1 max-w-[150px]' : ''}`}>
        {value}
      </span>
    </div>
  )
}
