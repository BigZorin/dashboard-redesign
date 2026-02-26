"use client"

import { useState } from "react"
import { Apple, Pill, Clock, ChevronLeft, ChevronRight, Check, X, ScanBarcode, Plus, ArrowUpDown, Eye, TrendingUp, Scale, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { cn } from "@/lib/utils"

// ============================================================================
// VOEDING TAB - Coach view van client voeding
// 
// Clean 2-kolom layout:
// - Links: Macro overzicht + week chart + supplementen
// - Rechts: Maaltijden tijdlijn (voorgeschreven vs gelogd)
// ============================================================================

const macroTargets = {
  kcal: { doel: 2200, gelogd: 1920 },
  eiwit: { doel: 160, gelogd: 145 },
  koolhydraten: { doel: 250, gelogd: 210 },
  vetten: { doel: 65, gelogd: 58 },
}

type ItemStatus = "gegeten" | "overgeslagen" | "vervangen" | "toegevoegd"

interface VoedselItem {
  naam: string
  hoeveelheid: string
  kcal: number
  eiwit: number
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
      { naam: "Havermout", hoeveelheid: "80g", kcal: 304, eiwit: 10, status: "gegeten" },
      { naam: "Whey proteïne", hoeveelheid: "30g", kcal: 120, eiwit: 24, status: "gegeten" },
      { naam: "Banaan", hoeveelheid: "1 stuk", kcal: 105, eiwit: 1, status: "gegeten" },
      { naam: "Walnoten", hoeveelheid: "15g", kcal: 98, eiwit: 2, status: "overgeslagen" },
    ],
    gelogd: [
      { naam: "Havermout", hoeveelheid: "80g", kcal: 304, eiwit: 10, status: "gegeten", bron: "handmatig" },
      { naam: "Whey proteïne", hoeveelheid: "30g", kcal: 120, eiwit: 24, status: "gegeten", bron: "handmatig" },
      { naam: "Banaan", hoeveelheid: "1 stuk", kcal: 105, eiwit: 1, status: "gegeten", bron: "barcode" },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    voorgeschreven: [
      { naam: "Kipfilet", hoeveelheid: "150g", kcal: 165, eiwit: 31, status: "gegeten" },
      { naam: "Zilvervliesrijst", hoeveelheid: "100g", kcal: 130, eiwit: 3, status: "vervangen", vervangenDoor: "Witte rijst 120g" },
      { naam: "Broccoli", hoeveelheid: "150g", kcal: 51, eiwit: 4, status: "gegeten" },
    ],
    gelogd: [
      { naam: "Kipfilet", hoeveelheid: "150g", kcal: 165, eiwit: 31, status: "gegeten", bron: "handmatig" },
      { naam: "Witte rijst", hoeveelheid: "120g", kcal: 156, eiwit: 3, status: "vervangen", bron: "barcode" },
      { naam: "Broccoli", hoeveelheid: "100g", kcal: 34, eiwit: 3, status: "gegeten", bron: "handmatig" },
      { naam: "Cola Zero", hoeveelheid: "330ml", kcal: 1, eiwit: 0, status: "toegevoegd", bron: "barcode" },
    ],
  },
  {
    naam: "Snack",
    tijd: "15:30",
    voorgeschreven: [
      { naam: "Griekse yoghurt", hoeveelheid: "200g", kcal: 130, eiwit: 20, status: "gegeten" },
      { naam: "Blauwe bessen", hoeveelheid: "100g", kcal: 57, eiwit: 1, status: "overgeslagen" },
    ],
    gelogd: [
      { naam: "Griekse yoghurt", hoeveelheid: "200g", kcal: 130, eiwit: 20, status: "gegeten", bron: "barcode" },
      { naam: "Granola bar", hoeveelheid: "1 stuk", kcal: 190, eiwit: 4, status: "toegevoegd", bron: "barcode" },
    ],
  },
  {
    naam: "Diner",
    tijd: "19:00",
    voorgeschreven: [
      { naam: "Zalm", hoeveelheid: "150g", kcal: 280, eiwit: 30, status: "overgeslagen" },
      { naam: "Zoete aardappel", hoeveelheid: "200g", kcal: 172, eiwit: 3, status: "overgeslagen" },
      { naam: "Sperziebonen", hoeveelheid: "150g", kcal: 47, eiwit: 3, status: "overgeslagen" },
    ],
    gelogd: [],
  },
]

const supplementen = [
  { naam: "Whey Proteïne", timing: "Ochtend", dosering: "30g", ingenomen: true, tijdIngenomen: "07:45" },
  { naam: "Creatine", timing: "Ontbijt", dosering: "5g", ingenomen: true, tijdIngenomen: "07:50" },
  { naam: "Vitamine D3", timing: "Lunch", dosering: "2000 IU", ingenomen: false },
  { naam: "Omega-3", timing: "Diner", dosering: "1000mg", ingenomen: false },
  { naam: "Magnesium", timing: "Avond", dosering: "400mg", ingenomen: false },
]

const weekData = [
  { dag: "Ma", plan: 2200, gelogd: 2150 },
  { dag: "Di", plan: 2200, gelogd: 1980 },
  { dag: "Wo", plan: 2200, gelogd: 2100 },
  { dag: "Do", plan: 2200, gelogd: 2050 },
  { dag: "Vr", plan: 2200, gelogd: 1920 },
  { dag: "Za", plan: 2200, gelogd: 1850 },
  { dag: "Zo", plan: 2200, gelogd: 2000 },
]

function formatDatum(datum: Date): string {
  return datum.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })
}

// Compacte macro bar
function MacroBar({ label, gelogd, doel, kleur }: { label: string; gelogd: number; doel: number; kleur: string }) {
  const pct = Math.min(Math.round((gelogd / doel) * 100), 120)
  const isOver = gelogd > doel
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-muted-foreground w-14 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", kleur, isOver && "bg-warning")} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={cn("text-xs font-mono w-20 text-right", isOver ? "text-warning" : "text-foreground")}>
        {gelogd} / {doel}
      </span>
    </div>
  )
}

// Status icon
function StatusIcon({ status }: { status: ItemStatus }) {
  const config = {
    gegeten: { icon: Check, cls: "text-success" },
    overgeslagen: { icon: X, cls: "text-muted-foreground" },
    vervangen: { icon: ArrowUpDown, cls: "text-warning" },
    toegevoegd: { icon: Plus, cls: "text-chart-2" },
  }
  const { icon: Icon, cls } = config[status]
  return <Icon className={cn("size-3.5 shrink-0", cls)} />
}

// Maaltijd row - compact timeline style
function MaaltijdRow({ maaltijd }: { maaltijd: typeof maaltijden[0] }) {
  const [open, setOpen] = useState(false)
  
  const planKcal = maaltijd.voorgeschreven.reduce((s, v) => s + v.kcal, 0)
  const gelogdKcal = maaltijd.gelogd.reduce((s, v) => s + v.kcal, 0)
  const isGelogd = maaltijd.gelogd.length > 0
  const diff = gelogdKcal - planKcal
  
  const gegetenCount = maaltijd.voorgeschreven.filter(v => v.status === "gegeten").length
  const compliance = maaltijd.voorgeschreven.length > 0 ? Math.round((gegetenCount / maaltijd.voorgeschreven.length) * 100) : 0

  return (
    <div className="border-l-2 border-border pl-4 pb-4 last:pb-0 relative">
      {/* Timeline dot */}
      <div className={cn(
        "absolute -left-[5px] top-0 size-2 rounded-full",
        isGelogd ? (compliance >= 80 ? "bg-success" : "bg-warning") : "bg-muted-foreground"
      )} />
      
      {/* Header row */}
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between group">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-mono w-10">{maaltijd.tijd}</span>
          <span className="text-sm font-medium text-foreground">{maaltijd.naam}</span>
          {!isGelogd && (
            <Badge variant="outline" className="text-[9px] h-4 text-muted-foreground">Wacht</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isGelogd && (
            <>
              <span className="text-xs text-muted-foreground line-through">{planKcal}</span>
              <span className="text-sm font-semibold text-foreground">{gelogdKcal}</span>
              <Badge className={cn(
                "text-[9px] h-4 font-mono",
                Math.abs(diff) <= 50 ? "bg-success/10 text-success" : diff > 0 ? "bg-warning/10 text-warning" : "bg-chart-2/10 text-chart-2"
              )}>
                {diff > 0 ? "+" : ""}{diff}
              </Badge>
            </>
          )}
          <Eye className={cn("size-3.5 text-muted-foreground transition-transform", open && "rotate-180")} />
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {/* Plan */}
          <div className="bg-secondary/30 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-primary uppercase tracking-wide mb-2">Plan</p>
            <div className="space-y-1.5">
              {maaltijd.voorgeschreven.map((item, i) => (
                <div key={i} className={cn("flex items-center gap-2 text-xs", item.status === "overgeslagen" && "opacity-50")}>
                  <StatusIcon status={item.status} />
                  <span className={cn("flex-1 truncate", item.status === "overgeslagen" && "line-through")}>{item.naam}</span>
                  <span className="text-muted-foreground font-mono text-[10px]">{item.kcal}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Gelogd */}
          <div className="bg-chart-2/5 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-chart-2 uppercase tracking-wide mb-2">Gelogd</p>
            {isGelogd ? (
              <div className="space-y-1.5">
                {maaltijd.gelogd.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <StatusIcon status={item.status} />
                    <span className="flex-1 truncate">{item.naam}</span>
                    {item.bron === "barcode" && <ScanBarcode className="size-3 text-primary" />}
                    <span className="text-muted-foreground font-mono text-[10px]">{item.kcal}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground italic">Nog niet gelogd</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ==== HOOFD COMPONENT ====

export function VoedingTab() {
  const [datum, setDatum] = useState(new Date())
  const isVandaag = datum.toDateString() === new Date().toDateString()

  const totaalPlan = maaltijden.reduce((s, m) => s + m.voorgeschreven.reduce((ss, v) => ss + v.kcal, 0), 0)
  const totaalGelogd = maaltijden.reduce((s, m) => s + m.gelogd.reduce((ss, v) => ss + v.kcal, 0), 0)
  const suppIngenomen = supplementen.filter(s => s.ingenomen).length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-card border border-border rounded-lg">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setDatum(d => { const n = new Date(d); n.setDate(n.getDate() - 1); return n })}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3 text-sm font-medium min-w-[120px] text-center">
              {isVandaag ? "Vandaag" : formatDatum(datum)}
            </span>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setDatum(d => { const n = new Date(d); n.setDate(n.getDate() + 1); return n })} disabled={isVandaag}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {isVandaag && <div className="size-2 rounded-full bg-success animate-pulse" />}
        </div>
      </div>

      {/* 2-kolom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LINKER KOLOM: Metrics (2/5) */}
        <div className="lg:col-span-2 space-y-5">
          {/* Dag totaal */}
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-2xl font-bold text-foreground">{totaalGelogd}</p>
                  <p className="text-xs text-muted-foreground">van {totaalPlan} kcal plan</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-bold",
                    Math.abs(totaalGelogd - totaalPlan) <= 100 ? "text-success" : "text-warning"
                  )}>
                    {Math.round((totaalGelogd / totaalPlan) * 100)}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">compliance</p>
                </div>
              </div>
              <Progress value={(totaalGelogd / totaalPlan) * 100} className="h-2" />
            </CardContent>
          </Card>

          {/* Macro bars */}
          <Card>
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Apple className="size-4 text-primary" />
                {"Macro's"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <MacroBar label="Eiwit" gelogd={macroTargets.eiwit.gelogd} doel={macroTargets.eiwit.doel} kleur="bg-chart-1" />
              <MacroBar label="Koolh." gelogd={macroTargets.koolhydraten.gelogd} doel={macroTargets.koolhydraten.doel} kleur="bg-chart-2" />
              <MacroBar label="Vetten" gelogd={macroTargets.vetten.gelogd} doel={macroTargets.vetten.doel} kleur="bg-chart-4" />
            </CardContent>
          </Card>

          {/* Supplementen */}
          <Card>
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Pill className="size-4 text-chart-3" />
                  Supplementen
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-1.5 w-12 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-success rounded-full" style={{ width: `${(suppIngenomen / supplementen.length) * 100}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{suppIngenomen}/{supplementen.length}</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {supplementen.map((s, i) => (
                  <div key={i} className={cn(
                    "flex items-center justify-between p-2.5 rounded-lg border transition-colors",
                    s.ingenomen 
                      ? "bg-success/5 border-success/20" 
                      : "bg-secondary/30 border-border hover:border-muted-foreground/30"
                  )}>
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex items-center justify-center size-7 rounded-full",
                        s.ingenomen ? "bg-success/10" : "bg-secondary"
                      )}>
                        {s.ingenomen 
                          ? <Check className="size-3.5 text-success" /> 
                          : <Clock className="size-3.5 text-muted-foreground" />
                        }
                      </div>
                      <div className="flex flex-col">
                        <span className={cn(
                          "text-xs font-medium",
                          s.ingenomen ? "text-foreground" : "text-muted-foreground"
                        )}>{s.naam}</span>
                        <span className="text-[10px] text-muted-foreground">{s.dosering}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] text-muted-foreground">{s.timing}</span>
                      {s.ingenomen && s.tijdIngenomen && (
                        <span className="text-[10px] text-success font-medium">{s.tijdIngenomen}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>


        </div>

        {/* RECHTER KOLOM: Maaltijden (3/5) */}
        <div className="lg:col-span-3 space-y-5">
          <Card>
            <CardHeader className="p-4 pb-3 border-b border-border">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Scale className="size-4 text-chart-2" />
                  Maaltijden: Plan vs Gelogd
                </span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1"><Check className="size-3 text-success" /> Gevolgd</span>
                  <span className="flex items-center gap-1"><ArrowUpDown className="size-3 text-warning" /> Vervangen</span>
                  <span className="flex items-center gap-1"><Plus className="size-3 text-chart-2" /> Extra</span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-0">
                {maaltijden.map((m, i) => (
                  <MaaltijdRow key={i} maaltijd={m} />
                ))}
              </div>
              
              {/* Niet gelogde warning */}
              {maaltijden.some(m => m.gelogd.length === 0) && (
                <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
                  <AlertCircle className="size-4 text-warning shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-warning">Niet volledig gelogd</p>
                    <p className="text-[11px] text-muted-foreground">
                      {maaltijden.filter(m => m.gelogd.length === 0).map(m => m.naam).join(", ")} nog niet ingevuld
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Week trend - onder maaltijden */}
          <Card>
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-primary" />
                  Week trend
                </span>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-[#22c55e]" /> Op target
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="size-2 rounded-full bg-[#f97316]" /> Afwijking
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-32">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekData} barGap={6}>
                    <XAxis dataKey="dag" tick={{ fontSize: 10, fill: "#888" }} tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 3000]} />
                    <Tooltip
                      cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                      position={{ y: -10 }}
                      wrapperStyle={{ zIndex: 100 }}
                      contentStyle={{ 
                        backgroundColor: "#1a1a1a", 
                        border: "1px solid #333", 
                        borderRadius: "8px", 
                        fontSize: "11px",
                        color: "#fff",
                        padding: "8px 12px"
                      }}
                      itemStyle={{ color: "#fff" }}
                      labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: "4px" }}
                      formatter={(v: number, n: string) => [`${v} kcal`, n === "plan" ? "Plan" : "Gelogd"]}
                    />
                    <Bar dataKey="plan" fill="#e5e5e5" opacity={0.4} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="gelogd" radius={[4, 4, 0, 0]}>
                      {weekData.map((e, i) => {
                        const pct = (e.gelogd / e.plan) * 100
                        const isOnTarget = pct >= 90 && pct <= 110
                        return (
                          <Cell 
                            key={i} 
                            fill={isOnTarget ? "#22c55e" : "#f97316"} 
                          />
                        )
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Percentage labels */}
              <div className="flex justify-between mt-1 px-2">
                {weekData.map((e, i) => {
                  const pct = Math.round((e.gelogd / e.plan) * 100)
                  const isOnTarget = pct >= 90 && pct <= 110
                  return (
                    <span key={i} className={cn(
                      "text-[9px] font-medium w-8 text-center",
                      isOnTarget ? "text-[#22c55e]" : "text-[#f97316]"
                    )}>
                      {pct}%
                    </span>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
