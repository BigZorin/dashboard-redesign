"use client"

import { useEffect, useState } from "react"
import { Users, TrendingUp, MessageCircle, CalendarDays, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { getDashboardStats, getRecentCheckIns, getUpcomingSessions, getClientProgress } from "@/app/actions/dashboard"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

/** Compliance chart data (mock — requires complex aggregation, wired later) */
const complianceData = [
  { week: "Wk 1", training: 88, voeding: 72 },
  { week: "Wk 2", training: 91, voeding: 76 },
  { week: "Wk 3", training: 85, voeding: 79 },
  { week: "Wk 4", training: 93, voeding: 81 },
  { week: "Wk 5", training: 90, voeding: 78 },
  { week: "Wk 6", training: 95, voeding: 84 },
]

/** Activity chart data (mock — wired later) */
const clientActiviteitData = [
  { dag: "Ma", checkins: 18, workouts: 22 },
  { dag: "Di", checkins: 24, workouts: 19 },
  { dag: "Wo", checkins: 12, workouts: 26 },
  { dag: "Do", checkins: 20, workouts: 21 },
  { dag: "Vr", checkins: 28, workouts: 18 },
  { dag: "Za", checkins: 15, workouts: 30 },
  { dag: "Zo", checkins: 8, workouts: 14 },
]

export function DashboardOverview() {
  const [stats, setStats] = useState<any>(null)
  const [checkins, setCheckins] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [progress, setProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentCheckIns(5),
      getUpcomingSessions(4),
      getClientProgress(),
    ]).then(([s, c, sess, prog]) => {
      setStats(s)
      setCheckins(c)
      setSessions(sess)
      setProgress(prog)
      setLoading(false)
    })
  }, [])

  const statKaarten = [
    {
      titel: "Actieve cliënten",
      waarde: loading ? "—" : String(stats?.actieveClienten || 0),
      trend: "up" as const,
      icon: Users,
      beschrijving: "Toegewezen cliënten",
    },
    {
      titel: "Check-ins",
      waarde: loading ? "—" : String((stats?.weekCheckIns || 0) + (stats?.dagCheckIns || 0)),
      trend: "up" as const,
      icon: TrendingUp,
      beschrijving: "Wekelijks + dagelijks",
    },
    {
      titel: "Ongelezen berichten",
      waarde: loading ? "—" : String(stats?.ongelezen || 0),
      trend: (stats?.ongelezen || 0) > 0 ? "up" as const : "down" as const,
      icon: MessageCircle,
      beschrijving: "Onbeantwoord",
    },
    {
      titel: "Sessies deze week",
      waarde: loading ? "—" : String(stats?.sessiesDezWeek || 0),
      trend: "up" as const,
      icon: CalendarDays,
      beschrijving: "Gepland",
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* KPI Kaarten */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statKaarten.map((stat) => (
          <Card key={stat.titel} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="size-5 text-primary" />
                </div>
              </div>
              <div className="mt-3">
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold text-foreground">{stat.waarde}</p>
                )}
                <p className="text-xs text-muted-foreground mt-0.5">{stat.beschrijving}</p>
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
              <AreaChart data={complianceData}>
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
              <BarChart data={clientActiviteitData} barGap={4}>
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
                {checkins.filter(c => c.status === "review-nodig").length} review nodig
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
              ) : checkins.length === 0 ? (
                <p className="text-sm text-muted-foreground px-3 py-4">Nog geen check-ins ontvangen</p>
              ) : (
                checkins.map((checkin) => (
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
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {checkin.type === 'weekly' ? 'Wekelijks' : 'Dagelijks'}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{checkin.notitie || 'Geen notitie'}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="size-3" />
                      {formatDistanceToNow(new Date(checkin.tijd), { addSuffix: true, locale: nl })}
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
              ) : sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">Geen sessies gepland</p>
              ) : (
                sessions.map((sessie) => (
                  <div key={sessie.id} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-semibold text-foreground">
                        {new Date(sessie.tijd).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
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
          <p className="text-xs text-muted-foreground">Programma-afronding</p>
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
            ) : progress.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full py-4">Geen actieve programma&apos;s</p>
            ) : (
              progress.map((client) => (
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
