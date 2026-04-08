import { ComparisonView } from '@/components/comparison/comparison-view'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('compare')
  return {
    title: `${t('pageTitle')} | HK CRE Platform`,
    description: t('pageDescription'),
  }
}

export default async function ComparePage() {
  const t = await getTranslations('compare')
  
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">{t('pageTitle')}</h1>
          <p className="text-muted-foreground">
            {t('pageDescription')}
          </p>
        </div>

        <ComparisonView />
      </div>
    </div>
  )
}
