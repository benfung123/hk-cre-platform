'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X } from 'lucide-react'

interface PropertyFiltersProps {
  districts: string[]
}

export function PropertyFilters({ districts }: PropertyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentDistrict = searchParams.get('district') || ''
  const currentGrade = searchParams.get('grade') || ''
  const currentSearch = searchParams.get('search') || ''

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/properties?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/properties')
  }

  const hasFilters = currentDistrict || currentGrade || currentSearch

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search properties..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const timeoutId = setTimeout(() => {
                handleFilterChange('search', e.target.value)
              }, 300)
              return () => clearTimeout(timeoutId)
            }}
            className="pl-10"
          />
        </div>

        <Select
          value={currentDistrict}
          onValueChange={(value) => handleFilterChange('district', value || '')}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Districts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Districts</SelectItem>
            {districts.map((district) => (
              <SelectItem key={district} value={district}>
                {district}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentGrade}
          onValueChange={(value) => handleFilterChange('grade', value || '')}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Grades</SelectItem>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
