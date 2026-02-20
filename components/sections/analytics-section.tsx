"use client"

import { TrendingUp, Users, DollarSign, Star, ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "recharts"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte analytics uit Supabase
//
// Supabase tabellen / views:
//   - client_subscriptions (omzet berekening, gem. cliëntwaarde)
//   - clients (retentie berekening, churn rate)
//   - client_programs (programmaverdeling, afronding %)
//   - client_checkins (betrokkenheid: check-in frequentie)
//   - messages (betrokkenheid: berichtenvolume)
//   - client_feedback (tevredenheidsscores per programma)
//
// Berekeningen via Supabase Edge Functions of server-side aggregatie
// ============================================================================

/** Maandelijkse omzet en cliëntaantallen */
const omzetMaandelijks = [
  { maand: "Aug", omzet: 2800, clienten: 38 },
  { maand: "Sep", omzet: 3200, clienten: 40 },
  { maand: "Okt", omzet: 3800, clienten: 42 },
  { maand: "Nov", omzet: 4100, clienten: 44 },
  { maand: "Dec", omzet: 3900, clienten: 43 },
  { maand: "Jan", omzet: 4600, clienten: 46 },
  { maand: "Feb", omzet: 5240, clienten: 48 },
]

/** Retentiepercentage per maand */
const retentieData = [
  { maand: "Aug", percentage: 88 },
  { maand: "Sep", percentage: 90 },
  { maand: "Okt", percentage: 87 },
  { maand: "Nov", percentage: 92 },
  { maand: "Dec", percentage: 89 },
  { maand: "Jan", percentage: 93 },
  { maand: "Feb", percentage: 94 },
]

/** Verdeling van cliënten over programmatypen */
const programmaverdeling = [
  { naam: "Kracht", waarde: 28, kleur: "oklch(0.55 0.15 160)" },
  { naam: "Afvallen", waarde: 32, kleur: "oklch(0.55 0.2 30)" },
  { naam: "Uithoudingsvermogen", waarde: 15, kleur: "oklch(0.6 0.12 200)" },
  { naam: "Wellness", waarde: 14, kleur: "oklch(0.7 0.15 80)" },
  { naam: "Overig", waarde: 11, kleur: "oklch(0.65 0.1 260)" },
]

/** Wekelijkse betrokkenheid (check-ins en berichten) */
const clientBetrokkenheid = [
  { dag: "Ma", checkins: 32, berichten: 45 },
  { dag: "Di", checkins: 38, berichten: 52 },
  { dag: "Wo", checkins: 28, berichten: 48 },
  { dag: "Do", checkins: 35, berichten: 40 },
  { dag: "Vr", checkins: 42, berichten: 55 },
  { dag: "Za", checkins: 20, berichten: 25 },
  { dag: "Zo", checkins: 12, berichten: 18 },
]

/** KPI kaarten bovenaan */
const kpiKaarten = [
  {
    titel: "Maandomzet",
    waarde: "\u20AC5.240",
    verandering: "+12,5%",
    icon: DollarSign,
  },
  {
    titel: "Cliëntretentie",
    waarde: "94%",
    verandering: "+1,1%",
    icon: Users,
  },
  {
    titel: "Gem. cliëntwaarde",
    waarde: "\u20AC109",
    verandering: "+\u20AC4",
    icon: TrendingUp,
  },
  {
    titel: "Cliënttevredenheid",
    waarde: "4,8/5",
    verandering: "+0,2",
    icon: Star,
  },
]

/** Programmaprestaties */
const programmaPrestaties = [
  { naam: "Kracht Fase 2", afronding: 85, tevredenheid: 4.9, clienten: 12 },
  { naam: "Afvallen 12 weken", afronding: 72, tevredenheid: 4.7, clienten: 18 },
  { naam: "Wedstrijd Prep", afronding: 94, tevredenheid: 5.0, clienten: 3 },
  { naam: "Marathon Prep", afronding: 78, tevredenheid: 4.6, clienten: 8 },
  { naam: "Wellness & Mobiliteit", afronding: 68, tevredenheid: 4.8, clienten: 6 },
]

export function AnalyticsSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Statistieken</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Volg je bedrijfsprestaties en cliëntbetrokkenheid</p>
      </div>

      {/* KPI Kaarten */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiKaarten.map((kpi) => (
          <Card key={kpi.titel} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <kpi.icon className="size-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-success">
                  <ArrowUpRight className="size-3" />
                  {kpi.verandering}
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{kpi.waarde}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.titel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="omzet">
        <TabsList>
          <TabsTrigger value="omzet">Omzet</TabsTrigger>
          <TabsTrigger value="betrokkenheid">Betrokkenheid</TabsTrigger>
          <TabsTrigger value="programmas">{"Programma's"}</TabsTrigger>
        </TabsList>

        <TabsContent value="omzet" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Omzettrend</CardTitle>
                <p className="text-xs text-muted-foreground">Maandelijkse omzet over tijd</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={omzetMaandelijks}>
                    <defs>
                      <linearGradient id="analyticsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                    <XAxis dataKey="maand" tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `\u20AC${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.005 240)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`\u20AC${value.toLocaleString("nl-NL")}`, "Omzet"]}
                    />
                    <Area type="monotone" dataKey="omzet" stroke="oklch(0.55 0.15 160)" strokeWidth={2} fill="url(#analyticsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Cliëntretentie</CardTitle>
                <p className="text-xs text-muted-foreground">Maandelijks retentiepercentage</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={retentieData}>
                    <defs>
                      <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                    <XAxis dataKey="maand" tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} domain={[80, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.005 240)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Retentie"]}
                    />
                    <Area type="monotone" dataKey="percentage" stroke="oklch(0.6 0.12 200)" strokeWidth={2} fill="url(#retentionGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="betrokkenheid" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-foreground">Wekelijkse cliëntbetrokkenheid</CardTitle>
              <p className="text-xs text-muted-foreground">Check-ins en berichten per dag</p>
            </CardHeader>
            <CardContent className="pb-4">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={clientBetrokkenheid} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                  <XAxis dataKey="dag" tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "oklch(1 0 0)",
                      border: "1px solid oklch(0.91 0.005 240)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="checkins" name="Check-ins" fill="oklch(0.55 0.15 160)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="berichten" name="Berichten" fill="oklch(0.6 0.12 200)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="programmas" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">Programmaverdeling</CardTitle>
                <p className="text-xs text-muted-foreground">Cliëntverdeling over programmatypen</p>
              </CardHeader>
              <CardContent className="pb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={programmaverdeling}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                      dataKey="waarde"
                    >
                      {programmaverdeling.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.kleur} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.005 240)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number) => [`${value}%`, "Aandeel"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => <span className="text-xs text-foreground ml-1">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">Programmaprestaties</CardTitle>
                <p className="text-xs text-muted-foreground">Afronding en tevredenheid per programma</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-4">
                  {programmaPrestaties.map((programma) => (
                    <div key={programma.naam} className="flex items-center gap-4 rounded-lg border border-border p-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{programma.naam}</p>
                        <p className="text-xs text-muted-foreground">{programma.clienten} cliënten</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Afronding</p>
                          <p className="text-sm font-semibold text-foreground">{programma.afronding}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Beoordeling</p>
                          <div className="flex items-center gap-1">
                            <Star className="size-3 text-chart-4 fill-chart-4" />
                            <span className="text-sm font-semibold text-foreground">{programma.tevredenheid}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
