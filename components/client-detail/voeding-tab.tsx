"use client"

import { useState } from "react"
import { Apple, Droplets, Pill, Clock, Edit3, Sparkles, ChevronLeft, ChevronRight, Check, X, ScanBarcode, Plus, AlertTriangle, ArrowUpDown, Eye, EyeOff, Utensils, ChefHat, Scale, TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts"
import { cn } from "@/lib/utils"

// ============================================================================
// VOEDING TAB - Coach view van client voeding
// 
// Duidelijk onderscheid tussen:
// - VOORGESCHREVEN: Wat de coach/AI heeft klaargezet (het maaltijdplan)
// - GELOGD: Wat de client daadwerkelijk heeft gegeten
// - VERSCHIL: Wat ze hebben overgeslagen, vervangen, of toegevoegd
// ============================================================================

const macroTargets = {
  kcal: { doel: 2200, gelogd: 1920 },
  eiwit: { doel: 160, gelogd: 145 },
  koolhydraten: { doel: 250, gelogd: 210 },
  vetten: { doel: 65, gelogd: 58 },
  vezels: { doel: 30, gelogd: 22 },
  water: { doel: 3.0, gelogd: 2.8 },
}

type ItemStatus = "gegeten" | "overgeslagen" | "vervangen" | "toegevoegd"

interface VoedselItem {
  naam: string
  hoeveelheid: string
  kcal: number
  eiwit: number
  kh: number
  vet: number
  status: ItemStatus
  vervangenDoor?: string
  bron?: "handmatig" | "barcode"
}

const maaltijden: {
  naam: string
  tijd: string
  voorgeschreven: VoedselItem[]
  gelogd: VoedselItem[]
}[] = [
  {
    naam: "Ontbijt",
    tijd: "07:30",
    voorgeschreven: [
      { naam: "Havermout", hoeveelheid: "80g", kcal: 304, eiwit: 10, kh: 52, vet: 6, status: "gegeten" },
      { naam: "Whey proteïne", hoeveelheid: "30g", kcal: 120, eiwit: 24, kh: 3, vet: 1, status: "gegeten" },
      { naam: "Banaan", hoeveelheid: "1 stuk", kcal: 105, eiwit: 1, kh: 27, vet: 0, status: "gegeten" },
      { naam: "Walnoten", hoeveelheid: "15g", kcal: 98, eiwit: 2, kh: 2, vet: 10, status: "overgeslagen" },
    ],
    gelogd: [
      { naam: "Havermout", hoeveelheid: "80g", kcal: 304, eiwit: 10, kh: 52, vet: 6, status: "gegeten", bron: "handmatig" },
      { naam: "Whey proteïne", hoeveelheid: "30g", kcal: 120, eiwit: 24, kh: 3, vet: 1, status: "gegeten", bron: "handmatig" },
      { naam: "Banaan", hoeveelheid: "1 stuk", kcal: 105, eiwit: 1, kh: 27, vet: 0, status: "gegeten", bron: "barcode" },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    voorgeschreven: [
      { naam: "Kipfilet", hoeveelheid: "150g", kcal: 165, eiwit: 31, kh: 0, vet: 4, status: "gegeten" },
      { naam: "Zilvervliesrijst", hoeveelheid: "100g", kcal: 130, eiwit: 3, kh: 28, vet: 1, status: "vervangen", vervangenDoor: "Witte rijst 120g" },
      { naam: "Broccoli", hoeveelheid: "150g", kcal: 51, eiwit: 4, kh: 7, vet: 1, status: "gegeten" },
      { naam: "Olijfolie", hoeveelheid: "10ml", kcal: 88, eiwit: 0, kh: 0, vet: 10, status: "overgeslagen" },
    ],
    gelogd: [
      { naam: "Kipfilet", hoeveelheid: "150g", kcal: 165, eiwit: 31, kh: 0, vet: 4, status: "gegeten", bron: "handmatig" },
      { naam: "Witte rijst", hoeveelheid: "120g", kcal: 156, eiwit: 3, kh: 34, vet: 0, status: "vervangen", bron: "barcode" },
      { naam: "Broccoli", hoeveelheid: "100g", kcal: 34, eiwit: 3, kh: 5, vet: 0, status: "gegeten", bron: "handmatig" },
      { naam: "Cola Zero", hoeveelheid: "330ml", kcal: 1, eiwit: 0, kh: 0, vet: 0, status: "toegevoegd", bron: "barcode" },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "15:30",
    voorgeschreven: [
      { naam: "Griekse yoghurt", hoeveelheid: "200g", kcal: 130, eiwit: 20, kh: 8, vet: 2, status: "gegeten" },
      { naam: "Blauwe bessen", hoeveelheid: "100g", kcal: 57, eiwit: 1, kh: 14, vet: 0, status: "overgeslagen" },
      { naam: "Honing", hoeveelheid: "10g", kcal: 30, eiwit: 0, kh: 8, vet: 0, status: "overgeslagen" },
    ],
    gelogd: [
      { naam: "Griekse yoghurt", hoeveelheid: "200g", kcal: 130, eiwit: 20, kh: 8, vet: 2, status: "gegeten", bron: "barcode" },
      { naam: "Granola bar", hoeveelheid: "1 stuk", kcal: 190, eiwit: 4, kh: 28, vet: 8, status: "toegevoegd", bron: "barcode" },
    ],
  },
  {
    naam: "Diner",
    tijd: "19:00",
    voorgeschreven: [
      { naam: "Zalm", hoeveelheid: "150g", kcal: 280, eiwit: 30, kh: 0, vet: 18, status: "overgeslagen" },
      { naam: "Zoete aardappel", hoeveelheid: "200g", kcal: 172, eiwit: 3, kh: 40, vet: 0, status: "overgeslagen" },
      { naam: "Sperziebonen", hoeveelheid: "150g", kcal: 47, eiwit: 3, kh: 7, vet: 0, status: "overgeslagen" },
    ],
    gelogd: [],
  },
  {
    naam: "Avondsnack",
    tijd: "21:00",
    voorgeschreven: [
      { naam: "Caseine shake", hoeveelheid: "30g", kcal: 115, eiwit: 24, kh: 3, vet: 1, status: "overgeslagen" },
      { naam: "Pindakaas", hoeveelheid: "15g", kcal: 94, eiwit: 4, kh: 3, vet: 8, status: "overgeslagen" },
    ],
    gelogd: [],
  },
]

const supplementen = [
  { naam: "Whey Proteïne", dosering: "30g", timing: "Ochtend + post-workout", ingenomen: true },
  { naam: "Creatine Monohydraat", dosering: "5g", timing: "Dagelijks bij ontbijt", ingenomen: true },
  { naam: "Vitamine D3", dosering: "2000 IU", timing: "Dagelijks bij lunch", ingenomen: false },
  { naam: "Omega-3 Visolie", dosering: "1000mg", timing: "Bij het diner", ingenomen: false },
  { naam: "Magnesium", dosering: "400mg", timing: "Voor het slapen", ingenomen: false },
]

const complianceData = [
  { dag: "Ma", voorgeschreven: 2200, gelogd: 2150, compliance: 98 },
  { dag: "Di", voorgeschreven: 2200, gelogd: 1980, compliance: 90 },
  { dag: "Wo", voorgeschreven: 2200, gelogd: 2300, compliance: 95 },
  { dag: "Do", voorgeschreven: 2200, gelogd: 2050, compliance: 93 },
  { dag: "Vr", voorgeschreven: 2200, gelogd: 1920, compliance: 87 },
  { dag: "Za", voorgeschreven: 2400, gelogd: 2600, compliance: 92 },
  { dag: "Zo", voorgeschreven: 2400, gelogd: 2200, compliance: 92 },
]

function formatDatum(datum: Date): string {
  return datum.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })
}

// Macro ring met duidelijke visuele feedback
function MacroRing({ label, gelogd, doel, eenheid, kleur }: {
  label: string; gelogd: number; doel: number; eenheid: string; kleur: string
}) {
  const percentage = Math.min(Math.round((gelogd / doel) * 100), 100)
  const isOver = gelogd > doel
  const verschil = gelogd - doel
  
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-16">
        <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-secondary"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3"
          />
          <path
            className={isOver ? "text-warning" : kleur}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={`${Math.min(percentage, 100)}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xs font-bold", isOver ? "text-warning" : "text-foreground")}>{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-foreground">{gelogd}{eenheid}</p>
        <p className="text-[10px] text-muted-foreground">/ {doel}{eenheid}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        {verschil !== 0 && (
          <p className={cn("text-[9px] font-medium", verschil > 0 ? "text-warning" : "text-chart-2")}>
            {verschil > 0 ? "+" : ""}{verschil}{eenheid}
          </p>
        )}
      </div>
    </div>
  )
}

// Status indicator met kleur en icoon
function StatusIndicator({ status }: { status: ItemStatus }) {
  const config = {
    gegeten: { icon: Check, color: "text-success bg-success/10", label: "Gegeten" },
    overgeslagen: { icon: X, color: "text-muted-foreground bg-secondary", label: "Overgeslagen" },
    vervangen: { icon: ArrowUpDown, color: "text-warning bg-warning/10", label: "Vervangen" },
    toegevoegd: { icon: Plus, color: "text-chart-2 bg-chart-2/10", label: "Toegevoegd" },
  }
  const { icon: Icon, color } = config[status]
  return (
    <div className={cn("size-5 rounded-full flex items-center justify-center shrink-0", color)}>
      <Icon className="size-3" />
    </div>
  )
}

// Verbeterde maaltijdkaart met side-by-side vergelijking
function MaaltijdKaart({ maaltijd }: { maaltijd: typeof maaltijden[0] }) {
  const [expanded, setExpanded] = useState(true)
  
  const voorgeschrevenTotaal = {
    kcal: maaltijd.voorgeschreven.reduce((s, v) => s + v.kcal, 0),
    eiwit: maaltijd.voorgeschreven.reduce((s, v) => s + v.eiwit, 0),
  }
  const gelogdTotaal = {
    kcal: maaltijd.gelogd.reduce((s, v) => s + v.kcal, 0),
    eiwit: maaltijd.gelogd.reduce((s, v) => s + v.eiwit, 0),
  }
  
  const isGelogd = maaltijd.gelogd.length > 0
  const verschilKcal = gelogdTotaal.kcal - voorgeschrevenTotaal.kcal
  const gegetenItems = maaltijd.voorgeschreven.filter(v => v.status === "gegeten").length
  const totaalItems = maaltijd.voorgeschreven.length
  const compliance = totaalItems > 0 ? Math.round((gegetenItems / totaalItems) * 100) : 0

  // Status samenvatting
  const overgeslagen = maaltijd.voorgeschreven.filter(v => v.status === "overgeslagen")
  const vervangen = maaltijd.voorgeschreven.filter(v => v.status === "vervangen")
  const toegevoegd = maaltijd.gelogd.filter(v => v.status === "toegevoegd")

  return (
    <Card className="border-border overflow-hidden">
      {/* Header met status overzicht */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between bg-secondary/30 px-4 py-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-background border border-border">
            <Utensils className="size-4 text-muted-foreground" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">{maaltijd.naam}</span>
              <span className="text-[11px] text-muted-foreground">{maaltijd.tijd}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {isGelogd ? (
                <>
                  <Badge variant="outline" className={cn(
                    "text-[9px] h-4 px-1.5",
                    compliance >= 80 ? "border-success/30 text-success" : compliance >= 50 ? "border-warning/30 text-warning" : "border-destructive/30 text-destructive"
                  )}>
                    {compliance}% plan
                  </Badge>
                  {overgeslagen.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">{overgeslagen.length} overgeslagen</span>
                  )}
                  {vervangen.length > 0 && (
                    <span className="text-[10px] text-warning">{vervangen.length} vervangen</span>
                  )}
                  {toegevoegd.length > 0 && (
                    <span className="text-[10px] text-chart-2">+{toegevoegd.length} extra</span>
                  )}
                </>
              ) : (
                <Badge variant="outline" className="text-[9px] h-4 px-1.5 text-muted-foreground">
                  Nog niet gelogd
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Kcal vergelijking */}
          {isGelogd && (
            <div className="text-right">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground line-through">{voorgeschrevenTotaal.kcal}</span>
                <span className="text-sm font-semibold text-foreground">{gelogdTotaal.kcal} kcal</span>
              </div>
              <Badge className={cn(
                "text-[9px] h-4",
                Math.abs(verschilKcal) <= 50
                  ? "bg-success/10 text-success border-success/20"
                  : verschilKcal > 0
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-chart-2/10 text-chart-2 border-chart-2/20"
              )}>
                {verschilKcal > 0 ? "+" : ""}{verschilKcal} kcal
              </Badge>
            </div>
          )}
          
          <div className={cn("transition-transform", expanded ? "rotate-180" : "")}>
            <Eye className="size-4 text-muted-foreground" />
          </div>
        </div>
      </button>

      {/* Expanded content met vergelijking */}
      {expanded && (
        <CardContent className="p-0">
          <div className="grid grid-cols-2 divide-x divide-border">
            {/* VOORGESCHREVEN kolom */}
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <ChefHat className="size-4 text-primary" />
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">Voorgeschreven</span>
              </div>
              <div className="flex flex-col gap-2">
                {maaltijd.voorgeschreven.map((item, j) => (
                  <div key={j} className={cn(
                    "flex items-center gap-2 py-1.5 px-2 rounded-md transition-colors",
                    item.status === "overgeslagen" && "bg-secondary/50 opacity-60",
                    item.status === "vervangen" && "bg-warning/5"
                  )}>
                    <StatusIndicator status={item.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={cn(
                          "text-xs truncate",
                          item.status === "overgeslagen" ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {item.naam}
                        </span>
                        <span className="text-[10px] text-muted-foreground shrink-0">({item.hoeveelheid})</span>
                      </div>
                      {item.status === "vervangen" && item.vervangenDoor && (
                        <p className="text-[10px] text-warning mt-0.5">Vervangen door: {item.vervangenDoor}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{item.kcal}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-2 mt-1 flex justify-between items-center">
                  <span className="text-[10px] text-muted-foreground uppercase">Totaal plan</span>
                  <span className="text-xs font-semibold text-foreground">{voorgeschrevenTotaal.kcal} kcal / {voorgeschrevenTotaal.eiwit}g E</span>
                </div>
              </div>
            </div>

            {/* GELOGD kolom */}
            <div className="p-4 bg-secondary/20">
              <div className="flex items-center gap-2 mb-3">
                <Scale className="size-4 text-chart-2" />
                <span className="text-[11px] font-semibold text-chart-2 uppercase tracking-wider">Werkelijk gelogd</span>
              </div>
              {isGelogd ? (
                <div className="flex flex-col gap-2">
                  {maaltijd.gelogd.map((item, j) => (
                    <div key={j} className={cn(
                      "flex items-center gap-2 py-1.5 px-2 rounded-md",
                      item.status === "toegevoegd" && "bg-chart-2/10"
                    )}>
                      <StatusIndicator status={item.status} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-foreground truncate">{item.naam}</span>
                          {item.bron === "barcode" && (
                            <ScanBarcode className="size-3 text-primary shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground">({item.hoeveelheid})</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground shrink-0">{item.kcal}</span>
                    </div>
                  ))}
                  <div className="border-t border-border pt-2 mt-1 flex justify-between items-center">
                    <span className="text-[10px] text-muted-foreground uppercase">Totaal gelogd</span>
                    <span className={cn(
                      "text-xs font-semibold",
                      Math.abs(verschilKcal) <= 50 ? "text-success" : "text-foreground"
                    )}>{gelogdTotaal.kcal} kcal / {gelogdTotaal.eiwit}g E</span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                    <Clock className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">Nog geen voeding gelogd</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Wacht op client input</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ==== HOOFD COMPONENT ====

export function VoedingTab() {
  const [geselecteerdeDatum, setGeselecteerdeDatum] = useState(new Date())
  const [toonAlles, setToonAlles] = useState(true)

  function vorigeDag() {
    setGeselecteerdeDatum(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 1)
      return d
    })
  }

  function volgendeDag() {
    setGeselecteerdeDatum(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 1)
      return d
    })
  }

  const isVandaag = geselecteerdeDatum.toDateString() === new Date().toDateString()

  // Bereken dag samenvatting
  const dagStats = {
    gegetenItems: maaltijden.flatMap(m => m.voorgeschreven).filter(v => v.status === "gegeten").length,
    totaalItems: maaltijden.flatMap(m => m.voorgeschreven).length,
    overgeslagen: maaltijden.flatMap(m => m.voorgeschreven).filter(v => v.status === "overgeslagen").length,
    vervangen: maaltijden.flatMap(m => m.voorgeschreven).filter(v => v.status === "vervangen").length,
    toegevoegd: maaltijden.flatMap(m => m.gelogd).filter(v => v.status === "toegevoegd").length,
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header: Datum + plan info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card">
            <Button variant="ghost" size="icon" className="size-8" onClick={vorigeDag}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 text-sm font-medium text-foreground min-w-[180px] text-center">
              {isVandaag ? "Vandaag" : formatDatum(geselecteerdeDatum)}
            </span>
            <Button variant="ghost" size="icon" className="size-8" onClick={volgendeDag} disabled={isVandaag}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {isVandaag && <Badge variant="outline" className="text-[10px] animate-pulse">Live</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-secondary text-foreground border-border text-[10px] gap-1">
            <Apple className="size-3" />
            Hoog Eiwit Lean
          </Badge>
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-primary/30 text-primary">
            <Sparkles className="size-3" />
            AI optimalisatie
          </Button>
        </div>
      </div>

      {/* Dag samenvatting kaart */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-1">Dag samenvatting</h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <Check className="size-3 text-success" />
                  <span className="text-muted-foreground">{dagStats.gegetenItems}/{dagStats.totaalItems} plan gevolgd</span>
                </span>
                {dagStats.overgeslagen > 0 && (
                  <span className="flex items-center gap-1.5">
                    <X className="size-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{dagStats.overgeslagen} overgeslagen</span>
                  </span>
                )}
                {dagStats.vervangen > 0 && (
                  <span className="flex items-center gap-1.5">
                    <ArrowUpDown className="size-3 text-warning" />
                    <span className="text-warning">{dagStats.vervangen} vervangen</span>
                  </span>
                )}
                {dagStats.toegevoegd > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Plus className="size-3 text-chart-2" />
                    <span className="text-chart-2">{dagStats.toegevoegd} extra items</span>
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground">{Math.round((dagStats.gegetenItems / dagStats.totaalItems) * 100)}%</p>
              <p className="text-[10px] text-muted-foreground">Plan compliance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Macro overzicht */}
      <Card className="border-border">
        <CardContent className="px-5 py-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Apple className="size-4 text-primary" />
              Dagelijkse macro{"'"}s
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px]">
                <div className="size-2 rounded-full bg-primary" />
                <span className="text-muted-foreground">Voorgeschreven</span>
              </div>
              <div className="flex items-center gap-1 text-[10px]">
                <div className="size-2 rounded-full bg-chart-2" />
                <span className="text-muted-foreground">Gelogd</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-around flex-wrap gap-4">
            <MacroRing label="Calorieën" gelogd={macroTargets.kcal.gelogd} doel={macroTargets.kcal.doel} eenheid="" kleur="text-primary" />
            <MacroRing label="Eiwit" gelogd={macroTargets.eiwit.gelogd} doel={macroTargets.eiwit.doel} eenheid="g" kleur="text-chart-1" />
            <MacroRing label="Koolhydraten" gelogd={macroTargets.koolhydraten.gelogd} doel={macroTargets.koolhydraten.doel} eenheid="g" kleur="text-chart-2" />
            <MacroRing label="Vetten" gelogd={macroTargets.vetten.gelogd} doel={macroTargets.vetten.doel} eenheid="g" kleur="text-chart-4" />
            <MacroRing label="Vezels" gelogd={macroTargets.vezels.gelogd} doel={macroTargets.vezels.doel} eenheid="g" kleur="text-chart-3" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex size-16 items-center justify-center rounded-full border-[3px] border-chart-2 bg-chart-2/10">
                <Droplets className="size-5 text-chart-2" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold text-foreground">{macroTargets.water.gelogd}L</p>
                <p className="text-[10px] text-muted-foreground">/ {macroTargets.water.doel}L</p>
                <p className="text-[10px] text-muted-foreground">Water</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maaltijden sectie */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Maaltijden: voorgeschreven vs gelogd</h3>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-[10px] gap-1"
            onClick={() => setToonAlles(!toonAlles)}
          >
            {toonAlles ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
            {toonAlles ? "Inklappen" : "Uitklappen"}
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {maaltijden.map((maaltijd, i) => (
            <MaaltijdKaart key={i} maaltijd={maaltijd} />
          ))}
        </div>
      </div>

      {/* Supplementen */}
      <Card className="border-border">
        <CardHeader className="px-5 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Pill className="size-4 text-chart-3" />
            Supplementenprotocol
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {supplementen.map((sup, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border transition-colors",
                  sup.ingenomen
                    ? "bg-success/5 border-success/20"
                    : "bg-secondary/30 border-border"
                )}
              >
                <div className={cn(
                  "size-6 rounded-full flex items-center justify-center shrink-0",
                  sup.ingenomen ? "bg-success text-white" : "bg-secondary"
                )}>
                  {sup.ingenomen ? <Check className="size-3.5" /> : <Clock className="size-3.5 text-muted-foreground" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{sup.naam}</p>
                  <p className="text-[10px] text-muted-foreground">{sup.dosering} - {sup.timing}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Week compliance chart */}
      <Card className="border-border">
        <CardHeader className="px-5 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="size-4 text-chart-1" />
            Week overzicht: voorgeschreven vs gelogd
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complianceData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="dag" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 3000]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [
                    `${value} kcal`,
                    name === "voorgeschreven" ? "Plan" : "Gelogd"
                  ]}
                />
                <Legend 
                  wrapperStyle={{ fontSize: "11px" }}
                  formatter={(value) => value === "voorgeschreven" ? "Plan" : "Gelogd"}
                />
                <Bar dataKey="voorgeschreven" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} opacity={0.3} />
                <Bar dataKey="gelogd" radius={[4, 4, 0, 0]}>
                  {complianceData.map((entry, index) => (
                    <Cell 
                      key={index}
                      fill={entry.compliance >= 90 ? "hsl(var(--success))" : entry.compliance >= 80 ? "hsl(var(--warning))" : "hsl(var(--destructive))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
