"use client"

import { useState } from "react"
import { ArrowLeft, MessageCircle, ClipboardCheck, Sparkles, MoreHorizontal, Mail, CalendarDays, Dumbbell, Apple, Activity, TrendingDown, TrendingUp, Minus, Scale } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { OverzichtTab } from "@/components/client-detail/overzicht-tab"
import { TrainingTab } from "@/components/client-detail/training-tab"
import { VoedingTab } from "@/components/client-detail/voeding-tab"
import { CheckinsTab } from "@/components/client-detail/checkins-tab"
import { MetingenTab } from "@/components/client-detail/metingen-tab"
import { AiCoachTab } from "@/components/client-detail/ai-coach-tab"
import { NotitiesTab } from "@/components/client-detail/notities-tab"
import { InstellingenTab } from "@/components/client-detail/instellingen-tab"
import { AiSheet } from "@/components/client-detail/ai-sheet"

// ============================================================================
// PLACEHOLDER DATA — Client basisgegevens
// Vervang met echte data uit Supabase tabel: clients
// In productie: fetch op basis van clientId prop
// ============================================================================

/** Cliënt basisgegevens — Supabase tabel: clients */
const clientGegevens = {
  id: "client_001",                     // <-- Supabase client UUID
  naam: "Sarah van Dijk",              // <-- clients.naam
  initialen: "SD",                      // <-- Gegenereerd uit naam
  email: "sarah@email.com",            // <-- clients.email
  telefoon: "+31 6 1234 5678",         // <-- clients.telefoon
  status: "actief" as const,           // <-- clients.status: actief | risico | gepauzeerd
  programma: "Kracht Fase 2",          // <-- via client_programs join
  programmWeek: 6,                      // <-- Huidige week in programma
  programmaTotaalWeken: 12,            // <-- Totaal aantal weken programma
  lidSinds: "15 sep 2025",            // <-- clients.created_at
  laatsteActiviteit: "2 uur geleden",  // <-- Berekend uit laatste actie
  volgendeSessie: "Vandaag, 10:00",   // <-- Eerstvolgende sessie uit agenda
  avatarUrl: "",                        // <-- clients.avatar_url (leeg = fallback)
  tags: ["Premium", "Online"],         // <-- clients.tags array
}

/** Snelle statistieken voor de header strip — Berekend uit meerdere tabellen */
const headerStats = {
  gewicht: 71.1,                        // <-- Laatste gewicht uit client_checkins
  gewichtTrend: -0.4,                   // <-- kg verschil t.o.v. vorige week
  complianceTraining: 92,               // <-- % trainingen voltooid deze week
  complianceVoeding: 78,               // <-- % voedingsdoelen gehaald
  energie: 7,                           // <-- Uit laatste check-in (1-10)
  openVoorstellen: 2,                   // <-- Aantal onbehandelde AI voorstellen
}



function getStatusKleur(status: string) {
  switch (status) {
    case "actief":
      return "bg-success/10 text-success border-success/20"
    case "risico":
      return "bg-warning/10 text-warning-foreground border-warning/20"
    case "gepauzeerd":
      return "bg-muted text-muted-foreground border-border"
    default:
      return ""
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "actief": return "Actief"
    case "risico": return "Risico"
    case "gepauzeerd": return "Gepauzeerd"
    default: return status
  }
}

interface ClientDetailSectionProps {
  clientId: string
  onTerug: () => void
}

export function ClientDetailSection({ clientId, onTerug }: ClientDetailSectionProps) {
  const [actieveTab, setActieveTab] = useState("overzicht")
  const [aiSheetOpen, setAiSheetOpen] = useState(false)

  // In productie: gebruik clientId om data op te halen uit Supabase
  const client = clientGegevens

  return (
    <div className="flex flex-col h-full">
      {/* Terug-navigatie + Client header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <button
          onClick={onTerug}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="size-4" />
          Terug naar cliënten
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* Linkerkant: profiel info */}
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
                  {getStatusLabel(client.status)}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>{client.email}</span>
                <span className="hidden sm:inline">|</span>
                <span>{client.programma} &mdash; Week {client.programmWeek}/{client.programmaTotaalWeken}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                {client.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground">
                    {tag}
                  </Badge>
                ))}
                <span className="text-[11px] text-muted-foreground">Lid sinds {client.lidSinds}</span>
              </div>
            </div>
          </div>

          {/* Rechterkant: snelacties */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
              <MessageCircle className="size-3.5" />
              Bericht
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
              <ClipboardCheck className="size-3.5" />
              Check-in
            </Button>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => setAiSheetOpen(true)}
            >
              <Sparkles className="size-3.5" />
              AI Coach
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-8 border-border">
                  <MoreHorizontal className="size-4" />
                  <span className="sr-only">Meer acties</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Mail className="mr-2 size-4" />
                  E-mail sturen
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CalendarDays className="mr-2 size-4" />
                  Sessie inplannen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick-stats strip */}
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg bg-secondary/50 px-4 py-2.5 border border-border">
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <Scale className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Gewicht</span>
            <span className="text-sm font-bold text-foreground">{headerStats.gewicht} kg</span>
            <span className={`flex items-center gap-0.5 text-[11px] font-medium ${headerStats.gewichtTrend < 0 ? "text-success" : headerStats.gewichtTrend > 0 ? "text-destructive" : "text-muted-foreground"}`}>
              {headerStats.gewichtTrend < 0 ? <TrendingDown className="size-3" /> : headerStats.gewichtTrend > 0 ? <TrendingUp className="size-3" /> : <Minus className="size-3" />}
              {headerStats.gewichtTrend > 0 ? "+" : ""}{headerStats.gewichtTrend} kg
            </span>
          </div>
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <Dumbbell className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Training</span>
            <div className="flex items-center gap-1.5">
              <Progress value={headerStats.complianceTraining} className="h-1.5 w-16" />
              <span className={`text-xs font-bold ${headerStats.complianceTraining >= 90 ? "text-success" : "text-warning-foreground"}`}>{headerStats.complianceTraining}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <Apple className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Voeding</span>
            <div className="flex items-center gap-1.5">
              <Progress value={headerStats.complianceVoeding} className="h-1.5 w-16" />
              <span className={`text-xs font-bold ${headerStats.complianceVoeding >= 80 ? "text-success" : "text-warning-foreground"}`}>{headerStats.complianceVoeding}%</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pr-3 border-r border-border">
            <Activity className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Energie</span>
            <span className="text-sm font-bold text-foreground">{headerStats.energie}/10</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Sessie</span>
            <span className="text-xs font-semibold text-foreground">{client.volgendeSessie}</span>
          </div>
          {headerStats.openVoorstellen > 0 && (
            <div className="ml-auto flex items-center gap-1.5">
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] gap-1">
                <Sparkles className="size-3" />
                {headerStats.openVoorstellen} AI voorstellen
              </Badge>
            </div>
          )}
        </div>


      </div>

      {/* Tabs navigatie — met iconen voor snellere herkenning */}
      <Tabs value={actieveTab} onValueChange={setActieveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card px-6">
          <TabsList className="h-11 bg-transparent p-0 gap-0 overflow-x-auto">
            {[
              { value: "overzicht", label: "Overzicht", icon: Activity },
              { value: "training", label: "Training", icon: Dumbbell },
              { value: "voeding", label: "Voeding", icon: Apple },
              { value: "checkins", label: "Check-ins", icon: ClipboardCheck },
              { value: "metingen", label: "Metingen", icon: Scale },
              { value: "ai-coach", label: "AI Coach", icon: Sparkles, badge: headerStats.openVoorstellen },
              { value: "notities", label: "Notities", icon: MessageCircle },
              { value: "instellingen", label: "Instellingen", icon: CalendarDays },
            ].map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 text-sm gap-1.5 shrink-0"
              >
                <tab.icon className="size-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {tab.badge}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="overzicht" className="mt-0 h-full">
            <OverzichtTab />
          </TabsContent>
          <TabsContent value="training" className="mt-0 h-full">
            <TrainingTab />
          </TabsContent>
          <TabsContent value="voeding" className="mt-0 h-full">
            <VoedingTab />
          </TabsContent>
          <TabsContent value="checkins" className="mt-0 h-full">
            <CheckinsTab />
          </TabsContent>
          <TabsContent value="metingen" className="mt-0 h-full">
            <MetingenTab />
          </TabsContent>
          <TabsContent value="ai-coach" className="mt-0 h-full">
            <AiCoachTab />
          </TabsContent>
          <TabsContent value="notities" className="mt-0 h-full">
            <NotitiesTab />
          </TabsContent>
          <TabsContent value="instellingen" className="mt-0 h-full">
            <InstellingenTab />
          </TabsContent>
        </div>
      </Tabs>

      {/* Floating AI Sheet — beschikbaar vanuit elke tab */}
      <AiSheet open={aiSheetOpen} onOpenChange={setAiSheetOpen} />

      {/* Floating AI knop rechtsonder */}
      {!aiSheetOpen && actieveTab !== "ai-coach" && (
        <button
          onClick={() => setAiSheetOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          aria-label="AI Coach openen"
        >
          <Sparkles className="size-5" />
        </button>
      )}
    </div>
  )
}
