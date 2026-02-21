"use server"

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export type UserRole = 'ADMIN' | 'COACH' | 'CLIENT'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
}

async function getServerSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  // Return null when Supabase is not configured (e.g. V0 preview)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null

  const supabase = await getServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  return {
    id: user.id,
    email: user.email || '',
    role: (user.user_metadata?.role || 'CLIENT') as UserRole,
    firstName: user.user_metadata?.first_name || '',
    lastName: user.user_metadata?.last_name || '',
  }
}

export async function requireCoach(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'COACH' && user.role !== 'ADMIN')) {
    throw new Error('Unauthorized: Coach or Admin role required')
  }
  return user
}

export async function requireAdmin(): Promise<AuthUser> {
  const user = await getCurrentUser()
  if (!user || user.role !== 'ADMIN') {
    throw new Error('Unauthorized: Admin role required')
  }
  return user
}

export async function getSupabaseAdmin() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    // Return a mock client that returns empty data for V0 preview
    const chainable = { eq: () => chainable, neq: () => chainable, in: () => chainable, gte: () => chainable, lte: () => chainable, gt: () => chainable, lt: () => chainable, order: () => chainable, limit: () => chainable, maybeSingle: async () => ({ data: null, error: null }), single: async () => ({ data: null, error: null }), then: (cb: any) => cb({ data: [], error: null, count: 0 }), data: [], error: null, count: 0 }
    return {
      from: () => ({ select: () => chainable, insert: () => ({ select: () => chainable }), update: () => chainable, delete: () => chainable, upsert: () => chainable }),
      auth: { getUser: async () => ({ data: { user: null }, error: null }), admin: { listUsers: async () => ({ data: { users: [] }, error: null }) } },
      storage: { from: () => ({ upload: async () => ({ data: null, error: null }), getPublicUrl: () => ({ data: { publicUrl: '' } }) }) },
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
