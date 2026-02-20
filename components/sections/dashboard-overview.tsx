"use client"

import { Users, TrendingUp, MessageCircle, CalendarDays, ArrowUpRight, ArrowDownRight, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte data uit je database/API
// ============================================================================

/** Omzetdata per maand voor de omzetgrafiek */
const omzetData = [
  { maand: "Sep", omzet: 3200 },
  { maand: "Okt", omzet: 3800 },
  { maand: "Nov", omzet: 4100 },
  { maand: "Dec", omzet: 3900 },
  { maand: "Jan", omzet: 4600 },
  { maand: "Feb", omzet: 5200 },
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
const statKaarten = [
  {
    titel: "Actieve cliënten",
    waarde: "48",
    verandering: "+4",
    trend: "up" as const,
    icon: Users,
    beschrijving: "t.o.v. vorige maand",
  },
  {
    titel: "Maandomzet",
    waarde: "\u20AC5.240",
    verandering: "+12,5%",
    trend: "up" as const,
    icon: TrendingUp,
    beschrijving: "t.o.v. vorige maand",
  },
  {
    titel: "Ongelezen berichten",
    waarde: "5",
    verandering: "-3",
    trend: "down" as const,
    icon: MessageCircle,
    beschrijving: "t.o.v. gisteren",
  },
  {
    titel: "Sessies deze week",
    waarde: "12",
    verandering: "+2",
    trend: "up" as const,
    icon: CalendarDays,
    beschrijving: "t.o.v. vorige week",
  },
]

/** Recente check-ins van cliënten */
const recenteCheckins = [
  { naam: "Sarah van Dijk", initialen: "SD", tijd: "10 min geleden", status: "afgerond", notitie: "Voelt zich sterk, nieuw PR behaald" },
  { naam: "Tom Bakker", initialen: "TB", tijd: "32 min geleden", status: "review-nodig", notitie: "Moeite met schoudermobiliteit" },
  { naam: "Lisa de Vries", initialen: "LV", tijd: "1 uur geleden", status: "afgerond", notitie: "Voeding op schema, gewicht daalt" },
  { naam: "James Peters", initialen: "JP", tijd: "2 uur geleden", status: "review-nodig", notitie: "2 workouts gemist deze week" },
  { naam: "Emma Jansen", initialen: "EJ", tijd: "3 uur geleden", status: "afgerond", notitie: "Goede vooruitgang op uithoudingsvermogen" },
]

/** Aankomende sessies vandaag */
const aankomendeSessies = [
  { naam: "Sarah van Dijk", initialen: "SD", tijd: "10:00", type: "Check-in gesprek" },
  { naam: "Tom Bakker", initialen: "TB", tijd: "11:30", type: "Programma review" },
  { naam: "Groepssessie", initialen: "GS", tijd: "14:00", type: "HIIT les" },
  { naam: "Lisa de Vries", initialen: "LV", tijd: "16:00", type: "Voedingsreview" },
]

/** Voortgang snapshot per cliënt */
const clientVoortgang = [
  { naam: "Sarah van Dijk", initialen: "SD", voortgang: 85, programma: "Kracht Fase 2" },
  { naam: "Tom Bakker", initialen: "TB", voortgang: 62, programma: "Afvallen 12 weken" },
  { naam: "Lisa de Vries", initialen: "LV", voortgang: 94, programma: "Wedstrijd Prep" },
  { naam: "James Peters", initialen: "JP", voortgang: 41, programma: "Spiermassa Basis" },
]

export function DashboardOverview() {
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
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === "up" ? "text-success" : "text-muted-foreground"
                }`}>
                  {stat.trend === "up" ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {stat.verandering}
                </div>
              </div>
              <div className="mt-3">
                <p className="text-2xl font-bold text-foreground">{stat.waarde}</p>
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
            <CardTitle className="text-sm font-semibold text-foreground">Omzet overzicht</CardTitle>
            <p className="text-xs text-muted-foreground">Maandelijkse omzettrend</p>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={omzetData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="omzet" stroke="oklch(0.55 0.15 160)" strokeWidth={2} fill="url(#revenueGradient)" />
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
                {recenteCheckins.filter(c => c.status === "review-nodig").length} review nodig
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex flex-col gap-1">
              {recenteCheckins.map((checkin) => (
                <div
                  key={checkin.naam}
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
              ))}
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
              {aankomendeSessies.map((sessie, i) => (
                <div key={i} className="flex items-center gap-3">
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
              ))}
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
            {clientVoortgang.map((client) => (
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
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
