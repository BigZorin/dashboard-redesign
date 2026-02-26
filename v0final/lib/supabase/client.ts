import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Return null-safe stub when Supabase env vars are missing (V0 preview)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const chainable: any = { eq: () => chainable, neq: () => chainable, in: () => chainable, gte: () => chainable, lte: () => chainable, order: () => chainable, limit: () => chainable, maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }), data: [], error: null, count: 0 }
    return {
      from: () => ({ select: () => chainable, insert: () => ({ select: () => chainable }), update: () => chainable, delete: () => chainable }),
      auth: { getUser: async () => ({ data: { user: null }, error: null }), getSession: async () => ({ data: { session: null }, error: null }), onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), signOut: async () => ({}) },
      channel: () => ({ on: () => ({ subscribe: () => ({}) }), unsubscribe: () => {} }),
      removeChannel: () => {},
    } as any
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}
