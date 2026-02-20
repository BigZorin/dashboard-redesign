"use client"

import { useState } from "react"
import { Sparkles, Send, Check, X, Edit3, ChevronRight, Brain, Dumbbell, Apple, Pill, RefreshCw, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

// ============================================================================
// PLACEHOLDER DATA — AI Coach interface
//
// COACH-SCOPED: AI gesprekken zijn per coach, per client.
// RLS: ai_conversations WHERE coach_id = auth.uid() AND client_id = :clientId
// RLS: ai_suggestions WHERE coach_id = auth.uid() AND client_id = :clientId
//
// Vervang met echte data uit:
//   - AI API responses (Groq/OpenAI/etc via RAG pipeline)
//   - ai_conversations (Supabase: chatgeschiedenis, coach_id + client_id)
//   - ai_suggestions (Supabase: voorstellen + status, coach_id + client_id)
//   - RAG vectorstore (voedings/training/mindset kennis)
//
// De AI gebruikt de RAG om voorstellen te onderbouwen met bronvermelding.
// De coach keurt voorstellen goed, past aan of wijst af.
// Goedgekeurde voorstellen worden automatisch toegepast op het client profiel.
// ============================================================================

/** Chat berichten — Supabase: ai_conversations */
const chatBerichten = [
  {
    id: "msg_001",
    rol: "ai" as const,                      // <-- "ai" | "coach"
    tekst: "Goedemorgen! Ik heb de check-in van Sarah van deze week geanalyseerd. Hier zijn mijn bevindingen:\n\n- Gewicht: 71.1 kg (-0.4 kg, consistent dalende trend)\n- Trainingscompliatie: 92% (uitstekend)\n- Voedingscompliance: 78% (aandachtspunt)\n- Energie: 7/10, Slaap: 8/10\n\nOp basis van haar progressie en de RAG-data over periodisering, stel ik een paar aanpassingen voor. Zie het voorstel-panel rechts.",
    timestamp: "09:15",
    bronnen: ["Periodisering Handboek", "NSCA Richtlijnen"],  // <-- RAG bronvermelding
  },
  {
    id: "msg_002",
    rol: "coach" as const,
    tekst: "Goed overzicht. Haar eiwitinname is inderdaad te laag. Wat raad je aan qua voedingsaanpassingen?",
    timestamp: "09:18",
    bronnen: [],
  },
  {
    id: "msg_003",
    rol: "ai" as const,
    tekst: "Op basis van haar huidige inname (145g eiwit bij een target van 160g) en de RAG-data over eiwitbehoefte bij krachttraining, raad ik het volgende aan:\n\n1. **Verhoog whey shake naar 2x per dag** (ochtend + post-workout) — dit voegt ~24g eiwit toe\n2. **Voeg 100g cottage cheese toe** als avondsnack — +12g eiwit\n3. **Behoud huidige koolhydraten en vetten** — die zijn on track\n\nDit brengt haar totale eiwitinname naar ~181g, wat ruim boven het target is. We kunnen het target eventueel verhogen naar 170g gezien haar trainingsvolume.\n\nBron: Eiwit aanbevelingen voor krachtatleten (1.6-2.2g/kg, zij zit nu op ~2.0g/kg bij 71.1kg).",
    timestamp: "09:20",
    bronnen: ["Voedingsrichtlijnen Krachtsport", "Eiwit Metabolisme Review 2024"],
  },
  {
    id: "msg_004",
    rol: "coach" as const,
    tekst: "Mooi, dat klinkt goed. Genereer ook een voorstel voor de training van volgende week, ze is klaar voor meer volume.",
    timestamp: "09:22",
    bronnen: [],
  },
  {
    id: "msg_005",
    rol: "ai" as const,
    tekst: "Ik heb een trainingsvoorstel gegenereerd voor week 7. De belangrijkste aanpassingen:\n\n- **Squat**: verhoogd naar 92.5 kg (progressief overbelasting, +2.5 kg)\n- **Overhead Press**: verhoogd naar 42.5 kg (RPE was laag afgelopen 2 weken)\n- **Volume Dag 3 & 4**: extra set toegevoegd bij isolatie-oefeningen\n\nDe progressie is in lijn met haar adaptatiecurve en de RAG-data over volume progressie bij intermediate lifters. Zie het voorstel-panel voor de exacte aanpassingen.",
    timestamp: "09:25",
    bronnen: ["Progressive Overload Principes", "Volume Landmarks Research"],
  },
]

/** Snelle prompt knoppen — Voorgedefinieerde acties voor de coach */
const snellePrompts = [
  { label: "Wekelijkse review", icon: RefreshCw, prompt: "Analyseer de wekelijkse check-in en geef een samenvatting met aanbevelingen." },
  { label: "Trainingsaanpassing", icon: Dumbbell, prompt: "Stel aanpassingen voor aan het trainingsschema op basis van de laatste progressie." },
  { label: "Voedingsaanpassing", icon: Apple, prompt: "Analyseer de voedingscompliance en stel optimalisaties voor." },
  { label: "Supplementadvies", icon: Pill, prompt: "Review het supplementprotocol en geef aanpassingen op basis van huidige doelen." },
  { label: "Kennisbank raadplegen", icon: BookOpen, prompt: "Zoek in de RAG naar relevante informatie over " },
]

/** AI Voorstellen — Supabase: ai_suggestions */
const voorstellen = [
  {
    id: "voorstel_001",
    categorie: "training",                   // <-- training | voeding | supplement | mindset
    titel: "Trainingsaanpassingen Week 7",  // <-- Titel van voorstel
    status: "nieuw" as const,                // <-- nieuw | goedgekeurd | aangepast | afgewezen
    datum: "1 mrt 2026",
    aanpassingen: [
      { item: "Squat", van: "90 kg x 4x5", naar: "92.5 kg x 4x5", reden: "Consistente progressie, RPE 7-8 afgelopen 2 weken" },
      { item: "Overhead Press", van: "40 kg x 3x8", naar: "42.5 kg x 3x8", reden: "RPE te laag (6), ruimte voor verhoging" },
      { item: "Dag 3 Isolatie", van: "3 sets", naar: "4 sets", reden: "Volume progressie passend bij fase 2 periodisering" },
    ],
    bronnen: ["Progressive Overload Principes", "RPE-gebaseerde Programmering"],
  },
  {
    id: "voorstel_002",
    categorie: "voeding",
    titel: "Eiwitinname optimalisatie",
    status: "nieuw" as const,
    datum: "1 mrt 2026",
    aanpassingen: [
      { item: "Whey shake", van: "1x per dag", naar: "2x per dag", reden: "Eenvoudigste weg om +24g eiwit toe te voegen" },
      { item: "Avondsnack", van: "Caseine shake", naar: "Caseine + 100g cottage cheese", reden: "+12g eiwit, langzame absorptie voor nacht" },
      { item: "Eiwitdoel", van: "160g/dag", naar: "170g/dag", reden: "Beter passend bij trainingsvolume en gewicht (2.4g/kg)" },
    ],
    bronnen: ["Voedingsrichtlijnen Krachtsport", "Eiwit Timing Research"],
  },
  {
    id: "voorstel_003",
    categorie: "training",
    titel: "Deload week planning (Week 8)",
    status: "goedgekeurd" as const,
    datum: "25 feb 2026",
    aanpassingen: [
      { item: "Volume", van: "100%", naar: "60%", reden: "Standaard deload na 4 weken progressief laden" },
      { item: "Intensiteit", van: "RPE 7-9", naar: "RPE 5-6", reden: "Herstelweek" },
    ],
    bronnen: ["Periodisering Handboek"],
  },
]

function getCategorieBadge(categorie: string) {
  switch (categorie) {
    case "training":
      return <Badge className="bg-chart-1/10 text-chart-1 border-chart-1/20 text-[10px]">Training</Badge>
    case "voeding":
      return <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/20 text-[10px]">Voeding</Badge>
    case "supplement":
      return <Badge className="bg-chart-3/10 text-chart-3 border-chart-3/20 text-[10px]">Supplement</Badge>
    case "mindset":
      return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-[10px]">Mindset</Badge>
    default:
      return null
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "nieuw":
      return <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Nieuw</Badge>
    case "goedgekeurd":
      return <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Goedgekeurd</Badge>
    case "aangepast":
      return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px]">Aangepast</Badge>
    case "afgewezen":
      return <Badge variant="secondary" className="text-[10px]">Afgewezen</Badge>
    default:
      return null
  }
}

export function AiCoachTab() {
  const [berichtTekst, setBerichtTekst] = useState("")

  return (
    <div className="flex h-[calc(100vh-13rem)] flex-col lg:flex-row">
      {/* Linker paneel: Chat (60%) */}
      <div className="flex flex-1 flex-col border-r border-border lg:w-[60%]">
        {/* Chat header */}
        <div className="flex flex-col border-b border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="size-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">AI Coach Assistent</p>
                <p className="text-[11px] text-muted-foreground">RAG-ondersteund advies op basis van cliëntdata</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] gap-1">
              <span className="size-1.5 rounded-full bg-success" />
              Verbonden
            </Badge>
          </div>
          {/* Data context indicator — laat zien welke data de AI gebruikt */}
          <div className="flex items-center gap-2 px-4 py-1.5 bg-secondary/30 border-t border-border text-[10px] text-muted-foreground overflow-x-auto">
            <span className="shrink-0 font-semibold">Context:</span>
            {[
              { label: "6 check-ins", kleur: "bg-chart-1" },
              { label: "Trainingshistorie", kleur: "bg-chart-2" },
              { label: "Voedingslog", kleur: "bg-chart-3" },
              { label: "Metingen", kleur: "bg-chart-4" },
              { label: "RAG Kennisbank", kleur: "bg-primary" },
            ].map((item, i) => (
              <span key={i} className="flex items-center gap-1 shrink-0 rounded-full bg-card border border-border px-2 py-0.5">
                <span className={`size-1.5 rounded-full ${item.kleur}`} />
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Chat berichten */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            {chatBerichten.map((bericht) => (
              <div
                key={bericht.id}
                className={`flex flex-col gap-1 ${bericht.rol === "coach" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    bericht.rol === "ai"
                      ? "bg-secondary/60 border border-border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {bericht.rol === "ai" && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="size-3 text-primary" />
                      <span className="text-[10px] font-semibold text-primary">AI Coach</span>
                    </div>
                  )}
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${
                    bericht.rol === "coach" ? "text-primary-foreground" : "text-foreground"
                  }`}>
                    {bericht.tekst}
                  </p>
                  {bericht.bronnen && bericht.bronnen.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-border/50">
                      <span className="text-[10px] text-muted-foreground">Bronnen:</span>
                      {bericht.bronnen.map((bron, i) => (
                        <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                          {bron}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] text-muted-foreground px-1 ${
                  bericht.rol === "coach" ? "text-right" : ""
                }`}>
                  {bericht.timestamp}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Snelle prompts */}
        <div className="border-t border-border px-4 py-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {snellePrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-7 text-[11px] gap-1 whitespace-nowrap shrink-0 border-border hover:border-primary/30 hover:text-primary"
                onClick={() => setBerichtTekst(prompt.prompt)}
              >
                <prompt.icon className="size-3" />
                {prompt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Input veld */}
        <div className="border-t border-border p-4">
          <div className="flex items-end gap-2">
            <Textarea
              value={berichtTekst}
              onChange={(e) => setBerichtTekst(e.target.value)}
              placeholder="Stel een vraag aan de AI Coach of geef instructies..."
              className="min-h-[60px] max-h-[120px] resize-none border-border text-sm"
              rows={2}
            />
            <Button
              size="icon"
              className="size-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!berichtTekst.trim()}
            >
              <Send className="size-4" />
              <span className="sr-only">Verstuur</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Rechter paneel: Voorstellen (40%) */}
      <div className="flex flex-col border-t border-border lg:w-[40%] lg:border-t-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-card">
          <div>
            <p className="text-sm font-semibold text-foreground">Voorstellen</p>
            <p className="text-[11px] text-muted-foreground">{voorstellen.filter(v => v.status === "nieuw").length} nieuwe voorstellen</p>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            {voorstellen.map((voorstel) => (
              <Card key={voorstel.id} className={`border-border ${voorstel.status === "nieuw" ? "border-primary/30" : ""}`}>
                <CardHeader className="pb-2 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {getCategorieBadge(voorstel.categorie)}
                        {getStatusBadge(voorstel.status)}
                      </div>
                      <CardTitle className="text-sm font-semibold">{voorstel.titel}</CardTitle>
                    </div>
                    <span className="text-[10px] text-muted-foreground shrink-0">{voorstel.datum}</span>
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex flex-col gap-2">
                  {voorstel.aanpassingen.map((aanpassing, i) => (
                    <div key={i} className="rounded-md bg-secondary/40 p-2.5">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-foreground">{aanpassing.item}</span>
                        <ChevronRight className="size-3 text-muted-foreground" />
                      </div>
                      <div className="flex items-center gap-2 text-[11px] mb-1">
                        <span className="text-muted-foreground line-through">{aanpassing.van}</span>
                        <span className="text-primary font-semibold">{aanpassing.naar}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic">{aanpassing.reden}</p>
                    </div>
                  ))}

                  {/* Bronnen */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-muted-foreground">RAG bronnen:</span>
                    {voorstel.bronnen.map((bron, i) => (
                      <Badge key={i} variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                        {bron}
                      </Badge>
                    ))}
                  </div>

                  {/* Actieknoppen voor nieuwe voorstellen */}
                  {voorstel.status === "nieuw" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button size="sm" className="h-7 text-[11px] gap-1 flex-1 bg-success hover:bg-success/90 text-success-foreground">
                        <Check className="size-3" />
                        Goedkeuren
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 flex-1 border-border">
                        <Edit3 className="size-3" />
                        Aanpassen
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-border text-destructive hover:text-destructive">
                        <X className="size-3" />
                        <span className="sr-only">Afwijzen</span>
                      </Button>
                    </div>
                  )}
                  {/* Pas toe knop voor goedgekeurde voorstellen */}
                  {voorstel.status === "goedgekeurd" && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button size="sm" className="h-7 text-[11px] gap-1 flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
                        <ChevronRight className="size-3" />
                        Pas toe op schema
                      </Button>
                      <span className="text-[10px] text-muted-foreground italic">Goedgekeurd — klaar om toe te passen</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}
