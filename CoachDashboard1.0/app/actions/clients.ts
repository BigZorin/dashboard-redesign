"use server"

import { getCurrentUser, getSupabaseAdmin } from '@/lib/auth-helpers'
import { differenceInDays } from 'date-fns'

export interface ClientData {
  id: string
  naam: string
  initialen: string
  email: string
  status: string // actief | risico | gepauzeerd | inactief
  programma: string
  voortgang: number // 0-100 percentage
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

  // Get coach's relationships (all statuses)
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
  const [profilesRes, checkInsRes, dailyRes, programsRes, usersRes, sessionsRes, workoutsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("user_id, first_name, last_name, avatar_url, client_status")
      .in("user_id", clientIds),
    supabase
      .from("check_ins")
      .select("user_id, created_at, weight, training_adherence, nutrition_adherence, motivation, has_pain, pain_location, pain_severity")
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
      .eq("status", "ACTIVE"),
    supabase.auth.admin.listUsers(),
    supabase
      .from("client_sessions")
      .select("client_id, start_time, type, mode")
      .in("client_id", clientIds)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true }),
    // Workouts for progress calculation (last 30 days)
    supabase
      .from("client_workouts")
      .select("client_id, completed")
      .in("client_id", clientIds)
      .gte("scheduled_date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
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
  const sessionMap = new Map<string, any>()
  for (const s of sessionsRes.data || []) {
    if (!sessionMap.has(s.client_id)) {
      sessionMap.set(s.client_id, s)
    }
  }

  // Workout progress per client (completed / total in last 30 days)
  const workoutsByClient = new Map<string, { total: number; completed: number }>()
  for (const w of workoutsRes.data || []) {
    if (!workoutsByClient.has(w.client_id)) {
      workoutsByClient.set(w.client_id, { total: 0, completed: 0 })
    }
    const entry = workoutsByClient.get(w.client_id)!
    entry.total++
    if (w.completed) entry.completed++
  }

  const today = new Date()

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
      laatsteCheckin = new Date(lastWeekly) > new Date(lastDaily + "T23:59:59") ? lastWeekly : lastDaily
    } else {
      laatsteCheckin = lastWeekly || lastDaily || null
    }

    // Status: auto-detect "risico" for active clients with no recent check-in
    const relStatus = relStatusMap.get(clientId) || 'ACTIVE'
    let status = 'actief'
    if (relStatus === 'PAUSED') {
      status = 'gepauzeerd'
    } else if (relStatus === 'ENDED') {
      status = 'inactief'
    } else if (relStatus === 'ACTIVE') {
      // Auto-detect risk: no check-in for 3+ days
      if (laatsteCheckin) {
        const lastDate = new Date(laatsteCheckin)
        const daysSince = differenceInDays(today, lastDate)
        if (daysSince >= 3) status = 'risico'
      } else {
        // Never checked in → risico
        status = 'risico'
      }
    }

    // Progress from workout completion (last 30 days)
    const workoutStats = workoutsByClient.get(clientId)
    const voortgang = workoutStats && workoutStats.total > 0
      ? Math.round((workoutStats.completed / workoutStats.total) * 100)
      : 0

    // Build tags
    const tags: string[] = []
    const session = sessionMap.get(clientId)
    if (session?.mode === 'ONLINE' || session?.mode === 'online') {
      tags.push('Online')
    } else if (session?.mode === 'IN_PERSON' || session?.mode === 'in_person') {
      tags.push('In-person')
    } else if (session?.mode === 'HYBRID' || session?.mode === 'hybrid') {
      tags.push('Hybride')
    }
    if (programMap.has(clientId)) tags.push('Programma')
    if (workoutStats && workoutStats.total > 0 && workoutStats.completed === workoutStats.total) {
      tags.push('100% compliant')
    }
    // Fallback if no tags
    if (tags.length === 0) tags.push('Online')

    return {
      id: clientId,
      naam,
      initialen: `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase(),
      email: emailMap.get(clientId) || '',
      status,
      programma: programMap.get(clientId) || 'Geen programma',
      voortgang,
      laatsteCheckin,
      volgendeSessie: session?.start_time || null,
      trend,
      tags,
      avatarUrl: p?.avatar_url || '',
    }
  })

  return { success: true, clients }
}

// ============================================================================
// CLIENT DETAIL — Individual client data for detail page
// ============================================================================

export interface ClientDetailData {
  id: string
  naam: string
  initialen: string
  email: string
  status: string
  avatarUrl: string
  programma: string
  programmaWeek: number
  programmaTotaalWeken: number
  lidSinds: string
  tags: string[]
  // Header stats
  gewicht: number | null
  gewichtTrend: number
  complianceTraining: number
  complianceVoeding: number
  eiwitGem: number
  energieGem: number
}

export async function getClientDetail(clientId: string): Promise<{ success: boolean; client?: ClientDetailData; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  // Verify coach has access to this client
  const { data: rel } = await supabase
    .from("coaching_relationships")
    .select("status, started_at")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .single()

  if (!rel) return { success: false, error: 'Geen toegang tot deze cliënt' }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString()

  // Parallel fetches
  const [profileRes, userRes, programRes, checkInsRes, dailyRes, workoutsRes, foodLogsRes] = await Promise.all([
    supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url")
      .eq("user_id", clientId)
      .single(),
    supabase.auth.admin.getUserById(clientId),
    supabase
      .from("client_programs")
      .select("start_date, current_block_index, training_programs(name)")
      .eq("client_id", clientId)
      .eq("status", "ACTIVE")
      .maybeSingle(),
    // Last 8 weekly check-ins for compliance averages
    supabase
      .from("check_ins")
      .select("training_adherence, nutrition_adherence, weight, energy_level, motivation, has_pain, pain_location, pain_severity")
      .eq("user_id", clientId)
      .order("created_at", { ascending: false })
      .limit(8),
    // Last 30 daily check-ins for weight trend
    supabase
      .from("daily_check_ins")
      .select("weight, check_in_date")
      .eq("user_id", clientId)
      .order("check_in_date", { ascending: false })
      .limit(30),
    // Workouts last 30 days
    supabase
      .from("client_workouts")
      .select("completed")
      .eq("client_id", clientId)
      .gte("scheduled_date", new Date(Date.now() - 30 * 86400000).toISOString().split("T")[0]),
    // Food logs last 7 days for avg protein
    supabase
      .from("food_logs")
      .select("protein_grams, date")
      .eq("user_id", clientId)
      .gte("date", new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0]),
  ])

  const p = profileRes.data
  const firstName = p?.first_name || ''
  const lastName = p?.last_name || ''

  // Program info
  const programNaam = (programRes.data as any)?.training_programs?.name || 'Geen programma'
  const startDate = programRes.data?.start_date
  let programmaWeek = 0
  const programmaTotaalWeken = 12 // Default block length
  if (startDate) {
    programmaWeek = Math.max(1, Math.ceil(differenceInDays(new Date(), new Date(startDate)) / 7))
  }

  // Weight: latest from daily check-ins, trend from last 2
  const dailyData = dailyRes.data || []
  const latestWeight = dailyData.find(d => d.weight != null)?.weight || null
  let gewichtTrend = 0
  const weightsWithValues = dailyData.filter(d => d.weight != null)
  if (weightsWithValues.length >= 2) {
    gewichtTrend = Number((weightsWithValues[0].weight - weightsWithValues[1].weight).toFixed(1))
  }

  // Training compliance from check-ins
  const checkIns = checkInsRes.data || []
  const trainingScores = checkIns.filter(ci => ci.training_adherence != null).map(ci => ci.training_adherence)
  const complianceTraining = trainingScores.length > 0
    ? Math.round(trainingScores.reduce((a: number, b: number) => a + b, 0) / trainingScores.length * 10)
    : 0

  // Nutrition compliance from check-ins
  const nutritionScores = checkIns.filter(ci => ci.nutrition_adherence != null).map(ci => ci.nutrition_adherence)
  const complianceVoeding = nutritionScores.length > 0
    ? Math.round(nutritionScores.reduce((a: number, b: number) => a + b, 0) / nutritionScores.length * 10)
    : 0

  // Average protein from food logs (last 7 days)
  const foodLogs = foodLogsRes.data || []
  const proteinByDay = new Map<string, number>()
  for (const log of foodLogs) {
    const day = log.date
    proteinByDay.set(day, (proteinByDay.get(day) || 0) + (log.protein_grams || 0))
  }
  const proteinDays = Array.from(proteinByDay.values())
  const eiwitGem = proteinDays.length > 0
    ? Math.round(proteinDays.reduce((a, b) => a + b, 0) / proteinDays.length)
    : 0

  // Average energy from check-ins
  const energyScores = checkIns.filter(ci => ci.energy_level != null).map(ci => ci.energy_level)
  const energieGem = energyScores.length > 0
    ? Math.round(energyScores.reduce((a: number, b: number) => a + b, 0) / energyScores.length)
    : 0

  // Status
  const relStatus = rel.status
  let status = 'actief'
  if (relStatus === 'PAUSED') status = 'gepauzeerd'
  else if (relStatus === 'ENDED') status = 'inactief'

  // Tags
  const tags: string[] = []
  if (programRes.data) tags.push('Programma')
  tags.push('Online') // Default

  // Lid sinds
  const lidSinds = rel.started_at
    ? new Date(rel.started_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })
    : 'Onbekend'

  return {
    success: true,
    client: {
      id: clientId,
      naam: `${firstName} ${lastName}`.trim() || 'Onbekend',
      initialen: `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase(),
      email: userRes.data?.user?.email || '',
      status,
      avatarUrl: p?.avatar_url || '',
      programma: programNaam,
      programmaWeek: Math.min(programmaWeek, programmaTotaalWeken),
      programmaTotaalWeken,
      lidSinds,
      tags,
      gewicht: latestWeight ? Number(latestWeight) : null,
      gewichtTrend,
      complianceTraining,
      complianceVoeding,
      eiwitGem,
      energieGem,
    }
  }
}

// ============================================================================
// CLIENT OVERVIEW — Data for the Overzicht tab
// ============================================================================

export interface ClientOverviewData {
  // Snelle stats
  programmaWeek: number
  programmaTotaalWeken: number
  complianceTraining: number
  complianceVoeding: number
  gewichtsTrend: number
  energieNiveau: number
  slaapKwaliteit: number
  moodScore: number
  // Huidig programma
  programmaNaam: string
  programmaBeschrijving: string
  trainingsDagen: number
  voltooidDezeWeek: number
  // Macro's vandaag
  macros: {
    kcal: { huidig: number; doel: number }
    eiwit: { huidig: number; doel: number }
    koolhydraten: { huidig: number; doel: number }
    vetten: { huidig: number; doel: number }
  }
  // Gewichtstrend chart
  gewichtsData: Array<{ week: string; gewicht: number }>
  // Laatste check-in
  laatsteCheckin: {
    datum: string
    gewicht: number | null
    verandering: number
    energie: number
    slaap: number
    opmerkingen: string
  } | null
  // Komende sessies
  komendeSessies: Array<{ datum: string; tijd: string; type: string; status: string }>
  // Recente coach feedback
  recenteFeedback: Array<{ datum: string; tekst: string; categorie: string }>
}

export async function getClientOverview(clientId: string): Promise<{ success: boolean; data?: ClientOverviewData; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  // Verify access
  const { data: rel } = await supabase
    .from("coaching_relationships")
    .select("status")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .single()

  if (!rel) return { success: false, error: 'Geen toegang' }

  const today = new Date()
  const todayStr = today.toISOString().split("T")[0]

  // Get start of current week (Monday)
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - mondayOffset)
  const weekStartStr = weekStart.toISOString().split("T")[0]

  const [programRes, checkInsRes, dailyRes, workoutsThisWeekRes, foodTodayRes, sessionsRes] = await Promise.all([
    // Active program
    supabase
      .from("client_programs")
      .select("start_date, current_block_index, training_programs(name, description)")
      .eq("client_id", clientId)
      .eq("status", "ACTIVE")
      .maybeSingle(),
    // Last 12 weekly check-ins
    supabase
      .from("check_ins")
      .select("created_at, weight, training_adherence, nutrition_adherence, energy_level, sleep_quality, stress_level, motivation, has_pain, pain_location, pain_severity, notes, coach_feedback, coach_feedback_at")
      .eq("user_id", clientId)
      .order("created_at", { ascending: false })
      .limit(12),
    // Daily check-ins for weight chart (last 12 weeks = 84 days)
    supabase
      .from("daily_check_ins")
      .select("check_in_date, weight, mood, sleep_quality")
      .eq("user_id", clientId)
      .order("check_in_date", { ascending: false })
      .limit(84),
    // Workouts this week
    supabase
      .from("client_workouts")
      .select("completed, scheduled_date")
      .eq("client_id", clientId)
      .gte("scheduled_date", weekStartStr)
      .lte("scheduled_date", todayStr + "T23:59:59"),
    // Food logs today
    supabase
      .from("food_logs")
      .select("calories, protein_grams, carbs_grams, fat_grams")
      .eq("user_id", clientId)
      .eq("date", todayStr),
    // Upcoming sessions
    supabase
      .from("client_sessions")
      .select("start_time, type, status")
      .eq("client_id", clientId)
      .gte("start_time", today.toISOString())
      .order("start_time", { ascending: true })
      .limit(5),
  ])

  const checkIns = checkInsRes.data || []
  const dailyData = dailyRes.data || []
  const workoutsThisWeek = workoutsThisWeekRes.data || []
  const foodToday = foodTodayRes.data || []

  // Program info
  const prog = programRes.data as any
  const programmaNaam = prog?.training_programs?.name || 'Geen programma'
  const programmaBeschrijving = prog?.training_programs?.description || ''
  const startDate = prog?.start_date
  let programmaWeek = 0
  const programmaTotaalWeken = 12
  if (startDate) {
    programmaWeek = Math.max(1, Math.ceil(differenceInDays(today, new Date(startDate)) / 7))
  }

  // Training compliance (avg of last 4 check-ins, score 1-10 → %)
  const trainingScores = checkIns.slice(0, 4).filter(ci => ci.training_adherence != null).map(ci => ci.training_adherence)
  const complianceTraining = trainingScores.length > 0
    ? Math.round(trainingScores.reduce((a: number, b: number) => a + b, 0) / trainingScores.length * 10)
    : 0

  // Nutrition compliance
  const nutritionScores = checkIns.slice(0, 4).filter(ci => ci.nutrition_adherence != null).map(ci => ci.nutrition_adherence)
  const complianceVoeding = nutritionScores.length > 0
    ? Math.round(nutritionScores.reduce((a: number, b: number) => a + b, 0) / nutritionScores.length * 10)
    : 0

  // Weight trend (latest vs previous from daily check-ins)
  const weightsWithValues = dailyData.filter(d => d.weight != null)
  let gewichtsTrend = 0
  if (weightsWithValues.length >= 2) {
    gewichtsTrend = Number((weightsWithValues[0].weight - weightsWithValues[1].weight).toFixed(1))
  }

  // Energy, sleep, mood from latest check-in / daily
  const latestCheckin = checkIns[0]
  const energieNiveau = latestCheckin?.energy_level || 0
  const slaapKwaliteit = latestCheckin?.sleep_quality || 0

  const latestDaily = dailyData[0]
  const moodScore = latestDaily?.mood || 0

  // Workouts this week
  const trainingsDagen = workoutsThisWeek.length
  const voltooidDezeWeek = workoutsThisWeek.filter(w => w.completed).length

  // Macros today (sum food logs)
  const macros = {
    kcal: { huidig: 0, doel: 2200 },
    eiwit: { huidig: 0, doel: 160 },
    koolhydraten: { huidig: 0, doel: 250 },
    vetten: { huidig: 0, doel: 65 },
  }
  for (const log of foodToday) {
    macros.kcal.huidig += log.calories || 0
    macros.eiwit.huidig += log.protein_grams || 0
    macros.koolhydraten.huidig += log.carbs_grams || 0
    macros.vetten.huidig += log.fat_grams || 0
  }

  // Weight chart data (group by week from daily check-ins)
  const gewichtsData: Array<{ week: string; gewicht: number }> = []
  const weeklyWeights = new Map<string, number[]>()
  for (const d of [...dailyData].reverse()) {
    if (d.weight == null) continue
    const date = new Date(d.check_in_date)
    const weekNum = Math.ceil(differenceInDays(date, new Date(startDate || date)) / 7)
    const key = `Wk ${Math.max(1, weekNum)}`
    if (!weeklyWeights.has(key)) weeklyWeights.set(key, [])
    weeklyWeights.get(key)!.push(Number(d.weight))
  }
  for (const [week, weights] of weeklyWeights) {
    gewichtsData.push({
      week,
      gewicht: Number((weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)),
    })
  }
  // If no weekly data, use raw daily data points
  if (gewichtsData.length === 0 && weightsWithValues.length > 0) {
    for (const d of [...weightsWithValues].reverse().slice(-12)) {
      gewichtsData.push({
        week: new Date(d.check_in_date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
        gewicht: Number(d.weight),
      })
    }
  }

  // Laatste check-in details
  let laatsteCheckinData: ClientOverviewData['laatsteCheckin'] = null
  if (latestCheckin) {
    const prevCheckin = checkIns[1]
    const verandering = (latestCheckin.weight && prevCheckin?.weight)
      ? Number((latestCheckin.weight - prevCheckin.weight).toFixed(1))
      : 0
    laatsteCheckinData = {
      datum: new Date(latestCheckin.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }),
      gewicht: latestCheckin.weight ? Number(latestCheckin.weight) : null,
      verandering,
      energie: latestCheckin.energy_level || 0,
      slaap: latestCheckin.sleep_quality || 0,
      opmerkingen: latestCheckin.notes || 'Geen opmerkingen',
    }
  }

  // Komende sessies
  const komendeSessies = (sessionsRes.data || []).map(s => ({
    datum: new Date(s.start_time).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
    tijd: new Date(s.start_time).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
    type: s.type || 'Sessie',
    status: s.status || 'gepland',
  }))

  // Recente coach feedback (from check-ins with coach_feedback)
  const recenteFeedback = checkIns
    .filter(ci => ci.coach_feedback)
    .slice(0, 3)
    .map(ci => ({
      datum: new Date(ci.coach_feedback_at || ci.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      tekst: ci.coach_feedback!,
      categorie: 'check-in',
    }))

  return {
    success: true,
    data: {
      programmaWeek: Math.min(programmaWeek, programmaTotaalWeken),
      programmaTotaalWeken,
      complianceTraining,
      complianceVoeding,
      gewichtsTrend,
      energieNiveau,
      slaapKwaliteit,
      moodScore,
      programmaNaam,
      programmaBeschrijving,
      trainingsDagen,
      voltooidDezeWeek,
      macros,
      gewichtsData,
      laatsteCheckin: laatsteCheckinData,
      komendeSessies,
      recenteFeedback,
    }
  }
}

// =============================================================================
// INTAKE FORM
// =============================================================================

export interface IntakeFormData {
  id: string
  user_id: string
  // Original
  goals: string | null
  fitness_experience: string | null
  training_history: string | null
  injuries: string | null
  medical_conditions: string | null
  medications: string | null
  dietary_restrictions: string | null
  allergies: string | null
  sleep_hours: number | null
  stress_level: number | null
  occupation: string | null
  available_days: string[]
  preferred_training_time: string | null
  equipment_access: string | null
  additional_notes: string | null
  // Lichaamsmaten
  body_fat_percentage: number | null
  waist_cm: number | null
  hip_cm: number | null
  neck_cm: number | null
  shoulder_cm: number | null
  chest_cm: number | null
  left_arm_cm: number | null
  right_arm_cm: number | null
  left_forearm_cm: number | null
  right_forearm_cm: number | null
  abdomen_cm: number | null
  left_thigh_cm: number | null
  right_thigh_cm: number | null
  left_calf_cm: number | null
  right_calf_cm: number | null
  // Doelen uitgebreid
  short_term_goals: string | null
  long_term_goals: string | null
  goal_priority: string | null
  // Training details
  training_years: number | null
  current_training_frequency: number | null
  training_style: string | null
  training_split_preference: string | null
  session_duration_minutes: number | null
  bench_press_1rm: number | null
  squat_1rm: number | null
  deadlift_1rm: number | null
  ohp_1rm: number | null
  favorite_exercises: string | null
  avoided_exercises: string | null
  // Voeding details
  current_calorie_intake: number | null
  current_protein_intake: number | null
  meal_frequency: number | null
  cooking_skills: string | null
  food_budget: string | null
  water_intake_liters: number | null
  alcohol_frequency: string | null
  caffeine_intake: string | null
  current_supplements: string | null
  dieting_history: string | null
  previous_diets: string | null
  // Leefstijl uitgebreid
  daily_steps: number | null
  commute_type: string | null
  // Gezondheid uitgebreid
  hormonal_issues: string | null
  digestive_issues: string | null
  previous_surgeries: string | null
  energy_levels: string | null
  // Vrouwengezondheid
  menstrual_cycle_regular: boolean | null
  menstrual_cycle_notes: string | null
  contraceptive_use: string | null
  // Bloedwaarden
  blood_work_date: string | null
  blood_work_data: Record<string, { value: number; unit: string; reference: string }> | null
  // Motivatie & coaching
  motivation: string | null
  previous_coaching_experience: string | null
  biggest_challenges: string | null
  communication_preference: string | null
  accountability_preference: string | null
  // Meta
  completed_at: string | null
  created_at: string
  updated_at: string
}

export async function getClientIntake(clientId: string): Promise<{
  success: boolean
  intake?: IntakeFormData | null
  profile?: any
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  // Verify coach→client relationship
  const { data: rel } = await supabase
    .from("coaching_relationships")
    .select("status")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .single()

  if (!rel) return { success: false, error: 'Geen toegang tot deze client' }

  // Parallel: intake + profile
  const [intakeRes, profileRes] = await Promise.all([
    supabase
      .from("intake_forms")
      .select("*")
      .eq("user_id", clientId)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("first_name, last_name, gender, date_of_birth, height_cm, current_weight_kg, goal_weight_kg, activity_level")
      .eq("user_id", clientId)
      .single(),
  ])

  if (intakeRes.error) return { success: false, error: intakeRes.error.message }

  return {
    success: true,
    intake: intakeRes.data as IntakeFormData | null,
    profile: profileRes.data,
  }
}

export async function updateClientIntake(
  clientId: string,
  data: Partial<Omit<IntakeFormData, "id" | "user_id" | "created_at" | "updated_at">>
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  // Verify coach→client relationship
  const { data: rel } = await supabase
    .from("coaching_relationships")
    .select("status")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .single()

  if (!rel) return { success: false, error: 'Geen toegang tot deze client' }

  // Check if intake exists
  const { data: existing } = await supabase
    .from("intake_forms")
    .select("id")
    .eq("user_id", clientId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from("intake_forms")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("user_id", clientId)
    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from("intake_forms")
      .insert({
        user_id: clientId,
        ...data,
        completed_at: new Date().toISOString(),
      })
    if (error) return { success: false, error: error.message }
  }

  return { success: true }
}

export async function forceReIntake(clientId: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  // Verify coach→client relationship
  const { data: rel } = await supabase
    .from("coaching_relationships")
    .select("status")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .single()

  if (!rel) return { success: false, error: 'Geen toegang tot deze client' }

  // Delete existing intake form
  await supabase
    .from("intake_forms")
    .delete()
    .eq("user_id", clientId)

  // Set intake_required flag on profile
  const { error } = await supabase
    .from("profiles")
    .update({ intake_required: true })
    .eq("user_id", clientId)

  if (error) return { success: false, error: error.message }

  return { success: true }
}

// ─── Intake Documents ──────────────────────────────────────────

export interface IntakeDocumentData {
  id: string
  user_id: string
  document_type: string
  file_name: string
  file_extension: string
  file_size_bytes: number
  content_type: string
  storage_path: string
  rag_collection: string | null
  rag_document_id: string | null
  rag_status: string
  created_at: string
}

export async function getClientIntakeDocuments(clientId: string): Promise<{
  success: boolean
  documents?: IntakeDocumentData[]
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  const { data, error } = await supabase
    .from("intake_documents")
    .select("*")
    .eq("user_id", clientId)
    .order("created_at", { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, documents: data || [] }
}

export async function getIntakeDocumentSignedUrl(clientId: string, storagePath: string): Promise<{
  success: boolean
  signedUrl?: string
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  const { data, error } = await supabase.storage
    .from('intake-documents')
    .createSignedUrl(storagePath, 3600) // 1 hour

  if (error) return { success: false, error: error.message }
  return { success: true, signedUrl: data.signedUrl }
}

const RAG_BASE_URL = process.env.RAG_API_URL || 'https://rag.evotiondata.com'
const RAG_TOKEN = process.env.RAG_AUTH_TOKEN || 'EvoRag2024SecureToken!'

export async function ingestIntakeDocument(documentId: string, clientId: string): Promise<{
  success: boolean
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  // 1. Get document metadata
  const { data: doc, error: docError } = await supabase
    .from("intake_documents")
    .select("*")
    .eq("id", documentId)
    .single()

  if (docError || !doc) return { success: false, error: 'Document niet gevonden' }
  if (doc.rag_status === 'completed') return { success: true } // Already ingested

  // 2. Update status to processing
  await supabase
    .from("intake_documents")
    .update({ rag_status: 'processing', updated_at: new Date().toISOString() })
    .eq("id", documentId)

  try {
    // 3. Get signed URL for the file
    const { data: urlData, error: urlError } = await supabase.storage
      .from('intake-documents')
      .createSignedUrl(doc.storage_path, 600) // 10 min

    if (urlError || !urlData?.signedUrl) {
      throw new Error('Kon bestand niet ophalen uit opslag')
    }

    // 4. Download the file
    const fileResponse = await fetch(urlData.signedUrl)
    if (!fileResponse.ok) throw new Error('Download mislukt')
    const fileBlob = await fileResponse.blob()

    // 5. Upload to RAG system
    const collection = `intake-${clientId}`
    const formData = new FormData()
    formData.append('file', fileBlob, doc.file_name)
    formData.append('collection', collection)
    formData.append('metadata', JSON.stringify({
      client_id: clientId,
      document_type: doc.document_type,
      source: 'intake_upload',
    }))

    const ragResponse = await fetch(`${RAG_BASE_URL}/api/v1/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RAG_TOKEN}`,
      },
      body: formData,
    })

    if (!ragResponse.ok) {
      const errBody = await ragResponse.text()
      throw new Error(`RAG upload mislukt: ${errBody}`)
    }

    const ragResult = await ragResponse.json()

    // 6. Update metadata with RAG info
    await supabase
      .from("intake_documents")
      .update({
        rag_collection: collection,
        rag_document_id: ragResult.document_id || ragResult.job_id || null,
        rag_status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    return { success: true }
  } catch (err: any) {
    // Mark as failed
    await supabase
      .from("intake_documents")
      .update({ rag_status: 'failed', updated_at: new Date().toISOString() })
      .eq("id", documentId)

    return { success: false, error: err.message }
  }
}

// ============================================================================
// CHECK-IN DATA — Raw check-in data for client detail tabs
// ============================================================================

export interface WeeklyCheckIn {
  id: string
  user_id: string
  created_at: string
  week_number: number
  year: number
  feeling: number | null
  weight: number | null
  energy_level: number | null
  sleep_quality: number | null
  stress_level: number | null
  motivation: number | null
  has_pain: boolean
  pain_location: string | null
  pain_severity: number | null
  notes: string | null
  coach_feedback: string | null
  coach_feedback_at: string | null
}

export interface DailyCheckIn {
  id: string
  user_id: string
  check_in_date: string
  created_at: string
  weight: number | null
  mood: number | null
  sleep_quality: number | null
  notes: string | null
  coach_feedback: string | null
  coach_feedback_at: string | null
}

export async function getClientWeeklyCheckIns(clientId: string): Promise<{ success: boolean; checkIns?: WeeklyCheckIn[]; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  const { data, error } = await supabase
    .from("check_ins")
    .select("id, user_id, created_at, week_number, year, feeling, weight, energy_level, sleep_quality, stress_level, motivation, has_pain, pain_location, pain_severity, notes, coach_feedback, coach_feedback_at")
    .eq("user_id", clientId)
    .order("created_at", { ascending: false })
    .limit(24)

  if (error) return { success: false, error: error.message }
  return { success: true, checkIns: data || [] }
}

export async function getClientDailyCheckIns(clientId: string): Promise<{ success: boolean; checkIns?: DailyCheckIn[]; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  const { data, error } = await supabase
    .from("daily_check_ins")
    .select("id, user_id, check_in_date, created_at, weight, mood, sleep_quality, notes, coach_feedback, coach_feedback_at")
    .eq("user_id", clientId)
    .order("check_in_date", { ascending: false })
    .limit(30)

  if (error) return { success: false, error: error.message }
  return { success: true, checkIns: data || [] }
}

export async function submitCheckInFeedback(checkInId: string, type: "weekly" | "daily", feedback: string): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()
  const table = type === "weekly" ? "check_ins" : "daily_check_ins"

  const { error } = await supabase
    .from(table)
    .update({
      coach_feedback: feedback,
      coach_feedback_at: new Date().toISOString(),
    })
    .eq("id", checkInId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ============================================================================
// WEEK SUMMARY — Aggregated weekly data for expandable check-in cards
// ============================================================================

export interface WeekSummary {
  workouts: {
    scheduled: number
    completed: number
    details: { name: string; date: string; completed: boolean }[]
  }
  nutrition: {
    daysLogged: number
    dailyAvg: { calories: number; protein: number; carbs: number; fat: number }
    target: { calories: number; protein: number; carbs: number; fat: number } | null
  }
  dailyCheckIns: {
    date: string
    weight: number | null
    mood: number | null
    sleepQuality: number | null
  }[]
  aiSummary: string | null
}

/**
 * ISO week number → date range (Monday–Sunday)
 */
function getWeekDateRange(weekNumber: number, year: number): { start: string; end: string } {
  // ISO 8601: Week 1 contains Jan 4 (or the first Thursday)
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7 // Make Sunday = 7
  const monday = new Date(jan4)
  monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1 + (weekNumber - 1) * 7)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)

  const fmt = (d: Date) => d.toISOString().split("T")[0]
  return { start: fmt(monday), end: fmt(sunday) }
}

export { getWeekDateRange }

export async function getWeekSummary(
  clientId: string,
  weekNumber: number,
  year: number,
): Promise<{ success: boolean; summary?: WeekSummary; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Niet ingelogd" }

  const supabase = await getSupabaseAdmin()
  const { start: weekStart, end: weekEnd } = getWeekDateRange(weekNumber, year)

  const [workoutsRes, foodLogsRes, dailyRes, targetsRes, aiSummaryRes] = await Promise.all([
    // Workouts with template name
    supabase
      .from("client_workouts")
      .select("id, scheduled_date, completed, workout_template_id, workout_templates(name)")
      .eq("client_id", clientId)
      .gte("scheduled_date", weekStart)
      .lte("scheduled_date", weekEnd + "T23:59:59")
      .order("scheduled_date", { ascending: true }),
    // Food logs
    supabase
      .from("food_logs")
      .select("date, calories, protein_grams, carbs_grams, fat_grams")
      .eq("user_id", clientId)
      .gte("date", weekStart)
      .lte("date", weekEnd),
    // Daily check-ins
    supabase
      .from("daily_check_ins")
      .select("check_in_date, weight, mood, sleep_quality")
      .eq("user_id", clientId)
      .gte("check_in_date", weekStart)
      .lte("check_in_date", weekEnd)
      .order("check_in_date", { ascending: true }),
    // Nutrition targets (latest for client)
    supabase
      .from("nutrition_targets")
      .select("daily_calories, daily_protein_grams, daily_carbs_grams, daily_fat_grams")
      .eq("user_id", clientId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    // Cached AI summary
    supabase
      .from("weekly_ai_summaries")
      .select("summary")
      .eq("client_id", clientId)
      .eq("week_number", weekNumber)
      .eq("year", year)
      .maybeSingle(),
  ])

  // --- Workouts ---
  const workouts = workoutsRes.data || []
  const workoutDetails = workouts.map((w: any) => ({
    name: w.workout_templates?.name || "Workout",
    date: typeof w.scheduled_date === "string"
      ? w.scheduled_date.split("T")[0]
      : new Date(w.scheduled_date).toISOString().split("T")[0],
    completed: !!w.completed,
  }))

  // --- Nutrition ---
  const foodLogs = foodLogsRes.data || []
  const dayTotals = new Map<string, { calories: number; protein: number; carbs: number; fat: number }>()
  for (const log of foodLogs) {
    const day = log.date
    if (!dayTotals.has(day)) dayTotals.set(day, { calories: 0, protein: 0, carbs: 0, fat: 0 })
    const t = dayTotals.get(day)!
    t.calories += log.calories || 0
    t.protein += log.protein_grams || 0
    t.carbs += log.carbs_grams || 0
    t.fat += log.fat_grams || 0
  }
  const daysLogged = dayTotals.size
  const totals = Array.from(dayTotals.values())
  const dailyAvg = daysLogged > 0
    ? {
        calories: Math.round(totals.reduce((a, b) => a + b.calories, 0) / daysLogged),
        protein: Math.round(totals.reduce((a, b) => a + b.protein, 0) / daysLogged),
        carbs: Math.round(totals.reduce((a, b) => a + b.carbs, 0) / daysLogged),
        fat: Math.round(totals.reduce((a, b) => a + b.fat, 0) / daysLogged),
      }
    : { calories: 0, protein: 0, carbs: 0, fat: 0 }

  const targetData = targetsRes.data
  const target = targetData
    ? {
        calories: targetData.daily_calories || 0,
        protein: targetData.daily_protein_grams || 0,
        carbs: targetData.daily_carbs_grams || 0,
        fat: targetData.daily_fat_grams || 0,
      }
    : null

  // --- Daily check-ins ---
  const dailyCheckIns = (dailyRes.data || []).map((d: any) => ({
    date: d.check_in_date,
    weight: d.weight ? Number(d.weight) : null,
    mood: d.mood,
    sleepQuality: d.sleep_quality,
  }))

  return {
    success: true,
    summary: {
      workouts: {
        scheduled: workouts.length,
        completed: workouts.filter((w: any) => w.completed).length,
        details: workoutDetails,
      },
      nutrition: { daysLogged, dailyAvg, target },
      dailyCheckIns,
      aiSummary: aiSummaryRes.data?.summary || null,
    },
  }
}
