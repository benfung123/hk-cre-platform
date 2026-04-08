'use client'

import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Building2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Grade {
  grade: string
  count: number
}

interface GradeDistributionProps {
  grades: Grade[]
}

const gradeColors: Record<string, string> = {
  'A+': 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200',
  'A': 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
  'B': 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200',
  'C': 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
}

const gradeOrder = ['A+', 'A', 'B', 'C']

export function GradeDistribution({ grades }: GradeDistributionProps) {
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const selectedGrade = searchParams.get('grade') || ''
  
  const handleGradeClick = (grade: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (selectedGrade === grade) {
      params.delete('grade')
    } else {
      params.set('grade', grade)
    }
    router.push(`?${params.toString()}`)
  }
  
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('grade')
    router.push(`?${params.toString()}`)
  }
  
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
        {t('properties.filters.byGrade', { count: totalCount })}:
      </span>
      {sortedGrades.map(({ grade, count }) => (
        <button
          key={grade}
          onClick={() => handleGradeClick(grade)}
          className="cursor-pointer transition-all"
        >
          <Badge 
            variant="outline"
            className={`
              ${gradeColors[grade] || 'bg-gray-100 text-gray-800'}
              ${selectedGrade === grade ? 'ring-2 ring-offset-1 ring-primary font-semibold' : ''}
              px-2 py-0.5 hover:opacity-80
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
      {selectedGrade && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-6 px-2 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
