"use client"

import { useState } from "react"
import { Plus, ChevronLeft, ChevronRight, Video, MapPin, Calendar, Settings, ExternalLink, Check, Clock, Users, RefreshCw, X, LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte agenda-data uit Supabase + Google Calendar API
//
// COACH-SCOPED DATA:
//   De coach ziet ALLEEN zijn/haar eigen sessies en beschikbaarheid.
//   Filter: WHERE client_sessions.coach_id = auth.uid()
//   Filter: WHERE coach_availability.coach_id = auth.uid()
//
// Supabase tabellen (gefilterd op coach_id):
//   - client_sessions (id, coach_id, client_id, type, status, start_time, end_time, modus, locatie, notities)
//     type: "pt_sessie" | "video_call"
//     status: "gepland" | "bevestigd" | "voltooid" | "no_show" | "geannuleerd"
//     modus: "locatie" (fysiek PT) | "video" (online call)
//   - coach_availability (id, coach_id, dag_van_week, start_tijd, eind_tijd, actief)
//     Coach stelt wekelijkse beschikbaarheid in. Wordt getoond aan clienten in de app.
//   - coach_google_calendar (id, coach_id, access_token, refresh_token, calendar_id, last_sync)
//     OAuth2 tokens voor twee-weg sync. Webhook voor real-time updates.
//
// RLS Policies:
//   client_sessions: SELECT/INSERT/UPDATE WHERE coach_id = auth.uid()
//   coach_availability: SELECT/INSERT/UPDATE/DELETE WHERE coach_id = auth.uid()
//   coach_google_calendar: SELECT/UPDATE WHERE coach_id = auth.uid()
//
// Google Calendar integratie (twee-weg sync):
//   - OAuth2 flow: coach klikt "Verbind Google Calendar" -> redirect naar Google consent -> callback slaat tokens op
//   - Sync naar GCal: nieuwe sessie in CoachHub -> create event in Google Calendar
//   - Sync vanuit GCal: Google webhook -> Supabase Edge Function -> blokkeer tijdslot
//   - Beschikbaarheid: coach_availability MINUS bezette GCal events = vrije slots voor clienten
//
// Client booking flow (app-zijde, later):
//   - Client ziet vrije slots (berekend uit coach_availability - bezette sessies - GCal events)
//   - Client selecteert type (PT sessie / Video call), datum + tijd
//   - Sessie wordt aangemaakt in client_sessions + event in Google Calendar
// ============================================================================

const dagen = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]
const datums = [24, 25, 26, 27, 28, 1, 2]
const huidigeDag = 2

const tijdslots = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"]

const sessies = [
  {
    id: "1",
    titel: "Sarah van Dijk",
    initialen: "SD",
    type: "PT Sessie",           // <-- type sessie
    startTijd: "10:00",
    eindTijd: "11:00",
    dag: 2,
    slotStart: 3,
    duur: 2,
    kleur: "bg-chart-5/15 border-chart-5/30 text-chart-5",
    modus: "locatie" as const,   // <-- fysiek op locatie
    status: "bevestigd" as const,
  },
  {
    id: "2",
    titel: "Tom Bakker",
    initialen: "TB",
    type: "Video Call",
    startTijd: "11:30",
    eindTijd: "12:00",
    dag: 2,
    slotStart: 4,
    duur: 1,
    kleur: "bg-primary/15 border-primary/30 text-primary",
    modus: "video" as const,
    status: "bevestigd" as const,
  },
  {
    id: "3",
    titel: "PT Sessie",
    initialen: "LV",
    type: "PT Sessie",
    startTijd: "14:00",
    eindTijd: "15:00",
    dag: 2,
    slotStart: 7,
    duur: 2,
    kleur: "bg-chart-5/15 border-chart-5/30 text-chart-5",
    modus: "locatie" as const,
    status: "gepland" as const,
  },
  {
    id: "4",
    titel: "Lisa de Vries",
    initialen: "LV",
    type: "Video Call",
    startTijd: "16:00",
    eindTijd: "16:30",
    dag: 2,
    slotStart: 9,
    duur: 1,
    kleur: "bg-primary/15 border-primary/30 text-primary",
    modus: "video" as const,
    status: "bevestigd" as const,
  },
  {
    id: "5",
    titel: "Emma Jansen",
    initialen: "EJ",
    type: "PT Sessie",
    startTijd: "09:00",
    eindTijd: "10:00",
    dag: 3,
    slotStart: 2,
    duur: 2,
    kleur: "bg-chart-5/15 border-chart-5/30 text-chart-5",
    modus: "locatie" as const,
    status: "gepland" as const,
  },
  {
    id: "6",
    titel: "Marco Visser",
    initialen: "MV",
    type: "Video Call",
    startTijd: "08:00",
    eindTijd: "08:30",
    dag: 4,
    slotStart: 1,
    duur: 1,
    kleur: "bg-primary/15 border-primary/30 text-primary",
    modus: "video" as const,
    status: "bevestigd" as const,
  },
  {
    id: "7",
    titel: "Anna Groot",
    initialen: "AG",
    type: "PT Sessie",
    startTijd: "15:00",
    eindTijd: "16:00",
    dag: 5,
    slotStart: 8,
    duur: 2,
    kleur: "bg-chart-5/15 border-chart-5/30 text-chart-5",
    modus: "locatie" as const,
    status: "bevestigd" as const,
  },
]

const agendaVandaag = [
  { tijd: "10:00", naam: "Sarah van Dijk", initialen: "SD", type: "PT Sessie", modus: "locatie" as const, status: "bevestigd" },
  { tijd: "11:30", naam: "Tom Bakker", initialen: "TB", type: "Video Call", modus: "video" as const, status: "bevestigd" },
  { tijd: "14:00", naam: "Lisa de Vries", initialen: "LV", type: "PT Sessie", modus: "locatie" as const, status: "gepland" },
  { tijd: "16:00", naam: "Lisa de Vries", initialen: "LV", type: "Video Call", modus: "video" as const, status: "bevestigd" },
]

// Placeholder beschikbaarheid
const beschikbaarheid = [
  { dag: "Maandag", start: "08:00", eind: "18:00", actief: true },
  { dag: "Dinsdag", start: "08:00", eind: "18:00", actief: true },
  { dag: "Woensdag", start: "08:00", eind: "18:00", actief: true },
  { dag: "Donderdag", start: "08:00", eind: "17:00", actief: true },
  { dag: "Vrijdag", start: "09:00", eind: "15:00", actief: true },
  { dag: "Zaterdag", start: "09:00", eind: "12:00", actief: false },
  { dag: "Zondag", start: "", eind: "", actief: false },
]

export function ScheduleSection() {
  const [beschikbaarheidOpen, setBeschikbaarheidOpen] = useState(false)
  const [gcalDialogOpen, setGcalDialogOpen] = useState(false)
  const [gcalVerbonden, setGcalVerbonden] = useState(false) // <-- Supabase: coach_google_calendar record exists
  const [nieuweSessieOpen, setNieuweSessieOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Agenda</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer je sessies, beschikbaarheid en kalenderkoppeling</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => setBeschikbaarheidOpen(true)}
          >
            <Clock className="size-3.5" />
            Beschikbaarheid
          </Button>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-1.5 text-xs",
              gcalVerbonden && "border-success/30 text-success"
            )}
            onClick={() => setGcalDialogOpen(true)}
          >
            <Calendar className="size-3.5" />
            {gcalVerbonden ? "Google Calendar" : "Koppel Agenda"}
            {gcalVerbonden && <Check className="size-3" />}
          </Button>
          <Button
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 text-xs"
            size="sm"
            onClick={() => setNieuweSessieOpen(true)}
          >
            <Plus className="size-3.5" />
            Nieuwe sessie
          </Button>
        </div>
      </div>

      {/* Google Calendar banner als nog niet verbonden */}
      {!gcalVerbonden && (
        <Card className="border-primary/20 bg-primary/[0.03] p-0 gap-0 overflow-hidden">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Calendar className="size-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">Verbind je Google Calendar</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Synchroniseer sessies twee-weg en laat clienten alleen boeken wanneer je beschikbaar bent.
              </p>
            </div>
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shrink-0"
              onClick={() => setGcalDialogOpen(true)}
            >
              <LinkIcon className="size-3.5" />
              Verbinden
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground shrink-0"
            >
              <X className="size-3.5" />
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {/* Kalender grid */}
        <Card className="border-border shadow-sm xl:col-span-3 overflow-hidden p-0 gap-0">
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
                  className={cn("flex flex-col items-center gap-0.5 p-2", i === huidigeDag && "bg-primary/5")}
                >
                  <span className="text-[11px] text-muted-foreground font-medium uppercase">{dag}</span>
                  <span className={cn(
                    "text-sm font-semibold flex items-center justify-center size-7 rounded-full",
                    i === huidigeDag ? "bg-primary text-primary-foreground" : "text-foreground"
                  )}>
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
                          className={cn(
                            "relative h-16 border-b border-r border-border/50",
                            dagIdx === huidigeDag && "bg-primary/[0.02]"
                          )}
                        >
                          {sessie && (
                            <div
                              className={cn(
                                "absolute inset-x-0.5 top-0.5 rounded-md border px-2 py-1 cursor-pointer hover:opacity-90 transition-opacity",
                                sessie.kleur
                              )}
                              style={{ height: `${sessie.duur * 64 - 4}px` }}
                            >
                              <div className="flex items-center gap-1">
                                {sessie.modus === "video" ? (
                                  <Video className="size-2.5 shrink-0" />
                                ) : (
                                  <MapPin className="size-2.5 shrink-0" />
                                )}
                                <p className="text-[11px] font-semibold truncate">{sessie.titel}</p>
                              </div>
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

        {/* Rechter kolom */}
        <div className="flex flex-col gap-4">
          {/* Agenda vandaag */}
          <Card className="border-border shadow-sm p-0 gap-0">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-foreground">Vandaag</CardTitle>
              <p className="text-xs text-muted-foreground">Woensdag, 26 feb</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-2.5">
                {agendaVandaag.map((sessie, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg border border-border p-2.5 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className={cn(
                      "size-8 rounded-md flex items-center justify-center shrink-0",
                      sessie.modus === "locatie" ? "bg-chart-5/10" : "bg-primary/10"
                    )}>
                      {sessie.modus === "video" ? (
                        <Video className="size-3.5 text-primary" />
                      ) : (
                        <MapPin className="size-3.5 text-chart-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{sessie.naam}</p>
                      <p className="text-[10px] text-muted-foreground">{sessie.type}</p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs font-medium text-foreground">{sessie.tijd}</span>
                      <Badge variant="outline" className={cn(
                        "text-[9px] px-1.5 py-0",
                        sessie.status === "bevestigd"
                          ? "border-success/30 text-success"
                          : "border-border text-muted-foreground"
                      )}>
                        {sessie.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card className="border-border shadow-sm p-0 gap-0">
            <CardHeader className="pb-3 px-4 pt-4">
              <CardTitle className="text-sm font-semibold text-foreground">Deze week</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Totaal sessies</span>
                  <span className="text-sm font-semibold text-foreground">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">PT Sessies</span>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3 text-chart-5" />
                    <span className="text-sm font-semibold text-foreground">7</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Video Calls</span>
                  <div className="flex items-center gap-1.5">
                    <Video className="size-3 text-primary" />
                    <span className="text-sm font-semibold text-foreground">5</span>
                  </div>
                </div>
                <div className="border-t border-border pt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Opkomst</span>
                  <span className="text-sm font-semibold text-success">94%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">No-shows</span>
                  <span className="text-sm font-semibold text-foreground">1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* GCal status */}
          {gcalVerbonden && (
            <Card className="border-border shadow-sm p-0 gap-0">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="size-8 rounded-md bg-success/10 flex items-center justify-center shrink-0">
                  <Calendar className="size-4 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">Google Calendar</p>
                  <p className="text-[10px] text-muted-foreground">Laatste sync: 2 min geleden</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setGcalDialogOpen(true)}
                >
                  <Settings className="size-3.5" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* Google Calendar koppeling dialog */}
      {/* ============================================================= */}
      <Dialog open={gcalDialogOpen} onOpenChange={setGcalDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Google Calendar koppeling</DialogTitle>
            <DialogDescription className="text-sm">
              Verbind je Google Calendar voor twee-weg synchronisatie. Sessies verschijnen automatisch in beide agenda{"'"}s.
            </DialogDescription>
          </DialogHeader>

          {!gcalVerbonden ? (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <RefreshCw className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Twee-weg sync</p>
                    <p className="text-xs text-muted-foreground">Sessies worden automatisch naar Google Calendar gestuurd en bezette tijden uit GCal worden geblokkeerd.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Users className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Slimme beschikbaarheid</p>
                    <p className="text-xs text-muted-foreground">Clienten zien alleen vrije tijdslots op basis van je beschikbaarheid en Google Calendar.</p>
                  </div>
                </div>
              </div>

              <Button
                className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
                onClick={() => {
                  // Placeholder: hier komt de OAuth2 redirect naar Google
                  setGcalVerbonden(true)
                  setGcalDialogOpen(false)
                }}
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Verbind met Google
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-2">
              <div className="flex items-center gap-3 rounded-lg bg-success/5 border border-success/20 p-3">
                <Check className="size-4 text-success shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Verbonden</p>
                  <p className="text-xs text-muted-foreground">coach@gmail.com</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Sync nieuwe sessies</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">Blokkeer GCal events</span>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
                onClick={() => {
                  setGcalVerbonden(false)
                  setGcalDialogOpen(false)
                }}
              >
                Ontkoppelen
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ============================================================= */}
      {/* Beschikbaarheid dialog */}
      {/* ============================================================= */}
      <Dialog open={beschikbaarheidOpen} onOpenChange={setBeschikbaarheidOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base">Beschikbaarheid instellen</DialogTitle>
            <DialogDescription className="text-sm">
              Stel je wekelijkse beschikbare uren in. Clienten kunnen alleen boeken binnen deze tijden.
              {gcalVerbonden && " Bezette tijden in Google Calendar worden automatisch geblokkeerd."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2">
            {beschikbaarheid.map((dag) => (
              <div key={dag.dag} className="flex items-center gap-3">
                <div className="w-24 shrink-0">
                  <span className={cn(
                    "text-sm",
                    dag.actief ? "font-medium text-foreground" : "text-muted-foreground"
                  )}>{dag.dag}</span>
                </div>
                <Switch defaultChecked={dag.actief} />
                {dag.actief ? (
                  <div className="flex items-center gap-2 flex-1">
                    <Input
                      type="time"
                      defaultValue={dag.start}
                      className="h-8 text-xs w-28"
                    />
                    <span className="text-xs text-muted-foreground">tot</span>
                    <Input
                      type="time"
                      defaultValue={dag.eind}
                      className="h-8 text-xs w-28"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Niet beschikbaar</span>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setBeschikbaarheidOpen(false)}>
              Annuleren
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setBeschikbaarheidOpen(false)}>
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================= */}
      {/* Nieuwe sessie dialog */}
      {/* ============================================================= */}
      <Dialog open={nieuweSessieOpen} onOpenChange={setNieuweSessieOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Nieuwe sessie plannen</DialogTitle>
            <DialogDescription className="text-sm">
              Plan een PT sessie of video call met een client.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Type sessie</label>
              <Select defaultValue="pt_sessie">
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pt_sessie">
                    <div className="flex items-center gap-2">
                      <MapPin className="size-3.5 text-chart-5" />
                      PT Sessie (fysiek)
                    </div>
                  </SelectItem>
                  <SelectItem value="video_call">
                    <div className="flex items-center gap-2">
                      <Video className="size-3.5 text-primary" />
                      Video Call (online)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Client</label>
              <Select>
                <SelectTrigger className="text-sm h-9">
                  <SelectValue placeholder="Selecteer een client..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah van Dijk</SelectItem>
                  <SelectItem value="tom">Tom Bakker</SelectItem>
                  <SelectItem value="lisa">Lisa de Vries</SelectItem>
                  <SelectItem value="emma">Emma Jansen</SelectItem>
                  <SelectItem value="marco">Marco Visser</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Datum</label>
                <Input type="date" className="text-sm h-9" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Tijd</label>
                <Input type="time" className="text-sm h-9" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Duur</label>
              <Select defaultValue="60">
                <SelectTrigger className="text-sm h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minuten</SelectItem>
                  <SelectItem value="45">45 minuten</SelectItem>
                  <SelectItem value="60">60 minuten</SelectItem>
                  <SelectItem value="90">90 minuten</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNieuweSessieOpen(false)}>
              Annuleren
            </Button>
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setNieuweSessieOpen(false)}>
              Sessie inplannen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
