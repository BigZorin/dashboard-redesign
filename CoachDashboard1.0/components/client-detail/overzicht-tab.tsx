"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, CalendarDays, Dumbbell, Apple, Minus, Activity, Moon, Smile, StickyNote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { getClientOverview, type ClientOverviewData } from "@/app/actions/clients"

// ============================================================================
// OVERZICHT TAB — Real Supabase data
// ============================================================================

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

interface OverzichtTabProps {
  clientId?: string
}

export function OverzichtTab({ clientId }: OverzichtTabProps) {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<ClientOverviewData | null>(null)

  useEffect(() => {
    if (!clientId) {
      setLoading(false)
      return
    }
    setLoading(true)
    getClientOverview(clientId).then((result) => {
      if (result.success && result.data) {
        setData(result.data)
      }
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [clientId])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="border-border">
              <CardContent className="p-3 flex flex-col items-center gap-2">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-7 w-10" />
                <Skeleton className="h-3 w-14" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-80 lg:col-span-2" />
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-sm text-muted-foreground">Geen overzichtsdata beschikbaar</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Snelle stats rij */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <span className="text-[11px] text-muted-foreground">Week</span>
            <span className="text-2xl font-bold text-foreground">{data.programmaWeek || "—"}</span>
            <span className="text-[10px] text-muted-foreground">van {data.programmaTotaalWeken}</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1">
              <Dumbbell className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Training</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{data.complianceTraining}%</span>
            <span className={`text-[10px] ${data.complianceTraining >= 80 ? "text-success" : data.complianceTraining >= 60 ? "text-warning-foreground" : "text-destructive"}`}>Compliance</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <div className="flex items-center gap-1">
              <Apple className="size-3 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Voeding</span>
            </div>
            <span className="text-2xl font-bold text-foreground">{data.complianceVoeding}%</span>
            <span className={`text-[10px] ${data.complianceVoeding >= 80 ? "text-success" : data.complianceVoeding >= 60 ? "text-warning-foreground" : "text-destructive"}`}>Compliance</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <span className="text-[11px] text-muted-foreground">Gewicht</span>
            <div className="flex items-center gap-1">
              {data.gewichtsTrend < 0 ? (
                <TrendingDown className="size-3.5 text-success" />
              ) : data.gewichtsTrend > 0 ? (
                <TrendingUp className="size-3.5 text-destructive" />
              ) : (
                <Minus className="size-3.5 text-muted-foreground" />
              )}
              <span className="text-2xl font-bold text-foreground">{data.gewichtsTrend !== 0 ? `${data.gewichtsTrend}kg` : "—"}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">deze week</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Activity className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{data.energieNiveau || "—"}</span>
            <span className="text-[10px] text-muted-foreground">Energie</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Moon className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{data.slaapKwaliteit || "—"}</span>
            <span className="text-[10px] text-muted-foreground">Slaap</span>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="p-3 flex flex-col items-center text-center gap-1">
            <Smile className="size-3 text-muted-foreground" />
            <span className="text-2xl font-bold text-foreground">{data.moodScore || "—"}</span>
            <span className="text-[10px] text-muted-foreground">Mood</span>
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
                <p className="font-semibold text-foreground">{data.programmaNaam}</p>
                {data.programmaBeschrijving && (
                  <p className="text-xs text-muted-foreground">{data.programmaBeschrijving}</p>
                )}
              </div>
              {data.programmaWeek > 0 && (
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Voortgang</span>
                    <span className="font-semibold text-foreground">Week {data.programmaWeek}/{data.programmaTotaalWeken}</span>
                  </div>
                  <Progress value={(data.programmaWeek / data.programmaTotaalWeken) * 100} className="h-2" />
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Trainingen deze week</span>
                <span className="font-semibold text-foreground">{data.voltooidDezeWeek}/{data.trainingsDagen}</span>
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
                  <span className="font-semibold text-foreground">{data.macros.kcal.huidig} / {data.macros.kcal.doel} kcal</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((data.macros.kcal.huidig / data.macros.kcal.doel) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <MacroBar label="Eiwit" huidig={data.macros.eiwit.huidig} doel={data.macros.eiwit.doel} kleur="bg-chart-1" />
              <MacroBar label="Koolhydraten" huidig={data.macros.koolhydraten.huidig} doel={data.macros.koolhydraten.doel} kleur="bg-chart-2" />
              <MacroBar label="Vetten" huidig={data.macros.vetten.huidig} doel={data.macros.vetten.doel} kleur="bg-chart-4" />
            </CardContent>
          </Card>
        </div>

        {/* Kolom 2: Gewichtstrend */}
        <Card className="border-border lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold">Gewichtstrend</CardTitle>
              {data.gewichtsData.length > 0 && (
                <Badge variant="outline" className="text-[10px]">{data.gewichtsData.length} datapunten</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {data.gewichtsData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.gewichtsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
              <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
                Nog geen gewichtsdata beschikbaar
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Onderste rij: Check-in + Sessies + Feedback */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Laatste check-in */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Laatste check-in</CardTitle>
            {data.laatsteCheckin && (
              <p className="text-[11px] text-muted-foreground">{data.laatsteCheckin.datum}</p>
            )}
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {data.laatsteCheckin ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-muted-foreground">Gewicht</span>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        {data.laatsteCheckin.gewicht ? `${data.laatsteCheckin.gewicht} kg` : "—"}
                      </span>
                      {data.laatsteCheckin.verandering !== 0 && (
                        <span className={`text-[11px] ${data.laatsteCheckin.verandering < 0 ? "text-success" : "text-destructive"}`}>
                          {data.laatsteCheckin.verandering > 0 ? "+" : ""}{data.laatsteCheckin.verandering} kg
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-muted-foreground">Energie</span>
                    <span className="text-sm font-semibold text-foreground">{data.laatsteCheckin.energie}/10</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-muted-foreground">Slaap</span>
                    <span className="text-sm font-semibold text-foreground">{data.laatsteCheckin.slaap}/10</span>
                  </div>
                </div>
                {data.laatsteCheckin.opmerkingen && data.laatsteCheckin.opmerkingen !== 'Geen opmerkingen' && (
                  <div className="border-t border-border pt-2">
                    <p className="text-xs text-muted-foreground italic leading-relaxed">
                      {`"${data.laatsteCheckin.opmerkingen}"`}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Nog geen check-ins</p>
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
            {data.komendeSessies.length > 0 ? (
              data.komendeSessies.map((sessie, i) => (
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
              <p className="text-xs text-muted-foreground py-3">Geen geplande sessies</p>
            )}
          </CardContent>
        </Card>

        {/* Recente coach feedback */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <StickyNote className="size-4 text-primary" />
              Recente feedback
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {data.recenteFeedback.length > 0 ? (
              data.recenteFeedback.map((item, i) => (
                <div key={i} className="flex flex-col gap-1 rounded-lg bg-secondary/50 p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] capitalize">{item.categorie}</Badge>
                    <span className="text-[11px] text-muted-foreground">{item.datum}</span>
                  </div>
                  <p className="text-xs text-foreground leading-relaxed">{item.tekst}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground py-3">Nog geen feedback gegeven</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
