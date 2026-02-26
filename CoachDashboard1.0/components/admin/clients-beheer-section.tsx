"use client"

import { useState, useEffect, useTransition } from "react"
import { Search, Users, Clock, CheckCircle2, XCircle, AlertTriangle, Dumbbell, Mail, CalendarDays, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getAllClients,
  approveClient,
  rejectClient,
  assignCoachToClient,
  type AdminClient,
  type CoachOption,
} from "@/app/actions/admin-clients"

type ClientStatus = "wachtrij" | "goedgekeurd" | "afgewezen"

const statusConfig: Record<ClientStatus, { label: string; kleur: string; icon: typeof Clock }> = {
  wachtrij: { label: "Wachtrij", kleur: "bg-chart-5/10 text-chart-5 border-chart-5/20", icon: Clock },
  goedgekeurd: { label: "Goedgekeurd", kleur: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
  afgewezen: { label: "Afgewezen", kleur: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
}

export function ClientsBeheerSection() {
  const [clients, setClients] = useState<AdminClient[]>([])
  const [coaches, setCoaches] = useState<CoachOption[]>([])
  const [loading, setLoading] = useState(true)
  const [zoekTerm, setZoekTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<"alle" | ClientStatus>("alle")
  const [isPending, startTransition] = useTransition()
  const [actioningId, setActioningId] = useState<string | null>(null)

  const fetchData = async () => {
    const result = await getAllClients()
    if (result.success) {
      setClients(result.clients || [])
      setCoaches(result.coaches || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleApprove = (clientId: string) => {
    setActioningId(clientId)
    startTransition(async () => {
      const result = await approveClient(clientId)
      if (result.success) {
        await fetchData()
      }
      setActioningId(null)
    })
  }

  const handleReject = (clientId: string) => {
    setActioningId(clientId)
    startTransition(async () => {
      const result = await rejectClient(clientId, "Afgewezen door coach")
      if (result.success) {
        await fetchData()
      }
      setActioningId(null)
    })
  }

  const handleAssignCoach = (clientId: string, coachId: string) => {
    setActioningId(clientId)
    startTransition(async () => {
      const result = await assignCoachToClient(clientId, coachId)
      if (result.success) {
        await fetchData()
      }
      setActioningId(null)
    })
  }

  const gefilterd = clients.filter((c) => {
    const matchZoek = zoekTerm === "" ||
      c.naam.toLowerCase().includes(zoekTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(zoekTerm.toLowerCase())
    const matchStatus = filterStatus === "alle" || c.status === filterStatus
    return matchZoek && matchStatus
  })

  const telStatus = (status: ClientStatus) => clients.filter(c => c.status === status).length
  const zonderCoach = clients.filter(c => c.coach === null).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Clients</h2>
        <p className="text-xs text-muted-foreground">Goedkeuring, afwijzing en coach toewijzing</p>
      </div>

      {/* KPI Kaarten */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          { label: "Totaal", waarde: clients.length, icon: Users },
          { label: "Wachtrij", waarde: telStatus("wachtrij"), icon: Clock },
          { label: "Goedgekeurd", waarde: telStatus("goedgekeurd"), icon: CheckCircle2, kleur: "text-success" },
          { label: "Afgewezen", waarde: telStatus("afgewezen"), icon: XCircle, kleur: "text-destructive" },
          { label: "Zonder Coach", waarde: zonderCoach, icon: AlertTriangle, kleur: "text-chart-5" },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className={cn("size-4", kpi.kleur || "text-muted-foreground")} />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className={cn("text-2xl font-bold", kpi.kleur || "text-foreground")}>{kpi.waarde}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coach Verdeling */}
      <Card className="border-border">
        <CardContent className="p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Coach verdeling</p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterStatus("alle")}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                filterStatus === "alle"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              Alle coaches
            </button>
            {coaches.map((coach) => {
              const count = clients.filter(c => c.coachId === coach.id).length
              return (
                <button
                  key={coach.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Dumbbell className="size-3" />
                  {coach.naam}
                  <Badge variant="outline" className="text-[9px] h-4 px-1 ml-0.5">{count}</Badge>
                </button>
              )
            })}
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-destructive/5 text-destructive hover:bg-destructive/10 transition-colors">
              <AlertTriangle className="size-3" />
              Niet toegewezen
              <Badge variant="outline" className="text-[9px] h-4 px-1 ml-0.5 border-destructive/20 text-destructive">{zonderCoach}</Badge>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Zoek + Filter */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op naam of email..."
                value={zoekTerm}
                onChange={(e) => setZoekTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5">
              {(["alle", "wachtrij", "goedgekeurd", "afgewezen"] as const).map((status) => {
                const count = status === "alle" ? clients.length : telStatus(status)
                return (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      filterStatus === status
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {status === "alle" ? "Alle" : statusConfig[status].label} ({count})
                  </button>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clientenlijst */}
      <Card className="border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">Clients ({gefilterd.length})</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Beheer clients, goedkeuring en coach toewijzing</p>

          {gefilterd.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Geen clients gevonden</p>
          ) : (
            <div className="flex flex-col gap-1">
              {gefilterd.map((client) => {
                const config = statusConfig[client.status]
                const isActioning = actioningId === client.id
                return (
                  <div
                    key={client.id}
                    className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 border border-border">
                        <AvatarFallback className="bg-secondary text-foreground text-xs font-semibold">
                          {client.initialen}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">{client.naam}</p>
                          <Badge variant="outline" className={cn("text-[10px] border", config.kleur)}>
                            {config.label}
                          </Badge>
                          {client.coach && (
                            <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
                              <Dumbbell className="size-2.5 mr-1" />
                              {client.coach}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1"><Mail className="size-3" />{client.email}</span>
                          <span className="flex items-center gap-1"><CalendarDays className="size-3" />{client.aangemeld}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Coach toewijzing */}
                      <Select
                        value={client.coachId || ""}
                        onValueChange={(val) => handleAssignCoach(client.id, val)}
                        disabled={isActioning}
                      >
                        <SelectTrigger className="h-8 w-[160px] text-xs">
                          <SelectValue placeholder="Coach toewijzen..." />
                        </SelectTrigger>
                        <SelectContent>
                          {coaches.map((coach) => (
                            <SelectItem key={coach.id} value={coach.id}>{coach.naam}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Goedkeuren / Afwijzen — alleen beschikbaar als coach is toegewezen */}
                      {client.status === "wachtrij" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-success/30 text-success hover:bg-success/10 hover:text-success"
                            onClick={() => handleApprove(client.id)}
                            disabled={isActioning || !client.coachId}
                            title={!client.coachId ? "Wijs eerst een coach toe" : ""}
                          >
                            {isActioning ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3 mr-1" />}
                            Goedkeuren
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleReject(client.id)}
                            disabled={isActioning || !client.coachId}
                            title={!client.coachId ? "Wijs eerst een coach toe" : ""}
                          >
                            <XCircle className="size-3 mr-1" />
                            Afwijzen
                          </Button>
                        </>
                      )}
                      {client.status === "afgewezen" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs border-success/30 text-success hover:bg-success/10 hover:text-success"
                          onClick={() => handleApprove(client.id)}
                          disabled={isActioning || !client.coachId}
                          title={!client.coachId ? "Wijs eerst een coach toe" : ""}
                        >
                          {isActioning ? <Loader2 className="size-3 animate-spin" /> : <CheckCircle2 className="size-3 mr-1" />}
                          Alsnog goedkeuren
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
