"use client"

import { TrendingUp, TrendingDown, CalendarDays, Dumbbell, Apple, Minus, Activity, Moon, Droplets, StickyNote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

// ============================================================================
// PLACEHOLDER DATA — Overzicht van de individuele cliënt
// Vervang met echte data uit Supabase tabellen:
//   - client_programs (huidig programma + voortgang)
//   - client_nutrition (macro targets)
//   - client_checkins (laatste check-in + gewichtstrend)
//   - client_sessions (komende sessies)
//   - coach_notes (recente notities)
// ============================================================================

/** Snelle statistieken — Berekend uit meerdere tabellen */
const snelleStats = {
  huidigeWeek: 6,                         // <-- Week in programma
  complianceTraining: 92,                 // <-- % trainingen voltooid deze week
  complianceVoeding: 78,                  // <-- % dagen macro's gehaald
  gewichtsTrend: -0.4,                    // <-- kg verschil t.o.v. vorige week (negatief = afvallen)
  energieNiveau: 7,                       // <-- Uit laatste check-in (1-10)
  slaapKwaliteit: 8,                      // <-- Uit laatste check-in (1-10)
  waterInname: 2.8,                       // <-- Liter per dag gemiddeld
}

/** Huidig programma — Supabase: client_programs */
const huidigProgramma = {
  naam: "Kracht Fase 2",                 // <-- Programma naam
  beschrijving: "Upper/Lower split",     // <-- Korte beschrijving
  week: 6,                                // <-- Huidige week
  totaalWeken: 12,                        // <-- Totaal weken
  trainingsDagen: 4,                      // <-- Trainingen per week
  voltooidDezWeek: 3,                     // <-- Trainingen gedaan deze week
}

/** Macro targets — Supabase: client_nutrition */
const macroTargets = {
  kcal: { huidig: 1920, doel: 2200 },    // <-- Huidige inname vs doel
  eiwit: { huidig: 145, doel: 160 },     // <-- Gram eiwit
  koolhydraten: { huidig: 210, doel: 250 }, // <-- Gram koolhydraten
  vetten: { huidig: 58, doel: 65 },      // <-- Gram vetten
}

/** Gewichtstrend — Supabase: client_checkins (gewicht per week) */
const gewichtsData = [
  { week: "Wk 1", gewicht: 74.2 },       // <-- Per check-in datum + gewicht
  { week: "Wk 2", gewicht: 73.8 },
  { week: "Wk 3", gewicht: 73.5 },
  { week: "Wk 4", gewicht: 73.9 },
  { week: "Wk 5", gewicht: 73.2 },
  { week: "Wk 6", gewicht: 72.8 },
  { week: "Wk 7", gewicht: 72.5 },
  { week: "Wk 8", gewicht: 72.3 },
  { week: "Wk 9", gewicht: 72.0 },
  { week: "Wk 10", gewicht: 71.8 },
  { week: "Wk 11", gewicht: 71.5 },
  { week: "Wk 12", gewicht: 71.1 },
]

/** Laatste check-in samenvatting — Supabase: client_checkins (meest recente) */
const laatsteCheckin = {
  datum: "28 feb 2026",                   // <-- Datum check-in
  gewicht: 71.1,                           // <-- Gewicht in kg
  verandering: -0.4,                       // <-- Verschil t.o.v. vorige week
  energie: 7,                              // <-- Energieniveau 1-10
  slaap: 8,                               // <-- Slaapkwaliteit 1-10
  opmerkingen: "Voelde me sterk deze week, squats gaan goed. Iets meer last van slaap door stress op werk.", // <-- Tekst
}

/** Komende sessies — Supabase: client_sessions */
const komendeSessies = [
  { datum: "1 mrt", tijd: "10:00", type: "Upper Body", status: "gepland" },   // <-- Sessie data
  { datum: "3 mrt", tijd: "10:00", type: "Lower Body", status: "gepland" },
  { datum: "5 mrt", tijd: "16:00", type: "Check-in gesprek", status: "gepland" },
]

/** Recente coach notities — Supabase: coach_notes */
const recenteNotities = [
  {
    datum: "27 feb",
    tekst: "Progressie op squat is uitstekend. Overweeg volume te verhogen volgende fase.",
    categorie: "training",
  },
  {
    datum: "25 feb",
    tekst: "Eiwitinname onder target, besproken om meer zuivel toe te voegen.",
    categorie: "voeding",
  },
]


function MacroBar({ label, huidig, doel, kleur }: { label: string; huidig: number; doel: number; kleur: string }) {
  const percentage = Math.min(Math.round((huidig / doel) * 100), 100)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold text-foreground">{huidig} / {doel}g</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${kleur} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export function OverzichtTab() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Snelle stats rij */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <span className="text-[11px] text-muted-foreground">Week</span>
            <span className="text-2xl font-bold text-foreground">{snelleStats.huidigeWeek}</span>
            <span className="text-[10px] text-muted-foreground">van {huidigProgramma.totaalWeken}</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1">
              <Dumbbell className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Training</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{snelleStats.complianceTraining}%</span>
            <span className="text-[10px] text-success">Compliance</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1">
              <Apple className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Voeding</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{snelleStats.complianceVoeding}%</span>
            <span className="text-[10px] text-warning-foreground">Compliance</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <span className="text-[11px] text-muted-foreground">Gewicht</span>
            <div className="flex items-center gap-1">
              {snelleStats.gewichtsTrend < 0 ? (
                <TrendingDown className="size-3.5 text-success" />
              ) : snelleStats.gewichtsTrend > 0 ? (
                <TrendingUp className="size-3.5 text-destructive" />
              ) : (
                <Minus className="size-3.5 text-muted-foreground" />
              )}
              <span className="text-2xl font-bold text-foreground">{snelleStats.gewichtsTrend}kg</span>
            </div>
            <span className="text-[10px] text-muted-foreground">deze week</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Activity className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{snelleStats.energieNiveau}</span>
            <span className="text-[10px] text-muted-foreground">Energie</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Moon className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{snelleStats.slaapKwaliteit}</span>
            <span className="text-[10px] text-muted-foreground">Slaap</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Droplets className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{snelleStats.waterInname}L</span>
            <span className="text-[10px] text-muted-foreground">Water/dag</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Kolom 1: Programma + Macro's */}
        <div className="flex flex-col gap-6">
          {/* Huidig programma */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Dumbbell className="size-4 text-primary" />
                Huidig programma
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <p className="font-semibold text-foreground">{huidigProgramma.naam}</p>
                <p className="text-xs text-muted-foreground">{huidigProgramma.beschrijving}</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Voortgang</span>
                  <span className="font-semibold text-foreground">Week {huidigProgramma.week}/{huidigProgramma.totaalWeken}</span>
                </div>
                <Progress value={(huidigProgramma.week / huidigProgramma.totaalWeken) * 100} className="h-2" />
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Trainingen deze week</span>
                <span className="font-semibold text-foreground">{huidigProgramma.voltooidDezWeek}/{huidigProgramma.trainingsDagen}</span>
              </div>
            </CardContent>
          </Card>

          {/* Macro targets */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Apple className="size-4 text-primary" />
                {"Macro's vandaag"}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Calorieën</span>
                  <span className="font-semibold text-foreground">{macroTargets.kcal.huidig} / {macroTargets.kcal.doel} kcal</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((macroTargets.kcal.huidig / macroTargets.kcal.doel) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <MacroBar label="Eiwit" huidig={macroTargets.eiwit.huidig} doel={macroTargets.eiwit.doel} kleur="bg-chart-1" />
              <MacroBar label="Koolhydraten" huidig={macroTargets.koolhydraten.huidig} doel={macroTargets.koolhydraten.doel} kleur="bg-chart-2" />
              <MacroBar label="Vetten" huidig={macroTargets.vetten.huidig} doel={macroTargets.vetten.doel} kleur="bg-chart-4" />
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Gewichtstrend */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Gewichtstrend</CardTitle>
              <Badge variant="outline" className="text-[10px]">12 weken</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={gewichtsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gewichtGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                  <YAxis domain={["dataMin - 1", "dataMax + 1"]} tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.91 0.005 240)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => [`${value} kg`, "Gewicht"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="gewicht"
                    stroke="oklch(0.55 0.15 160)"
                    strokeWidth={2}
                    fill="url(#gewichtGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onderste rij: Check-in + Sessies + Notities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Laatste check-in */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Laatste check-in</CardTitle>
            <p className="text-[11px] text-muted-foreground">{laatsteCheckin.datum}</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Gewicht</span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold text-foreground">{laatsteCheckin.gewicht} kg</span>
                  <span className={`text-[11px] ${laatsteCheckin.verandering < 0 ? "text-success" : "text-destructive"}`}>
                    {laatsteCheckin.verandering > 0 ? "+" : ""}{laatsteCheckin.verandering} kg
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Energie</span>
                <span className="text-sm font-semibold text-foreground">{laatsteCheckin.energie}/10</span>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] text-muted-foreground">Slaap</span>
                <span className="text-sm font-semibold text-foreground">{laatsteCheckin.slaap}/10</span>
              </div>
            </div>
            <div className="border-t border-border pt-2">
              <p className="text-xs text-muted-foreground italic leading-relaxed">
                {`"${laatsteCheckin.opmerkingen}"`}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Komende sessies */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <CalendarDays className="size-4 text-primary" />
              Komende sessies
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {komendeSessies.map((sessie, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{sessie.type}</span>
                  <span className="text-[11px] text-muted-foreground">{sessie.datum} om {sessie.tijd}</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                  {sessie.status === "gepland" ? "Gepland" : sessie.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recente notities */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="size-4 text-primary" />
              Recente notities
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {recenteNotities.map((notitie, i) => (
              <div key={i} className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-[10px] capitalize">{notitie.categorie}</Badge>
                  <span className="text-[11px] text-muted-foreground">{notitie.datum}</span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">{notitie.tekst}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
