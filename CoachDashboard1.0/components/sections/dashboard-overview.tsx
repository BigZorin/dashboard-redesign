"use client"

import { Users, TrendingUp, TrendingDown, ClipboardCheck, MessageCircle, CalendarCheck, Smile, Clock, CheckCircle2, AlertCircle, AlertTriangle, Scale, Minus, Sparkles, Loader2, RefreshCw } from "lucide-react"
import type { RedFlag, ClientWeightTrend } from "@/app/actions/dashboard"
import type { AiInsight } from "@/app/actions/ai-coach"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte data uit Supabase
//
// COACH-SCOPED DATA:
//   Alle data op dit dashboard is gefilterd op de ingelogde coach.
//   De coach ziet ALLEEN data van zijn/haar eigen toegewezen clienten.
//   Filter: WHERE clients.coach_id = auth.uid()
//
// Supabase tabellen (altijd gefilterd op coach_id):
//   - clients (actieve cliënten count WHERE coach_id = auth.uid())
//   - messages (ongelezen berichten WHERE conversation coach_id = auth.uid())
//   - client_sessions (sessies deze week WHERE coach_id = auth.uid())
//   - client_checkins (recente check-ins van eigen clienten)
//   - client_programs (voortgang van eigen clienten)
//
// RLS Policies (verplicht):
//   - clients: SELECT WHERE coach_id = auth.uid()
//   - client_sessions: SELECT WHERE coach_id = auth.uid()
//   - client_checkins: SELECT via JOIN clients WHERE coach_id = auth.uid()
//   - messages: SELECT via JOIN conversations WHERE coach_id = auth.uid()
//
// BELANGRIJK: GEEN financiële data op het coach dashboard!
// Omzet, betalingen, abonnementen, facturatie zijn ADMIN-ONLY.
// Coaches zien alleen coaching-relevante metrics.
// Financiële data zit in: /admin -> Facturatie tab + Statistieken tab
//
// Alle KPI's worden server-side berekend via Supabase RPC of Edge Functions
// ============================================================================

/** Check-in compliance per week (coach-relevante metric i.p.v. omzet) */
const complianceData = [
  { week: "Wk 1", training: 88, voeding: 72 },
  { week: "Wk 2", training: 91, voeding: 76 },
  { week: "Wk 3", training: 85, voeding: 79 },
  { week: "Wk 4", training: 93, voeding: 81 },
  { week: "Wk 5", training: 90, voeding: 78 },
  { week: "Wk 6", training: 95, voeding: 84 },
]

/** Cliëntactiviteit per dag (check-ins en workouts) */
const clientActiviteitData = [
  { dag: "Ma", checkins: 18, workouts: 22 },
  { dag: "Di", checkins: 24, workouts: 19 },
  { dag: "Wo", checkins: 12, workouts: 26 },
  { dag: "Do", checkins: 20, workouts: 21 },
  { dag: "Vr", checkins: 28, workouts: 18 },
  { dag: "Za", checkins: 15, workouts: 30 },
  { dag: "Zo", checkins: 8, workouts: 14 },
]

/** KPI-kaarten bovenaan het dashboard */
const defaultStatKaarten = [
  { titel: "Actieve cliënten", waarde: "0", icon: Users },
  { titel: "Review nodig", waarde: "0", icon: ClipboardCheck },
  { titel: "Gem. compliance", waarde: "—", icon: TrendingUp },
  { titel: "Aandachtspunten", waarde: "0", icon: AlertTriangle },
  { titel: "Ongelezen", waarde: "0", icon: MessageCircle },
  { titel: "Check-ins", waarde: "0", icon: CalendarCheck },
  { titel: "Gem. mood", waarde: "—", icon: Smile },
]

/** Recente check-ins van cliënten */
const defaultRecenteCheckins = [
  { id: "1", naam: "Sarah van Dijk", initialen: "SD", tijd: "10 min geleden", status: "afgerond", notitie: "Voelt zich sterk, nieuw PR behaald" },
  { id: "2", naam: "Tom Bakker", initialen: "TB", tijd: "32 min geleden", status: "review-nodig", notitie: "Moeite met schoudermobiliteit" },
  { id: "3", naam: "Lisa de Vries", initialen: "LV", tijd: "1 uur geleden", status: "afgerond", notitie: "Voeding op schema, gewicht daalt" },
  { id: "4", naam: "James Peters", initialen: "JP", tijd: "2 uur geleden", status: "review-nodig", notitie: "2 workouts gemist deze week" },
  { id: "5", naam: "Emma Jansen", initialen: "EJ", tijd: "3 uur geleden", status: "afgerond", notitie: "Goede vooruitgang op uithoudingsvermogen" },
]

/** Aankomende sessies vandaag */
const defaultAankomendeSessies = [
  { id: "1", naam: "Sarah van Dijk", initialen: "SD", tijd: "10:00", type: "Check-in gesprek" },
  { id: "2", naam: "Tom Bakker", initialen: "TB", tijd: "11:30", type: "Programma review" },
  { id: "3", naam: "Groepssessie", initialen: "GS", tijd: "14:00", type: "HIIT les" },
  { id: "4", naam: "Lisa de Vries", initialen: "LV", tijd: "16:00", type: "Voedingsreview" },
]

/** Voortgang snapshot per cliënt */
const defaultClientVoortgang = [
  { naam: "Sarah van Dijk", initialen: "SD", voortgang: 85, programma: "Kracht Fase 2" },
  { naam: "Tom Bakker", initialen: "TB", voortgang: 62, programma: "Afvallen 12 weken" },
  { naam: "Lisa de Vries", initialen: "LV", voortgang: 94, programma: "Wedstrijd Prep" },
  { naam: "James Peters", initialen: "JP", voortgang: 41, programma: "Spiermassa Basis" },
]

// ============================================================================
// PROPS INTERFACE — Data wrapper stuurt echte data door via deze props.
// V0 kan dit bestand blijven regenereren; voeg alleen deze interface toe.
// ============================================================================
export interface DashboardOverviewProps {
  statKaarten?: { titel: string; waarde: string; icon: any }[]
  recenteCheckins?: typeof defaultRecenteCheckins
  aankomendeSessies?: typeof defaultAankomendeSessies
  clientVoortgang?: typeof defaultClientVoortgang
  complianceChartData?: typeof complianceData
  activiteitChartData?: typeof clientActiviteitData
  redFlags?: RedFlag[]
  weightTrends?: ClientWeightTrend[]
  aiInsights?: AiInsight[]
  aiInsightsLoading?: boolean
  onRefreshAiInsights?: () => void
  loading?: boolean
}

export function DashboardOverview({
  statKaarten = defaultStatKaarten,
  recenteCheckins = defaultRecenteCheckins,
  aankomendeSessies = defaultAankomendeSessies,
  clientVoortgang = defaultClientVoortgang,
  complianceChartData,
  activiteitChartData,
  redFlags = [],
  weightTrends = [],
  aiInsights = [],
  aiInsightsLoading = false,
  onRefreshAiInsights,
  loading = false,
}: DashboardOverviewProps) {
  const activeComplianceData = complianceChartData && complianceChartData.length > 0 ? complianceChartData : complianceData
  const activeActiviteitData = activiteitChartData && activiteitChartData.length > 0 ? activiteitChartData : clientActiviteitData
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* KPI Kaarten */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
        {statKaarten.map((stat) => (
          <Card key={stat.titel} className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <stat.icon className="size-4 text-primary" />
                </div>
                <div className="min-w-0">
                  {loading ? (
                    <Skeleton className="h-6 w-10 mb-0.5" />
                  ) : (
                    <p className="text-xl font-bold text-foreground leading-tight">{stat.waarde}</p>
                  )}
                  <p className="text-[11px] text-muted-foreground truncate">{stat.titel}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Grafieken */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Compliance overzicht</CardTitle>
            <p className="text-xs text-muted-foreground">Training & voeding compliance per week</p>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activeComplianceData}>
                <defs>
                  <linearGradient id="trainingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.55 0.15 160)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="voedingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.6 0.12 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "oklch(0.5 0.01 240)" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} domain={[60, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(1 0 0)",
                    border: "1px solid oklch(0.91 0.005 240)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number, name: string) => [`${value}%`, name === "training" ? "Training" : "Voeding"]}
                />
                <Area type="monotone" dataKey="training" stroke="oklch(0.55 0.15 160)" strokeWidth={2} fill="url(#trainingGradient)" />
                <Area type="monotone" dataKey="voeding" stroke="oklch(0.6 0.12 200)" strokeWidth={2} fill="url(#voedingGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">Cliëntactiviteit</CardTitle>
            <p className="text-xs text-muted-foreground">Check-ins & workouts deze week</p>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activeActiviteitData} barGap={4}>
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
                <Bar dataKey="workouts" name="Workouts" fill="oklch(0.6 0.12 200)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* AI Inzichten */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="size-3.5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">AI Inzichten</CardTitle>
                <p className="text-[11px] text-muted-foreground">Automatische analyse van je cliënten</p>
              </div>
            </div>
            {onRefreshAiInsights && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground hover:text-foreground"
                onClick={onRefreshAiInsights}
                disabled={aiInsightsLoading}
                title="Ververs inzichten"
              >
                <RefreshCw className={`size-3.5 ${aiInsightsLoading ? "animate-spin" : ""}`} />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          {aiInsightsLoading ? (
            <div className="flex items-center justify-center py-6 gap-2">
              <Loader2 className="size-4 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">AI analyseert je cliënten...</p>
            </div>
          ) : aiInsights.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Sparkles className="size-8 text-muted-foreground mb-2" />
              <p className="text-xs text-muted-foreground">Geen inzichten beschikbaar</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {aiInsights.map((insight, i) => (
                <div
                  key={i}
                  className={`rounded-lg border p-3.5 transition-colors ${
                    insight.type === "warning"
                      ? "border-destructive/20 bg-destructive/5"
                      : insight.type === "positive"
                      ? "border-success/20 bg-success/5"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <span className="text-lg leading-none shrink-0">{insight.emoji}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground leading-tight">{insight.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{insight.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Aandachtspunten & Gewichtstrend */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Rode Vlaggen */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Aandachtspunten</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Cliënten die aandacht nodig hebben</p>
              </div>
              {redFlags.length > 0 && (
                <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[11px]">
                  {redFlags.length}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : redFlags.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle2 className="size-8 text-success mb-2" />
                <p className="text-sm font-medium text-foreground">Alles op orde</p>
                <p className="text-xs text-muted-foreground">Geen aandachtspunten gevonden</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                {redFlags.slice(0, 5).map((flag, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary/50 transition-colors cursor-pointer">
                    <Avatar className="size-8">
                      <AvatarFallback className={`text-xs font-semibold ${
                        flag.severity === "critical"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-warning/10 text-warning-foreground"
                      }`}>
                        {flag.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{flag.naam}</p>
                        {flag.severity === "critical" ? (
                          <AlertTriangle className="size-3.5 text-destructive shrink-0" />
                        ) : (
                          <AlertCircle className="size-3.5 text-warning shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{flag.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gewichtstrend */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Gewichtstrend</CardTitle>
            <p className="text-xs text-muted-foreground">Overzicht per cliënt (afgelopen 2 weken)</p>
          </CardHeader>
          <CardContent className="pb-2">
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3.5 w-28" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : weightTrends.length === 0 ? (
              <div className="flex flex-col items-center py-6 text-center">
                <Scale className="size-8 text-muted-foreground mb-2" />
                <p className="text-sm font-medium text-foreground">Geen gewichtsdata</p>
                <p className="text-xs text-muted-foreground">Cliënten hebben nog geen dagelijkse check-ins</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {weightTrends.map(client => (
                  <div key={client.clientId} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-secondary/50 transition-colors cursor-pointer">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {client.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{client.naam}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{client.currentWeight ? `${client.currentWeight}kg` : "?"}</span>
                        {client.goalWeight && (
                          <>
                            <span>→</span>
                            <span>{client.goalWeight}kg</span>
                          </>
                        )}
                      </div>
                    </div>
                    {/* Mini sparkline (SVG) */}
                    {client.weights.length >= 2 && (
                      <div className="w-16 h-8 shrink-0">
                        <MiniSparkline data={client.weights.map(w => w.weight)} trend={client.trend} />
                      </div>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      {client.trend === "down" ? (
                        <TrendingDown className="size-3.5 text-success" />
                      ) : client.trend === "up" ? (
                        <TrendingUp className="size-3.5 text-destructive" />
                      ) : (
                        <Minus className="size-3.5 text-muted-foreground" />
                      )}
                      <span className={`text-xs font-medium ${
                        client.trend === "down" ? "text-success" :
                        client.trend === "up" ? "text-destructive" :
                        "text-muted-foreground"
                      }`}>
                        {client.change > 0 ? "+" : ""}{client.change}kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onderste rij */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Recente Check-ins */}
        <Card className="border-border shadow-sm lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">Recente check-ins</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">Laatste cliëntupdates</p>
              </div>
              <Badge variant="secondary" className="text-xs font-medium bg-secondary text-secondary-foreground">
                {recenteCheckins.filter(c => c.status === "review-nodig").length} review nodig
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col gap-1">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                    <Skeleton className="size-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))
              ) : (
                recenteCheckins.map((checkin) => (
                  <div
                    key={checkin.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-secondary/50 cursor-pointer"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {checkin.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{checkin.naam}</p>
                        {checkin.status === "review-nodig" ? (
                          <AlertCircle className="size-3.5 text-warning shrink-0" />
                        ) : (
                          <CheckCircle2 className="size-3.5 text-success shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{checkin.notitie}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="size-3" />
                      {checkin.tijd}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Planning vandaag */}
        <Card className="border-border shadow-sm lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">Planning vandaag</CardTitle>
            <p className="text-xs text-muted-foreground">Aankomende sessies</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-5 w-12" />
                    <div className="w-px h-10 bg-border" />
                    <Skeleton className="size-8 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))
              ) : (
                aankomendeSessies.map((sessie) => (
                  <div key={sessie.id} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-foreground">{sessie.tijd}</span>
                    </div>
                    <div className="w-px h-10 bg-border" />
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                        {sessie.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{sessie.naam}</p>
                      <p className="text-xs text-muted-foreground">{sessie.type}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cliënt voortgang snapshot */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">Cliënt voortgang</CardTitle>
          <p className="text-xs text-muted-foreground">Programma-afronding deze maand</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="size-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-1.5 w-full" />
                </div>
              ))
            ) : (
              clientVoortgang.map((client) => (
                <div key={client.naam} className="flex flex-col gap-3 rounded-lg border border-border p-4 hover:border-primary/30 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {client.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{client.naam}</p>
                      <p className="text-xs text-muted-foreground truncate">{client.programma}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Voortgang</span>
                      <span className="font-semibold text-foreground">{client.voortgang}%</span>
                    </div>
                    <Progress value={client.voortgang} className="h-1.5" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/** Compact SVG sparkline voor gewichtstrend */
function MiniSparkline({ data, trend }: { data: number[]; trend: "up" | "down" | "stable" }) {
  if (data.length < 2) return null

  const width = 64
  const height = 32
  const padding = 2
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2)
    const y = padding + (1 - (v - min) / range) * (height - padding * 2)
    return `${x},${y}`
  })

  const strokeColor =
    trend === "down" ? "oklch(0.55 0.15 160)" :   // success green
    trend === "up" ? "oklch(0.55 0.2 25)" :         // destructive red
    "oklch(0.5 0.01 240)"                            // muted

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Eindpunt dot */}
      {points.length > 0 && (
        <circle
          cx={parseFloat(points[points.length - 1].split(",")[0])}
          cy={parseFloat(points[points.length - 1].split(",")[1])}
          r={2}
          fill={strokeColor}
        />
      )}
    </svg>
  )
}
