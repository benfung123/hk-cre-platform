'use client'

import { useState } from 'react'
import { 
  Database, 
  FileSpreadsheet, 
  Shield, 
  Calculator, 
  UserCheck,
  ExternalLink,
  Calendar,
  RefreshCw,
  Info,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type DataSource = 'rvd' | 'csdi' | 'hkex' | 'manual' | 'calculated'
type Reliability = 'high' | 'medium' | 'low'

interface DataSourceInfo {
  source: DataSource
  lastUpdated: string
  reliability?: Reliability
  fieldName?: string
  methodology?: string
  notes?: string
}

interface DataProvenanceDrawerProps {
  dataSources: DataSourceInfo[]
  trigger?: React.ReactNode
  className?: string
}

const sourceConfig: Record<DataSource, {
  icon: React.ComponentType<{ className?: string }>
  label: string
  fullName: string
  description: string
  color: string
  bgColor: string
  url?: string
}> = {
  rvd: {
    icon: FileSpreadsheet,
    label: 'RVD',
    fullName: 'Rating and Valuation Department',
    description: 'Official government data from the Hong Kong Rating and Valuation Department, the authoritative source for property valuations and rental statistics.',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    url: 'https://www.rvd.gov.hk/',
  },
  csdi: {
    icon: Database,
    label: 'CSDI',
    fullName: 'Common Spatial Data Infrastructure',
    description: 'Hong Kong spatial data infrastructure providing authoritative geographic and building information.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    url: 'https://csdi.gov.hk/',
  },
  hkex: {
    icon: Shield,
    label: 'HKEX',
    fullName: 'Hong Kong Exchanges and Clearing',
    description: 'Official data from HKEX for listed real estate companies and REITs.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    url: 'https://www.hkex.com.hk/',
  },
  manual: {
    icon: UserCheck,
    label: 'Verified',
    fullName: 'Manually Verified',
    description: 'Data verified through direct research, property visits, or communication with building management.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
  },
  calculated: {
    icon: Calculator,
    label: 'Calculated',
    fullName: 'Platform Calculation',
    description: 'Data derived from calculations based on available information and industry-standard formulas.',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
  },
}

const reliabilityConfig: Record<Reliability, {
  label: string
  description: string
  color: string
}> = {
  high: {
    label: 'High Reliability',
    description: 'Data from official government sources or verified records.',
    color: 'text-green-600',
  },
  medium: {
    label: 'Medium Reliability',
    description: 'Data from reliable secondary sources or industry reports.',
    color: 'text-yellow-600',
  },
  low: {
    label: 'Estimated',
    description: 'Data based on estimates, calculations, or limited information.',
    color: 'text-orange-600',
  },
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-HK', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function DataSourceItem({ info }: { info: DataSourceInfo }) {
  const config = sourceConfig[info.source]
  const Icon = config.icon
  const reliability = info.reliability || 'high'
  const relConfig = reliabilityConfig[reliability]
  
  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg shrink-0",
          config.bgColor
        )}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm">{config.fullName}</h4>
            <span className={cn("text-xs px-1.5 py-0.5 rounded-full bg-muted", relConfig.color)}>
              {relConfig.label}
            </span>
          </div>
          {info.fieldName && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Field: {info.fieldName}
            </p>
          )}
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground leading-relaxed">
        {config.description}
      </p>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>Last updated: {formatDate(info.lastUpdated)}</span>
        </div>
        
        {info.methodology && (
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
            <span className="text-muted-foreground">{info.methodology}</span>
          </div>
        )}
      </div>
      
      {config.url && (
        <a
          href={config.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Visit source
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  )
}

export function DataProvenanceDrawer({ 
  dataSources, 
  trigger,
  className 
}: DataProvenanceDrawerProps) {
  const [open, setOpen] = useState(false)
  
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm" 
            className={cn("gap-1.5", className)}
          >
            <Database className="w-4 h-4" />
            Data Sources
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-2">
          <SheetTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Data Provenance
          </SheetTitle>
          <SheetDescription>
            Detailed information about the sources and reliability of this data.
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-6">
          {dataSources.map((source, index) => (
            <div key={`${source.source}-${index}`}>
              <DataSourceItem info={source} />
              {index < dataSources.length - 1 && (
                <Separator className="mt-6" />
              )}
            </div>
          ))}
        </div>
        
        <SheetFooter className="mt-8 pt-4 border-t">
          <div className="w-full space-y-4">
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <RefreshCw className="w-4 h-4 shrink-0" />
              <p>
                Data is refreshed periodically from official sources. 
                Last system sync: {new Date().toLocaleDateString('en-HK')}
              </p>
            </div>
            <SheetClose asChild>
              <Button variant="outline" className="w-full">
                Close
              </Button>
            </SheetClose>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}