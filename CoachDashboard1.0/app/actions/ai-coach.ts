"use server"

import dns from "node:dns"
dns.setDefaultResultOrder("ipv4first")

import { getCurrentUser, getSupabaseAdmin } from '@/lib/auth-helpers'

// ─── Groq LLM ───────────────────────────────────────────────────────────────

const GROQ_MODEL = "llama-3.3-70b-versatile"

async function callGroq(systemPrompt: string, userMessage: string, maxTokens = 4000) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error("GROQ_API_KEY not configured")

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: maxTokens,
      temperature: 0.3,
    }),
    signal: AbortSignal.timeout(60000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${res.status} - ${err}`)
  }

  const data = await res.json()
  return {
    content: data.choices?.[0]?.message?.content || "",
    tokensUsed: data.usage?.total_tokens || 0,
  }
}

// ─── RAG Knowledge Base ─────────────────────────────────────────────────────

async function fetchRagContext(question: string): Promise<string> {
  const token = process.env.RAG_AUTH_TOKEN
  if (!token) return ""

  try {
    const res = await fetch("https://rag.evotiondata.com/api/v1/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        question,
        top_k: 8,
        include_sources: false,
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!res.ok) return ""
    const data = await res.json()
    return data.answer || ""
  } catch {
    return ""
  }
}

// ─── Client Context Builder ─────────────────────────────────────────────────

async function buildClientContext(clientId: string) {
  const supabase = await getSupabaseAdmin()

  const [profileRes, checkInsRes, dailyRes, programRes, aiSettingsRes, goalsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", clientId).maybeSingle(),
    supabase.from("check_ins").select("*").eq("user_id", clientId).order("created_at", { ascending: false }).limit(8),
    supabase.from("daily_check_ins").select("*").eq("user_id", clientId).order("check_in_date", { ascending: false }).limit(14),
    supabase.from("client_programs").select("*, training_programs(name, description)").eq("client_id", clientId).eq("status", "ACTIVE").maybeSingle(),
    supabase.from("client_ai_settings").select("*").eq("client_id", clientId).maybeSingle(),
    supabase.from("client_goals").select("*").eq("client_id", clientId).eq("is_active", true),
  ])

  const profile = profileRes.data
  const checkIns = checkInsRes.data || []
  const dailyCheckIns = dailyRes.data || []
  const program = programRes.data
  const aiSettings = aiSettingsRes.data
  const goals = goalsRes.data || []

  // Weight trend
  let weightTrend = "onbekend"
  if (dailyCheckIns.length >= 2) {
    const latest = dailyCheckIns[0]?.weight
    const oldest = dailyCheckIns[Math.min(6, dailyCheckIns.length - 1)]?.weight
    if (latest && oldest) {
      const diff = latest - oldest
      weightTrend = diff > 0.3 ? `stijgend (+${diff.toFixed(1)} kg)` : diff < -0.3 ? `dalend (${diff.toFixed(1)} kg)` : "stabiel"
    }
  }

  // Format context as readable text
  const lines: string[] = []
  lines.push(`=== CLIËNT: ${profile?.first_name || "Onbekend"} ${profile?.last_name || ""} ===`)

  if (profile) {
    lines.push(`Geslacht: ${profile.gender || "onbekend"}`)
    lines.push(`Lengte: ${profile.height_cm || "?"}cm, Huidig gewicht: ${profile.current_weight_kg || "?"}kg, Doelgewicht: ${profile.goal_weight_kg || "?"}kg`)
    lines.push(`Activiteitsniveau: ${profile.activity_level || "onbekend"}`)
  }

  lines.push(`\nGewichtstrend (afgelopen 2 weken): ${weightTrend}`)

  if (program) {
    const pName = (program as any).training_programs?.name || "Onbekend"
    lines.push(`\nActief programma: ${pName}`)
    lines.push(`Status: ${program.status}, Blok: ${(program.current_block_index || 0) + 1}`)
  }

  if (goals.length > 0) {
    lines.push(`\nDoelen:`)
    goals.forEach((g: any) => lines.push(`- ${g.title || g.description}`))
  }

  if (checkIns.length > 0) {
    lines.push(`\nLaatste wekelijkse check-ins:`)
    checkIns.slice(0, 4).forEach((ci: any) => {
      lines.push(`- Wk ${ci.week_number}: Gevoel ${ci.feeling}/5, Training ${ci.training_adherence}/5, Voeding ${ci.nutrition_adherence}/5, Gewicht ${ci.weight || "?"}kg`)
      if (ci.notes) lines.push(`  Notitie: ${ci.notes}`)
    })
  }

  if (dailyCheckIns.length > 0) {
    lines.push(`\nLaatste dagelijkse check-ins:`)
    dailyCheckIns.slice(0, 7).forEach((ci: any) => {
      lines.push(`- ${ci.check_in_date}: Gewicht ${ci.weight || "?"}kg, Mood ${ci.mood}/5, Slaap ${ci.sleep_quality}/5`)
    })
  }

  // AI automation settings
  if (aiSettings) {
    lines.push(`\n=== AI INSTELLINGEN VOOR DEZE CLIËNT ===`)
    lines.push(`Voeding: ${formatLevel(aiSettings.voeding)}`)
    lines.push(`Training: ${formatLevel(aiSettings.training)}`)
    lines.push(`Rustdagen: ${formatLevel(aiSettings.rustdagen)}`)
    lines.push(`Supplementen: ${formatLevel(aiSettings.supplementen)}`)
    lines.push(`Programma: ${formatLevel(aiSettings.programma)}`)
    lines.push(``)
    lines.push(`BELANGRIJK: Respecteer deze niveaus:`)
    lines.push(`- "AI stuurt": Je mag autonome voorstellen doen en concrete aanpassingen formuleren.`)
    lines.push(`- "Voorstellen": Je mag analyseren en voorstellen doen, maar de coach beslist.`)
    lines.push(`- "Handmatig": Geef ALLEEN informatie als de coach er specifiek om vraagt. Doe geen ongevraagde suggesties voor dit domein.`)
  }

  return lines.join("\n")
}

function formatLevel(level: string) {
  switch (level) {
    case "ai_stuurt": return "AI stuurt (autonoom)"
    case "voorstellen": return "Voorstellen (coach beslist)"
    case "handmatig": return "Handmatig (alleen op verzoek)"
    default: return level
  }
}

// ─── All Clients Summary ────────────────────────────────────────────────────

async function buildAllClientsContext(coachId: string) {
  const supabase = await getSupabaseAdmin()

  const { data: relationships } = await supabase
    .from("coaching_relationships")
    .select("client_id, status")
    .eq("coach_id", coachId)

  const clientIds = relationships?.map(r => r.client_id) || []
  if (clientIds.length === 0) return "Je hebt momenteel geen actieve cliënten."

  const [profilesRes, dailyRes, checkInsRes, aiSettingsRes] = await Promise.all([
    supabase.from("profiles").select("user_id, first_name, last_name, current_weight_kg, goal_weight_kg").in("user_id", clientIds),
    supabase.from("daily_check_ins").select("user_id, check_in_date, weight, mood").in("user_id", clientIds).order("check_in_date", { ascending: false }).limit(50),
    supabase.from("check_ins").select("user_id, week_number, training_adherence, nutrition_adherence, feeling").in("user_id", clientIds).order("created_at", { ascending: false }).limit(20),
    supabase.from("client_ai_settings").select("*").in("client_id", clientIds),
  ])

  const profiles = profilesRes.data || []
  const dailyByUser = new Map<string, any[]>()
  for (const ci of dailyRes.data || []) {
    if (!dailyByUser.has(ci.user_id)) dailyByUser.set(ci.user_id, [])
    dailyByUser.get(ci.user_id)!.push(ci)
  }

  const checkInsByUser = new Map<string, any[]>()
  for (const ci of checkInsRes.data || []) {
    if (!checkInsByUser.has(ci.user_id)) checkInsByUser.set(ci.user_id, [])
    checkInsByUser.get(ci.user_id)!.push(ci)
  }

  const aiSettingsMap = new Map(
    (aiSettingsRes.data || []).map((s: any) => [s.client_id, s])
  )

  const lines: string[] = [`=== OVERZICHT: ${profiles.length} CLIËNTEN ===\n`]

  for (const p of profiles) {
    const rel = relationships?.find(r => r.client_id === p.user_id)
    const daily = dailyByUser.get(p.user_id) || []
    const weekly = checkInsByUser.get(p.user_id) || []
    const settings = aiSettingsMap.get(p.user_id)

    lines.push(`--- ${p.first_name} ${p.last_name} (${rel?.status || "?"}) ---`)
    lines.push(`Gewicht: ${p.current_weight_kg || "?"}kg → Doel: ${p.goal_weight_kg || "?"}kg`)

    if (daily.length > 0) {
      lines.push(`Laatste check-in: ${daily[0].check_in_date}, Gewicht: ${daily[0].weight}kg, Mood: ${daily[0].mood}/5`)
    }
    if (weekly.length > 0) {
      lines.push(`Laatste wekelijks: Training ${weekly[0].training_adherence}/5, Voeding ${weekly[0].nutrition_adherence}/5`)
    }
    if (settings) {
      lines.push(`AI: Voeding=${settings.voeding}, Training=${settings.training}, Rust=${settings.rustdagen}, Suppl=${settings.supplementen}, Prog=${settings.programma}`)
    }
    lines.push("")
  }

  return lines.join("\n")
}

// ─── Main Chat Action ───────────────────────────────────────────────────────

export interface AiChatMessage {
  role: "user" | "assistant"
  content: string
}

export async function sendAiCoachMessage(
  messages: AiChatMessage[],
  selectedClientId?: string,
): Promise<{ success: boolean; reply?: string; error?: string; tokensUsed?: number }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Niet ingelogd" }

  try {
    // Build context based on whether a specific client is selected
    let clientContext: string
    if (selectedClientId) {
      clientContext = await buildClientContext(selectedClientId)
    } else {
      clientContext = await buildAllClientsContext(user.id)
    }

    // Get the latest user message for RAG query
    const latestMessage = messages[messages.length - 1]?.content || ""
    const ragContext = await fetchRagContext(latestMessage)

    const systemPrompt = `Je bent de AI coaching assistent van Evotion. Je helpt coach ${user.firstName} ${user.lastName} met het begeleiden van cliënten.

KENMERKEN:
- Je spreekt Nederlands
- Je bent professioneel maar toegankelijk
- Je baseert je antwoorden ALLEEN op beschikbare data
- Je geeft geen medisch advies
- Je respecteert de AI-instellingen per cliënt per domein (ai_stuurt/voorstellen/handmatig)
- Bij "handmatig" domeinen: alleen antwoorden als de coach er specifiek naar vraagt
- Bij "voorstellen" domeinen: je mag analyseren en suggesties doen
- Bij "ai_stuurt" domeinen: je mag concrete aanpassingen formuleren

CLIËNT DATA:
${clientContext}

${ragContext ? `KENNISBANK (RAG):
${ragContext}
` : ""}
REGELS:
1. Als je niet genoeg data hebt, zeg dat eerlijk
2. Verwijs naar specifieke datapunten als je een conclusie trekt
3. Houd antwoorden beknopt en actionable
4. Als de coach om een aanpassing vraagt, check of het AI-niveau dat toestaat
5. Geef suggesties in de vorm van concrete stappen`

    // Build conversation for Groq (include last 10 messages for context)
    const conversationMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.slice(-10).map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ]

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: conversationMessages,
        max_tokens: 2000,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(60000),
    })

    if (!res.ok) {
      const err = await res.text()
      return { success: false, error: `AI fout: ${res.status}` }
    }

    const data = await res.json()
    const reply = data.choices?.[0]?.message?.content || "Geen antwoord ontvangen."

    return {
      success: true,
      reply,
      tokensUsed: data.usage?.total_tokens || 0,
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Onbekende fout" }
  }
}

// ─── Get Client AI Settings ─────────────────────────────────────────────────

export async function getClientAiSettings(clientId: string) {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await getSupabaseAdmin()
  const { data } = await supabase
    .from("client_ai_settings")
    .select("*")
    .eq("client_id", clientId)
    .eq("coach_id", user.id)
    .maybeSingle()

  return data
}

export async function updateClientAiSettings(
  clientId: string,
  domain: string,
  level: string,
) {
  const user = await getCurrentUser()
  if (!user) return { success: false }

  const supabase = await getSupabaseAdmin()

  const validDomains = ["voeding", "training", "rustdagen", "supplementen", "programma"]
  const validLevels = ["ai_stuurt", "voorstellen", "handmatig"]
  if (!validDomains.includes(domain) || !validLevels.includes(level)) {
    return { success: false, error: "Ongeldig domein of niveau" }
  }

  const { error } = await supabase
    .from("client_ai_settings")
    .upsert(
      { client_id: clientId, coach_id: user.id, [domain]: level, updated_at: new Date().toISOString() },
      { onConflict: "client_id,coach_id" },
    )

  return { success: !error, error: error?.message }
}

// ─── Chat Persistence ───────────────────────────────────────────────────────

export interface AiChat {
  id: string
  clientId: string | null
  title: string | null
  updatedAt: string
  messageCount?: number
}

export async function getAiChats(clientId?: string): Promise<AiChat[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  let query = supabase
    .from("coach_ai_chats")
    .select("id, client_id, title, updated_at")
    .eq("coach_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(20)

  if (clientId) {
    query = query.eq("client_id", clientId)
  }

  const { data } = await query
  return (data || []).map(c => ({
    id: c.id,
    clientId: c.client_id,
    title: c.title,
    updatedAt: c.updated_at,
  }))
}

export async function getAiChatMessages(chatId: string): Promise<AiChatMessage[]> {
  const user = await getCurrentUser()
  if (!user) return []

  const supabase = await getSupabaseAdmin()

  // Verify chat belongs to coach
  const { data: chat } = await supabase
    .from("coach_ai_chats")
    .select("id")
    .eq("id", chatId)
    .eq("coach_id", user.id)
    .maybeSingle()

  if (!chat) return []

  const { data: messages } = await supabase
    .from("coach_ai_messages")
    .select("role, content, created_at")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true })

  return (messages || []).map(m => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }))
}

export async function sendAiCoachMessagePersistent(
  chatId: string | null,
  userMessage: string,
  selectedClientId?: string,
): Promise<{ success: boolean; reply?: string; chatId?: string; error?: string; tokensUsed?: number }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Niet ingelogd" }

  const supabase = await getSupabaseAdmin()

  try {
    // Create new chat if needed
    let activeChatId = chatId
    if (!activeChatId) {
      const title = userMessage.length > 60 ? userMessage.slice(0, 57) + "..." : userMessage
      const { data: newChat, error } = await supabase
        .from("coach_ai_chats")
        .insert({
          coach_id: user.id,
          client_id: selectedClientId || null,
          title,
        })
        .select("id")
        .single()

      if (error || !newChat) return { success: false, error: "Kon chat niet aanmaken" }
      activeChatId = newChat.id
    }

    // Save user message
    await supabase.from("coach_ai_messages").insert({
      chat_id: activeChatId,
      role: "user",
      content: userMessage,
    })

    // Load full conversation history for context
    const { data: history } = await supabase
      .from("coach_ai_messages")
      .select("role, content")
      .eq("chat_id", activeChatId)
      .order("created_at", { ascending: true })

    const messages: AiChatMessage[] = (history || []).map(m => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

    // Call AI with full history
    const result = await sendAiCoachMessage(messages, selectedClientId)

    if (result.success && result.reply) {
      // Save assistant reply
      await supabase.from("coach_ai_messages").insert({
        chat_id: activeChatId,
        role: "assistant",
        content: result.reply,
        tokens_used: result.tokensUsed || 0,
      })

      // Update chat timestamp
      await supabase.from("coach_ai_chats")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", activeChatId)
    }

    return {
      success: result.success,
      reply: result.reply,
      chatId: activeChatId,
      error: result.error,
      tokensUsed: result.tokensUsed,
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Onbekende fout" }
  }
}

// ─── AI Dashboard Insights ──────────────────────────────────────────────────

export interface AiInsight {
  emoji: string
  title: string
  body: string
  type: "positive" | "warning" | "info"
}

export async function getAiDashboardInsights(): Promise<{ insights: AiInsight[]; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { insights: [], error: "Niet ingelogd" }

  try {
    const context = await buildAllClientsContext(user.id)

    const result = await callGroq(
      `Je bent de AI assistent van Evotion coaching platform. Genereer exact 3 korte, concrete inzichten voor de coach op basis van de cliëntdata.

Antwoord ALLEEN met een JSON array van exact 3 objecten:
[
  { "emoji": "...", "title": "kort (max 6 woorden)", "body": "1-2 zinnen actie-gericht", "type": "positive|warning|info" }
]

Types:
- "positive": goed nieuws, successen, complimenten
- "warning": aandachtspunten, risico's, actie vereist
- "info": neutrale observaties, trends

Gebruik relevante emoji's. Schrijf in het Nederlands. Wees specifiek met namen en cijfers uit de data. Geef geen generieke tips.`,
      `Hier is de data van mijn cliënten:\n\n${context}\n\nGenereer 3 inzichten.`,
      800,
    )

    // Parse JSON from response
    const jsonMatch = result.content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) return { insights: [] }

    const parsed = JSON.parse(jsonMatch[0]) as AiInsight[]
    return { insights: parsed.slice(0, 3) }
  } catch (err: any) {
    return { insights: [], error: err.message }
  }
}

export async function deleteAiChat(chatId: string) {
  const user = await getCurrentUser()
  if (!user) return { success: false }

  const supabase = await getSupabaseAdmin()
  const { error } = await supabase
    .from("coach_ai_chats")
    .delete()
    .eq("id", chatId)
    .eq("coach_id", user.id)

  return { success: !error }
}

// ─── Weekly AI Summary ───────────────────────────────────────────────────────

import type { WeekSummary, WeeklyCheckIn } from './clients'

const MOOD_LABELS: Record<number, string> = { 1: "Slecht", 2: "Matig", 3: "Oké", 4: "Goed", 5: "Top" }
const SLEEP_LABELS: Record<number, string> = { 1: "Slecht", 2: "Matig", 3: "Oké", 4: "Goed", 5: "Diep" }

export async function generateWeeklyAiSummary(
  clientId: string,
  weekNumber: number,
  year: number,
  weekData: WeekSummary,
  checkInData: WeeklyCheckIn,
): Promise<{ success: boolean; summary?: string; error?: string }> {
  const user = await getCurrentUser()
  if (!user) return { success: false, error: "Niet ingelogd" }

  const supabase = await getSupabaseAdmin()

  // Get client profile for context
  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name, last_name, current_weight_kg, goal_weight_kg")
    .eq("user_id", clientId)
    .single()

  const clientName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Client"

  // Build data context for the prompt
  const lines: string[] = []
  lines.push(`=== WEEKRAPPORT DATA: ${clientName} — Week ${weekNumber}, ${year} ===\n`)

  // Weekly check-in scores
  lines.push("WEKELIJKSE CHECK-IN:")
  if (checkInData.feeling) lines.push(`- Algemeen gevoel: ${checkInData.feeling}/5`)
  if (checkInData.weight) lines.push(`- Gewicht: ${checkInData.weight} kg (doel: ${profile?.goal_weight_kg || "?"} kg)`)
  if (checkInData.energy_level) lines.push(`- Energieniveau: ${checkInData.energy_level}/5`)
  if (checkInData.sleep_quality) lines.push(`- Slaapkwaliteit: ${checkInData.sleep_quality}/5`)
  if (checkInData.stress_level) lines.push(`- Stressniveau: ${checkInData.stress_level}/5`)
  if (checkInData.motivation) lines.push(`- Motivatie: ${checkInData.motivation}/5`)
  if (checkInData.has_pain) {
    lines.push(`- PIJN: Ja — ${checkInData.pain_location || "locatie onbekend"} (ernst: ${checkInData.pain_severity || "?"}/5)`)
  }
  if (checkInData.notes) lines.push(`- Notitie client: "${checkInData.notes}"`)

  // Training
  lines.push(`\nTRAINING:`)
  lines.push(`- ${weekData.workouts.completed}/${weekData.workouts.scheduled} trainingen voltooid`)
  if (weekData.workouts.details.length > 0) {
    for (const w of weekData.workouts.details) {
      lines.push(`  • ${w.name} (${w.date}) — ${w.completed ? "Voltooid" : "Niet voltooid"}`)
    }
  } else {
    lines.push(`  (Geen trainingen ingepland deze week)`)
  }

  // Nutrition
  lines.push(`\nVOEDING:`)
  lines.push(`- ${weekData.nutrition.daysLogged}/7 dagen gelogd`)
  if (weekData.nutrition.daysLogged > 0) {
    const avg = weekData.nutrition.dailyAvg
    lines.push(`- Gemiddeld per dag: ${avg.calories} kcal, ${avg.protein}g eiwit, ${avg.carbs}g koolhydraten, ${avg.fat}g vet`)
    if (weekData.nutrition.target) {
      const t = weekData.nutrition.target
      lines.push(`- Doelen per dag: ${t.calories} kcal, ${t.protein}g eiwit, ${t.carbs}g koolhydraten, ${t.fat}g vet`)
    }
  }

  // Daily check-ins
  lines.push(`\nDAGELIJKSE CHECK-INS:`)
  if (weekData.dailyCheckIns.length > 0) {
    for (const d of weekData.dailyCheckIns) {
      const mood = d.mood ? MOOD_LABELS[d.mood] || `${d.mood}/5` : "—"
      const sleep = d.sleepQuality ? SLEEP_LABELS[d.sleepQuality] || `${d.sleepQuality}/5` : "—"
      lines.push(`  • ${d.date}: Gewicht ${d.weight || "—"} kg, Stemming ${mood}, Slaap ${sleep}`)
    }
  } else {
    lines.push(`  (Geen dagelijkse check-ins deze week)`)
  }

  const dataContext = lines.join("\n")

  try {
    const result = await callGroq(
      `Je bent een fitness coaching AI van Evotion. Genereer een beknopt maar grondig wekelijks statusrapport voor de coach.

REGELS:
- Schrijf in het Nederlands
- Wees data-gedreven: verwijs naar specifieke cijfers
- Structuur: Gebruik de volgende secties met markdown headers (##)
- Wees beknopt maar compleet (300-500 woorden)
- Geef concrete, actionable aanbevelingen
- Als er pijn is gemeld, markeer dit duidelijk als aandachtspunt
- Vergelijk intake vs doelen als voedingsdata beschikbaar is

SECTIES:
## Overzicht
Korte samenvatting van de week in 2-3 zinnen.

## Training
Compliance en opvallende punten.

## Voeding
Macro-analyse vs doelen, logging compliance.

## Welzijn
Energie, slaap, stress, stemming trends.

## Aandachtspunten
Zaken die aandacht vereisen (pijn, lage scores, afwijkingen).

## Aanbevelingen
2-3 concrete actiepunten voor de coach.`,
      dataContext,
      1500,
    )

    const summary = result.content

    // Save to database (upsert)
    const { error: saveError } = await supabase
      .from("weekly_ai_summaries")
      .upsert(
        {
          client_id: clientId,
          coach_id: user.id,
          week_number: weekNumber,
          year: year,
          summary,
          raw_data: { weekData, checkInData } as any,
          tokens_used: result.tokensUsed,
        },
        { onConflict: "client_id,week_number,year" },
      )

    if (saveError) {
      console.error("[WeeklyAI] Save error:", saveError.message)
    }

    // Ingest into RAG for client memory (fire-and-forget)
    ingestWeekReportToRag(clientId, weekNumber, year, summary, clientName).catch((err) =>
      console.error("[WeeklyAI] RAG ingest error:", err.message)
    )

    return { success: true, summary }
  } catch (err: any) {
    return { success: false, error: err.message || "AI generatie mislukt" }
  }
}

async function ingestWeekReportToRag(
  clientId: string,
  weekNumber: number,
  year: number,
  summary: string,
  clientName: string,
) {
  const token = process.env.RAG_AUTH_TOKEN
  if (!token) return

  const ragBase = process.env.RAG_API_URL || "https://rag.evotiondata.com"
  const collection = `client-${clientId}`
  const fileName = `weekrapport-week${weekNumber}-${year}.md`

  // Ensure collection exists (ignore if already exists)
  await fetch(`${ragBase}/api/v1/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name: collection, description: `Weekrapporten voor ${clientName}` }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => {})

  // Upload summary as text file
  const blob = new Blob([`# Weekrapport ${clientName} — Week ${weekNumber}, ${year}\n\n${summary}`], {
    type: "text/markdown",
  })
  const formData = new FormData()
  formData.append("file", blob, fileName)
  formData.append("collection", collection)
  formData.append("metadata", JSON.stringify({
    client_id: clientId,
    week_number: weekNumber,
    year: year,
    type: "weekly_report",
  }))

  const res = await fetch(`${ragBase}/api/v1/documents/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`RAG upload failed: ${res.status} - ${err}`)
  }
}
