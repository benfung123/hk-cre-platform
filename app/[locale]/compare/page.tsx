import { ComparisonView } from '@/components/comparison/comparison-view'

export const metadata = {
  title: 'Compare Properties | HK CRE Platform',
  description: 'Compare commercial properties side by side',
}

export default function ComparePage() {
  return (
    <div className="container py-8">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold">Compare Properties</h1>
          <p className="text-muted-foreground">
            Compare up to 3 properties side by side to find the best investment opportunity.
          </p>
        </div>

        <ComparisonView />
      </div>
    </div>
  )
}
