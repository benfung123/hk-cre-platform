# Price Trend Charts

This directory contains React components for visualizing Hong Kong commercial real estate market trends.

## Components

### `PricePerSqftTrendChart`
- Shows historical price per square foot trends for sale transactions
- Supports time range filtering (1Y, 3Y, 5Y)
- Includes trend line analysis and YoY change calculation
- Responsive design with mobile support

### `RentalYieldTrendChart`
- Visualizes rental yield trends over time
- Calculates yield as (annual rent / property price) * 100
- Includes statistical analysis and trend direction indicators

### `DistrictComparisonChart`
- Compares key metrics across different districts
- Supports multiple metric types: price, rent, or property count
- Includes summary statistics and district ranking

## Integration

### Market Overview Dashboard
- Located at `/app/market-overview/page.tsx`
- Integrates all three chart components
- Includes time range selector and key metrics summary

### Property Detail Pages
- Located at `/app/property/[id]/page.tsx`
- Shows property-specific price and yield trends
- Includes district comparison for context

## Design Notes

- **HK CRE Branding**: Uses blue (#3b82f6) for price charts, green (#10b981) for rental yield, and orange (#f97316) for district comparisons
- **Accessibility**: All charts include proper ARIA labels, keyboard navigation support, and high contrast mode compatibility
- **Responsive**: Charts adapt to mobile, tablet, and desktop screen sizes
- **Tooltips**: Detailed information on hover/click with formatted currency values

## Testing

- Test components are available in `chart-test.tsx`
- Performance tested with 500+ properties
- Accessibility verified with screen readers
- Mobile responsiveness confirmed on various device sizes

## Dependencies

- `recharts` - Charting library
- `lucide-react` - Icons
- `@/components/ui/card` - UI components
- `@/types` - Type definitions

## Usage Example

```tsx
import { PricePerSqftTrendChart } from '@/components/price-trends'

<PricePerSqftTrendChart 
  transactions={propertyTransactions} 
  timeRange="1Y" 
  title="Central Plaza Price Trend"
/>
```