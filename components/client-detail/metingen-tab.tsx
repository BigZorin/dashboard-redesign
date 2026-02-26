"use client"

import { useState } from "react"
import { TrendingDown, TrendingUp, Minus, ImageIcon, Trophy, Sparkles, ChevronLeft, ChevronRight, Camera, ZoomIn, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

// ============================================================================
// METINGEN & VOORTGANG TAB
// - Delta samenvatting kaarten
// - Gewichtsgrafiek
// - Lichaamsmaten grafiek
// - PERSONAL RECORDS lijst (NIEUW)
// - Voortgangsfoto's galerij met vergelijk functie (NIEUW)
// ============================================================================

/** Samenvatting delta's */
const samenvattingDeltas = [
  { label: "Gewicht", waarde: "-1.7 kg", trend: "down" as const, startWaarde: "72.8 kg", huidigeWaarde: "71.1 kg" },
  { label: "Taille", waarde: "-2.5 cm", trend: "down" as const, startWaarde: "80.5 cm", huidigeWaarde: "78 cm" },
  { label: "Heupen", waarde: "-2.0 cm", trend: "down" as const, startWaarde: "98 cm", huidigeWaarde: "96 cm" },
  { label: "Borst", waarde: "-1.0 cm", trend: "down" as const, startWaarde: "96 cm", huidigeWaarde: "95 cm" },
  { label: "Armen", waarde: "+1.0 cm", trend: "up" as const, startWaarde: "32 cm", huidigeWaarde: "33 cm" },
]

/** Gewichtsverloop */
const gewichtsData = [
  { week: "Wk 1", gewicht: 72.8 },
  { week: "Wk 2", gewicht: 72.5 },
  { week: "Wk 3", gewicht: 72.3 },
  { week: "Wk 4", gewicht: 72.0 },
  { week: "Wk 5", gewicht: 71.5 },
  { week: "Wk 6", gewicht: 71.1 },
]

/** Lichaamsmaten per week */
const metingenData = [
  { week: "Wk 1", taille: 80.5, heupen: 98, borst: 96, armen: 32 },
  { week: "Wk 2", taille: 80, heupen: 97.5, borst: 96, armen: 32 },
  { week: "Wk 3", taille: 79.5, heupen: 97, borst: 96, armen: 32.5 },
  { week: "Wk 4", taille: 79, heupen: 97, borst: 95.5, armen: 32.5 },
  { week: "Wk 5", taille: 78.5, heupen: 96.5, borst: 95, armen: 33 },
  { week: "Wk 6", taille: 78, heupen: 96, borst: 95, armen: 33 },
]

/** PERSONAL RECORDS */
const personalRecords = [
  { oefening: "Squat", gewicht: "90 kg", est1RM: "105 kg", datum: "24 feb 2026", isNieuw: true },
  { oefening: "Bench Press", gewicht: "70 kg", est1RM: "82.5 kg", datum: "22 feb 2026", isNieuw: true },
  { oefening: "Deadlift", gewicht: "100 kg", est1RM: "115 kg", datum: "20 feb 2026", isNieuw: false },
  { oefening: "Overhead Press", gewicht: "40 kg", est1RM: "47.5 kg", datum: "18 feb 2026", isNieuw: false },
  { oefening: "Barbell Row", gewicht: "65 kg", est1RM: "75 kg", datum: "15 feb 2026", isNieuw: false },
  { oefening: "Romanian Deadlift", gewicht: "80 kg", est1RM: "92.5 kg", datum: "13 feb 2026", isNieuw: false },
]

/** Progressiefoto's */
const progressieFotos = [
  { id: "foto1", label: "Week 1 - Start", datum: "24 jan 2026", fotoUrl: "", poses: ["Front", "Zij", "Rug"] },
  { id: "foto2", label: "Week 3", datum: "7 feb 2026", fotoUrl: "", poses: ["Front", "Zij", "Rug"] },
  { id: "foto3", label: "Week 6 - Huidig", datum: "28 feb 2026", fotoUrl: "", poses: ["Front", "Zij", "Rug"] },
]

function DeltaKaart({ label, waarde, trend, startWaarde, huidigeWaarde }: {
  label: string; waarde: string; trend: "up" | "down" | "neutral"
  startWaarde: string; huidigeWaarde: string
}) {
  const isPositief = label === "Armen" ? trend === "up" : trend === "down"
  return (
    <Card className="border-border">
      <CardContent className="p-3 flex flex-col gap-1">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
        <div className="flex items-center gap-1.5">
          {trend === "down" ? (
            <TrendingDown className={`size-4 ${isPositief ? "text-success" : "text-destructive"}`} />
          ) : trend === "up" ? (
            <TrendingUp className={`size-4 ${isPositief ? "text-success" : "text-destructive"}`} />
          ) : (
            <Minus className="size-4 text-muted-foreground" />
          )}
          <span className={`text-lg font-bold ${isPositief ? "text-success" : "text-destructive"}`}>
            {waarde}
          </span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>{startWaarde}</span>
          <span className="font-medium text-foreground">{huidigeWaarde}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function MetingenTab() {
  const [vergelijkModus, setVergelijkModus] = useState(false)
  const [vergelijkFotos, setVergelijkFotos] = useState<[string, string]>(["foto1", "foto3"])

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Delta samenvatting kaarten */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {samenvattingDeltas.map((delta) => (
          <DeltaKaart key={delta.label} {...delta} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gewichtsgrafiek */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Gewichtsverloop</CardTitle>
              <Badge variant="outline" className="text-[10px]">6 weken</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={gewichtsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [`${value} kg`, "Gewicht"]}
                  />
                  <Line type="monotone" dataKey="gewicht" stroke="hsl(var(--success))" strokeWidth={2} dot={{ fill: "hsl(var(--success))", r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lichaamsmaten grafiek */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Lichaamsmaten</CardTitle>
              <Badge variant="outline" className="text-[10px]">in cm</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metingenData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="taille" name="Taille" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="heupen" name="Heupen" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="borst" name="Borst" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="armen" name="Armen" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PERSONAL RECORDS */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Trophy className="size-4 text-warning" />
              Personal Records
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">Est. 1RM</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {personalRecords.map((pr, i) => (
              <div
                key={i}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  pr.isNieuw ? "bg-warning/5 border-warning/30" : "bg-secondary/30 border-border"
                }`}
              >
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{pr.oefening}</span>
                    {pr.isNieuw && (
                      <Badge className="text-[8px] h-4 bg-warning/10 text-warning border-warning/20">Nieuw!</Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-muted-foreground">{pr.datum}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{pr.gewicht}</p>
                  <p className="text-[10px] text-muted-foreground">Est. 1RM: {pr.est1RM}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* VOORTGANGSFOTO'S GALERIJ */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Camera className="size-4 text-primary" />
              Voortgangsfoto's
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={vergelijkModus ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs gap-1.5"
                onClick={() => setVergelijkModus(!vergelijkModus)}
              >
                <ZoomIn className="size-3" />
                {vergelijkModus ? "Sluiten" : "Vergelijk"}
              </Button>
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
                <Camera className="size-3" />
                Upload
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {vergelijkModus ? (
            /* Vergelijk modus - side by side */
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <select
                  className="bg-secondary rounded px-2 py-1 text-foreground"
                  value={vergelijkFotos[0]}
                  onChange={(e) => setVergelijkFotos([e.target.value, vergelijkFotos[1]])}
                >
                  {progressieFotos.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
                <span>vs</span>
                <select
                  className="bg-secondary rounded px-2 py-1 text-foreground"
                  value={vergelijkFotos[1]}
                  onChange={(e) => setVergelijkFotos([vergelijkFotos[0], e.target.value])}
                >
                  {progressieFotos.map((f) => (
                    <option key={f.id} value={f.id}>{f.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {vergelijkFotos.map((fotoId, idx) => {
                  const foto = progressieFotos.find((f) => f.id === fotoId)!
                  return (
                    <div key={idx} className="flex flex-col gap-2">
                      <div className="aspect-[3/4] rounded-lg bg-secondary/60 border-2 border-primary/20 flex items-center justify-center">
                        {foto.fotoUrl ? (
                          <img
                            src={foto.fotoUrl}
                            alt={foto.label}
                            className="size-full object-cover rounded-lg"
                            crossOrigin="anonymous"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageIcon className="size-12" />
                            <span className="text-sm">{foto.label}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-center text-xs text-muted-foreground">{foto.datum}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            /* Normale galerij weergave */
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {progressieFotos.map((foto, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="aspect-[3/4] rounded-lg bg-secondary/60 border border-border flex items-center justify-center hover:border-primary/50 transition-colors cursor-pointer group">
                    {foto.fotoUrl ? (
                      <img
                        src={foto.fotoUrl}
                        alt={foto.label}
                        className="size-full object-cover rounded-lg"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                        <ImageIcon className="size-8" />
                        <span className="text-xs">Foto placeholder</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-semibold text-foreground">{foto.label}</p>
                    <p className="text-[10px] text-muted-foreground">{foto.datum}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      {foto.poses.map((pose) => (
                        <Badge key={pose} variant="outline" className="text-[8px] h-4">{pose}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
