"use client"

import { useState } from "react"
import { Calendar, Moon, Zap, Brain, Droplets, Apple, Dumbbell, Heart, TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, MessageSquare, AlertTriangle, Sparkles } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { cn } from "@/lib/utils"

// ============================================================================
// DAILY CHECK-IN TAB - Dagelijkse metrics van de client
// 
// Toont energie, slaap, stress, honger, stemming en andere dagelijkse data
// die de client elke dag invult in de app.
// ============================================================================

interface DailyCheckin {
  datum: string
  dagNaam: string
  energie: number        // 1-10
  slaapUren: number      // in uren
  slaapKwaliteit: number // 1-10
  stress: number         // 1-10
  honger: number         // 1-10
  stemming: number       // 1-10
  motivatie: number      // 1-10
  spierpijn: number      // 1-10
  waterIntake: number    // in liters
  stappen: number        // aantal stappen
  trainingGedaan: boolean
  voedingCompliance: number // percentage
  opmerking?: string
  aiInsight?: string
}

const weekData: DailyCheckin[] = [
  {
    datum: "2026-02-26",
    dagNaam: "Woensdag",
    energie: 7,
    slaapUren: 7.5,
    slaapKwaliteit: 8,
    stress: 4,
    honger: 5,
    stemming: 8,
    motivatie: 8,
    spierpijn: 3,
    waterIntake: 2.8,
    stappen: 8432,
    trainingGedaan: true,
    voedingCompliance: 87,
    opmerking: "Goede dag, training ging lekker. Beetje vermoeid na werk.",
    aiInsight: "Energie en stemming correleren positief met slaapkwaliteit. Overweeg om training naar ochtend te verplaatsen voor betere resultaten.",
  },
  {
    datum: "2026-02-25",
    dagNaam: "Dinsdag",
    energie: 6,
    slaapUren: 6.5,
    slaapKwaliteit: 6,
    stress: 6,
    honger: 7,
    stemming: 6,
    motivatie: 7,
    spierpijn: 5,
    waterIntake: 2.4,
    stappen: 6521,
    trainingGedaan: false,
    voedingCompliance: 78,
    opmerking: "Drukke dag op werk, training overgeslagen. Wel goed gegeten.",
  },
  {
    datum: "2026-02-24",
    dagNaam: "Maandag",
    energie: 8,
    slaapUren: 8,
    slaapKwaliteit: 9,
    stress: 3,
    honger: 4,
    stemming: 9,
    motivatie: 9,
    spierpijn: 2,
    waterIntake: 3.1,
    stappen: 10234,
    trainingGedaan: true,
    voedingCompliance: 95,
    opmerking: "Super gemotiveerd na het weekend. PR op bench press!",
    aiInsight: "Excellente dag! Slaap en motivatie op piek. Dit patroon vasthouden.",
  },
  {
    datum: "2026-02-23",
    dagNaam: "Zondag",
    energie: 7,
    slaapUren: 9,
    slaapKwaliteit: 8,
    stress: 2,
    honger: 6,
    stemming: 8,
    motivatie: 7,
    spierpijn: 4,
    waterIntake: 2.5,
    stappen: 4521,
    trainingGedaan: false,
    voedingCompliance: 72,
    opmerking: "Rustdag. Iets teveel gegeten bij familie lunch.",
  },
  {
    datum: "2026-02-22",
    dagNaam: "Zaterdag",
    energie: 8,
    slaapUren: 8.5,
    slaapKwaliteit: 8,
    stress: 2,
    honger: 5,
    stemming: 9,
    motivatie: 8,
    spierpijn: 6,
    waterIntake: 2.9,
    stappen: 12453,
    trainingGedaan: true,
    voedingCompliance: 88,
    opmerking: "Leg day was zwaar maar voldaan. Wandeling gemaakt na lunch.",
  },
  {
    datum: "2026-02-21",
    dagNaam: "Vrijdag",
    energie: 5,
    slaapUren: 5.5,
    slaapKwaliteit: 5,
    stress: 7,
    honger: 8,
    stemming: 5,
    motivatie: 5,
    spierpijn: 3,
    waterIntake: 2.0,
    stappen: 5432,
    trainingGedaan: false,
    voedingCompliance: 65,
    opmerking: "Slecht geslapen, stress van deadline. Training overgeslagen.",
    aiInsight: "Let op: stress en slaap beinvloeden elkaar negatief. Aanbeveling: ontspanningsoefening voor het slapen.",
  },
  {
    datum: "2026-02-20",
    dagNaam: "Donderdag",
    energie: 7,
    slaapUren: 7,
    slaapKwaliteit: 7,
    stress: 5,
    honger: 5,
    stemming: 7,
    motivatie: 7,
    spierpijn: 4,
    waterIntake: 2.7,
    stappen: 7865,
    trainingGedaan: true,
    voedingCompliance: 82,
  },
]

// Trend data voor grafieken
const trendData = weekData.map(d => ({
  dag: d.dagNaam.substring(0, 2),
  energie: d.energie,
  slaap: d.slaapKwaliteit,
  stress: d.stress,
  stemming: d.stemming,
})).reverse()

function getScoreKleur(score: number, inverse = false): string {
  if (inverse) {
    if (score <= 3) return "text-success"
    if (score <= 6) return "text-warning"
    return "text-destructive"
  }
  if (score >= 7) return "text-success"
  if (score >= 5) return "text-warning"
  return "text-destructive"
}

function getScoreBg(score: number, inverse = false): string {
  if (inverse) {
    if (score <= 3) return "bg-success/10"
    if (score <= 6) return "bg-warning/10"
    return "bg-destructive/10"
  }
  if (score >= 7) return "bg-success/10"
  if (score >= 5) return "bg-warning/10"
  return "bg-destructive/10"
}

function getTrendIcon(current: number, previous: number) {
  if (current > previous) return <TrendingUp className="size-3 text-success" />
  if (current < previous) return <TrendingDown className="size-3 text-destructive" />
  return <Minus className="size-3 text-muted-foreground" />
}

function ScoreRing({ value, max = 10, size = 48, label, kleur }: { value: number; max?: number; size?: number; label: string; kleur: string }) {
  const percentage = (value / max) * 100
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="-rotate-90" style={{ width: size, height: size }} viewBox="0 0 36 36">
          <path
            className="text-secondary"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3.5"
          />
          <path
            className={kleur}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3.5"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-foreground">{value}</span>
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  )
}

function MetricCard({ icon: Icon, label, value, unit, trend, trendValue, kleur, inverse = false }: {
  icon: React.ElementType
  label: string
  value: number | string
  unit?: string
  trend?: number
  trendValue?: number
  kleur: string
  inverse?: boolean
}) {
  const numValue = typeof value === "number" ? value : parseFloat(value)
  const scoreKleur = !isNaN(numValue) && numValue <= 10 ? getScoreKleur(numValue, inverse) : ""
  const scoreBg = !isNaN(numValue) && numValue <= 10 ? getScoreBg(numValue, inverse) : "bg-secondary/50"
  
  return (
    <div className={cn("flex items-center gap-3 p-3 rounded-lg border border-border", scoreBg)}>
      <div className={cn("size-9 rounded-lg flex items-center justify-center shrink-0", kleur)}>
        <Icon className="size-4 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
        <div className="flex items-center gap-1.5">
          <span className={cn("text-lg font-bold", scoreKleur || "text-foreground")}>{value}</span>
          {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
          {trend !== undefined && trendValue !== undefined && (
            <span className="flex items-center gap-0.5 ml-1">
              {getTrendIcon(trend, trendValue)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function DailyCheckinTab() {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0)
  const selectedDay = weekData[selectedDayIndex]
  const previousDay = weekData[selectedDayIndex + 1]

  function formatDatum(datumStr: string): string {
    const d = new Date(datumStr)
    return d.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" })
  }

  // Week gemiddelden
  const weekGemiddelden = {
    energie: Math.round(weekData.reduce((s, d) => s + d.energie, 0) / weekData.length * 10) / 10,
    slaap: Math.round(weekData.reduce((s, d) => s + d.slaapKwaliteit, 0) / weekData.length * 10) / 10,
    stress: Math.round(weekData.reduce((s, d) => s + d.stress, 0) / weekData.length * 10) / 10,
    stemming: Math.round(weekData.reduce((s, d) => s + d.stemming, 0) / weekData.length * 10) / 10,
    slaapUren: Math.round(weekData.reduce((s, d) => s + d.slaapUren, 0) / weekData.length * 10) / 10,
    compliance: Math.round(weekData.reduce((s, d) => s + d.voedingCompliance, 0) / weekData.length),
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header met dag selector */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card">
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setSelectedDayIndex(Math.min(selectedDayIndex + 1, weekData.length - 1))}
              disabled={selectedDayIndex >= weekData.length - 1}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 text-sm font-medium text-foreground min-w-[180px] text-center">
              {selectedDayIndex === 0 ? "Vandaag" : formatDatum(selectedDay.datum)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setSelectedDayIndex(Math.max(selectedDayIndex - 1, 0))}
              disabled={selectedDayIndex <= 0}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {selectedDayIndex === 0 && (
            <Badge variant="outline" className="text-[10px] animate-pulse">Live</Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="size-3.5" />
          <span>7 dagen overzicht</span>
        </div>
      </div>

      {/* Week gemiddelden overzicht */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">Week gemiddelden</h3>
            <Badge variant="outline" className="text-[10px]">Laatste 7 dagen</Badge>
          </div>
          <div className="flex items-center justify-around flex-wrap gap-4">
            <ScoreRing value={weekGemiddelden.energie} label="Energie" kleur={getScoreKleur(weekGemiddelden.energie).replace("text-", "text-")} />
            <ScoreRing value={weekGemiddelden.slaap} label="Slaap" kleur={getScoreKleur(weekGemiddelden.slaap).replace("text-", "text-")} />
            <ScoreRing value={weekGemiddelden.stress} label="Stress" kleur={getScoreKleur(weekGemiddelden.stress, true).replace("text-", "text-")} />
            <ScoreRing value={weekGemiddelden.stemming} label="Stemming" kleur={getScoreKleur(weekGemiddelden.stemming).replace("text-", "text-")} />
            <div className="flex flex-col items-center gap-1">
              <div className="size-12 rounded-full bg-chart-2/10 flex items-center justify-center">
                <Moon className="size-5 text-chart-2" />
              </div>
              <span className="text-sm font-bold text-foreground">{weekGemiddelden.slaapUren}u</span>
              <span className="text-[10px] text-muted-foreground">Gem. slaap</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="size-12 rounded-full bg-success/10 flex items-center justify-center">
                <Apple className="size-5 text-success" />
              </div>
              <span className="text-sm font-bold text-foreground">{weekGemiddelden.compliance}%</span>
              <span className="text-[10px] text-muted-foreground">Voeding</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Geselecteerde dag detail */}
      <Card className="border-border">
        <CardHeader className="px-5 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">{selectedDay.dagNaam} - Detail</CardTitle>
            <div className="flex items-center gap-2">
              {selectedDay.trainingGedaan ? (
                <Badge className="bg-success/10 text-success border-success/20 text-[10px]">
                  <Dumbbell className="size-3 mr-1" />
                  Getraind
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] text-muted-foreground">
                  Rustdag
                </Badge>
              )}
              <Badge variant="outline" className={cn(
                "text-[10px]",
                selectedDay.voedingCompliance >= 80 ? "border-success/30 text-success" : "border-warning/30 text-warning"
              )}>
                {selectedDay.voedingCompliance}% voeding
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            <MetricCard
              icon={Zap}
              label="Energie"
              value={selectedDay.energie}
              unit="/10"
              trend={selectedDay.energie}
              trendValue={previousDay?.energie}
              kleur="bg-chart-1"
            />
            <MetricCard
              icon={Moon}
              label="Slaap"
              value={selectedDay.slaapUren}
              unit="uur"
              kleur="bg-chart-2"
            />
            <MetricCard
              icon={Moon}
              label="Slaapkwaliteit"
              value={selectedDay.slaapKwaliteit}
              unit="/10"
              trend={selectedDay.slaapKwaliteit}
              trendValue={previousDay?.slaapKwaliteit}
              kleur="bg-chart-2"
            />
            <MetricCard
              icon={Brain}
              label="Stress"
              value={selectedDay.stress}
              unit="/10"
              trend={selectedDay.stress}
              trendValue={previousDay?.stress}
              kleur="bg-destructive"
              inverse
            />
            <MetricCard
              icon={Apple}
              label="Honger"
              value={selectedDay.honger}
              unit="/10"
              kleur="bg-chart-4"
            />
            <MetricCard
              icon={Heart}
              label="Stemming"
              value={selectedDay.stemming}
              unit="/10"
              trend={selectedDay.stemming}
              trendValue={previousDay?.stemming}
              kleur="bg-pink-500"
            />
            <MetricCard
              icon={Dumbbell}
              label="Motivatie"
              value={selectedDay.motivatie}
              unit="/10"
              kleur="bg-primary"
            />
            <MetricCard
              icon={AlertTriangle}
              label="Spierpijn"
              value={selectedDay.spierpijn}
              unit="/10"
              kleur="bg-warning"
              inverse
            />
            <MetricCard
              icon={Droplets}
              label="Water"
              value={selectedDay.waterIntake}
              unit="L"
              kleur="bg-chart-2"
            />
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-secondary/30">
              <div className="size-9 rounded-lg flex items-center justify-center shrink-0 bg-chart-3">
                <TrendingUp className="size-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Stappen</p>
                <span className="text-lg font-bold text-foreground">{selectedDay.stappen.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Client opmerking */}
          {selectedDay.opmerking && (
            <div className="flex gap-3 rounded-lg bg-secondary/40 p-4 mb-3">
              <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Client opmerking</p>
                <p className="text-sm text-foreground leading-relaxed italic">{`"${selectedDay.opmerking}"`}</p>
              </div>
            </div>
          )}

          {/* AI Insight */}
          {selectedDay.aiInsight && (
            <div className="flex gap-3 rounded-lg bg-primary/5 border border-primary/20 p-4">
              <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">AI Inzicht</p>
                <p className="text-sm text-foreground leading-relaxed">{selectedDay.aiInsight}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trends grafiek */}
      <Card className="border-border">
        <CardHeader className="px-5 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="size-4 text-chart-1" />
            Week trends
          </CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="energieGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="slaapGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="dag" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="energie" stroke="hsl(var(--chart-1))" fill="url(#energieGradient)" strokeWidth={2} name="Energie" />
                <Area type="monotone" dataKey="slaap" stroke="hsl(var(--chart-2))" fill="url(#slaapGradient)" strokeWidth={2} name="Slaap" />
                <Line type="monotone" dataKey="stress" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} name="Stress" />
                <Line type="monotone" dataKey="stemming" stroke="hsl(var(--pink-500))" strokeWidth={2} dot={{ r: 3 }} name="Stemming" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 mt-3 text-[11px]">
            <span className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-chart-1" />
              Energie
            </span>
            <span className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-chart-2" />
              Slaap
            </span>
            <span className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-destructive" />
              Stress
            </span>
            <span className="flex items-center gap-1.5">
              <div className="size-2 rounded-full bg-pink-500" />
              Stemming
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Week kalender overzicht */}
      <Card className="border-border">
        <CardHeader className="px-5 pt-4 pb-3">
          <CardTitle className="text-sm font-semibold">Week overzicht</CardTitle>
        </CardHeader>
        <CardContent className="px-5 pb-4">
          <div className="grid grid-cols-7 gap-2">
            {weekData.slice().reverse().map((dag, i) => {
              const isSelected = weekData.length - 1 - i === selectedDayIndex
              return (
                <button
                  key={dag.datum}
                  onClick={() => setSelectedDayIndex(weekData.length - 1 - i)}
                  className={cn(
                    "flex flex-col items-center gap-1 p-2 rounded-lg border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-border hover:border-primary/30 hover:bg-secondary/50"
                  )}
                >
                  <span className="text-[10px] text-muted-foreground">{dag.dagNaam.substring(0, 2)}</span>
                  <div className={cn(
                    "size-8 rounded-full flex items-center justify-center text-xs font-bold",
                    dag.energie >= 7 ? "bg-success/20 text-success" : dag.energie >= 5 ? "bg-warning/20 text-warning" : "bg-destructive/20 text-destructive"
                  )}>
                    {dag.energie}
                  </div>
                  <div className="flex items-center gap-0.5">
                    {dag.trainingGedaan && <Dumbbell className="size-2.5 text-primary" />}
                    {dag.voedingCompliance >= 80 && <Apple className="size-2.5 text-success" />}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
