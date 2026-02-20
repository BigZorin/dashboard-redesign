"use client"

import { useState } from "react"
import {
  TrendingUp, TrendingDown, Users, DollarSign, Star, ArrowUpRight, ArrowDownRight,
  Minus, Calendar, Activity, UserPlus, UserMinus, Target, Clock, Filter,
  Download, BarChart3, PieChart as PieChartIcon, GraduationCap, Dumbbell
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  ComposedChart,
} from "recharts"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte analytics uit Supabase
//
// Supabase tabellen / views:
//   - client_subscriptions (omzet berekening, MRR, ARR, gem. cliëntwaarde, churn revenue)
//   - clients (retentie berekening, churn rate, acquisitie bron)
//   - client_programs (programmaverdeling, afronding %, per coach)
//   - client_checkins (betrokkenheid: check-in frequentie, per dag/week)
//   - messages (betrokkenheid: berichtenvolume, responstijden)
//   - client_feedback (tevredenheidsscores per programma)
//   - client_sessions (sessie typen: PT / video call, per coach)
//   - courses (course analytics: inschrijvingen, voltooiing)
//   - course_progress (voortgang per module/les)
//   - users (coach data, rol verdeling)
//   - leads (acquisitie funnel: bron -> lead -> client)
//   - calculator_sessions (website funnel data)
//
// Periodes: data moet filterbaar zijn op 7d / 30d / 90d / 12m / alles
// Berekeningen via Supabase RPC functions of Edge Functions
// ============================================================================

// --- Periode filter ---
const periodes = [
  { label: "7 dagen", value: "7d" },
  { label: "30 dagen", value: "30d" },
  { label: "90 dagen", value: "90d" },
  { label: "12 maanden", value: "12m" },
  { label: "Alles", value: "all" },
]

// --- Omzet tab data ---
const omzetMaandelijks = [
  { maand: "Aug", omzet: 8200, kosten: 2100, netto: 6100, clienten: 38 },
  { maand: "Sep", omzet: 9400, kosten: 2200, netto: 7200, clienten: 40 },
  { maand: "Okt", omzet: 10800, kosten: 2300, netto: 8500, clienten: 42 },
  { maand: "Nov", omzet: 11400, kosten: 2400, netto: 9000, clienten: 44 },
  { maand: "Dec", omzet: 10900, kosten: 2350, netto: 8550, clienten: 43 },
  { maand: "Jan", omzet: 12800, kosten: 2500, netto: 10300, clienten: 46 },
  { maand: "Feb", omzet: 14240, kosten: 2600, netto: 11640, clienten: 48 },
]

const omzetPerBron = [
  { naam: "PT Sessies", waarde: 45, kleur: "oklch(0.55 0.15 160)" },
  { naam: "Maandabonnementen", waarde: 30, kleur: "oklch(0.6 0.12 200)" },
  { naam: "Courses", waarde: 15, kleur: "oklch(0.7 0.15 80)" },
  { naam: "Voedingsplannen", waarde: 10, kleur: "oklch(0.55 0.2 30)" },
]

const financieleKpis = [
  { label: "MRR", waarde: "\u20AC14.240", trend: "+11,3%", richting: "up" as const, icon: DollarSign },
  { label: "ARR", waarde: "\u20AC170.880", trend: "+11,3%", richting: "up" as const, icon: TrendingUp },
  { label: "Gem. Clientwaarde", waarde: "\u20AC297/mnd", trend: "+\u20AC18", richting: "up" as const, icon: Target },
  { label: "Churn Revenue", waarde: "\u20AC890", trend: "-\u20AC120", richting: "down" as const, icon: TrendingDown },
]

// --- Clienten tab data ---
const clientAcquisitie = [
  { maand: "Aug", nieuw: 5, verloren: 2, netto: 3 },
  { maand: "Sep", nieuw: 6, verloren: 1, netto: 5 },
  { maand: "Okt", nieuw: 4, verloren: 3, netto: 1 },
  { maand: "Nov", nieuw: 7, verloren: 2, netto: 5 },
  { maand: "Dec", nieuw: 3, verloren: 4, netto: -1 },
  { maand: "Jan", nieuw: 8, verloren: 1, netto: 7 },
  { maand: "Feb", nieuw: 6, verloren: 2, netto: 4 },
]

const retentieData = [
  { maand: "Aug", percentage: 88, doelstelling: 90 },
  { maand: "Sep", percentage: 90, doelstelling: 90 },
  { maand: "Okt", percentage: 87, doelstelling: 90 },
  { maand: "Nov", percentage: 92, doelstelling: 90 },
  { maand: "Dec", percentage: 89, doelstelling: 90 },
  { maand: "Jan", percentage: 93, doelstelling: 90 },
  { maand: "Feb", percentage: 94, doelstelling: 90 },
]

const clientBronnen = [
  { naam: "Website Calculator", waarde: 35, kleur: "oklch(0.55 0.15 160)" },
  { naam: "Instagram", waarde: 25, kleur: "oklch(0.6 0.12 200)" },
  { naam: "Verwijzing", waarde: 22, kleur: "oklch(0.7 0.15 80)" },
  { naam: "Google Ads", waarde: 12, kleur: "oklch(0.55 0.2 30)" },
  { naam: "Overig", waarde: 6, kleur: "oklch(0.65 0.1 260)" },
]

const clientKpis = [
  { label: "Totaal Actief", waarde: "48", trend: "+4", richting: "up" as const, icon: Users },
  { label: "Nieuwe (deze mnd)", waarde: "6", trend: "+2", richting: "up" as const, icon: UserPlus },
  { label: "Verloren (deze mnd)", waarde: "2", trend: "-1", richting: "up" as const, icon: UserMinus },
  { label: "Retentie", waarde: "94%", trend: "+1,1%", richting: "up" as const, icon: Activity },
]

// --- Betrokkenheid tab data ---
const weekBetrokkenheid = [
  { dag: "Ma", checkins: 32, berichten: 45, sessies: 12 },
  { dag: "Di", checkins: 38, berichten: 52, sessies: 14 },
  { dag: "Wo", checkins: 28, berichten: 48, sessies: 8 },
  { dag: "Do", checkins: 35, berichten: 40, sessies: 11 },
  { dag: "Vr", checkins: 42, berichten: 55, sessies: 15 },
  { dag: "Za", checkins: 20, berichten: 25, sessies: 4 },
  { dag: "Zo", checkins: 12, berichten: 18, sessies: 2 },
]

const responseTijden = [
  { coach: "Mark Jensen", gemTijd: "18 min", checkinRatio: 95, clienten: 18, rating: 4.9 },
  { coach: "Lisa de Vries", gemTijd: "32 min", checkinRatio: 88, clienten: 16, rating: 4.7 },
  { coach: "Thomas Berg", gemTijd: "12 min", checkinRatio: 97, clienten: 14, rating: 4.8 },
]

const betrokkenheidKpis = [
  { label: "Dagelijkse Check-ins", waarde: "29,6", trend: "+3,2", richting: "up" as const, icon: Activity },
  { label: "Gem. Responstijd", waarde: "21 min", trend: "-4 min", richting: "up" as const, icon: Clock },
  { label: "Sessies/week", waarde: "66", trend: "+8", richting: "up" as const, icon: Calendar },
  { label: "Berichten/dag", waarde: "40,4", trend: "+5,1", richting: "up" as const, icon: Target },
]

// --- Programma's & Courses tab data ---
const programmaverdeling = [
  { naam: "Kracht", waarde: 28, kleur: "oklch(0.55 0.15 160)" },
  { naam: "Afvallen", waarde: 32, kleur: "oklch(0.55 0.2 30)" },
  { naam: "Uithoudingsvermogen", waarde: 15, kleur: "oklch(0.6 0.12 200)" },
  { naam: "Wellness", waarde: 14, kleur: "oklch(0.7 0.15 80)" },
  { naam: "Overig", waarde: 11, kleur: "oklch(0.65 0.1 260)" },
]

const programmaPrestaties = [
  { naam: "Kracht Fase 2", afronding: 85, tevredenheid: 4.9, clienten: 12, coach: "Mark Jensen" },
  { naam: "Afvallen 12 weken", afronding: 72, tevredenheid: 4.7, clienten: 18, coach: "Lisa de Vries" },
  { naam: "Wedstrijd Prep", afronding: 94, tevredenheid: 5.0, clienten: 3, coach: "Mark Jensen" },
  { naam: "Marathon Prep", afronding: 78, tevredenheid: 4.6, clienten: 8, coach: "Thomas Berg" },
  { naam: "Wellness & Mobiliteit", afronding: 68, tevredenheid: 4.8, clienten: 6, coach: "Lisa de Vries" },
]

const coursesPrestaties = [
  { naam: "Voeding Fundamentals", inschrijvingen: 124, voltooiing: 68, rating: 4.8, omzet: "\u20AC0" },
  { naam: "Krachttraining Basis", inschrijvingen: 89, voltooiing: 72, rating: 4.9, omzet: "\u20AC2.225" },
  { naam: "Mindset & Motivatie", inschrijvingen: 56, voltooiing: 45, rating: 4.5, omzet: "\u20AC1.400" },
  { naam: "Herstel & Mobiliteit", inschrijvingen: 34, voltooiing: 82, rating: 4.7, omzet: "\u20AC850" },
]

// --- Coach vergelijking tab data ---
const coachVergelijking = [
  {
    naam: "Mark Jensen", clienten: 18, retentie: 94, gemWaarde: "\u20AC312",
    checkinRatio: 95, responstijd: "18 min", tevredenheid: 4.9, omzet: "\u20AC5.616",
    sessies: 28, programmas: 4
  },
  {
    naam: "Lisa de Vries", clienten: 16, retentie: 91, gemWaarde: "\u20AC278",
    checkinRatio: 88, responstijd: "32 min", tevredenheid: 4.7, omzet: "\u20AC4.448",
    sessies: 22, programmas: 3
  },
  {
    naam: "Thomas Berg", clienten: 14, retentie: 96, gemWaarde: "\u20AC305",
    checkinRatio: 97, responstijd: "12 min", tevredenheid: 4.8, omzet: "\u20AC4.270",
    sessies: 24, programmas: 5
  },
]

const coachOmzetTrend = [
  { maand: "Aug", mark: 3800, lisa: 3200, thomas: 2800 },
  { maand: "Sep", mark: 4100, lisa: 3500, thomas: 3100 },
  { maand: "Okt", mark: 4400, lisa: 3700, thomas: 3300 },
  { maand: "Nov", mark: 4600, lisa: 3900, thomas: 3500 },
  { maand: "Dec", mark: 4500, lisa: 3800, thomas: 3200 },
  { maand: "Jan", mark: 5200, lisa: 4200, thomas: 3900 },
  { maand: "Feb", mark: 5616, lisa: 4448, thomas: 4270 },
]

// --- Tooltip styling ---
const tooltipStyle = {
  backgroundColor: "oklch(1 0 0)",
  border: "1px solid oklch(0.91 0.005 240)",
  borderRadius: "8px",
  fontSize: "12px",
}

export function AnalyticsSection() {
  const [periode, setPeriode] = useState("30d")

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Statistieken</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Bedrijfsprestaties, clienten en coach analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <Filter className="size-3.5 mr-1.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodes.map((p) => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-9">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="financieel">
        <TabsList>
          <TabsTrigger value="financieel" className="gap-1.5 text-xs">
            <DollarSign className="size-3.5" />
            Financieel
          </TabsTrigger>
          <TabsTrigger value="clienten" className="gap-1.5 text-xs">
            <Users className="size-3.5" />
            Clienten
          </TabsTrigger>
          <TabsTrigger value="betrokkenheid" className="gap-1.5 text-xs">
            <Activity className="size-3.5" />
            Betrokkenheid
          </TabsTrigger>
          <TabsTrigger value="programmas" className="gap-1.5 text-xs">
            <Dumbbell className="size-3.5" />
            {"Programma's & Courses"}
          </TabsTrigger>
          <TabsTrigger value="coaches" className="gap-1.5 text-xs">
            <BarChart3 className="size-3.5" />
            Coaches
          </TabsTrigger>
        </TabsList>

        {/* ================================================================
            TAB 1: FINANCIEEL
        ================================================================ */}
        <TabsContent value="financieel" className="mt-4 flex flex-col gap-4">
          {/* KPI kaarten */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {financieleKpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Omzet trend (2 kolommen breed) */}
            <Card className="border-border shadow-sm lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Omzet vs Kosten</CardTitle>
                <p className="text-xs text-muted-foreground">Bruto omzet, kosten en netto per maand</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={omzetMaandelijks}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                    <XAxis dataKey="maand" tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `\u20AC${(v / 1000).toFixed(0)}k`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`\u20AC${value.toLocaleString("nl-NL")}`, ""]} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="omzet" name="Bruto Omzet" fill="oklch(0.55 0.15 160)" radius={[4, 4, 0, 0]} barSize={24} />
                    <Bar dataKey="kosten" name="Kosten" fill="oklch(0.55 0.2 30 / 0.6)" radius={[4, 4, 0, 0]} barSize={24} />
                    <Line type="monotone" dataKey="netto" name="Netto" stroke="oklch(0.6 0.12 200)" strokeWidth={2.5} dot={{ r: 3.5 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Omzet per bron (1 kolom) */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Omzet per Bron</CardTitle>
                <p className="text-xs text-muted-foreground">Verdeling inkomstenbronnen</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={omzetPerBron} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="waarde">
                      {omzetPerBron.map((entry, i) => <Cell key={i} fill={entry.kleur} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Aandeel"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 mt-2">
                  {omzetPerBron.map((bron) => (
                    <div key={bron.naam} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="size-2.5 rounded-full" style={{ backgroundColor: bron.kleur }} />
                        <span className="text-muted-foreground">{bron.naam}</span>
                      </div>
                      <span className="font-medium text-foreground">{bron.waarde}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ================================================================
            TAB 2: CLIENTEN
        ================================================================ */}
        <TabsContent value="clienten" className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {clientKpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Client acquisitie / churn */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Client Acquisitie vs Churn</CardTitle>
                <p className="text-xs text-muted-foreground">Nieuwe clienten vs verloren per maand</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={clientAcquisitie} barGap={2}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                    <XAxis dataKey="maand" tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="nieuw" name="Nieuw" fill="oklch(0.55 0.15 160)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="verloren" name="Verloren" fill="oklch(0.55 0.2 30)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Retentie lijn + doelstelling */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Retentie Trend</CardTitle>
                <p className="text-xs text-muted-foreground">Actueel vs doelstelling (90%)</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={retentieData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                    <XAxis dataKey="maand" tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, ""]} />
                    <Legend iconType="line" wrapperStyle={{ fontSize: "11px" }} />
                    <Line type="monotone" dataKey="percentage" name="Retentie" stroke="oklch(0.55 0.15 160)" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="doelstelling" name="Doel" stroke="oklch(0.55 0.2 30)" strokeWidth={1.5} strokeDasharray="6 4" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Acquisitie bronnen */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Acquisitie Bronnen</CardTitle>
              <p className="text-xs text-muted-foreground">Waar komen nieuwe clienten vandaan?</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {clientBronnen.map((bron) => (
                  <div key={bron.naam} className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border">
                    <div className="size-3 rounded-full" style={{ backgroundColor: bron.kleur }} />
                    <span className="text-lg font-bold text-foreground">{bron.waarde}%</span>
                    <span className="text-[11px] text-muted-foreground text-center">{bron.naam}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 3: BETROKKENHEID
        ================================================================ */}
        <TabsContent value="betrokkenheid" className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {betrokkenheidKpis.map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </div>

          {/* Wekelijkse betrokkenheid gestapeld */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Wekelijkse Activiteit</CardTitle>
              <p className="text-xs text-muted-foreground">Check-ins, berichten en sessies per dag</p>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={weekBetrokkenheid} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                  <XAxis dataKey="dag" tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="checkins" name="Check-ins" fill="oklch(0.55 0.15 160)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="berichten" name="Berichten" fill="oklch(0.6 0.12 200)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sessies" name="Sessies" fill="oklch(0.7 0.15 80)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Coach response tijden */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Coach Responstijden & Ratio</CardTitle>
              <p className="text-xs text-muted-foreground">Gemiddelde responstijd en check-in beoordelingsratio per coach</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {responseTijden.map((coach) => (
                  <div key={coach.coach} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {coach.coach.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{coach.coach}</p>
                        <p className="text-xs text-muted-foreground">{coach.clienten} clienten</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Responstijd</p>
                        <p className="text-sm font-semibold text-foreground">{coach.gemTijd}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Check-in Ratio</p>
                        <p className={cn("text-sm font-semibold", coach.checkinRatio >= 90 ? "text-success" : "text-chart-4")}>{coach.checkinRatio}%</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground">Rating</p>
                        <div className="flex items-center gap-1">
                          <Star className="size-3 text-chart-4 fill-chart-4" />
                          <span className="text-sm font-semibold text-foreground">{coach.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 4: PROGRAMMA'S & COURSES
        ================================================================ */}
        <TabsContent value="programmas" className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Programmaverdeling donut */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Dumbbell className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold text-foreground">Programmaverdeling</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">Clientverdeling over programmatypen</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={programmaverdeling} cx="50%" cy="50%" innerRadius={65} outerRadius={100} paddingAngle={3} dataKey="waarde">
                      {programmaverdeling.map((entry, i) => <Cell key={i} fill={entry.kleur} />)}
                    </Pie>
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${value}%`, "Aandeel"]} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: "11px" }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Programma prestaties tabel */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Dumbbell className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold text-foreground">Programma Prestaties</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">Afronding, tevredenheid en coach per programma</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {programmaPrestaties.map((p) => (
                    <div key={p.naam} className="flex items-center gap-4 py-2.5 px-3 rounded-lg border border-border">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{p.naam}</p>
                        <p className="text-[11px] text-muted-foreground">{p.coach} &middot; {p.clienten} clienten</p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">Afronding</p>
                          <p className={cn("text-sm font-semibold", p.afronding >= 80 ? "text-success" : "text-foreground")}>{p.afronding}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] text-muted-foreground">Rating</p>
                          <div className="flex items-center gap-1">
                            <Star className="size-3 text-chart-4 fill-chart-4" />
                            <span className="text-sm font-semibold text-foreground">{p.tevredenheid}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses prestaties */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-semibold text-foreground">Course Prestaties</CardTitle>
              </div>
              <p className="text-xs text-muted-foreground">Inschrijvingen, voltooiing en omzet per course</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                {coursesPrestaties.map((c) => (
                  <div key={c.naam} className="flex items-center gap-4 py-3 px-4 rounded-lg border border-border">
                    <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <GraduationCap className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{c.naam}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[11px] text-muted-foreground">{c.inschrijvingen} ingeschreven</span>
                        <span className="text-[11px] text-muted-foreground">{c.voltooiing}% voltooid</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-center">
                        <div className="flex items-center gap-1">
                          <Star className="size-3 text-chart-4 fill-chart-4" />
                          <span className="text-sm font-semibold text-foreground">{c.rating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-foreground">{c.omzet}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================================================================
            TAB 5: COACHES
        ================================================================ */}
        <TabsContent value="coaches" className="mt-4 flex flex-col gap-4">
          {/* Coach omzet trend lijnen */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Omzet per Coach</CardTitle>
              <p className="text-xs text-muted-foreground">Maandelijkse omzettrend per coach</p>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={coachOmzetTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                  <XAxis dataKey="maand" tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `\u20AC${(v / 1000).toFixed(1)}k`} />
                  <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`\u20AC${value.toLocaleString("nl-NL")}`, ""]} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="mark" name="Mark Jensen" stroke="oklch(0.55 0.15 160)" strokeWidth={2.5} dot={{ r: 3.5 }} />
                  <Line type="monotone" dataKey="lisa" name="Lisa de Vries" stroke="oklch(0.6 0.12 200)" strokeWidth={2.5} dot={{ r: 3.5 }} />
                  <Line type="monotone" dataKey="thomas" name="Thomas Berg" stroke="oklch(0.7 0.15 80)" strokeWidth={2.5} dot={{ r: 3.5 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Coach vergelijking kaarten */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {coachVergelijking.map((coach) => (
              <Card key={coach.naam} className="border-border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {coach.naam.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{coach.naam}</p>
                      <p className="text-xs text-muted-foreground">{coach.clienten} clienten &middot; {coach.programmas} {"programma's"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MetricItem label="Omzet" waarde={coach.omzet} />
                    <MetricItem label="Retentie" waarde={`${coach.retentie}%`} groen={coach.retentie >= 90} />
                    <MetricItem label="Gem. Waarde" waarde={coach.gemWaarde} />
                    <MetricItem label="Check-in Ratio" waarde={`${coach.checkinRatio}%`} groen={coach.checkinRatio >= 90} />
                    <MetricItem label="Responstijd" waarde={coach.responstijd} />
                    <MetricItem label="Sessies/mnd" waarde={`${coach.sessies}`} />
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex items-center justify-center gap-1">
                    <Star className="size-4 text-chart-4 fill-chart-4" />
                    <span className="text-lg font-bold text-foreground">{coach.tevredenheid}</span>
                    <span className="text-xs text-muted-foreground ml-1">gem. rating</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// --- Herbruikbare KPI Card ---
function KpiCard({ label, waarde, trend, richting, icon: Icon }: {
  label: string; waarde: string; trend: string; richting: "up" | "down"; icon: React.ElementType
}) {
  const TrendIcon = richting === "up" ? ArrowUpRight : ArrowDownRight
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <p className="text-xl font-bold text-foreground">{waarde}</p>
        <div className="flex items-center gap-1 mt-1">
          <TrendIcon className={cn("size-3", richting === "up" ? "text-success" : "text-destructive")} />
          <span className={cn("text-xs font-medium", richting === "up" ? "text-success" : "text-destructive")}>{trend}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Herbruikbare Metric Item ---
function MetricItem({ label, waarde, groen }: { label: string; waarde: string; groen?: boolean }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg bg-secondary/50 p-2.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold", groen ? "text-success" : "text-foreground")}>{waarde}</span>
    </div>
  )
}
