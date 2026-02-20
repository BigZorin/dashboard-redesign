"use client"

import { Plus, ChevronLeft, ChevronRight, Video, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte agenda-data uit Supabase
//
// Supabase tabellen:
//   - client_sessions (sessies met datum, tijd, type, cliënt, modus)
//   - coach_availability (beschikbare tijdslots)
//   - session_types (type sessie: check-in, review, groepsles, etc.)
//
// Kalender-integratie: Google Calendar API (optioneel, sync via webhook)
// Sessie-modus: "video" (in-app videogesprek) of "locatie" (fysiek op locatie)
// ============================================================================

const dagen = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
const datums = [24, 25, 26, 27, 28, 1, 2]
const huidigeDag = 2 // Woensdag index

const tijdslots = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

/** Sessies in de weekkalender */
const sessies = [
  {
    id: "1",
    titel: "Sarah van Dijk",
    initialen: "SD",
    type: "Check-in gesprek",
    startTijd: "10:00",
    eindTijd: "10:30",
    dag: 2,
    slotStart: 3,
    duur: 1,
    kleur: "bg-primary/15 border-primary/30 text-primary",
    modus: "video",      // video | locatie
  },
  {
    id: "2",
    titel: "Tom Bakker",
    initialen: "TB",
    type: "Programma review",
    startTijd: "11:30",
    eindTijd: "12:00",
    dag: 2,
    slotStart: 4,
    duur: 1,
    kleur: "bg-chart-2/15 border-chart-2/30 text-chart-2",
    modus: "video",
  },
  {
    id: "3",
    titel: "Groep HIIT Sessie",
    initialen: "GS",
    type: "Groepsles",
    startTijd: "14:00",
    eindTijd: "15:00",
    dag: 2,
    slotStart: 7,
    duur: 2,
    kleur: "bg-chart-5/15 border-chart-5/30 text-chart-5",
    modus: "locatie",
  },
  {
    id: "4",
    titel: "Lisa de Vries",
    initialen: "LV",
    type: "Voedingsreview",
    startTijd: "16:00",
    eindTijd: "16:30",
    dag: 2,
    slotStart: 9,
    duur: 1,
    kleur: "bg-chart-4/15 border-chart-4/30 text-chart-4",
    modus: "video",
  },
  {
    id: "5",
    titel: "Emma Jansen",
    initialen: "EJ",
    type: "Intake gesprek",
    startTijd: "09:00",
    eindTijd: "10:00",
    dag: 3,
    slotStart: 2,
    duur: 2,
    kleur: "bg-chart-3/15 border-chart-3/30 text-chart-3",
    modus: "video",
  },
  {
    id: "6",
    titel: "Marco Visser",
    initialen: "MV",
    type: "Voortgangscheck",
    startTijd: "07:00",
    eindTijd: "07:30",
    dag: 4,
    slotStart: 0,
    duur: 1,
    kleur: "bg-primary/15 border-primary/30 text-primary",
    modus: "video",
  },
  {
    id: "7",
    titel: "Open spreekuur",
    initialen: "OS",
    type: "Vraag & antwoord",
    startTijd: "15:00",
    eindTijd: "16:00",
    dag: 4,
    slotStart: 8,
    duur: 2,
    kleur: "bg-chart-2/15 border-chart-2/30 text-chart-2",
    modus: "video",
  },
  {
    id: "8",
    titel: "Anna Groot",
    initialen: "AG",
    type: "Herstelsessie",
    startTijd: "11:00",
    eindTijd: "11:45",
    dag: 5,
    slotStart: 4,
    duur: 1,
    kleur: "bg-chart-4/15 border-chart-4/30 text-chart-4",
    modus: "locatie",
  },
]

/** Sessies van vandaag voor de zijbalk */
const agendaVandaag = [
  { tijd: "10:00", naam: "Sarah van Dijk", initialen: "SD", type: "Check-in gesprek", modus: "video" },
  { tijd: "11:30", naam: "Tom Bakker", initialen: "TB", type: "Programma review", modus: "video" },
  { tijd: "14:00", naam: "Groep HIIT", initialen: "GS", type: "Groepsles", modus: "locatie" },
  { tijd: "16:00", naam: "Lisa de Vries", initialen: "LV", type: "Voedingsreview", modus: "video" },
]

export function ScheduleSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Agenda</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer je coaching sessies en beschikbaarheid</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Nieuwe sessie
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Kalender grid */}
        <Card className="border-border shadow-sm xl:col-span-3 overflow-hidden">
          <CardHeader className="pb-0 pt-4 px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-foreground">Februari 2026</CardTitle>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronLeft className="size-4" />
                  <span className="sr-only">Vorige week</span>
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs border-border">
                  Vandaag
                </Button>
                <Button variant="ghost" size="icon" className="size-8">
                  <ChevronRight className="size-4" />
                  <span className="sr-only">Volgende week</span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            {/* Dag headers */}
            <div className="grid grid-cols-8 border-b border-border">
              <div className="p-2" />
              {dagen.map((dag, i) => (
                <div
                  key={dag}
                  className={`flex flex-col items-center gap-0.5 p-2 ${i === huidigeDag ? "bg-primary/5" : ""}`}
                >
                  <span className="text-[11px] text-muted-foreground font-medium uppercase">{dag}</span>
                  <span className={`text-sm font-semibold flex items-center justify-center size-7 rounded-full ${
                    i === huidigeDag ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}>
                    {datums[i]}
                  </span>
                </div>
              ))}
            </div>
            {/* Tijdgrid */}
            <div className="max-h-[480px] overflow-y-auto">
              <div className="grid grid-cols-8">
                {tijdslots.map((tijd, tijdIdx) => (
                  <div key={tijd} className="contents">
                    <div className="flex items-start justify-end pr-2 pt-1 h-16 border-b border-border/50">
                      <span className="text-[11px] text-muted-foreground">{tijd}</span>
                    </div>
                    {dagen.map((_, dagIdx) => {
                      const sessie = sessies.find(
                        (s) => s.dag === dagIdx && s.slotStart === tijdIdx
                      )
                      return (
                        <div
                          key={`${tijd}-${dagIdx}`}
                          className={`relative h-16 border-b border-r border-border/50 ${
                            dagIdx === huidigeDag ? "bg-primary/[0.02]" : ""
                          }`}
                        >
                          {sessie && (
                            <div
                              className={`absolute inset-x-0.5 top-0.5 rounded-md border px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity ${sessie.kleur}`}
                              style={{ height: `${sessie.duur * 64 - 4}px` }}
                            >
                              <p className="text-[11px] font-semibold truncate">{sessie.titel}</p>
                              <p className="text-[10px] opacity-75 truncate">{sessie.startTijd} - {sessie.eindTijd}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agenda vandaag */}
        <div className="flex flex-col gap-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Agenda vandaag</CardTitle>
              <p className="text-xs text-muted-foreground">Woensdag, 26 feb</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {agendaVandaag.map((sessie, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30 transition-colors cursor-pointer">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {sessie.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{sessie.naam}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">{sessie.type}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-medium text-foreground">{sessie.tijd}</span>
                      {sessie.modus === "video" ? (
                        <Video className="size-3.5 text-primary" />
                      ) : (
                        <MapPin className="size-3.5 text-chart-5" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Snelle statistieken</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sessies deze week</span>
                  <span className="text-sm font-semibold text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Uren gecoacht</span>
                  <span className="text-sm font-semibold text-foreground">8,5u</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Opkomstpercentage</span>
                  <span className="text-sm font-semibold text-success">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">No-shows</span>
                  <span className="text-sm font-semibold text-foreground">1</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
