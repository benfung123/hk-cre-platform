'use client'

import { useEffect, useState } from 'react'
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataFreshnessIndicatorProps {
  lastUpdated: string
  className?: string
  showLabel?: boolean
}

type FreshnessStatus = 'fresh' | 'stale' | 'old'

interface FreshnessConfig {
  status: FreshnessStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

function getFreshnessConfig(dateString: string): FreshnessConfig {
  const date = new Date(dateString)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (days < 7) {
    return {
      status: 'fresh',
      label: 'Current',
      icon: CheckCircle2,
      color: 'text-green-600 bg-green-50',
    }
  } else if (days < 30) {
    return {
      status: 'stale',
      label: 'Recent',
      icon: Clock,
      color: 'text-yellow-600 bg-yellow-50',
    }
  } else {
    return {
      status: 'old',
      label: 'Outdated',
      icon: AlertCircle,
      color: 'text-orange-600 bg-orange-50',
    }
  }
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const days = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (days < 0) return 'Future date'
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}

export function DataFreshnessIndicator({ 
  lastUpdated, 
  className,
  showLabel = true 
}: DataFreshnessIndicatorProps) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const config = getFreshnessConfig(lastUpdated)
  const Icon = config.icon
  const timeAgo = getTimeAgo(lastUpdated)
  
  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        "bg-gray-100 text-gray-600",
        className
      )}>
        <Clock className="w-3.5 h-3.5" />
        {showLabel && <span>Loading...</span>}
      </div>
    )
  }
  
  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        config.color,
        className
      )}
      title={`Last updated: ${timeAgo}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {showLabel && (
        <span>
          {config.label} · {timeAgo}
        </span>
      )}
    </div>
  )
}