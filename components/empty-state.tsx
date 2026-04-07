import { useTranslations } from 'next-intl'

interface EmptyStateProps {
  title?: string
  description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  const t = useTranslations()
  
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <img
        src="/empty-state.png"
        alt="No properties found"
        className="w-64 h-48 object-contain mb-6 opacity-80"
      />
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {title || t('emptyState.title') || 'No properties found'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-md">
        {description || t('emptyState.description') || 'Try adjusting your search criteria or filters to find what you\'re looking for.'}
      </p>
    </div>
  )
}
