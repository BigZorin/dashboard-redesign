"use client"

import { useState } from "react"
import {
  ArrowLeft,
  MessageCircle,
  Sparkles,
  MoreHorizontal,
  Mail,
  CalendarDays,
  Dumbbell,
  Apple,
  TrendingDown,
  TrendingUp,
  Minus,
  Scale,
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
  Activity,
  Moon,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts"

// ============================================================================
// CLIENT DETAIL PAGE — AI-First Design (per brief)
// 
// Layout: Scrollable single page, NO tabs
// - Header: Avatar, name, status, program, 5 quick stats
// - Zone 1: AI Summary (prominent, sparkle icon)
// - Zone 2: AI Feed (chronological feed of proposals/actions)
// - Zone 3: Key Metrics (4 compact charts)
// - Zone 4: Client Memory & AI Rules (sidebar on desktop)
//
// Responsive:
// - Desktop (≥1280px): 2-column (60% feed, 40% metrics+memory)
// - Tablet/Mobile: Single column, stacked
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

/** Key Metrics data */
const gewichtsData = [
  { week: "W1", gewicht: 70.2 },
  { week: "W2", gewicht: 69.8 },
  { week: "W3", gewicht: 69.5 },
  { week: "W4", gewicht: 69.1 },
  { week: "W5", gewicht: 68.7 },
  { week: "W6", gewicht: 68.4 },
]

const complianceData = [
  { week: "W1", training: 100, voeding: 78 },
  { week: "W2", training: 75, voeding: 82 },
  { week: "W3", training: 100, voeding: 71 },
  { week: "W4", training: 100, voeding: 85 },
  { week: "W5", training: 75, voeding: 89 },
  { week: "W6", training: 100, voeding: 85 },
]

const energieSlaapData = [
  { dag: "Ma", energie: 7, slaap: 8 },
  { dag: "Di", energie: 8, slaap: 7 },
  { dag: "Wo", energie: 6, slaap: 6 },
  { dag: "Do", energie: 7, slaap: 8 },
  { dag: "Vr", energie: 8, slaap: 7 },
  { dag: "Za", energie: 7, slaap: 8 },
  { dag: "Zo", energie: 6, slaap: 9 },
]

/** Client Memory */
const clientMemory = [
  { id: "mem_001", observatie: "Reageert goed op hogere trainingsfrequentie", bron: "3x goedgekeurd in laatste 2 maanden" },
  { id: "mem_002", observatie: "Moeite met eiwitinname in weekenden", bron: "Check-in data analyse (8 weken)" },
  { id: "mem_003", observatie: "Prefereert geleidelijke kcal-aanpassingen", bron: "Coach paste 2x een groot voorstel aan naar kleiner" },
  { id: "mem_004", observatie: "Slaapproblemen bij training na 20:00", bron: "Correlatie check-in data" },
]

/** Automatiseringsregels */
const automatiseringsRegels = [
  { categorie: "Voeding aanpassen", waarde: "voorstellen" },
  { categorie: "Training volume", waarde: "auto" },
  { categorie: "Rustdagen", waarde: "auto" },
  { categorie: "Supplementen", waarde: "voorstellen" },
  { categorie: "Programmawissel", waarde: "alleen-voorstellen" },
]

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

// ============================================================================
// COMPONENTS
// ============================================================================

interface ClientDetailSectionProps {
  clientId: string
  onTerug: () => void
}

export function ClientDetailSection({ clientId, onTerug }: ClientDetailSectionProps) {
  const [feedFilter, setFeedFilter] = useState<"alles" | "openstaand" | "goedgekeurd" | "afgewezen" | "auto">("alles")
  const [showAanpassenDialog, setShowAanpassenDialog] = useState(false)
  const [selectedVoorstel, setSelectedVoorstel] = useState<FeedItem | null>(null)
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null)

  const client = clientGegevens

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
                Actief sinds {client.lidSinds} · {client.programma}
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
              <DropdownMenuContent align="end">
                <DropdownMenuItem><Mail className="mr-2 size-4" />E-mail sturen</DropdownMenuItem>
                <DropdownMenuItem><CalendarDays className="mr-2 size-4" />Sessie inplannen</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 5 Quick stat boxes */}
        <div className="mt-4 grid grid-cols-5 gap-3">
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-3 text-center">
            <span className="text-lg font-bold text-foreground">{headerStats.gewicht}kg</span>
            <span className="text-[10px] text-muted-foreground">Gewicht</span>
            <span className={`flex items-center gap-0.5 text-[10px] font-medium mt-0.5 ${headerStats.gewichtTrend < 0 ? "text-success" : "text-destructive"}`}>
              {headerStats.gewichtTrend < 0 ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
              {headerStats.gewichtTrend > 0 ? "+" : ""}{headerStats.gewichtTrend}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-3 text-center">
            <span className="text-lg font-bold text-foreground">{headerStats.complianceTraining}%</span>
            <span className="text-[10px] text-muted-foreground">Train. compl.</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-3 text-center">
            <span className="text-lg font-bold text-foreground">{headerStats.complianceVoeding}%</span>
            <span className="text-[10px] text-muted-foreground">Voed. compl.</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-3 text-center">
            <span className="text-lg font-bold text-foreground">{headerStats.eiwitGem}g</span>
            <span className="text-[10px] text-muted-foreground">Eiwit gem.</span>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card p-3 text-center">
            <span className="text-lg font-bold text-foreground">{headerStats.energieGem}/10</span>
            <span className="text-[10px] text-muted-foreground">Energie gem.</span>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MAIN CONTENT — 2 Column Layout */}
      {/* ================================================================== */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col lg:flex-row">
          {/* LEFT COLUMN (60%): AI Summary + AI Feed */}
          <div className="flex-1 lg:w-[60%] overflow-auto border-r border-border">
            <div className="p-6 flex flex-col gap-6">
              {/* ============================================================ */}
              {/* ZONE 1: AI SAMENVATTING */}
              {/* ============================================================ */}
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-primary" />
                      <CardTitle className="text-sm font-semibold">AI Samenvatting</CardTitle>
                    </div>
                    <span className="text-[10px] text-muted-foreground">Bijgewerkt: {aiSamenvatting.bijgewerkt}</span>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-foreground leading-relaxed">{aiSamenvatting.tekst}</p>
                  <Button variant="ghost" size="sm" className="mt-3 h-7 text-[11px] gap-1.5 text-primary hover:text-primary hover:bg-primary/10">
                    <RefreshCw className="size-3" />
                    Vernieuw samenvatting
                  </Button>
                </CardContent>
              </Card>

              {/* ============================================================ */}
              {/* ZONE 2: AI FEED */}
              {/* ============================================================ */}
              <div className="flex flex-col gap-4">
                {/* Filter tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { value: "alles", label: "Alles" },
                    { value: "openstaand", label: `Openstaand (${openVoorstellen})` },
                    { value: "goedgekeurd", label: "Goedgekeurd" },
                    { value: "afgewezen", label: "Afgewezen" },
                    { value: "auto", label: "Auto" },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setFeedFilter(tab.value as typeof feedFilter)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        feedFilter === tab.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Feed items */}
                <div className="flex flex-col gap-3">
                  {filteredFeed.map((item) => (
                    <FeedCard
                      key={item.id}
                      item={item}
                      expandedReasoning={expandedReasoning}
                      onToggleReasoning={(id) => setExpandedReasoning(expandedReasoning === id ? null : id)}
                      onAanpassen={() => {
                        setSelectedVoorstel(item)
                        setShowAanpassenDialog(true)
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN (40%): Metrics + Memory + Rules */}
          <div className="lg:w-[40%] overflow-auto bg-secondary/20">
            <div className="p-6 flex flex-col gap-6">
              {/* ============================================================ */}
              {/* ZONE 3: KEY METRICS */}
              {/* ============================================================ */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground">Key Metrics</h3>

                {/* Gewichtstrend */}
                <Card className="border-border">
                  <CardHeader className="pb-2 p-3">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Gewichtstrend (30d)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={gewichtsData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="gewichtGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="oklch(0.6 0.18 145)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="oklch(0.5 0.02 290)" />
                          <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fontSize: 9 }} stroke="oklch(0.5 0.02 290)" />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                          <Area type="monotone" dataKey="gewicht" stroke="oklch(0.6 0.18 145)" strokeWidth={2} fill="url(#gewichtGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Training compliance */}
                <Card className="border-border">
                  <CardHeader className="pb-2 p-3">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Training compliance per week</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={complianceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="oklch(0.5 0.02 290)" />
                          <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} stroke="oklch(0.5 0.02 290)" />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                          <Bar dataKey="training" fill="oklch(0.22 0.05 290)" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Energie/Slaap */}
                <Card className="border-border">
                  <CardHeader className="pb-2 p-3">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Energie & Slaap (7d)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="h-24">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={energieSlaapData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="energieGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="oklch(0.75 0.15 65)" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="oklch(0.75 0.15 65)" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <XAxis dataKey="dag" tick={{ fontSize: 9 }} stroke="oklch(0.5 0.02 290)" />
                          <YAxis domain={[0, 10]} tick={{ fontSize: 9 }} stroke="oklch(0.5 0.02 290)" />
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                          <Area type="monotone" dataKey="energie" stroke="oklch(0.75 0.15 65)" strokeWidth={2} fill="url(#energieGrad)" />
                          <Area type="monotone" dataKey="slaap" stroke="oklch(0.55 0.1 260)" strokeWidth={2} fill="none" strokeDasharray="4 2" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-warning" /> Energie</span>
                      <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-chart-3" /> Slaap</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ============================================================ */}
              {/* ZONE 4: CLIENT MEMORY */}
              {/* ============================================================ */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Brain className="size-4 text-primary" />
                    <h3 className="text-sm font-semibold text-foreground">Client Memory</h3>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground">
                    <Plus className="size-3" />
                    Toevoegen
                  </Button>
                </div>

                <Card className="border-border">
                  <CardContent className="p-3 flex flex-col gap-2">
                    {clientMemory.map((mem) => (
                      <div key={mem.id} className="flex items-start justify-between gap-2 p-2 rounded-md bg-secondary/50 group">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-xs text-foreground">{mem.observatie}</p>
                          <p className="text-[10px] text-muted-foreground italic">Bron: {mem.bron}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 rounded hover:bg-secondary"><Edit3 className="size-3 text-muted-foreground" /></button>
                          <button className="p-1 rounded hover:bg-secondary"><Trash2 className="size-3 text-muted-foreground" /></button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* ============================================================ */}
              {/* AUTOMATISERING REGELS */}
              {/* ============================================================ */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Settings2 className="size-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">Automatisering</h3>
                </div>

                <Card className="border-border">
                  <CardContent className="p-3 flex flex-col gap-2">
                    {automatiseringsRegels.map((regel, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <span className="text-xs text-foreground">{regel.categorie}</span>
                        <Select defaultValue={regel.waarde}>
                          <SelectTrigger className="h-7 w-[140px] text-[11px] border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="auto" className="text-xs">Auto-toepassen</SelectItem>
                            <SelectItem value="voorstellen" className="text-xs">Voorstellen</SelectItem>
                            <SelectItem value="alleen-voorstellen" className="text-xs">Alleen voorstellen</SelectItem>
                            <SelectItem value="uit" className="text-xs">Uit</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* AANPASSEN DIALOG */}
      {/* ================================================================== */}
      <Dialog open={showAanpassenDialog} onOpenChange={setShowAanpassenDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">AI Voorstel aanpassen</DialogTitle>
          </DialogHeader>
          {selectedVoorstel && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Client:</span>
                <span className="text-sm font-medium">{client.naam}</span>
                {getCategorieBadge(selectedVoorstel.categorie)}
                {selectedVoorstel.zekerheid && (
                  <span className="text-[10px] text-muted-foreground ml-auto">Zekerheid: {selectedVoorstel.zekerheid}%</span>
                )}
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Aanpassingen</p>
                <div className="flex flex-col gap-2">
                  {selectedVoorstel.aanpassingen?.map((a, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-24 shrink-0">{a.veld}</span>
                      <Input defaultValue={a.naar} className="h-8 text-sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-3">
                <p className="text-xs font-semibold text-muted-foreground mb-2">Feedback aan AI</p>
                <Textarea placeholder="Optioneel: leg uit waarom je aanpast..." className="text-sm resize-none" rows={2} />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
                  <Check className="size-3.5" />
                  Opslaan & toepassen
                </Button>
                <Button variant="outline" onClick={() => setShowAanpassenDialog(false)}>Annuleren</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ============================================================================
// FEED CARD COMPONENT
// ============================================================================

interface FeedCardProps {
  item: FeedItem
  expandedReasoning: string | null
  onToggleReasoning: (id: string) => void
  onAanpassen: () => void
}

function FeedCard({ item, expandedReasoning, onToggleReasoning, onAanpassen }: FeedCardProps) {
  const isVoorstel = item.type === "voorstel"
  const isGoedgekeurd = item.type === "goedgekeurd"
  const isAfgewezen = item.type === "afgewezen"
  const isAuto = item.type === "auto"

  const borderClass = isVoorstel
    ? `border-l-4 ${getUrgentieBorderColor(item.urgentie)}`
    : isGoedgekeurd
    ? "border-l-4 border-l-success"
    : isAfgewezen
    ? "border-l-4 border-l-destructive"
    : isAuto
    ? "border-l-4 border-l-success/50"
    : ""

  return (
    <Card className={`border-border ${borderClass}`}>
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isVoorstel && <span className="text-[10px] font-semibold text-primary">◉ Nieuw voorstel</span>}
            {isGoedgekeurd && <span className="text-[10px] font-semibold text-success flex items-center gap-1"><Check className="size-3" /> Goedgekeurd door jou</span>}
            {isAfgewezen && <span className="text-[10px] font-semibold text-destructive flex items-center gap-1"><X className="size-3" /> Afgewezen</span>}
            {isAuto && <span className="text-[10px] font-semibold text-success/80 flex items-center gap-1"><Zap className="size-3" /> Automatisch toegepast</span>}
            {getCategorieBadge(item.categorie)}
          </div>
          <span className="text-[10px] text-muted-foreground shrink-0">{item.datum}</span>
        </div>

        {/* Content */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">{item.titel}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{item.beschrijving}</p>
        </div>

        {/* Aanpassingen preview */}
        {isVoorstel && item.aanpassingen && (
          <div className="flex flex-col gap-1.5 bg-secondary/50 rounded-md p-2">
            <p className="text-[10px] font-semibold text-muted-foreground">Voorgestelde aanpassingen:</p>
            {item.aanpassingen.map((a, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">{a.veld}:</span>
                <span className="line-through text-muted-foreground">{a.van}</span>
                <ChevronRight className="size-3 text-muted-foreground" />
                <span className="font-semibold text-primary">{a.naar}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reasoning collapsible */}
        {isVoorstel && item.reasoning && (
          <Collapsible open={expandedReasoning === item.id} onOpenChange={() => onToggleReasoning(item.id)}>
            <CollapsibleTrigger className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              <ChevronDown className={`size-3 transition-transform ${expandedReasoning === item.id ? "rotate-180" : ""}`} />
              Bekijk reasoning
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="bg-secondary/30 rounded-md p-3 border border-border">
                <ul className="flex flex-col gap-1.5">
                  {item.reasoning.map((r, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Zekerheid indicator */}
        {isVoorstel && item.zekerheid && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">Zekerheid:</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className={`size-2 rounded-full ${i <= Math.round(item.zekerheid! / 20) ? "bg-primary" : "bg-border"}`}
                />
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground">{item.zekerheid}%</span>
          </div>
        )}

        {/* Action buttons */}
        {isVoorstel && (
          <div className="flex items-center gap-2 pt-2 border-t border-border">
            <Button size="sm" className="h-8 text-xs gap-1.5 flex-1 bg-success hover:bg-success/90 text-success-foreground">
              <Check className="size-3.5" />
              Goedkeuren
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 flex-1 border-border" onClick={onAanpassen}>
              <Edit3 className="size-3.5" />
              Aanpassen
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border text-destructive hover:text-destructive">
              <X className="size-3.5" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-muted-foreground ml-auto">
              <ChevronRight className="size-3.5" />
              Client
            </Button>
          </div>
        )}

        {/* Auto-toegepast terugdraaien */}
        {isAuto && (
          <div className="flex items-center pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground">
              <Undo2 className="size-3.5" />
              Terugdraaien
            </Button>
          </div>
        )}

        {/* Goedgekeurd indicator */}
        {isGoedgekeurd && (
          <div className="flex items-center gap-1 text-[10px] text-success pt-1">
            <ChevronRight className="size-3" />
            Toegepast op programma
          </div>
        )}
      </CardContent>
    </Card>
  )
}
