"use client"

import { useState } from "react"
import { Dumbbell, Plus, Trash2, Calendar, Clock, ChevronRight, Play, Pause, CheckCircle2, MoreHorizontal } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ============================================================================
// PROGRAMMA'S TAB — Beheer trainings- en voedingsprogramma's
// ============================================================================

type ProgrammaStatus = "actief" | "gepland" | "voltooid" | "gepauzeerd"

interface Programma {
  id: string
  naam: string
  type: "training" | "voeding" | "gecombineerd"
  status: ProgrammaStatus
  startDatum: string
  eindDatum: string
  voortgang: number // percentage
  beschrijving: string
  weken: number
}

const programmas: Programma[] = [
  {
    id: "prog_001",
    naam: "Kracht Fase 2",
    type: "training",
    status: "actief",
    startDatum: "24 jan 2026",
    eindDatum: "17 apr 2026",
    voortgang: 50,
    beschrijving: "Upper/Lower split met focus op compound movements",
    weken: 12,
  },
  {
    id: "prog_002",
    naam: "Cut Protocol",
    type: "voeding",
    status: "actief",
    startDatum: "24 jan 2026",
    eindDatum: "17 apr 2026",
    voortgang: 50,
    beschrijving: "Caloriedeficit met hoog eiwit, 1650 kcal target",
    weken: 12,
  },
  {
    id: "prog_003",
    naam: "Kracht Fase 3",
    type: "training",
    status: "gepland",
    startDatum: "18 apr 2026",
    eindDatum: "11 jul 2026",
    voortgang: 0,
    beschrijving: "Progressieve overload met deload weken",
    weken: 12,
  },
  {
    id: "prog_004",
    naam: "Kracht Fase 1",
    type: "training",
    status: "voltooid",
    startDatum: "1 okt 2025",
    eindDatum: "23 jan 2026",
    voortgang: 100,
    beschrijving: "Basis krachtopbouw full body",
    weken: 12,
  },
]

const beschikbareProgrammas = [
  { naam: "Push Pull Legs", type: "training", weken: 8 },
  { naam: "Full Body 3x", type: "training", weken: 6 },
  { naam: "Upper Lower 4x", type: "training", weken: 10 },
  { naam: "Bulk Protocol", type: "voeding", weken: 12 },
  { naam: "Maintenance", type: "voeding", weken: 8 },
  { naam: "Recomp Plan", type: "gecombineerd", weken: 16 },
]

const statusConfig: Record<ProgrammaStatus, { label: string; color: string; icon: React.ElementType }> = {
  actief: { label: "Actief", color: "bg-success/10 text-success border-success/20", icon: Play },
  gepland: { label: "Gepland", color: "bg-primary/10 text-primary border-primary/20", icon: Calendar },
  voltooid: { label: "Voltooid", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  gepauzeerd: { label: "Gepauzeerd", color: "bg-warning/10 text-warning border-warning/20", icon: Pause },
}

export function ProgrammasTab() {
  const [programmaLijst, setProgrammaLijst] = useState(programmas)

  const handleVerwijder = (id: string) => {
    setProgrammaLijst(prev => prev.filter(p => p.id !== id))
  }

  const handleStatusWijzig = (id: string, nieuweStatus: ProgrammaStatus) => {
    setProgrammaLijst(prev => prev.map(p => p.id === id ? { ...p, status: nieuweStatus } : p))
  }

  const actieveProgrammas = programmaLijst.filter(p => p.status === "actief")
  const geplandeProgrammas = programmaLijst.filter(p => p.status === "gepland")
  const voltooideGepauseerdeProgrammas = programmaLijst.filter(p => p.status === "voltooid" || p.status === "gepauzeerd")

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Programma's</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Beheer trainings- en voedingsprogramma's voor deze client</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground">
              <Plus className="size-3.5" />
              Programma toevoegen
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {beschikbareProgrammas.map((prog, i) => (
              <DropdownMenuItem key={i} className="flex items-center justify-between">
                <span className="text-sm">{prog.naam}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[9px] h-4">
                    {prog.type === "training" ? "Training" : prog.type === "voeding" ? "Voeding" : "Combi"}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground">{prog.weken}w</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Actieve programma's */}
      {actieveProgrammas.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actief</h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {actieveProgrammas.map((prog) => (
              <ProgrammaKaart key={prog.id} programma={prog} onVerwijder={handleVerwijder} onStatusWijzig={handleStatusWijzig} />
            ))}
          </div>
        </div>
      )}

      {/* Geplande programma's */}
      {geplandeProgrammas.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gepland</h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {geplandeProgrammas.map((prog) => (
              <ProgrammaKaart key={prog.id} programma={prog} onVerwijder={handleVerwijder} onStatusWijzig={handleStatusWijzig} />
            ))}
          </div>
        </div>
      )}

      {/* Voltooide & gepauzeerde programma's */}
      {voltooideGepauseerdeProgrammas.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Voltooid & Gepauzeerd</h4>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {voltooideGepauseerdeProgrammas.map((prog) => (
              <ProgrammaKaart key={prog.id} programma={prog} onVerwijder={handleVerwijder} onStatusWijzig={handleStatusWijzig} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ProgrammaKaart({ programma, onVerwijder, onStatusWijzig }: {
  programma: Programma
  onVerwijder: (id: string) => void
  onStatusWijzig: (id: string, status: ProgrammaStatus) => void
}) {
  const status = statusConfig[programma.status]
  const StatusIcon = status.icon

  return (
    <Card className={cn(
      "border-border transition-all hover:shadow-md",
      programma.status === "actief" && "border-primary/30"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={cn(
              "flex items-center justify-center size-10 rounded-lg shrink-0",
              programma.type === "training" ? "bg-primary/10" : programma.type === "voeding" ? "bg-success/10" : "bg-warning/10"
            )}>
              <Dumbbell className={cn(
                "size-5",
                programma.type === "training" ? "text-primary" : programma.type === "voeding" ? "text-success" : "text-warning"
              )} />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">{programma.naam}</span>
                <Badge variant="outline" className={cn("text-[9px] h-4 shrink-0", status.color)}>
                  <StatusIcon className="size-2.5 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{programma.beschrijving}</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 shrink-0">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {programma.status !== "actief" && (
                <DropdownMenuItem onClick={() => onStatusWijzig(programma.id, "actief")}>
                  <Play className="size-3.5 mr-2" /> Activeren
                </DropdownMenuItem>
              )}
              {programma.status === "actief" && (
                <DropdownMenuItem onClick={() => onStatusWijzig(programma.id, "gepauzeerd")}>
                  <Pause className="size-3.5 mr-2" /> Pauzeren
                </DropdownMenuItem>
              )}
              {programma.status === "gepauzeerd" && (
                <DropdownMenuItem onClick={() => onStatusWijzig(programma.id, "actief")}>
                  <Play className="size-3.5 mr-2" /> Hervatten
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => onVerwijder(programma.id)}>
                <Trash2 className="size-3.5 mr-2" /> Verwijderen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Voortgang */}
        {programma.status === "actief" && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1.5">
              <span>Voortgang</span>
              <span className="font-medium text-foreground">{programma.voortgang}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${programma.voortgang}%` }}
              />
            </div>
          </div>
        )}

        {/* Meta info */}
        <div className="mt-4 flex items-center gap-4 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3" />
            <span>{programma.startDatum} - {programma.eindDatum}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="size-3" />
            <span>{programma.weken} weken</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
