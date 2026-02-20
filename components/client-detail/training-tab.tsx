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
  Copy,
  Dumbbell,
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
// PLACEHOLDER DATA — Trainingsschema van de cliënt
// Hiërarchie: Programma → Blokken → Weken → Trainingen → Oefeningen
//
// Vervang met echte data uit Supabase tabellen:
//   - client_programs        (huidig programma + metadata)
//   - program_blocks         (blokken binnen programma)
//   - block_weeks            (weken per blok)
//   - week_workouts          (trainingen per week)
//   - workout_exercises      (oefeningen per training)
//   - client_exercise_logs   (progressie/logboek per oefening)
//   - ai_suggestions         (AI-aanbevelingen per oefening/week)
// ============================================================================

/** Programma met blokken — Supabase: client_programs + program_blocks */
const programma = {
  id: "prog_001",                           // <-- Supabase UUID
  naam: "Kracht Fase 2",                    // <-- Naam van het programma
  type: "Upper/Lower Split",                // <-- Type split
  startDatum: "3 feb 2026",                 // <-- Startdatum programma
  totaalWeken: 12,                          // <-- Totaal aantal weken
  huidigeWeek: 6,                           // <-- Welke week de cliënt nu zit
  blokken: [
    {
      id: "blok_001",                       // <-- Supabase UUID
      naam: "Opbouw",                       // <-- Naam van het blok
      kleur: "bg-chart-2",                  // <-- Kleur voor visuele indicator
      weken: [1, 2, 3, 4],                 // <-- Weeknummers in dit blok
      status: "voltooid" as const,          // voltooid | actief | gepland
    },
    {
      id: "blok_002",
      naam: "Intensificatie",
      kleur: "bg-primary",
      weken: [5, 6, 7, 8],
      status: "actief" as const,
    },
    {
      id: "blok_003",
      naam: "Piek & Taper",
      kleur: "bg-chart-3",
      weken: [9, 10, 11, 12],
      status: "gepland" as const,
    },
  ],
}

/** Week-data voor alle weken — Supabase: block_weeks */
const weekData: Record<number, {
  compliance: number             // <-- Percentage compliance 0-100
  sessies: string                // <-- "voltooide/geplande" sessies
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
  id: string                               // <-- Supabase UUID
  naam: string                             // <-- Trainingsnaam
  dag: string                              // <-- Geplande dag
  status: "voltooid" | "gepland" | "overgeslagen"
  oefeningen: Array<{
    naam: string                           // <-- Oefening naam
    sets: number                           // <-- Aantal sets
    reps: string                           // <-- Reps (kan range zijn: "8-12")
    gewicht: string                        // <-- Huidig gewicht
    rust: string                           // <-- Rusttijd
    progressie: "up" | "down" | "neutral"  // <-- Trend indicator
    aiSuggestie: string | null             // <-- AI suggestie tekst of null
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
  const [geselecteerdeWeek, setGeselecteerdeWeek] = useState(programma.huidigeWeek)
  const [openTraining, setOpenTraining] = useState<number>(0)

  const trainingen = trainingenPerWeek[geselecteerdeWeek] || []
  const week = weekData[geselecteerdeWeek]

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Programma header — compact */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{programma.naam}</h3>
            <Badge variant="outline" className="text-[10px]">{programma.type}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Week {programma.huidigeWeek} van {programma.totaalWeken} &middot; Gestart {programma.startDatum}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-border">
            <Copy className="size-3" />
            Dupliceer
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-border">
            <Edit3 className="size-3" />
            Bewerken
          </Button>
        </div>
      </div>

      {/* Blok- en weekselector — visuele balk */}
      <Card className="border-border">
        <CardContent className="p-4">
          {/* Blok labels */}
          <div className="flex gap-0 mb-2">
            {programma.blokken.map((blok) => (
              <div
                key={blok.id}
                className="flex-1 text-center"
                style={{ flex: blok.weken.length }}
              >
                <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                  blok.status === "actief" ? "text-primary" : "text-muted-foreground"
                }`}>
                  {blok.naam}
                </span>
              </div>
            ))}
          </div>

          {/* Week-blokjes */}
          <div className="flex gap-1">
            {programma.blokken.map((blok) =>
              blok.weken.map((weekNr) => {
                const w = weekData[weekNr]
                const isGeselecteerd = weekNr === geselecteerdeWeek
                const isHuidig = weekNr === programma.huidigeWeek

                return (
                  <button
                    key={weekNr}
                    onClick={() => setGeselecteerdeWeek(weekNr)}
                    className={`
                      relative flex-1 h-10 rounded-md text-xs font-medium transition-all
                      flex items-center justify-center
                      ${isGeselecteerd
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : w.status === "voltooid"
                          ? "bg-success/15 text-success hover:bg-success/25"
                          : w.status === "actief"
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                      }
                    `}
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

          {/* Blok scheidingslijnen */}
          <div className="flex gap-1 mt-1">
            {programma.blokken.map((blok, i) => (
              <div
                key={blok.id}
                className={`h-1 rounded-full transition-all ${
                  blok.status === "voltooid"
                    ? "bg-success/40"
                    : blok.status === "actief"
                      ? "bg-primary/40"
                      : "bg-border"
                }`}
                style={{ flex: blok.weken.length }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Week info */}
      {week && (
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
                                : <span className="text-xs text-muted-foreground">—</span>
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
              Geen trainingen ingepland voor week {geselecteerdeWeek}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Selecteer een andere week of maak een training aan
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
