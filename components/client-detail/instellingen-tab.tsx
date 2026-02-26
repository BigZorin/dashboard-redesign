"use client"

import {
  CreditCard,
  Bell,
  User,
  Mail,
  Phone,
  Calendar,
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
// INSTELLINGEN TAB — Administratieve client gegevens
// ============================================================================

const clientGegevens = {
  naam: "Lisa de Vries",
  email: "lisa.devries@email.com",
  telefoon: "+31 6 12345678",
  geboortedatum: "12 apr 1996",
  lidSinds: "15 sep 2025",
}

const pakketInfo = {
  naam: "Premium Coaching",
  status: "Actief",
  prijs: "€149/maand",
  verlengingsdatum: "15 mrt 2026",
  factuurEmail: "lisa.devries@email.com",
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
      {/* Client gegevens */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <User className="size-4 text-primary" />
            Client gegevens
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Naam</label>
              <Input defaultValue={clientGegevens.naam} className="h-9 border-border text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Geboortedatum</label>
              <div className="flex items-center gap-2 h-9 px-3 rounded-md bg-secondary/30 border border-border">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground">{clientGegevens.geboortedatum}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">E-mailadres</label>
              <div className="flex items-center gap-2">
                <Mail className="size-3.5 text-muted-foreground" />
                <Input defaultValue={clientGegevens.email} className="h-9 border-border text-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">Telefoonnummer</label>
              <div className="flex items-center gap-2">
                <Phone className="size-3.5 text-muted-foreground" />
                <Input defaultValue={clientGegevens.telefoon} className="h-9 border-border text-sm" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground p-2 bg-secondary/30 rounded-lg">
            <span>Lid sinds:</span>
            <span className="font-medium text-foreground">{clientGegevens.lidSinds}</span>
          </div>
        </CardContent>
      </Card>

      {/* Pakket & Facturatie */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <CreditCard className="size-4 text-primary" />
            Pakket & Facturatie
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-3">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-foreground">{pakketInfo.naam}</span>
              <span className="text-[11px] text-muted-foreground">{pakketInfo.prijs}</span>
            </div>
            <Badge className="bg-success/10 text-success border-success/20 text-[10px]">{pakketInfo.status}</Badge>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase">Volgende verlenging</span>
              <span className="text-sm font-medium text-foreground">{pakketInfo.verlengingsdatum}</span>
            </div>
            <div className="flex flex-col gap-1 p-3 rounded-lg bg-secondary/30">
              <span className="text-[10px] text-muted-foreground uppercase">Factuur e-mail</span>
              <span className="text-sm font-medium text-foreground truncate">{pakketInfo.factuurEmail}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-8">Wijzig pakket</Button>
            <Button variant="outline" size="sm" className="text-xs h-8">Facturen bekijken</Button>
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
