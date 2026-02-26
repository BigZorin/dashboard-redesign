"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, CalendarDays, Dumbbell, Apple, Minus, Activity, Moon, Droplets, StickyNote, Sparkles, Pill, RefreshCw, Bot, Database, ChevronDown, ChevronUp, Circle, Pause, Play, Camera, Watch, Gauge, FileText, Utensils, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

// ============================================================================
// PLACEHOLDER DATA — Overzicht van de individuele cliënt
//
// COACH-SCOPED: Deze tab toont data van 1 specifieke client.
// Server-side check: WHERE clients.id = :clientId AND clients.coach_id = auth.uid()
// GEEN financiele data (bedragen/betalingen) op deze pagina — admin-only.
//
// Vervang met echte data uit Supabase tabellen:
//   - client_programs (huidig programma + voortgang)
//   - client_nutrition (macro targets)
//   - client_checkins (laatste check-in + gewichtstrend)
//   - client_sessions (komende sessies)
//   - coach_notes (recente notities)
// ============================================================================

/** Snelle statistieken — Berekend uit meerdere tabellen */
const snelleStats = {
  huidigeWeek: 6,                         // <-- Week in programma
  complianceTraining: 92,                 // <-- % trainingen voltooid deze week
  complianceVoeding: 78,                  // <-- % dagen macro's gehaald
  gewichtsTrend: -0.4,                    // <-- kg verschil t.o.v. vorige week (negatief = afvallen)
  energieNiveau: 7,                       // <-- Uit laatste check-in (1-10)
  slaapKwaliteit: 8,                      // <-- Uit laatste check-in (1-10)
  waterInname: 2.8,                       // <-- Liter per dag gemiddeld
}

/** Huidig programma — Supabase: client_programs */
const huidigProgramma = {
  naam: "Kracht Fase 2",                 // <-- Programma naam
  beschrijving: "Upper/Lower split",     // <-- Korte beschrijving
  week: 6,                                // <-- Huidige week
  totaalWeken: 12,                        // <-- Totaal weken
  trainingsDagen: 4,                      // <-- Trainingen per week
  voltooidDezWeek: 3,                     // <-- Trainingen gedaan deze week
}

/** Macro targets — Supabase: client_nutrition */
const macroTargets = {
  kcal: { huidig: 1920, doel: 2200 },    // <-- Huidige inname vs doel
  eiwit: { huidig: 145, doel: 160 },     // <-- Gram eiwit
  koolhydraten: { huidig: 210, doel: 250 }, // <-- Gram koolhydraten
  vetten: { huidig: 58, doel: 65 },      // <-- Gram vetten
}

/** Gewichtstrend — Supabase: client_checkins (gewicht per week) */
const gewichtsData = [
  { week: "Wk 1", gewicht: 74.2 },       // <-- Per check-in datum + gewicht
  { week: "Wk 2", gewicht: 73.8 },
  { week: "Wk 3", gewicht: 73.5 },
  { week: "Wk 4", gewicht: 73.9 },
  { week: "Wk 5", gewicht: 73.2 },
  { week: "Wk 6", gewicht: 72.8 },
  { week: "Wk 7", gewicht: 72.5 },
  { week: "Wk 8", gewicht: 72.3 },
  { week: "Wk 9", gewicht: 72.0 },
  { week: "Wk 10", gewicht: 71.8 },
  { week: "Wk 11", gewicht: 71.5 },
  { week: "Wk 12", gewicht: 71.1 },
]

/** Laatste check-in samenvatting — Supabase: client_checkins (meest recente) */
const laatsteCheckin = {
  datum: "28 feb 2026",                   // <-- Datum check-in
  gewicht: 71.1,                           // <-- Gewicht in kg
  verandering: -0.4,                       // <-- Verschil t.o.v. vorige week
  energie: 7,                              // <-- Energieniveau 1-10
  slaap: 8,                               // <-- Slaapkwaliteit 1-10
  opmerkingen: "Voelde me sterk deze week, squats gaan goed. Iets meer last van slaap door stress op werk.", // <-- Tekst
}

/** Komende sessies — Supabase: client_sessions */
const komendeSessies = [
  { datum: "1 mrt", tijd: "10:00", type: "Upper Body", status: "gepland" },   // <-- Sessie data
  { datum: "3 mrt", tijd: "10:00", type: "Lower Body", status: "gepland" },
  { datum: "5 mrt", tijd: "16:00", type: "Check-in gesprek", status: "gepland" },
]

/** Recente coach notities — Supabase: coach_notes */
const recenteNotities = [
  {
    datum: "27 feb",
    tekst: "Progressie op squat is uitstekend. Overweeg volume te verhogen volgende fase.",
    categorie: "training",
  },
  {
    datum: "25 feb",
    tekst: "Eiwitinname onder target, besproken om meer zuivel toe te voegen.",
    categorie: "voeding",
  },
]

/** Data Status — Automatisch overzicht van welke databronnen de AI heeft */
type DataStatus = "beschikbaar" | "beperkt" | "niet_beschikbaar"

const dataBronnen: Array<{
  id: string
  label: string
  icon: React.ElementType
  status: DataStatus
  detail: string
  activeerLink?: string
}> = [
  { id: "intake", label: "Intake", icon: FileText, status: "beschikbaar", detail: "volledig ingevuld" },
  { id: "wekelijks", label: "Wekelijkse check-ins", icon: Calendar, status: "beschikbaar", detail: "6 van 6 weken" },
  { id: "dagelijks", label: "Dagelijkse check-ins", icon: Activity, status: "beschikbaar", detail: "laatste 28 dagen" },
  { id: "voeding", label: "Voedingslogs", icon: Utensils, status: "beschikbaar", detail: "laatste 14 dagen" },
  { id: "training", label: "Training logs", icon: Dumbbell, status: "beschikbaar", detail: "laatste 6 weken" },
  { id: "supplementen", label: "Supplementen", icon: Pill, status: "beschikbaar", detail: "actief (4 items)" },
  { id: "fotos", label: "Voortgangsfoto's", icon: Camera, status: "beperkt", detail: "3 van 6 weken", activeerLink: "metingen" },
  { id: "maten", label: "Lichaamsmaten", icon: Gauge, status: "niet_beschikbaar", detail: "nog nooit ingevuld", activeerLink: "metingen" },
  { id: "wearable", label: "Wearable data", icon: Watch, status: "niet_beschikbaar", detail: "niet gekoppeld", activeerLink: "instellingen" },
  { id: "rpe", label: "RPE per workout", icon: Activity, status: "niet_beschikbaar", detail: "niet ingeschakeld", activeerLink: "instellingen" },
]

// Bereken AI dekking percentage
const beschikbaarCount = dataBronnen.filter(d => d.status === "beschikbaar").length
const beperktCount = dataBronnen.filter(d => d.status === "beperkt").length
const aiDekking = Math.round(((beschikbaarCount + beperktCount * 0.5) / dataBronnen.length) * 100)

/** AI Activity Log — Terminal-achtige feed van AI denkproces */
type LogType = "analyse" | "patroon" | "voorstel" | "auto" | "fout" | "check"

const aiActivityLog: Array<{
  tijd: string
  type: LogType
  tekst: string
  detail?: string
}> = [
  { tijd: "14:40", type: "auto", tekst: "Rustdag ingepland (regel: max 5 dagen)", detail: "Automatisch toegepast" },
  { tijd: "14:36", type: "voorstel", tekst: "Gegenereerd: volume +1 set per compound", detail: "Zekerheid: 75% → Wacht op coach review" },
  { tijd: "14:35", type: "patroon", tekst: "Compound lifts: progressie 3 weken consistent" },
  { tijd: "14:35", type: "check", tekst: "RPE data niet beschikbaar — analyse beperkt" },
  { tijd: "14:35", type: "analyse", tekst: "Training logs week 6 verwerkt" },
  { tijd: "14:33", type: "voorstel", tekst: "Gegenereerd: verhoog eiwit target → 160g", detail: "Zekerheid: 80% (4 datapunten, bevestigd patroon) → Wacht op coach review" },
  { tijd: "14:32", type: "patroon", tekst: "Eiwitinname za/zo gem. 105g vs doordeweeks 142g" },
  { tijd: "14:32", type: "analyse", tekst: "Client memory: \"Moeite met eiwit in weekenden\"" },
  { tijd: "14:32", type: "analyse", tekst: "Voedingslogs afgelopen 7 dagen opgehaald" },
]

const logTypeConfig: Record<LogType, { label: string; color: string }> = {
  analyse: { label: "ANALYSE", color: "text-muted-foreground" },
  patroon: { label: "PATROON", color: "text-blue-400" },
  voorstel: { label: "VOORSTEL", color: "text-primary" },
  auto: { label: "AUTO", color: "text-success" },
  fout: { label: "FOUT", color: "text-destructive" },
  check: { label: "CHECK", color: "text-warning" },
}

/** AI Automatiseringsregels — Per domein */
type AIMode = "ai_stuurt" | "voorstellen" | "handmatig"

const aiDomeinen = [
  {
    id: "voeding",
    label: "Voeding & Macro's",
    icon: Apple,
    beschrijving: "Maaltijdplannen, macro-aanpassingen",
    defaultMode: "voorstellen" as AIMode,
  },
  {
    id: "training",
    label: "Training & Progressie",
    icon: Dumbbell,
    beschrijving: "Gewichten, sets, reps, deload",
    defaultMode: "voorstellen" as AIMode,
  },
  {
    id: "rustdagen",
    label: "Rustdagen & Herstel",
    icon: Moon,
    beschrijving: "Extra rustdagen, actief herstel",
    defaultMode: "ai_stuurt" as AIMode,
  },
  {
    id: "supplementen",
    label: "Supplementen",
    icon: Pill,
    beschrijving: "Supplement suggesties en dosering",
    defaultMode: "handmatig" as AIMode,
  },
  {
    id: "programmawissel",
    label: "Programmawissel",
    icon: RefreshCw,
    beschrijving: "Overstap naar nieuw programma",
    defaultMode: "voorstellen" as AIMode,
  },
]


function MacroBar({ label, huidig, doel, kleur }: { label: string; huidig: number; doel: number; kleur: string }) {
  const percentage = Math.min(Math.round((huidig / doel) * 100), 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{huidig} / {doel}g</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${kleur} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export function OverzichtTab() {
  const [aiModes, setAiModes] = useState<Record<string, AIMode>>(
    Object.fromEntries(aiDomeinen.map(d => [d.id, d.defaultMode]))
  )
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [activityLogPaused, setActivityLogPaused] = useState(false)

  const updateAiMode = (domeinId: string, mode: AIMode) => {
    setAiModes(prev => ({ ...prev, [domeinId]: mode }))
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Snelle stats rij */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <span className="text-[11px] text-muted-foreground">Week</span>
            <span className="text-2xl font-bold text-foreground">{snelleStats.huidigeWeek}</span>
            <span className="text-[10px] text-muted-foreground">van {huidigProgramma.totaalWeken}</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1">
              <Dumbbell className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Training</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{snelleStats.complianceTraining}%</span>
            <span className="text-[10px] text-success">Compliance</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1">
              <Apple className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Voeding</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{snelleStats.complianceVoeding}%</span>
            <span className="text-[10px] text-warning-foreground">Compliance</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <span className="text-[11px] text-muted-foreground">Gewicht</span>
            <div className="flex items-center gap-1">
              {snelleStats.gewichtsTrend < 0 ? (
                <TrendingDown className="size-3.5 text-success" />
              ) : snelleStats.gewichtsTrend > 0 ? (
                <TrendingUp className="size-3.5 text-destructive" />
              ) : (
                <Minus className="size-3.5 text-muted-foreground" />
              )}
              <span className="text-2xl font-bold text-foreground">{snelleStats.gewichtsTrend}kg</span>
            </div>
            <span className="text-[10px] text-muted-foreground">deze week</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Activity className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{snelleStats.energieNiveau}</span>
            <span className="text-[10px] text-muted-foreground">Energie</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Moon className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{snelleStats.slaapKwaliteit}</span>
            <span className="text-[10px] text-muted-foreground">Slaap</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Droplets className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{snelleStats.waterInname}L</span>
            <span className="text-[10px] text-muted-foreground">Water/dag</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom 1: Programma + Macro's */}
        <div className="flex flex-col gap-6">
          {/* Huidig programma */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Dumbbell className="size-4 text-primary" />
                Huidig programma
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-foreground">{huidigProgramma.naam}</p>
                <p className="text-xs text-muted-foreground">{huidigProgramma.beschrijving}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Voortgang</span>
                  <span className="font-semibold text-foreground">Week {huidigProgramma.week}/{huidigProgramma.totaalWeken}</span>
                </div>
                <Progress value={(huidigProgramma.week / huidigProgramma.totaalWeken) * 100} className="h-2" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Trainingen deze week</span>
                <span className="font-semibold text-foreground">{huidigProgramma.voltooidDezWeek}/{huidigProgramma.trainingsDagen}</span>
              </div>
            </CardContent>
          </Card>

          {/* Macro targets */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Apple className="size-4 text-primary" />
                {"Macro's vandaag"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Calorieën</span>
                  <span className="font-semibold text-foreground">{macroTargets.kcal.huidig} / {macroTargets.kcal.doel} kcal</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((macroTargets.kcal.huidig / macroTargets.kcal.doel) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <MacroBar label="Eiwit" huidig={macroTargets.eiwit.huidig} doel={macroTargets.eiwit.doel} kleur="bg-chart-1" />
              <MacroBar label="Koolhydraten" huidig={macroTargets.koolhydraten.huidig} doel={macroTargets.koolhydraten.doel} kleur="bg-chart-2" />
              <MacroBar label="Vetten" huidig={macroTargets.vetten.huidig} doel={macroTargets.vetten.doel} kleur="bg-chart-4" />
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Gewichtstrend */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Gewichtstrend</CardTitle>
              <Badge variant="outline" className="text-[10px]">12 weken</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gewichtsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gewichtGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.91 0.005 240)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value} kg`, "Gewicht"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="gewicht"
                    stroke="oklch(0.55 0.15 160)"
                    strokeWidth={2}
                    fill="url(#gewichtGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onderste rij: Check-in + Sessies + Notities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Laatste check-in */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Laatste check-in</CardTitle>
            <p className="text-[11px] text-muted-foreground">{laatsteCheckin.datum}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Gewicht</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground">{laatsteCheckin.gewicht} kg</span>
                  <span className={`text-[11px] ${laatsteCheckin.verandering < 0 ? "text-success" : "text-destructive"}`}>
                    {laatsteCheckin.verandering > 0 ? "+" : ""}{laatsteCheckin.verandering} kg
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Energie</span>
                <span className="text-sm font-semibold text-foreground">{laatsteCheckin.energie}/10</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Slaap</span>
                <span className="text-sm font-semibold text-foreground">{laatsteCheckin.slaap}/10</span>
              </div>
            </div>
            <div className="border-t border-border pt-2">
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {`"${laatsteCheckin.opmerkingen}"`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Komende sessies */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Komende sessies
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {komendeSessies.map((sessie, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{sessie.type}</span>
                  <span className="text-[11px] text-muted-foreground">{sessie.datum} om {sessie.tijd}</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  {sessie.status === "gepland" ? "Gepland" : sessie.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recente notities */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="size-4 text-primary" />
              Recente notities
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recenteNotities.map((notitie, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] capitalize">{notitie.categorie}</Badge>
                  <span className="text-[11px] text-muted-foreground">{notitie.datum}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{notitie.tekst}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* AI Automatiseringsregels */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bot className="size-4 text-primary" />
            AI Automatiseringsregels
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">Bepaal hoe AI handelt per domein voor deze client</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {aiDomeinen.map((domein) => {
              const Icon = domein.icon
              return (
                <div key={domein.id} className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">{domein.label}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{domein.beschrijving}</p>
                  <Select
                    value={aiModes[domein.id]}
                    onValueChange={(value: AIMode) => updateAiMode(domein.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_stuurt" className="text-xs">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="size-3 text-primary" />
                          AI stuurt
                        </span>
                      </SelectItem>
                      <SelectItem value="voorstellen" className="text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-warning" />
                          Voorstellen
                        </span>
                      </SelectItem>
                      <SelectItem value="handmatig" className="text-xs">
                        <span className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-muted-foreground" />
                          Handmatig
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data Status + AI Activity Log grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Status */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Database className="size-4 text-primary" />
              Data Status
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Databronnen beschikbaar voor AI analyse</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Beschikbaar */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-medium text-success uppercase tracking-wide">Beschikbaar</span>
              <div className="space-y-1">
                {dataBronnen.filter(d => d.status === "beschikbaar").map(bron => {
                  const Icon = bron.icon
                  return (
                    <div key={bron.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-success/5">
                      <div className="flex items-center gap-2">
                        <Circle className="size-2 fill-success text-success" />
                        <Icon className="size-3.5 text-muted-foreground" />
                        <span className="text-xs text-foreground">{bron.label}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">{bron.detail}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Beperkt */}
            {dataBronnen.filter(d => d.status === "beperkt").length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-medium text-warning uppercase tracking-wide">Beperkt</span>
                <div className="space-y-1">
                  {dataBronnen.filter(d => d.status === "beperkt").map(bron => {
                    const Icon = bron.icon
                    return (
                      <div key={bron.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-warning/5">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full border border-warning bg-gradient-to-r from-warning to-transparent" />
                          <Icon className="size-3.5 text-muted-foreground" />
                          <span className="text-xs text-foreground">{bron.label}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{bron.detail}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Niet beschikbaar */}
            {dataBronnen.filter(d => d.status === "niet_beschikbaar").length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Niet beschikbaar</span>
                <div className="space-y-1">
                  {dataBronnen.filter(d => d.status === "niet_beschikbaar").map(bron => {
                    const Icon = bron.icon
                    return (
                      <div key={bron.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <Circle className="size-2 text-muted-foreground" />
                          <Icon className="size-3.5 text-muted-foreground/50" />
                          <span className="text-xs text-muted-foreground">{bron.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">{bron.detail}</span>
                          {bron.activeerLink && (
                            <button className="text-[10px] text-primary hover:underline">Activeren</button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* AI Dekking */}
            <div className="pt-3 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-foreground">AI dekking</span>
                <span className="text-sm font-bold text-primary">{aiDekking}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                  style={{ width: `${aiDekking}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Activity Log */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Bot className="size-4 text-primary" />
                AI Activity Log
              </CardTitle>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "size-2 rounded-full",
                    activityLogPaused ? "bg-muted-foreground" : "bg-success animate-pulse"
                  )} />
                  <span className="text-[10px] text-muted-foreground">
                    {activityLogPaused ? "Gepauzeerd" : "Live"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => setActivityLogPaused(!activityLogPaused)}
                >
                  {activityLogPaused ? <Play className="size-3" /> : <Pause className="size-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-6"
                  onClick={() => setActivityLogOpen(!activityLogOpen)}
                >
                  {activityLogOpen ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
                </Button>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground">Volg het denkproces en acties van de AI</p>
          </CardHeader>
          <CardContent>
            <div
              className={cn(
                "rounded-lg bg-[#0d0d0d] border border-border overflow-hidden transition-all",
                activityLogOpen ? "max-h-[400px]" : "max-h-[200px]"
              )}
            >
              <div className="p-3 overflow-y-auto max-h-[inherit] font-mono text-[11px] space-y-1.5">
                {aiActivityLog.map((log, i) => {
                  const config = logTypeConfig[log.type]
                  return (
                    <div key={i} className="flex gap-3">
                      <span className="text-muted-foreground shrink-0 w-10">{log.tijd}</span>
                      <span className={cn("shrink-0 w-16 font-semibold", config.color)}>
                        {config.label}
                      </span>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-foreground/90">{log.tekst}</span>
                        {log.detail && (
                          <span className="text-muted-foreground text-[10px] pl-4">→ {log.detail}</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
