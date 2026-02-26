"use server"

import { requireCoach, getSupabaseAdmin, type AuthUser } from '@/lib/auth-helpers'

// ─── Types ──────────────────────────────────────────────────────
export interface AdminClient {
  id: string
  naam: string
  email: string
  initialen: string
  status: "wachtrij" | "goedgekeurd" | "afgewezen"
  coach: string | null
  coachId: string | null
  aangemeld: string
  rejectionReason: string | null
}

export interface CoachOption {
  id: string
  naam: string
}

// ─── Fetch all clients (admin view) ──────────────────────────────
export async function getAllClients(): Promise<{
  success: boolean
  clients?: AdminClient[]
  coaches?: CoachOption[]
  error?: string
}> {
  try {
    const user = await requireCoach()
    const supabase = await getSupabaseAdmin()

    // Get all users with CLIENT role
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers({
      perPage: 500,
    })
    if (usersError) throw usersError

    const clientUsers = (users?.users || []).filter(
      (u: any) => u.user_metadata?.role === 'CLIENT'
    )

    if (clientUsers.length === 0) {
      return { success: true, clients: [], coaches: [] }
    }

    const clientIds = clientUsers.map((u: any) => u.id)

    // Fetch profiles for all clients
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, first_name, last_name, client_status, rejection_reason')
      .in('user_id', clientIds)

    const profileMap = new Map(
      (profiles || []).map((p: any) => [p.user_id, p])
    )

    // Fetch active coaching relationships
    const { data: relationships } = await supabase
      .from('coaching_relationships')
      .select('client_id, coach_id, status')
      .in('client_id', clientIds)
      .eq('status', 'ACTIVE')

    const relMap = new Map(
      (relationships || []).map((r: any) => [r.client_id, r.coach_id])
    )

    // Fetch coach profiles for names
    const coachIds = [...new Set((relationships || []).map((r: any) => r.coach_id))]
    const coachProfileMap = new Map<string, string>()

    if (coachIds.length > 0) {
      const { data: coachProfiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', coachIds)

      for (const cp of coachProfiles || []) {
        coachProfileMap.set(cp.user_id, `${cp.first_name || ''} ${cp.last_name || ''}`.trim())
      }
    }

    // Get all coaches for dropdown
    const coachUsers = (users?.users || []).filter(
      (u: any) => u.user_metadata?.role === 'COACH' || u.user_metadata?.role === 'ADMIN'
    )

    const coachOptions: CoachOption[] = []
    if (coachUsers.length > 0) {
      const coachUserIds = coachUsers.map((u: any) => u.id)
      const { data: allCoachProfiles } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .in('user_id', coachUserIds)

      for (const cp of allCoachProfiles || []) {
        const name = `${cp.first_name || ''} ${cp.last_name || ''}`.trim()
        if (name) {
          coachOptions.push({ id: cp.user_id, naam: name })
        }
      }
    }

    // Build client list
    const clients: AdminClient[] = clientUsers.map((u: any) => {
      const profile = profileMap.get(u.id)
      const firstName = profile?.first_name || u.user_metadata?.firstName || ''
      const lastName = profile?.last_name || u.user_metadata?.lastName || ''
      const naam = `${firstName} ${lastName}`.trim() || u.email || 'Onbekend'
      const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || '??'

      const dbStatus = profile?.client_status || 'pending'
      let status: AdminClient['status'] = 'wachtrij'
      if (dbStatus === 'approved') status = 'goedgekeurd'
      else if (dbStatus === 'rejected') status = 'afgewezen'

      const coachId = relMap.get(u.id) || null
      const coachName = coachId ? (coachProfileMap.get(coachId) || null) : null

      return {
        id: u.id,
        naam,
        email: u.email || '',
        initialen: initials,
        status,
        coach: coachName,
        coachId,
        aangemeld: new Date(u.created_at).toLocaleDateString('nl-NL', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        rejectionReason: profile?.rejection_reason || null,
      }
    })

    // Sort: wachtrij first, then afgewezen, then goedgekeurd
    const order = { wachtrij: 0, afgewezen: 1, goedgekeurd: 2 }
    clients.sort((a, b) => order[a.status] - order[b.status])

    return { success: true, clients, coaches: coachOptions }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── Approve client ──────────────────────────────────────────────
export async function approveClient(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCoach()
    const supabase = await getSupabaseAdmin()

    const { error } = await supabase
      .from('profiles')
      .update({
        client_status: 'approved',
        status_updated_at: new Date().toISOString(),
        status_updated_by: user.id,
        rejection_reason: null,
      })
      .eq('user_id', clientId)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── Reject client ───────────────────────────────────────────────
export async function rejectClient(
  clientId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireCoach()
    const supabase = await getSupabaseAdmin()

    const { error } = await supabase
      .from('profiles')
      .update({
        client_status: 'rejected',
        status_updated_at: new Date().toISOString(),
        status_updated_by: user.id,
        rejection_reason: reason || 'Afgewezen door coach',
      })
      .eq('user_id', clientId)

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── Assign coach to client ──────────────────────────────────────
export async function assignCoachToClient(
  clientId: string,
  coachId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await requireCoach()
    const supabase = await getSupabaseAdmin()

    // End any existing active relationships for this client
    await supabase
      .from('coaching_relationships')
      .update({ status: 'ENDED', ended_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('status', 'ACTIVE')

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('coaching_relationships')
      .select('id')
      .eq('client_id', clientId)
      .eq('coach_id', coachId)
      .maybeSingle()

    if (existing) {
      // Reactivate existing relationship
      await supabase
        .from('coaching_relationships')
        .update({ status: 'ACTIVE', ended_at: null, started_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      // Create new relationship
      const { error } = await supabase
        .from('coaching_relationships')
        .insert({
          client_id: clientId,
          coach_id: coachId,
          status: 'ACTIVE',
          started_at: new Date().toISOString(),
        })

      if (error) throw error
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}

// ─── Unassign coach from client ──────────────────────────────────
export async function unassignCoach(clientId: string): Promise<{ success: boolean; error?: string }> {
  try {
    await requireCoach()
    const supabase = await getSupabaseAdmin()

    const { error } = await supabase
      .from('coaching_relationships')
      .update({ status: 'ENDED', ended_at: new Date().toISOString() })
      .eq('client_id', clientId)
      .eq('status', 'ACTIVE')

    if (error) throw error
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message }
  }
}
