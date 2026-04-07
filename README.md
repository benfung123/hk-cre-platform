# HK CRE Platform - Commercial Real Estate Data Platform

A "CoStar for Hong Kong/Asia" - a commercial real estate data platform MVP built with Next.js 14 and Supabase.

## Features

- **Homepage**: Search bar, featured properties, market overview stats
- **Property List**: Grid view with filters (district, grade, price range)
- **Property Detail**: Building info, transaction history, tenant list, map location
- **Search**: Full-text search by building name, address, or tenant
- **Analytics Dashboard**: Charts showing avg rent by district, vacancy trends
- **Auth**: Login/signup with Supabase Auth

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Maps**: Mapbox (placeholder implementation)

## Project Structure

```
my-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   │   ├── login/         # Login page
│   │   └── signup/        # Signup page
│   ├── api/               # API routes
│   ├── dashboard/         # Analytics dashboard
│   ├── properties/        # Property pages
│   │   ├── page.tsx       # Property list
│   │   └── [id]/          # Property detail
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── district-chart.tsx
│   ├── navbar.tsx
│   ├── property-filters.tsx
│   └── property-list.tsx
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server client
│   │   ├── middleware.ts # Auth middleware
│   │   └── database.types.ts
│   ├── data.ts           # Data fetching functions
│   └── utils.ts
├── types/                 # TypeScript types
│   └── index.ts
└── supabase/             # Database migrations
    └── migrations/
        ├── 001_initial_schema.sql
        └── 002_sample_data.sql
```

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/hk-cre-platform.git
cd hk-cre-platform/my-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Note your project URL and anon key from Settings > API
3. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in your Supabase credentials in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

### 4. Set Up Database

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/001_initial_schema.sql` - Creates tables and indexes
   - `supabase/migrations/002_sample_data.sql` - Inserts sample Hong Kong property data

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Database Schema

### Properties Table
- `id` (UUID, PK) - Unique identifier
- `name` (VARCHAR) - Building name
- `address` (VARCHAR) - Full address
- `district` (VARCHAR) - District name (e.g., Central, Admiralty)
- `grade` (VARCHAR) - Building grade (A+, A, B, C)
- `year_built` (INTEGER) - Construction year
- `total_sqft` (INTEGER) - Total floor area
- `floors` (INTEGER) - Number of floors
- `lat` / `lng` (DECIMAL) - Coordinates
- `created_at` / `updated_at` (TIMESTAMP)

### Transactions Table
- `id` (UUID, PK)
- `property_id` (UUID, FK) - Reference to property
- `type` (VARCHAR) - 'sale' or 'lease'
- `price` (DECIMAL) - Transaction price
- `price_per_sqft` (DECIMAL) - Price per square foot
- `date` (DATE) - Transaction date
- `tenant_name` (VARCHAR) - Tenant/buyer name
- `floor_area` (INTEGER) - Area of transaction

### Tenancies Table
- `id` (UUID, PK)
- `property_id` (UUID, FK) - Reference to property
- `tenant_name` (VARCHAR) - Current tenant
- `floor` / `unit` (VARCHAR) - Location in building
- `lease_start` / `lease_end` (DATE) - Lease period
- `industry` (VARCHAR) - Tenant industry

## Sample Data

The platform includes sample data for 20+ Hong Kong commercial buildings:

**Central District:**
- International Finance Centre (IFC)
- Exchange Square
- Cheung Kong Center
- HSBC Main Building
- Bank of China Tower
- Jardine House
- The Center
- And more...

**Admiralty:**
- Pacific Place
- Lippo Centre
- Admiralty Centre

**Tsim Sha Tsui:**
- International Commerce Centre (ICC)
- The Gateway
- Ocean Centre

**Causeway Bay:**
- Times Square
- World Trade Centre
- Sino Plaza

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (for admin operations) | Optional |

## Customization

### Adding Map Integration

The current implementation uses a placeholder for maps. To add Mapbox:

1. Get a Mapbox API key from [mapbox.com](https://mapbox.com)
2. Install Mapbox GL JS:
   ```bash
   npm install mapbox-gl @types/mapbox-gl
   ```
3. Replace the placeholder map component in `app/properties/[id]/page.tsx`

### Adding More Properties

To add more properties, insert records into the `properties` table:

```sql
INSERT INTO properties (name, address, district, grade, year_built, total_sqft, floors, lat, lng)
VALUES ('Your Building', 'Address', 'District', 'A+', 2020, 1000000, 50, 22.2850, 114.1580);
```

## API Routes

The app uses server-side data fetching via functions in `lib/data.ts`:

- `getProperties()` - List all properties with optional filters
- `getPropertyById(id)` - Get single property details
- `getPropertyTransactions(propertyId)` - Get transaction history
- `getPropertyTenancies(propertyId)` - Get current tenants
- `getMarketStats()` - Get market overview statistics
- `getDistrictStats()` - Get statistics by district

## Authentication

Supabase Auth is configured for:
- Email/password login
- Email confirmation (can be disabled in Supabase dashboard)
- Session management via cookies

To disable email confirmation:
1. Go to Supabase Dashboard > Authentication > Settings
2. Under "Email Provider", disable "Confirm email"

## Troubleshooting

### Build Errors

If you see "supabaseUrl is required" during build, ensure your `.env.local` file exists and contains valid credentials.

### Database Connection Issues

1. Check your Supabase project is active
2. Verify the URL and anon key are correct
3. Ensure Row Level Security policies allow read access

### Type Errors

Run TypeScript check:
```bash
npx tsc --noEmit
```

## Future Enhancements

- [ ] Mapbox/Google Maps integration
- [ ] Advanced search with filters
- [ ] Export data to CSV/Excel
- [ ] User favorites/watchlist
- [ ] Email alerts for new transactions
- [ ] API rate limiting
- [ ] Property images/uploads
- [ ] Multi-language support (English/Chinese)

## License

MIT

## Support

For issues or questions, please open a GitHub issue.
