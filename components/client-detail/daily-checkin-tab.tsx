"use client"

import { useState } from "react"
import { Calendar, Moon, Zap, Brain, Droplets, Dumbbell, Heart, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, MessageSquare, Sparkles, Activity, Footprints } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import { cn } from "@/lib/utils"

// ============================================================================
// DAILY CHECK-IN TAB - Dagelijkse metrics
// Clean grid layout met trend lines
// ============================================================================

interface DayData {
  dag: string
  datum: string
  energie: number
  slaapUren: number
  slaapKwaliteit: number
  stress: number
  stemming: number
  motivatie: number
  spierpijn: number
  water: number
  stappen: number
  training: boolean
  voeding: number
  opmerking?: string
  aiTip?: string
}

const weekData: DayData[] = [
  { dag: "Wo", datum: "26 feb", energie: 7, slaapUren: 7.5, slaapKwaliteit: 8, stress: 4, stemming: 8, motivatie: 8, spierpijn: 3, water: 2.8, stappen: 8432, training: true, voeding: 87, opmerking: "Goede dag, training ging lekker", aiTip: "Energie correleert positief met slaapkwaliteit - blijf dit vasthouden" },
  { dag: "Di", datum: "25 feb", energie: 6, slaapUren: 6.5, slaapKwaliteit: 6, stress: 6, stemming: 6, motivatie: 7, spierpijn: 5, water: 2.4, stappen: 6521, training: false, voeding: 78 },
  { dag: "Ma", datum: "24 feb", energie: 8, slaapUren: 8, slaapKwaliteit: 9, stress: 3, stemming: 9, motivatie: 9, spierpijn: 2, water: 3.1, stappen: 10234, training: true, voeding: 95, opmerking: "PR op bench press!", aiTip: "Excellente dag - dit patroon vasthouden" },
  { dag: "Zo", datum: "23 feb", energie: 7, slaapUren: 9, slaapKwaliteit: 8, stress: 2, stemming: 8, motivatie: 7, spierpijn: 4, water: 2.5, stappen: 4521, training: false, voeding: 72 },
  { dag: "Za", datum: "22 feb", energie: 8, slaapUren: 8.5, slaapKwaliteit: 8, stress: 2, stemming: 9, motivatie: 8, spierpijn: 6, water: 2.9, stappen: 12453, training: true, voeding: 88 },
  { dag: "Vr", datum: "21 feb", energie: 5, slaapUren: 5.5, slaapKwaliteit: 5, stress: 7, stemming: 5, motivatie: 5, spierpijn: 3, water: 2.0, stappen: 5432, training: false, voeding: 65, opmerking: "Stress van deadline", aiTip: "Let op: stress beïnvloedt slaap negatief" },
  { dag: "Do", datum: "20 feb", energie: 7, slaapUren: 7, slaapKwaliteit: 7, stress: 5, stemming: 7, motivatie: 7, spierpijn: 4, water: 2.6, stappen: 7845, training: true, voeding: 82 },
]

// Week gemiddelden berekenen
const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length * 10) / 10
const weekGem = {
  energie: avg(weekData.map(d => d.energie)),
  slaap: avg(weekData.map(d => d.slaapUren)),
  stress: avg(weekData.map(d => d.stress)),
  stemming: avg(weekData.map(d => d.stemming)),
  water: avg(weekData.map(d => d.water)),
  stappen: Math.round(avg(weekData.map(d => d.stappen))),
}

// Metric tile component
function MetricTile({ label, value, max, icon: Icon, trend, unit, color }: {
  label: string
  value: number
  max?: number
  icon: any
  trend?: "up" | "down" | "stable"
  unit?: string
  color: string
}) {
  const pct = max ? (value / max) * 100 : null
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</span>
        <Icon className={cn("size-3.5", color)} />
      </div>
      <div className="flex items-end justify-between">
        <span className="text-xl font-bold text-foreground">
          {value}{unit}
        </span>
        {trend && (
          <div className={cn("flex items-center gap-0.5 text-[10px]", trend === "up" ? "text-success" : trend === "down" ? "text-destructive" : "text-muted-foreground")}>
            {trend === "up" ? <TrendingUp className="size-3" /> : trend === "down" ? <TrendingDown className="size-3" /> : null}
          </div>
        )}
      </div>
      {pct !== null && (
        <Progress value={pct} className="h-1 mt-2" />
      )}
    </div>
  )
}

// Score bar (1-10)
function ScoreBar({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-muted-foreground w-16 shrink-0">{label}</span>
      <div className="flex-1 flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className={cn("h-2 flex-1 rounded-sm transition-colors", i < value ? color : "bg-secondary")} />
        ))}
      </div>
      <span className="text-xs font-mono w-6 text-right text-foreground">{value}</span>
    </div>
  )
}

export function DailyCheckinTab() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [aiMode, setAiMode] = useState<"voorstellen" | "handmatig">("voorstellen")
  const selected = weekData[selectedIdx]

  const chartData = [...weekData].reverse().map(d => ({
    dag: d.dag,
    energie: d.energie,
    slaap: d.slaapKwaliteit,
    stress: d.stress,
    stemming: d.stemming,
  }))

  return (
    <div className="p-6">
      {/* Header: dag selector */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {weekData.map((d, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={cn(
                "flex flex-col items-center px-3 py-2 rounded-lg transition-colors",
                i === selectedIdx ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-secondary/50"
              )}
            >
              <span className="text-[10px] uppercase">{d.dag}</span>
              <span className="text-sm font-semibold">{d.datum.split(" ")[0]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          {/* AI Mode Toggle */}
          <div className="flex items-center bg-secondary rounded-lg p-0.5">
            <button
              onClick={() => setAiMode("voorstellen")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                aiMode === "voorstellen" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="size-3 inline mr-1" />
              AI
            </button>
            <button
              onClick={() => setAiMode("handmatig")}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded-md transition-all",
                aiMode === "handmatig" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Handmatig
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="size-3.5" />
            Week 9, 2026
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KOLOM 1: Dag detail */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm flex items-center justify-between">
                <span>{selected.dag} {selected.datum}</span>
                <div className="flex items-center gap-2">
                  {selected.training && <Badge className="bg-success/10 text-success text-[9px]">Training</Badge>}
                  <Badge variant="outline" className="text-[9px]">{selected.voeding}% voeding</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <ScoreBar value={selected.energie} label="Energie" color="bg-chart-1" />
              <ScoreBar value={selected.slaapKwaliteit} label="Slaap" color="bg-chart-2" />
              <ScoreBar value={10 - selected.stress} label="Ontspanning" color="bg-chart-3" />
              <ScoreBar value={selected.stemming} label="Stemming" color="bg-chart-4" />
              <ScoreBar value={selected.motivatie} label="Motivatie" color="bg-primary" />
              <ScoreBar value={10 - selected.spierpijn} label="Herstel" color="bg-success" />
            </CardContent>
          </Card>

          {/* Opmerking */}
          {selected.opmerking && (
            <Card className="bg-secondary/30">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground">{selected.opmerking}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI tip */}
          {selected.aiTip && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="size-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[10px] font-semibold text-primary uppercase mb-1">AI Insight</p>
                    <p className="text-xs text-foreground">{selected.aiTip}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* KOLOM 2: Quick stats + trends */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <MetricTile label="Slaap" value={selected.slaapUren} icon={Moon} unit="u" color="text-chart-2" trend={selected.slaapUren >= 7 ? "up" : "down"} />
            <MetricTile label="Water" value={selected.water} max={3} icon={Droplets} unit="L" color="text-chart-3" />
            <MetricTile label="Stappen" value={Math.round(selected.stappen / 1000)} icon={Footprints} unit="k" color="text-chart-4" trend={selected.stappen >= 8000 ? "up" : "down"} />
            <MetricTile label="Stress" value={selected.stress} max={10} icon={Brain} color="text-destructive" />
          </div>

          {/* Week trend chart */}
          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="size-4 text-chart-1" />
                Week trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <XAxis dataKey="dag" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} />
                    <YAxis hide domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "6px", fontSize: "11px" }}
                    />
                    <Area type="monotone" dataKey="energie" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} strokeWidth={2} />
                    <Area type="monotone" dataKey="stemming" stroke="hsl(var(--chart-4))" fill="hsl(var(--chart-4))" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
                <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-chart-1" /> Energie</span>
                <span className="flex items-center gap-1"><div className="size-2 rounded-full bg-chart-4" /> Stemming</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* KOLOM 3: Week gemiddelden */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="p-4 pb-3">
              <CardTitle className="text-sm">Week gemiddelden</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Zap className="size-3.5 text-chart-1" /> Energie</span>
                <span className="text-sm font-semibold">{weekGem.energie}/10</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Moon className="size-3.5 text-chart-2" /> Slaap</span>
                <span className="text-sm font-semibold">{weekGem.slaap}u</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Brain className="size-3.5 text-destructive" /> Stress</span>
                <span className="text-sm font-semibold">{weekGem.stress}/10</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Heart className="size-3.5 text-chart-4" /> Stemming</span>
                <span className="text-sm font-semibold">{weekGem.stemming}/10</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Droplets className="size-3.5 text-chart-3" /> Water</span>
                <span className="text-sm font-semibold">{weekGem.water}L</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground flex items-center gap-2"><Footprints className="size-3.5 text-chart-4" /> Stappen</span>
                <span className="text-sm font-semibold">{weekGem.stappen.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Training compliance */}
          <Card className="bg-success/5 border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="size-4 text-success" />
                  <span className="text-sm text-foreground">Training compliance</span>
                </div>
                <span className="text-lg font-bold text-success">
                  {weekData.filter(d => d.training).length}/{weekData.length}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">
                {Math.round((weekData.filter(d => d.training).length / weekData.length) * 100)}% van geplande sessies voltooid
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
