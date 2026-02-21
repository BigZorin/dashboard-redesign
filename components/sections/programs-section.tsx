"use client"

import { useState, useMemo } from "react"
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
  Filter,
  ArrowUp,
  ArrowDown,
  Library,
  Wrench,
  Video,
  ChevronLeft,
  Eye,
  RotateCcw,
  Layers,
  Calendar,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

type IntensiteitType = "RPE" | "RIR" | "Gewicht" | "%1RM"
type ExerciseCategory = "STRENGTH" | "CARDIO" | "FLEXIBILITY"
type Difficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
type ForceType = "push" | "pull" | "static"
type Mechanic = "compound" | "isolation"
type WorkoutSection = "warm_up" | "workout" | "cool_down"

interface Exercise {
  id: string
  name: string
  category: ExerciseCategory
  equipment_needed: string
  muscle_groups: string[]
  secondary_muscles: string[]
  difficulty: Difficulty
  force_type: ForceType
  mechanic: Mechanic
  cues: string
  image_urls: string[]
  video_url: string | null
  is_public: boolean
}

interface WorkoutExercise {
  id: string
  exercise_id: string
  exercise_name: string
  muscle_group: string
  order_index: number
  sets: number
  reps: string
  rest_seconds: number
  intensity_type: IntensiteitType
  intensity_value: string
  tempo: string
  section: WorkoutSection
  notes: string
  video_url: string | null
}

interface WorkoutTemplate {
  id: string
  name: string
  description: string
  duration_minutes: number
  exercises: WorkoutExercise[]
}

interface BlockWorkout {
  id: string
  workout_template: WorkoutTemplate
  order_index: number
  day_of_week: string
}

interface ProgramBlock {
  id: string
  name: string
  description: string
  order_index: number
  duration_weeks: number
  color: string
  weeks: ProgramWeek[]
}

interface ProgramWeek {
  weekNumber: number
  workouts: BlockWorkout[]
}

interface Program {
  id: string
  name: string
  description: string
  is_active: boolean
  category: "kracht" | "afvallen" | "uithoudingsvermogen" | "wellness"
  total_weeks: number
  sessions_per_week: number
  banner_color: string
  banner_url: string | null
  client_count: number
  blocks: ProgramBlock[]
}

// ============================================================================
// MOCK DATA — EXERCISES
// ============================================================================

const defaultExercises: Exercise[] = [
  {
    id: "ex_001", name: "Bench Press", category: "STRENGTH", equipment_needed: "barbell",
    muscle_groups: ["chest", "triceps"], secondary_muscles: ["shoulders"],
    difficulty: "INTERMEDIATE", force_type: "push", mechanic: "compound",
    cues: "Houd je schouderbladen ingetrokken. Laat de stang langzaam zakken naar je borst.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: "https://youtube.com/watch?v=example1", is_public: true,
  },
  {
    id: "ex_002", name: "Squat", category: "STRENGTH", equipment_needed: "barbell",
    muscle_groups: ["quadriceps", "glutes"], secondary_muscles: ["hamstrings", "core"],
    difficulty: "INTERMEDIATE", force_type: "push", mechanic: "compound",
    cues: "Houd je borst omhoog. Duw je knieën naar buiten.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: "https://youtube.com/watch?v=example2", is_public: true,
  },
  {
    id: "ex_003", name: "Deadlift", category: "STRENGTH", equipment_needed: "barbell",
    muscle_groups: ["back", "glutes"], secondary_muscles: ["hamstrings", "core", "forearms"],
    difficulty: "ADVANCED", force_type: "pull", mechanic: "compound",
    cues: "Houd je rug recht. Duw de grond weg met je voeten.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: "https://youtube.com/watch?v=example3", is_public: true,
  },
  {
    id: "ex_004", name: "Pull-up", category: "STRENGTH", equipment_needed: "body only",
    muscle_groups: ["back", "biceps"], secondary_muscles: ["forearms", "core"],
    difficulty: "INTERMEDIATE", force_type: "pull", mechanic: "compound",
    cues: "Trek vanuit je ellebogen. Breng je kin boven de stang.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: null, is_public: true,
  },
  {
    id: "ex_005", name: "Shoulder Press", category: "STRENGTH", equipment_needed: "dumbbell",
    muscle_groups: ["shoulders"], secondary_muscles: ["triceps", "core"],
    difficulty: "BEGINNER", force_type: "push", mechanic: "compound",
    cues: "Duw recht omhoog. Span je core aan.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: "https://youtube.com/watch?v=example5", is_public: true,
  },
  {
    id: "ex_006", name: "Bicep Curl", category: "STRENGTH", equipment_needed: "dumbbell",
    muscle_groups: ["biceps"], secondary_muscles: ["forearms"],
    difficulty: "BEGINNER", force_type: "pull", mechanic: "isolation",
    cues: "Houd je ellebogen stil naast je lichaam.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: null, is_public: true,
  },
  {
    id: "ex_007", name: "Tricep Pushdown", category: "STRENGTH", equipment_needed: "cable",
    muscle_groups: ["triceps"], secondary_muscles: [],
    difficulty: "BEGINNER", force_type: "push", mechanic: "isolation",
    cues: "Houd je ellebogen naast je lichaam. Duw het gewicht volledig naar beneden.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: null, is_public: true,
  },
  {
    id: "ex_008", name: "Leg Press", category: "STRENGTH", equipment_needed: "machine",
    muscle_groups: ["quadriceps", "glutes"], secondary_muscles: ["hamstrings"],
    difficulty: "BEGINNER", force_type: "push", mechanic: "compound",
    cues: "Plaats je voeten op schouderbreedte. Duw tot volle extensie.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: "https://youtube.com/watch?v=example8", is_public: true,
  },
  {
    id: "ex_009", name: "Plank", category: "FLEXIBILITY", equipment_needed: "body only",
    muscle_groups: ["core"], secondary_muscles: ["shoulders"],
    difficulty: "BEGINNER", force_type: "static", mechanic: "isolation",
    cues: "Houd je lichaam in een rechte lijn. Span je buikspieren aan.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: null, is_public: true,
  },
  {
    id: "ex_010", name: "Romanian Deadlift", category: "STRENGTH", equipment_needed: "barbell",
    muscle_groups: ["hamstrings", "glutes"], secondary_muscles: ["back", "core"],
    difficulty: "INTERMEDIATE", force_type: "pull", mechanic: "compound",
    cues: "Kantel vanuit je heupen. Houd een lichte kniebuiging.", image_urls: ["/placeholder-exercise-1.jpg", "/placeholder-exercise-2.jpg"], video_url: "https://youtube.com/watch?v=example10", is_public: true,
  },
]

// ============================================================================
// MOCK DATA — PROGRAMS
// ============================================================================

const defaultPrograms: Program[] = [
  {
    id: "prog_001",
    name: "Kracht Fase 2",
    description: "Progressief overbelastingsprogramma gericht op samengestelde oefeningen. Opgebouwd in 3 blokken met toenemende intensiteit.",
    is_active: true,
    category: "kracht",
    total_weeks: 12,
    sessions_per_week: 4,
    banner_color: "from-primary to-primary/70",
    banner_url: null,
    client_count: 12,
    blocks: [
      {
        id: "blok_001", name: "Opbouw", description: "Volume opbouwen, techniek verfijnen", order_index: 0, duration_weeks: 4, color: "bg-chart-2",
        weeks: [
          {
            weekNumber: 1, workouts: [
              { id: "bw1", order_index: 0, day_of_week: "Maandag", workout_template: {
                id: "wt1", name: "Upper Kracht", description: "Zware compound bovenllichaam", duration_minutes: 60,
                exercises: [
                  { id: "we1", exercise_id: "ex_001", exercise_name: "Bench Press", muscle_group: "chest", order_index: 0, sets: 4, reps: "5", rest_seconds: 180, intensity_type: "RPE", intensity_value: "7", tempo: "3-1-2-0", section: "workout", notes: "", video_url: "https://youtube.com/watch?v=example1" },
                  { id: "we2", exercise_id: "ex_004", exercise_name: "Pull-up", muscle_group: "back", order_index: 1, sets: 4, reps: "6-8", rest_seconds: 150, intensity_type: "RIR", intensity_value: "3", tempo: "2-1-2-0", section: "workout", notes: "", video_url: null },
                  { id: "we3", exercise_id: "ex_005", exercise_name: "Shoulder Press", muscle_group: "shoulders", order_index: 2, sets: 3, reps: "8-10", rest_seconds: 120, intensity_type: "RIR", intensity_value: "2", tempo: "2-0-2-0", section: "workout", notes: "", video_url: "https://youtube.com/watch?v=example5" },
                  { id: "we4", exercise_id: "ex_007", exercise_name: "Tricep Pushdown", muscle_group: "triceps", order_index: 3, sets: 3, reps: "12-15", rest_seconds: 60, intensity_type: "RIR", intensity_value: "1", tempo: "2-0-2-1", section: "workout", notes: "", video_url: null },
                ],
              }},
              { id: "bw2", order_index: 1, day_of_week: "Dinsdag", workout_template: {
                id: "wt2", name: "Lower Kracht", description: "Zware compound onderlichaam", duration_minutes: 65,
                exercises: [
                  { id: "we5", exercise_id: "ex_002", exercise_name: "Squat", muscle_group: "quadriceps", order_index: 0, sets: 4, reps: "5", rest_seconds: 180, intensity_type: "RPE", intensity_value: "7", tempo: "3-1-2-0", section: "workout", notes: "Diepte bewaken", video_url: "https://youtube.com/watch?v=example2" },
                  { id: "we6", exercise_id: "ex_010", exercise_name: "Romanian Deadlift", muscle_group: "hamstrings", order_index: 1, sets: 3, reps: "8", rest_seconds: 120, intensity_type: "RIR", intensity_value: "3", tempo: "3-1-1-0", section: "workout", notes: "", video_url: "https://youtube.com/watch?v=example10" },
                  { id: "we7", exercise_id: "ex_008", exercise_name: "Leg Press", muscle_group: "quadriceps", order_index: 2, sets: 3, reps: "10-12", rest_seconds: 120, intensity_type: "RIR", intensity_value: "2", tempo: "2-0-2-0", section: "workout", notes: "", video_url: "https://youtube.com/watch?v=example8" },
                  { id: "we8", exercise_id: "ex_009", exercise_name: "Plank", muscle_group: "core", order_index: 3, sets: 3, reps: "45 sec", rest_seconds: 60, intensity_type: "RPE", intensity_value: "7", tempo: "", section: "cool_down", notes: "", video_url: null },
                ],
              }},
              { id: "bw3", order_index: 2, day_of_week: "Donderdag", workout_template: {
                id: "wt3", name: "Upper Hypertrofie", description: "Volumewerk bovenlichaam", duration_minutes: 55,
                exercises: [
                  { id: "we9", exercise_id: "ex_001", exercise_name: "Bench Press", muscle_group: "chest", order_index: 0, sets: 3, reps: "8-12", rest_seconds: 120, intensity_type: "RIR", intensity_value: "2", tempo: "3-0-2-0", section: "workout", notes: "", video_url: "https://youtube.com/watch?v=example1" },
                  { id: "we10", exercise_id: "ex_006", exercise_name: "Bicep Curl", muscle_group: "biceps", order_index: 1, sets: 3, reps: "12-15", rest_seconds: 60, intensity_type: "RIR", intensity_value: "1", tempo: "2-1-2-0", section: "workout", notes: "", video_url: null },
                ],
              }},
              { id: "bw4", order_index: 3, day_of_week: "Vrijdag", workout_template: {
                id: "wt4", name: "Lower Hypertrofie", description: "Volumewerk onderlichaam", duration_minutes: 55,
                exercises: [
                  { id: "we11", exercise_id: "ex_002", exercise_name: "Squat", muscle_group: "quadriceps", order_index: 0, sets: 3, reps: "8-12", rest_seconds: 120, intensity_type: "%1RM", intensity_value: "65%", tempo: "3-0-2-0", section: "workout", notes: "", video_url: "https://youtube.com/watch?v=example2" },
                  { id: "we12", exercise_id: "ex_008", exercise_name: "Leg Press", muscle_group: "quadriceps", order_index: 1, sets: 4, reps: "12-15", rest_seconds: 90, intensity_type: "RIR", intensity_value: "1", tempo: "2-0-2-0", section: "workout", notes: "", video_url: "https://youtube.com/watch?v=example8" },
                ],
              }},
            ],
          },
          { weekNumber: 2, workouts: [] },
          { weekNumber: 3, workouts: [] },
          { weekNumber: 4, workouts: [] },
        ],
      },
      {
        id: "blok_002", name: "Intensificatie", description: "Intensiteit verhogen, volume verlagen", order_index: 1, duration_weeks: 4, color: "bg-primary",
        weeks: [
          { weekNumber: 5, workouts: [] },
          { weekNumber: 6, workouts: [] },
          { weekNumber: 7, workouts: [] },
          { weekNumber: 8, workouts: [] },
        ],
      },
      {
        id: "blok_003", name: "Piek & Taper", description: "Maximale kracht testen, deload week", order_index: 2, duration_weeks: 4, color: "bg-chart-3",
        weeks: [
          { weekNumber: 9, workouts: [] },
          { weekNumber: 10, workouts: [] },
          { weekNumber: 11, workouts: [] },
          { weekNumber: 12, workouts: [] },
        ],
      },
    ],
  },
  {
    id: "prog_002",
    name: "Afvallen 12 Weken",
    description: "HIIT en weerstandstraining met calorieendeficit protocollen. Combinatie van krachttraining en cardio.",
    is_active: true,
    category: "afvallen",
    total_weeks: 12,
    sessions_per_week: 5,
    banner_color: "from-chart-5 to-chart-5/70",
    banner_url: null,
    client_count: 18,
    blocks: [
      { id: "blok_010", name: "Basis", description: "Gewenning en motorisch leren", order_index: 0, duration_weeks: 4, color: "bg-chart-5", weeks: [{ weekNumber: 1, workouts: [] }, { weekNumber: 2, workouts: [] }, { weekNumber: 3, workouts: [] }, { weekNumber: 4, workouts: [] }] },
      { id: "blok_011", name: "Intensificatie", description: "Volume en intensiteit opschroeven", order_index: 1, duration_weeks: 4, color: "bg-chart-4", weeks: [{ weekNumber: 5, workouts: [] }, { weekNumber: 6, workouts: [] }, { weekNumber: 7, workouts: [] }, { weekNumber: 8, workouts: [] }] },
      { id: "blok_012", name: "Finisher", description: "Maximale verbranding", order_index: 2, duration_weeks: 4, color: "bg-destructive", weeks: [{ weekNumber: 9, workouts: [] }, { weekNumber: 10, workouts: [] }, { weekNumber: 11, workouts: [] }, { weekNumber: 12, workouts: [] }] },
    ],
  },
  {
    id: "prog_003",
    name: "Marathon Prep",
    description: "Opbouw van uithoudingsvermogen met progressieve kilometers. Inclusief krachtwerk ter ondersteuning.",
    is_active: true,
    category: "uithoudingsvermogen",
    total_weeks: 20,
    sessions_per_week: 5,
    banner_color: "from-chart-4 to-chart-4/70",
    banner_url: null,
    client_count: 8,
    blocks: [],
  },
  {
    id: "prog_004",
    name: "Wellness & Mobiliteit",
    description: "Flexibiliteit, mobiliteit en stressmanagement routines voor dagelijks welzijn.",
    is_active: false,
    category: "wellness",
    total_weeks: 0,
    sessions_per_week: 3,
    banner_color: "from-chart-2 to-chart-2/70",
    banner_url: null,
    client_count: 6,
    blocks: [],
  },
]

const categorieIcons: Record<string, typeof Dumbbell> = {
  kracht: Dumbbell,
  afvallen: Flame,
  uithoudingsvermogen: Zap,
  wellness: Heart,
}

const categoryLabels: Record<ExerciseCategory, { label: string; color: string }> = {
  STRENGTH: { label: "Kracht", color: "bg-primary/10 text-primary border-primary/20" },
  CARDIO: { label: "Cardio", color: "bg-chart-5/10 text-chart-5 border-chart-5/20" },
  FLEXIBILITY: { label: "Flexibiliteit", color: "bg-chart-2/10 text-chart-2 border-chart-2/20" },
}

const difficultyLabels: Record<Difficulty, { label: string; color: string }> = {
  BEGINNER: { label: "Beginner", color: "bg-success/10 text-success border-success/20" },
  INTERMEDIATE: { label: "Gemiddeld", color: "bg-warning/10 text-warning-foreground border-warning/20" },
  ADVANCED: { label: "Gevorderd", color: "bg-destructive/10 text-destructive border-destructive/20" },
}

// ============================================================================
// MAIN COMPONENT — 4 TABS
// ============================================================================

export interface ProgramsSectionProps {
  programs?: Program[]
  exercises?: Exercise[]
  loading?: boolean
}

export function ProgramsSection({
  programs = defaultPrograms,
  exercises = defaultExercises,
  loading = false,
}: ProgramsSectionProps) {
  const [activeTab, setActiveTab] = useState("overzicht")
  // Programma detail state
  const [selectedProgramId, setSelectedProgramId] = useState<string | null>(null)
  const selectedProgram = programs.find(p => p.id === selectedProgramId) ?? null

  // Als er een programma geselecteerd is, toon het detail
  if (selectedProgram) {
    return (
      <ProgramDetail
        program={selectedProgram}
        exercises={exercises}
        onBack={() => setSelectedProgramId(null)}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-8 w-80" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border overflow-hidden p-0 gap-0">
              <Skeleton className="h-20 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* PROMINENTE AI GENERATOR CTA */}
      <button
        onClick={() => setActiveTab("ai")}
        className={cn(
          "relative overflow-hidden rounded-xl p-5 text-left transition-all group",
          "bg-gradient-to-r from-[#6c3caf] via-[#7c4dbd] to-[#5b2d9e]",
          "hover:from-[#7c4dbd] hover:via-[#8b5cc7] hover:to-[#6c3caf]",
          "shadow-lg shadow-[#6c3caf]/20 hover:shadow-xl hover:shadow-[#6c3caf]/30",
          activeTab === "ai" && "ring-2 ring-[#7c4dbd] ring-offset-2 ring-offset-background"
        )}
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-32 h-32 bg-white/5 rounded-full translate-y-1/2" />
        <div className="relative flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm shrink-0">
            <Sparkles className="size-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-base font-bold text-white">Genereer met AI</p>
            <p className="text-sm text-white/70 mt-0.5">
              Laat AI een compleet trainingsprogramma genereren op basis van client-doelen, ervaring en beschikbare equipment.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
            <span>Start</span>
            <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="overzicht" className="gap-1.5 text-xs">
            <Layers className="size-3.5" />
            {"Programma's"}
          </TabsTrigger>
          <TabsTrigger value="oefeningen" className="gap-1.5 text-xs">
            <Library className="size-3.5" />
            Oefeningen
          </TabsTrigger>
          <TabsTrigger value="builder" className="gap-1.5 text-xs">
            <Wrench className="size-3.5" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5 text-xs">
            <Sparkles className="size-3.5" />
            AI Generator
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: PROGRAMMA'S OVERZICHT */}
        <TabsContent value="overzicht" className="mt-6">
          <ProgramsOverview
            programs={programs}
            onSelectProgram={setSelectedProgramId}
          />
        </TabsContent>

        {/* TAB 2: OEFENINGEN BIBLIOTHEEK */}
        <TabsContent value="oefeningen" className="mt-6">
          <ExerciseLibrary exercises={exercises} />
        </TabsContent>

        {/* TAB 3: WORKOUT BUILDER (handmatige finetuning) */}
        <TabsContent value="builder" className="mt-6">
          <WorkoutBuilder exercises={exercises} />
        </TabsContent>

        {/* TAB 4: AI GENERATOR (hoofd-workflow) */}
        <TabsContent value="ai" className="mt-6">
          <AIGenerator />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================================
// TAB 1: PROGRAMMA'S OVERZICHT
// ============================================================================

function ProgramsOverview({ programs, onSelectProgram }: {
  programs: Program[]
  onSelectProgram: (id: string) => void
}) {
  const [zoek, setZoek] = useState("")
  const [statusFilter, setStatusFilter] = useState<"alle" | "actief" | "inactief">("alle")

  const filtered = useMemo(() => {
    return programs.filter(p => {
      const matchZoek = p.name.toLowerCase().includes(zoek.toLowerCase()) || p.description.toLowerCase().includes(zoek.toLowerCase())
      const matchStatus = statusFilter === "alle" || (statusFilter === "actief" ? p.is_active : !p.is_active)
      return matchZoek && matchStatus
    })
  }, [programs, zoek, statusFilter])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{"Programma's"}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{"Maak en beheer trainingsprogramma's voor je clienten"}</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Nieuw programma
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatusFilter("alle")}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", statusFilter === "alle" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}
          >
            Alle ({programs.length})
          </button>
          <button
            onClick={() => setStatusFilter("actief")}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", statusFilter === "actief" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}
          >
            Actief ({programs.filter(p => p.is_active).length})
          </button>
          <button
            onClick={() => setStatusFilter("inactief")}
            className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", statusFilter === "inactief" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}
          >
            Inactief ({programs.filter(p => !p.is_active).length})
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Zoek programma's..."
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            className="pl-9 h-9 w-64 bg-card border-border"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((program) => (
          <ProgramCard key={program.id} program={program} onClick={() => onSelectProgram(program.id)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Layers className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">{"Geen programma's gevonden"}</p>
          <p className="text-xs text-muted-foreground mt-1">Pas je filters aan of maak een nieuw programma aan.</p>
        </div>
      )}
    </div>
  )
}

function ProgramCard({ program, onClick }: { program: Program; onClick: () => void }) {
  const Icon = categorieIcons[program.category] || Dumbbell

  return (
    <Card
      className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group overflow-hidden p-0 gap-0"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick() }}
    >
      <div className={cn("h-20 bg-gradient-to-r relative", program.banner_color)}>
        {program.banner_url && (
          <img src={program.banner_url} alt="" className="absolute inset-0 w-full h-full object-cover" crossOrigin="anonymous" />
        )}
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <Icon className="size-4 text-white" />
          </div>
          <p className="text-sm font-semibold text-white drop-shadow-sm">{program.name}</p>
        </div>
        <Badge className={cn(
          "absolute top-3 right-3 text-[10px] border-0",
          program.is_active ? "bg-success/80 text-success-foreground backdrop-blur-sm" : "bg-white/20 text-white backdrop-blur-sm"
        )}>
          {program.is_active ? "Actief" : "Inactief"}
        </Badge>
      </div>

      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{program.description}</p>

        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {program.total_weeks > 0 ? `${program.total_weeks} weken` : "Doorlopend"}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {program.client_count} clienten
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="size-3.5" />
            {program.sessions_per_week}x/week
          </div>
        </div>

        {program.blocks.length > 0 && (
          <div className="mt-3 flex gap-1">
            {program.blocks.map((block) => (
              <div
                key={block.id}
                className={cn("h-1.5 rounded-full", block.color)}
                style={{ flex: block.duration_weeks }}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// PROGRAMMA DETAIL — Blok > Week > Training verloop
// ============================================================================

function ProgramDetail({ program, exercises, onBack }: {
  program: Program
  exercises: Exercise[]
  onBack: () => void
}) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(program.blocks[0]?.id ?? null)
  const [selectedWeekNum, setSelectedWeekNum] = useState<number | null>(null)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null)
  const [oefeningDialogOpen, setOefeningDialogOpen] = useState(false)
  const [zoekOefening, setZoekOefening] = useState("")

  const selectedBlock = program.blocks.find(b => b.id === selectedBlockId)
  const selectedWeek = selectedBlock?.weeks.find(w => w.weekNumber === selectedWeekNum)
  const selectedWorkout = selectedWeek?.workouts.find(w => w.id === selectedWorkoutId)

  // Auto-select first week when block changes
  const activeWeek = selectedWeekNum ?? selectedBlock?.weeks[0]?.weekNumber ?? null
  const activeWeekData = selectedBlock?.weeks.find(w => w.weekNumber === activeWeek)

  const totalWorkouts = program.blocks.reduce(
    (sum, b) => sum + b.weeks.reduce((ws, w) => ws + w.workouts.length, 0), 0
  )

  // Als een workout geselecteerd is, toon die
  if (selectedWorkout) {
    return (
      <WorkoutDetail
        workout={selectedWorkout}
        exercises={exercises}
        programName={program.name}
        blockName={selectedBlock?.name ?? ""}
        weekNumber={activeWeek ?? 0}
        onBack={() => setSelectedWorkoutId(null)}
      />
    )
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
            Terug
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground">{program.name}</h2>
            <p className="text-xs text-muted-foreground">{program.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "text-[11px]",
            program.is_active ? "bg-success/10 text-success border-success/20" : "bg-secondary text-muted-foreground"
          )}>
            {program.is_active ? "Actief" : "Inactief"}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="size-8 border-border">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit3 className="mr-2 size-3.5" />Bewerken</DropdownMenuItem>
              <DropdownMenuItem><Copy className="mr-2 size-3.5" />Dupliceren</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 size-3.5" />Verwijderen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Layers className="size-4 text-primary" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{program.blocks.length}</p>
              <p className="text-[11px] text-muted-foreground">Blokken</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-chart-2/10 flex items-center justify-center">
              <Calendar className="size-4 text-chart-2" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{program.total_weeks}</p>
              <p className="text-[11px] text-muted-foreground">Weken</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-chart-4/10 flex items-center justify-center">
              <Dumbbell className="size-4 text-chart-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{totalWorkouts}</p>
              <p className="text-[11px] text-muted-foreground">Trainingen</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="size-9 rounded-lg bg-chart-5/10 flex items-center justify-center">
              <Users className="size-4 text-chart-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{program.client_count}</p>
              <p className="text-[11px] text-muted-foreground">Clienten</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Blok-balk visueel */}
      {program.blocks.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Blokstructuur</p>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden">
            {program.blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => { setSelectedBlockId(block.id); setSelectedWeekNum(null); setSelectedWorkoutId(null) }}
                className={cn(
                  "rounded-full transition-all",
                  block.color,
                  selectedBlockId === block.id ? "ring-2 ring-foreground/20 ring-offset-1 ring-offset-background" : "opacity-60 hover:opacity-80"
                )}
                style={{ flex: block.duration_weeks }}
                title={`${block.name} (${block.duration_weeks} weken)`}
              />
            ))}
          </div>
          <div className="flex gap-3">
            {program.blocks.map((block) => (
              <span key={block.id} className="text-[10px] text-muted-foreground" style={{ flex: block.duration_weeks }}>
                {block.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Twee-koloms: Blokken links, Content rechts */}
      {program.blocks.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
          {/* Linker kolom: Blokken */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-semibold text-foreground">Blokken</p>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground">
                <Plus className="size-3" />
                Blok
              </Button>
            </div>
            {program.blocks.map((block) => (
              <button
                key={block.id}
                onClick={() => { setSelectedBlockId(block.id); setSelectedWeekNum(null); setSelectedWorkoutId(null) }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border text-left transition-all",
                  selectedBlockId === block.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/30 bg-card"
                )}
              >
                <div className={cn("w-1 h-10 rounded-full", block.color)} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{block.name}</p>
                  <p className="text-[11px] text-muted-foreground">{block.duration_weeks} weken &middot; {block.weeks.reduce((s, w) => s + w.workouts.length, 0)} trainingen</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>

          {/* Rechter kolom: Weken & Trainingen van geselecteerde blok */}
          {selectedBlock && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selectedBlock.name}</h3>
                  <p className="text-xs text-muted-foreground">{selectedBlock.description}</p>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border">
                  <Plus className="size-3.5" />
                  Workout toevoegen
                </Button>
              </div>

              {/* Week selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {selectedBlock.weeks.map((week) => (
                  <button
                    key={week.weekNumber}
                    onClick={() => { setSelectedWeekNum(week.weekNumber); setSelectedWorkoutId(null) }}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-xs font-medium transition-all shrink-0 min-w-[60px]",
                      activeWeek === week.weekNumber
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                    )}
                  >
                    <span className="text-[10px] font-normal">Week</span>
                    <span>{week.weekNumber}</span>
                    {week.workouts.length > 0 && (
                      <span className={cn(
                        "text-[9px]",
                        activeWeek === week.weekNumber ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}>
                        {week.workouts.length} trainingen
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Workouts van geselecteerde week */}
              {activeWeekData && activeWeekData.workouts.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {activeWeekData.workouts
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((bw) => (
                    <Card
                      key={bw.id}
                      className="border-border hover:border-primary/30 transition-all cursor-pointer group"
                      onClick={() => setSelectedWorkoutId(bw.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSelectedWorkoutId(bw.id) }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                              <Dumbbell className="size-5 text-primary" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                {bw.workout_template.name}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {bw.day_of_week} &middot; {bw.workout_template.exercises.length} oefeningen &middot; {bw.workout_template.duration_minutes} min
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>

                        {/* Oefeningen preview */}
                        {bw.workout_template.exercises.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {bw.workout_template.exercises.slice(0, 5).map((ex) => (
                              <Badge key={ex.id} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground font-normal">
                                {ex.exercise_name}
                              </Badge>
                            ))}
                            {bw.workout_template.exercises.length > 5 && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground font-normal">
                                +{bw.workout_template.exercises.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-border border-dashed">
                  <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                    <div className="size-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                      <Dumbbell className="size-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Geen trainingen in week {activeWeek}</p>
                    <p className="text-xs text-muted-foreground mt-1">Voeg een workout toe aan deze week.</p>
                    <Button size="sm" className="mt-3 h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                      <Plus className="size-3.5" />
                      Workout toevoegen
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
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
  )
}

// ============================================================================
// WORKOUT DETAIL (vanuit programma)
// ============================================================================

function WorkoutDetail({ workout, exercises, programName, blockName, weekNumber, onBack }: {
  workout: BlockWorkout
  exercises: Exercise[]
  programName: string
  blockName: string
  weekNumber: number
  onBack: () => void
}) {
  const [oefeningDialogOpen, setOefeningDialogOpen] = useState(false)
  const [zoekOefening, setZoekOefening] = useState("")
  const template = workout.workout_template

  const warmUpExercises = template.exercises.filter(e => e.section === "warm_up")
  const workoutExercises = template.exercises.filter(e => e.section === "workout")
  const coolDownExercises = template.exercises.filter(e => e.section === "cool_down")

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={onBack} className="hover:text-foreground transition-colors">{programName}</button>
        <ChevronRight className="size-3" />
        <span>{blockName}</span>
        <ChevronRight className="size-3" />
        <span>Week {weekNumber}</span>
        <ChevronRight className="size-3" />
        <span className="text-foreground font-medium">{template.name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            onClick={onBack}
          >
            <ArrowLeft className="size-4" />
            <span className="sr-only">Terug</span>
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground">{template.name}</h2>
            <p className="text-xs text-muted-foreground">
              {workout.day_of_week} &middot; {template.exercises.length} oefeningen &middot; {template.duration_minutes} min
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border">
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Check className="size-3.5" />
            Opslaan
          </Button>
        </div>
      </div>

      {/* Oefeningen secties */}
      {[
        { label: "Warming-up", items: warmUpExercises, section: "warm_up" as WorkoutSection },
        { label: "Workout", items: workoutExercises, section: "workout" as WorkoutSection },
        { label: "Cooling-down", items: coolDownExercises, section: "cool_down" as WorkoutSection },
      ].map(({ label, items, section }) => (
        <ExerciseSection
          key={section}
          label={label}
          items={items}
          onAddExercise={() => setOefeningDialogOpen(true)}
        />
      ))}

      {/* Oefening selectie dialog */}
      <ExerciseSelectionDialog
        open={oefeningDialogOpen}
        onOpenChange={setOefeningDialogOpen}
        exercises={exercises}
        zoek={zoekOefening}
        onZoekChange={setZoekOefening}
      />
    </div>
  )
}

function ExerciseSection({ label, items, onAddExercise }: {
  label: string
  items: WorkoutExercise[]
  onAddExercise: () => void
}) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">{label}</h3>
              <Badge variant="secondary" className="text-[10px]">{items.length}</Badge>
            </div>
            {isOpen ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          {items.length > 0 ? (
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
                      <TableHead className="text-[10px] w-24">Tempo</TableHead>
                      <TableHead className="text-[10px] min-w-[120px]">Notities</TableHead>
                      <TableHead className="text-[10px] w-16"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((ex, index) => (
                      <TableRow key={ex.id} className="group/row">
                        <TableCell className="text-xs text-muted-foreground py-2">{index + 1}</TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <GripVertical className="size-3.5 text-muted-foreground/40 cursor-grab" />
                            <div>
                              <p className="text-xs font-medium text-foreground">{ex.exercise_name}</p>
                              <p className="text-[10px] text-muted-foreground">{ex.muscle_group}</p>
                            </div>
                            {ex.video_url && (
                              <button className="opacity-0 group-hover/row:opacity-100 transition-opacity">
                                <Play className="size-3.5 text-primary" />
                              </button>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            defaultValue={ex.sets}
                            className="h-7 w-12 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            defaultValue={ex.reps}
                            className="h-7 w-16 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1">
                            <Select defaultValue={ex.intensity_type}>
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
                              defaultValue={ex.intensity_value}
                              className="h-7 w-14 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                            />
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            defaultValue={`${ex.rest_seconds}s`}
                            className="h-7 w-16 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            defaultValue={ex.tempo}
                            placeholder="3-1-2-0"
                            className="h-7 w-20 text-xs text-center border-transparent hover:border-border focus:border-primary bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <Input
                            defaultValue={ex.notes}
                            placeholder="..."
                            className="h-7 text-xs border-transparent hover:border-border focus:border-primary bg-transparent"
                          />
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
                              <ArrowUp className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-6 text-muted-foreground">
                              <ArrowDown className="size-3" />
                            </Button>
                            <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-destructive">
                              <Trash2 className="size-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}

          <div className="p-3 border-t border-border/50">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground gap-1"
              onClick={onAddExercise}
            >
              <Plus className="size-3" />
              Oefening toevoegen
            </Button>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

// ============================================================================
// TAB 2: OEFENINGEN BIBLIOTHEEK
// ============================================================================

function ExerciseLibrary({ exercises }: { exercises: Exercise[] }) {
  const [zoek, setZoek] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<"alle" | ExerciseCategory>("alle")
  const [difficultyFilter, setDifficultyFilter] = useState<"alle" | Difficulty>("alle")
  const [equipmentFilter, setEquipmentFilter] = useState<string>("alle")
  const [muscleFilter, setMuscleFilter] = useState<string>("alle")
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const allEquipment = useMemo(() => [...new Set(exercises.map(e => e.equipment_needed))].sort(), [exercises])
  const allMuscles = useMemo(() => [...new Set(exercises.flatMap(e => e.muscle_groups))].sort(), [exercises])

  const filtered = useMemo(() => {
    return exercises.filter(e => {
      const matchZoek = e.name.toLowerCase().includes(zoek.toLowerCase()) ||
        e.muscle_groups.some(m => m.toLowerCase().includes(zoek.toLowerCase())) ||
        e.equipment_needed.toLowerCase().includes(zoek.toLowerCase())
      const matchCategory = categoryFilter === "alle" || e.category === categoryFilter
      const matchDifficulty = difficultyFilter === "alle" || e.difficulty === difficultyFilter
      const matchEquipment = equipmentFilter === "alle" || e.equipment_needed === equipmentFilter
      const matchMuscle = muscleFilter === "alle" || e.muscle_groups.includes(muscleFilter)
      return matchZoek && matchCategory && matchDifficulty && matchEquipment && matchMuscle
    })
  }, [exercises, zoek, categoryFilter, difficultyFilter, equipmentFilter, muscleFilter])

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Oefeningen Bibliotheek</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{exercises.length} oefeningen beschikbaar</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Oefening toevoegen
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Zoek op naam, spiergroep, equipment..."
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            className="pl-9 h-9 bg-card border-border"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as typeof categoryFilter)}>
          <SelectTrigger className="h-9 w-[140px] text-xs border-border">
            <SelectValue placeholder="Categorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle" className="text-xs">Alle categorien</SelectItem>
            <SelectItem value="STRENGTH" className="text-xs">Kracht</SelectItem>
            <SelectItem value="CARDIO" className="text-xs">Cardio</SelectItem>
            <SelectItem value="FLEXIBILITY" className="text-xs">Flexibiliteit</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={(v) => setDifficultyFilter(v as typeof difficultyFilter)}>
          <SelectTrigger className="h-9 w-[130px] text-xs border-border">
            <SelectValue placeholder="Niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle" className="text-xs">Alle niveaus</SelectItem>
            <SelectItem value="BEGINNER" className="text-xs">Beginner</SelectItem>
            <SelectItem value="INTERMEDIATE" className="text-xs">Gemiddeld</SelectItem>
            <SelectItem value="ADVANCED" className="text-xs">Gevorderd</SelectItem>
          </SelectContent>
        </Select>
        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger className="h-9 w-[140px] text-xs border-border">
            <SelectValue placeholder="Equipment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle" className="text-xs">Alle equipment</SelectItem>
            {allEquipment.map(eq => (
              <SelectItem key={eq} value={eq} className="text-xs capitalize">{eq}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={muscleFilter} onValueChange={setMuscleFilter}>
          <SelectTrigger className="h-9 w-[140px] text-xs border-border">
            <SelectValue placeholder="Spiergroep" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle" className="text-xs">Alle spiergroepen</SelectItem>
            {allMuscles.map(m => (
              <SelectItem key={m} value={m} className="text-xs capitalize">{m}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((exercise) => (
          <ExerciseCard key={exercise.id} exercise={exercise} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Search className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Geen oefeningen gevonden</p>
          <p className="text-xs text-muted-foreground mt-1">Pas je filters of zoekterm aan.</p>
        </div>
      )}

      {/* Add Exercise Dialog */}
      <AddExerciseDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const catInfo = categoryLabels[exercise.category]
  const diffInfo = difficultyLabels[exercise.difficulty]

  return (
    <Card className="border-border shadow-sm hover:border-primary/30 transition-all group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Thumbnails */}
          <div className="flex gap-1 shrink-0">
            <div className="size-14 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
              <Dumbbell className="size-5 text-muted-foreground" />
            </div>
            <div className="size-14 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
              <Dumbbell className="size-5 text-muted-foreground/50" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground truncate">{exercise.name}</p>
              {exercise.video_url && (
                <button className="shrink-0" title="Video beschikbaar">
                  <Video className="size-3.5 text-primary" />
                </button>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              <Badge className={cn("text-[10px] px-1.5 py-0 h-5 border", catInfo.color)}>{catInfo.label}</Badge>
              <Badge className={cn("text-[10px] px-1.5 py-0 h-5 border", diffInfo.color)}>{diffInfo.label}</Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground capitalize">
                {exercise.force_type}
              </Badge>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground capitalize">
                {exercise.mechanic}
              </Badge>
            </div>

            {/* Spiergroepen & equipment */}
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground capitalize">{exercise.equipment_needed}</span>
              {exercise.muscle_groups.map(m => (
                <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 text-primary capitalize">{m}</span>
              ))}
              {exercise.secondary_muscles.map(m => (
                <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground/70 capitalize">{m}</span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Edit3 className="mr-2 size-3.5" />Bewerken</DropdownMenuItem>
              <DropdownMenuItem><Video className="mr-2 size-3.5" />Video toevoegen</DropdownMenuItem>
              <DropdownMenuItem><Copy className="mr-2 size-3.5" />Dupliceren</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 size-3.5" />Verwijderen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

function AddExerciseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Oefening toevoegen</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Naam</label>
            <Input placeholder="bijv. Romanian Deadlift" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Categorie</label>
              <Select>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="STRENGTH">Kracht</SelectItem>
                  <SelectItem value="CARDIO">Cardio</SelectItem>
                  <SelectItem value="FLEXIBILITY">Flexibiliteit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Equipment</label>
              <Select>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecteer..." /></SelectTrigger>
                <SelectContent>
                  {["barbell", "dumbbell", "cable", "machine", "body only", "bands", "kettlebells"].map(eq => (
                    <SelectItem key={eq} value={eq} className="capitalize">{eq}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Spiergroepen</label>
            <Input placeholder="bijv. chest, triceps (komma-gescheiden)" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Video URL (YouTube)</label>
            <Input placeholder="https://youtube.com/watch?v=..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-foreground">Instructies</label>
            <Textarea placeholder="Beschrijf de uitvoering van de oefening..." rows={3} className="resize-none" />
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Annuleren</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Opslaan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// TAB 3: WORKOUT BUILDER
// ============================================================================

function WorkoutBuilder({ exercises }: { exercises: Exercise[] }) {
  const [workoutName, setWorkoutName] = useState("")
  const [workoutDescription, setWorkoutDescription] = useState("")
  const [previewMode, setPreviewMode] = useState(false)
  const [oefeningDialogOpen, setOefeningDialogOpen] = useState(false)
  const [zoekOefening, setZoekOefening] = useState("")
  const [addToSection, setAddToSection] = useState<WorkoutSection>("workout")

  // Mock exercises in builder
  const [warmUp] = useState<WorkoutExercise[]>([])
  const [workoutExercises] = useState<WorkoutExercise[]>([
    { id: "wb1", exercise_id: "ex_001", exercise_name: "Bench Press", muscle_group: "chest", order_index: 0, sets: 4, reps: "8-10", rest_seconds: 120, intensity_type: "RPE", intensity_value: "8", tempo: "3-1-2-0", section: "workout", notes: "", video_url: "https://youtube.com/watch?v=example1" },
    { id: "wb2", exercise_id: "ex_002", exercise_name: "Squat", muscle_group: "quadriceps", order_index: 1, sets: 4, reps: "6", rest_seconds: 180, intensity_type: "RPE", intensity_value: "7", tempo: "3-1-2-0", section: "workout", notes: "Diepte bewaken", video_url: "https://youtube.com/watch?v=example2" },
  ])
  const [coolDown] = useState<WorkoutExercise[]>([])

  if (previewMode) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setPreviewMode(false)}>
              <ArrowLeft className="size-4" />
              <span className="sr-only">Terug</span>
            </Button>
            <div>
              <h2 className="text-lg font-bold text-foreground">Preview: {workoutName || "Naamloos"}</h2>
              <p className="text-xs text-muted-foreground">Zo ziet de client de workout in de app</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(false)} className="gap-1.5 text-xs">
            <Edit3 className="size-3.5" />
            Bewerken
          </Button>
        </div>

        {/* Client preview card */}
        <Card className="border-border max-w-lg">
          <CardContent className="p-5">
            <h3 className="text-base font-bold text-foreground">{workoutName || "Workout"}</h3>
            {workoutDescription && <p className="text-xs text-muted-foreground mt-1">{workoutDescription}</p>}
            <div className="flex flex-col gap-3 mt-4">
              {[...warmUp, ...workoutExercises, ...coolDown].map((ex, i) => (
                <div key={ex.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{ex.exercise_name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {ex.sets} sets &times; {ex.reps} reps &middot; {ex.intensity_type} {ex.intensity_value} &middot; Rust {ex.rest_seconds}s
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Workout Builder</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Stel een workout template samen</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border" onClick={() => setPreviewMode(true)}>
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
            <Check className="size-3.5" />
            Opslaan
          </Button>
        </div>
      </div>

      {/* Workout info */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Workout naam</label>
              <Input
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                placeholder="bijv. Upper Body Kracht"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Beschrijving</label>
              <Input
                value={workoutDescription}
                onChange={(e) => setWorkoutDescription(e.target.value)}
                placeholder="Korte beschrijving..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Secties */}
      {[
        { label: "Warming-up", items: warmUp, section: "warm_up" as WorkoutSection },
        { label: "Workout", items: workoutExercises, section: "workout" as WorkoutSection },
        { label: "Cooling-down", items: coolDown, section: "cool_down" as WorkoutSection },
      ].map(({ label, items, section }) => (
        <ExerciseSection
          key={section}
          label={label}
          items={items}
          onAddExercise={() => { setAddToSection(section); setOefeningDialogOpen(true) }}
        />
      ))}

      {/* Oefening selectie dialog */}
      <ExerciseSelectionDialog
        open={oefeningDialogOpen}
        onOpenChange={setOefeningDialogOpen}
        exercises={exercises}
        zoek={zoekOefening}
        onZoekChange={setZoekOefening}
      />
    </div>
  )
}

// ============================================================================
// TAB 4: AI GENERATOR
// ============================================================================

function AIGenerator() {
  const [doel, setDoel] = useState("")
  const [ervaring, setErvaring] = useState("")
  const [sessiesPerWeek, setSessiesPerWeek] = useState([4])
  const [sessieDuur, setSessieDuur] = useState([60])
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [resultaat, setResultaat] = useState(false)

  const equipmentOptions = ["barbell", "dumbbell", "cable", "machine", "bands", "kettlebells", "body only"]

  function toggleEquipment(eq: string) {
    setSelectedEquipment(prev =>
      prev.includes(eq) ? prev.filter(e => e !== eq) : [...prev, eq]
    )
  }

  function simuleerAI() {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setResultaat(true)
    }, 2500)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">AI Programma Generator</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Laat AI een compleet trainingsprogramma genereren</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Formulier */}
        <Card className="border-border">
          <CardContent className="p-5 flex flex-col gap-5">
            {/* Client selectie */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Client</label>
              <Select>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecteer een client..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah van Dijk</SelectItem>
                  <SelectItem value="tom">Tom Bakker</SelectItem>
                  <SelectItem value="lisa">Lisa de Vries</SelectItem>
                  <SelectItem value="james">James Peters</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Doel */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Doel</label>
              <Select value={doel} onValueChange={setDoel}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecteer het trainingsdoel..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="afvallen">Afvallen</SelectItem>
                  <SelectItem value="spiermassa">Spiermassa opbouwen</SelectItem>
                  <SelectItem value="kracht">Kracht verhogen</SelectItem>
                  <SelectItem value="uithoudingsvermogen">Uithoudingsvermogen</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ervaring */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Ervaring</label>
              <Select value={ervaring} onValueChange={setErvaring}>
                <SelectTrigger className="text-sm">
                  <SelectValue placeholder="Selecteer ervaringsniveau..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="gevorderd">Gevorderd</SelectItem>
                  <SelectItem value="ervaren">Ervaren</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Equipment */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground">Beschikbare equipment</label>
              <div className="flex flex-wrap gap-2">
                {equipmentOptions.map(eq => (
                  <button
                    key={eq}
                    onClick={() => toggleEquipment(eq)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all border capitalize",
                      selectedEquipment.includes(eq)
                        ? "border-primary bg-primary/5 text-primary font-medium"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    {selectedEquipment.includes(eq) && <Check className="size-3" />}
                    {eq}
                  </button>
                ))}
              </div>
            </div>

            {/* Sessies per week */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Sessies per week</label>
                <span className="text-sm font-semibold text-foreground">{sessiesPerWeek[0]}x</span>
              </div>
              <Slider
                value={sessiesPerWeek}
                onValueChange={setSessiesPerWeek}
                min={1}
                max={7}
                step={1}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>1x/week</span>
                <span>7x/week</span>
              </div>
            </div>

            {/* Sessie duur */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Sessie duur</label>
                <span className="text-sm font-semibold text-foreground">{sessieDuur[0]} min</span>
              </div>
              <Slider
                value={sessieDuur}
                onValueChange={setSessieDuur}
                min={30}
                max={90}
                step={5}
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>30 min</span>
                <span>90 min</span>
              </div>
            </div>

            {/* Genereer knop */}
            <Button
              onClick={simuleerAI}
              disabled={!doel || !ervaring || loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Programma genereren...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Genereer met AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Resultaat */}
        <div className="flex flex-col gap-4">
          {resultaat ? (
            <>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
                <Check className="size-4 text-success" />
                <p className="text-xs font-medium text-success">Programma succesvol gegenereerd</p>
              </div>

              <Card className="border-border">
                <CardContent className="p-4 flex flex-col gap-4">
                  <div>
                    <p className="text-sm font-bold text-foreground">Kracht Hypertrofie 12W</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      12 weken upper/lower split. RPE-gestuurd. Progressieve overbelasting over 3 blokken.
                    </p>
                  </div>

                  <div className="flex gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="size-3" />12 weken</span>
                    <span className="flex items-center gap-1"><Dumbbell className="size-3" />{sessiesPerWeek[0]}x/week</span>
                    <span className="flex items-center gap-1"><Target className="size-3" />{sessiesPerWeek[0] * 12} trainingen</span>
                  </div>

                  <div className="flex gap-1 h-2.5 rounded-full overflow-hidden">
                    <div className="bg-chart-2 rounded-full" style={{ flex: 4 }} />
                    <div className="bg-primary rounded-full" style={{ flex: 4 }} />
                    <div className="bg-chart-3 rounded-full" style={{ flex: 4 }} />
                  </div>

                  {/* Blokken */}
                  <div className="flex flex-col gap-2">
                    {[
                      { naam: "Opbouw", weken: "Week 1-4", kleur: "bg-chart-2", desc: "Volume opbouwen, techniek" },
                      { naam: "Intensificatie", weken: "Week 5-8", kleur: "bg-primary", desc: "Intensiteit verhogen" },
                      { naam: "Piek & Taper", weken: "Week 9-12", kleur: "bg-chart-3", desc: "Maximale kracht, deload" },
                    ].map((blok) => (
                      <div key={blok.naam} className="flex items-center gap-3 p-2.5 rounded-lg bg-secondary/40">
                        <div className={cn("size-2.5 rounded-full shrink-0", blok.kleur)} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">{blok.naam}</p>
                          <p className="text-[10px] text-muted-foreground">{blok.weken} &middot; {blok.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Voorbeeld trainingen */}
                  <div className="border-t border-border pt-3 flex flex-col gap-2">
                    <p className="text-[11px] font-medium text-muted-foreground">Voorbeeld week 1</p>
                    {[
                      { dag: "Ma", naam: "Upper Kracht", oefen: 5 },
                      { dag: "Di", naam: "Lower Kracht", oefen: 5 },
                      { dag: "Do", naam: "Upper Hypertrofie", oefen: 6 },
                      { dag: "Vr", naam: "Lower Hypertrofie", oefen: 5 },
                    ].slice(0, sessiesPerWeek[0]).map((t) => (
                      <div key={t.dag} className="flex items-center gap-2 text-xs">
                        <span className="w-6 font-medium text-muted-foreground">{t.dag}</span>
                        <div className="size-1 rounded-full bg-primary" />
                        <span className="text-foreground">{t.naam}</span>
                        <span className="text-muted-foreground">({t.oefen} oefeningen)</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs gap-1.5 border-border"
                  onClick={() => { setResultaat(false) }}
                >
                  <RotateCcw className="size-3.5" />
                  Opnieuw
                </Button>
                <Button className="flex-1 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Check className="size-3.5" />
                  Opslaan
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Sparkles className="size-6 text-primary" />
                </div>
                <p className="text-sm font-semibold text-foreground">Genereer een programma</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Vul de gegevens in en laat AI een compleet trainingsprogramma genereren met blokken, weken en oefeningen.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// SHARED: EXERCISE SELECTION DIALOG
// ============================================================================

function ExerciseSelectionDialog({ open, onOpenChange, exercises, zoek, onZoekChange }: {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercises: Exercise[]
  zoek: string
  onZoekChange: (value: string) => void
}) {
  const filtered = exercises.filter(o =>
    o.name.toLowerCase().includes(zoek.toLowerCase()) ||
    o.muscle_groups.some(m => m.toLowerCase().includes(zoek.toLowerCase())) ||
    o.equipment_needed.toLowerCase().includes(zoek.toLowerCase())
  )

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
              placeholder="Zoek op naam, spiergroep of equipment..."
              value={zoek}
              onChange={(e) => onZoekChange(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-72">
            <div className="flex flex-col gap-0.5">
              {filtered.map((ex) => {
                const catInfo = categoryLabels[ex.category]
                return (
                  <button
                    key={ex.id}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-md hover:bg-secondary/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-secondary flex items-center justify-center">
                        <Dumbbell className="size-3.5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{ex.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {ex.muscle_groups.join(", ")} &middot; {ex.equipment_needed} &middot; {ex.mechanic}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-[9px] px-1.5 py-0 h-4 border", catInfo.color)}>{catInfo.label}</Badge>
                      {ex.video_url && (
                        <Badge variant="outline" className="text-[9px] gap-0.5 border-primary/20 text-primary">
                          <Play className="size-2.5" />Video
                        </Badge>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </ScrollArea>

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
