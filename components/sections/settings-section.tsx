"use client"

import { User, Bell, Link as LinkIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte coach-profieldata uit je database
// ============================================================================

/** Profielvelden van de coach */
const profielData = {
  voornaam: "Mark",               // <-- Voornaam coach
  achternaam: "Jensen",           // <-- Achternaam coach
  email: "mark@coachhub.com",     // <-- Email coach
  telefoon: "+31 6 12345678",     // <-- Telefoonnummer coach
  initialen: "MJ",
  bio: "Gecertificeerd fitness coach gespecialiseerd in krachttraining en lichaamscompositie. 8+ jaar ervaring met het helpen van cliënten om hun fitnessdoelen te bereiken.",
}

/** Meldinginstellingen */
const meldingInstellingen = [
  { titel: "Nieuwe check-in ontvangen", beschrijving: "Melding wanneer een cliënt een check-in indient", actief: true },
  { titel: "Nieuw bericht", beschrijving: "Melding bij nieuwe cliëntberichten", actief: true },
  { titel: "Sessieherinnering", beschrijving: "Herinnering 15 minuten voor geplande sessies", actief: true },
  { titel: "Betaling ontvangen", beschrijving: "Melding wanneer een cliëntbetaling is verwerkt", actief: true },
  { titel: "Cliënt mijlpaal", beschrijving: "Wanneer een cliënt een programma-mijlpaal bereikt", actief: false },
  { titel: "Weekrapport", beschrijving: "Ontvang wekelijks een bedrijfsoverzicht per e-mail", actief: true },
  { titel: "Platform updates", beschrijving: "Platformnieuws en functie-aankondigingen", actief: false },
]

/** Gekoppelde diensten / integraties */
const integraties = [
  { naam: "Google Calendar", beschrijving: "Synchroniseer je coaching sessies", gekoppeld: true, icoon: "GC" },
  { naam: "Stripe", beschrijving: "Verwerk cliëntbetalingen", gekoppeld: true, icoon: "ST" },
  { naam: "Zoom", beschrijving: "Videogesprek integratie voor sessies", gekoppeld: true, icoon: "ZM" },
  { naam: "MyFitnessPal", beschrijving: "Importeer cliënt voedingsdata", gekoppeld: false, icoon: "MF" },
  { naam: "Apple Health", beschrijving: "Synchroniseer cliënt gezondheidsmetingen", gekoppeld: false, icoon: "AH" },
  { naam: "Zapier", beschrijving: "Verbind met 5000+ apps", gekoppeld: false, icoon: "ZP" },
]

export function SettingsSection() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Instellingen</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Beheer je account en voorkeuren</p>
      </div>

      <Tabs defaultValue="profiel" className="flex flex-col gap-4">
        <TabsList className="w-fit">
          <TabsTrigger value="profiel" className="gap-2">
            <User className="size-4" />
            Profiel
          </TabsTrigger>
          <TabsTrigger value="meldingen" className="gap-2">
            <Bell className="size-4" />
            Meldingen
          </TabsTrigger>
          <TabsTrigger value="integraties" className="gap-2">
            <LinkIcon className="size-4" />
            Integraties
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiel">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Profielinformatie</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">{profielData.initialen}</AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" className="border-border">Foto wijzigen</Button>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG of GIF. Max 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground">Voornaam</Label>
                  <Input defaultValue={profielData.voornaam} className="bg-card border-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground">Achternaam</Label>
                  <Input defaultValue={profielData.achternaam} className="bg-card border-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground">E-mail</Label>
                  <Input defaultValue={profielData.email} className="bg-card border-border" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label className="text-sm text-foreground">Telefoon</Label>
                  <Input defaultValue={profielData.telefoon} className="bg-card border-border" />
                </div>
              </div>

              <Separator className="bg-border" />

              <div className="flex flex-col gap-2">
                <Label className="text-sm text-foreground">Bio</Label>
                <textarea
                  className="min-h-24 rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  defaultValue={profielData.bio}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" className="border-border">Annuleren</Button>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Wijzigingen opslaan</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meldingen">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Meldingsvoorkeuren</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {meldingInstellingen.map((melding) => (
                <div key={melding.titel} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{melding.titel}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{melding.beschrijving}</p>
                  </div>
                  <Switch defaultChecked={melding.actief} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integraties">
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-foreground">Gekoppelde diensten</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {integraties.map((integratie) => (
                <div key={integratie.naam} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-secondary text-xs font-bold text-secondary-foreground">
                      {integratie.icoon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{integratie.naam}</p>
                      <p className="text-xs text-muted-foreground">{integratie.beschrijving}</p>
                    </div>
                  </div>
                  {integratie.gekoppeld ? (
                    <Button variant="outline" size="sm" className="border-border text-muted-foreground">
                      Ontkoppelen
                    </Button>
                  ) : (
                    <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                      Koppelen
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
