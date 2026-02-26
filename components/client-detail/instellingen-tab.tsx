"use client"

import { useState } from "react"
import {
  Target,
  CreditCard,
  Bell,
  Settings,
  Sparkles,
  Dumbbell,
  Apple,
  Pill,
  Moon,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  FileText,
  Heart,
  AlertTriangle,
  User,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// ============================================================================
// AI AUTOMATISERINGSREGELS — Per domein
// ============================================================================

type AIMode = "ai_stuurt" | "voorstellen" | "handmatig"

const aiDomeinen = [
  {
    id: "voeding",
    label: "Voeding & Macro's",
    icon: Apple,
    beschrijving: "Maaltijdplannen, macro-aanpassingen, receptsuggesties",
    defaultMode: "voorstellen" as AIMode,
  },
  {
    id: "training",
    label: "Training & Progressie",
    icon: Dumbbell,
    beschrijving: "Gewichten, sets, reps, deload timing",
    defaultMode: "voorstellen" as AIMode,
  },
  {
    id: "rustdagen",
    label: "Rustdagen & Herstel",
    icon: Moon,
    beschrijving: "Extra rustdagen, actief herstel, deload weken",
    defaultMode: "ai_stuurt" as AIMode,
  },
  {
    id: "supplementen",
    label: "Supplementen",
    icon: Pill,
    beschrijving: "Supplement suggesties en dosering aanpassingen",
    defaultMode: "handmatig" as AIMode,
  },
  {
    id: "programmawissel",
    label: "Programmawissel",
    icon: RefreshCw,
    beschrijving: "Overstap naar nieuw programma of fase",
    defaultMode: "voorstellen" as AIMode,
  },
]

// ============================================================================
// INTAKE DATA — Volledige client achtergrond
// ============================================================================

const intakeData = {
  basisgegevens: {
    geboortedatum: "15 maart 1992",
    lengte: "175 cm",
    startgewicht: "72.8 kg",
    beroep: "Software developer (zittend werk)",
    trainingshistorie: "3 jaar, waarvan 1.5 jaar serieus",
  },
  medischeHistorie: {
    aandoeningen: ["Lichte knieklachten links (2023)"],
    medicatie: "Geen",
    allergieën: ["Noten (anafylactisch)"],
    blessures: ["Schouderblessure rechts - hersteld (2022)", "Lage rugklachten - beheersbaar"],
  },
  voedingsvoorkeuren: {
    dieet: "Geen specifiek dieet",
    allergieën: ["Noten", "Schaaldieren"],
    voorkeuren: ["Houdt van Aziatisch", "Kookt graag simpel"],
    afkeren: ["Vis (textuur)", "Koriander"],
    supplementenGebruik: ["Whey proteïne", "Creatine", "Vitamine D"],
  },
  leefstijl: {
    slaap: "Gemiddeld 6.5-7 uur",
    stress: "Matig - drukke periodes op werk",
    alcohol: "1-2 drankjes per week",
    roken: "Nee",
  },
  doelen: {
    primair: "Krachttoename + lichaamsrecompositie",
    secundair: "Powerlifting wedstrijd doen (lange termijn)",
    tijdlijn: "6 maanden focus op basis opbouwen",
  },
}

// ============================================================================
// OVERIGE INSTELLINGEN
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
  trainingsHerinnering: true,
  weekrapport: false,
}

export function InstellingenTab() {
  const [aiModes, setAiModes] = useState<Record<string, AIMode>>(
    Object.fromEntries(aiDomeinen.map((d) => [d.id, d.defaultMode]))
  )
  const [intakeOpen, setIntakeOpen] = useState(false)

  const updateAiMode = (domeinId: string, mode: AIMode) => {
    setAiModes((prev) => ({ ...prev, [domeinId]: mode }))
  }

  const getModeLabel = (mode: AIMode) => {
    switch (mode) {
      case "ai_stuurt": return "AI stuurt"
      case "voorstellen": return "Voorstellen"
      case "handmatig": return "Handmatig"
    }
  }

  const getModeColor = (mode: AIMode) => {
    switch (mode) {
      case "ai_stuurt": return "bg-primary/10 text-primary border-primary/20"
      case "voorstellen": return "bg-warning/10 text-warning border-warning/20"
      case "handmatig": return "bg-secondary text-muted-foreground border-border"
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl">
      {/* AI AUTOMATISERINGSREGELS — Kernstuk */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            AI Automatiseringsregels
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Bepaal per domein hoeveel autonomie AI krijgt voor deze cliënt
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {aiDomeinen.map((domein) => {
            const Icon = domein.icon
            const currentMode = aiModes[domein.id]
            return (
              <div
                key={domein.id}
                className="flex items-center justify-between rounded-lg bg-background border border-border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{domein.label}</span>
                    <span className="text-[11px] text-muted-foreground">{domein.beschrijving}</span>
                  </div>
                </div>
                <Select
                  value={currentMode}
                  onValueChange={(v) => updateAiMode(domein.id, v as AIMode)}
                >
                  <SelectTrigger className={`w-32 h-8 text-xs border ${getModeColor(currentMode)}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai_stuurt" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-primary" />
                        AI stuurt
                      </div>
                    </SelectItem>
                    <SelectItem value="voorstellen" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-warning" />
                        Voorstellen
                      </div>
                    </SelectItem>
                    <SelectItem value="handmatig" className="text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-muted-foreground" />
                        Handmatig
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )
          })}
          <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 mt-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium">Legenda</span>
              <span className="text-[10px] text-muted-foreground">
                AI stuurt = automatisch uitvoeren | Voorstellen = coach goedkeuring nodig | Handmatig = AI doet niks
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* INTAKE DATA — Collapsible */}
      <Collapsible open={intakeOpen} onOpenChange={setIntakeOpen}>
        <Card className="border-border">
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-secondary/30 transition-colors">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Intake & Achtergrond
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">Volledig ingevuld</Badge>
                  {intakeOpen ? (
                    <ChevronUp className="size-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="size-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="flex flex-col gap-4 pt-0">
              {/* Basisgegevens */}
              <div className="rounded-lg bg-secondary/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <User className="size-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold text-foreground">Basisgegevens</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Geboortedatum</span>
                    <span className="text-foreground">{intakeData.basisgegevens.geboortedatum}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Lengte</span>
                    <span className="text-foreground">{intakeData.basisgegevens.lengte}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Startgewicht</span>
                    <span className="text-foreground">{intakeData.basisgegevens.startgewicht}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Beroep</span>
                    <span className="text-foreground">{intakeData.basisgegevens.beroep}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">Trainingshistorie</span>
                    <span className="text-foreground">{intakeData.basisgegevens.trainingshistorie}</span>
                  </div>
                </div>
              </div>

              {/* Medische historie */}
              <div className="rounded-lg bg-secondary/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="size-3.5 text-destructive" />
                  <span className="text-xs font-semibold text-foreground">Medische historie</span>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Aandoeningen: </span>
                    <span className="text-foreground">{intakeData.medischeHistorie.aandoeningen.join(", ") || "Geen"}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Medicatie: </span>
                    <span className="text-foreground">{intakeData.medischeHistorie.medicatie}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Allergieën: </span>
                    {intakeData.medischeHistorie.allergieën.map((a) => (
                      <Badge key={a} variant="destructive" className="text-[9px] h-4">
                        <AlertTriangle className="size-2.5 mr-0.5" />
                        {a}
                      </Badge>
                    ))}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Blessures: </span>
                    <span className="text-foreground">{intakeData.medischeHistorie.blessures.join("; ")}</span>
                  </div>
                </div>
              </div>

              {/* Voedingsvoorkeuren */}
              <div className="rounded-lg bg-secondary/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Apple className="size-3.5 text-chart-2" />
                  <span className="text-xs font-semibold text-foreground">Voedingsvoorkeuren</span>
                </div>
                <div className="flex flex-col gap-1.5 text-xs">
                  <div>
                    <span className="text-muted-foreground">Dieet: </span>
                    <span className="text-foreground">{intakeData.voedingsvoorkeuren.dieet}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Voorkeuren: </span>
                    <span className="text-foreground">{intakeData.voedingsvoorkeuren.voorkeuren.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Afkeren: </span>
                    <span className="text-foreground">{intakeData.voedingsvoorkeuren.afkeren.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Supplementen: </span>
                    <span className="text-foreground">{intakeData.voedingsvoorkeuren.supplementenGebruik.join(", ")}</span>
                  </div>
                </div>
              </div>

              {/* Leefstijl */}
              <div className="rounded-lg bg-secondary/40 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Moon className="size-3.5 text-chart-3" />
                  <span className="text-xs font-semibold text-foreground">Leefstijl</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Slaap</span>
                    <span className="text-foreground">{intakeData.leefstijl.slaap}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Stress</span>
                    <span className="text-foreground">{intakeData.leefstijl.stress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Alcohol</span>
                    <span className="text-foreground">{intakeData.leefstijl.alcohol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Roken</span>
                    <span className="text-foreground">{intakeData.leefstijl.roken}</span>
                  </div>
                </div>
              </div>

              {/* Doelen */}
              <div className="rounded-lg bg-primary/10 border border-primary/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="size-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Intake doelen</span>
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <div>
                    <span className="text-muted-foreground">Primair: </span>
                    <span className="text-foreground font-medium">{intakeData.doelen.primair}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Secundair: </span>
                    <span className="text-foreground">{intakeData.doelen.secundair}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Tijdlijn: </span>
                    <span className="text-foreground">{intakeData.doelen.tijdlijn}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

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
