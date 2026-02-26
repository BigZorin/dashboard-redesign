"use client"

import { useState } from "react"
import { List, LayoutGrid, TrendingUp, TrendingDown, Minus, Camera, MessageSquare, ArrowLeftRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ============================================================================
// PLACEHOLDER DATA — Wekelijkse check-ins van de cliënt
//
// COACH-SCOPED: Data van 1 specifieke client.
// RLS: SELECT op client_checkins via JOIN clients WHERE coach_id = auth.uid()
//
// Vervang met echte data uit Supabase tabel: client_checkins
// Elke check-in bevat: gewicht, metingen, scores, opmerkingen, foto's
// Foto's: opgeslagen in Supabase Storage bucket "checkin-photos"
//   pad: checkin-photos/{client_id}/{checkin_id}/{front|side|back}.jpg
// ============================================================================

/** Wekelijkse check-in data — Supabase: client_checkins */
const checkins = [
  {
    id: "checkin_006",                        // <-- Supabase UUID
    weekNummer: 6,                            // <-- Weeknummer in programma
    datum: "28 feb 2026",                     // <-- Datum van check-in
    gewicht: 71.1,                            // <-- Gewicht in kg
    gewichtVerandering: -0.4,                 // <-- Verschil t.o.v. vorige week
    taille: 78,                               // <-- Tailleomtrek in cm
    heupen: 96,                               // <-- Heupomtrek in cm
    borst: 95,                                // <-- Borstomtrek in cm
    armen: 33,                                // <-- Armomtrek in cm
    energie: 7,                               // <-- Energieniveau 1-10
    slaap: 8,                                 // <-- Slaapkwaliteit 1-10
    stress: 5,                                // <-- Stressniveau 1-10
    complianceTraining: 92,                   // <-- % trainingen voltooid
    complianceVoeding: 78,                    // <-- % voedingsdoelen gehaald
    heeftFotos: true,                         // <-- Heeft progressiefoto's
    aantalFotos: 3,                           // <-- Aantal foto's
    clientOpmerking: "Voelde me sterk deze week, squats gaan goed. Iets meer last van slaap door stress op werk.",
    coachNotitie: "Goede progressie. Aandacht voor slaaphygiëne bespreken.",
  },
  {
    id: "checkin_005",
    weekNummer: 5,
    datum: "21 feb 2026",
    gewicht: 71.5,
    gewichtVerandering: -0.5,
    taille: 78.5,
    heupen: 96.5,
    borst: 95,
    armen: 33,
    energie: 8,
    slaap: 7,
    stress: 4,
    complianceTraining: 100,
    complianceVoeding: 82,
    heeftFotos: true,
    aantalFotos: 3,
    clientOpmerking: "Super goede week, alle trainingen gedaan en me energiek gevoeld.",
    coachNotitie: "Uitstekende week. PR op deadlift!",
  },
  {
    id: "checkin_004",
    weekNummer: 4,
    datum: "14 feb 2026",
    gewicht: 72.0,
    gewichtVerandering: -0.3,
    taille: 79,
    heupen: 97,
    borst: 95.5,
    armen: 32.5,
    energie: 6,
    slaap: 6,
    stress: 6,
    complianceTraining: 100,
    complianceVoeding: 75,
    heeftFotos: false,
    aantalFotos: 0,
    clientOpmerking: "Drukke week op werk, voeding was moeilijk vol te houden maar trainingen waren goed.",
    coachNotitie: "Compliance voeding bespreken. Mealprep tips gedeeld.",
  },
  {
    id: "checkin_003",
    weekNummer: 3,
    datum: "7 feb 2026",
    gewicht: 72.3,
    gewichtVerandering: -0.2,
    taille: 79.5,
    heupen: 97,
    borst: 96,
    armen: 32.5,
    energie: 7,
    slaap: 7,
    stress: 5,
    complianceTraining: 75,
    complianceVoeding: 80,
    heeftFotos: true,
    aantalFotos: 3,
    clientOpmerking: "Eén training gemist door vakantiedag. Verder goed verlopen.",
    coachNotitie: "Prima week ondanks gemiste sessie.",
  },
  {
    id: "checkin_002",
    weekNummer: 2,
    datum: "31 jan 2026",
    gewicht: 72.5,
    gewichtVerandering: -0.3,
    taille: 80,
    heupen: 97.5,
    borst: 96,
    armen: 32,
    energie: 7,
    slaap: 8,
    stress: 4,
    complianceTraining: 100,
    complianceVoeding: 85,
    heeftFotos: false,
    aantalFotos: 0,
    clientOpmerking: "Goed gewend aan het schema. Voelt comfortabel.",
    coachNotitie: "Adaptatiefase verloopt goed.",
  },
  {
    id: "checkin_001",
    weekNummer: 1,
    datum: "24 jan 2026",
    gewicht: 72.8,
    gewichtVerandering: 0,
    taille: 80.5,
    heupen: 98,
    borst: 96,
    armen: 32,
    energie: 6,
    slaap: 7,
    stress: 5,
    complianceTraining: 100,
    complianceVoeding: 70,
    heeftFotos: true,
    aantalFotos: 3,
    clientOpmerking: "Eerste week, nog wat wennen aan de macro's.",
    coachNotitie: "Startmetingen vastgelegd. Goede instelling.",
  },
]

function getTrendIcon(waarde: number) {
  if (waarde < 0) return <TrendingDown className="size-3 text-success" />
  if (waarde > 0) return <TrendingUp className="size-3 text-destructive" />
  return <Minus className="size-3 text-muted-foreground" />
}

function ScoreBalk({ waarde, max = 10 }: { waarde: number; max?: number }) {
  const percentage = (waarde / max) * 100
  const kleur = waarde >= 7 ? "bg-success" : waarde >= 5 ? "bg-warning" : "bg-destructive"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${kleur}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground">{waarde}/{max}</span>
    </div>
  )
}

export function CheckinsTab() {
  const [weergave, setWeergave] = useState<"tijdlijn" | "tabel">("tijdlijn")
  const [vergelijkModus, setVergelijkModus] = useState(false)
  const [geselecteerdeWeken, setGeselecteerdeWeken] = useState<string[]>([])

  function toggleWeekSelectie(id: string) {
    setGeselecteerdeWeken(prev => {
      if (prev.includes(id)) return prev.filter(w => w !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const vergelijkData = geselecteerdeWeken.length === 2
    ? geselecteerdeWeken.map(id => checkins.find(c => c.id === id)!).filter(Boolean)
    : []

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header met toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Wekelijkse check-ins</h3>
          <p className="text-xs text-muted-foreground">{checkins.length} check-ins vastgelegd</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={vergelijkModus ? "default" : "outline"}
            size="sm"
            className={`h-7 gap-1.5 text-xs ${vergelijkModus ? "bg-primary text-primary-foreground" : "border-border"}`}
            onClick={() => {
              setVergelijkModus(!vergelijkModus)
              if (vergelijkModus) setGeselecteerdeWeken([])
            }}
          >
            <ArrowLeftRight className="size-3.5" />
            {vergelijkModus ? `Vergelijken (${geselecteerdeWeken.length}/2)` : "Vergelijk"}
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
            <Button
              variant={weergave === "tijdlijn" ? "default" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setWeergave("tijdlijn")}
            >
              <LayoutGrid className="size-3.5" />
              Tijdlijn
            </Button>
            <Button
              variant={weergave === "tabel" ? "default" : "ghost"}
              size="sm"
              className="h-7 gap-1.5 text-xs"
              onClick={() => setWeergave("tabel")}
            >
              <List className="size-3.5" />
              Tabel
            </Button>
          </div>
        </div>
      </div>

      {/* Tijdlijn weergave */}
      {weergave === "tijdlijn" && (
        <div className="relative flex flex-col gap-0">
          {/* Verticale lijn */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {checkins.map((checkin, i) => (
            <div key={checkin.id} className="relative flex gap-4 pb-6">
              {/* Tijdlijn dot */}
              <button
                onClick={() => vergelijkModus && toggleWeekSelectie(checkin.id)}
                className={`relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 bg-card transition-all ${
                  vergelijkModus
                    ? geselecteerdeWeken.includes(checkin.id)
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-primary/30 hover:border-primary cursor-pointer"
                    : "border-primary/30"
                }`}
              >
                <span className="text-[11px] font-bold text-primary">W{checkin.weekNummer}</span>
              </button>

              {/* Content kaart - Verbeterd design */}
              <Card className={`flex-1 transition-all overflow-hidden ${
                vergelijkModus && geselecteerdeWeken.includes(checkin.id)
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border"
              }`}>
                {/* Header met key metrics */}
                <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-base font-semibold text-foreground">Week {checkin.weekNummer}</p>
                      <p className="text-xs text-muted-foreground">{checkin.datum}</p>
                    </div>
                    {/* Key metric: Gewicht */}
                    <div className="flex items-center gap-3 pl-4 border-l border-border">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-muted-foreground uppercase">Gewicht</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-foreground">{checkin.gewicht}</span>
                          <span className="text-xs text-muted-foreground">kg</span>
                          <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                            checkin.gewichtVerandering <= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                          }`}>
                            {getTrendIcon(checkin.gewichtVerandering)}
                            {checkin.gewichtVerandering > 0 ? "+" : ""}{checkin.gewichtVerandering}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Compliance badges */}
                    <div className="flex items-center gap-1.5">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold ${
                        checkin.complianceTraining >= 90 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}>
                        <span className="text-muted-foreground font-normal">Training</span>
                        {checkin.complianceTraining}%
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold ${
                        checkin.complianceVoeding >= 80 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                      }`}>
                        <span className="text-muted-foreground font-normal">Voeding</span>
                        {checkin.complianceVoeding}%
                      </div>
                    </div>
                    {checkin.heeftFotos && (
                      <Badge variant="outline" className="text-[10px] gap-1 border-primary/30 text-primary">
                        <Camera className="size-3" />
                        {checkin.aantalFotos}
                      </Badge>
                    )}
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Welzijn scores - Compact inline */}
                  <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-12">Energie</span>
                      <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${checkin.energie >= 7 ? "bg-success" : checkin.energie >= 5 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${checkin.energie * 10}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-8">{checkin.energie}/10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-12">Slaap</span>
                      <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${checkin.slaap >= 7 ? "bg-success" : checkin.slaap >= 5 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${checkin.slaap * 10}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-8">{checkin.slaap}/10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground w-12">Stress</span>
                      <div className="h-2 w-20 rounded-full bg-secondary overflow-hidden">
                        <div className={`h-full rounded-full ${checkin.stress <= 4 ? "bg-success" : checkin.stress <= 6 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${checkin.stress * 10}%` }} />
                      </div>
                      <span className="text-xs font-semibold text-foreground w-8">{checkin.stress}/10</span>
                    </div>
                  </div>

                  {/* Lichaamsmaten - Compact grid */}
                  <div className="flex items-center gap-6 pb-4 mb-4 border-b border-border">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Maten</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Taille</span>
                        <span className="text-xs font-semibold text-foreground">{checkin.taille}cm</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Heupen</span>
                        <span className="text-xs font-semibold text-foreground">{checkin.heupen}cm</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Borst</span>
                        <span className="text-xs font-semibold text-foreground">{checkin.borst}cm</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Armen</span>
                        <span className="text-xs font-semibold text-foreground">{checkin.armen}cm</span>
                      </div>
                    </div>
                  </div>

                  {/* Opmerkingen - Stacked */}
                  <div className="flex flex-col gap-2">
                    {checkin.clientOpmerking && (
                      <div className="flex gap-2 items-start">
                        <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground leading-relaxed italic">
                          {`"${checkin.clientOpmerking}"`}
                        </p>
                      </div>
                    )}
                    {checkin.coachNotitie && (
                      <div className="flex gap-2 items-start rounded-md bg-primary/5 p-2 -mx-2">
                        <span className="text-[10px] font-bold text-primary shrink-0">COACH</span>
                        <p className="text-xs text-foreground leading-relaxed">{checkin.coachNotitie}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Vergelijk paneel */}
      {vergelijkModus && vergelijkData.length === 2 && (
        <Card className="border-primary/30 bg-primary/[0.02]">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="size-4 text-primary" />
              <CardTitle className="text-sm font-semibold">
                Vergelijking: Week {vergelijkData[0].weekNummer} vs Week {vergelijkData[1].weekNummer}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold">Metriek</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Week {vergelijkData[0].weekNummer}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Week {vergelijkData[1].weekNummer}</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Verschil</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { label: "Gewicht", v1: vergelijkData[0].gewicht, v2: vergelijkData[1].gewicht, eenheid: "kg", lagerIsBeter: true },
                    { label: "Taille", v1: vergelijkData[0].taille, v2: vergelijkData[1].taille, eenheid: "cm", lagerIsBeter: true },
                    { label: "Heupen", v1: vergelijkData[0].heupen, v2: vergelijkData[1].heupen, eenheid: "cm", lagerIsBeter: true },
                    { label: "Armen", v1: vergelijkData[0].armen, v2: vergelijkData[1].armen, eenheid: "cm", lagerIsBeter: false },
                    { label: "Energie", v1: vergelijkData[0].energie, v2: vergelijkData[1].energie, eenheid: "/10", lagerIsBeter: false },
                    { label: "Slaap", v1: vergelijkData[0].slaap, v2: vergelijkData[1].slaap, eenheid: "/10", lagerIsBeter: false },
                    { label: "Training", v1: vergelijkData[0].complianceTraining, v2: vergelijkData[1].complianceTraining, eenheid: "%", lagerIsBeter: false },
                    { label: "Voeding", v1: vergelijkData[0].complianceVoeding, v2: vergelijkData[1].complianceVoeding, eenheid: "%", lagerIsBeter: false },
                  ].map((rij) => {
                    const verschil = Number((rij.v2 - rij.v1).toFixed(1))
                    const isPositief = rij.lagerIsBeter ? verschil < 0 : verschil > 0
                    return (
                      <TableRow key={rij.label}>
                        <TableCell className="text-sm font-medium text-foreground">{rij.label}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{rij.v1} {rij.eenheid}</TableCell>
                        <TableCell className="text-center text-sm text-foreground">{rij.v2} {rij.eenheid}</TableCell>
                        <TableCell className="text-center">
                          <span className={`text-sm font-semibold ${
                            verschil === 0 ? "text-muted-foreground" : isPositief ? "text-success" : "text-destructive"
                          }`}>
                            {verschil > 0 ? "+" : ""}{verschil} {rij.eenheid}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {vergelijkModus && geselecteerdeWeken.length < 2 && (
        <div className="rounded-lg border border-dashed border-primary/30 bg-primary/[0.02] p-6 text-center">
          <ArrowLeftRight className="size-6 text-primary/40 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Selecteer <span className="font-semibold text-foreground">{2 - geselecteerdeWeken.length}</span> {geselecteerdeWeken.length === 1 ? "week" : "weken"} om te vergelijken
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">Klik op de weeknummers in de tijdlijn hierboven</p>
        </div>
      )}

      {/* Tabel weergave */}
      {weergave === "tabel" && (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold">Week</TableHead>
                    <TableHead className="text-[11px] font-semibold">Datum</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Gewicht</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">+/-</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Taille</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Heupen</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Energie</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Slaap</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Training</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Voeding</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">{"Foto's"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkins.map((checkin) => (
                    <TableRow key={checkin.id}>
                      <TableCell className="text-sm font-medium text-foreground">W{checkin.weekNummer}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{checkin.datum}</TableCell>
                      <TableCell className="text-center text-sm font-medium text-foreground">{checkin.gewicht}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          {getTrendIcon(checkin.gewichtVerandering)}
                          <span className={`text-xs ${checkin.gewichtVerandering <= 0 ? "text-success" : "text-destructive"}`}>
                            {checkin.gewichtVerandering > 0 ? "+" : ""}{checkin.gewichtVerandering}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-foreground">{checkin.taille}</TableCell>
                      <TableCell className="text-center text-xs text-foreground">{checkin.heupen}</TableCell>
                      <TableCell className="text-center text-xs text-foreground">{checkin.energie}/10</TableCell>
                      <TableCell className="text-center text-xs text-foreground">{checkin.slaap}/10</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            checkin.complianceTraining >= 90 ? "border-success/30 text-success" : "border-warning/30 text-warning-foreground"
                          }`}
                        >
                          {checkin.complianceTraining}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            checkin.complianceVoeding >= 80 ? "border-success/30 text-success" : "border-warning/30 text-warning-foreground"
                          }`}
                        >
                          {checkin.complianceVoeding}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {checkin.heeftFotos ? (
                          <Badge variant="outline" className="text-[10px] gap-1">
                            <Camera className="size-3" />
                            {checkin.aantalFotos}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
