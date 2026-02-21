"use client"

import { Search, Filter, Plus, MoreHorizontal, Mail, Phone, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte cliëntdata uit Supabase
//
// COACH-SCOPED DATA:
//   De coach ziet ALLEEN zijn/haar eigen toegewezen clienten.
//   Filter: WHERE clients.coach_id = auth.uid()
//   Een coach kan NOOIT clienten van andere coaches zien.
//
// Supabase tabellen (gefilterd op coach_id):
//   - clients (naam, email, status, tags, avatar_url WHERE coach_id = auth.uid())
//   - client_programs (huidig programma via JOIN clients WHERE coach_id = auth.uid())
//   - client_checkins (laatste check-in via JOIN clients WHERE coach_id = auth.uid())
//   - client_sessions (volgende sessie via JOIN clients WHERE coach_id = auth.uid())
//
// RLS Policy op clients tabel:
//   SELECT: WHERE coach_id = auth.uid() (coach ziet alleen eigen clienten)
//   UPDATE: WHERE coach_id = auth.uid() (coach kan alleen eigen clienten bewerken)
//   DELETE: NIET toegestaan voor coaches (admin-only via /admin)
//   INSERT: NIET toegestaan voor coaches (clienten worden via /admin goedgekeurd)
//
// Status: actief | risico (>3 dagen geen activiteit) | gepauzeerd
// Tags: opgeslagen als text[] array in clients tabel
// Trend: berekend uit laatste 2 check-ins (gewicht verschil)
// ============================================================================

/** Lijst van cliënten met hun coaching-status en voortgang — Supabase tabel: clients */
const defaultClienten = [
  {
    id: "client_001",                   // <-- Supabase UUID
    naam: "Sarah van Dijk",
    initialen: "SD",
    email: "sarah@email.com",
    status: "actief",                   // actief | risico | gepauzeerd
    programma: "Kracht Fase 2",
    voortgang: 85,                      // percentage 0-100
    volgendeSessie: "Vandaag, 10:00",
    trend: "up" as const,               // up | down | neutral
    laatsteCheckin: "2 uur geleden",
    tags: ["Premium", "Online"],
  },
  {
    id: "client_002",
    naam: "Tom Bakker",
    initialen: "TB",
    email: "tom@email.com",
    status: "actief",
    programma: "Afvallen 12 weken",
    voortgang: 62,
    volgendeSessie: "Vandaag, 11:30",
    trend: "up" as const,
    laatsteCheckin: "5 uur geleden",
    tags: ["Online"],
  },
  {
    id: "client_003",
    naam: "Lisa de Vries",
    initialen: "LV",
    email: "lisa@email.com",
    status: "actief",
    programma: "Wedstrijd Prep",
    voortgang: 94,
    volgendeSessie: "Morgen, 16:00",
    trend: "up" as const,
    laatsteCheckin: "1 dag geleden",
    tags: ["Premium", "Competitie"],
  },
  {
    id: "client_004",
    naam: "James Peters",
    initialen: "JP",
    email: "james@email.com",
    status: "risico",
    programma: "Spiermassa Basis",
    voortgang: 41,
    volgendeSessie: "3 mrt, 09:00",
    trend: "down" as const,
    laatsteCheckin: "4 dagen geleden",
    tags: ["Online"],
  },
  {
    id: "client_005",
    naam: "Emma Jansen",
    initialen: "EJ",
    email: "emma@email.com",
    status: "actief",
    programma: "Wellness & Mobiliteit",
    voortgang: 72,
    volgendeSessie: "2 mrt, 14:00",
    trend: "neutral" as const,
    laatsteCheckin: "1 dag geleden",
    tags: ["Hybride"],
  },
  {
    id: "client_006",
    naam: "David Smit",
    initialen: "DS",
    email: "david@email.com",
    status: "gepauzeerd",
    programma: "Kracht Basis",
    voortgang: 30,
    volgendeSessie: "Gepauzeerd",
    trend: "neutral" as const,
    laatsteCheckin: "2 weken geleden",
    tags: ["Online"],
  },
  {
    id: "client_007",
    naam: "Anna Groot",
    initialen: "AG",
    email: "anna@email.com",
    status: "actief",
    programma: "Postnataal Herstel",
    voortgang: 55,
    volgendeSessie: "2 mrt, 11:00",
    trend: "up" as const,
    laatsteCheckin: "6 uur geleden",
    tags: ["Premium", "Hybride"],
  },
  {
    id: "client_008",
    naam: "Marco Visser",
    initialen: "MV",
    email: "marco@email.com",
    status: "actief",
    programma: "Marathon Prep",
    voortgang: 78,
    volgendeSessie: "3 mrt, 07:00",
    trend: "up" as const,
    laatsteCheckin: "12 uur geleden",
    tags: ["Online"],
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case "actief":
      return <Badge className="bg-success/10 text-success border-success/20 text-[11px]">Actief</Badge>
    case "risico":
      return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[11px]">Risico</Badge>
    case "gepauzeerd":
      return <Badge variant="secondary" className="text-[11px]">Gepauzeerd</Badge>
    default:
      return null
  }
}

function getTrendIcon(trend: string) {
  switch (trend) {
    case "up":
      return <TrendingUp className="size-3.5 text-success" />
    case "down":
      return <TrendingDown className="size-3.5 text-destructive" />
    default:
      return <Minus className="size-3.5 text-muted-foreground" />
  }
}

// ============================================================================
// PROPS INTERFACE — Data wrapper stuurt echte data door via deze props.
// V0 kan dit bestand blijven regenereren; voeg alleen deze interface toe.
// ============================================================================
export interface ClientsSectionProps {
  clienten?: typeof defaultClienten
  loading?: boolean
  onSelectClient?: (clientId: string) => void
}

export function ClientsSection({
  clienten = defaultClienten,
  loading = false,
  onSelectClient,
}: ClientsSectionProps) {
  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-7 w-32" />
            <Skeleton className="h-4 w-64 mt-1" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-1.5 w-full mt-4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Cliënten</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer en volg je coaching cliënten</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Cliënt toevoegen
        </Button>
      </div>

      <Tabs defaultValue="alle">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="alle">Alle ({clienten.length})</TabsTrigger>
            <TabsTrigger value="actief">Actief ({clienten.filter(c => c.status === "actief").length})</TabsTrigger>
            <TabsTrigger value="risico">Risico ({clienten.filter(c => c.status === "risico").length})</TabsTrigger>
            <TabsTrigger value="gepauzeerd">Gepauzeerd ({clienten.filter(c => c.status === "gepauzeerd").length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Zoek cliënten..." className="pl-9 h-9 w-64 bg-card border-border" />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border">
              <Filter className="size-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>

        <TabsContent value="alle" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clienten.map((client) => (
              <ClientKaart key={client.id} client={client} onClick={() => onSelectClient?.(client.id)} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="actief" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clienten.filter(c => c.status === "actief").map((client) => (
              <ClientKaart key={client.id} client={client} onClick={() => onSelectClient?.(client.id)} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="risico" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clienten.filter(c => c.status === "risico").map((client) => (
              <ClientKaart key={client.id} client={client} onClick={() => onSelectClient?.(client.id)} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="gepauzeerd" className="mt-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {clienten.filter(c => c.status === "gepauzeerd").map((client) => (
              <ClientKaart key={client.id} client={client} onClick={() => onSelectClient?.(client.id)} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ClientKaart({ client, onClick }: { client: typeof defaultClienten[number]; onClick?: () => void }) {
  return (
    <Card
      className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick?.() }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {client.initialen}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{client.naam}</p>
              <p className="text-xs text-muted-foreground">{client.email}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Acties</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem><Mail className="mr-2 size-4" />Bericht sturen</DropdownMenuItem>
              <DropdownMenuItem><Phone className="mr-2 size-4" />Gesprek inplannen</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            {getStatusBadge(client.status)}
            <div className="flex items-center gap-1.5">
              {getTrendIcon(client.trend)}
              <span className="text-xs text-muted-foreground">Laatste check-in: {client.laatsteCheckin}</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{client.programma}</span>
              <span className="font-semibold text-foreground">{client.voortgang}%</span>
            </div>
            <Progress value={client.voortgang} className="h-1.5" />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {client.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground">
                  {tag}
                </Badge>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground">Volgende: {client.volgendeSessie}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
