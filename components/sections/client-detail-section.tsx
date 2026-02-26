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
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { cn } from "@/lib/utils"

// Import existing tabs
import { OverzichtTab } from "@/components/client-detail/overzicht-tab"
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
// AI MODE TOGGLE (per tab)
// ============================================================================

type AIMode = "auto" | "voorstellen" | "handmatig"

function AIModeToggle({ mode, onModeChange }: { mode: AIMode; onModeChange: (mode: AIMode) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">AI modus:</span>
      <Select value={mode} onValueChange={(v) => onModeChange(v as AIMode)}>
        <SelectTrigger className="h-7 w-[140px] text-xs border-border">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="auto" className="text-xs">
            <div className="flex items-center gap-2">
              <Zap className="size-3 text-success" />
              AI stuurt
            </div>
          </SelectItem>
          <SelectItem value="voorstellen" className="text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="size-3 text-primary" />
              Voorstellen
            </div>
          </SelectItem>
          <SelectItem value="handmatig" className="text-xs">
            <div className="flex items-center gap-2">
              <Settings2 className="size-3 text-muted-foreground" />
              Handmatig
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
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

interface ClientDetailSectionProps {
  clientId: string
  onTerug: () => void
}

export function ClientDetailSection({ clientId, onTerug }: ClientDetailSectionProps) {
  const [activeTab, setActiveTab] = useState("overzicht")
  const [aiModes, setAiModes] = useState<Record<string, AIMode>>({
    training: "voorstellen",
    voeding: "voorstellen",
    checkins: "voorstellen",
    metingen: "voorstellen",
  })

  const client = clientGegevens

  const handleAIModeChange = (tab: string, mode: AIMode) => {
    setAiModes((prev) => ({ ...prev, [tab]: mode }))
  }

  // Tabs that show AI toggle
  const tabsWithAIToggle = ["training", "voeding", "checkins", "metingen"]

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
            value={headerStats.gewicht}
            suffix="kg"
            trend={headerStats.gewichtTrend}
            trendLabel={`${headerStats.gewichtTrend > 0 ? "+" : ""}${headerStats.gewichtTrend}`}
          />
          <StatBox
            label="Training"
            value={headerStats.complianceTraining}
            suffix="%"
          />
          <StatBox
            label="Voeding"
            value={headerStats.complianceVoeding}
            suffix="%"
          />
          <StatBox
            label="Eiwit gem."
            value={headerStats.eiwitGem}
            suffix="g"
          />
          <StatBox
            label="Energie"
            value={`${headerStats.energieGem}/10`}
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
                value="metingen"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <LineChart className="size-3.5 mr-1.5" />
                Metingen & Voortgang
              </TabsTrigger>
              <TabsTrigger
                value="instellingen"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
              >
                <Settings className="size-3.5 mr-1.5" />
                Instellingen
              </TabsTrigger>
            </TabsList>

            {/* AI Mode Toggle (shown for relevant tabs) */}
            {tabsWithAIToggle.includes(activeTab) && (
              <AIModeToggle
                mode={aiModes[activeTab]}
                onModeChange={(mode) => handleAIModeChange(activeTab, mode)}
              />
            )}
          </div>
        </div>

        {/* ================================================================== */}
        {/* TAB CONTENT */}
        {/* ================================================================== */}
        <div className="flex-1 overflow-y-auto">
          <TabsContent value="overzicht" className="m-0 h-full">
            <OverzichtTabWithAI />
          </TabsContent>
          <TabsContent value="training" className="m-0 h-full">
            <TrainingTab />
          </TabsContent>
          <TabsContent value="voeding" className="m-0 h-full">
            <VoedingTab />
          </TabsContent>
          <TabsContent value="checkins" className="m-0 h-full">
            <CheckinsTab />
          </TabsContent>
          <TabsContent value="daily" className="m-0 h-full">
            <DailyCheckinTab />
          </TabsContent>
          <TabsContent value="metingen" className="m-0 h-full">
            <MetingenTab />
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

/** AI Samenvatting */
const aiSamenvatting = {
  tekst: "Lisa zit in week 6 van haar cut. Gewicht daalt consistent (−1.8kg in 4 weken). Training compliance uitstekend (92%). Punt van aandacht: eiwitinname in weekenden structureel te laag. Slaapkwaliteit wisselend, correlatie met late trainingen.",
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
const clientMemory = [
  { id: "mem_001", observatie: "Reageert goed op hogere trainingsfrequentie", bron: "3x goedgekeurd in laatste 2 maanden" },
  { id: "mem_002", observatie: "Moeite met eiwitinname in weekenden", bron: "Check-in data analyse (8 weken)" },
  { id: "mem_003", observatie: "Prefereert geleidelijke kcal-aanpassingen", bron: "Coach paste 2x een groot voorstel aan naar kleiner" },
  { id: "mem_004", observatie: "Slaapproblemen bij training na 20:00", bron: "Correlatie check-in data" },
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
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 p-6">
      {/* LEFT COLUMN: AI Summary + AI Feed */}
      <div className="flex flex-col gap-6">
        {/* AI Summary */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">AI Samenvatting</h3>
                  <p className="text-[10px] text-muted-foreground">Bijgewerkt: {aiSamenvatting.bijgewerkt}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
                <RefreshCw className="size-3" />
                Vernieuw
              </Button>
            </div>
            <p className="text-sm text-foreground/90 leading-relaxed">{aiSamenvatting.tekst}</p>
          </CardContent>
        </Card>

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

      {/* RIGHT COLUMN: Client Memory */}
      <div className="flex flex-col gap-6">
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
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {clientMemory.map((mem) => (
              <div key={mem.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
                <div className="flex flex-col gap-1">
                  <p className="text-xs text-foreground">{mem.observatie}</p>
                  <p className="text-[10px] text-muted-foreground">Bron: {mem.bron}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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
      </div>
    </div>
  )
}
