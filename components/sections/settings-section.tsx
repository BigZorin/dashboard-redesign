"use client"

import { useState, useRef } from "react"
import { User, Bell, Link as LinkIcon, Camera, Upload, Trash2, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte coach-profieldata uit Supabase
//
// COACH-SCOPED: Alle data op deze pagina is van de ingelogde coach.
// Supabase tabel: users (id, voornaam, achternaam, email, telefoon, bio, avatar_url, rol)
//
// PROFIELFOTO SYSTEEM:
//   - Opgeslagen in Supabase Storage bucket: "avatars"
//   - Pad: avatars/{user_id}/profile.{ext} (overschrijft bij nieuwe upload)
//   - Na upload: update users.avatar_url met publieke URL
//   - De avatar_url wordt overal in de app gebruikt:
//     1. Coaching sidebar (footer profiel)
//     2. Berichten sectie (coach avatar naast berichten)
//     3. Client-app (coach foto in chat, profiel, programma's)
//     4. Admin dashboard (coach lijst, gebruikers overzicht)
//   - Max bestandsgrootte: 2MB
//   - Toegestane formaten: JPG, PNG, WebP
//   - Na upload wordt een cache-busting query param toegevoegd: ?t={timestamp}
//   - Supabase Storage RLS: INSERT/UPDATE/DELETE WHERE bucket = 'avatars' AND name LIKE auth.uid() || '/%'
// ============================================================================

/** Profielvelden van de coach */
const profielData = {
  voornaam: "Mark",               // <-- users.voornaam
  achternaam: "Jensen",           // <-- users.achternaam
  email: "mark@coachhub.com",     // <-- users.email (of auth.users.email)
  telefoon: "+31 6 12345678",     // <-- users.telefoon
  initialen: "MJ",               // <-- Berekend uit voornaam[0] + achternaam[0]
  avatarUrl: "",                  // <-- users.avatar_url (Supabase Storage publieke URL)
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
  const [fotoPreview, setFotoPreview] = useState<string | null>(profielData.avatarUrl || null)
  const [fotoDialogOpen, setFotoDialogOpen] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [uploadPreview, setUploadPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.size > 2 * 1024 * 1024) return // Max 2MB
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return
    const url = URL.createObjectURL(file)
    setUploadPreview(url)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleFotoOpslaan = () => {
    // In productie: upload naar Supabase Storage bucket "avatars"
    // await supabase.storage.from('avatars').upload(`${userId}/profile.jpg`, file)
    // Dan: update users.avatar_url met publieke URL
    if (uploadPreview) {
      setFotoPreview(uploadPreview)
    }
    setUploadPreview(null)
    setFotoDialogOpen(false)
  }

  const handleFotoVerwijderen = () => {
    // In productie: supabase.storage.from('avatars').remove([`${userId}/profile.jpg`])
    // Dan: update users.avatar_url = null
    setFotoPreview(null)
    setUploadPreview(null)
    setFotoDialogOpen(false)
  }

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
              {/* Profielfoto */}
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <Avatar className="size-20 border-2 border-border">
                    <AvatarImage src={fotoPreview ?? undefined} alt="Profielfoto" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                      {profielData.initialen}
                    </AvatarFallback>
                  </Avatar>
                  <button
                    onClick={() => setFotoDialogOpen(true)}
                    className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Camera className="size-5 text-white" />
                  </button>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="border-border text-xs gap-1.5" onClick={() => setFotoDialogOpen(true)}>
                      <Upload className="size-3.5" />
                      Foto wijzigen
                    </Button>
                    {fotoPreview && (
                      <Button variant="ghost" size="sm" className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleFotoVerwijderen}>
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">JPG, PNG of WebP. Max 2MB. Wordt getoond in berichten en je profiel.</p>
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

      {/* Profielfoto upload dialog */}
      <Dialog open={fotoDialogOpen} onOpenChange={(open) => { setFotoDialogOpen(open); if (!open) setUploadPreview(null) }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Profielfoto wijzigen</DialogTitle>
            <DialogDescription>
              Upload een nieuwe profielfoto. Deze wordt getoond in berichten, je sidebar profiel en aan je clienten.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-2">
            {/* Huidige foto vs nieuwe preview */}
            <div className="flex items-center justify-center">
              <div className="relative">
                <Avatar className="size-28 border-2 border-border">
                  <AvatarImage src={uploadPreview ?? fotoPreview ?? undefined} alt="Preview" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                    {profielData.initialen}
                  </AvatarFallback>
                </Avatar>
                {uploadPreview && (
                  <button
                    onClick={() => setUploadPreview(null)}
                    className="absolute -top-1 -right-1 size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative rounded-lg border-2 border-dashed p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors
                ${dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30 hover:bg-secondary/30"
                }
              `}
            >
              <div className="size-10 rounded-full bg-secondary flex items-center justify-center">
                <Upload className="size-5 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">
                  {dragActive ? "Laat los om te uploaden" : "Klik of sleep een foto hierheen"}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">JPG, PNG of WebP. Max 2MB.</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* Info */}
            <div className="rounded-lg bg-secondary/50 px-3 py-2">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Je profielfoto is zichtbaar voor je clienten in berichten, je coachprofiel en de app. 
                Voor het beste resultaat gebruik een vierkante foto van minimaal 200x200 pixels.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            {fotoPreview && (
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 mr-auto text-xs" onClick={handleFotoVerwijderen}>
                <Trash2 className="size-3.5 mr-1.5" />
                Foto verwijderen
              </Button>
            )}
            <Button variant="outline" onClick={() => { setFotoDialogOpen(false); setUploadPreview(null) }}>
              Annuleren
            </Button>
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!uploadPreview}
              onClick={handleFotoOpslaan}
            >
              Opslaan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
