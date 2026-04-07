'use client'

import { Shield, Database, FileSpreadsheet, Calculator, UserCheck } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type DataSource = 'rvd' | 'csdi' | 'hkex' | 'manual' | 'calculated'
type Reliability = 'high' | 'medium' | 'low'

interface SourceBadgeProps {
  source: DataSource
  lastUpdated?: string
  reliability?: Reliability
  className?: string
}

const sourceConfig: Record<DataSource, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  fullName: string
  color: string
}> = {
  rvd: {
    icon: FileSpreadsheet,
    label: 'RVD',
    fullName: 'Rating and Valuation Department',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  csdi: {
    icon: Database,
    label: 'CSDI',
    fullName: 'Common Spatial Data Infrastructure',
    color: 'bg-green-100 text-green-800 border-green-200',
  },
  hkex: {
    icon: Shield,
    label: 'HKEX',
    fullName: 'Hong Kong Exchanges and Clearing',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  manual: {
    icon: UserCheck,
    label: 'Verified',
    fullName: 'Manually Verified',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  calculated: {
    icon: Calculator,
    label: 'Calculated',
    fullName: 'Platform Calculation',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
  },
}

const reliabilityIndicator: Record<Reliability, { color: string; label: string }> = {
  high: { color: 'text-green-600', label: 'High reliability' },
  medium: { color: 'text-yellow-600', label: 'Medium reliability' },
  low: { color: 'text-orange-600', label: 'Estimated' },
}

function getTimeAgo(dateString?: string): string {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (days < 0) return 'Future date'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  return date.toLocaleDateString()
}

export function SourceBadge({ 
  source, 
  lastUpdated, 
  reliability = 'high', 
  className 
}: SourceBadgeProps) {
  const config = sourceConfig[source]
  const Icon = config.icon
  const timeAgo = getTimeAgo(lastUpdated)
  const rel = reliabilityIndicator[reliability]
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
              config.color,
              className
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
            <div className={cn("w-1.5 h-1.5 rounded-full", rel.color.replace('text-', 'bg-'))} />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{config.fullName}</p>
            <p className="text-xs text-muted-foreground">Last updated: {timeAgo}</p>
            <p className={cn("text-xs", rel.color)}>{rel.label}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
