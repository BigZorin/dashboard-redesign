"use server"

import { getCurrentUser, getSupabaseAdmin } from '@/lib/auth-helpers'

export interface CoachProfile {
  naam: string
  initialen: string
  rol: string
  avatarUrl: string
  isAdmin: boolean
  userId: string
}

export async function getCoachProfile(): Promise<CoachProfile> {
  const user = await getCurrentUser()

  if (!user) {
    return {
      naam: '',
      initialen: '?',
      rol: '',
      avatarUrl: '',
      isAdmin: false,
      userId: '',
    }
  }

  const supabase = await getSupabaseAdmin()
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  const firstName = profile?.first_name || user.firstName || ''
  const lastName = profile?.last_name || user.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim()

  return {
    naam: fullName || user.email,
    initialen: `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || '?',
    rol: user.role === 'ADMIN' ? 'Admin' : 'Online Coach',
    avatarUrl: profile?.avatar_url || '',
    isAdmin: user.role === 'ADMIN',
    userId: user.id,
  }
}
