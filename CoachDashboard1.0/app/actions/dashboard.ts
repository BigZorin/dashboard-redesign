"use server"

import { getCurrentUser, getSupabaseAdmin } from '@/lib/auth-helpers'
import { format, subDays, startOfWeek, endOfWeek, differenceInDays } from 'date-fns'
import { nl } from 'date-fns/locale'

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

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Parallel fetches
  const [
    weeklyPendingRes,
    dailyPendingRes,
    complianceRes,
    unreadRes,
    checkInsWeekRes,
    moodRes,
    programsRes,
  ] = await Promise.all([
    // Weekly check-ins without coach feedback (review nodig)
    clientIds.length > 0
      ? supabase
          .from("check_ins")
          .select("id", { count: "exact", head: true })
          .in("user_id", clientIds)
          .is("coach_feedback", null)
      : Promise.resolve({ count: 0 }),
    // Daily check-ins without coach feedback (last 7 days)
    clientIds.length > 0
      ? supabase
          .from("daily_check_ins")
          .select("id", { count: "exact", head: true })
          .in("user_id", clientIds)
          .is("coach_feedback", null)
          .gte("check_in_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
      : Promise.resolve({ count: 0 }),
    // Recent compliance scores for average
    clientIds.length > 0
      ? supabase
          .from("check_ins")
          .select("training_adherence, nutrition_adherence")
          .in("user_id", clientIds)
          .order("created_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] }),
    // Unread messages
    supabase
      .from("conversations")
      .select("unread_count_coach")
      .eq("coach_id", user.id),
    // Check-ins this week (daily + weekly combined)
    clientIds.length > 0
      ? supabase
          .from("daily_check_ins")
          .select("id", { count: "exact", head: true })
          .in("user_id", clientIds)
          .gte("check_in_date", format(weekStart, 'yyyy-MM-dd'))
      : Promise.resolve({ count: 0 }),
    // Average mood last 7 days
    clientIds.length > 0
      ? supabase
          .from("daily_check_ins")
          .select("mood")
          .in("user_id", clientIds)
          .gte("check_in_date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0])
          .not("mood", "is", null)
      : Promise.resolve({ data: [] }),
    // Active programs
    clientIds.length > 0
      ? supabase
          .from("client_programs")
          .select("id", { count: "exact", head: true })
          .in("client_id", clientIds)
          .eq("status", "ACTIVE")
      : Promise.resolve({ count: 0 }),
  ])

  // Calculate review needed
  const reviewNodig = ((weeklyPendingRes as any)?.count || 0) + ((dailyPendingRes as any)?.count || 0)

  // Calculate average compliance (1-5 scale → percentage)
  const complianceScores = ((complianceRes as any)?.data || [])
  let gemCompliance = 0
  if (complianceScores.length > 0) {
    const allScores: number[] = []
    for (const ci of complianceScores) {
      if (ci.training_adherence) allScores.push(ci.training_adherence)
      if (ci.nutrition_adherence) allScores.push(ci.nutrition_adherence)
    }
    if (allScores.length > 0) {
      gemCompliance = Math.round((allScores.reduce((s: number, v: number) => s + v, 0) / allScores.length) * 20)
    }
  }

  // Calculate unread messages
  const ongelezen = ((unreadRes as any)?.data || []).reduce(
    (sum: number, c: any) => sum + (c.unread_count_coach || 0), 0
  )

  // Check-ins this week
  const checkInsDezeWeek = (checkInsWeekRes as any)?.count || 0

  // Average mood (1-5 scale)
  const moods = ((moodRes as any)?.data || []).map((d: any) => d.mood).filter(Boolean)
  const gemMood = moods.length > 0
    ? Number((moods.reduce((s: number, v: number) => s + v, 0) / moods.length).toFixed(1))
    : 0

  // Active programs
  const actieveProgrammas = (programsRes as any)?.count || 0

  return {
    actieveClienten: clientIds.length,
    reviewNodig,
    gemCompliance,
    ongelezen,
    checkInsDezeWeek,
    gemMood,
    actieveProgrammas,
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

export async function getComplianceData() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = relationships?.map(r => r.client_id) || []
  if (clientIds.length === 0) return []

  // Get check-ins from last 6 weeks with adherence scores
  const { data: checkIns } = await supabase
    .from("check_ins")
    .select("week_number, year, training_adherence, nutrition_adherence")
    .in("user_id", clientIds)
    .order("year", { ascending: true })
    .order("week_number", { ascending: true })

  if (!checkIns || checkIns.length === 0) return []

  // Group by week and average adherence (scale 1-5 → percentage)
  const weekMap = new Map<string, { training: number[]; voeding: number[] }>()
  for (const ci of checkIns) {
    const key = `Wk ${ci.week_number}`
    if (!weekMap.has(key)) weekMap.set(key, { training: [], voeding: [] })
    const entry = weekMap.get(key)!
    if (ci.training_adherence) entry.training.push(ci.training_adherence)
    if (ci.nutrition_adherence) entry.voeding.push(ci.nutrition_adherence)
  }

  return Array.from(weekMap.entries()).map(([week, data]) => ({
    week,
    training: Math.round(
      (data.training.reduce((s, v) => s + v, 0) / (data.training.length || 1)) * 20
    ),
    voeding: Math.round(
      (data.voeding.reduce((s, v) => s + v, 0) / (data.voeding.length || 1)) * 20
    ),
  }))
}

export async function getClientActivityData() {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = relationships?.map(r => r.client_id) || []
  if (clientIds.length === 0) return []

  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 })

  const [dailyRes, workoutRes] = await Promise.all([
    supabase
      .from("daily_check_ins")
      .select("check_in_date")
      .in("user_id", clientIds)
      .gte("check_in_date", format(weekStart, 'yyyy-MM-dd'))
      .lte("check_in_date", format(weekEnd, 'yyyy-MM-dd')),
    supabase
      .from("workout_logs")
      .select("logged_at, client_workout_id")
      .in("user_id", clientIds)
      .gte("logged_at", weekStart.toISOString())
      .lte("logged_at", weekEnd.toISOString()),
  ])

  // Count per day of week
  const days = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
  const checkinCounts = new Map<string, number>()
  const workoutCounts = new Map<string, Set<string>>()
  days.forEach(d => { checkinCounts.set(d, 0); workoutCounts.set(d, new Set()) })

  for (const ci of dailyRes.data || []) {
    const dayName = format(new Date(ci.check_in_date + 'T00:00:00'), 'EEEEEE', { locale: nl })
    const mapped = dayName.charAt(0).toUpperCase() + dayName.charAt(1)
    if (checkinCounts.has(mapped)) {
      checkinCounts.set(mapped, (checkinCounts.get(mapped) || 0) + 1)
    }
  }

  for (const wl of workoutRes.data || []) {
    const dayName = format(new Date(wl.logged_at), 'EEEEEE', { locale: nl })
    const mapped = dayName.charAt(0).toUpperCase() + dayName.charAt(1)
    if (workoutCounts.has(mapped)) {
      workoutCounts.get(mapped)!.add(wl.client_workout_id)
    }
  }

  return days.map(dag => ({
    dag,
    checkins: checkinCounts.get(dag) || 0,
    workouts: workoutCounts.get(dag)?.size || 0,
  }))
}

// ─── Red Flags / Attention Points ──────────────────────────────────────────

export interface RedFlag {
  clientId: string
  naam: string
  initialen: string
  type: "no_checkin" | "weight_spike" | "low_compliance" | "low_mood"
  message: string
  severity: "warning" | "critical"
  daysSince?: number
}

export async function getRedFlags(): Promise<RedFlag[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = relationships?.map(r => r.client_id) || []
  if (clientIds.length === 0) return []

  const [profilesRes, dailyRes, checkInsRes] = await Promise.all([
    supabase.from("profiles").select("user_id, first_name, last_name").in("user_id", clientIds),
    supabase.from("daily_check_ins").select("user_id, check_in_date, weight, mood, sleep_quality").in("user_id", clientIds).order("check_in_date", { ascending: false }).limit(100),
    supabase.from("check_ins").select("user_id, created_at, training_adherence, nutrition_adherence, feeling").in("user_id", clientIds).order("created_at", { ascending: false }).limit(50),
  ])

  const profileMap = new Map(
    (profilesRes.data || []).map(p => [p.user_id, p])
  )

  const flags: RedFlag[] = []

  // Group daily check-ins by user
  const dailyByUser = new Map<string, any[]>()
  for (const ci of dailyRes.data || []) {
    if (!dailyByUser.has(ci.user_id)) dailyByUser.set(ci.user_id, [])
    dailyByUser.get(ci.user_id)!.push(ci)
  }

  // Group weekly check-ins by user
  const weeklyByUser = new Map<string, any[]>()
  for (const ci of checkInsRes.data || []) {
    if (!weeklyByUser.has(ci.user_id)) weeklyByUser.set(ci.user_id, [])
    weeklyByUser.get(ci.user_id)!.push(ci)
  }

  const today = new Date()

  for (const clientId of clientIds) {
    const p = profileMap.get(clientId)
    if (!p) continue
    const naam = `${p.first_name || ""} ${p.last_name || ""}`.trim()
    const initialen = `${(p.first_name || "?")[0]}${(p.last_name || "?")[0]}`.toUpperCase()

    const daily = dailyByUser.get(clientId) || []
    const weekly = weeklyByUser.get(clientId) || []

    // Flag 1: No check-in for 3+ days
    if (daily.length > 0) {
      const lastDate = new Date(daily[0].check_in_date + "T00:00:00")
      const daysSince = differenceInDays(today, lastDate)
      if (daysSince >= 5) {
        flags.push({ clientId, naam, initialen, type: "no_checkin", severity: "critical", daysSince, message: `${daysSince} dagen geen check-in` })
      } else if (daysSince >= 3) {
        flags.push({ clientId, naam, initialen, type: "no_checkin", severity: "warning", daysSince, message: `${daysSince} dagen geen check-in` })
      }
    } else {
      flags.push({ clientId, naam, initialen, type: "no_checkin", severity: "critical", message: "Nog nooit ingecheckt" })
    }

    // Flag 2: Sudden weight change (>1kg in 2 days)
    if (daily.length >= 3) {
      const w1 = daily[0]?.weight
      const w3 = daily[2]?.weight
      if (w1 && w3) {
        const diff = Math.abs(w1 - w3)
        if (diff >= 1.5) {
          const direction = w1 > w3 ? "gestegen" : "gedaald"
          flags.push({ clientId, naam, initialen, type: "weight_spike", severity: "warning", message: `${diff.toFixed(1)}kg ${direction} in 3 dagen` })
        }
      }
    }

    // Flag 3: Low compliance (training or nutrition <= 2/5)
    if (weekly.length > 0) {
      const latest = weekly[0]
      if (latest.training_adherence && latest.training_adherence <= 2) {
        flags.push({ clientId, naam, initialen, type: "low_compliance", severity: "warning", message: `Training compliance ${latest.training_adherence}/5` })
      }
      if (latest.nutrition_adherence && latest.nutrition_adherence <= 2) {
        flags.push({ clientId, naam, initialen, type: "low_compliance", severity: "warning", message: `Voeding compliance ${latest.nutrition_adherence}/5` })
      }
    }

    // Flag 4: Consistently low mood (avg mood <= 2 over last 3 days)
    if (daily.length >= 3) {
      const recentMoods = daily.slice(0, 3).filter((d: any) => d.mood).map((d: any) => d.mood)
      if (recentMoods.length >= 2) {
        const avgMood = recentMoods.reduce((s: number, v: number) => s + v, 0) / recentMoods.length
        if (avgMood <= 2) {
          flags.push({ clientId, naam, initialen, type: "low_mood", severity: "critical", message: `Gemiddelde mood ${avgMood.toFixed(1)}/5 (3 dagen)` })
        }
      }
    }
  }

  // Sort: critical first, then by daysSince
  return flags.sort((a, b) => {
    if (a.severity !== b.severity) return a.severity === "critical" ? -1 : 1
    return (b.daysSince || 0) - (a.daysSince || 0)
  })
}

// ─── Weight Trends per Client ──────────────────────────────────────────────

export interface ClientWeightTrend {
  clientId: string
  naam: string
  initialen: string
  currentWeight: number | null
  goalWeight: number | null
  trend: "up" | "down" | "stable"
  change: number // last 7 days
  weights: { date: string; weight: number }[] // last 14 data points for sparkline
}

export async function getClientWeightTrends(): Promise<ClientWeightTrend[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id")
    .eq("coach_id", user.id)
    .eq("status", "ACTIVE")

  const clientIds = relationships?.map(r => r.client_id) || []
  if (clientIds.length === 0) return []

  const [profilesRes, dailyRes] = await Promise.all([
    supabase.from("profiles").select("user_id, first_name, last_name, current_weight_kg, goal_weight_kg").in("user_id", clientIds),
    supabase.from("daily_check_ins").select("user_id, check_in_date, weight").in("user_id", clientIds).order("check_in_date", { ascending: false }).limit(200),
  ])

  const profileMap = new Map(
    (profilesRes.data || []).map(p => [p.user_id, p])
  )

  // Group daily by user
  const dailyByUser = new Map<string, any[]>()
  for (const ci of dailyRes.data || []) {
    if (ci.weight) {
      if (!dailyByUser.has(ci.user_id)) dailyByUser.set(ci.user_id, [])
      dailyByUser.get(ci.user_id)!.push(ci)
    }
  }

  return clientIds.map(clientId => {
    const p = profileMap.get(clientId)
    const daily = dailyByUser.get(clientId) || []

    const naam = `${p?.first_name || ""} ${p?.last_name || ""}`.trim()
    const initialen = `${(p?.first_name || "?")[0]}${(p?.last_name || "?")[0]}`.toUpperCase()

    // Sparkline data (last 14 points, reversed to chronological order)
    const weights = daily.slice(0, 14).reverse().map((d: any) => ({
      date: d.check_in_date,
      weight: d.weight,
    }))

    // Calculate 7-day change
    let change = 0
    let trend: "up" | "down" | "stable" = "stable"
    if (daily.length >= 2) {
      const latest = daily[0]?.weight
      const weekAgo = daily[Math.min(6, daily.length - 1)]?.weight
      if (latest && weekAgo) {
        change = Number((latest - weekAgo).toFixed(1))
        trend = change > 0.3 ? "up" : change < -0.3 ? "down" : "stable"
      }
    }

    return {
      clientId,
      naam,
      initialen,
      currentWeight: daily[0]?.weight || p?.current_weight_kg || null,
      goalWeight: p?.goal_weight_kg || null,
      trend,
      change,
      weights,
    }
  }).filter(c => c.weights.length > 0)
}

// ─── Notifications Count (Live) ────────────────────────────────────────────

export async function getNotificationCount(): Promise<number> {
  const user = await getCurrentUser()
  if (!user) return 0

  const supabase = await getSupabaseAdmin()

  const [unreadRes, pendingCheckInsRes] = await Promise.all([
    // Unread messages
    supabase
      .from("conversations")
      .select("unread_count_coach")
      .eq("coach_id", user.id),
    // Check-ins without coach feedback
    supabase
      .from("check_ins")
      .select("id", { count: "exact", head: true })
      .eq("coach_id", user.id)
      .is("coach_feedback", null),
  ])

  const unread = ((unreadRes.data || []) as any[]).reduce(
    (sum, c) => sum + (c.unread_count_coach || 0), 0
  )
  const pendingReviews = (pendingCheckInsRes as any)?.count || 0

  return unread + pendingReviews
}
