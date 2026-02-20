"use client"

import { useState } from "react"
import {
  Plus,
  Copy,
  MoreHorizontal,
  Clock,
  Users,
  Dumbbell,
  Flame,
  Target,
  Zap,
  Heart,
  ArrowLeft,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  Check,
  Sparkles,
  Play,
  Upload,
  Search,
  GripVertical,
  Image as ImageIcon,
  FileVideo,
  X,
  Loader2,
  Send,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte programma's uit Supabase
//
// COACH-SCOPED DATA:
//   De coach ziet ALLEEN programma's die hij/zij zelf heeft aangemaakt.
//   Filter: WHERE programs.coach_id = auth.uid()
//   Clienten-count per programma: alleen eigen clienten (client_programs via JOIN)
//
// Supabase tabellen (gefilterd op coach_id):
//   - programs (id, naam, beschrijving, categorie, duur_weken, sessies_per_week, status, banner_url, coach_id, created_at)
//   - program_blocks (id, program_id, naam, kleur, volgorde, aantal_weken)
//   - block_weeks (id, block_id, week_nummer)
//   - week_workouts (id, week_id, naam, dag, volgorde)
//   - workout_exercises (id, workout_id, exercise_id, sets, reps, intensiteit_type, intensiteit_waarde, rust, notities, volgorde)
//   - exercises (id, naam, spiergroep, categorie, instructies, video_url, thumbnail_url)
//   - client_programs (program_id, client_id — client count gefilterd op coach's eigen clienten)
//   - ai_generated_programs (prompt, result_json, coach_id = auth.uid())
//
// RLS Policies:
//   programs: SELECT/INSERT/UPDATE/DELETE WHERE coach_id = auth.uid()
//   program_blocks/weeks/workouts: via JOIN programs WHERE coach_id = auth.uid()
//   exercises: gedeelde tabel, iedereen kan lezen (geen coach filter)
//
// Supabase Storage buckets:
//   - "program-banners" (banner afbeeldingen per programma, path: program-banners/{program_id}.jpg)
//     Banner upload flow: coach selecteert afbeelding -> upload naar Supabase Storage -> update programs.banner_url
//     Banners worden ook getoond in de client-app bij het trainingsoverzicht.
//   - "exercise-videos" (oefening instructie-video's, path: exercise-videos/{exercise_id}.mp4)
//     Video's worden gelinkt aan exercises.video_url en getoond bij oefeningen in de app.
//
// Intensiteit-types per oefening:
//   - RPE (Rate of Perceived Exertion, 1-10) — autoregulatie, gevorderden
//   - RIR (Reps in Reserve, 0-5) — hypertrofie, duidelijker voor beginners
//   - Gewicht (absoluut, bijv. "70 kg") — vast gewicht voorschrijven
//   - %1RM (percentage van 1 rep max) — periodisering, kracht
//
// AI-generatie: alleen coaches, niet clienten. Via Supabase Edge Function.
// ============================================================================

// --- Types -------------------------------------------------------------------

type IntensiteitType = "RPE" | "RIR" | "Gewicht" | "%1RM"

interface Oefening {
  id: string                        // <-- workout_exercises.id (UUID)
  naam: string                      // <-- exercises.naam (bijv. "Bench Press")
  spiergroep: string                // <-- exercises.spiergroep (bijv. "Borst")
  sets: number                      // <-- workout_exercises.sets
  reps: string                      // <-- workout_exercises.reps (bijv. "5" of "8-12")
  intensiteitType: IntensiteitType  // <-- workout_exercises.intensiteit_type
  intensiteitWaarde: string         // <-- workout_exercises.intensiteit_waarde (bijv. "8", "2", "70 kg", "80%")
  rust: string                      // <-- workout_exercises.rust (bijv. "3 min")
  notities: string                  // <-- workout_exercises.notities
  videoUrl: string | null           // <-- exercises.video_url (YouTube/Vimeo URL of Supabase Storage URL)
}

interface Training {
  id: string                        // <-- week_workouts.id (UUID)
  naam: string                      // <-- week_workouts.naam (bijv. "Upper Kracht")
  dag: string                       // <-- week_workouts.dag (bijv. "Maandag")
  oefeningen: Oefening[]
}

interface Week {
  id: string                        // <-- block_weeks.id (UUID)
  weekNummer: number                // <-- block_weeks.week_nummer
  trainingen: Training[]
}

interface Blok {
  id: string                        // <-- program_blocks.id (UUID)
  naam: string                      // <-- program_blocks.naam (bijv. "Opbouw")
  kleur: string                     // <-- program_blocks.kleur (Tailwind class)
  weken: Week[]
}

interface Programma {
  id: string                        // <-- programs.id (UUID)
  naam: string                      // <-- programs.naam
  beschrijving: string              // <-- programs.beschrijving
  categorie: "kracht" | "afvallen" | "uithoudingsvermogen" | "wellness"
  duurWeken: number                 // <-- programs.duur_weken
  sessiesPerWeek: number            // <-- programs.sessies_per_week
  status: "actief" | "concept"      // <-- programs.status
  bannerKleur: string               // <-- Gradient fallback
  bannerUrl: string | null          // <-- programs.banner_url (Supabase Storage)
  clienten: number                  // <-- COUNT(client_programs) WHERE program_id = ...
  blokken: Blok[]
}

/** Oefeningen-bibliotheek — Supabase: exercises */
const oefeningenBibliotheek: Array<{
  id: string             // <-- exercises.id
  naam: string           // <-- exercises.naam
  spiergroep: string     // <-- exercises.spiergroep
  categorie: string      // <-- exercises.categorie (compound | isolatie | cardio | mobiliteit)
  videoUrl: string | null // <-- exercises.video_url
}> = [
  { id: "ex_001", naam: "Bench Press", spiergroep: "Borst", categorie: "compound", videoUrl: "https://youtube.com/example" },
  { id: "ex_002", naam: "Squat", spiergroep: "Benen", categorie: "compound", videoUrl: "https://youtube.com/example" },
  { id: "ex_003", naam: "Deadlift", spiergroep: "Rug", categorie: "compound", videoUrl: "https://youtube.com/example" },
  { id: "ex_004", naam: "Overhead Press", spiergroep: "Schouders", categorie: "compound", videoUrl: null },
  { id: "ex_005", naam: "Barbell Row", spiergroep: "Rug", categorie: "compound", videoUrl: "https://youtube.com/example" },
  { id: "ex_006", naam: "Romanian Deadlift", spiergroep: "Hamstrings", categorie: "compound", videoUrl: null },
  { id: "ex_007", naam: "Lat Pulldown", spiergroep: "Rug", categorie: "compound", videoUrl: "https://youtube.com/example" },
  { id: "ex_008", naam: "Leg Press", spiergroep: "Benen", categorie: "compound", videoUrl: null },
  { id: "ex_009", naam: "Dumbbell Curl", spiergroep: "Biceps", categorie: "isolatie", videoUrl: null },
  { id: "ex_010", naam: "Tricep Pushdown", spiergroep: "Triceps", categorie: "isolatie", videoUrl: null },
  { id: "ex_011", naam: "Lateral Raise", spiergroep: "Schouders", categorie: "isolatie", videoUrl: null },
  { id: "ex_012", naam: "Face Pull", spiergroep: "Schouders", categorie: "isolatie", videoUrl: "https://youtube.com/example" },
  { id: "ex_013", naam: "Leg Curl", spiergroep: "Hamstrings", categorie: "isolatie", videoUrl: null },
  { id: "ex_014", naam: "Calf Raises", spiergroep: "Kuiten", categorie: "isolatie", videoUrl: null },
  { id: "ex_015", naam: "Hip Thrust", spiergroep: "Billen", categorie: "compound", videoUrl: "https://youtube.com/example" },
  { id: "ex_016", naam: "Incline DB Press", spiergroep: "Borst", categorie: "compound", videoUrl: null },
  { id: "ex_017", naam: "Cable Row", spiergroep: "Rug", categorie: "compound", videoUrl: null },
  { id: "ex_018", naam: "Bulgarian Split Squat", spiergroep: "Benen", categorie: "compound", videoUrl: "https://youtube.com/example" },
  { id: "ex_019", naam: "Front Squat", spiergroep: "Benen", categorie: "compound", videoUrl: null },
  { id: "ex_020", naam: "Plank", spiergroep: "Core", categorie: "isolatie", videoUrl: null },
]

// --- Placeholder programma's ------------------------------------------------

const programmasData: Programma[] = [
  {
    id: "prog_001",
    naam: "Kracht Fase 2",
    beschrijving: "Progressief overbelastingsprogramma gericht op samengestelde oefeningen. Opgebouwd in 3 blokken met toenemende intensiteit.",
    categorie: "kracht",
    duurWeken: 12,
    sessiesPerWeek: 4,
    status: "actief",
    bannerKleur: "from-primary to-primary/70",
    bannerUrl: null,
    clienten: 12,
    blokken: [
      {
        id: "blok_001", naam: "Opbouw", kleur: "bg-chart-2",
        weken: [
          { id: "w1", weekNummer: 1, trainingen: [
            { id: "t1", naam: "Upper Kracht", dag: "Maandag", oefeningen: [
              { id: "oe1", naam: "Bench Press", spiergroep: "Borst", sets: 4, reps: "5", intensiteitType: "RPE", intensiteitWaarde: "7", rust: "3 min", notities: "", videoUrl: "https://youtube.com/example" },
              { id: "oe2", naam: "Barbell Row", spiergroep: "Rug", sets: 4, reps: "5", intensiteitType: "RPE", intensiteitWaarde: "7", rust: "3 min", notities: "", videoUrl: "https://youtube.com/example" },
              { id: "oe3", naam: "Overhead Press", spiergroep: "Schouders", sets: 3, reps: "8", intensiteitType: "RIR", intensiteitWaarde: "3", rust: "2 min", notities: "", videoUrl: null },
              { id: "oe4", naam: "Lat Pulldown", spiergroep: "Rug", sets: 3, reps: "10-12", intensiteitType: "RIR", intensiteitWaarde: "2", rust: "90 sec", notities: "", videoUrl: "https://youtube.com/example" },
            ]},
            { id: "t2", naam: "Lower Kracht", dag: "Dinsdag", oefeningen: [
              { id: "oe5", naam: "Squat", spiergroep: "Benen", sets: 4, reps: "5", intensiteitType: "RPE", intensiteitWaarde: "7", rust: "3 min", notities: "Diepte bewaken", videoUrl: "https://youtube.com/example" },
              { id: "oe6", naam: "Romanian Deadlift", spiergroep: "Hamstrings", sets: 3, reps: "8", intensiteitType: "RIR", intensiteitWaarde: "3", rust: "2 min", notities: "", videoUrl: null },
              { id: "oe7", naam: "Leg Press", spiergroep: "Benen", sets: 3, reps: "10-12", intensiteitType: "RIR", intensiteitWaarde: "2", rust: "2 min", notities: "", videoUrl: null },
              { id: "oe8", naam: "Calf Raises", spiergroep: "Kuiten", sets: 4, reps: "15", intensiteitType: "Gewicht", intensiteitWaarde: "60 kg", rust: "60 sec", notities: "", videoUrl: null },
            ]},
            { id: "t3", naam: "Upper Hypertrofie", dag: "Donderdag", oefeningen: [
              { id: "oe9", naam: "Incline DB Press", spiergroep: "Borst", sets: 4, reps: "8-12", intensiteitType: "RIR", intensiteitWaarde: "2", rust: "2 min", notities: "", videoUrl: null },
              { id: "oe10", naam: "Cable Row", spiergroep: "Rug", sets: 4, reps: "10-12", intensiteitType: "RIR", intensiteitWaarde: "2", rust: "90 sec", notities: "", videoUrl: null },
              { id: "oe11", naam: "Lateral Raise", spiergroep: "Schouders", sets: 3, reps: "15", intensiteitType: "RIR", intensiteitWaarde: "1", rust: "60 sec", notities: "", videoUrl: null },
              { id: "oe12", naam: "Face Pull", spiergroep: "Schouders", sets: 3, reps: "15", intensiteitType: "RIR", intensiteitWaarde: "1", rust: "60 sec", notities: "", videoUrl: "https://youtube.com/example" },
            ]},
            { id: "t4", naam: "Lower Hypertrofie", dag: "Vrijdag", oefeningen: [
              { id: "oe13", naam: "Front Squat", spiergroep: "Benen", sets: 3, reps: "8", intensiteitType: "%1RM", intensiteitWaarde: "65%", rust: "2 min", notities: "", videoUrl: null },
              { id: "oe14", naam: "Bulgarian Split Squat", spiergroep: "Benen", sets: 3, reps: "10", intensiteitType: "RIR", intensiteitWaarde: "2", rust: "90 sec", notities: "", videoUrl: "https://youtube.com/example" },
              { id: "oe15", naam: "Hip Thrust", spiergroep: "Billen", sets: 4, reps: "10", intensiteitType: "RIR", intensiteitWaarde: "2", rust: "2 min", notities: "", videoUrl: "https://youtube.com/example" },
              { id: "oe16", naam: "Leg Curl", spiergroep: "Hamstrings", sets: 3, reps: "12", intensiteitType: "RIR", intensiteitWaarde: "1", rust: "60 sec", notities: "", videoUrl: null },
            ]},
          ]},
          { id: "w2", weekNummer: 2, trainingen: [] },
          { id: "w3", weekNummer: 3, trainingen: [] },
          { id: "w4", weekNummer: 4, trainingen: [] },
        ],
      },
      {
        id: "blok_002", naam: "Intensificatie", kleur: "bg-primary",
        weken: [
          { id: "w5", weekNummer: 5, trainingen: [] },
          { id: "w6", weekNummer: 6, trainingen: [] },
          { id: "w7", weekNummer: 7, trainingen: [] },
          { id: "w8", weekNummer: 8, trainingen: [] },
        ],
      },
      {
        id: "blok_003", naam: "Piek & Taper", kleur: "bg-chart-3",
        weken: [
          { id: "w9", weekNummer: 9, trainingen: [] },
          { id: "w10", weekNummer: 10, trainingen: [] },
          { id: "w11", weekNummer: 11, trainingen: [] },
          { id: "w12", weekNummer: 12, trainingen: [] },
        ],
      },
    ],
  },
  {
    id: "prog_002",
    naam: "Afvallen 12 weken",
    beschrijving: "HIIT en weerstandstraining met calorieendeficit protocollen. Combinatie van krachttraining en cardio.",
    categorie: "afvallen",
    duurWeken: 12,
    sessiesPerWeek: 5,
    status: "actief",
    bannerKleur: "from-chart-5 to-chart-5/70",
    bannerUrl: null,
    clienten: 18,
    blokken: [
      { id: "blok_010", naam: "Basis", kleur: "bg-chart-5", weken: [
        { id: "w20", weekNummer: 1, trainingen: [] },
        { id: "w21", weekNummer: 2, trainingen: [] },
        { id: "w22", weekNummer: 3, trainingen: [] },
        { id: "w23", weekNummer: 4, trainingen: [] },
      ]},
      { id: "blok_011", naam: "Intensificatie", kleur: "bg-chart-4", weken: [
        { id: "w24", weekNummer: 5, trainingen: [] },
        { id: "w25", weekNummer: 6, trainingen: [] },
        { id: "w26", weekNummer: 7, trainingen: [] },
        { id: "w27", weekNummer: 8, trainingen: [] },
      ]},
      { id: "blok_012", naam: "Finisher", kleur: "bg-destructive", weken: [
        { id: "w28", weekNummer: 9, trainingen: [] },
        { id: "w29", weekNummer: 10, trainingen: [] },
        { id: "w30", weekNummer: 11, trainingen: [] },
        { id: "w31", weekNummer: 12, trainingen: [] },
      ]},
    ],
  },
  {
    id: "prog_003",
    naam: "Wedstrijd Prep",
    beschrijving: "Gevorderd bodybuilding prep met periodisering en peak week. Voor ervaren atleten.",
    categorie: "kracht",
    duurWeken: 16,
    sessiesPerWeek: 6,
    status: "actief",
    bannerKleur: "from-chart-3 to-chart-3/70",
    bannerUrl: null,
    clienten: 3,
    blokken: [],
  },
  {
    id: "prog_004",
    naam: "Marathon Prep",
    beschrijving: "Opbouw van uithoudingsvermogen met progressieve kilometers. Inclusief krachtwerk.",
    categorie: "uithoudingsvermogen",
    duurWeken: 20,
    sessiesPerWeek: 5,
    status: "actief",
    bannerKleur: "from-chart-4 to-chart-4/70",
    bannerUrl: null,
    clienten: 8,
    blokken: [],
  },
  {
    id: "prog_005",
    naam: "Wellness & Mobiliteit",
    beschrijving: "Flexibiliteit, mobiliteit en stressmanagement routines voor dagelijks welzijn.",
    categorie: "wellness",
    duurWeken: 0,
    sessiesPerWeek: 3,
    status: "actief",
    bannerKleur: "from-chart-2 to-chart-2/70",
    bannerUrl: null,
    clienten: 6,
    blokken: [],
  },
  {
    id: "prog_006",
    naam: "Spiermassa Basis",
    beschrijving: "Beginners hypertrofie programma met progressieve volume-opbouw over 10 weken.",
    categorie: "kracht",
    duurWeken: 10,
    sessiesPerWeek: 4,
    status: "actief",
    bannerKleur: "from-primary to-chart-3",
    bannerUrl: null,
    clienten: 14,
    blokken: [],
  },
  {
    id: "prog_007",
    naam: "Postnataal Herstel",
    beschrijving: "Zacht herstelprogramma voor nieuwe moeders. Focus op bekkenbodem en core.",
    categorie: "wellness",
    duurWeken: 12,
    sessiesPerWeek: 3,
    status: "concept",
    bannerKleur: "from-chart-2 to-chart-4/70",
    bannerUrl: null,
    clienten: 0,
    blokken: [],
  },
  {
    id: "prog_008",
    naam: "HIIT Express",
    beschrijving: "Korte, intense workouts voor drukke professionals. 30 minuten per sessie.",
    categorie: "afvallen",
    duurWeken: 6,
    sessiesPerWeek: 4,
    status: "concept",
    bannerKleur: "from-chart-5 to-destructive/70",
    bannerUrl: null,
    clienten: 0,
    blokken: [],
  },
]

const categorieIcons: Record<string, typeof Dumbbell> = {
  kracht: Dumbbell,
  afvallen: Flame,
  uithoudingsvermogen: Zap,
  wellness: Heart,
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ProgramsSection() {
  const [weergave, setWeergave] = useState<"overzicht" | "detail" | "aanmaken">("overzicht")
  const [geselecteerdProgrammaId, setGeselecteerdProgrammaId] = useState<string | null>(null)
  const [aanmaakTab, setAanmaakTab] = useState<"handmatig" | "ai">("handmatig")

  const geselecteerdProgramma = programmasData.find(p => p.id === geselecteerdProgrammaId)

  function openDetail(id: string) {
    setGeselecteerdProgrammaId(id)
    setWeergave("detail")
  }

  function openAanmaken() {
    setWeergave("aanmaken")
    setAanmaakTab("handmatig")
  }

  function terugNaarOverzicht() {
    setWeergave("overzicht")
    setGeselecteerdProgrammaId(null)
  }

  if (weergave === "detail" && geselecteerdProgramma) {
    return <ProgrammaDetail programma={geselecteerdProgramma} onTerug={terugNaarOverzicht} />
  }

  if (weergave === "aanmaken") {
    return <ProgrammaAanmaken tab={aanmaakTab} onTabChange={setAanmaakTab} onTerug={terugNaarOverzicht} />
  }

  return <ProgrammaOverzicht onOpenDetail={openDetail} onAanmaken={openAanmaken} />
}

// ============================================================================
// LAAG 1: PROGRAMMA-OVERZICHT
// ============================================================================

function ProgrammaOverzicht({ onOpenDetail, onAanmaken }: {
  onOpenDetail: (id: string) => void
  onAanmaken: () => void
}) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{"Programma's"}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{"Maak en beheer trainingsprogramma's voor je clienten"}</p>
        </div>
        <Button onClick={onAanmaken} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Programma aanmaken
        </Button>
      </div>

      <Tabs defaultValue="alle">
        <TabsList>
          <TabsTrigger value="alle">Alle ({programmasData.length})</TabsTrigger>
          <TabsTrigger value="actief">Actief ({programmasData.filter(p => p.status === "actief").length})</TabsTrigger>
          <TabsTrigger value="concept">Concepten ({programmasData.filter(p => p.status === "concept").length})</TabsTrigger>
        </TabsList>

        {["alle", "actief", "concept"].map((filter) => (
          <TabsContent key={filter} value={filter} className="mt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {programmasData
                .filter(p => filter === "alle" || p.status === filter)
                .map((programma) => (
                  <ProgrammaKaart key={programma.id} programma={programma} onKlik={() => onOpenDetail(programma.id)} />
                ))
              }
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function ProgrammaKaart({ programma, onKlik }: { programma: Programma; onKlik: () => void }) {
  const Icon = categorieIcons[programma.categorie] || Dumbbell

  return (
    <Card
      className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group overflow-hidden p-0 gap-0"
      onClick={onKlik}
    >
      {/* Banner */}
      <div className={cn("h-20 bg-gradient-to-r relative", programma.bannerKleur)}>
        {programma.bannerUrl && (
          <img src={programma.bannerUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="size-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white drop-shadow-sm">{programma.naam}</p>
          </div>
        </div>
        {programma.status === "concept" && (
          <Badge className="absolute top-3 right-3 bg-white/20 backdrop-blur-sm text-white text-[10px] border-0">
            Concept
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{programma.beschrijving}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {programma.duurWeken > 0 ? `${programma.duurWeken} weken` : "Doorlopend"}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {programma.clienten} clienten
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="size-3.5" />
            {programma.sessiesPerWeek}x/week
          </div>
        </div>

        {programma.blokken.length > 0 && (
          <div className="mt-3 flex gap-1">
            {programma.blokken.map((blok) => (
              <div
                key={blok.id}
                className={cn("h-1.5 rounded-full", blok.kleur)}
                style={{ flex: blok.weken.length }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// LAAG 2: PROGRAMMA DETAIL & BEWERKEN
// Twee-koloms layout: links programma info (banner, naam, beschrijving, stats),
// rechts blokken/fases met workouts. Banner is een echte afbeelding (Supabase Storage).
// ============================================================================

function ProgrammaDetail({ programma, onTerug }: { programma: Programma; onTerug: () => void }) {
  // Bewerkbare velden
  const [naam, setNaam] = useState(programma.naam)
  const [beschrijving, setBeschrijving] = useState(programma.beschrijving)
  const [bannerUrl, setBannerUrl] = useState(programma.bannerUrl)

  // Blokken state
  const [openBlokId, setOpenBlokId] = useState<string | null>(programma.blokken[0]?.id ?? null)
  const [openTrainingId, setOpenTrainingId] = useState<string | null>(null)
  const [oefeningDialogOpen, setOefeningDialogOpen] = useState(false)
  const [zoekOefening, setZoekOefening] = useState("")

  const totaalWorkouts = programma.blokken.reduce(
    (sum, blok) => sum + blok.weken.reduce((wSum, w) => wSum + w.trainingen.length, 0), 0
  )

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={onTerug}
          >
            <ArrowLeft className="size-4" />
            Terug
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground">{naam}</h2>
            <p className="text-xs text-muted-foreground">Programma bewerken</p>
          </div>
        </div>
        <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
          <Check className="size-3.5" />
          Opslaan
        </Button>
      </div>

      {/* Twee-koloms layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* LINKER KOLOM: Programma Info */}
        <div className="flex flex-col gap-5">
          <Card className="border-border p-0 gap-0 overflow-hidden">
            <CardContent className="p-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Programma Info</h3>

              {/* Banner afbeelding — Supabase Storage: program-banners/{program_id}.jpg */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Banner</label>
                <div className="relative rounded-lg overflow-hidden bg-secondary aspect-[16/9]">
                  {bannerUrl ? (
                    <img
                      src={bannerUrl}
                      alt={`Banner voor ${naam}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={cn("w-full h-full bg-gradient-to-r", programma.bannerKleur)} />
                  )}
                  <div className="absolute inset-0 bg-black/5" />
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border w-full mt-1">
                  <Upload className="size-3.5" />
                  Wijzig banner
                </Button>
              </div>

              {/* Naam */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Naam</label>
                <Input
                  value={naam}
                  onChange={(e) => setNaam(e.target.value)}
                  className="text-sm"
                />
              </div>

              {/* Beschrijving */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Beschrijving</label>
                <Textarea
                  value={beschrijving}
                  onChange={(e) => setBeschrijving(e.target.value)}
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>

              {/* Categorie */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Categorie</label>
                <Select defaultValue={programma.categorie}>
                  <SelectTrigger className="text-sm h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kracht">Kracht</SelectItem>
                    <SelectItem value="afvallen">Afvallen</SelectItem>
                    <SelectItem value="uithoudingsvermogen">Uithoudingsvermogen</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="border-t border-border pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Blokken</span>
                  <span className="font-medium text-foreground">{programma.blokken.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Totaal weken</span>
                  <span className="font-medium text-foreground">{programma.duurWeken}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Totaal workouts</span>
                  <span className="font-medium text-foreground">{totaalWorkouts}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Clienten</span>
                  <span className="font-medium text-foreground">{programma.clienten}</span>
                </div>
              </div>

              {/* Meer acties */}
              <div className="border-t border-border pt-3 flex flex-col gap-1.5">
                <Button variant="ghost" size="sm" className="justify-start h-8 text-xs gap-2 text-muted-foreground hover:text-foreground">
                  <Copy className="size-3.5" />
                  Programma dupliceren
                </Button>
                <Button variant="ghost" size="sm" className="justify-start h-8 text-xs gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" />
                  Programma verwijderen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RECHTER KOLOM: Blokken / Fases */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Blokken / Fases</h3>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
              <Plus className="size-3.5" />
              Blok Toevoegen
            </Button>
          </div>

          {programma.blokken.length > 0 ? (
            <div className="flex flex-col gap-4">
              {programma.blokken.map((blok, blokIndex) => (
                <BlokCard
                  key={blok.id}
                  blok={blok}
                  blokIndex={blokIndex}
                  isOpen={openBlokId === blok.id}
                  onToggle={() => setOpenBlokId(openBlokId === blok.id ? null : blok.id)}
                  openTrainingId={openTrainingId}
                  onToggleTraining={(id) => setOpenTrainingId(openTrainingId === id ? null : id)}
                  onOpenOefeningDialog={() => setOefeningDialogOpen(true)}
                />
              ))}
            </div>
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <Target className="size-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">Nog geen blokken</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Verdeel dit programma in blokken (bijv. Opbouw, Intensificatie, Peak) en voeg per blok weken en trainingen toe.
                </p>
                <Button size="sm" className="mt-4 h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Plus className="size-3.5" />
                  Eerste blok toevoegen
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Oefening selectie dialog */}
      <OefeningSelectieDialog
        open={oefeningDialogOpen}
        onOpenChange={setOefeningDialogOpen}
        zoek={zoekOefening}
        onZoekChange={setZoekOefening}
      />
    </div>
  )
}

// --- Blok Card (uitklapbaar, bevat workouts) --------------------------------

function BlokCard({ blok, blokIndex, isOpen, onToggle, openTrainingId, onToggleTraining, onOpenOefeningDialog }: {
  blok: Blok
  blokIndex: number
  isOpen: boolean
  onToggle: () => void
  openTrainingId: string | null
  onToggleTraining: (id: string) => void
  onOpenOefeningDialog: () => void
}) {
  const totaalWorkouts = blok.weken.reduce((sum, w) => sum + w.trainingen.length, 0)

  return (
    <Card className={cn("border-border overflow-hidden", isOpen && "ring-1 ring-primary/20")}>
      {/* Blok header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GripVertical className="size-4 text-muted-foreground/50" />
          <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
            {blokIndex + 1}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">{blok.naam}</p>
          </div>
          <span className="text-xs text-muted-foreground">{blok.weken.length} weken &middot; {totaalWorkouts} workouts</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => { e.stopPropagation() }}
          >
            <Trash2 className="size-3.5" />
          </Button>
          {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {/* Blok inhoud (uitklapbaar) */}
      {isOpen && (
        <div className="border-t border-border p-5 flex flex-col gap-5">
          {/* Blok metadata velden */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Bloknaam</label>
              <Input defaultValue={blok.naam} className="text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Duur (weken)</label>
              <Input type="number" defaultValue={blok.weken.length} min={1} max={12} className="text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Beschrijving</label>
            <Textarea
              placeholder="Beschrijf het doel van dit blok..."
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          {/* Workouts in dit blok */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Workouts</label>
              <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 border-border">
                <Plus className="size-3" />
                Workout toevoegen
              </Button>
            </div>

            {blok.weken.flatMap(w => w.trainingen).length > 0 ? (
              blok.weken.flatMap(w => w.trainingen).map((training) => (
                <TrainingCard
                  key={training.id}
                  training={training}
                  isOpen={openTrainingId === training.id}
                  onToggle={() => onToggleTraining(training.id)}
                  onOpenOefeningDialog={onOpenOefeningDialog}
                />
              ))
            ) : (
              <div className="flex items-center gap-3 px-3 py-3 rounded-lg border border-dashed border-border bg-secondary/20">
                <Dumbbell className="size-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Nog geen workouts. Voeg een workout toe om te beginnen.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  )
}

// --- Training Card -----------------------------------------------------------

function TrainingCard({ training, isOpen, onToggle, onOpenOefeningDialog }: {
  training: Training
  isOpen: boolean
  onToggle: () => void
  onOpenOefeningDialog: () => void
}) {
  return (
    <Card className="border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary/10">
            <Dumbbell className="size-4 text-primary" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-foreground">{training.naam}</p>
            <p className="text-[11px] text-muted-foreground">{training.dag} &middot; {training.oefeningen.length} oefeningen</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                <MoreHorizontal className="size-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit3 className="mr-2 size-3.5" />Hernoemen</DropdownMenuItem>
              <DropdownMenuItem><Copy className="mr-2 size-3.5" />Dupliceren</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 size-3.5" />Verwijderen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-border">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10 text-[10px]">#</TableHead>
                  <TableHead className="text-[10px] min-w-[160px]">Oefening</TableHead>
                  <TableHead className="text-[10px] w-16">Sets</TableHead>
                  <TableHead className="text-[10px] w-20">Reps</TableHead>
                  <TableHead className="text-[10px] w-28">Intensiteit</TableHead>
                  <TableHead className="text-[10px] w-20">Rust</TableHead>
                  <TableHead className="text-[10px] min-w-[120px]">Notities</TableHead>
                  <TableHead className="text-[10px] w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {training.oefeningen.map((oef, index) => (
                  <TableRow key={oef.id} className="group/row">
                    <TableCell className="text-xs text-muted-foreground py-2">{index + 1}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-xs font-medium text-foreground">{oef.naam}</p>
                          <p className="text-[10px] text-muted-foreground">{oef.spiergroep}</p>
                        </div>
                        {oef.videoUrl && (
                          <button className="opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <Play className="size-3.5 text-primary" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        defaultValue={oef.sets}
                        className="h-7 w-12 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        defaultValue={oef.reps}
                        className="h-7 w-16 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        <Select defaultValue={oef.intensiteitType}>
                          <SelectTrigger className="h-7 w-16 text-[10px] border-transparent hover:border-border bg-transparent px-1.5 [&>svg]:size-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RPE" className="text-xs">RPE</SelectItem>
                            <SelectItem value="RIR" className="text-xs">RIR</SelectItem>
                            <SelectItem value="Gewicht" className="text-xs">Gewicht</SelectItem>
                            <SelectItem value="%1RM" className="text-xs">%1RM</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          defaultValue={oef.intensiteitWaarde}
                          className="h-7 w-14 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        defaultValue={oef.rust}
                        className="h-7 w-16 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <Input
                        defaultValue={oef.notities}
                        placeholder="..."
                        className="h-7 text-xs border-transparent hover:border-border focus:border-primary bg-transparent"
                      />
                    </TableCell>
                    <TableCell className="py-2">
                      <Button variant="ghost" size="icon" className="size-6 text-muted-foreground opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <Trash2 className="size-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Oefening toevoegen */}
          <div className="p-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1"
              onClick={onOpenOefeningDialog}
            >
              <Plus className="size-3" />
              Oefening toevoegen
            </Button>
          </div>
        </div>
      )}
    </Card>
  )
}

// --- Oefening Selectie Dialog ------------------------------------------------

function OefeningSelectieDialog({ open, onOpenChange, zoek, onZoekChange }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  zoek: string
  onZoekChange: (value: string) => void
}) {
  const gefilterdeOefeningen = oefeningenBibliotheek.filter(o =>
    o.naam.toLowerCase().includes(zoek.toLowerCase()) ||
    o.spiergroep.toLowerCase().includes(zoek.toLowerCase())
  )

  const spiergroepen = [...new Set(oefeningenBibliotheek.map(o => o.spiergroep))]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Oefening selecteren</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Zoek op naam of spiergroep..."
              value={zoek}
              onChange={(e) => onZoekChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-72">
            <div className="flex flex-col gap-0.5">
              {gefilterdeOefeningen.map((oef) => (
                <button
                  key={oef.id}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-secondary/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-md bg-secondary flex items-center justify-center">
                      <Dumbbell className="size-3.5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{oef.naam}</p>
                      <p className="text-[10px] text-muted-foreground">{oef.spiergroep} &middot; {oef.categorie}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {oef.videoUrl && (
                      <Badge variant="outline" className="text-[9px] gap-1 border-primary/20 text-primary">
                        <Play className="size-2.5" />Video
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          {/* Nieuwe oefening */}
          <div className="border-t border-border pt-3">
            <Button variant="outline" size="sm" className="w-full h-8 text-xs gap-1.5 border-dashed">
              <Plus className="size-3.5" />
              Nieuwe oefening aanmaken
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// LAAG 3: PROGRAMMA AANMAKEN
// ============================================================================

function ProgrammaAanmaken({ tab, onTabChange, onTerug }: {
  tab: "handmatig" | "ai"
  onTabChange: (tab: "handmatig" | "ai") => void
  onTerug: () => void
}) {
  // Handmatig aanmaken state
  const [stap, setStap] = useState(1)
  const [naam, setNaam] = useState("")
  const [beschrijving, setBeschrijving] = useState("")
  const [categorie, setCategorie] = useState<string>("")
  const [sessiesPerWeek, setSessiesPerWeek] = useState("4")
  const [aantalBlokken, setAantalBlokken] = useState<Array<{ naam: string; weken: string }>>([
    { naam: "Opbouw", weken: "4" },
  ])

  // AI state
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResultaat, setAiResultaat] = useState(false)

  function voegBlokToe() {
    setAantalBlokken([...aantalBlokken, { naam: "", weken: "4" }])
  }

  function verwijderBlok(index: number) {
    setAantalBlokken(aantalBlokken.filter((_, i) => i !== index))
  }

  function simuleerAi() {
    setAiLoading(true)
    setTimeout(() => {
      setAiLoading(false)
      setAiResultaat(true)
    }, 2000)
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-foreground"
          onClick={onTerug}
        >
          <ArrowLeft className="size-4" />
          <span className="sr-only">Terug</span>
        </Button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Programma aanmaken</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Maak handmatig of laat AI een programma genereren</p>
        </div>
      </div>

      {/* Toggle handmatig / AI */}
      <div className="flex gap-2">
        <button
          onClick={() => onTabChange("handmatig")}
          className={cn(
            "flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
            tab === "handmatig"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/30"
          )}
        >
          <div className={cn(
            "size-10 rounded-lg flex items-center justify-center",
            tab === "handmatig" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}>
            <Edit3 className="size-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">Handmatig aanmaken</p>
            <p className="text-[11px] text-muted-foreground">Stap voor stap zelf opbouwen</p>
          </div>
        </button>
        <button
          onClick={() => onTabChange("ai")}
          className={cn(
            "flex-1 flex items-center gap-3 p-4 rounded-lg border-2 transition-all",
            tab === "ai"
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/30"
          )}
        >
          <div className={cn(
            "size-10 rounded-lg flex items-center justify-center",
            tab === "ai" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          )}>
            <Sparkles className="size-4" />
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold text-foreground">AI genereren</p>
            <p className="text-[11px] text-muted-foreground">Beschrijf en AI maakt het</p>
          </div>
        </button>
      </div>

      {/* Handmatig */}
      {tab === "handmatig" && (
        <Card className="border-border">
          <CardContent className="p-5">
            {stap === 1 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
                  <h3 className="text-sm font-semibold text-foreground">Basisgegevens</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-foreground">Programmanaam</label>
                    <Input
                      value={naam}
                      onChange={(e) => setNaam(e.target.value)}
                      placeholder="bijv. Kracht Fase 2"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-xs font-medium text-foreground">Beschrijving</label>
                    <Textarea
                      value={beschrijving}
                      onChange={(e) => setBeschrijving(e.target.value)}
                      placeholder="Beschrijf het doel en de aanpak van dit programma..."
                      rows={3}
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Categorie</label>
                    <Select value={categorie} onValueChange={setCategorie}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecteer..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="kracht">Kracht</SelectItem>
                        <SelectItem value="afvallen">Afvallen</SelectItem>
                        <SelectItem value="uithoudingsvermogen">Uithoudingsvermogen</SelectItem>
                        <SelectItem value="wellness">Wellness</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Sessies per week</label>
                    <Input
                      type="number"
                      value={sessiesPerWeek}
                      onChange={(e) => setSessiesPerWeek(e.target.value)}
                      min={1}
                      max={7}
                    />
                  </div>
                </div>

                {/* Banner selectie — Supabase Storage: program-banners/{program_id}.jpg */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Banner afbeelding</label>
                  <div className="relative rounded-lg overflow-hidden bg-secondary aspect-[16/9] border border-border">
                    <div className="w-full h-full bg-gradient-to-r from-primary to-primary/70" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <div className="size-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <ImageIcon className="size-5 text-white" />
                      </div>
                      <p className="text-[11px] text-white font-medium drop-shadow-sm">Klik om banner te uploaden</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Aanbevolen: 1200x400px. JPG of PNG. Wordt ook getoond in de app.</p>
                </div>

                <div className="flex justify-end mt-2">
                  <Button
                    onClick={() => setStap(2)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={!naam}
                  >
                    Volgende: Blokken instellen
                    <ChevronRight className="ml-1.5 size-4" />
                  </Button>
                </div>
              </div>
            )}

            {stap === 2 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
                  <h3 className="text-sm font-semibold text-foreground">Blokken definieren</h3>
                  <p className="text-[11px] text-muted-foreground ml-2">Verdeel je programma in blokken met elk een aantal weken</p>
                </div>

                <div className="flex flex-col gap-3">
                  {aantalBlokken.map((blok, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <Input
                          value={blok.naam}
                          onChange={(e) => {
                            const updated = [...aantalBlokken]
                            updated[index].naam = e.target.value
                            setAantalBlokken(updated)
                          }}
                          placeholder="Bloknaam (bijv. Opbouw)"
                          className="h-8 text-sm"
                        />
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={blok.weken}
                            onChange={(e) => {
                              const updated = [...aantalBlokken]
                              updated[index].weken = e.target.value
                              setAantalBlokken(updated)
                            }}
                            min={1}
                            max={12}
                            className="h-8 text-sm w-20"
                          />
                          <span className="text-xs text-muted-foreground">weken</span>
                        </div>
                      </div>
                      {aantalBlokken.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => verwijderBlok(index)}
                        >
                          <X className="size-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit h-8 text-xs gap-1.5 border-dashed"
                  onClick={voegBlokToe}
                >
                  <Plus className="size-3.5" />
                  Blok toevoegen
                </Button>

                {/* Preview */}
                <div className="flex flex-col gap-1.5 mt-2">
                  <span className="text-[11px] font-medium text-muted-foreground">Preview</span>
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden">
                    {aantalBlokken.map((blok, i) => (
                      <div
                        key={i}
                        className={cn(
                          "rounded-full",
                          i === 0 ? "bg-chart-2" : i === 1 ? "bg-primary" : i === 2 ? "bg-chart-3" : "bg-chart-4"
                        )}
                        style={{ flex: Number(blok.weken) || 1 }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Totaal: {aantalBlokken.reduce((sum, b) => sum + (Number(b.weken) || 0), 0)} weken
                  </span>
                </div>

                <div className="flex justify-between mt-2">
                  <Button variant="ghost" onClick={() => setStap(1)} className="text-sm">
                    <ArrowLeft className="mr-1.5 size-4" />
                    Terug
                  </Button>
                  <Button
                    onClick={() => setStap(3)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Volgende: Trainingen invullen
                    <ChevronRight className="ml-1.5 size-4" />
                  </Button>
                </div>
              </div>
            )}

            {stap === 3 && (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
                  <h3 className="text-sm font-semibold text-foreground">Trainingen & oefeningen</h3>
                </div>

                <p className="text-xs text-muted-foreground">
                  Je programma "{naam}" met {aantalBlokken.length} {aantalBlokken.length === 1 ? "blok" : "blokken"} ({aantalBlokken.reduce((sum, b) => sum + (Number(b.weken) || 0), 0)} weken) is klaar om ingevuld te worden.
                  Je kunt trainingen en oefeningen nu toevoegen of later bewerken in de detail-weergave.
                </p>

                <Card className="border-border bg-secondary/30">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={cn("h-12 flex-1 rounded-lg bg-gradient-to-r", "from-primary to-primary/70")} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">{naam || "Programmanaam"}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{beschrijving || "Beschrijving"}</p>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden mt-3">
                      {aantalBlokken.map((blok, i) => (
                        <div
                          key={i}
                          className={cn(
                            "rounded-full",
                            i === 0 ? "bg-chart-2" : i === 1 ? "bg-primary" : i === 2 ? "bg-chart-3" : "bg-chart-4"
                          )}
                          style={{ flex: Number(blok.weken) || 1 }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      {aantalBlokken.map((blok, i) => (
                        <span key={i} className="text-[10px] text-muted-foreground">
                          {blok.naam || `Blok ${i + 1}`}: {blok.weken}w
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-between mt-2">
                  <Button variant="ghost" onClick={() => setStap(2)} className="text-sm">
                    <ArrowLeft className="mr-1.5 size-4" />
                    Terug
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="text-sm border-border">
                      Opslaan als concept
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm gap-1.5">
                      <Check className="size-4" />
                      Programma aanmaken
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Genereren */}
      {tab === "ai" && (
        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="size-4 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">AI Programma Generator</h3>
                <p className="text-[11px] text-muted-foreground">Beschrijf wat je wilt en AI genereert een compleet programma</p>
              </div>
            </div>

            {!aiResultaat ? (
              <div className="flex flex-col gap-4">
                <Textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={"Voorbeeld: Maak een 12 weeks krachtprogramma voor een intermediate lifter. 4x per week, upper/lower split, focus op hypertrofie met RPE-gestuurde intensiteit. Eerste 4 weken opbouw, dan 4 weken intensificatie, en 4 weken piek + taper."}
                  rows={5}
                  className="resize-none"
                />

                <div className="flex flex-wrap gap-2">
                  {[
                    "12 weken kracht, 4x/week, upper/lower",
                    "8 weken afvallen, 5x/week, full body + cardio",
                    "16 weken wedstrijdprep, 6x/week, PPL split",
                    "6 weken beginners, 3x/week, full body",
                  ].map((suggestie) => (
                    <button
                      key={suggestie}
                      onClick={() => setAiPrompt(suggestie)}
                      className="px-2.5 py-1 rounded-full bg-secondary text-[11px] text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {suggestie}
                    </button>
                  ))}
                </div>

                <Button
                  onClick={simuleerAi}
                  disabled={!aiPrompt || aiLoading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Programma genereren...
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      Genereer programma
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                  <Check className="size-4 text-success" />
                  <p className="text-xs font-medium text-success">Programma gegenereerd</p>
                </div>

                {/* AI Preview */}
                <Card className="border-border bg-secondary/30">
                  <CardContent className="p-4">
                    <p className="text-sm font-semibold text-foreground">Kracht Hypertrofie 12W</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      AI-gegenereerd: 12 weken upper/lower split met RPE-gestuurde intensiteit.
                      3 blokken: Opbouw (4w), Intensificatie (4w), Peak & Taper (4w). 4 trainingen per week.
                    </p>
                    <div className="flex gap-1 h-2 rounded-full overflow-hidden mt-3">
                      <div className="bg-chart-2 rounded-full" style={{ flex: 4 }} />
                      <div className="bg-primary rounded-full" style={{ flex: 4 }} />
                      <div className="bg-chart-3 rounded-full" style={{ flex: 4 }} />
                    </div>
                    <div className="flex gap-3 mt-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="size-3" />12 weken</span>
                      <span className="flex items-center gap-1"><Dumbbell className="size-3" />4x/week</span>
                      <span className="flex items-center gap-1"><Target className="size-3" />48 trainingen</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Samenvatting blokken */}
                <div className="flex flex-col gap-2">
                  {["Opbouw (Week 1-4)", "Intensificatie (Week 5-8)", "Peak & Taper (Week 9-12)"].map((blok, i) => (
                    <div key={blok} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
                      <div className={cn(
                        "size-2 rounded-full",
                        i === 0 ? "bg-chart-2" : i === 1 ? "bg-primary" : "bg-chart-3"
                      )} />
                      <span className="text-xs font-medium text-foreground">{blok}</span>
                      <span className="text-[10px] text-muted-foreground">4 trainingen/week</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between mt-2">
                  <Button
                    variant="ghost"
                    onClick={() => { setAiResultaat(false); setAiPrompt("") }}
                    className="text-sm"
                  >
                    <ArrowLeft className="mr-1.5 size-4" />
                    Opnieuw genereren
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" className="text-sm border-border">
                      Aanpassen
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 text-sm gap-1.5">
                      <Check className="size-4" />
                      Opslaan & bewerken
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
