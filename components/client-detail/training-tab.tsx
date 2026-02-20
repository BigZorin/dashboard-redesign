"use client"

import { useState } from "react"
import {
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Check,
  Clock,
  Edit3,
  Dumbbell,
  ArrowLeft,
  Plus,
  Play,
  CalendarDays,
  BarChart3,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ============================================================================
// PLACEHOLDER DATA — Alle programma's van de cliënt
//
// Vervang met echte data uit Supabase tabellen:
//   - client_programs        (toegewezen programma's per cliënt)
//   - program_blocks         (blokken binnen programma)
//   - block_weeks            (weken per blok)
//   - week_workouts          (trainingen per week)
//   - workout_exercises      (oefeningen per training)
//   - client_exercise_logs   (progressie/logboek per oefening)
//   - ai_suggestions         (AI-aanbevelingen per oefening/week)
// ============================================================================

/** Programma's van de cliënt — Supabase: client_programs */
const programmas = [
  {
    id: "prog_001",                            // <-- Supabase UUID
    naam: "Kracht Fase 2",                     // <-- Programmanaam
    type: "Upper/Lower Split",                 // <-- Type split/programma
    beschrijving: "Kracht opbouwen met periodisering. Focus op compound lifts met progressieve overload.",
    bannerKleur: "from-emerald-600 to-teal-700", // <-- Gradient voor banner (of afbeelding-URL)
    bannerAfbeelding: null as string | null,   // <-- Supabase Storage URL voor programma-banner
    status: "actief" as const,                 // actief | voltooid | gepland
    startDatum: "3 feb 2026",
    eindDatum: "27 apr 2026",
    totaalWeken: 12,
    huidigeWeek: 6,
    compliance: 88,                            // <-- Gemiddelde compliance %
    sessiesPerWeek: 4,
  },
  {
    id: "prog_002",
    naam: "Mobiliteit & Herstel",
    type: "Full Body",
    beschrijving: "Aanvullend mobiliteitsprogramma voor betere bewegingskwaliteit en herstel.",
    bannerKleur: "from-sky-600 to-blue-700",
    bannerAfbeelding: null as string | null,
    status: "actief" as const,
    startDatum: "3 feb 2026",
    eindDatum: "27 apr 2026",
    totaalWeken: 12,
    huidigeWeek: 6,
    compliance: 75,
    sessiesPerWeek: 2,
  },
  {
    id: "prog_000",
    naam: "Fundament Fase 1",
    type: "Full Body",
    beschrijving: "Eerste fase gericht op bewegingspatronen, core stabiliteit en basisuithoudingsvermogen.",
    bannerKleur: "from-slate-500 to-slate-700",
    bannerAfbeelding: null as string | null,
    status: "voltooid" as const,
    startDatum: "4 nov 2025",
    eindDatum: "26 jan 2026",
    totaalWeken: 12,
    huidigeWeek: 12,
    compliance: 92,
    sessiesPerWeek: 3,
  },
]

/** Blokken per programma — Supabase: program_blocks */
const blokkenPerProgramma: Record<string, Array<{
  id: string
  naam: string
  kleur: string
  weken: number[]
  status: "voltooid" | "actief" | "gepland"
}>> = {
  prog_001: [
    { id: "blok_001", naam: "Opbouw", kleur: "bg-chart-2", weken: [1, 2, 3, 4], status: "voltooid" },
    { id: "blok_002", naam: "Intensificatie", kleur: "bg-primary", weken: [5, 6, 7, 8], status: "actief" },
    { id: "blok_003", naam: "Piek & Taper", kleur: "bg-chart-3", weken: [9, 10, 11, 12], status: "gepland" },
  ],
  prog_002: [
    { id: "blok_010", naam: "Basis", kleur: "bg-chart-2", weken: [1, 2, 3, 4, 5, 6], status: "voltooid" },
    { id: "blok_011", naam: "Verdieping", kleur: "bg-primary", weken: [7, 8, 9, 10, 11, 12], status: "actief" },
  ],
  prog_000: [
    { id: "blok_020", naam: "Adaptatie", kleur: "bg-chart-2", weken: [1, 2, 3, 4], status: "voltooid" },
    { id: "blok_021", naam: "Opbouw", kleur: "bg-chart-3", weken: [5, 6, 7, 8], status: "voltooid" },
    { id: "blok_022", naam: "Consolidatie", kleur: "bg-primary", weken: [9, 10, 11, 12], status: "voltooid" },
  ],
}

/** Week-data — Supabase: block_weeks */
const weekData: Record<number, {
  compliance: number
  sessies: string
  status: "voltooid" | "actief" | "gepland"
}> = {
  1:  { compliance: 100, sessies: "4/4", status: "voltooid" },
  2:  { compliance: 100, sessies: "4/4", status: "voltooid" },
  3:  { compliance: 75,  sessies: "3/4", status: "voltooid" },
  4:  { compliance: 100, sessies: "4/4", status: "voltooid" },
  5:  { compliance: 100, sessies: "4/4", status: "voltooid" },
  6:  { compliance: 50,  sessies: "2/4", status: "actief" },
  7:  { compliance: 0,   sessies: "0/4", status: "gepland" },
  8:  { compliance: 0,   sessies: "0/4", status: "gepland" },
  9:  { compliance: 0,   sessies: "0/4", status: "gepland" },
  10: { compliance: 0,   sessies: "0/4", status: "gepland" },
  11: { compliance: 0,   sessies: "0/4", status: "gepland" },
  12: { compliance: 0,   sessies: "0/4", status: "gepland" },
}

/** Trainingen per week — Supabase: week_workouts + workout_exercises */
const trainingenPerWeek: Record<number, Array<{
  id: string
  naam: string
  dag: string
  status: "voltooid" | "gepland" | "overgeslagen"
  oefeningen: Array<{
    naam: string
    sets: number
    reps: string
    gewicht: string
    rust: string
    progressie: "up" | "down" | "neutral"
    aiSuggestie: string | null
  }>
}>> = {
  6: [
    {
      id: "train_001",
      naam: "Upper Kracht",
      dag: "Maandag",
      status: "voltooid",
      oefeningen: [
        { naam: "Bench Press", sets: 4, reps: "5", gewicht: "70 kg", rust: "3 min", progressie: "up", aiSuggestie: null },
        { naam: "Barbell Row", sets: 4, reps: "5", gewicht: "65 kg", rust: "3 min", progressie: "up", aiSuggestie: null },
        { naam: "Overhead Press", sets: 3, reps: "8", gewicht: "40 kg", rust: "2 min", progressie: "neutral", aiSuggestie: "Overweeg gewicht te verhogen naar 42.5 kg" },
        { naam: "Lat Pulldown", sets: 3, reps: "10-12", gewicht: "55 kg", rust: "90 sec", progressie: "up", aiSuggestie: null },
        { naam: "Dumbbell Curl", sets: 3, reps: "12", gewicht: "14 kg", rust: "60 sec", progressie: "neutral", aiSuggestie: null },
      ],
    },
    {
      id: "train_002",
      naam: "Lower Kracht",
      dag: "Dinsdag",
      status: "voltooid",
      oefeningen: [
        { naam: "Squat", sets: 4, reps: "5", gewicht: "90 kg", rust: "3 min", progressie: "up", aiSuggestie: "Uitstekend. Volgende week 92.5 kg." },
        { naam: "Romanian Deadlift", sets: 3, reps: "8", gewicht: "70 kg", rust: "2 min", progressie: "up", aiSuggestie: null },
        { naam: "Leg Press", sets: 3, reps: "10-12", gewicht: "140 kg", rust: "2 min", progressie: "neutral", aiSuggestie: null },
        { naam: "Leg Curl", sets: 3, reps: "12", gewicht: "45 kg", rust: "60 sec", progressie: "up", aiSuggestie: null },
        { naam: "Calf Raises", sets: 4, reps: "15", gewicht: "80 kg", rust: "60 sec", progressie: "neutral", aiSuggestie: null },
      ],
    },
    {
      id: "train_003",
      naam: "Upper Hypertrofie",
      dag: "Donderdag",
      status: "gepland",
      oefeningen: [
        { naam: "Incline DB Press", sets: 4, reps: "8-12", gewicht: "28 kg", rust: "2 min", progressie: "up", aiSuggestie: null },
        { naam: "Cable Row", sets: 4, reps: "10-12", gewicht: "60 kg", rust: "90 sec", progressie: "neutral", aiSuggestie: null },
        { naam: "Lateral Raise", sets: 3, reps: "15", gewicht: "10 kg", rust: "60 sec", progressie: "up", aiSuggestie: null },
        { naam: "Face Pull", sets: 3, reps: "15", gewicht: "25 kg", rust: "60 sec", progressie: "neutral", aiSuggestie: null },
        { naam: "Tricep Pushdown", sets: 3, reps: "12", gewicht: "30 kg", rust: "60 sec", progressie: "neutral", aiSuggestie: null },
      ],
    },
    {
      id: "train_004",
      naam: "Lower Hypertrofie",
      dag: "Vrijdag",
      status: "gepland",
      oefeningen: [
        { naam: "Front Squat", sets: 3, reps: "8", gewicht: "60 kg", rust: "2 min", progressie: "neutral", aiSuggestie: null },
        { naam: "Bulgarian Split Squat", sets: 3, reps: "10", gewicht: "20 kg", rust: "90 sec", progressie: "up", aiSuggestie: null },
        { naam: "Hip Thrust", sets: 4, reps: "10", gewicht: "80 kg", rust: "2 min", progressie: "up", aiSuggestie: null },
        { naam: "Leg Extension", sets: 3, reps: "12-15", gewicht: "50 kg", rust: "60 sec", progressie: "neutral", aiSuggestie: null },
        { naam: "Seated Calf Raise", sets: 4, reps: "15", gewicht: "40 kg", rust: "60 sec", progressie: "neutral", aiSuggestie: null },
      ],
    },
  ],
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TrainingTab() {
  const [geselecteerdProgrammaId, setGeselecteerdProgrammaId] = useState<string | null>(null)
  const [geselecteerdeWeek, setGeselecteerdeWeek] = useState<number | null>(null)
  const [openTraining, setOpenTraining] = useState<number>(0)

  const geselecteerdProgramma = programmas.find(p => p.id === geselecteerdProgrammaId)
  const blokken = geselecteerdProgrammaId ? blokkenPerProgramma[geselecteerdProgrammaId] || [] : []
  const trainingen = geselecteerdeWeek ? trainingenPerWeek[geselecteerdeWeek] || [] : []
  const week = geselecteerdeWeek ? weekData[geselecteerdeWeek] : null

  // Zet standaard week als programma wordt geselecteerd
  function selecteerProgramma(id: string) {
    const prog = programmas.find(p => p.id === id)
    setGeselecteerdProgrammaId(id)
    setGeselecteerdeWeek(prog?.huidigeWeek ?? 1)
    setOpenTraining(0)
  }

  // ---- PROGRAMMA-OVERZICHT ------------------------------------------------
  if (!geselecteerdProgrammaId) {
    const actieveProgrammas = programmas.filter(p => p.status === "actief")
    const voltooide = programmas.filter(p => p.status === "voltooid")

    return (
      <div className="flex flex-col gap-6 p-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">Programma{"'"}s</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {actieveProgrammas.length} actief &middot; {voltooide.length} voltooid
            </p>
          </div>
          <Button size="sm" className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-3.5" />
            Programma toewijzen
          </Button>
        </div>

        {/* Actieve programma's */}
        {actieveProgrammas.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actief</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {actieveProgrammas.map((prog) => (
                <ProgrammaKaart key={prog.id} programma={prog} onKlik={() => selecteerProgramma(prog.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Voltooide programma's */}
        {voltooide.length > 0 && (
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Voltooid</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {voltooide.map((prog) => (
                <ProgrammaKaart key={prog.id} programma={prog} onKlik={() => selecteerProgramma(prog.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // ---- PROGRAMMA-DETAIL ----------------------------------------------------
  return (
    <div className="flex flex-col gap-5 p-6">

      {/* Terug + programma header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={() => { setGeselecteerdProgrammaId(null); setGeselecteerdeWeek(null) }}
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Terug naar programma{"'"}s</span>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{geselecteerdProgramma?.naam}</h3>
              <Badge variant="outline" className="text-[10px]">{geselecteerdProgramma?.type}</Badge>
              {geselecteerdProgramma?.status === "actief" && (
                <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Actief</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Week {geselecteerdProgramma?.huidigeWeek} van {geselecteerdProgramma?.totaalWeken} &middot; {geselecteerdProgramma?.sessiesPerWeek}x per week
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-border">
          <Edit3 className="size-3" />
          Bewerken
        </Button>
      </div>

      {/* Blok- en weekselector */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex gap-0 mb-2">
            {blokken.map((blok) => (
              <div key={blok.id} className="flex-1 text-center" style={{ flex: blok.weken.length }}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  blok.status === "actief" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {blok.naam}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-1">
            {blokken.map((blok) =>
              blok.weken.map((weekNr) => {
                const w = weekData[weekNr]
                const isGeselecteerd = weekNr === geselecteerdeWeek
                const isHuidig = weekNr === geselecteerdProgramma?.huidigeWeek
                return (
                  <button
                    key={weekNr}
                    onClick={() => { setGeselecteerdeWeek(weekNr); setOpenTraining(0) }}
                    className={`relative flex-1 h-10 rounded-md text-xs font-medium transition-all flex items-center justify-center ${
                      isGeselecteerd
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : w?.status === "voltooid"
                          ? "bg-success/15 text-success hover:bg-success/25"
                          : w?.status === "actief"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {weekNr}
                    {isHuidig && !isGeselecteerd && (
                      <span className="absolute -top-1 -right-1 size-2 rounded-full bg-primary ring-2 ring-card" />
                    )}
                  </button>
                )
              })
            )}
          </div>
          <div className="flex gap-1 mt-1">
            {blokken.map((blok) => (
              <div
                key={blok.id}
                className={`h-1 rounded-full ${
                  blok.status === "voltooid" ? "bg-success/40" : blok.status === "actief" ? "bg-primary/40" : "bg-border"
                }`}
                style={{ flex: blok.weken.length }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Week info */}
      {week && geselecteerdeWeek && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-semibold text-foreground">Week {geselecteerdeWeek}</h4>
            {week.status === "actief" && (
              <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Huidige week</Badge>
            )}
            {week.status === "voltooid" && (
              <Badge variant="outline" className="text-[9px] border-success/30 text-success">Voltooid</Badge>
            )}
            <span className="text-xs text-muted-foreground">{week.sessies} sessies</span>
          </div>
          {week.compliance > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Compliance</span>
              <Progress value={week.compliance} className="w-20 h-1.5" />
              <span className={`text-[11px] font-semibold ${
                week.compliance === 100 ? "text-success" : week.compliance >= 75 ? "text-foreground" : "text-warning-foreground"
              }`}>{week.compliance}%</span>
            </div>
          )}
        </div>
      )}

      {/* Trainingen */}
      {trainingen.length > 0 ? (
        <div className="flex flex-col gap-3">
          {trainingen.map((training, trainIndex) => (
            <Card key={training.id} className="border-border overflow-hidden">
              <button
                onClick={() => setOpenTraining(openTraining === trainIndex ? -1 : trainIndex)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {training.status === "voltooid"
                    ? <div className="flex size-7 items-center justify-center rounded-md bg-success/10"><Check className="size-3.5 text-success" /></div>
                    : training.status === "gepland"
                      ? <div className="flex size-7 items-center justify-center rounded-md bg-secondary"><Clock className="size-3.5 text-muted-foreground" /></div>
                      : <div className="flex size-7 items-center justify-center rounded-md bg-destructive/10"><Dumbbell className="size-3.5 text-destructive" /></div>
                  }
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">{training.naam}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {training.dag} &middot; {training.oefeningen.length} oefeningen
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {training.oefeningen.some(o => o.aiSuggestie) && (
                    <Badge variant="outline" className="text-[9px] gap-1 border-primary/30 text-primary">
                      <Sparkles className="size-2.5" />
                      AI
                    </Badge>
                  )}
                  {openTraining === trainIndex
                    ? <ChevronDown className="size-4 text-muted-foreground" />
                    : <ChevronRight className="size-4 text-muted-foreground" />
                  }
                </div>
              </button>
              {openTraining === trainIndex && (
                <div className="border-t border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[11px] font-semibold">Oefening</TableHead>
                        <TableHead className="text-[11px] font-semibold text-center w-16">Sets</TableHead>
                        <TableHead className="text-[11px] font-semibold text-center w-16">Reps</TableHead>
                        <TableHead className="text-[11px] font-semibold text-center w-20">Gewicht</TableHead>
                        <TableHead className="text-[11px] font-semibold text-center w-16">Rust</TableHead>
                        <TableHead className="text-[11px] font-semibold text-center w-12">Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {training.oefeningen.map((oefening, i) => (
                        <TableRow key={i} className={oefening.aiSuggestie ? "bg-primary/[0.03]" : ""}>
                          <TableCell className="py-2.5">
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-sm text-foreground">{oefening.naam}</span>
                                {oefening.aiSuggestie && <Sparkles className="size-3 text-primary shrink-0" />}
                              </div>
                              {oefening.aiSuggestie && (
                                <p className="text-[10px] text-primary/70 italic">{oefening.aiSuggestie}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm text-foreground">{oefening.sets}</TableCell>
                          <TableCell className="text-center text-sm text-foreground">{oefening.reps}</TableCell>
                          <TableCell className="text-center text-sm font-medium text-foreground">{oefening.gewicht}</TableCell>
                          <TableCell className="text-center text-[11px] text-muted-foreground">{oefening.rust}</TableCell>
                          <TableCell className="text-center">
                            {oefening.progressie === "up"
                              ? <TrendingUp className="size-3.5 text-success mx-auto" />
                              : oefening.progressie === "down"
                                ? <TrendingUp className="size-3.5 text-destructive mx-auto rotate-180" />
                                : <span className="text-xs text-muted-foreground">&mdash;</span>
                            }
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-border">
          <CardContent className="p-8 text-center">
            <Dumbbell className="size-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {geselecteerdeWeek
                ? `Geen trainingen ingepland voor week ${geselecteerdeWeek}`
                : "Selecteer een week om trainingen te bekijken"
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================================================
// PROGRAMMA KAART — Herbruikbaar component voor programma-overzicht
// ============================================================================

function ProgrammaKaart({
  programma: prog,
  onKlik,
}: {
  programma: typeof programmas[number]
  onKlik: () => void
}) {
  const isVoltooid = prog.status === "voltooid"
  const voortgang = Math.round((prog.huidigeWeek / prog.totaalWeken) * 100)

  return (
    <Card
      className="border-border overflow-hidden cursor-pointer group hover:border-primary/30 transition-all"
      onClick={onKlik}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onKlik() }}
    >
      {/* Banner */}
      <div className={`relative h-28 bg-gradient-to-br ${prog.bannerKleur} flex items-end`}>
        {/* Placeholder voor afbeelding — wordt later Supabase Storage URL */}
        {prog.bannerAfbeelding ? (
          <img
            src={prog.bannerAfbeelding}
            alt={prog.naam}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Dumbbell className="size-16 text-white" />
          </div>
        )}
        <div className="relative z-10 w-full px-4 pb-3 pt-8 bg-gradient-to-t from-black/60 to-transparent">
          <h4 className="text-sm font-bold text-white">{prog.naam}</h4>
          <p className="text-[11px] text-white/80">{prog.type}</p>
        </div>
        {isVoltooid && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-[9px] backdrop-blur-sm">
              <Check className="size-2.5 mr-0.5" />
              Voltooid
            </Badge>
          </div>
        )}
        {!isVoltooid && (
          <div className="absolute top-2 right-2 z-10">
            <Badge className="bg-white/20 text-white border-white/30 text-[9px] backdrop-blur-sm">
              <Play className="size-2.5 mr-0.5" />
              Actief
            </Badge>
          </div>
        )}
      </div>

      {/* Info */}
      <CardContent className="p-4">
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2 mb-3">
          {prog.beschrijving}
        </p>

        {/* Voortgang */}
        <div className="flex items-center gap-2 mb-3">
          <Progress value={voortgang} className="flex-1 h-1.5" />
          <span className="text-[11px] font-semibold text-foreground">{voortgang}%</span>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            Week {prog.huidigeWeek}/{prog.totaalWeken}
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell className="size-3" />
            {prog.sessiesPerWeek}x/week
          </span>
          <span className="flex items-center gap-1">
            <BarChart3 className="size-3" />
            {prog.compliance}% compliance
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
