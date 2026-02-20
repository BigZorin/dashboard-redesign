"use client"

import { useState } from "react"
import { TrendingUp, ChevronDown, ChevronRight, Sparkles, Check, Clock, Dumbbell, Edit3, Copy, RotateCcw } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
// Vervang met echte data uit Supabase tabellen:
//   - client_programs (huidig programma)
//   - program_workouts (trainingen per programma)
//   - workout_exercises (oefeningen per training)
//   - client_exercise_logs (progressie/logboek)
//   - ai_suggestions (AI-aanbevelingen per oefening)
// ============================================================================

/** Huidig trainingsschema — Supabase: program_workouts + workout_exercises */
const trainingsSchema = {
  programmaNaam: "Kracht Fase 2",          // <-- Naam van het programma
  type: "Upper/Lower Split",               // <-- Type split
  weken: "Week 5-8",                       // <-- Welke weken dit schema geldt
  frequentie: "4x per week",              // <-- Trainingsfrequentie
  dagen: [
    {
      naam: "Dag 1 - Upper Body (Kracht)",  // <-- Trainingsnaam
      status: "voltooid" as const,           // <-- voltooid | gepland | overgeslagen
      oefeningen: [
        {
          naam: "Bench Press",               // <-- Oefening naam
          sets: 4,                           // <-- Aantal sets
          reps: "5",                         // <-- Reps (kan range zijn: "8-12")
          gewicht: "70 kg",                  // <-- Huidig gewicht
          rust: "3 min",                     // <-- Rusttijd
          progressie: "up" as const,         // <-- up | down | neutral
          aiSuggestie: null as string | null, // <-- AI suggestie tekst of null
        },
        {
          naam: "Barbell Row",
          sets: 4,
          reps: "5",
          gewicht: "65 kg",
          rust: "3 min",
          progressie: "up" as const,
          aiSuggestie: null,
        },
        {
          naam: "Overhead Press",
          sets: 3,
          reps: "8",
          gewicht: "40 kg",
          rust: "2 min",
          progressie: "neutral" as const,
          aiSuggestie: "Overweeg gewicht te verhogen naar 42.5 kg op basis van RPE trends",
        },
        {
          naam: "Lat Pulldown",
          sets: 3,
          reps: "10-12",
          gewicht: "55 kg",
          rust: "90 sec",
          progressie: "up" as const,
          aiSuggestie: null,
        },
        {
          naam: "Dumbbell Curl",
          sets: 3,
          reps: "12",
          gewicht: "14 kg",
          rust: "60 sec",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
      ],
    },
    {
      naam: "Dag 2 - Lower Body (Kracht)",
      status: "voltooid" as const,
      oefeningen: [
        {
          naam: "Squat",
          sets: 4,
          reps: "5",
          gewicht: "90 kg",
          rust: "3 min",
          progressie: "up" as const,
          aiSuggestie: "Uitstekende progressie. Volgende week 92.5 kg proberen.",
        },
        {
          naam: "Romanian Deadlift",
          sets: 3,
          reps: "8",
          gewicht: "70 kg",
          rust: "2 min",
          progressie: "up" as const,
          aiSuggestie: null,
        },
        {
          naam: "Leg Press",
          sets: 3,
          reps: "10-12",
          gewicht: "140 kg",
          rust: "2 min",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
        {
          naam: "Leg Curl",
          sets: 3,
          reps: "12",
          gewicht: "45 kg",
          rust: "60 sec",
          progressie: "up" as const,
          aiSuggestie: null,
        },
        {
          naam: "Calf Raises",
          sets: 4,
          reps: "15",
          gewicht: "80 kg",
          rust: "60 sec",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
      ],
    },
    {
      naam: "Dag 3 - Upper Body (Hypertrofie)",
      status: "gepland" as const,
      oefeningen: [
        {
          naam: "Incline Dumbbell Press",
          sets: 4,
          reps: "8-12",
          gewicht: "28 kg",
          rust: "2 min",
          progressie: "up" as const,
          aiSuggestie: null,
        },
        {
          naam: "Cable Row",
          sets: 4,
          reps: "10-12",
          gewicht: "60 kg",
          rust: "90 sec",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
        {
          naam: "Lateral Raise",
          sets: 3,
          reps: "15",
          gewicht: "10 kg",
          rust: "60 sec",
          progressie: "up" as const,
          aiSuggestie: null,
        },
        {
          naam: "Face Pull",
          sets: 3,
          reps: "15",
          gewicht: "25 kg",
          rust: "60 sec",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
        {
          naam: "Tricep Pushdown",
          sets: 3,
          reps: "12",
          gewicht: "30 kg",
          rust: "60 sec",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
      ],
    },
    {
      naam: "Dag 4 - Lower Body (Hypertrofie)",
      status: "gepland" as const,
      oefeningen: [
        {
          naam: "Front Squat",
          sets: 3,
          reps: "8",
          gewicht: "60 kg",
          rust: "2 min",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
        {
          naam: "Bulgarian Split Squat",
          sets: 3,
          reps: "10",
          gewicht: "20 kg",
          rust: "90 sec",
          progressie: "up" as const,
          aiSuggestie: null,
        },
        {
          naam: "Hip Thrust",
          sets: 4,
          reps: "10",
          gewicht: "80 kg",
          rust: "2 min",
          progressie: "up" as const,
          aiSuggestie: null,
        },
        {
          naam: "Leg Extension",
          sets: 3,
          reps: "12-15",
          gewicht: "50 kg",
          rust: "60 sec",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
        {
          naam: "Seated Calf Raise",
          sets: 4,
          reps: "15",
          gewicht: "40 kg",
          rust: "60 sec",
          progressie: "neutral" as const,
          aiSuggestie: null,
        },
      ],
    },
  ],
}

/** Trainingshistorie — Supabase: client_exercise_logs (gegroepeerd per week) */
const trainingsHistorie = [
  { week: "Week 6", sessies: "3/4", compliance: 75, notitie: "Dag 4 overgeslagen (ziek)" },
  { week: "Week 5", sessies: "4/4", compliance: 100, notitie: "Alle sessies voltooid" },
  { week: "Week 4", sessies: "4/4", compliance: 100, notitie: "PR op squat: 87.5 kg" },
  { week: "Week 3", sessies: "3/4", compliance: 75, notitie: "Dag 2 overgeslagen (vakantie)" },
  { week: "Week 2", sessies: "4/4", compliance: 100, notitie: "" },
  { week: "Week 1", sessies: "4/4", compliance: 100, notitie: "Start programma" },
]

function getStatusIcon(status: string) {
  switch (status) {
    case "voltooid":
      return <Check className="size-3.5 text-success" />
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
      return <span className="size-3.5 text-muted-foreground">-</span>
  }
}

export function TrainingTab() {
  const [openDag, setOpenDag] = useState<number>(0)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Schema header */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-semibold text-foreground">{trainingsSchema.programmaNaam}</h3>
              <p className="text-xs text-muted-foreground">
                {trainingsSchema.type} &mdash; {trainingsSchema.frequentie} &mdash; {trainingsSchema.weken}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[11px] gap-1 border-primary/30 text-primary">
                <Sparkles className="size-3" />
                2 AI suggesties
              </Badge>
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-border">
                <Copy className="size-3" />
                Dupliceer schema
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-border">
                <RotateCcw className="size-3" />
                Vorig schema
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trainingsdagen als accordion */}
      <div className="flex flex-col gap-3">
        {trainingsSchema.dagen.map((dag, dagIndex) => (
          <Card key={dagIndex} className="border-border overflow-hidden">
            <button
              onClick={() => setOpenDag(openDag === dagIndex ? -1 : dagIndex)}
              className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(dag.status)}
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">{dag.naam}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {dag.oefeningen.length} oefeningen
                    {dag.oefeningen.some(o => o.aiSuggestie) && (
                      <span className="ml-2 text-primary">
                        &mdash; AI suggestie beschikbaar
                      </span>
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
                    dag.status === "voltooid"
                      ? "border-success/30 text-success"
                      : dag.status === "gepland"
                        ? "border-border text-muted-foreground"
                        : "border-destructive/30 text-destructive"
                  }`}
                >
                  {dag.status === "voltooid" ? "Voltooid" : dag.status === "gepland" ? "Gepland" : "Overgeslagen"}
                </Badge>
                {openDag === dagIndex ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {openDag === dagIndex && (
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
                    {dag.oefeningen.map((oefening, i) => (
                      <TableRow key={i} className={oefening.aiSuggestie ? "bg-primary/[0.03]" : ""}>
                        <TableCell className="py-3">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-foreground">{oefening.naam}</span>
                              {oefening.aiSuggestie && (
                                <Sparkles className="size-3 text-primary" />
                              )}
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

      {/* Trainingshistorie */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Dumbbell className="size-4 text-primary" />
            Trainingshistorie
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold">Week</TableHead>
                <TableHead className="text-[11px] font-semibold text-center">Sessies</TableHead>
                <TableHead className="text-[11px] font-semibold text-center">Compliance</TableHead>
                <TableHead className="text-[11px] font-semibold">Notitie</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainingsHistorie.map((week, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm font-medium text-foreground">{week.week}</TableCell>
                  <TableCell className="text-center text-sm text-foreground">{week.sessies}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        week.compliance === 100 ? "border-success/30 text-success" : "border-warning/30 text-warning-foreground"
                      }`}
                    >
                      {week.compliance}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{week.notitie || "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
