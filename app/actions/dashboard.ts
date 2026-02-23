"use server"

import { getCurrentUser, getSupabaseAdmin } from '@/lib/auth-helpers'

export async function getDashboardStats() {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await getSupabaseAdmin()

  // Get coach's assigned client IDs
  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = relationships?.map(r => r.client_id) || []

  // Parallel fetches
  const [checkInsRes, dailyRes, messagesRes, sessionsRes] = await Promise.all([
    // Weekly check-ins count
    clientIds.length > 0
      ? supabase
          .from("check_ins")
          .select("id", { count: "exact", head: true })
          .in("user_id", clientIds)
      : Promise.resolve({ count: 0 }),
    // Daily check-ins this week
    clientIds.length > 0
      ? supabase
          .from("daily_check_ins")
          .select("id", { count: "exact", head: true })
          .in("user_id", clientIds)
          .gte("check_in_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
      : Promise.resolve({ count: 0 }),
    // Unread messages
    supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id)
      .eq("is_read", false),
    // Sessions this week
    supabase
      .from("client_sessions")
      .select("id", { count: "exact", head: true })
      .eq("coach_id", user.id)
      .gte("start_time", new Date(Date.now() - 7 * 86400000).toISOString())
      .lte("start_time", new Date(Date.now() + 7 * 86400000).toISOString()),
  ])

  return {
    actieveClienten: clientIds.length,
    weekCheckIns: (checkInsRes as any)?.count || 0,
    dagCheckIns: (dailyRes as any)?.count || 0,
    ongelezen: (messagesRes as any)?.count || 0,
    sessiesDezWeek: (sessionsRes as any)?.count || 0,
  }
}

export async function getRecentCheckIns(limit = 5) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  // Get coach's assigned client IDs
  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = relationships?.map(r => r.client_id) || []
  if (clientIds.length === 0) return []

  // Fetch recent weekly + daily check-ins
  const [weeklyRes, dailyRes, profilesRes] = await Promise.all([
    supabase
      .from("check_ins")
      .select("id, user_id, created_at, weight, coach_feedback, notes, feeling")
      .in("user_id", clientIds)
      .order("created_at", { ascending: false })
      .limit(limit),
    supabase
      .from("daily_check_ins")
      .select("id, user_id, check_in_date, weight, coach_feedback, notes, mood")
      .in("user_id", clientIds)
      .order("check_in_date", { ascending: false })
      .limit(limit),
    supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", clientIds),
  ])

  const profileMap = new Map(
    (profilesRes.data || []).map(p => [p.user_id, p])
  )

  // Combine and sort
  const weekly = (weeklyRes.data || []).map(ci => {
    const p = profileMap.get(ci.user_id)
    const naam = `${p?.first_name || ''} ${p?.last_name || ''}`.trim()
    return {
      id: ci.id,
      naam,
      initialen: `${(p?.first_name || '?')[0]}${(p?.last_name || '?')[0]}`.toUpperCase(),
      tijd: ci.created_at,
      type: 'weekly' as const,
      status: ci.coach_feedback ? 'afgerond' as const : 'review-nodig' as const,
      notitie: ci.notes || ci.feeling || '',
    }
  })

  const daily = (dailyRes.data || []).map(ci => {
    const p = profileMap.get(ci.user_id)
    const naam = `${p?.first_name || ''} ${p?.last_name || ''}`.trim()
    return {
      id: ci.id,
      naam,
      initialen: `${(p?.first_name || '?')[0]}${(p?.last_name || '?')[0]}`.toUpperCase(),
      tijd: ci.check_in_date,
      type: 'daily' as const,
      status: ci.coach_feedback ? 'afgerond' as const : 'review-nodig' as const,
      notitie: ci.notes || '',
    }
  })

  return [...weekly, ...daily]
    .sort((a, b) => new Date(b.tijd).getTime() - new Date(a.tijd).getTime())
    .slice(0, limit)
}

export async function getUpcomingSessions(limit = 4) {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  const { data: sessions } = await supabase
    .from("client_sessions")
    .select("*")
    .eq("coach_id", user.id)
    .gte("start_time", new Date().toISOString())
    .order("start_time", { ascending: true })
    .limit(limit)

  if (!sessions || sessions.length === 0) return []

  const clientIds = [...new Set(sessions.map(s => s.client_id))]
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, first_name, last_name")
    .in("user_id", clientIds)

  const profileMap = new Map(
    (profiles || []).map(p => [p.user_id, p])
  )

  return sessions.map(s => {
    const p = profileMap.get(s.client_id)
    return {
      id: s.id,
      naam: `${p?.first_name || ''} ${p?.last_name || ''}`.trim(),
      initialen: `${(p?.first_name || '?')[0]}${(p?.last_name || '?')[0]}`.toUpperCase(),
      tijd: s.start_time,
      type: s.type,
      status: s.status,
      mode: s.mode,
    }
  })
}

export async function getClientProgress() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  // Get coach's client programs
  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = relationships?.map(r => r.client_id) || []
  if (clientIds.length === 0) return []

  const [clientProgramsRes, profilesRes] = await Promise.all([
    supabase
      .from("client_programs")
      .select("client_id, status, training_programs(name)")
      .in("client_id", clientIds)
      .eq("status", "ACTIVE"),
    supabase
      .from("profiles")
      .select("user_id, first_name, last_name")
      .in("user_id", clientIds),
  ])

  const profileMap = new Map(
    (profilesRes.data || []).map(p => [p.user_id, p])
  )

  return (clientProgramsRes.data || []).map(cp => {
    const p = profileMap.get(cp.client_id)
    const programName = (cp as any).training_programs?.name || 'Geen programma'
    return {
      naam: `${p?.first_name || ''} ${p?.last_name || ''}`.trim(),
      initialen: `${(p?.first_name || '?')[0]}${(p?.last_name || '?')[0]}`.toUpperCase(),
      programma: programName,
      voortgang: 0, // TODO: calculate from completed workouts
    }
  })
}

// ============================================================
// COMPLIANCE CHART DATA (per day, last 30 days)
// ============================================================

export interface ComplianceChartPoint {
  week: string  // label for x-axis (date)
  training: number
  voeding: number
}

export async function getComplianceChartData(): Promise<ComplianceChartPoint[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = (relationships || []).map(r => r.client_id)
  if (clientIds.length === 0) return []

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("created_at, training_adherence, nutrition_adherence")
    .in("user_id", clientIds)
    .gte("created_at", thirtyDaysAgo)
    .order("created_at", { ascending: true })

  if (!checkIns || checkIns.length === 0) return []

  // Group by date and calculate averages across all clients
  const dayMap = new Map<string, { training: number[]; voeding: number[] }>()
  for (const ci of checkIns) {
    const date = new Date(ci.created_at).toISOString().split("T")[0]
    if (!dayMap.has(date)) dayMap.set(date, { training: [], voeding: [] })
    const d = dayMap.get(date)!
    if (ci.training_adherence != null) d.training.push(ci.training_adherence)
    if (ci.nutrition_adherence != null) d.voeding.push(ci.nutrition_adherence)
  }

  const sorted = [...dayMap.entries()].sort(([a], [b]) => a.localeCompare(b))

  return sorted.map(([date, vals]) => {
    const d = new Date(date + "T12:00:00")
    const label = `${d.getDate()}/${d.getMonth() + 1}`
    return {
      week: label,
      training: vals.training.length > 0
        ? Math.round((vals.training.reduce((s, v) => s + v, 0) / vals.training.length) * 10)
        : 0,
      voeding: vals.voeding.length > 0
        ? Math.round((vals.voeding.reduce((s, v) => s + v, 0) / vals.voeding.length) * 10)
        : 0,
    }
  })
}

// ============================================================
// CLIENT ACTIVITY CHART DATA (current week, Ma-Zo)
// ============================================================

export interface ActivityChartPoint {
  dag: string
  checkins: number
  workouts: number
}

export async function getClientActivityChartData(): Promise<ActivityChartPoint[]> {
  const user = await getCurrentUser()
  if (!user) {
    return ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map(dag => ({ dag, checkins: 0, workouts: 0 }))
  }

  const supabase = await getSupabaseAdmin()

  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = (relationships || []).map(r => r.client_id)
  const orderedDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
  if (clientIds.length === 0) {
    return orderedDays.map(dag => ({ dag, checkins: 0, workouts: 0 }))
  }

  // Calculate current week boundaries (Monday to Sunday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 7)

  const [checkInsResult, workoutsResult] = await Promise.all([
    supabase
      .from("daily_check_ins")
      .select("check_in_date")
      .in("user_id", clientIds)
      .gte("check_in_date", monday.toISOString().split("T")[0])
      .lte("check_in_date", sunday.toISOString().split("T")[0]),
    supabase
      .from("client_workouts")
      .select("completed_at")
      .in("client_id", clientIds)
      .eq("completed", true)
      .gte("completed_at", monday.toISOString())
      .lt("completed_at", sunday.toISOString()),
  ])

  const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"]
  const counts: Record<string, { checkins: number; workouts: number }> = {}
  for (const d of orderedDays) counts[d] = { checkins: 0, workouts: 0 }

  for (const ci of checkInsResult.data || []) {
    const date = new Date(ci.check_in_date + "T12:00:00")
    const name = dayNames[date.getDay()]
    if (counts[name]) counts[name].checkins++
  }

  for (const w of workoutsResult.data || []) {
    if (!w.completed_at) continue
    const date = new Date(w.completed_at)
    const name = dayNames[date.getDay()]
    if (counts[name]) counts[name].workouts++
  }

  return orderedDays.map(dag => ({
    dag,
    checkins: counts[dag].checkins,
    workouts: counts[dag].workouts,
  }))
}
