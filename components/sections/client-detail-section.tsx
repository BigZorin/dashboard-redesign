"use client"

import { useState } from "react"
import { ArrowLeft, MessageCircle, ClipboardCheck, Sparkles, MoreHorizontal, Mail, CalendarDays } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="size-4" />
          Terug naar cliënten
        </button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
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
                <span>{client.programma} &mdash; Week {client.programmWeek} van {client.programmaTotaalWeken}</span>
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
      </div>

      {/* Tabs navigatie */}
      <Tabs value={actieveTab} onValueChange={setActieveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border bg-card px-6">
          <TabsList className="h-11 bg-transparent p-0 gap-0">
            <TabsTrigger
              value="overzicht"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
            >
              Overzicht
            </TabsTrigger>
            <TabsTrigger
              value="training"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
            >
              Training
            </TabsTrigger>
            <TabsTrigger
              value="voeding"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
            >
              Voeding
            </TabsTrigger>
            <TabsTrigger
              value="checkins"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
            >
              Check-ins
            </TabsTrigger>
            <TabsTrigger
              value="metingen"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
            >
              Metingen
            </TabsTrigger>
            <TabsTrigger
              value="ai-coach"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
            >
              AI Coach
            </TabsTrigger>
            <TabsTrigger
              value="notities"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
            >
              Notities
            </TabsTrigger>
            <TabsTrigger
              value="instellingen"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 text-sm"
            >
              Instellingen
            </TabsTrigger>
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
