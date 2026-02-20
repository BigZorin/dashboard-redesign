"use client"

import { StickyNote, Pin, FileText, Upload, Image, File, Dumbbell, Apple, Brain, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

// ============================================================================
// PLACEHOLDER DATA — Notities & bestanden van de coach over deze cliënt
// Vervang met echte data uit Supabase tabellen:
//   - coach_notes (notities per cliënt)
//   - client_files (gedeelde bestanden)
// ============================================================================

/** Coach notities — Supabase: coach_notes */
const notities = [
  {
    id: "note_001",
    datum: "28 feb 2026",                    // <-- Datum aangemaakt
    categorie: "training" as const,          // <-- algemeen | training | voeding | mindset
    tekst: "Progressie op squat is uitstekend — van 80 kg naar 90 kg in 6 weken. Overweeg volume te verhogen in volgende fase. Let op form bij zwaardere sets.",
    vastgepind: true,                        // <-- True als notitie bovenaan moet staan
  },
  {
    id: "note_002",
    datum: "25 feb 2026",
    categorie: "voeding" as const,
    tekst: "Eiwitinname consistent onder target (145g vs 160g doel). Besproken om extra whey shake + cottage cheese toe te voegen. Mealprep tips gedeeld.",
    vastgepind: true,
  },
  {
    id: "note_003",
    datum: "21 feb 2026",
    categorie: "mindset" as const,
    tekst: "Sarah meldde stress op werk. Besproken hoe dit slaap en herstel beïnvloedt. Ademhalingsoefeningen voor het slapen aanbevolen.",
    vastgepind: false,
  },
  {
    id: "note_004",
    datum: "14 feb 2026",
    categorie: "algemeen" as const,
    tekst: "Vakantie week 8 gepland. Reisschema voorbereid met bodyweight oefeningen en flexibel voedingsplan. Geen deload nodig aangezien dit als rust functioneert.",
    vastgepind: false,
  },
  {
    id: "note_005",
    datum: "7 feb 2026",
    categorie: "training" as const,
    tekst: "Lichte klachten linker schouder bij overhead press. Form gecheckt — iets te veel flare. Cue gegeven om ellebogen dichter bij lichaam te houden.",
    vastgepind: false,
  },
  {
    id: "note_006",
    datum: "31 jan 2026",
    categorie: "voeding" as const,
    tekst: "Supplementenprotocol opgesteld: creatine 5g/dag, vitamine D 2000IU, omega-3 1000mg, magnesium 400mg voor het slapen.",
    vastgepind: false,
  },
]

/** Gedeelde bestanden — Supabase: client_files */
const bestanden = [
  {
    id: "file_001",
    naam: "Trainingsschema_Fase2.pdf",       // <-- Bestandsnaam
    type: "pdf" as const,                     // <-- pdf | afbeelding | document | spreadsheet
    grootte: "245 KB",                        // <-- Bestandsgrootte
    datum: "20 jan 2026",                     // <-- Upload datum
  },
  {
    id: "file_002",
    naam: "Voedingsplan_v3.pdf",
    type: "pdf" as const,
    grootte: "189 KB",
    datum: "24 jan 2026",
  },
  {
    id: "file_003",
    naam: "Supplementenprotocol.pdf",
    type: "pdf" as const,
    grootte: "56 KB",
    datum: "31 jan 2026",
  },
  {
    id: "file_004",
    naam: "Progressiefoto_week1.jpg",
    type: "afbeelding" as const,
    grootte: "2.1 MB",
    datum: "24 jan 2026",
  },
  {
    id: "file_005",
    naam: "Progressiefoto_week6.jpg",
    type: "afbeelding" as const,
    grootte: "2.3 MB",
    datum: "28 feb 2026",
  },
  {
    id: "file_006",
    naam: "Metingen_tracker.xlsx",
    type: "spreadsheet" as const,
    grootte: "34 KB",
    datum: "1 feb 2026",
  },
]

function getCategorieConfig(categorie: string) {
  switch (categorie) {
    case "training":
      return { icon: Dumbbell, kleur: "bg-chart-1/10 text-chart-1 border-chart-1/20" }
    case "voeding":
      return { icon: Apple, kleur: "bg-chart-2/10 text-chart-2 border-chart-2/20" }
    case "mindset":
      return { icon: Brain, kleur: "bg-chart-3/10 text-chart-3 border-chart-3/20" }
    default:
      return { icon: StickyNote, kleur: "bg-secondary text-muted-foreground border-border" }
  }
}

function getBestandIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileText className="size-4 text-destructive" />
    case "afbeelding":
      return <Image className="size-4 text-chart-2" />
    case "spreadsheet":
      return <FileText className="size-4 text-success" />
    default:
      return <File className="size-4 text-muted-foreground" />
  }
}

export function NotitiesTab() {
  const vastgepind = notities.filter(n => n.vastgepind)
  const overige = notities.filter(n => !n.vastgepind)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Notities kolom (2/3) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Nieuwe notitie */}
          <Card className="border-border">
            <CardContent className="p-4">
              <Textarea
                placeholder="Schrijf een notitie over deze cliënt..."
                className="min-h-[80px] resize-none border-border text-sm mb-3"
                rows={3}
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {["Algemeen", "Training", "Voeding", "Mindset"].map((cat) => (
                    <Badge
                      key={cat}
                      variant="outline"
                      className="text-[10px] cursor-pointer hover:bg-secondary/80 transition-colors"
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
                <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground">
                  <Plus className="size-3" />
                  Notitie opslaan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Vastgepinde notities */}
          {vastgepind.length > 0 && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 px-1">
                <Pin className="size-3 text-primary" />
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Vastgepind</span>
              </div>
              {vastgepind.map((notitie) => {
                const config = getCategorieConfig(notitie.categorie)
                const Icon = config.icon
                return (
                  <Card key={notitie.id} className="border-primary/20 bg-primary/[0.02]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${config.kleur} text-[10px] capitalize gap-1`}>
                            <Icon className="size-3" />
                            {notitie.categorie}
                          </Badge>
                          <Pin className="size-3 text-primary" />
                        </div>
                        <span className="text-[11px] text-muted-foreground">{notitie.datum}</span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">{notitie.tekst}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Overige notities */}
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
              Alle notities
            </span>
            {overige.map((notitie) => {
              const config = getCategorieConfig(notitie.categorie)
              const Icon = config.icon
              return (
                <Card key={notitie.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={`${config.kleur} text-[10px] capitalize gap-1`}>
                        <Icon className="size-3" />
                        {notitie.categorie}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">{notitie.datum}</span>
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{notitie.tekst}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Bestanden kolom (1/3) */}
        <div className="flex flex-col gap-4">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Bestanden</CardTitle>
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-border">
                  <Upload className="size-3" />
                  Uploaden
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5">
              {bestanden.map((bestand) => (
                <div
                  key={bestand.id}
                  className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-secondary/50 transition-colors cursor-pointer"
                >
                  {getBestandIcon(bestand.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{bestand.naam}</p>
                    <p className="text-[10px] text-muted-foreground">{bestand.grootte} &middot; {bestand.datum}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
