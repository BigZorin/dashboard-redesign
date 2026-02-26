"use client"

import { useState } from "react"
import {
  ArrowLeft,
  MessageCircle,
  MoreHorizontal,
  Mail,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  Check,
  X,
  Edit3,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  RefreshCw,
  Brain,
  Zap,
  Undo2,
  Settings2,
  Plus,
  Trash2,
  Dumbbell,
  Apple,
  ClipboardList,
  LineChart,
  Settings,
  FileText,
  Database,
  Circle,
  Pause,
  Play,
  Bot,
  Camera,
  Watch,
  Gauge,
  Utensils,
  Calendar,
  Moon,
  Pill,
  Pen,
  Filter,
  Heart,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip, LineChart as ReLineChart, Line, CartesianGrid } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Import existing tabs
import { OverzichtTab } from "@/components/client-detail/overzicht-tab"
import { IntakeTab } from "@/components/client-detail/intake-tab"
import { TrainingTab } from "@/components/client-detail/training-tab"
import { VoedingTab } from "@/components/client-detail/voeding-tab"
import { CheckinsTab } from "@/components/client-detail/checkins-tab"
import { DailyCheckinTab } from "@/components/client-detail/daily-checkin-tab"
import { MetingenTab } from "@/components/client-detail/metingen-tab"
import { InstellingenTab } from "@/components/client-detail/instellingen-tab"

// ============================================================================
// CLIENT DETAIL PAGE — Tabbed Layout (per brief)
// 
// Layout: Header + Tab navigation + Tab content
// Tabs: Overzicht | Training | Voeding | Check-ins & Intake | Metingen & Voortgang | Instellingen
// AI Toggle per tab (except Overzicht and Instellingen)
// ============================================================================

/** Client data */
const clientGegevens = {
  id: "client_001",
  naam: "Lisa de Vries",
  initialen: "LV",
  email: "lisa@email.com",
  status: "actief" as const,
  avatarUrl: "",
  programma: "Cut Fase 2",
  programmaWeek: 6,
  programmaTotaalWeken: 12,
  lidSinds: "14 jan 2025",
  tags: ["Premium", "Online"],
}

/** Header stats — 5 compacte metric boxes */
const headerStats = {
  gewicht: 68.4,
  gewichtTrend: -0.2,
  complianceTraining: 92,
  complianceVoeding: 85,
  eiwitGem: 155,
  energieGem: 7,
}

/** AI voorstellen per tab (voor badges) */
const aiVoorstellenPerTab = {
  overzicht: 3,
  training: 1,
  voeding: 2,
  checkins: 0,
  metingen: 0,
  instellingen: 0,
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusKleur(status: string) {
  switch (status) {
    case "actief": return "bg-success/10 text-success border-success/20"
    case "risico": return "bg-warning/10 text-warning-foreground border-warning/20"
    case "gepauzeerd": return "bg-muted text-muted-foreground border-border"
    default: return ""
  }
}

function getTrendIcon(trend: number) {
  if (trend < 0) return <TrendingDown className="size-3 text-success" />
  if (trend > 0) return <TrendingUp className="size-3 text-destructive" />
  return <Minus className="size-3 text-muted-foreground" />
}

// ============================================================================
// STAT BOX COMPONENT
// ============================================================================

function StatBox({ label, value, suffix, trend, trendLabel }: {
  label: string
  value: number | string
  suffix?: string
  trend?: number
  trendLabel?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-secondary/50 border border-border min-w-[80px]">
      <span className="text-lg font-bold text-foreground font-mono">
        {value}{suffix}
      </span>
      <span className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{label}</span>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-1">
          {getTrendIcon(trend)}
          <span className="text-[10px] text-muted-foreground">{trendLabel}</span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// TAB BADGE COMPONENT
// ============================================================================

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="ml-1.5 inline-flex items-center justify-center size-5 text-[10px] font-medium rounded-full bg-primary text-primary-foreground">
      {count}
    </span>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface ClientDetailProps {
  id: string
  naam: string
  initialen: string
  email: string
  status: string
  avatarUrl: string
  programma: string
  programmaWeek: number
  programmaTotaalWeken: number
  lidSinds: string
  tags: string[]
  gewicht: number | null
  gewichtTrend: number
  complianceTraining: number
  complianceVoeding: number
  eiwitGem: number
  energieGem: number
}

interface ClientDetailSectionProps {
  clientId: string
  clientData?: ClientDetailProps
  loading?: boolean
  onTerug: () => void
}

export function ClientDetailSection({ clientId, clientData, loading = false, onTerug }: ClientDetailSectionProps) {
  const [activeTab, setActiveTab] = useState("overzicht")
  const client = clientData || clientGegevens
  const stats = clientData ? {
    gewicht: clientData.gewicht ?? 0,
    gewichtTrend: clientData.gewichtTrend,
    complianceTraining: clientData.complianceTraining,
    complianceVoeding: clientData.complianceVoeding,
    eiwitGem: clientData.eiwitGem,
    energieGem: clientData.energieGem,
  } : headerStats

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-background">
        <div className="border-b border-border bg-card px-6 py-4 shrink-0">
          <button
            onClick={onTerug}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
          >
            <ArrowLeft className="size-4" />
            Terug naar overzicht
          </button>
          <div className="flex items-center gap-4">
            <Skeleton className="size-14 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-24 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="p-6">
          <Skeleton className="h-10 w-full max-w-2xl" />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <div className="border-b border-border bg-card px-6 py-4 shrink-0">
        {/* Back button */}
        <button
          onClick={onTerug}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-4" />
          Terug naar overzicht
        </button>

        {/* Profile row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="size-14 border-2 border-primary/20">
              {client.avatarUrl && (
                <AvatarImage src={client.avatarUrl} alt={client.naam} />
              )}
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {client.initialen}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-foreground">{client.naam}</h1>
                <Badge className={`${getStatusKleur(client.status)} text-[11px]`}>
                  {client.status === "actief" ? "Actief" : client.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Actief sinds {client.lidSinds} · {client.programma} · Week {client.programmaWeek}/{client.programmaTotaalWeken}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
              <MessageCircle className="size-3.5" />
              Bericht
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8 border-border">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem className="text-xs gap-2">
                  <Mail className="size-3.5" /> E-mail sturen
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs gap-2">
                  <CalendarDays className="size-3.5" /> Sessie plannen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-1">
          <StatBox
            label="Gewicht"
            value={stats.gewicht || "—"}
            suffix={stats.gewicht ? "kg" : ""}
            trend={stats.gewichtTrend}
            trendLabel={`${stats.gewichtTrend > 0 ? "+" : ""}${stats.gewichtTrend}`}
          />
          <StatBox
            label="Training"
            value={stats.complianceTraining}
            suffix="%"
          />
          <StatBox
            label="Voeding"
            value={stats.complianceVoeding}
            suffix="%"
          />
          <StatBox
            label="Eiwit gem."
            value={stats.eiwitGem}
            suffix="g"
          />
          <StatBox
            label="Energie"
            value={`${stats.energieGem}/10`}
          />
        </div>
      </div>

      {/* ================================================================== */}
      {/* TAB NAVIGATION */}
      {/* ================================================================== */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-border bg-card px-6 shrink-0">
          <div className="flex items-center justify-between">
            <TabsList className="h-11 bg-transparent p-0 gap-0">
              <TabsTrigger
                value="overzicht"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <Sparkles className="size-3.5 mr-1.5" />
                Overzicht
                <TabBadge count={aiVoorstellenPerTab.overzicht} />
              </TabsTrigger>
              <TabsTrigger
                value="intake"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <FileText className="size-3.5 mr-1.5" />
                Intake
              </TabsTrigger>
              <TabsTrigger
                value="checkins"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <ClipboardList className="size-3.5 mr-1.5" />
                Wekelijks
              </TabsTrigger>
              <TabsTrigger
                value="daily"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <Zap className="size-3.5 mr-1.5" />
                Dagelijks
              </TabsTrigger>
              <TabsTrigger
                value="training"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <Dumbbell className="size-3.5 mr-1.5" />
                Training
                <TabBadge count={aiVoorstellenPerTab.training} />
              </TabsTrigger>
  <TabsTrigger
  value="voeding"
  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
  >
  <Apple className="size-3.5 mr-1.5" />
  Voeding
  <TabBadge count={aiVoorstellenPerTab.voeding} />
  </TabsTrigger>
  <TabsTrigger
                value="metingen"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <LineChart className="size-3.5 mr-1.5" />
                Metingen & Voortgang
              </TabsTrigger>
              <TabsTrigger
                value="ai-config"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <Bot className="size-3.5 mr-1.5" />
                AI Config
              </TabsTrigger>
              <TabsTrigger
                value="instellingen"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <Settings className="size-3.5 mr-1.5" />
                Instellingen
              </TabsTrigger>
  </TabsList>
  </div>
        </div>

        {/* ================================================================== */}
        {/* TAB CONTENT */}
        {/* ================================================================== */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="overzicht" className="m-0 h-full">
            <OverzichtTab clientId={clientId} />
          </TabsContent>
          <TabsContent value="intake" className="m-0 h-full">
            <IntakeTab clientId={clientId} />
          </TabsContent>
          <TabsContent value="checkins" className="m-0 h-full">
            <CheckinsTab clientId={clientId} />
          </TabsContent>
          <TabsContent value="daily" className="m-0 h-full">
            <DailyCheckinTab clientId={clientId} />
          </TabsContent>
  <TabsContent value="training" className="m-0 h-full">
  <TrainingTab />
  </TabsContent>
  <TabsContent value="voeding" className="m-0 h-full">
            <VoedingTab clientId={clientId} />
          </TabsContent>
          <TabsContent value="metingen" className="m-0 h-full">
            <MetingenTab />
          </TabsContent>
          <TabsContent value="ai-config" className="m-0 h-full">
            <AIConfigTab />
          </TabsContent>
          <TabsContent value="instellingen" className="m-0 h-full">
            <InstellingenTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

// ============================================================================
// OVERZICHT TAB WITH AI (AI Hub)
// Contains: AI Summary + AI Feed + Client Memory
// ============================================================================

/** AI Samenvatting - Uitgebreid */
const aiSamenvatting = {
  hoofdTekst: "Lisa zit in week 6 van haar cut en maakt uitstekende progressie. Alle indicatoren wijzen op een succesvolle fase.",
  secties: [
    {
      titel: "Gewicht & Compositie",
      tekst: "Gewicht daalt consistent met gemiddeld 0.45kg per week (−1.8kg totaal in 4 weken). Dit is precies in lijn met het geplande deficit van 500kcal/dag. Taille is met 2cm afgenomen, wat duidt op vetverlie in plaats van spiermassa.",
      trend: "positief" as const,
    },
    {
      titel: "Training",
      tekst: "Training compliance is uitstekend (92%). Alle compound lifts blijven stabiel of verbeteren licht ondanks het deficit. Squat PR van 72.5kg vorige week.",
      trend: "positief" as const,
    },
    {
      titel: "Voeding",
      tekst: "Gemiddelde inname ligt op target (1650 kcal). Punt van aandacht: eiwitinname in weekenden structureel 25-30g onder target (gem. 105g vs doordeweeks 142g). Dit patroon is consistent over 4 weken.",
      trend: "aandacht" as const,
    },
    {
      titel: "Herstel & Welzijn",
      tekst: "Slaapkwaliteit wisselend (gem. 6.8/10). Correlatie gevonden met late trainingen (na 20:00): slaapkwaliteit dan gemiddeld 1.5 punt lager. Stressniveau stabiel.",
      trend: "neutraal" as const,
    },
  ],
  bijgewerkt: "nu",
}

/** AI Feed items */
type FeedItemType = "voorstel" | "goedgekeurd" | "afgewezen" | "auto"
type FeedCategorie = "training" | "voeding" | "supplement" | "herstel" | "algemeen"
type Urgentie = "hoog" | "medium" | "laag"

interface FeedItem {
  id: string
  type: FeedItemType
  categorie: FeedCategorie
  urgentie?: Urgentie
  titel: string
  beschrijving: string
  reasoning?: string[]
  zekerheid?: number
  datum: string
  aanpassingen?: { van: string; naar: string; veld: string }[]
}

const feedItems: FeedItem[] = [
  {
    id: "feed_001",
    type: "voorstel",
    categorie: "voeding",
    urgentie: "medium",
    titel: "Eiwitinname optimalisatie",
    beschrijving: "Eiwitinname 4 van de laatste 5 dagen onder target (gem. 128g vs target 155g). Weekendpatroon: elke zaterdag/zondag significant lager.",
    reasoning: [
      "Check-in data toont consistent patroon: za/zo eiwitinname 25-35% lager dan doordeweeks",
      "Client gaf in check-in aan: \"weekend is lastig qua eten\"",
      "Kleine verhoging (5g) omdat client geleidelijk prefereert [geleerd uit 2 eerdere aanpassingen]",
    ],
    zekerheid: 80,
    datum: "vandaag",
    aanpassingen: [
      { veld: "Eiwit target", van: "155g", naar: "160g" },
      { veld: "Weekendstrategie", van: "Geen", naar: "Eiwitrijk tussendoortje toevoegen" },
    ],
  },
  {
    id: "feed_002",
    type: "voorstel",
    categorie: "training",
    urgentie: "laag",
    titel: "Volume verhoging compound lifts",
    beschrijving: "Consistente progressie afgelopen 3 weken op alle compound lifts. RPE gemiddeld 7, ruimte voor +1 set per oefening.",
    reasoning: [
      "Squat: +2.5kg elke week, RPE stabiel rond 7",
      "Bench: +1.25kg per week, geen techniekproblemen",
      "Volume progressie past bij fase 2 periodisering",
    ],
    zekerheid: 75,
    datum: "gisteren",
    aanpassingen: [
      { veld: "Squat", van: "4x5", naar: "5x5" },
      { veld: "Bench Press", van: "4x6", naar: "5x6" },
    ],
  },
  {
    id: "feed_003",
    type: "goedgekeurd",
    categorie: "training",
    titel: "Deload week ingepland",
    beschrijving: "Volume teruggebracht naar 60% voor herstelweek na 4 weken progressief laden.",
    datum: "maandag",
  },
  {
    id: "feed_004",
    type: "auto",
    categorie: "herstel",
    titel: "Rustdag ingepland",
    beschrijving: "Rustdag ingepland na 5 opeenvolgende trainingsdagen. Past binnen jouw regel: max 5 dagen aaneengesloten.",
    datum: "zondag",
  },
  {
    id: "feed_005",
    type: "afgewezen",
    categorie: "supplement",
    titel: "Creatine toevoeging",
    beschrijving: "Voorstel om creatine monohydrate toe te voegen werd afgewezen. Reden: client wil eerst focussen op voedingsbasics.",
    datum: "vorige week",
  },
]

/** Client Memory */
type MemorySource = "ai" | "coach"

const clientMemory: Array<{
  id: string
  observatie: string
  bron: string
  type: MemorySource
}> = [
  { id: "mem_001", observatie: "Reageert goed op hogere trainingsfrequentie", bron: "3x goedgekeurd in laatste 2 maanden", type: "ai" },
  { id: "mem_002", observatie: "Moeite met eiwitinname in weekenden", bron: "Check-in data analyse (8 weken)", type: "ai" },
  { id: "mem_003", observatie: "Prefereert geleidelijke kcal-aanpassingen", bron: "Coach feedback op voorstellen", type: "ai" },
  { id: "mem_004", observatie: "Slaapproblemen bij training na 20:00", bron: "Correlatie check-in data", type: "ai" },
  { id: "mem_005", observatie: "Heeft lichte knieklachten bij hoog volume squats", bron: "Coach notitie", type: "coach" },
  { id: "mem_006", observatie: "Vegetarisch sinds januari 2026", bron: "Handmatig toegevoegd", type: "coach" },
]

/** Data Status — Overzicht van welke databronnen de AI heeft */
type DataStatus = "beschikbaar" | "beperkt" | "niet_beschikbaar"

const dataBronnen: Array<{
  id: string
  label: string
  icon: React.ElementType
  status: DataStatus
  detail: string
  actie?: string
}> = [
  { id: "intake", label: "Intake", icon: FileText, status: "beschikbaar", detail: "volledig ingevuld" },
  { id: "wekelijks", label: "Wekelijkse check-ins", icon: Calendar, status: "beschikbaar", detail: "6 van 6 weken" },
  { id: "dagelijks", label: "Dagelijkse check-ins", icon: Zap, status: "beschikbaar", detail: "laatste 28 dagen" },
  { id: "voeding", label: "Voedingslogs", icon: Utensils, status: "beschikbaar", detail: "laatste 14 dagen" },
  { id: "training", label: "Training logs", icon: Dumbbell, status: "beschikbaar", detail: "laatste 6 weken" },
  { id: "supplementen", label: "Supplementen", icon: Pill, status: "beschikbaar", detail: "actief (4 items)" },
  { id: "fotos", label: "Voortgangsfoto's", icon: Camera, status: "beperkt", detail: "3 van 6 weken" },
  { id: "maten", label: "Lichaamsmaten", icon: Gauge, status: "niet_beschikbaar", detail: "nog nooit ingevuld", actie: "Activeren" },
  { id: "wearable", label: "Wearable data", icon: Watch, status: "niet_beschikbaar", detail: "niet gekoppeld", actie: "Koppelen" },
  { id: "rpe", label: "RPE per workout", icon: Gauge, status: "niet_beschikbaar", detail: "niet ingeschakeld", actie: "Activeren" },
  { id: "mood", label: "Mood score", icon: Sparkles, status: "niet_beschikbaar", detail: "niet ingeschakeld", actie: "Activeren" },
]

const beschikbaarCount = dataBronnen.filter(d => d.status === "beschikbaar").length
const beperktCount = dataBronnen.filter(d => d.status === "beperkt").length
const aiDekking = Math.round(((beschikbaarCount + beperktCount * 0.5) / dataBronnen.length) * 100)

/** AI Activity Log */
type LogType = "analyse" | "patroon" | "voorstel" | "auto" | "fout" | "check"

const aiActivityLog: Array<{
  tijd: string
  type: LogType
  tekst: string
  detail?: string
  }> = [
  { tijd: "14:40", type: "auto", tekst: "Rustdag ingepland (regel: max 5 dagen)", detail: "Automatisch toegepast" },
  { tijd: "14:36", type: "voorstel", tekst: "Gegenereerd: volume +1 set per compound", detail: "Zekerheid: 75%" },
  { tijd: "14:35", type: "patroon", tekst: "Compound lifts: progressie 3 weken consistent" },
  { tijd: "14:35", type: "check", tekst: "RPE data niet beschikbaar — analyse beperkt" },
  { tijd: "14:35", type: "analyse", tekst: "Training logs week 6 verwerkt" },
  { tijd: "14:33", type: "voorstel", tekst: "Gegenereerd: verhoog eiwit target → 160g", detail: "Zekerheid: 80%" },
  { tijd: "14:32", type: "patroon", tekst: "Eiwitinname za/zo gem. 105g vs doordeweeks 142g" },
  { tijd: "14:32", type: "analyse", tekst: "Client memory: \"Moeite met eiwit in weekenden\"" },
  { tijd: "14:32", type: "analyse", tekst: "Voedingslogs afgelopen 7 dagen opgehaald" },
  { tijd: "14:30", type: "analyse", tekst: "Wekelijkse check-in week 6 verwerkt" },
  { tijd: "14:30", type: "patroon", tekst: "Gewichtstrend: −0.45kg/week (4 weken consistent)" },
  { tijd: "14:29", type: "analyse", tekst: "Slaapdata correlatie berekend met trainingstijden" },
  { tijd: "14:29", type: "patroon", tekst: "Slaapkwaliteit −1.5pt bij training na 20:00" },
  { tijd: "14:28", type: "check", tekst: "Wearable data niet gekoppeld — HRV analyse overgeslagen" },
  { tijd: "14:28", type: "analyse", tekst: "Dagelijkse check-ins laatste 28 dagen geladen" },
  { tijd: "14:27", type: "auto", tekst: "Supplementen reminder verzonden", detail: "Creatine, Vitamine D" },
  { tijd: "14:26", type: "analyse", tekst: "Foto vergelijking week 1 vs week 6 uitgevoerd" },
  { tijd: "14:26", type: "patroon", tekst: "Visuele progressie: zichtbare reductie buikomvang" },
  { tijd: "14:25", type: "analyse", tekst: "Client profiel en intake data geladen" },
  { tijd: "14:25", type: "analyse", tekst: "AI analyse cyclus gestart voor Lisa de Vries" },
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
type AIRuleMode = "ai_stuurt" | "voorstellen" | "handmatig"

const aiDomeinen: Array<{
  id: string
  label: string
  icon: React.ElementType
  beschrijving: string
  defaultMode: AIRuleMode
}> = [
  { id: "voeding", label: "Voeding", icon: Apple, beschrijving: "Macro-aanpassingen", defaultMode: "voorstellen" },
  { id: "training", label: "Training", icon: Dumbbell, beschrijving: "Sets, reps, deload", defaultMode: "voorstellen" },
  { id: "rustdagen", label: "Rustdagen", icon: Moon, beschrijving: "Extra rustdagen", defaultMode: "ai_stuurt" },
  { id: "supplementen", label: "Supplementen", icon: Pill, beschrijving: "Dosering", defaultMode: "handmatig" },
  { id: "programma", label: "Programma", icon: RefreshCw, beschrijving: "Programmawissels", defaultMode: "voorstellen" },
]

function getCategorieBadge(categorie: FeedCategorie) {
  const config: Record<FeedCategorie, { bg: string; text: string; label: string }> = {
    training: { bg: "bg-primary/10", text: "text-primary", label: "Training" },
    voeding: { bg: "bg-success/10", text: "text-success", label: "Voeding" },
    supplement: { bg: "bg-chart-2/10", text: "text-chart-2", label: "Supplement" },
    herstel: { bg: "bg-warning/10", text: "text-warning-foreground", label: "Herstel" },
    algemeen: { bg: "bg-muted", text: "text-muted-foreground", label: "Algemeen" },
  }
  const c = config[categorie]
  return <Badge className={`${c.bg} ${c.text} border-transparent text-[10px]`}>{c.label}</Badge>
}

function getUrgentieBorderColor(urgentie?: Urgentie) {
  switch (urgentie) {
    case "hoog": return "border-l-destructive"
    case "medium": return "border-l-warning"
    case "laag": return "border-l-chart-2"
    default: return "border-l-border"
  }
}

function OverzichtTabWithAI() {
  const [feedFilter, setFeedFilter] = useState<"alles" | "openstaand" | "goedgekeurd" | "afgewezen" | "auto">("alles")
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null)

  const filteredFeed = feedItems.filter((item) => {
    if (feedFilter === "alles") return true
    if (feedFilter === "openstaand") return item.type === "voorstel"
    if (feedFilter === "goedgekeurd") return item.type === "goedgekeurd"
    if (feedFilter === "afgewezen") return item.type === "afgewezen"
    if (feedFilter === "auto") return item.type === "auto"
    return true
  })

  const openVoorstellen = feedItems.filter((i) => i.type === "voorstel").length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* AI Summary - Full width, detailed */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10">
                <Sparkles className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-foreground">AI Samenvatting</h3>
                <p className="text-xs text-muted-foreground">Bijgewerkt: {aiSamenvatting.bijgewerkt}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5">
              <RefreshCw className="size-3" />
              Vernieuw analyse
            </Button>
          </div>
          
          <p className="text-sm text-foreground font-medium mb-4">{aiSamenvatting.hoofdTekst}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {aiSamenvatting.secties.map((sectie, i) => (
              <div
                key={i}
                className={cn(
                  "p-3 rounded-lg border",
                  sectie.trend === "positief" && "bg-success/5 border-success/20",
                  sectie.trend === "aandacht" && "bg-warning/5 border-warning/20",
                  sectie.trend === "neutraal" && "bg-secondary/50 border-border"
                )}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  {sectie.trend === "positief" && <TrendingUp className="size-3.5 text-success" />}
                  {sectie.trend === "aandacht" && <TrendingDown className="size-3.5 text-warning" />}
                  {sectie.trend === "neutraal" && <Minus className="size-3.5 text-muted-foreground" />}
                  <span className="text-xs font-semibold text-foreground">{sectie.titel}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{sectie.tekst}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Feed - Full width */}
      <div className="flex flex-col gap-4">

        {/* AI Feed */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">AI Feed</h3>
            <div className="flex items-center gap-1">
              {(["alles", "openstaand", "goedgekeurd", "afgewezen", "auto"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFeedFilter(filter)}
                  className={cn(
                    "px-2.5 py-1 text-[11px] rounded-full transition-colors",
                    feedFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {filter === "alles" && "Alles"}
                  {filter === "openstaand" && `Openstaand (${openVoorstellen})`}
                  {filter === "goedgekeurd" && "Goedgekeurd"}
                  {filter === "afgewezen" && "Afgewezen"}
                  {filter === "auto" && "Auto"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filteredFeed.map((item) => (
              <Card
                key={item.id}
                className={cn(
                  "border-l-4 transition-all",
                  item.type === "voorstel" && getUrgentieBorderColor(item.urgentie),
                  item.type === "goedgekeurd" && "border-l-success",
                  item.type === "afgewezen" && "border-l-destructive",
                  item.type === "auto" && "border-l-success/50"
                )}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {item.type === "voorstel" && (
                        <span className="size-2 rounded-full bg-primary animate-pulse" />
                      )}
                      {item.type === "goedgekeurd" && (
                        <Check className="size-4 text-success" />
                      )}
                      {item.type === "afgewezen" && (
                        <X className="size-4 text-destructive" />
                      )}
                      {item.type === "auto" && (
                        <Zap className="size-4 text-success" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {item.type === "voorstel" && "Nieuw voorstel"}
                        {item.type === "goedgekeurd" && "Goedgekeurd door jou"}
                        {item.type === "afgewezen" && "Afgewezen"}
                        {item.type === "auto" && "Automatisch toegepast"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getCategorieBadge(item.categorie)}
                      <span className="text-[10px] text-muted-foreground">{item.datum}</span>
                    </div>
                  </div>

                  {/* Content */}
                  <h4 className="text-sm font-medium text-foreground mb-1">{item.titel}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.beschrijving}</p>

                  {/* Reasoning (collapsible) */}
                  {item.reasoning && (
                    <Collapsible
                      open={expandedReasoning === item.id}
                      onOpenChange={(open) => setExpandedReasoning(open ? item.id : null)}
                      className="mt-3"
                    >
                      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:underline">
                        {expandedReasoning === item.id ? (
                          <ChevronDown className="size-3" />
                        ) : (
                          <ChevronRight className="size-3" />
                        )}
                        Waarom dit voorstel?
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-2 pl-4 border-l-2 border-border">
                        <ul className="flex flex-col gap-1">
                          {item.reasoning.map((r, i) => (
                            <li key={i} className="text-[11px] text-muted-foreground">• {r}</li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  )}

                  {/* Confidence + Actions */}
                  {item.type === "voorstel" && (
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Zekerheid:</span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span
                              key={i}
                              className={cn(
                                "size-2 rounded-full",
                                i <= Math.round((item.zekerheid ?? 0) / 20)
                                  ? "bg-primary"
                                  : "bg-muted"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.zekerheid}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" className="h-7 text-xs gap-1 bg-success hover:bg-success/90">
                          <Check className="size-3" /> Goedkeuren
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-border">
                          <Edit3 className="size-3" /> Aanpassen
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-destructive hover:text-destructive">
                          <X className="size-3" /> Afwijzen
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Auto-applied: undo button */}
                  {item.type === "auto" && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-muted-foreground">
                        <Undo2 className="size-3" /> Terugdraaien
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// AI CONFIG TAB
// Contains: Client Memory + AI Automatiseringsregels + Data Status + AI Activity Log
// ============================================================================

function AIConfigTab() {
  const [activityLogPaused, setActivityLogPaused] = useState(false)
  const [activityLogFilter, setActivityLogFilter] = useState<LogType | "alles">("alles")
  const [aiRuleModes, setAiRuleModes] = useState<Record<string, AIRuleMode>>(
    Object.fromEntries(aiDomeinen.map(d => [d.id, d.defaultMode]))
  )
  
  const filteredLogs = activityLogFilter === "alles" 
    ? aiActivityLog 
    : aiActivityLog.filter(log => log.type === activityLogFilter)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ROW 1: Client Memory + AI Automatiseringsregels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Memory */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Brain className="size-4 text-primary" />
                Client Memory
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                <Plus className="size-3" /> Toevoegen
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground">Wat de AI heeft geleerd over deze client</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {clientMemory.map((mem) => (
              <div key={mem.id} className={cn(
                "flex items-start justify-between gap-2 p-3 rounded-lg border",
                mem.type === "ai" ? "bg-primary/5 border-primary/20" : "bg-secondary/50 border-border"
              )}>
                <div className="flex gap-2">
                  <div className={cn(
                    "flex items-center justify-center size-5 rounded-full shrink-0 mt-0.5",
                    mem.type === "ai" ? "bg-primary/10" : "bg-secondary"
                  )}>
                    {mem.type === "ai" ? (
                      <Sparkles className="size-3 text-primary" />
                    ) : (
                      <Pen className="size-2.5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-foreground">{mem.observatie}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {mem.type === "ai" ? "AI geleerd" : "Coach"} · {mem.bron}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  <Button variant="ghost" size="icon" className="size-6">
                    <Edit3 className="size-3 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-6">
                    <Trash2 className="size-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Automatiseringsregels */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Bot className="size-4 text-primary" />
              AI Automatiseringsregels
            </CardTitle>
            <p className="text-[11px] text-muted-foreground">Bepaal hoe AI handelt per domein</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {aiDomeinen.map((domein) => {
                const Icon = domein.icon
                return (
                  <div key={domein.id} className="flex flex-col gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
                    <div className="flex items-center gap-2">
                      <Icon className="size-4 text-primary" />
                      <span className="text-xs font-semibold text-foreground">{domein.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{domein.beschrijving}</p>
                    <Select
                      value={aiRuleModes[domein.id]}
                      onValueChange={(value: AIRuleMode) => setAiRuleModes(prev => ({ ...prev, [domein.id]: value }))}
                    >
                      <SelectTrigger className="h-7 text-[11px]">
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
                            <span className="size-1.5 rounded-full bg-warning" />
                            Voorstellen
                          </span>
                        </SelectItem>
                        <SelectItem value="handmatig" className="text-xs">
                          <span className="flex items-center gap-1.5">
                            <span className="size-1.5 rounded-full bg-muted-foreground" />
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
      </div>

      {/* ROW 2: Data Status + AI Activity Log */}
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
          <CardContent className="space-y-3">
            {/* Beschikbaar */}
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-success uppercase tracking-wide">Beschikbaar</span>
              <div className="space-y-0.5">
                {dataBronnen.filter(d => d.status === "beschikbaar").map(bron => {
                  const Icon = bron.icon
                  return (
                    <div key={bron.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-success/5">
                      <div className="flex items-center gap-2">
                        <Circle className="size-1.5 fill-success text-success" />
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
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-warning uppercase tracking-wide">Beperkt</span>
                <div className="space-y-0.5">
                  {dataBronnen.filter(d => d.status === "beperkt").map(bron => {
                    const Icon = bron.icon
                    return (
                      <div key={bron.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-warning/5">
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full border border-warning" />
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
              <div className="space-y-1">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">Niet beschikbaar</span>
                <div className="space-y-0.5">
                  {dataBronnen.filter(d => d.status === "niet_beschikbaar").map(bron => {
                    const Icon = bron.icon
                    return (
                      <div key={bron.id} className="flex items-center justify-between py-1.5 px-2 rounded bg-secondary/30">
                        <div className="flex items-center gap-2">
                          <Circle className="size-1.5 text-muted-foreground" />
                          <Icon className="size-3.5 text-muted-foreground/50" />
                          <span className="text-xs text-muted-foreground">{bron.label}</span>
                        </div>
                        <button className="text-[10px] text-primary hover:underline">{bron.actie || "Activeren"}</button>
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
                  className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60"
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
                    "size-1.5 rounded-full",
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
              </div>
            </div>
            {/* Filter chips */}
            <div className="flex items-center gap-1.5 pt-2">
              <Filter className="size-3 text-muted-foreground" />
              {(["alles", "voorstel", "auto", "patroon", "check"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActivityLogFilter(filter)}
                  className={cn(
                    "px-2 py-0.5 text-[10px] rounded-full transition-colors",
                    activityLogFilter === filter
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                  )}
                >
                  {filter === "alles" ? "Alles" : filter.toUpperCase()}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-[#0d0d0d] border border-border p-4 font-mono text-[11px] space-y-2.5">
              {filteredLogs.map((log, i) => {
                const config = logTypeConfig[log.type]
                return (
                  <div key={i} className="flex gap-3 group cursor-pointer hover:bg-white/5 -mx-2 px-2 py-1 rounded">
                    <span className="text-muted-foreground shrink-0 w-10">{log.tijd}</span>
                    <span className={cn("shrink-0 w-16 font-semibold", config.color)}>
                      {config.label}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                      <span className="text-foreground/90 break-words">{log.tekst}</span>
                      {log.detail && (
                        <span className="text-muted-foreground text-[10px] break-words">  {log.detail}</span>
                      )}
                    </div>
                  </div>
                )
              })}
              {filteredLogs.length === 0 && (
                <div className="text-muted-foreground text-center py-4">
                  Geen {activityLogFilter} logs gevonden
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
