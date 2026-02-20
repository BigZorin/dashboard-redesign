"use client"

import { useEffect, useState } from "react"
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
import { getCoachClients, type ClientData } from "@/app/actions/clients"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

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

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return "Geen data"
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: nl })
  } catch {
    return "Onbekend"
  }
}

function formatSessionTime(dateStr: string | null): string {
  if (!dateStr) return "Geen sessie"
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / 86400000)

    const timeStr = date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })

    if (diffDays === 0) return `Vandaag, ${timeStr}`
    if (diffDays === 1) return `Morgen, ${timeStr}`
    return `${date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}, ${timeStr}`
  } catch {
    return "Onbekend"
  }
}

interface ClientsSectionProps {
  onSelectClient?: (clientId: string) => void
}

export function ClientsSection({ onSelectClient }: ClientsSectionProps) {
  const [clienten, setClienten] = useState<ClientData[]>([])
  const [loading, setLoading] = useState(true)
  const [zoekterm, setZoekterm] = useState("")

  useEffect(() => {
    async function fetchClients() {
      try {
        const result = await getCoachClients()
        if (result.success && result.clients) {
          setClienten(result.clients)
        }
      } catch (err) {
        console.error("Failed to load clients:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchClients()
  }, [])

  const gefilterdeClienten = clienten.filter(c =>
    c.naam.toLowerCase().includes(zoekterm.toLowerCase()) ||
    c.email.toLowerCase().includes(zoekterm.toLowerCase())
  )

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
            <TabsTrigger value="alle">Alle ({gefilterdeClienten.length})</TabsTrigger>
            <TabsTrigger value="actief">Actief ({gefilterdeClienten.filter(c => c.status === "actief").length})</TabsTrigger>
            <TabsTrigger value="risico">Risico ({gefilterdeClienten.filter(c => c.status === "risico").length})</TabsTrigger>
            <TabsTrigger value="gepauzeerd">Gepauzeerd ({gefilterdeClienten.filter(c => c.status === "gepauzeerd").length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Zoek cliënten..."
                className="pl-9 h-9 w-64 bg-card border-border"
                value={zoekterm}
                onChange={(e) => setZoekterm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="h-9 w-9 border-border">
              <Filter className="size-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </div>

        {gefilterdeClienten.length === 0 ? (
          <div className="mt-8 text-center text-muted-foreground">
            <p className="text-lg font-medium">Geen cliënten gevonden</p>
            <p className="text-sm mt-1">Er zijn nog geen cliënten aan jouw coaching account gekoppeld.</p>
          </div>
        ) : (
          <>
            <TabsContent value="alle" className="mt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {gefilterdeClienten.map((client) => (
                  <ClientKaart key={client.id} client={client} onClick={() => onSelectClient?.(client.id)} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="actief" className="mt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {gefilterdeClienten.filter(c => c.status === "actief").map((client) => (
                  <ClientKaart key={client.id} client={client} onClick={() => onSelectClient?.(client.id)} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="risico" className="mt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {gefilterdeClienten.filter(c => c.status === "risico").map((client) => (
                  <ClientKaart key={client.id} client={client} onClick={() => onSelectClient?.(client.id)} />
                ))}
              </div>
            </TabsContent>
            <TabsContent value="gepauzeerd" className="mt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {gefilterdeClienten.filter(c => c.status === "gepauzeerd").map((client) => (
                  <ClientKaart key={client.id} client={client} onClick={() => onSelectClient?.(client.id)} />
                ))}
              </div>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}

function ClientKaart({ client, onClick }: { client: ClientData; onClick?: () => void }) {
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
              <span className="text-xs text-muted-foreground">Laatste check-in: {formatRelativeTime(client.laatsteCheckin)}</span>
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
              {client.tags.length > 0 ? client.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground">
                  {tag}
                </Badge>
              )) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-border text-muted-foreground">
                  Online
                </Badge>
              )}
            </div>
            <span className="text-[11px] text-muted-foreground">Volgende: {formatSessionTime(client.volgendeSessie)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
