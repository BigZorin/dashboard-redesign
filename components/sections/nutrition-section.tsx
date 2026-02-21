"use client"

import { useState, useMemo } from "react"
import {
  Plus,
  MoreHorizontal,
  Copy,
  Users,
  Utensils,
  Clock,
  ChefHat,
  Search,
  Sparkles,
  ChevronRight,
  Check,
  Loader2,
  RotateCcw,
  Pill,
  Edit3,
  Trash2,
  PieChart,
  CalendarDays,
  ArrowUp,
  ArrowDown,
  X,
  Eye,
  BookOpen,
  Target,
  TrendingUp,
  Apple,
  Filter,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
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
// TYPES
// ============================================================================

interface MacroTargets {
  dailyCalories: number
  dailyProteinGrams: number
  dailyCarbsGrams: number
  dailyFatGrams: number
}

interface DayLog {
  date: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface NutritionClient {
  id: string
  name: string
  initials: string
  targets: MacroTargets
  weekLogs: DayLog[]
  plan: string
  adherence: number
}

interface Recipe {
  id: string
  title: string
  description: string
  imageUrl: string | null
  servings: number
  prepTimeMin: number
  cookTimeMin: number
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  instructions: string
  tags: string[]
  ingredients: { name: string; amount: number; unit: string }[]
}

interface MealPlanEntry {
  dayOfWeek: number
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"
  recipeId: string | null
  customTitle: string
}

interface MealPlan {
  id: string
  name: string
  description: string
  dailyCalories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  clientCount: number
  entries: MealPlanEntry[]
}

interface Supplement {
  id: string
  clientId: string
  name: string
  dosage: string
  timing: string
  frequency: string
  notes: string
  isActive: boolean
}

// ============================================================================
// MACRO KLEUREN
// ============================================================================

const MACRO_COLORS = {
  protein: { bg: "bg-blue-500", bgLight: "bg-blue-500/10", text: "text-blue-500", hex: "#3b82f6" },
  carbs: { bg: "bg-amber-500", bgLight: "bg-amber-500/10", text: "text-amber-500", hex: "#f59e0b" },
  fat: { bg: "bg-rose-500", bgLight: "bg-rose-500/10", text: "text-rose-500", hex: "#f43f5e" },
  calories: { bg: "bg-emerald-500", bgLight: "bg-emerald-500/10", text: "text-emerald-500", hex: "#22c55e" },
}

// ============================================================================
// DEFAULT MOCK DATA
// ============================================================================

function recentDates(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (n - 1 - i))
    return d.toISOString().split("T")[0]
  })
}
const last7 = recentDates(7)
const dayNames = ["Zo", "Ma", "Di", "Wo", "Do", "Vr", "Za"]
function dayLabel(dateStr: string) { return dayNames[new Date(dateStr).getDay()] }

const defaultClients: NutritionClient[] = [
  {
    id: "c1", name: "Sarah van Dijk", initials: "SD", plan: "Hoog Eiwit Lean", adherence: 92,
    targets: { dailyCalories: 2200, dailyProteinGrams: 170, dailyCarbsGrams: 230, dailyFatGrams: 65 },
    weekLogs: last7.map((d, i) => ({
      date: d, calories: 2200 + [-40, 80, -20, 50, -60, 30, -10][i],
      protein: 170 + [-5, 8, -2, 4, -6, 3, -1][i], carbs: 230 + [-10, 15, -8, 12, -15, 5, -3][i], fat: 65 + [-2, 3, -1, 2, -3, 1, 0][i],
    })),
  },
  {
    id: "c2", name: "Tom Bakker", initials: "TB", plan: "Afvallen Deficit", adherence: 74,
    targets: { dailyCalories: 1800, dailyProteinGrams: 160, dailyCarbsGrams: 150, dailyFatGrams: 55 },
    weekLogs: last7.map((d, i) => ({
      date: d, calories: 1800 + [200, -50, 300, -20, 180, -80, 250][i],
      protein: 160 + [-15, 5, -20, 8, -10, 3, -12][i], carbs: 150 + [30, -10, 40, -5, 25, -15, 35][i], fat: 55 + [10, -2, 15, -3, 8, -5, 12][i],
    })),
  },
  {
    id: "c3", name: "Lisa de Vries", initials: "LV", plan: "Wedstrijd Prep Piek", adherence: 97,
    targets: { dailyCalories: 2000, dailyProteinGrams: 200, dailyCarbsGrams: 180, dailyFatGrams: 45 },
    weekLogs: last7.map((d, i) => ({
      date: d, calories: 2000 + [-10, 5, -15, 8, -5, 12, -8][i],
      protein: 200 + [-2, 1, -3, 2, -1, 3, -2][i], carbs: 180 + [-5, 3, -8, 4, -2, 6, -4][i], fat: 45 + [-1, 0, -2, 1, -1, 1, 0][i],
    })),
  },
]

const defaultRecipes: Recipe[] = [
  {
    id: "r1", title: "Griekse Yoghurt Bowl", description: "Romige Griekse yoghurt met vers fruit, noten en honing", imageUrl: null,
    servings: 1, prepTimeMin: 5, cookTimeMin: 0, calories: 320, proteinGrams: 28, carbsGrams: 32, fatGrams: 10,
    instructions: "1. Doe de yoghurt in een kom.\n2. Voeg blauwe bessen en plakjes banaan toe.\n3. Bestrooi met granola en walnoten.\n4. Besprenkel met honing.",
    tags: ["Ontbijt", "High Protein", "Vegetarisch", "Snel"],
    ingredients: [
      { name: "Griekse yoghurt", amount: 200, unit: "g" }, { name: "Blauwe bessen", amount: 50, unit: "g" },
      { name: "Banaan", amount: 0.5, unit: "stuk" }, { name: "Granola", amount: 25, unit: "g" },
      { name: "Walnoten", amount: 10, unit: "g" }, { name: "Honing", amount: 1, unit: "el" },
    ],
  },
  {
    id: "r2", title: "Kip-Broccoli Rijst", description: "Klassieke maaltijdprep: gegrilde kip met gestoomde broccoli en rijst", imageUrl: null,
    servings: 2, prepTimeMin: 10, cookTimeMin: 25, calories: 520, proteinGrams: 45, carbsGrams: 55, fatGrams: 12,
    instructions: "1. Kook de rijst volgens de verpakking.\n2. Grill de kipfilet met kruiden.\n3. Stoom de broccoli 5 minuten.\n4. Verdeel over bakjes.",
    tags: ["Mealprep", "High Protein", "Lunch"],
    ingredients: [
      { name: "Kipfilet", amount: 300, unit: "g" }, { name: "Basmatirijst", amount: 160, unit: "g" },
      { name: "Broccoli", amount: 200, unit: "g" }, { name: "Olijfolie", amount: 1, unit: "el" },
      { name: "Kipkruiden", amount: 1, unit: "tl" },
    ],
  },
  {
    id: "r3", title: "Eiwitpannenkoeken", description: "Luchtige pannenkoeken met extra eiwit, perfect voor na de training", imageUrl: null,
    servings: 2, prepTimeMin: 5, cookTimeMin: 10, calories: 380, proteinGrams: 35, carbsGrams: 38, fatGrams: 8,
    instructions: "1. Mix ei, havermout, kwark en bakpoeder.\n2. Bak op middelhoog vuur.\n3. Serveer met bessen en een schep kwark.",
    tags: ["Ontbijt", "High Protein", "Post-Workout"],
    ingredients: [
      { name: "Eieren", amount: 2, unit: "stuk" }, { name: "Havermout", amount: 50, unit: "g" },
      { name: "Magere kwark", amount: 100, unit: "g" }, { name: "Bakpoeder", amount: 0.5, unit: "tl" },
      { name: "Frambozen", amount: 50, unit: "g" },
    ],
  },
  {
    id: "r4", title: "Overnight Oats", description: "Havermout die je 's avonds klaarmaakt voor een snel ontbijt", imageUrl: null,
    servings: 1, prepTimeMin: 5, cookTimeMin: 0, calories: 350, proteinGrams: 22, carbsGrams: 48, fatGrams: 8,
    instructions: "1. Meng havermout, melk, yoghurt en chiazaad.\n2. Zet minimaal 6 uur in de koelkast.\n3. Top met fruit en noten.",
    tags: ["Ontbijt", "Mealprep", "Vegetarisch"],
    ingredients: [
      { name: "Havermout", amount: 60, unit: "g" }, { name: "Halfvolle melk", amount: 150, unit: "ml" },
      { name: "Griekse yoghurt", amount: 50, unit: "g" }, { name: "Chiazaad", amount: 10, unit: "g" },
      { name: "Aardbeien", amount: 50, unit: "g" },
    ],
  },
]

const defaultMealPlans: MealPlan[] = [
  {
    id: "mp1", name: "Hoog Eiwit Weekplan", description: "Gevarieerd plan gericht op 170g+ eiwit per dag",
    dailyCalories: 2200, proteinGrams: 170, carbsGrams: 230, fatGrams: 65, clientCount: 8,
    entries: [
      { dayOfWeek: 1, mealType: "BREAKFAST", recipeId: "r1", customTitle: "" },
      { dayOfWeek: 1, mealType: "LUNCH", recipeId: "r2", customTitle: "" },
      { dayOfWeek: 1, mealType: "DINNER", recipeId: null, customTitle: "Zalm met zoete aardappel" },
      { dayOfWeek: 1, mealType: "SNACK", recipeId: "r3", customTitle: "" },
      { dayOfWeek: 2, mealType: "BREAKFAST", recipeId: "r4", customTitle: "" },
      { dayOfWeek: 2, mealType: "LUNCH", recipeId: "r2", customTitle: "" },
      { dayOfWeek: 2, mealType: "DINNER", recipeId: null, customTitle: "Gehaktschotel met groenten" },
    ],
  },
]

const defaultSupplements: Supplement[] = [
  { id: "s1", clientId: "c1", name: "Creatine Monohydraat", dosage: "5g", timing: "Na training", frequency: "Dagelijks", notes: "Met water innemen", isActive: true },
  { id: "s2", clientId: "c1", name: "Omega-3 Visolie", dosage: "1000mg", timing: "Bij ontbijt", frequency: "Dagelijks", notes: "EPA/DHA complex", isActive: true },
  { id: "s3", clientId: "c1", name: "Vitamine D3", dosage: "2000 IU", timing: "Bij ontbijt", frequency: "Dagelijks", notes: "Oktober t/m maart", isActive: false },
  { id: "s4", clientId: "c2", name: "Creatine Monohydraat", dosage: "5g", timing: "Na training", frequency: "Dagelijks", notes: "", isActive: true },
  { id: "s5", clientId: "c2", name: "Whey Protein Isolaat", dosage: "30g", timing: "Na training", frequency: "Trainingsdagen", notes: "Met water of melk", isActive: true },
]

// ============================================================================
// PROPS INTERFACE
// ============================================================================

export interface NutritionSectionProps {
  clients?: NutritionClient[]
  recipes?: Recipe[]
  mealPlans?: MealPlan[]
  supplements?: Supplement[]
  loading?: boolean
}

// ============================================================================
// MAIN COMPONENT — 4 TABS + AI PROMINENT
// ============================================================================

export function NutritionSection({
  clients = defaultClients,
  recipes = defaultRecipes,
  mealPlans = defaultMealPlans,
  supplements = defaultSupplements,
  loading = false,
}: NutritionSectionProps) {
  const [activeTab, setActiveTab] = useState("macros")

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-10 w-96" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border p-0">
              <CardContent className="p-5">
                <Skeleton className="h-5 w-32 mb-3" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
                <div className="mt-4 flex flex-col gap-2">
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-full" />
                  <Skeleton className="h-2 w-full" />
                </div>
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
            <p className="text-base font-bold text-white">Genereer voedingsplan met AI</p>
            <p className="text-sm text-white/70 mt-0.5">
              Laat AI een compleet maaltijdplan genereren op basis van macro-doelen, allergieën en voorkeuren van je client.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
            <span>Start</span>
            <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </button>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-3xl grid-cols-5">
          <TabsTrigger value="macros" className="gap-1.5 text-xs">
            <PieChart className="size-3.5" />
            Macro Overzicht
          </TabsTrigger>
          <TabsTrigger value="recepten" className="gap-1.5 text-xs">
            <ChefHat className="size-3.5" />
            Recepten
          </TabsTrigger>
          <TabsTrigger value="plannen" className="gap-1.5 text-xs">
            <CalendarDays className="size-3.5" />
            Maaltijdplannen
          </TabsTrigger>
          <TabsTrigger value="supplementen" className="gap-1.5 text-xs">
            <Pill className="size-3.5" />
            Supplementen
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5 text-xs">
            <Sparkles className="size-3.5" />
            AI Generator
          </TabsTrigger>
        </TabsList>

        <TabsContent value="macros" className="mt-6">
          <MacroOverview clients={clients} />
        </TabsContent>
        <TabsContent value="recepten" className="mt-6">
          <RecipesTab recipes={recipes} />
        </TabsContent>
        <TabsContent value="plannen" className="mt-6">
          <MealPlansTab mealPlans={mealPlans} recipes={recipes} clients={clients} />
        </TabsContent>
        <TabsContent value="supplementen" className="mt-6">
          <SupplementsTab supplements={supplements} clients={clients} />
        </TabsContent>
        <TabsContent value="ai" className="mt-6">
          <NutritionAIGenerator clients={clients} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================================
// HELPER: Macro Progress Bar
// ============================================================================

function MacroBar({ label, current, target, color }: { label: string; current: number; target: number; color: typeof MACRO_COLORS.protein }) {
  const pct = target > 0 ? Math.min((current / target) * 100, 120) : 0
  const over = current > target
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold", over ? "text-destructive" : "text-foreground")}>{current} / {target}{label === "Calorieën" ? " kcal" : "g"}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div className={cn("h-full rounded-full transition-all", color.bg)} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  )
}

// ============================================================================
// HELPER: Donut Chart (SVG)
// ============================================================================

function MacroDonut({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) {
  const total = protein + carbs + fat
  if (total === 0) return null
  const pP = (protein / total) * 100
  const pC = (carbs / total) * 100
  const r = 42, circ = 2 * Math.PI * r
  const s1 = 0, l1 = (pP / 100) * circ
  const s2 = l1, l2 = (pC / 100) * circ
  const s3 = s2 + l2, l3 = circ - l1 - l2

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="size-28 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke={MACRO_COLORS.protein.hex} strokeWidth="12" strokeDasharray={`${l1} ${circ - l1}`} strokeDashoffset={0} />
        <circle cx="50" cy="50" r={r} fill="none" stroke={MACRO_COLORS.carbs.hex} strokeWidth="12" strokeDasharray={`${l2} ${circ - l2}`} strokeDashoffset={-s2} />
        <circle cx="50" cy="50" r={r} fill="none" stroke={MACRO_COLORS.fat.hex} strokeWidth="12" strokeDasharray={`${l3} ${circ - l3}`} strokeDashoffset={-s3} />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-foreground">{total}</span>
        <span className="text-[10px] text-muted-foreground">gram</span>
      </div>
    </div>
  )
}

// ============================================================================
// TAB 1: MACRO OVERZICHT
// ============================================================================

function MacroOverview({ clients }: { clients: NutritionClient[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [showTargetDialog, setShowTargetDialog] = useState(false)

  const selectedClient = clients.find(c => c.id === selectedClientId)

  if (!selectedClient) {
    // Overzichtskaarten van alle clients
    return (
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Macro Overzicht</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Selecteer een client voor gedetailleerde macro tracking</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => {
            const avgCal = Math.round(client.weekLogs.reduce((s, l) => s + l.calories, 0) / client.weekLogs.length)
            return (
              <Card
                key={client.id}
                className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
                onClick={() => setSelectedClientId(client.id)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-10">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{client.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.plan}</p>
                    </div>
                    <Badge className={cn(
                      "text-[11px]",
                      client.adherence >= 90 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      client.adherence >= 70 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                      "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    )}>{client.adherence}%</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="flex flex-col gap-2">
                    <MacroBar label="Calorieën" current={avgCal} target={client.targets.dailyCalories} color={MACRO_COLORS.calories} />
                    <MacroBar label="Eiwit" current={Math.round(client.weekLogs.reduce((s, l) => s + l.protein, 0) / 7)} target={client.targets.dailyProteinGrams} color={MACRO_COLORS.protein} />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  // Gedetailleerde client view
  const avgP = Math.round(selectedClient.weekLogs.reduce((s, l) => s + l.protein, 0) / 7)
  const avgC = Math.round(selectedClient.weekLogs.reduce((s, l) => s + l.carbs, 0) / 7)
  const avgF = Math.round(selectedClient.weekLogs.reduce((s, l) => s + l.fat, 0) / 7)
  const avgCal = Math.round(selectedClient.weekLogs.reduce((s, l) => s + l.calories, 0) / 7)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setSelectedClientId(null)}>
            <X className="size-4" />
            Terug
          </Button>
          <Avatar className="size-9"><AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">{selectedClient.initials}</AvatarFallback></Avatar>
          <div>
            <p className="text-sm font-bold text-foreground">{selectedClient.name}</p>
            <p className="text-[11px] text-muted-foreground">{selectedClient.plan}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 text-xs bg-gradient-to-r from-[#6c3caf] to-[#5b2d9e] hover:from-[#7c4dbd] hover:to-[#6c3caf] text-white border-0"
          >
            <Sparkles className="size-3.5" />
            AI Voedingsadvies
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border" onClick={() => setShowTargetDialog(true)}>
            <Target className="size-3.5" />
            Targets aanpassen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* Donut + legend */}
        <Card className="border-border">
          <CardContent className="p-5 flex flex-col items-center gap-4">
            <p className="text-xs font-medium text-muted-foreground">Gem. macroverdeling (7d)</p>
            <MacroDonut protein={avgP} carbs={avgC} fat={avgF} />
            <div className="flex flex-col gap-2 w-full">
              {[
                { label: "Eiwit", val: avgP, col: MACRO_COLORS.protein },
                { label: "Koolhydraten", val: avgC, col: MACRO_COLORS.carbs },
                { label: "Vet", val: avgF, col: MACRO_COLORS.fat },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={cn("size-2.5 rounded-full", m.col.bg)} />
                    <span className="text-muted-foreground">{m.label}</span>
                  </div>
                  <span className="font-semibold text-foreground">{m.val}g</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Targets vs werkelijk */}
        <Card className="border-border">
          <CardContent className="p-5 flex flex-col gap-4">
            <p className="text-xs font-medium text-muted-foreground">Targets vs werkelijk (gem. 7d)</p>
            <div className="flex flex-col gap-3">
              <MacroBar label="Calorieën" current={avgCal} target={selectedClient.targets.dailyCalories} color={MACRO_COLORS.calories} />
              <MacroBar label="Eiwit" current={avgP} target={selectedClient.targets.dailyProteinGrams} color={MACRO_COLORS.protein} />
              <MacroBar label="Koolhydraten" current={avgC} target={selectedClient.targets.dailyCarbsGrams} color={MACRO_COLORS.carbs} />
              <MacroBar label="Vet" current={avgF} target={selectedClient.targets.dailyFatGrams} color={MACRO_COLORS.fat} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dagelijkse compliance tabel */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Dagelijkse compliance (laatste 7 dagen)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Dag</TableHead>
                <TableHead className="text-xs text-right">Kcal</TableHead>
                <TableHead className="text-xs text-right">Eiwit</TableHead>
                <TableHead className="text-xs text-right">Koolh.</TableHead>
                <TableHead className="text-xs text-right">Vet</TableHead>
                <TableHead className="text-xs text-right">Adherence</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedClient.weekLogs.map((log) => {
                const calAdh = Math.round((log.calories / selectedClient.targets.dailyCalories) * 100)
                const adh = Math.min(calAdh > 100 ? 200 - calAdh : calAdh, 100)
                return (
                  <TableRow key={log.date}>
                    <TableCell className="text-xs font-medium">{dayLabel(log.date)} {log.date.slice(5)}</TableCell>
                    <TableCell className="text-xs text-right font-medium">{log.calories}</TableCell>
                    <TableCell className="text-xs text-right">{log.protein}g</TableCell>
                    <TableCell className="text-xs text-right">{log.carbs}g</TableCell>
                    <TableCell className="text-xs text-right">{log.fat}g</TableCell>
                    <TableCell className="text-right">
                      <Badge className={cn(
                        "text-[10px]",
                        adh >= 90 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                        adh >= 70 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                        "bg-rose-500/10 text-rose-500 border-rose-500/20"
                      )}>{adh}%</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Targets aanpassen dialog */}
      <Dialog open={showTargetDialog} onOpenChange={setShowTargetDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle className="text-base">Targets aanpassen</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            {[
              { label: "Calorieën (kcal)", val: selectedClient.targets.dailyCalories },
              { label: "Eiwit (gram)", val: selectedClient.targets.dailyProteinGrams },
              { label: "Koolhydraten (gram)", val: selectedClient.targets.dailyCarbsGrams },
              { label: "Vet (gram)", val: selectedClient.targets.dailyFatGrams },
            ].map(t => (
              <div key={t.label} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">{t.label}</label>
                <Input type="number" defaultValue={t.val} className="h-9" />
              </div>
            ))}
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10" onClick={() => setShowTargetDialog(false)}>
              <Check className="size-4" /> Opslaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// TAB 2: RECEPTEN
// ============================================================================

function RecipesTab({ recipes }: { recipes: Recipe[] }) {
  const [zoek, setZoek] = useState("")
  const [tagFilter, setTagFilter] = useState<string>("alle")
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [showNewDialog, setShowNewDialog] = useState(false)

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    recipes.forEach(r => r.tags.forEach(t => tags.add(t)))
    return Array.from(tags).sort()
  }, [recipes])

  const filtered = useMemo(() => {
    return recipes.filter(r => {
      const matchZoek = r.title.toLowerCase().includes(zoek.toLowerCase()) || r.description.toLowerCase().includes(zoek.toLowerCase())
      const matchTag = tagFilter === "alle" || r.tags.includes(tagFilter)
      return matchZoek && matchTag
    })
  }, [recipes, zoek, tagFilter])

  // Detail view
  if (selectedRecipe) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setSelectedRecipe(null)}>
            <X className="size-4" /> Terug
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
            <Edit3 className="size-3.5" /> Bewerken
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-bold text-foreground">{selectedRecipe.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{selectedRecipe.description}</p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {selectedRecipe.tags.map(t => (
                  <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>
                ))}
              </div>
            </div>

            <div className="flex gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Clock className="size-3.5" />{selectedRecipe.prepTimeMin}m prep</span>
              <span className="flex items-center gap-1"><Clock className="size-3.5" />{selectedRecipe.cookTimeMin}m koken</span>
              <span className="flex items-center gap-1"><Users className="size-3.5" />{selectedRecipe.servings} porties</span>
            </div>

            {/* Macro badges */}
            <div className="flex gap-3">
              {[
                { label: "Kcal", val: selectedRecipe.calories, col: MACRO_COLORS.calories },
                { label: "Eiwit", val: `${selectedRecipe.proteinGrams}g`, col: MACRO_COLORS.protein },
                { label: "Koolh.", val: `${selectedRecipe.carbsGrams}g`, col: MACRO_COLORS.carbs },
                { label: "Vet", val: `${selectedRecipe.fatGrams}g`, col: MACRO_COLORS.fat },
              ].map(m => (
                <div key={m.label} className={cn("flex flex-col items-center gap-0.5 rounded-lg px-4 py-2", m.col.bgLight)}>
                  <span className={cn("text-sm font-bold", m.col.text)}>{m.val}</span>
                  <span className="text-[10px] text-muted-foreground">{m.label}</span>
                </div>
              ))}
            </div>

            {/* Bereidingswijze */}
            <Card className="border-border">
              <CardHeader className="pb-2"><CardTitle className="text-sm">Bereidingswijze</CardTitle></CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm text-foreground whitespace-pre-line">{selectedRecipe.instructions}</div>
              </CardContent>
            </Card>
          </div>

          {/* Ingredienten sidebar */}
          <Card className="border-border h-fit">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Ingrediënten</CardTitle></CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                {selectedRecipe.ingredients.map((ing, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                    <span className="text-foreground">{ing.name}</span>
                    <span className="text-muted-foreground font-medium">{ing.amount} {ing.unit}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Recepten</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer je receptenbibliotheek</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => setShowNewDialog(true)}>
          <Plus className="size-4" /> Nieuw recept
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setTagFilter("alle")} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", tagFilter === "alle" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>Alle</button>
          {allTags.map(t => (
            <button key={t} onClick={() => setTagFilter(t)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", tagFilter === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground")}>{t}</button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Zoek recepten..." value={zoek} onChange={(e) => setZoek(e.target.value)} className="pl-9 h-9 w-64 bg-card border-border" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((recipe) => (
          <Card key={recipe.id} className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setSelectedRecipe(recipe)}>
            <div className="h-32 bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center">
              <ChefHat className="size-10 text-primary/30" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{recipe.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{recipe.description}</p>
                </div>
              </div>
              <div className="mt-2 flex gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="size-3" />{recipe.prepTimeMin + recipe.cookTimeMin}m</span>
                <span className="flex items-center gap-1"><Users className="size-3" />{recipe.servings} porties</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Badge className={cn("text-[10px] border", MACRO_COLORS.calories.bgLight, MACRO_COLORS.calories.text, `border-emerald-500/20`)}>{recipe.calories} kcal</Badge>
                <Badge className={cn("text-[10px] border", MACRO_COLORS.protein.bgLight, MACRO_COLORS.protein.text, `border-blue-500/20`)}>{recipe.proteinGrams}g P</Badge>
                <Badge className={cn("text-[10px] border", MACRO_COLORS.carbs.bgLight, MACRO_COLORS.carbs.text, `border-amber-500/20`)}>{recipe.carbsGrams}g K</Badge>
                <Badge className={cn("text-[10px] border", MACRO_COLORS.fat.bgLight, MACRO_COLORS.fat.text, `border-rose-500/20`)}>{recipe.fatGrams}g V</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {recipe.tags.map(t => <Badge key={t} variant="secondary" className="text-[9px]">{t}</Badge>)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-4"><ChefHat className="size-6 text-muted-foreground" /></div>
          <p className="text-sm font-semibold text-foreground">Geen recepten gevonden</p>
          <p className="text-xs text-muted-foreground mt-1">Pas je filters aan of maak een nieuw recept aan.</p>
        </div>
      )}

      {/* Nieuw recept dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="text-base">Nieuw recept</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Titel</label>
                <Input placeholder="bijv. Griekse yoghurt bowl" className="h-9" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Porties</label>
                <Input type="number" placeholder="2" className="h-9" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Beschrijving</label>
              <Textarea placeholder="Korte beschrijving van het recept..." className="resize-none" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Bereidingstijd (min)</label><Input type="number" placeholder="10" className="h-9" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Kooktijd (min)</label><Input type="number" placeholder="25" className="h-9" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Kcal/portie</label><Input type="number" placeholder="500" className="h-9" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Eiwit (g)</label><Input type="number" placeholder="40" className="h-9" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Koolhydraten (g)</label><Input type="number" placeholder="50" className="h-9" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Vet (g)</label><Input type="number" placeholder="15" className="h-9" /></div>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Ingrediënten</label>
                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 border-dashed"><Plus className="size-3" />Toevoegen</Button>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/50">
                <Input placeholder="Naam" className="h-8 flex-1 text-xs" />
                <Input placeholder="Hoeveelheid" className="h-8 w-20 text-xs" type="number" />
                <Input placeholder="Eenheid" className="h-8 w-20 text-xs" />
                <Button variant="ghost" size="icon" className="size-7"><Trash2 className="size-3.5 text-muted-foreground" /></Button>
              </div>
            </div>
            <Separator />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Bereidingswijze</label>
              <Textarea placeholder="Stap-voor-stap instructies..." className="resize-none" rows={4} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Tags (komma gescheiden)</label>
              <Input placeholder="High Protein, Mealprep, Lunch" className="h-9" />
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10" onClick={() => setShowNewDialog(false)}>
              <Check className="size-4" /> Recept opslaan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// TAB 3: MAALTIJDPLANNEN
// ============================================================================

const DAYS = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
const MEALS: { key: MealPlanEntry["mealType"]; label: string }[] = [
  { key: "BREAKFAST", label: "Ontbijt" },
  { key: "LUNCH", label: "Lunch" },
  { key: "DINNER", label: "Diner" },
  { key: "SNACK", label: "Snack" },
]

function MealPlansTab({ mealPlans, recipes, clients }: { mealPlans: MealPlan[]; recipes: Recipe[]; clients: NutritionClient[] }) {
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)

  if (selectedPlan) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => setSelectedPlan(null)}>
              <X className="size-4" /> Terug
            </Button>
            <div>
              <h2 className="text-lg font-bold text-foreground">{selectedPlan.name}</h2>
              <p className="text-xs text-muted-foreground">{selectedPlan.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[11px] gap-1">
              <Users className="size-3" />{selectedPlan.clientCount} clienten
            </Badge>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border" onClick={() => setShowAssignDialog(true)}>
              <Users className="size-3.5" /> Toewijzen
            </Button>
          </div>
        </div>

        {/* Macro samenvatting */}
        <div className="flex gap-3">
          {[
            { label: "Kcal", val: selectedPlan.dailyCalories, col: MACRO_COLORS.calories },
            { label: "Eiwit", val: `${selectedPlan.proteinGrams}g`, col: MACRO_COLORS.protein },
            { label: "Koolh.", val: `${selectedPlan.carbsGrams}g`, col: MACRO_COLORS.carbs },
            { label: "Vet", val: `${selectedPlan.fatGrams}g`, col: MACRO_COLORS.fat },
          ].map(m => (
            <div key={m.label} className={cn("flex flex-col items-center gap-0.5 rounded-lg px-4 py-2", m.col.bgLight)}>
              <span className={cn("text-sm font-bold", m.col.text)}>{m.val}</span>
              <span className="text-[10px] text-muted-foreground">{m.label}</span>
            </div>
          ))}
        </div>

        {/* Weekplanner */}
        <Card className="border-border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-[80px_repeat(7,1fr)] min-w-[800px]">
              {/* Header */}
              <div className="p-3 bg-secondary/50 border-b border-border" />
              {DAYS.map(d => (
                <div key={d} className="p-3 bg-secondary/50 border-b border-l border-border text-xs font-semibold text-foreground text-center">{d}</div>
              ))}
              {/* Rows */}
              {MEALS.map(meal => (
                <>
                  <div key={meal.key} className="p-3 border-b border-border flex items-center">
                    <span className="text-xs font-medium text-muted-foreground">{meal.label}</span>
                  </div>
                  {DAYS.map((_, dayIdx) => {
                    const entry = selectedPlan.entries.find(e => e.dayOfWeek === dayIdx + 1 && e.mealType === meal.key)
                    const recipe = entry?.recipeId ? recipes.find(r => r.id === entry.recipeId) : null
                    return (
                      <div key={`${meal.key}-${dayIdx}`} className="p-2 border-b border-l border-border min-h-[56px] hover:bg-secondary/30 transition-colors cursor-pointer group">
                        {recipe ? (
                          <div className="text-[11px]">
                            <p className="font-medium text-foreground line-clamp-1">{recipe.title}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{recipe.calories} kcal</p>
                          </div>
                        ) : entry?.customTitle ? (
                          <div className="text-[11px]">
                            <p className="font-medium text-foreground line-clamp-1">{entry.customTitle}</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus className="size-4 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </>
              ))}
              {/* Daily macro totals row */}
              <div className="p-3 bg-secondary/30 border-b border-border flex items-center">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Totaal</span>
              </div>
              {DAYS.map((_, dayIdx) => {
                const dayEntries = selectedPlan.entries.filter(e => e.dayOfWeek === dayIdx + 1)
                const dayRecipes = dayEntries.map(e => e.recipeId ? recipes.find(r => r.id === e.recipeId) : null).filter(Boolean)
                const totalKcal = dayRecipes.reduce((s, r) => s + (r?.calories ?? 0), 0)
                const totalP = dayRecipes.reduce((s, r) => s + (r?.proteinGrams ?? 0), 0)
                const totalC = dayRecipes.reduce((s, r) => s + (r?.carbsGrams ?? 0), 0)
                const totalF = dayRecipes.reduce((s, r) => s + (r?.fatGrams ?? 0), 0)
                return (
                  <div key={`total-${dayIdx}`} className="p-2 border-b border-l border-border bg-secondary/30">
                    {totalKcal > 0 ? (
                      <div className="flex flex-col gap-0.5 text-[10px]">
                        <span className={cn("font-bold", MACRO_COLORS.calories.text)}>{totalKcal} kcal</span>
                        <span className="text-muted-foreground">P {totalP}g / K {totalC}g / V {totalF}g</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">—</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Toewijzen dialog */}
        <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle className="text-base">Plan toewijzen aan client</DialogTitle></DialogHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Client</label>
                <Select>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Selecteer client..." /></SelectTrigger>
                  <SelectContent>
                    {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Startdatum</label>
                  <Input type="date" className="h-9 text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Einddatum</label>
                  <Input type="date" className="h-9 text-sm" />
                </div>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10" onClick={() => setShowAssignDialog(false)}>
                <Check className="size-4" /> Toewijzen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Maaltijdplannen</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Weekplannen beheren en toewijzen aan clienten</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" /> Nieuw plan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mealPlans.map((plan) => (
          <Card key={plan.id} className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group" onClick={() => setSelectedPlan(plan)}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                    <CalendarDays className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{plan.name}</p>
                    <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] mt-0.5 gap-1">
                      <Users className="size-3" />{plan.clientCount} clienten
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Bewerken</DropdownMenuItem>
                    <DropdownMenuItem><Copy className="mr-2 size-4" />Dupliceren</DropdownMenuItem>
                    <DropdownMenuItem>Toewijzen aan client</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">{plan.description}</p>

              <div className="mt-3 flex gap-2">
                <Badge className={cn("text-[10px] border", MACRO_COLORS.calories.bgLight, MACRO_COLORS.calories.text, "border-emerald-500/20")}>{plan.dailyCalories} kcal</Badge>
                <Badge className={cn("text-[10px] border", MACRO_COLORS.protein.bgLight, MACRO_COLORS.protein.text, "border-blue-500/20")}>{plan.proteinGrams}g P</Badge>
                <Badge className={cn("text-[10px] border", MACRO_COLORS.carbs.bgLight, MACRO_COLORS.carbs.text, "border-amber-500/20")}>{plan.carbsGrams}g K</Badge>
                <Badge className={cn("text-[10px] border", MACRO_COLORS.fat.bgLight, MACRO_COLORS.fat.text, "border-rose-500/20")}>{plan.fatGrams}g V</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// TAB 4: SUPPLEMENTEN
// ============================================================================

function SupplementsTab({ supplements, clients }: { supplements: Supplement[]; clients: NutritionClient[] }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const clientSupplements = selectedClientId ? supplements.filter(s => s.clientId === selectedClientId) : []

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Supplementen</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer supplementen per client</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedClientId ?? ""} onValueChange={setSelectedClientId}>
            <SelectTrigger className="w-48 h-9 text-sm"><SelectValue placeholder="Selecteer client..." /></SelectTrigger>
            <SelectContent>
              {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {selectedClientId && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="gap-1.5 text-xs bg-gradient-to-r from-[#6c3caf] to-[#5b2d9e] hover:from-[#7c4dbd] hover:to-[#6c3caf] text-white border-0"
              >
                <Sparkles className="size-3.5" />
                AI Supplement Advies
              </Button>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2" onClick={() => setShowAddDialog(true)}>
                <Plus className="size-4" /> Toevoegen
              </Button>
            </div>
          )}
        </div>
      </div>

      {!selectedClientId ? (
        <Card className="border-border border-dashed">
          <CardContent className="p-10 flex flex-col items-center justify-center text-center">
            <div className="size-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Pill className="size-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-foreground">Selecteer een client</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">Kies een client uit de dropdown om hun supplementenprotocol te beheren.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Supplement</TableHead>
                  <TableHead className="text-xs">Dosering</TableHead>
                  <TableHead className="text-xs">Timing</TableHead>
                  <TableHead className="text-xs">Frequentie</TableHead>
                  <TableHead className="text-xs">Notities</TableHead>
                  <TableHead className="text-xs text-center">Status</TableHead>
                  <TableHead className="text-xs w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientSupplements.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-8">Nog geen supplementen toegevoegd</TableCell>
                  </TableRow>
                ) : (
                  clientSupplements.map(s => (
                    <TableRow key={s.id}>
                      <TableCell className="text-sm font-medium text-foreground">{s.name}</TableCell>
                      <TableCell className="text-sm">{s.dosage}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.timing}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.frequency}</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[160px] truncate">{s.notes || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge className={cn("text-[10px]", s.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-secondary text-muted-foreground")}>
                          {s.isActive ? "Actief" : "Gestopt"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-3.5" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Edit3 className="mr-2 size-3.5" />Bewerken</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 size-3.5" />Verwijderen</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Supplement toevoegen dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="text-base">Supplement toevoegen</DialogTitle></DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Naam</label><Input placeholder="bijv. Creatine Monohydraat" className="h-9" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Dosering</label><Input placeholder="bijv. 5g" className="h-9" /></div>
              <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Frequentie</label><Input placeholder="bijv. Dagelijks" className="h-9" /></div>
            </div>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Timing</label><Input placeholder="bijv. Na training" className="h-9" /></div>
            <div className="flex flex-col gap-1.5"><label className="text-xs font-medium text-foreground">Notities</label><Textarea placeholder="Optionele opmerkingen..." className="resize-none" rows={2} /></div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10" onClick={() => setShowAddDialog(false)}>
              <Check className="size-4" /> Toevoegen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// TAB 5: AI VOEDINGSPLAN GENERATOR
// ============================================================================

function NutritionAIGenerator({ clients }: { clients: NutritionClient[] }) {
  const [selectedClient, setSelectedClient] = useState("")
  const [doel, setDoel] = useState("")
  const [allergieën, setAllergieën] = useState<string[]>([])
  const [voorkeur, setVoorkeur] = useState("")
  const [maaltijden, setMaaltijden] = useState([4])
  const [aiLoading, setAiLoading] = useState(false)
  const [resultaat, setResultaat] = useState(false)

  const allergieOptions = ["Gluten", "Lactose", "Noten", "Schaaldieren", "Eieren", "Soja"]

  function toggleAllergie(a: string) {
    setAllergieën(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a])
  }

  function simuleerAI() {
    setAiLoading(true)
    setTimeout(() => { setAiLoading(false); setResultaat(true) }, 2500)
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-[#6c3caf]/10 flex items-center justify-center">
          <Sparkles className="size-5 text-[#6c3caf]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">AI Voedingsplan Generator</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Laat AI een compleet weekplan genereren</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Formulier */}
        <Card className="border-border">
          <CardContent className="p-5 flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Client</label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecteer een client..." /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Doel</label>
              <Select value={doel} onValueChange={setDoel}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecteer het doel..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="afvallen">Afvallen (deficit)</SelectItem>
                  <SelectItem value="opbouw">Spiermassa opbouwen (surplus)</SelectItem>
                  <SelectItem value="onderhoud">Onderhoud (recomp)</SelectItem>
                  <SelectItem value="prestatie">Prestatie (duurtraining)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Voedingsvoorkeur</label>
              <Select value={voorkeur} onValueChange={setVoorkeur}>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecteer voorkeur..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normaal">Geen voorkeur</SelectItem>
                  <SelectItem value="vegetarisch">Vegetarisch</SelectItem>
                  <SelectItem value="veganistisch">Veganistisch</SelectItem>
                  <SelectItem value="pescotarisch">Pescotarisch</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground">Allergieën / intoleranties</label>
              <div className="flex flex-wrap gap-2">
                {allergieOptions.map(a => (
                  <button key={a} onClick={() => toggleAllergie(a)} className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all border",
                    allergieën.includes(a) ? "border-destructive bg-destructive/5 text-destructive font-medium" : "border-border text-muted-foreground hover:border-primary/30"
                  )}>
                    {allergieën.includes(a) && <Check className="size-3" />}
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground">Maaltijden per dag</label>
                <span className="text-sm font-semibold text-foreground">{maaltijden[0]}</span>
              </div>
              <input type="range" min={3} max={6} step={1} value={maaltijden[0]} onChange={e => setMaaltijden([parseInt(e.target.value)])} className="w-full accent-[#6c3caf]" />
              <div className="flex justify-between text-[10px] text-muted-foreground"><span>3 maaltijden</span><span>6 maaltijden</span></div>
            </div>

            <Button
              onClick={simuleerAI}
              disabled={!selectedClient || !doel || aiLoading}
              className="gap-2 h-11 bg-gradient-to-r from-[#6c3caf] to-[#5b2d9e] hover:from-[#7c4dbd] hover:to-[#6c3caf] text-white"
            >
              {aiLoading ? (<><Loader2 className="size-4 animate-spin" />Plan genereren...</>) : (<><Sparkles className="size-4" />Genereer met AI</>)}
            </Button>
          </CardContent>
        </Card>

        {/* Resultaat */}
        <div className="flex flex-col gap-4">
          {resultaat ? (
            <>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Check className="size-4 text-emerald-500" />
                <p className="text-xs font-medium text-emerald-500">Voedingsplan succesvol gegenereerd</p>
              </div>

              <Card className="border-border">
                <CardContent className="p-4 flex flex-col gap-4">
                  <div>
                    <p className="text-sm font-bold text-foreground">High Protein Weekplan</p>
                    <p className="text-xs text-muted-foreground mt-1">7 dagen, {maaltijden[0]} maaltijden per dag. Aangepast aan macro-doelen en voorkeuren.</p>
                  </div>

                  <div className="flex gap-3">
                    {[
                      { label: "Kcal", val: "2200", col: MACRO_COLORS.calories },
                      { label: "Eiwit", val: "170g", col: MACRO_COLORS.protein },
                      { label: "Koolh.", val: "230g", col: MACRO_COLORS.carbs },
                      { label: "Vet", val: "65g", col: MACRO_COLORS.fat },
                    ].map(m => (
                      <div key={m.label} className={cn("flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5", m.col.bgLight)}>
                        <span className={cn("text-xs font-bold", m.col.text)}>{m.val}</span>
                        <span className="text-[9px] text-muted-foreground">{m.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Voorbeeld dag */}
                  <div className="border-t border-border pt-3 flex flex-col gap-2">
                    <p className="text-[11px] font-medium text-muted-foreground">Voorbeeld: Maandag</p>
                    {[
                      { tijd: "08:00", naam: "Griekse yoghurt bowl", kcal: 320 },
                      { tijd: "12:30", naam: "Kip-broccoli rijst", kcal: 520 },
                      { tijd: "15:00", naam: "Eiwitpannenkoeken", kcal: 380 },
                      { tijd: "19:00", naam: "Zalm met zoete aardappel", kcal: 580 },
                    ].slice(0, maaltijden[0]).map(m => (
                      <div key={m.tijd} className="flex items-center gap-2 text-xs">
                        <span className="w-10 text-muted-foreground">{m.tijd}</span>
                        <div className="size-1 rounded-full bg-primary" />
                        <span className="text-foreground flex-1">{m.naam}</span>
                        <span className="text-muted-foreground">{m.kcal} kcal</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs gap-1.5 border-border" onClick={() => setResultaat(false)}>
                  <RotateCcw className="size-3.5" /> Opnieuw
                </Button>
                <Button className="flex-1 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                  <Check className="size-3.5" /> Opslaan
                </Button>
              </div>
            </>
          ) : (
            <Card className="border-border border-dashed">
              <CardContent className="p-10 flex flex-col items-center justify-center text-center">
                <div className="size-14 rounded-full bg-[#6c3caf]/10 flex items-center justify-center mb-4">
                  <Sparkles className="size-6 text-[#6c3caf]" />
                </div>
                <p className="text-sm font-semibold text-foreground">Genereer een voedingsplan</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Vul de gegevens in en laat AI een compleet weekplan genereren met recepten, macro-berekeningen en boodschappenlijst.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
