import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

// Client for build-time/static generation (no cookies)
export function createStaticClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
