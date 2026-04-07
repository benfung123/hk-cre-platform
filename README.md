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

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

### Installation

```bash
npm install
```

### Database Setup

Run the SQL migrations in `supabase/migrations/` to set up your database schema:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the contents of `001_initial_schema.sql`
4. Run the contents of `002_sample_data.sql`

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
npm run build
```

## Deployment

This app is ready to deploy on Vercel:

1. Push your code to GitHub
2. Import your repository on Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Project Structure

```
my-app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   ├── api/               # API routes
│   ├── dashboard/         # Analytics dashboard
│   ├── properties/        # Property pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                   # Utilities
│   ├── supabase/         # Supabase clients
│   └── utils.ts          # Helper functions
├── types/                 # TypeScript types
└── supabase/             # Database migrations
    └── migrations/
```

## License

MIT
