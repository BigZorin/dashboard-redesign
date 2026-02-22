"use server"

import { getCurrentUser, getSupabaseAdmin } from '@/lib/auth-helpers'

// ============================================================================
// Client Detail — Header + Overview data
// Fetches real Supabase data for the client detail page
// ============================================================================

export interface ClientDetail {
  id: string
  naam: string
  initialen: string
  email: string
  status: "actief" | "risico" | "gepauzeerd"
  programma: string
  programmWeek: number
  programmaTotaalWeken: number
  lidSinds: string
  laatsteActiviteit: string
  volgendeSessie: string | null
  avatarUrl: string
  tags: string[]
}

export interface ClientHeaderStats {
  gewicht: number | null
  gewichtTrend: number | null
  complianceTraining: number
  complianceVoeding: number
  energie: number | null
  slaap: number | null
  openVoorstellen: number
}

export interface ClientOverviewStats {
  huidigeWeek: number
  totaalWeken: number
  complianceTraining: number
  complianceVoeding: number
  gewichtsTrend: number | null
  energieNiveau: number | null
  slaapKwaliteit: number | null
}

export interface GewichtsDataPunt {
  week: string
  gewicht: number
}

export interface ProgrammaDetails {
  naam: string
  beschrijving: string
  week: number
  totaalWeken: number
  trainingsDagen: number
  voltooidDezeWeek: number
}

export interface MacroTargets {
  kcal: { huidig: number; doel: number }
  eiwit: { huidig: number; doel: number }
  koolhydraten: { huidig: number; doel: number }
  vetten: { huidig: number; doel: number }
}

export interface LaatstCheckinDetails {
  datum: string
  gewicht: number | null
  verandering: number | null
  energie: number | null
  slaap: number | null
  opmerkingen: string | null
}

export interface KomendeSessie {
  datum: string
  tijd: string
  type: string
  status: string
}

export interface RecenteNotitie {
  datum: string
  tekst: string
  categorie: string
}

export async function getClientDetail(clientId: string): Promise<{
  success: boolean
  client?: ClientDetail
  headerStats?: ClientHeaderStats
  overviewStats?: ClientOverviewStats
  gewichtsData?: GewichtsDataPunt[]
  programmaDetails?: ProgrammaDetails
  macroTargets?: MacroTargets
  laatsteCheckinDetails?: LaatstCheckinDetails
  komendeSessies?: KomendeSessie[]
  recenteNotities?: RecenteNotitie[]
  error?: string
}> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: 'Niet ingelogd' }

  const supabase = await getSupabaseAdmin()

  // Verify coaching relationship
  const { data: relationship } = await supabase
    .from("coaching_relationships")
    .select("status, started_at")
    .eq("coach_id", user.id)
    .eq("client_id", clientId)
    .maybeSingle()

  if (!relationship) return { success: false, error: 'Client niet gevonden' }

  // Calculate this week's date range (Monday to Sunday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const monday = new Date(now)
  monday.setDate(now.getDate() + mondayOffset)
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)

  // Parallel fetches
  const [profileRes, authRes, programRes, weeklyRes, dailyRes, sessionsRes, nutritionRes, foodLogsRes, workoutsRes, eventsRes] = await Promise.all([
    // Profile
    supabase
      .from("profiles")
      .select("first_name, last_name, avatar_url, client_status")
      .eq("user_id", clientId)
      .maybeSingle(),
    // Auth user (for email + last sign in)
    supabase.auth.admin.getUserById(clientId),
    // Active program with block info
    supabase
      .from("client_programs")
      .select("id, status, start_date, current_block_index, training_programs(name, description, duration_weeks, program_blocks(id, order_index, block_workouts(id)))")
      .eq("client_id", clientId)
      .eq("status", "active")
      .maybeSingle(),
    // Weekly check-ins (last 12) — include notes
    supabase
      .from("check_ins")
      .select("created_at, weight, energy_level, sleep_quality, training_adherence, nutrition_adherence, notes")
      .eq("user_id", clientId)
      .order("created_at", { ascending: false })
      .limit(12),
    // Daily check-ins (last 30) — include notes
    supabase
      .from("daily_check_ins")
      .select("check_in_date, weight, mood, sleep_quality, notes")
      .eq("user_id", clientId)
      .order("check_in_date", { ascending: false })
      .limit(30),
    // Next 3 sessions
    supabase
      .from("client_sessions")
      .select("start_time, type, status")
      .eq("client_id", clientId)
      .gte("start_time", new Date().toISOString())
      .order("start_time", { ascending: true })
      .limit(3),
    // Nutrition targets
    supabase
      .from("nutrition_targets")
      .select("daily_calories, daily_protein_grams, daily_carbs_grams, daily_fat_grams")
      .eq("user_id", clientId)
      .maybeSingle(),
    // Today's food logs (summed)
    supabase
      .from("food_logs")
      .select("calories, protein_grams, carbs_grams, fat_grams")
      .eq("user_id", clientId)
      .eq("date", now.toISOString().split('T')[0]),
    // Client workouts this week (completed count)
    supabase
      .from("client_workouts")
      .select("id, completed")
      .eq("client_id", clientId)
      .gte("scheduled_date", monday.toISOString())
      .lte("scheduled_date", sunday.toISOString()),
    // Recent coaching events (as notes)
    supabase
      .from("coaching_events")
      .select("created_at, title, description, area")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  const profile = profileRes.data
  const authUser = authRes.data?.user
  const program = programRes.data
  const weeklyCheckIns = weeklyRes.data || []
  const dailyCheckIns = dailyRes.data || []

  // Build client name
  const firstName = profile?.first_name || ''
  const lastName = profile?.last_name || ''
  const naam = `${firstName} ${lastName}`.trim() || authUser?.email || 'Onbekend'
  const initialen = `${firstName[0] || '?'}${lastName[0] || '?'}`.toUpperCase()

  // Status
  let status: "actief" | "risico" | "gepauzeerd" = "actief"
  if (relationship.status === 'PAUSED') status = "gepauzeerd"

  // Check if needs attention (no check-in in 7+ days)
  const latestCheckInDate = dailyCheckIns[0]?.check_in_date || (weeklyCheckIns[0]?.created_at ? new Date(weeklyCheckIns[0].created_at).toISOString().split('T')[0] : null)
  if (latestCheckInDate) {
    const daysSince = Math.floor((Date.now() - new Date(latestCheckInDate).getTime()) / 86400000)
    if (daysSince > 7 && status === "actief") status = "risico"
  }

  // Program info
  const tp = (program as any)?.training_programs
  const programma = tp?.name || 'Geen programma'
  const programBeschrijving = tp?.description || ''
  const totaalWeken = tp?.duration_weeks || 0
  let programmWeek = 0
  if (program?.start_date) {
    programmWeek = Math.floor((Date.now() - new Date(program.start_date).getTime()) / 86400000 / 7) + 1
    if (programmWeek > totaalWeken && totaalWeken > 0) programmWeek = totaalWeken
  }

  // Training days per week (from current block's workout count)
  let trainingsDagen = 0
  const blocks = tp?.program_blocks || []
  const currentBlockIdx = program?.current_block_index || 0
  const sortedBlocks = [...blocks].sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0))
  const currentBlock = sortedBlocks[currentBlockIdx]
  if (currentBlock?.block_workouts) {
    trainingsDagen = currentBlock.block_workouts.length
  }

  // Completed workouts this week
  const weekWorkouts = workoutsRes.data || []
  const voltooidDezeWeek = weekWorkouts.filter((w: any) => w.completed).length

  // Lid sinds
  const lidSindsDate = new Date(relationship.started_at)
  const lidSinds = lidSindsDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' })

  // Last activity
  const lastSignIn = authUser?.last_sign_in_at
  let laatsteActiviteit = 'Onbekend'
  if (lastSignIn) {
    const diffMs = Date.now() - new Date(lastSignIn).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 60) laatsteActiviteit = `${diffMins} min geleden`
    else if (diffMins < 1440) laatsteActiviteit = `${Math.floor(diffMins / 60)} uur geleden`
    else laatsteActiviteit = `${Math.floor(diffMins / 1440)} dagen geleden`
  }

  // Sessions
  const sessionsData = sessionsRes.data || []
  let volgendeSessie: string | null = null
  if (sessionsData[0]) {
    const d = new Date(sessionsData[0].start_time)
    const isToday = d.toDateString() === new Date().toDateString()
    const time = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })
    volgendeSessie = isToday ? `Vandaag, ${time}` : `${d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}, ${time}`
  }

  // Format upcoming sessions for overview
  const sessionTypeLabels: Record<string, string> = {
    pt_session: 'PT Sessie',
    video_call: 'Video Call',
    check_in_gesprek: 'Check-in gesprek',
    programma_review: 'Programma Review',
  }
  const komendeSessies: KomendeSessie[] = sessionsData.map((s: any) => {
    const d = new Date(s.start_time)
    return {
      datum: d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
      tijd: d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }),
      type: sessionTypeLabels[s.type] || s.type,
      status: s.status === 'scheduled' ? 'gepland' : s.status === 'confirmed' ? 'bevestigd' : s.status,
    }
  })

  // Tags
  const tags: string[] = []
  if (program) tags.push('Online')

  // ── Stats ──

  // Weight: prefer daily, fallback to weekly
  let latestWeight: number | null = null
  let previousWeight: number | null = null
  const allWeights: { date: string; weight: number }[] = []

  for (const ci of dailyCheckIns) {
    if (ci.weight) {
      const w = Number(ci.weight)
      allWeights.push({ date: ci.check_in_date, weight: w })
      if (!latestWeight) latestWeight = w
      else if (!previousWeight) previousWeight = w
    }
  }
  for (const ci of weeklyCheckIns) {
    if (ci.weight) {
      const w = Number(ci.weight)
      const date = new Date(ci.created_at).toISOString().split('T')[0]
      allWeights.push({ date, weight: w })
      if (!latestWeight) latestWeight = w
      else if (!previousWeight) previousWeight = w
    }
  }

  const gewichtTrend = latestWeight && previousWeight ? Math.round((latestWeight - previousWeight) * 10) / 10 : null

  // Energy & Sleep from latest daily check-in (mood in daily = energy_level in weekly, 1-5 scale)
  const latestDaily = dailyCheckIns[0]
  const energie = latestDaily?.mood || weeklyCheckIns[0]?.energy_level || null
  const slaap = latestDaily?.sleep_quality || weeklyCheckIns[0]?.sleep_quality || null

  // Training/nutrition adherence from latest weekly check-in (1-5 scale → percentage * 20)
  const latestWeekly = weeklyCheckIns[0]
  const complianceTraining = (latestWeekly?.training_adherence || 0) * 20
  const complianceVoeding = (latestWeekly?.nutrition_adherence || 0) * 20

  // Weight chart data (chronological, unique by date)
  const weightMap = new Map<string, number>()
  for (const w of allWeights) {
    weightMap.set(w.date, w.weight)
  }
  const gewichtsDataSorted = Array.from(weightMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, gewicht]) => {
      const d = new Date(date)
      return {
        week: d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
        gewicht,
      }
    })

  // ── Macro targets ──
  const nt = nutritionRes.data
  const foodLogs = foodLogsRes.data || []
  const todayCals = foodLogs.reduce((sum: number, f: any) => sum + (f.calories || 0), 0)
  const todayProtein = foodLogs.reduce((sum: number, f: any) => sum + (f.protein_grams || 0), 0)
  const todayCarbs = foodLogs.reduce((sum: number, f: any) => sum + (f.carbs_grams || 0), 0)
  const todayFat = foodLogs.reduce((sum: number, f: any) => sum + (f.fat_grams || 0), 0)

  const macroTargets: MacroTargets | undefined = nt ? {
    kcal: { huidig: todayCals, doel: nt.daily_calories || 0 },
    eiwit: { huidig: todayProtein, doel: nt.daily_protein_grams || 0 },
    koolhydraten: { huidig: todayCarbs, doel: nt.daily_carbs_grams || 0 },
    vetten: { huidig: todayFat, doel: nt.daily_fat_grams || 0 },
  } : undefined

  // ── Last check-in details ──
  // Prefer the latest daily check-in, fallback to weekly
  let laatsteCheckinDetails: LaatstCheckinDetails | undefined
  const latestDailyCI = dailyCheckIns[0]
  const latestWeeklyCI = weeklyCheckIns[0]

  if (latestDailyCI) {
    const ciDate = new Date(latestDailyCI.check_in_date)
    const prevDailyWeight = dailyCheckIns[1]?.weight || null
    laatsteCheckinDetails = {
      datum: ciDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }),
      gewicht: latestDailyCI.weight ? Number(latestDailyCI.weight) : null,
      verandering: latestDailyCI.weight && prevDailyWeight ? Math.round((Number(latestDailyCI.weight) - Number(prevDailyWeight)) * 10) / 10 : null,
      energie: latestDailyCI.mood || null,
      slaap: latestDailyCI.sleep_quality || null,
      opmerkingen: latestDailyCI.notes || null,
    }
  } else if (latestWeeklyCI) {
    const ciDate = new Date(latestWeeklyCI.created_at)
    const prevWeeklyWeight = weeklyCheckIns[1]?.weight || null
    laatsteCheckinDetails = {
      datum: ciDate.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' }),
      gewicht: latestWeeklyCI.weight ? Number(latestWeeklyCI.weight) : null,
      verandering: latestWeeklyCI.weight && prevWeeklyWeight ? Math.round((Number(latestWeeklyCI.weight) - Number(prevWeeklyWeight)) * 10) / 10 : null,
      energie: latestWeeklyCI.energy_level || null,
      slaap: latestWeeklyCI.sleep_quality || null,
      opmerkingen: latestWeeklyCI.notes || null,
    }
  }

  // ── Recent notes (coaching events) ──
  const recenteNotities: RecenteNotitie[] = (eventsRes.data || []).map((e: any) => ({
    datum: new Date(e.created_at).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }),
    tekst: e.description || e.title,
    categorie: e.area || 'general',
  }))

  return {
    success: true,
    client: {
      id: clientId,
      naam,
      initialen,
      email: authUser?.email || '',
      status,
      programma,
      programmWeek,
      programmaTotaalWeken: totaalWeken,
      lidSinds,
      laatsteActiviteit,
      volgendeSessie,
      avatarUrl: profile?.avatar_url || '',
      tags,
    },
    headerStats: {
      gewicht: latestWeight,
      gewichtTrend: gewichtTrend,
      complianceTraining,
      complianceVoeding,
      energie,
      slaap,
      openVoorstellen: 0, // TODO: count from AI logs
    },
    overviewStats: {
      huidigeWeek: programmWeek,
      totaalWeken,
      complianceTraining,
      complianceVoeding,
      gewichtsTrend: gewichtTrend,
      energieNiveau: energie,
      slaapKwaliteit: slaap,
    },
    gewichtsData: gewichtsDataSorted,
    programmaDetails: program ? {
      naam: programma,
      beschrijving: programBeschrijving,
      week: programmWeek,
      totaalWeken,
      trainingsDagen,
      voltooidDezeWeek,
    } : undefined,
    macroTargets,
    laatsteCheckinDetails,
    komendeSessies,
    recenteNotities,
  }
}
