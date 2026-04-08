'use client'

import { useTranslations } from 'next-intl'
import { Badge } from '@/components/ui/badge'
import { Building2 } from 'lucide-react'

interface Grade {
  grade: string
  count: number
}

interface GradeDistributionProps {
  grades: Grade[]
  selectedGrade?: string
  onSelectGrade?: (grade: string) => void
}

const gradeColors: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
  'A': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'B': 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  'C': 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
}

const gradeOrder = ['A+', 'A', 'B', 'C']

export function GradeDistribution({ grades, selectedGrade, onSelectGrade }: GradeDistributionProps) {
  const t = useTranslations()
  
  // Sort grades in order: A+, A, B, C
  const sortedGrades = [...grades].sort((a, b) => {
    const indexA = gradeOrder.indexOf(a.grade)
    const indexB = gradeOrder.indexOf(b.grade)
    return indexA - indexB
  })

  const totalCount = grades.reduce((sum, g) => sum + g.count, 0)

  if (grades.length === 0) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground flex items-center gap-1">
        <Building2 className="h-4 w-4" />
        {t('properties.filters.byGrade')}:
      </span>
      {sortedGrades.map(({ grade, count }) => (
        <button
          key={grade}
          onClick={() => onSelectGrade?.(selectedGrade === grade ? '' : grade)}
          className={`transition-all ${onSelectGrade ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Badge 
            variant="outline"
            className={`
              ${gradeColors[grade] || 'bg-gray-100 text-gray-800'}
              ${selectedGrade === grade ? 'ring-2 ring-offset-1 ring-primary' : ''}
              px-2 py-0.5
            `}
          >
            Grade {grade}
            <span className="ml-1 text-xs opacity-75">({count})</span>
          </Badge>
        </button>
      ))}
      <span className="text-xs text-muted-foreground ml-2">
        {totalCount} total
      </span>
    </div>
  )
}
