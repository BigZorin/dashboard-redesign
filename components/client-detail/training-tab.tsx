"use client"

import { useState } from "react"
import {
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Check,
  Clock,
  Dumbbell,
  Edit3,
  Copy,
  RotateCcw,
  Layers,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
//   - program_blocks         (blokken binnen programma, bijv. "Opbouw", "Piek")
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
      naam: "Blok 1 — Opbouw",             // <-- Naam van het blok
      beschrijving: "Basisopbouw volume en techniek", // <-- Korte omschrijving
      weken: 4,                             // <-- Aantal weken in dit blok
      status: "voltooid" as const,          // voltooid | actief | gepland
      weekRange: "Week 1–4",               // <-- Visueel label
      weekData: [
        {
          weekNummer: 1,
          status: "voltooid" as const,
          sessies: "4/4",                   // <-- Voltooide/geplande sessies
          compliance: 100,                  // <-- Percentage compliance
          notitie: "Start programma",       // <-- Coach/cliënt notitie
        },
        {
          weekNummer: 2,
          status: "voltooid" as const,
          sessies: "4/4",
          compliance: 100,
          notitie: "",
        },
        {
          weekNummer: 3,
          status: "voltooid" as const,
          sessies: "3/4",
          compliance: 75,
          notitie: "Dag 2 overgeslagen (vakantie)",
        },
        {
          weekNummer: 4,
          status: "voltooid" as const,
          sessies: "4/4",
          compliance: 100,
          notitie: "PR op squat: 87.5 kg",
        },
      ],
    },
    {
      id: "blok_002",
      naam: "Blok 2 — Intensificatie",
      beschrijving: "Hogere intensiteit, lager volume, focus op kracht",
      weken: 4,
      status: "actief" as const,
      weekRange: "Week 5–8",
      weekData: [
        {
          weekNummer: 5,
          status: "voltooid" as const,
          sessies: "4/4",
          compliance: 100,
          notitie: "Alle sessies voltooid",
        },
        {
          weekNummer: 6,
          status: "actief" as const,
          sessies: "2/4",
          compliance: 50,
          notitie: "Huidige week — 2 sessies voltooid",
        },
        {
          weekNummer: 7,
          status: "gepland" as const,
          sessies: "0/4",
          compliance: 0,
          notitie: "",
        },
        {
          weekNummer: 8,
          status: "gepland" as const,
          sessies: "0/4",
          compliance: 0,
          notitie: "Deload week",
        },
      ],
    },
    {
      id: "blok_003",
      naam: "Blok 3 — Piek & Taper",
      beschrijving: "Piekfase richting maximale kracht, daarna taper",
      weken: 4,
      status: "gepland" as const,
      weekRange: "Week 9–12",
      weekData: [
        { weekNummer: 9, status: "gepland" as const, sessies: "0/4", compliance: 0, notitie: "" },
        { weekNummer: 10, status: "gepland" as const, sessies: "0/4", compliance: 0, notitie: "" },
        { weekNummer: 11, status: "gepland" as const, sessies: "0/4", compliance: 0, notitie: "" },
        { weekNummer: 12, status: "gepland" as const, sessies: "0/4", compliance: 0, notitie: "Testweek" },
      ],
    },
  ],
}

/** Trainingen van de actieve week — Supabase: week_workouts + workout_exercises */
const actieveWeekTrainingen = [
  {
    id: "train_001",                         // <-- Supabase UUID
    naam: "Training 1 — Upper (Kracht)",     // <-- Trainingsnaam
    dag: "Maandag",                          // <-- Geplande dag
    status: "voltooid" as const,             // voltooid | gepland | overgeslagen
    oefeningen: [
      {
        naam: "Bench Press",                 // <-- Oefening naam
        sets: 4,                             // <-- Aantal sets
        reps: "5",                           // <-- Reps (kan range zijn: "8-12")
        gewicht: "70 kg",                    // <-- Huidig gewicht
        rust: "3 min",                       // <-- Rusttijd
        progressie: "up" as const,           // up | down | neutral
        aiSuggestie: null as string | null,  // <-- AI suggestie tekst of null
      },
      { naam: "Barbell Row", sets: 4, reps: "5", gewicht: "65 kg", rust: "3 min", progressie: "up" as const, aiSuggestie: null },
      { naam: "Overhead Press", sets: 3, reps: "8", gewicht: "40 kg", rust: "2 min", progressie: "neutral" as const, aiSuggestie: "Overweeg gewicht te verhogen naar 42.5 kg op basis van RPE trends" },
      { naam: "Lat Pulldown", sets: 3, reps: "10-12", gewicht: "55 kg", rust: "90 sec", progressie: "up" as const, aiSuggestie: null },
      { naam: "Dumbbell Curl", sets: 3, reps: "12", gewicht: "14 kg", rust: "60 sec", progressie: "neutral" as const, aiSuggestie: null },
    ],
  },
  {
    id: "train_002",
    naam: "Training 2 — Lower (Kracht)",
    dag: "Dinsdag",
    status: "voltooid" as const,
    oefeningen: [
      { naam: "Squat", sets: 4, reps: "5", gewicht: "90 kg", rust: "3 min", progressie: "up" as const, aiSuggestie: "Uitstekende progressie. Volgende week 92.5 kg proberen." },
      { naam: "Romanian Deadlift", sets: 3, reps: "8", gewicht: "70 kg", rust: "2 min", progressie: "up" as const, aiSuggestie: null },
      { naam: "Leg Press", sets: 3, reps: "10-12", gewicht: "140 kg", rust: "2 min", progressie: "neutral" as const, aiSuggestie: null },
      { naam: "Leg Curl", sets: 3, reps: "12", gewicht: "45 kg", rust: "60 sec", progressie: "up" as const, aiSuggestie: null },
      { naam: "Calf Raises", sets: 4, reps: "15", gewicht: "80 kg", rust: "60 sec", progressie: "neutral" as const, aiSuggestie: null },
    ],
  },
  {
    id: "train_003",
    naam: "Training 3 — Upper (Hypertrofie)",
    dag: "Donderdag",
    status: "gepland" as const,
    oefeningen: [
      { naam: "Incline Dumbbell Press", sets: 4, reps: "8-12", gewicht: "28 kg", rust: "2 min", progressie: "up" as const, aiSuggestie: null },
      { naam: "Cable Row", sets: 4, reps: "10-12", gewicht: "60 kg", rust: "90 sec", progressie: "neutral" as const, aiSuggestie: null },
      { naam: "Lateral Raise", sets: 3, reps: "15", gewicht: "10 kg", rust: "60 sec", progressie: "up" as const, aiSuggestie: null },
      { naam: "Face Pull", sets: 3, reps: "15", gewicht: "25 kg", rust: "60 sec", progressie: "neutral" as const, aiSuggestie: null },
      { naam: "Tricep Pushdown", sets: 3, reps: "12", gewicht: "30 kg", rust: "60 sec", progressie: "neutral" as const, aiSuggestie: null },
    ],
  },
  {
    id: "train_004",
    naam: "Training 4 — Lower (Hypertrofie)",
    dag: "Vrijdag",
    status: "gepland" as const,
    oefeningen: [
      { naam: "Front Squat", sets: 3, reps: "8", gewicht: "60 kg", rust: "2 min", progressie: "neutral" as const, aiSuggestie: null },
      { naam: "Bulgarian Split Squat", sets: 3, reps: "10", gewicht: "20 kg", rust: "90 sec", progressie: "up" as const, aiSuggestie: null },
      { naam: "Hip Thrust", sets: 4, reps: "10", gewicht: "80 kg", rust: "2 min", progressie: "up" as const, aiSuggestie: null },
      { naam: "Leg Extension", sets: 3, reps: "12-15", gewicht: "50 kg", rust: "60 sec", progressie: "neutral" as const, aiSuggestie: null },
      { naam: "Seated Calf Raise", sets: 4, reps: "15", gewicht: "40 kg", rust: "60 sec", progressie: "neutral" as const, aiSuggestie: null },
    ],
  },
]

// ============================================================================
// HELPER FUNCTIES
// ============================================================================

function getStatusIcon(status: string) {
  switch (status) {
    case "voltooid":
      return <Check className="size-3.5 text-success" />
    case "actief":
      return <Clock className="size-3.5 text-primary" />
    case "gepland":
      return <Clock className="size-3.5 text-muted-foreground" />
    case "overgeslagen":
      return <span className="size-3.5 rounded-full bg-destructive/20" />
    default:
      return null
  }
}

function getProgressieIcon(progressie: string) {
  switch (progressie) {
    case "up":
      return <TrendingUp className="size-3.5 text-success" />
    case "down":
      return <TrendingUp className="size-3.5 text-destructive rotate-180" />
    default:
      return <span className="text-xs text-muted-foreground">—</span>
  }
}

function getBlokStatusBadge(status: string) {
  switch (status) {
    case "voltooid":
      return <Badge variant="outline" className="text-[10px] border-success/30 text-success">Voltooid</Badge>
    case "actief":
      return <Badge className="text-[10px] bg-primary text-primary-foreground">Actief</Badge>
    case "gepland":
      return <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">Gepland</Badge>
    default:
      return null
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export function TrainingTab() {
  const [openBlok, setOpenBlok] = useState<string>("blok_002") // actief blok standaard open
  const [openTraining, setOpenTraining] = useState<number>(0)

  // Bereken totale programma voortgang
  const voortgangPercentage = Math.round((programma.huidigeWeek / programma.totaalWeken) * 100)

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Programma header */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground">{programma.naam}</h3>
                <Badge variant="outline" className="text-[10px]">{programma.type}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Gestart {programma.startDatum} &mdash; Week {programma.huidigeWeek} van {programma.totaalWeken} &mdash; {programma.blokken.length} blokken
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] gap-1 border-primary/30 text-primary">
                <Sparkles className="size-3" />
                2 AI suggesties
              </Badge>
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
          {/* Voortgangsbalk programma */}
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${voortgangPercentage}%` }}
              />
            </div>
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">{voortgangPercentage}%</span>
          </div>
        </CardContent>
      </Card>

      {/* Blokken overzicht */}
      <div className="flex flex-col gap-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
          <Layers className="size-3.5" />
          Blokken
        </h4>

        {programma.blokken.map((blok) => (
          <Card
            key={blok.id}
            className={`border-border overflow-hidden transition-all ${
              blok.status === "actief" ? "ring-1 ring-primary/20 border-primary/30" : ""
            }`}
          >
            {/* Blok header — klikbaar */}
            <button
              onClick={() => setOpenBlok(openBlok === blok.id ? "" : blok.id)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`flex size-8 items-center justify-center rounded-lg ${
                  blok.status === "actief" ? "bg-primary/10" : blok.status === "voltooid" ? "bg-success/10" : "bg-secondary"
                }`}>
                  <Layers className={`size-4 ${
                    blok.status === "actief" ? "text-primary" : blok.status === "voltooid" ? "text-success" : "text-muted-foreground"
                  }`} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{blok.naam}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {blok.beschrijving} &mdash; {blok.weekRange}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getBlokStatusBadge(blok.status)}
                {openBlok === blok.id ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {/* Blok inhoud — weken */}
            {openBlok === blok.id && (
              <div className="border-t border-border">
                <div className="p-4 flex flex-col gap-2">
                  {blok.weekData.map((week) => (
                    <div
                      key={week.weekNummer}
                      className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors ${
                        week.status === "actief"
                          ? "bg-primary/5 border border-primary/20"
                          : "bg-secondary/20 border border-transparent hover:border-border"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 min-w-[80px]">
                          {getStatusIcon(week.status)}
                          <span className={`text-sm font-medium ${
                            week.status === "actief" ? "text-primary" : "text-foreground"
                          }`}>
                            Week {week.weekNummer}
                          </span>
                        </div>
                        {week.status === "actief" && (
                          <Badge className="text-[9px] bg-primary/10 text-primary border-primary/20">Huidige week</Badge>
                        )}
                        {week.notitie && (
                          <span className="text-[11px] text-muted-foreground">{week.notitie}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-muted-foreground">{week.sessies} sessies</span>
                        {week.compliance > 0 && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              week.compliance === 100 ? "border-success/30 text-success" : week.compliance >= 75 ? "border-warning/30 text-warning-foreground" : "border-border text-muted-foreground"
                            }`}
                          >
                            {week.compliance}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Trainingen van de actieve week */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
            <Calendar className="size-3.5" />
            Week {programma.huidigeWeek} — Trainingen
          </h4>
          <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-border">
            <RotateCcw className="size-3" />
            Vorige week
          </Button>
        </div>

        {actieveWeekTrainingen.map((training, trainIndex) => (
          <Card key={training.id} className="border-border overflow-hidden">
            <button
              onClick={() => setOpenTraining(openTraining === trainIndex ? -1 : trainIndex)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(training.status)}
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{training.naam}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {training.dag} &mdash; {training.oefeningen.length} oefeningen
                    {training.oefeningen.some(o => o.aiSuggestie) && (
                      <span className="ml-2 text-primary">&mdash; AI suggestie beschikbaar</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-primary"
                  onClick={(e) => { e.stopPropagation() }}
                >
                  <Edit3 className="size-3" />
                  Bewerken
                </Button>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    training.status === "voltooid"
                      ? "border-success/30 text-success"
                      : training.status === "gepland"
                        ? "border-border text-muted-foreground"
                        : "border-destructive/30 text-destructive"
                  }`}
                >
                  {training.status === "voltooid" ? "Voltooid" : training.status === "gepland" ? "Gepland" : "Overgeslagen"}
                </Badge>
                {openTraining === trainIndex ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {openTraining === trainIndex && (
              <div className="border-t border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[11px] font-semibold">Oefening</TableHead>
                      <TableHead className="text-[11px] font-semibold text-center">Sets</TableHead>
                      <TableHead className="text-[11px] font-semibold text-center">Reps</TableHead>
                      <TableHead className="text-[11px] font-semibold text-center">Gewicht</TableHead>
                      <TableHead className="text-[11px] font-semibold text-center">Rust</TableHead>
                      <TableHead className="text-[11px] font-semibold text-center">Trend</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {training.oefeningen.map((oefening, i) => (
                      <TableRow key={i} className={oefening.aiSuggestie ? "bg-primary/[0.03]" : ""}>
                        <TableCell className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{oefening.naam}</span>
                              {oefening.aiSuggestie && <Sparkles className="size-3 text-primary" />}
                            </div>
                            {oefening.aiSuggestie && (
                              <p className="text-[11px] text-primary/80 italic">{oefening.aiSuggestie}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm text-foreground">{oefening.sets}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{oefening.reps}</TableCell>
                        <TableCell className="text-center text-sm font-medium text-foreground">{oefening.gewicht}</TableCell>
                        <TableCell className="text-center text-xs text-muted-foreground">{oefening.rust}</TableCell>
                        <TableCell className="text-center">{getProgressieIcon(oefening.progressie)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
