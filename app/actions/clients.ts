"use server"

import { getCurrentUser, getSupabaseAdmin } from '@/lib/auth-helpers'

export interface ClientData {
  id: string
  naam: string
  initialen: string
  email: string
  status: string
  programma: string
  voortgang: number
  laatsteCheckin: string | null
  volgendeSessie: string | null
  trend: "up" | "down" | "neutral"
  tags: string[]
  avatarUrl: string
}

export async function getCoachClients(): Promise<{ success: boolean; clients?: ClientData[]; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  // Get coach's active relationships
  const { data: relationships, error: relError } = await supabase
    .from("coaching_relationships")
    .select("client_id, status")
    .eq("coach_id", user.id)

  if (relError) return { success: false, error: relError.message }

  const clientIds = relationships?.map(r => r.client_id) || []
  if (clientIds.length === 0) return { success: true, clients: [] }

  const relStatusMap = new Map(
    (relationships || []).map(r => [r.client_id, r.status])
  )

  // Parallel fetches
  const [profilesRes, checkInsRes, dailyRes, programsRes, usersRes, sessionsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, first_name, last_name, avatar_url, client_status")
      .in("user_id", clientIds),
    supabase
      .from("check_ins")
      .select("user_id, created_at, weight")
      .in("user_id", clientIds)
      .order("created_at", { ascending: false }),
    supabase
      .from("daily_check_ins")
      .select("user_id, check_in_date, weight")
      .in("user_id", clientIds)
      .order("check_in_date", { ascending: false }),
    supabase
      .from("client_programs")
      .select("client_id, status, training_programs(name)")
      .in("client_id", clientIds)
      .eq("status", "active"),
    supabase.auth.admin.listUsers(),
    supabase
      .from("client_sessions")
      .select("client_id, start_time, type")
      .in("client_id", clientIds)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true }),
  ])

  // Build lookup maps
  const profileMap = new Map(
    (profilesRes.data || []).map(p => [p.user_id, p])
  )
  const emailMap = new Map(
    (usersRes.data?.users || []).map(u => [u.id, u.email || ''])
  )

  // Group check-ins by user
  const checkInsMap = new Map<string, any[]>()
  for (const ci of checkInsRes.data || []) {
    if (!checkInsMap.has(ci.user_id)) checkInsMap.set(ci.user_id, [])
    checkInsMap.get(ci.user_id)!.push(ci)
  }
  const dailyMap = new Map<string, any[]>()
  for (const ci of dailyRes.data || []) {
    if (!dailyMap.has(ci.user_id)) dailyMap.set(ci.user_id, [])
    dailyMap.get(ci.user_id)!.push(ci)
  }

  // Program map
  const programMap = new Map(
    (programsRes.data || []).map(p => [p.client_id, (p as any).training_programs?.name || 'Geen programma'])
  )

  // Next session per client (first upcoming)
  const sessionMap = new Map<string, string>()
  for (const s of sessionsRes.data || []) {
    if (!sessionMap.has(s.client_id)) {
      sessionMap.set(s.client_id, s.start_time)
    }
  }

  // Build client list
  const clients: ClientData[] = clientIds.map(clientId => {
    const p = profileMap.get(clientId)
    const firstName = p?.first_name || ''
    const lastName = p?.last_name || ''
    const naam = `${firstName} ${lastName}`.trim()

    // Weight trend from daily check-ins
    const dailyCheckIns = dailyMap.get(clientId) || []
    let trend: "up" | "down" | "neutral" = "neutral"
    if (dailyCheckIns.length >= 2) {
      const latest = dailyCheckIns[0]?.weight
      const previous = dailyCheckIns[1]?.weight
      if (latest && previous) {
        trend = latest > previous ? "up" : latest < previous ? "down" : "neutral"
      }
    }

    // Last check-in date (most recent of weekly or daily)
    const weeklyCheckins = checkInsMap.get(clientId) || []
    const lastWeekly = weeklyCheckins[0]?.created_at
    const lastDaily = dailyCheckIns[0]?.check_in_date
    let laatsteCheckin: string | null = null
    if (lastWeekly && lastDaily) {
      laatsteCheckin = new Date(lastWeekly) > new Date(lastDaily) ? lastWeekly : lastDaily
    } else {
      laatsteCheckin = lastWeekly || lastDaily || null
    }

    // Status mapping
    const relStatus = relStatusMap.get(clientId) || 'ACTIVE'
    let status = 'actief'
    if (relStatus === 'PAUSED') status = 'gepauzeerd'
    if (relStatus === 'ENDED') status = 'inactief'

    // Build tags from relationship status and program
    const tags: string[] = []
    if (programMap.has(clientId)) tags.push('Online')

    return {
      id: clientId,
      naam,
      initialen: `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase(),
      email: emailMap.get(clientId) || '',
      status,
      programma: programMap.get(clientId) || 'Geen programma',
      voortgang: 0, // TODO: calculate from workouts
      laatsteCheckin,
      volgendeSessie: sessionMap.get(clientId) || null,
      trend,
      tags,
      avatarUrl: p?.avatar_url || '',
    }
  })

  return { success: true, clients }
}
