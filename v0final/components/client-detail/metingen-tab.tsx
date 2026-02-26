"use client"

import { TrendingDown, TrendingUp, Minus, ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts"

// ============================================================================
// PLACEHOLDER DATA — Metingen & progressie van de cliënt
//
// COACH-SCOPED: Data van 1 specifieke client.
// RLS: Alle data via JOIN clients WHERE coach_id = auth.uid()
//
// Vervang met echte data uit Supabase tabellen:
//   - client_checkins (gewicht + lichaamsmaten per week)
//   - client_exercise_logs (kracht PR's en trends)
//   - client_photos (progressiefoto's — Supabase Storage bucket "client-photos")
// ============================================================================

/** Samenvatting delta's — Berekend: verschil week 1 vs huidige week */
const samenvattingDeltas = [
  { label: "Gewicht", waarde: "-1.7 kg", trend: "down" as const, startWaarde: "72.8 kg", huidigeWaarde: "71.1 kg" },
  { label: "Taille", waarde: "-2.5 cm", trend: "down" as const, startWaarde: "80.5 cm", huidigeWaarde: "78 cm" },
  { label: "Heupen", waarde: "-2.0 cm", trend: "down" as const, startWaarde: "98 cm", huidigeWaarde: "96 cm" },
  { label: "Borst", waarde: "-1.0 cm", trend: "down" as const, startWaarde: "96 cm", huidigeWaarde: "95 cm" },
  { label: "Armen", waarde: "+1.0 cm", trend: "up" as const, startWaarde: "32 cm", huidigeWaarde: "33 cm" },
]

/** Gewichtsverloop — Supabase: client_checkins.gewicht */
const gewichtsData = [
  { week: "Wk 1", gewicht: 72.8 },
  { week: "Wk 2", gewicht: 72.5 },
  { week: "Wk 3", gewicht: 72.3 },
  { week: "Wk 4", gewicht: 72.0 },
  { week: "Wk 5", gewicht: 71.5 },
  { week: "Wk 6", gewicht: 71.1 },
]

/** Lichaamsmaten per week — Supabase: client_checkins (taille, heupen, borst, armen) */
const metingenData = [
  { week: "Wk 1", taille: 80.5, heupen: 98, borst: 96, armen: 32 },
  { week: "Wk 2", taille: 80, heupen: 97.5, borst: 96, armen: 32 },
  { week: "Wk 3", taille: 79.5, heupen: 97, borst: 96, armen: 32.5 },
  { week: "Wk 4", taille: 79, heupen: 97, borst: 95.5, armen: 32.5 },
  { week: "Wk 5", taille: 78.5, heupen: 96.5, borst: 95, armen: 33 },
  { week: "Wk 6", taille: 78, heupen: 96, borst: 95, armen: 33 },
]

/** Kracht PR's — Supabase: client_exercise_logs (max gewicht per oefening per week) */
const krachtData = [
  { week: "Wk 1", squat: 80, bench: 62.5, deadlift: 90, ohp: 37.5 },
  { week: "Wk 2", squat: 82.5, bench: 65, deadlift: 92.5, ohp: 37.5 },
  { week: "Wk 3", squat: 82.5, bench: 65, deadlift: 95, ohp: 40 },
  { week: "Wk 4", squat: 87.5, bench: 67.5, deadlift: 97.5, ohp: 40 },
  { week: "Wk 5", squat: 87.5, bench: 67.5, deadlift: 100, ohp: 40 },
  { week: "Wk 6", squat: 90, bench: 70, deadlift: 100, ohp: 40 },
]

/** Progressiefoto's — Supabase: client_photos */
const progressieFotos = [
  { label: "Week 1 - Start", datum: "24 jan 2026", fotoUrl: "" },     // <-- URL naar foto
  { label: "Week 3", datum: "7 feb 2026", fotoUrl: "" },
  { label: "Week 6 - Huidig", datum: "28 feb 2026", fotoUrl: "" },
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
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                  <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(1 0 0)", border: "1px solid oklch(0.91 0.005 240)", borderRadius: "8px", fontSize: "12px" }}
                    formatter={(value: number) => [`${value} kg`, "Gewicht"]}
                  />
                  <Line type="monotone" dataKey="gewicht" stroke="oklch(0.55 0.15 160)" strokeWidth={2} dot={{ fill: "oklch(0.55 0.15 160)", r: 4 }} />
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
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "oklch(1 0 0)", border: "1px solid oklch(0.91 0.005 240)", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="taille" name="Taille" stroke="oklch(0.55 0.15 160)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="heupen" name="Heupen" stroke="oklch(0.6 0.12 200)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="borst" name="Borst" stroke="oklch(0.65 0.1 260)" strokeWidth={2} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="armen" name="Armen" stroke="oklch(0.7 0.15 80)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kracht progressie */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Krachtprogressie (werkgewicht in kg)</CardTitle>
            <Badge variant="outline" className="text-[10px]">Compound lifts</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={krachtData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                <YAxis tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                <Tooltip
                  contentStyle={{ backgroundColor: "oklch(1 0 0)", border: "1px solid oklch(0.91 0.005 240)", borderRadius: "8px", fontSize: "12px" }}
                  formatter={(value: number) => [`${value} kg`]}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="squat" name="Squat" fill="oklch(0.55 0.15 160)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="bench" name="Bench Press" fill="oklch(0.6 0.12 200)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="deadlift" name="Deadlift" fill="oklch(0.65 0.1 260)" radius={[2, 2, 0, 0]} />
                <Bar dataKey="ohp" name="OHP" fill="oklch(0.7 0.15 80)" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Progressiefoto vergelijking */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Progressiefoto vergelijking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {progressieFotos.map((foto, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="aspect-[3/4] rounded-lg bg-secondary/60 border border-border flex items-center justify-center">
                  {foto.fotoUrl ? (
                    <img
                      src={foto.fotoUrl}
                      alt={foto.label}
                      className="size-full object-cover rounded-lg"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <ImageIcon className="size-8" />
                      <span className="text-xs">Foto placeholder</span>
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-semibold text-foreground">{foto.label}</p>
                  <p className="text-[10px] text-muted-foreground">{foto.datum}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
