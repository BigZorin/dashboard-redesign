"use client"

import { useState } from "react"
import { List, LayoutGrid, TrendingUp, TrendingDown, Minus, Camera, MessageSquare } from "lucide-react"
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
// Vervang met echte data uit Supabase tabel: client_checkins
// Elke check-in bevat: gewicht, metingen, scores, opmerkingen, foto's
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

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header met toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Wekelijkse check-ins</h3>
          <p className="text-xs text-muted-foreground">{checkins.length} check-ins vastgelegd</p>
        </div>
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

      {/* Tijdlijn weergave */}
      {weergave === "tijdlijn" && (
        <div className="relative flex flex-col gap-0">
          {/* Verticale lijn */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {checkins.map((checkin, i) => (
            <div key={checkin.id} className="relative flex gap-4 pb-6">
              {/* Tijdlijn dot */}
              <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-card">
                <span className="text-[11px] font-bold text-primary">W{checkin.weekNummer}</span>
              </div>

              {/* Content kaart */}
              <Card className="flex-1 border-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Week {checkin.weekNummer}</p>
                      <p className="text-[11px] text-muted-foreground">{checkin.datum}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {checkin.heeftFotos && (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <Camera className="size-3" />
                          {checkin.aantalFotos} {"foto's"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Gewicht</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-foreground">{checkin.gewicht} kg</span>
                        {getTrendIcon(checkin.gewichtVerandering)}
                        <span className={`text-[11px] ${checkin.gewichtVerandering <= 0 ? "text-success" : "text-destructive"}`}>
                          {checkin.gewichtVerandering > 0 ? "+" : ""}{checkin.gewichtVerandering}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Taille</span>
                      <span className="text-sm font-bold text-foreground">{checkin.taille} cm</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Training</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] w-fit ${
                          checkin.complianceTraining >= 90 ? "border-success/30 text-success" : "border-warning/30 text-warning-foreground"
                        }`}
                      >
                        {checkin.complianceTraining}%
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Voeding</span>
                      <Badge
                        variant="outline"
                        className={`text-[10px] w-fit ${
                          checkin.complianceVoeding >= 80 ? "border-success/30 text-success" : "border-warning/30 text-warning-foreground"
                        }`}
                      >
                        {checkin.complianceVoeding}%
                      </Badge>
                    </div>
                  </div>

                  {/* Scores */}
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground">Energie</span>
                      <ScoreBalk waarde={checkin.energie} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground">Slaap</span>
                      <ScoreBalk waarde={checkin.slaap} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] text-muted-foreground">Stress</span>
                      <ScoreBalk waarde={checkin.stress} />
                    </div>
                  </div>

                  {/* Lichaamsmaten detail */}
                  <div className="grid grid-cols-4 gap-2 mb-3 rounded-lg bg-secondary/40 p-2">
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground block">Taille</span>
                      <span className="text-xs font-semibold text-foreground">{checkin.taille} cm</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground block">Heupen</span>
                      <span className="text-xs font-semibold text-foreground">{checkin.heupen} cm</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground block">Borst</span>
                      <span className="text-xs font-semibold text-foreground">{checkin.borst} cm</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] text-muted-foreground block">Armen</span>
                      <span className="text-xs font-semibold text-foreground">{checkin.armen} cm</span>
                    </div>
                  </div>

                  {/* Opmerkingen */}
                  {checkin.clientOpmerking && (
                    <div className="flex gap-2 rounded-lg bg-secondary/40 p-3 mb-2">
                      <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-foreground leading-relaxed italic">
                        {`"${checkin.clientOpmerking}"`}
                      </p>
                    </div>
                  )}
                  {checkin.coachNotitie && (
                    <div className="flex gap-2 rounded-lg bg-primary/5 p-3">
                      <span className="text-[10px] font-semibold text-primary shrink-0 mt-0.5">COACH:</span>
                      <p className="text-xs text-foreground leading-relaxed">{checkin.coachNotitie}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
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
