"use client"

import { Target, CreditCard, Bell, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ============================================================================
// PLACEHOLDER DATA — Cliënt-specifieke instellingen
//
// COACH-SCOPED: Coach kan alleen instellingen aanpassen van eigen clienten.
// RLS: UPDATE op clients WHERE coach_id = auth.uid()
//
// Vervang met echte data uit Supabase tabellen:
//   - clients (basisgegevens, doel, notities)
//   - client_programs (programma toewijzing)
//   - client_notifications (communicatie voorkeuren)
//   - GEEN client_subscriptions / facturatie data — dat is admin-only (/admin)
// ============================================================================

/** Programma toewijzing — Supabase: client_programs + programs */
const programmaToewijzing = {
  huidigProgramma: "Kracht Fase 2",        // <-- Huidig actief programma
  beschikbareProgrammas: [                   // <-- Alle beschikbare programma's
    "Kracht Fase 1",
    "Kracht Fase 2",
    "Kracht Fase 3",
    "Afvallen 12 weken",
    "Spiermassa Basis",
    "Wedstrijd Prep",
    "Wellness & Mobiliteit",
    "Postnataal Herstel",
  ],
  startDatum: "24 jan 2026",               // <-- Start van huidig programma
  verwachteEinddatum: "17 apr 2026",       // <-- Verwachte einddatum
}

// FACTURATIE DATA IS VERWIJDERD VAN COACH DASHBOARD
// Betalingen, abonnementen, bedragen en Stripe data zijn ADMIN-ONLY.
// Coaches mogen GEEN financiële informatie van clienten zien.
// Facturatie wordt beheerd in: /admin -> Facturatie tab
// Alleen admins kunnen betalingsstatus, bedragen en abonnementen inzien.

/** Cliëntdoel — Supabase: clients */
const clientDoel = {
  hoofddoel: "Krachttoename + lichaamsrecompositie",  // <-- Primair doel
  gewichtsDoel: "68 kg",                               // <-- Streefgewicht
  tijdlijn: "6 maanden",                               // <-- Tijdlijn
  notities: "Wil uiteindelijk een powerlifting wedstrijd doen. Focus nu op basis opbouwen en gewicht verliezen terwijl kracht toeneemt.",
}

/** Communicatie voorkeuren — Supabase: client_notifications */
const communicatie = {
  emailNotificaties: true,          // <-- E-mail bij berichten coach
  pushNotificaties: true,           // <-- Push notificaties app
  checkInHerinnering: true,         // <-- Wekelijkse check-in herinnering
  trainingsHerinnering: true,       // <-- Dagelijkse trainingsherinnering
  weekrapport: false,               // <-- Wekelijks voortgangsrapport
}

export function InstellingenTab() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      {/* Programma toewijzing */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Settings className="size-4 text-primary" />
            Programma toewijzing
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Huidig programma</label>
              <Select defaultValue={programmaToewijzing.huidigProgramma}>
                <SelectTrigger className="h-9 border-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {programmaToewijzing.beschikbareProgrammas.map((prog) => (
                    <SelectItem key={prog} value={prog} className="text-sm">
                      {prog}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Startdatum</label>
              <Input
                type="text"
                value={programmaToewijzing.startDatum}
                readOnly
                className="h-9 border-border text-sm bg-secondary/30"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
            <span className="text-xs text-muted-foreground">Verwachte einddatum</span>
            <span className="text-xs font-semibold text-foreground">{programmaToewijzing.verwachteEinddatum}</span>
          </div>
        </CardContent>
      </Card>

      {/* Doelen */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="size-4 text-primary" />
            Doel & achtergrond
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hoofddoel</label>
              <Input
                defaultValue={clientDoel.hoofddoel}
                className="h-9 border-border text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Streefgewicht</label>
              <Input
                defaultValue={clientDoel.gewichtsDoel}
                className="h-9 border-border text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tijdlijn</label>
              <Input
                defaultValue={clientDoel.tijdlijn}
                className="h-9 border-border text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notities & achtergrond</label>
            <Textarea
              defaultValue={clientDoel.notities}
              className="min-h-[80px] resize-none border-border text-sm"
              rows={3}
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground">
              Opslaan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Facturatie — ADMIN-ONLY, niet zichtbaar voor coaches */}
      {/* Toon alleen het pakket dat de client heeft, zonder bedragen */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Pakket
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">Premium Coaching</span>
              <span className="text-[11px] text-muted-foreground">Lid sinds 15 sep 2025</span>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
              Actief
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Betalingsgegevens zijn beschikbaar in het admin dashboard.</p>
        </CardContent>
      </Card>

      {/* Communicatie voorkeuren */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            Communicatie voorkeuren
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {[
            { label: "E-mail notificaties", beschrijving: "Ontvang e-mail bij nieuwe berichten", waarde: communicatie.emailNotificaties },
            { label: "Push notificaties", beschrijving: "Push notificaties via de app", waarde: communicatie.pushNotificaties },
            { label: "Check-in herinnering", beschrijving: "Wekelijkse herinnering voor check-in", waarde: communicatie.checkInHerinnering },
            { label: "Trainingsherinnering", beschrijving: "Dagelijkse herinnering voor trainingen", waarde: communicatie.trainingsHerinnering },
            { label: "Weekrapport", beschrijving: "Automatisch wekelijks voortgangsrapport", waarde: communicatie.weekrapport },
          ].map((instelling, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-foreground">{instelling.label}</span>
                <span className="text-[11px] text-muted-foreground">{instelling.beschrijving}</span>
              </div>
              <Switch defaultChecked={instelling.waarde} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
