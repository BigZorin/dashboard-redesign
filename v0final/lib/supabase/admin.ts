import { createClient } from '@supabase/supabase-js'

export function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const chainable: any = { eq: () => chainable, neq: () => chainable, in: () => chainable, gte: () => chainable, lte: () => chainable, order: () => chainable, limit: () => chainable, maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }), data: [], error: null, count: 0 }
    return {
      from: () => ({ select: () => chainable, insert: () => ({ select: () => chainable }), update: () => chainable, delete: () => chainable }),
      auth: { getUser: async () => ({ data: { user: null }, error: null }), admin: { listUsers: async () => ({ data: { users: [] }, error: null }) } },
    } as any
  }
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
