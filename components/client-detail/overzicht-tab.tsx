"use client"

import { TrendingUp, TrendingDown, CalendarDays, Dumbbell, Apple, Minus, Activity, Moon, Droplets, StickyNote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type {
  ClientOverviewStats,
  GewichtsDataPunt,
  ProgrammaDetails,
  MacroTargets,
  LaatstCheckinDetails,
  KomendeSessie,
  RecenteNotitie,
} from "@/app/actions/client-detail"

interface OverzichtTabProps {
  overviewStats: ClientOverviewStats | null
  gewichtsData: GewichtsDataPunt[]
  programmaDetails?: ProgrammaDetails
  macroTargets?: MacroTargets
  laatsteCheckinDetails?: LaatstCheckinDetails
  komendeSessies: KomendeSessie[]
  recenteNotities: RecenteNotitie[]
}

function MacroBar({ label, huidig, doel, kleur }: { label: string; huidig: number; doel: number; kleur: string }) {
  const percentage = doel > 0 ? Math.min(Math.round((huidig / doel) * 100), 100) : 0
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

export function OverzichtTab({
  overviewStats,
  gewichtsData,
  programmaDetails,
  macroTargets,
  laatsteCheckinDetails,
  komendeSessies,
  recenteNotities,
}: OverzichtTabProps) {
  const stats = overviewStats
  const gewichtsTrend = stats?.gewichtsTrend ?? null

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Snelle stats rij */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <span className="text-[11px] text-muted-foreground">Week</span>
            <span className="text-2xl font-bold text-foreground">{stats?.huidigeWeek || "--"}</span>
            <span className="text-[10px] text-muted-foreground">van {stats?.totaalWeken || "--"}</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1">
              <Dumbbell className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Training</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{stats?.complianceTraining || 0}%</span>
            <span className={`text-[10px] ${(stats?.complianceTraining || 0) >= 80 ? "text-success" : "text-warning-foreground"}`}>Compliance</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1">
              <Apple className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Voeding</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{stats?.complianceVoeding || 0}%</span>
            <span className={`text-[10px] ${(stats?.complianceVoeding || 0) >= 80 ? "text-success" : "text-warning-foreground"}`}>Compliance</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <span className="text-[11px] text-muted-foreground">Gewicht</span>
            <div className="flex items-center gap-1">
              {gewichtsTrend !== null && gewichtsTrend !== 0 ? (
                gewichtsTrend < 0 ? (
                  <TrendingDown className="size-3.5 text-success" />
                ) : (
                  <TrendingUp className="size-3.5 text-destructive" />
                )
              ) : (
                <Minus className="size-3.5 text-muted-foreground" />
              )}
              <span className="text-2xl font-bold text-foreground">
                {gewichtsTrend !== null ? `${gewichtsTrend > 0 ? "+" : ""}${gewichtsTrend}kg` : "--"}
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground">deze week</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Activity className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{stats?.energieNiveau != null ? `${stats.energieNiveau}/5` : "--"}</span>
            <span className="text-[10px] text-muted-foreground">Energie</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Moon className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{stats?.slaapKwaliteit != null ? `${stats.slaapKwaliteit}/5` : "--"}</span>
            <span className="text-[10px] text-muted-foreground">Slaap</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Droplets className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{"--"}</span>
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
              {programmaDetails ? (
                <>
                  <div>
                    <p className="font-semibold text-foreground">{programmaDetails.naam}</p>
                    {programmaDetails.beschrijving && (
                      <p className="text-xs text-muted-foreground">{programmaDetails.beschrijving}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Voortgang</span>
                      <span className="font-semibold text-foreground">Week {programmaDetails.week}/{programmaDetails.totaalWeken}</span>
                    </div>
                    <Progress value={programmaDetails.totaalWeken > 0 ? (programmaDetails.week / programmaDetails.totaalWeken) * 100 : 0} className="h-2" />
                  </div>
                  {programmaDetails.trainingsDagen > 0 && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Trainingen deze week</span>
                      <span className="font-semibold text-foreground">{programmaDetails.voltooidDezeWeek}/{programmaDetails.trainingsDagen}</span>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Geen actief programma</p>
              )}
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
              {macroTargets ? (
                <>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Calorieën</span>
                      <span className="font-semibold text-foreground">{macroTargets.kcal.huidig} / {macroTargets.kcal.doel} kcal</span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${macroTargets.kcal.doel > 0 ? Math.min((macroTargets.kcal.huidig / macroTargets.kcal.doel) * 100, 100) : 0}%` }}
                      />
                    </div>
                  </div>
                  <MacroBar label="Eiwit" huidig={macroTargets.eiwit.huidig} doel={macroTargets.eiwit.doel} kleur="bg-chart-1" />
                  <MacroBar label="Koolhydraten" huidig={macroTargets.koolhydraten.huidig} doel={macroTargets.koolhydraten.doel} kleur="bg-chart-2" />
                  <MacroBar label="Vetten" huidig={macroTargets.vetten.huidig} doel={macroTargets.vetten.doel} kleur="bg-chart-4" />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Geen voedingsdoelen ingesteld</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Gewichtstrend */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Gewichtstrend</CardTitle>
              <Badge variant="outline" className="text-[10px]">
                {gewichtsData.length > 0 ? `${gewichtsData.length} metingen` : "Geen data"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {gewichtsData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
                Nog geen gewichtsdata beschikbaar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onderste rij: Check-in + Sessies + Notities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Laatste check-in */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Laatste check-in</CardTitle>
            <p className="text-[11px] text-muted-foreground">
              {laatsteCheckinDetails?.datum || "Geen check-in"}
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {laatsteCheckinDetails ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-muted-foreground">Gewicht</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        {laatsteCheckinDetails.gewicht != null ? `${laatsteCheckinDetails.gewicht} kg` : "--"}
                      </span>
                      {laatsteCheckinDetails.verandering != null && laatsteCheckinDetails.verandering !== 0 && (
                        <span className={`text-[11px] ${laatsteCheckinDetails.verandering < 0 ? "text-success" : "text-destructive"}`}>
                          {laatsteCheckinDetails.verandering > 0 ? "+" : ""}{laatsteCheckinDetails.verandering} kg
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-muted-foreground">Energie</span>
                    <span className="text-sm font-semibold text-foreground">
                      {laatsteCheckinDetails.energie != null ? `${laatsteCheckinDetails.energie}/5` : "--"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-muted-foreground">Slaap</span>
                    <span className="text-sm font-semibold text-foreground">
                      {laatsteCheckinDetails.slaap != null ? `${laatsteCheckinDetails.slaap}/5` : "--"}
                    </span>
                  </div>
                </div>
                {laatsteCheckinDetails.opmerkingen && (
                  <div className="border-t border-border pt-2">
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      {`"${laatsteCheckinDetails.opmerkingen}"`}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Nog geen check-in ontvangen</p>
            )}
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
            {komendeSessies.length > 0 ? (
              komendeSessies.map((sessie, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 p-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">{sessie.type}</span>
                    <span className="text-[11px] text-muted-foreground">{sessie.datum} om {sessie.tijd}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] border-primary/30 text-primary capitalize">
                    {sessie.status}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Geen komende sessies</p>
            )}
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
            {recenteNotities.length > 0 ? (
              recenteNotities.map((notitie, i) => (
                <div key={i} className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] capitalize">{notitie.categorie}</Badge>
                    <span className="text-[11px] text-muted-foreground">{notitie.datum}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{notitie.tekst}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Geen recente notities</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
