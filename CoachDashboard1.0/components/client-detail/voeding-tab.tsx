"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Apple,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Scale,
  Loader2,
  Utensils,
  ScanBarcode,
  AlertCircle,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { cn } from "@/lib/utils"
import {
  getClientNutrition,
  type NutritionDayData,
  type NutritionWeekTrend,
  type FoodLogEntry,
} from "@/app/actions/clients"

// ============================================================================
// VOEDING TAB - Coach view van client voeding (echte Supabase data)
// ============================================================================

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: "Ontbijt",
  LUNCH: "Lunch",
  DINNER: "Diner",
  SNACK: "Snack",
}

const MEAL_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"]

function formatDatum(datum: Date): string {
  return datum.toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })
}

// Compacte macro bar
function MacroBar({ label, gelogd, doel, kleur }: { label: string; gelogd: number; doel: number; kleur: string }) {
  const pct = doel > 0 ? Math.min(Math.round((gelogd / doel) * 100), 120) : 0
  const isOver = gelogd > doel && doel > 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] text-muted-foreground w-14 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", kleur, isOver && "bg-warning")} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className={cn("text-xs font-mono w-20 text-right", isOver ? "text-warning" : "text-foreground")}>
        {gelogd} / {doel > 0 ? doel : "—"}
      </span>
    </div>
  )
}

// Maaltijd section
function MaaltijdSection({ mealType, items }: { mealType: string; items: FoodLogEntry[] }) {
  const [open, setOpen] = useState(false)
  const label = MEAL_LABELS[mealType] || mealType
  const totalKcal = items.reduce((s, i) => s + i.calories, 0)
  const totalProtein = items.reduce((s, i) => s + i.proteinGrams, 0)

  return (
    <div className="border-l-2 border-border pl-4 pb-4 last:pb-0 relative">
      {/* Timeline dot */}
      <div className={cn(
        "absolute -left-[5px] top-0 size-2 rounded-full",
        items.length > 0 ? "bg-success" : "bg-muted-foreground"
      )} />

      {/* Header row */}
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between group">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {items.length === 0 && (
            <Badge variant="outline" className="text-[9px] h-4 text-muted-foreground">Niet gelogd</Badge>
          )}
          {items.length > 0 && (
            <Badge variant="secondary" className="text-[9px] h-4">{items.length} items</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <>
              <span className="text-sm font-semibold text-foreground">{totalKcal} kcal</span>
              <span className="text-xs text-muted-foreground">{totalProtein}g eiwit</span>
            </>
          )}
          {items.length > 0 && (
            open ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {open && items.length > 0 && (
        <div className="mt-2 bg-secondary/30 rounded-lg p-3">
          <div className="space-y-1.5">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-xs">
                {item.source === "barcode" && <ScanBarcode className="size-3 text-primary shrink-0" />}
                <span className="flex-1 truncate text-foreground">{item.foodName}</span>
                {item.servingSize && item.servingUnit && (
                  <span className="text-muted-foreground text-[10px]">
                    {item.numberOfServings && item.numberOfServings > 1 ? `${item.numberOfServings}x ` : ""}
                    {item.servingSize}{item.servingUnit}
                  </span>
                )}
                <span className="text-muted-foreground font-mono text-[10px] w-12 text-right">{item.calories} kcal</span>
                <span className="text-muted-foreground font-mono text-[10px] w-10 text-right">{item.proteinGrams}g</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ==== HOOFD COMPONENT ====

interface VoedingTabProps {
  clientId: string
}

export function VoedingTab({ clientId }: VoedingTabProps) {
  const [datum, setDatum] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [dayData, setDayData] = useState<NutritionDayData | null>(null)
  const [weekTrend, setWeekTrend] = useState<NutritionWeekTrend[]>([])

  const isVandaag = datum.toDateString() === new Date().toDateString()
  const dateStr = datum.toISOString().split("T")[0]

  const fetchData = useCallback(async (date: string) => {
    setLoading(true)
    const res = await getClientNutrition(clientId, date)
    if (res.success) {
      setDayData(res.data || null)
      setWeekTrend(res.weekTrend || [])
    }
    setLoading(false)
  }, [clientId])

  useEffect(() => {
    fetchData(dateStr)
  }, [dateStr, fetchData])

  const navigateDate = (offset: number) => {
    setDatum((d) => {
      const n = new Date(d)
      n.setDate(n.getDate() + offset)
      return n
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const totals = dayData?.totals || { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const target = dayData?.target
  const mealBreakdown = dayData?.mealBreakdown || {}
  const hasData = dayData && dayData.foodLogs.length > 0

  // Sort meals in standard order
  const sortedMeals = MEAL_ORDER.filter((mt) => mealBreakdown[mt])
  // Add any extra meal types not in standard order
  const extraMeals = Object.keys(mealBreakdown).filter((mt) => !MEAL_ORDER.includes(mt))
  const allMeals = [...sortedMeals, ...extraMeals]

  // Meals without any logs
  const emptyMeals = MEAL_ORDER.filter((mt) => !mealBreakdown[mt])

  return (
    <div className="p-6">
      {/* Header with date navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-card border border-border rounded-lg">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigateDate(-1)}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-3 text-sm font-medium min-w-[120px] text-center">
              {isVandaag ? "Vandaag" : formatDatum(datum)}
            </span>
            <Button variant="ghost" size="icon" className="size-8" onClick={() => navigateDate(1)} disabled={isVandaag}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {isVandaag && <div className="size-2 rounded-full bg-success animate-pulse" />}
        </div>
      </div>

      {!hasData && !loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Utensils className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">Geen voeding gelogd</p>
          <p className="text-xs text-muted-foreground mt-1">
            Er zijn geen food logs voor {isVandaag ? "vandaag" : formatDatum(datum)}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* LINKER KOLOM: Metrics (2/5) */}
          <div className="lg:col-span-2 space-y-5">
            {/* Dag totaal */}
            <Card className={cn("border-primary/20", !target && "border-border")}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{totals.calories}</p>
                    <p className="text-xs text-muted-foreground">
                      {target ? `van ${target.calories} kcal doel` : "kcal gelogd"}
                    </p>
                  </div>
                  {target && target.calories > 0 && (
                    <div className="text-right">
                      <p className={cn(
                        "text-lg font-bold",
                        Math.abs(totals.calories - target.calories) <= target.calories * 0.1
                          ? "text-success"
                          : "text-warning"
                      )}>
                        {Math.round((totals.calories / target.calories) * 100)}%
                      </p>
                      <p className="text-[10px] text-muted-foreground">compliance</p>
                    </div>
                  )}
                </div>
                {target && target.calories > 0 && (
                  <Progress value={Math.min((totals.calories / target.calories) * 100, 100)} className="h-2" />
                )}
              </CardContent>
            </Card>

            {/* Macro bars */}
            <Card>
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Apple className="size-4 text-primary" />
                  {"Macro's"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <MacroBar label="Eiwit" gelogd={totals.protein} doel={target?.protein || 0} kleur="bg-chart-1" />
                <MacroBar label="Koolh." gelogd={totals.carbs} doel={target?.carbs || 0} kleur="bg-chart-2" />
                <MacroBar label="Vetten" gelogd={totals.fat} doel={target?.fat || 0} kleur="bg-chart-4" />
              </CardContent>
            </Card>

            {/* Macro details per maaltijd */}
            {allMeals.length > 1 && (
              <Card>
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Scale className="size-4 text-muted-foreground" />
                    Per maaltijd
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {allMeals.map((mt) => {
                      const meal = mealBreakdown[mt]
                      if (!meal) return null
                      return (
                        <div key={mt} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground w-16">{MEAL_LABELS[mt] || mt}</span>
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-foreground w-14 text-right">{meal.calories} kcal</span>
                            <span className="text-muted-foreground w-10 text-right">{meal.protein}g E</span>
                            <span className="text-muted-foreground w-10 text-right">{meal.carbs}g K</span>
                            <span className="text-muted-foreground w-10 text-right">{meal.fat}g V</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* RECHTER KOLOM: Maaltijden + trend (3/5) */}
          <div className="lg:col-span-3 space-y-5">
            {/* Maaltijden timeline */}
            <Card>
              <CardHeader className="p-4 pb-3 border-b border-border">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Utensils className="size-4 text-chart-2" />
                  Maaltijden
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-0">
                  {allMeals.map((mt) => (
                    <MaaltijdSection key={mt} mealType={mt} items={mealBreakdown[mt]?.items || []} />
                  ))}
                  {/* Show empty meals */}
                  {emptyMeals.map((mt) => (
                    <MaaltijdSection key={mt} mealType={mt} items={[]} />
                  ))}
                </div>

                {/* Warning for missing meals */}
                {emptyMeals.length > 0 && allMeals.length > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20 flex items-start gap-2">
                    <AlertCircle className="size-4 text-warning shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium text-warning">Niet volledig gelogd</p>
                      <p className="text-[11px] text-muted-foreground">
                        {emptyMeals.map((mt) => MEAL_LABELS[mt]).join(", ")} nog niet ingevuld
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Week trend */}
            {weekTrend.length > 0 && weekTrend.some((d) => d.calories > 0) && (
              <Card>
                <CardHeader className="p-4 pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="size-4 text-primary" />
                      Week trend
                    </span>
                    {target && (
                      <div className="flex items-center gap-3 text-[10px]">
                        <span className="flex items-center gap-1">
                          <span className="size-2 rounded-full bg-[#22c55e]" /> Op target
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="size-2 rounded-full bg-[#f97316]" /> Afwijking
                        </span>
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weekTrend} barGap={6}>
                        <XAxis dataKey="dayLabel" tick={{ fontSize: 10, fill: "#888" }} tickLine={false} axisLine={false} />
                        <YAxis hide domain={[0, "auto"]} />
                        <Tooltip
                          cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
                          position={{ y: -10 }}
                          wrapperStyle={{ zIndex: 100 }}
                          contentStyle={{
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #333",
                            borderRadius: "8px",
                            fontSize: "11px",
                            color: "#fff",
                            padding: "8px 12px",
                          }}
                          itemStyle={{ color: "#fff" }}
                          labelStyle={{ color: "#fff", fontWeight: 600, marginBottom: "4px" }}
                          formatter={(v: number, n: string) => [
                            `${v} kcal`,
                            n === "targetCalories" ? "Doel" : "Gelogd",
                          ]}
                        />
                        {target && (
                          <Bar dataKey="targetCalories" fill="#e5e5e5" opacity={0.4} radius={[4, 4, 0, 0]} />
                        )}
                        <Bar dataKey="calories" radius={[4, 4, 0, 0]}>
                          {weekTrend.map((e, i) => {
                            if (e.calories === 0) return <Cell key={i} fill="#333" />
                            if (!target || target.calories === 0) return <Cell key={i} fill="#22c55e" />
                            const pct = (e.calories / e.targetCalories) * 100
                            const isOnTarget = pct >= 90 && pct <= 110
                            return <Cell key={i} fill={isOnTarget ? "#22c55e" : "#f97316"} />
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  {/* Percentage labels */}
                  {target && target.calories > 0 && (
                    <div className="flex justify-between mt-1 px-2">
                      {weekTrend.map((e, i) => {
                        if (e.calories === 0) return <span key={i} className="text-[9px] text-muted-foreground w-8 text-center">—</span>
                        const pct = Math.round((e.calories / e.targetCalories) * 100)
                        const isOnTarget = pct >= 90 && pct <= 110
                        return (
                          <span key={i} className={cn(
                            "text-[9px] font-medium w-8 text-center",
                            isOnTarget ? "text-[#22c55e]" : "text-[#f97316]"
                          )}>
                            {pct}%
                          </span>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
