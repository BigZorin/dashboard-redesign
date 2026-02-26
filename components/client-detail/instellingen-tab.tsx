"use client"

import {
  Target,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react"
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
// INSTELLINGEN TAB — Client configuratie (geen AI regels, die staan op Overzicht)
// ============================================================================

const programmaToewijzing = {
  huidigProgramma: "Kracht Fase 2",
  beschikbareProgrammas: [
    "Kracht Fase 1",
    "Kracht Fase 2",
    "Kracht Fase 3",
    "Afvallen 12 weken",
    "Spiermassa Basis",
    "Wedstrijd Prep",
  ],
  startDatum: "24 jan 2026",
  verwachteEinddatum: "17 apr 2026",
}

const clientDoel = {
  hoofddoel: "Krachttoename + lichaamsrecompositie",
  gewichtsDoel: "68 kg",
  tijdlijn: "6 maanden",
  notities: "Wil uiteindelijk een powerlifting wedstrijd doen. Focus nu op basis opbouwen.",
}

const communicatie = {
  emailNotificaties: true,
  pushNotificaties: true,
  checkInHerinnering: true,
  trainingsHerinnering: false,
  weekrapport: true,
}

export function InstellingenTab() {
  return (
    <div className="flex flex-col gap-6 p-6">
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
          <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-secondary/30 rounded-lg">
            <span>Verwachte einddatum:</span>
            <span className="font-medium text-foreground">{programmaToewijzing.verwachteEinddatum}</span>
          </div>
        </CardContent>
      </Card>

      {/* Doelen */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Target className="size-4 text-primary" />
            Actieve doelen
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Hoofddoel</label>
              <Input defaultValue={clientDoel.hoofddoel} className="h-9 border-border text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Streefgewicht</label>
              <Input defaultValue={clientDoel.gewichtsDoel} className="h-9 border-border text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Tijdlijn</label>
              <Input defaultValue={clientDoel.tijdlijn} className="h-9 border-border text-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">Notities</label>
            <Textarea
              defaultValue={clientDoel.notities}
              className="min-h-[60px] resize-none border-border text-sm"
              rows={2}
            />
          </div>
          <div className="flex justify-end">
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground">
              Opslaan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pakket */}
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
            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Actief</Badge>
          </div>
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
