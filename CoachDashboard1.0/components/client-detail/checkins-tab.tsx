"use client"

import { useState, useEffect, useCallback } from "react"
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Send,
  AlertTriangle,
  ClipboardList,
  Loader2,
  Dumbbell,
  Utensils,
  Calendar,
  Sparkles,
  RefreshCw,
  Moon,
  Smile,
  Weight,
  Check,
  X,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import {
  getClientWeeklyCheckIns,
  getWeekSummary,
  submitCheckInFeedback,
  type WeeklyCheckIn,
  type WeekSummary,
} from "@/app/actions/clients"
import { generateWeeklyAiSummary } from "@/app/actions/ai-coach"

const FEELING_LABELS: Record<number, string> = { 1: "Slecht", 2: "Matig", 3: "Oké", 4: "Goed", 5: "Uitstekend" }
const MOOD_LABELS: Record<number, string> = { 1: "Slecht", 2: "Matig", 3: "Oké", 4: "Goed", 5: "Top" }
const SLEEP_LABELS: Record<number, string> = { 1: "Slecht", 2: "Matig", 3: "Oké", 4: "Goed", 5: "Diep" }

function ScoreBalk({ waarde, max = 5 }: { waarde: number; max?: number }) {
  const percentage = (waarde / max) * 100
  const kleur = waarde >= 4 ? "bg-success" : waarde >= 3 ? "bg-warning" : "bg-destructive"
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full ${kleur}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs font-medium text-foreground">{waarde}/{max}</span>
    </div>
  )
}

function MacroBar({ label, value, target, unit = "g" }: { label: string; value: number; target: number; unit?: string }) {
  const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0
  const isOver = value > target && target > 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-medium", isOver ? "text-destructive" : "text-foreground")}>
          {value}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
        <div
          className={cn("h-full rounded-full", isOver ? "bg-destructive" : percentage >= 80 ? "bg-success" : "bg-primary/60")}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

interface CheckinsTabProps {
  clientId: string
}

export function CheckinsTab({ clientId }: CheckinsTabProps) {
  const [checkins, setCheckins] = useState<WeeklyCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [feedbackSending, setFeedbackSending] = useState<string | null>(null)

  // Expandable state
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set())
  const [weekSummaries, setWeekSummaries] = useState<Record<string, WeekSummary>>({})
  const [loadingWeeks, setLoadingWeeks] = useState<Set<string>>(new Set())
  const [generatingAi, setGeneratingAi] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return
    setLoading(true)
    getClientWeeklyCheckIns(clientId).then((res) => {
      if (res.success && res.checkIns) {
        setCheckins(res.checkIns)
      }
      setLoading(false)
    })
  }, [clientId])

  const handleToggleWeek = useCallback(async (ci: WeeklyCheckIn) => {
    const key = `${ci.year}-${ci.week_number}`
    setExpandedWeeks((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })

    // Lazy load summary if not cached
    if (!weekSummaries[key] && !loadingWeeks.has(key)) {
      setLoadingWeeks((prev) => new Set(prev).add(key))
      const res = await getWeekSummary(clientId, ci.week_number, ci.year)
      if (res.success && res.summary) {
        setWeekSummaries((prev) => ({ ...prev, [key]: res.summary! }))
      }
      setLoadingWeeks((prev) => {
        const next = new Set(prev)
        next.delete(key)
        return next
      })
    }
  }, [clientId, weekSummaries, loadingWeeks])

  const handleGenerateAi = useCallback(async (ci: WeeklyCheckIn) => {
    const key = `${ci.year}-${ci.week_number}`
    const summary = weekSummaries[key]
    if (!summary) return

    setGeneratingAi(key)
    const res = await generateWeeklyAiSummary(clientId, ci.week_number, ci.year, summary, ci)
    if (res.success && res.summary) {
      setWeekSummaries((prev) => ({
        ...prev,
        [key]: { ...prev[key], aiSummary: res.summary! },
      }))
    }
    setGeneratingAi(null)
  }, [clientId, weekSummaries])

  const handleFeedback = async (checkInId: string) => {
    const text = feedbackText[checkInId]
    if (!text?.trim()) return
    setFeedbackSending(checkInId)
    const result = await submitCheckInFeedback(checkInId, "weekly", text.trim())
    if (result.success) {
      setFeedbackText((prev) => ({ ...prev, [checkInId]: "" }))
      const res = await getClientWeeklyCheckIns(clientId)
      if (res.success && res.checkIns) setCheckins(res.checkIns)
    }
    setFeedbackSending(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (checkins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <ClipboardList className="size-10 text-muted-foreground mb-3" />
        <p className="text-sm font-medium text-foreground">Nog geen wekelijkse check-ins</p>
        <p className="text-xs text-muted-foreground mt-1">Check-ins verschijnen hier zodra de cliënt ze invult</p>
      </div>
    )
  }

  // Weight trend between consecutive check-ins
  const checkinsWithTrend = checkins.map((ci, i) => {
    const prev = checkins[i + 1]
    const gewichtVerandering = ci.weight && prev?.weight
      ? Number((ci.weight - prev.weight).toFixed(1))
      : 0
    return { ...ci, gewichtVerandering }
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Wekelijkse check-ins</h3>
        <p className="text-xs text-muted-foreground">{checkins.length} check-ins vastgelegd — klik om uit te klappen</p>
      </div>

      {/* Timeline */}
      <div className="relative flex flex-col gap-0">
        <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

        {checkinsWithTrend.map((ci) => {
          const key = `${ci.year}-${ci.week_number}`
          const isExpanded = expandedWeeks.has(key)
          const isLoadingWeek = loadingWeeks.has(key)
          const summary = weekSummaries[key]

          return (
            <div key={ci.id} className="relative flex gap-4 pb-6">
              {/* Timeline dot */}
              <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-card">
                <span className="text-[11px] font-bold text-primary">W{ci.week_number}</span>
              </div>

              <Card className="flex-1 border-border">
                <Collapsible open={isExpanded} onOpenChange={() => handleToggleWeek(ci)}>
                  {/* Compact header — always visible */}
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between px-4 py-3 hover:bg-secondary/20 transition-colors cursor-pointer">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="text-base font-semibold text-foreground text-left">Week {ci.week_number}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(ci.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>

                        {/* Weight + trend */}
                        {ci.weight && (
                          <div className="flex items-center gap-1.5 pl-4 border-l border-border">
                            <Weight className="size-3.5 text-muted-foreground" />
                            <span className="text-sm font-bold text-foreground">{ci.weight} kg</span>
                            {ci.gewichtVerandering !== 0 && (
                              <div className={cn(
                                "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium",
                                ci.gewichtVerandering <= 0
                                  ? "bg-success/10 text-success"
                                  : "bg-destructive/10 text-destructive"
                              )}>
                                {ci.gewichtVerandering < 0 ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                                {ci.gewichtVerandering > 0 ? "+" : ""}{ci.gewichtVerandering}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {ci.feeling && (
                          <Badge variant="outline" className="text-[10px]">
                            {FEELING_LABELS[ci.feeling] || `${ci.feeling}/5`}
                          </Badge>
                        )}
                        {ci.has_pain && (
                          <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive gap-1">
                            <AlertTriangle className="size-3" />
                            Pijn
                          </Badge>
                        )}
                        {summary?.aiSummary && (
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary gap-1">
                            <Sparkles className="size-3" />
                            AI
                          </Badge>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </CollapsibleTrigger>

                  {/* Expandable content */}
                  <CollapsibleContent>
                    {isLoadingWeek ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-xs text-muted-foreground">Weekdata laden...</span>
                      </div>
                    ) : (
                      <CardContent className="px-4 pb-4 pt-0 border-t border-border">
                        {/* AI Summary Section */}
                        <div className="mt-4 mb-4">
                          {summary?.aiSummary ? (
                            <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Sparkles className="size-4 text-primary" />
                                  <span className="text-sm font-semibold text-primary">AI Weekrapport</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs gap-1 text-muted-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleGenerateAi(ci)
                                  }}
                                  disabled={generatingAi === key}
                                >
                                  {generatingAi === key ? (
                                    <Loader2 className="size-3 animate-spin" />
                                  ) : (
                                    <RefreshCw className="size-3" />
                                  )}
                                  Regenereer
                                </Button>
                              </div>
                              <div className="text-xs text-foreground leading-relaxed whitespace-pre-wrap prose prose-sm max-w-none [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h2]:text-foreground [&_ul]:mt-1 [&_li]:mt-0.5">
                                {summary.aiSummary}
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleGenerateAi(ci)
                              }}
                              disabled={generatingAi === key || !summary}
                            >
                              {generatingAi === key ? (
                                <>
                                  <Loader2 className="size-4 animate-spin" />
                                  AI rapport genereren...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="size-4" />
                                  Genereer AI Weekrapport
                                </>
                              )}
                            </Button>
                          )}
                        </div>

                        {/* 2-Column Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {/* Left: Check-in scores + Training */}
                          <div className="space-y-4">
                            {/* Check-in scores */}
                            <div className="border border-border rounded-lg p-3">
                              <p className="text-xs font-semibold text-foreground mb-3">Check-in scores</p>
                              <div className="space-y-2">
                                {ci.energy_level && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground w-14">Energie</span>
                                    <ScoreBalk waarde={ci.energy_level} />
                                  </div>
                                )}
                                {ci.sleep_quality && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground w-14">Slaap</span>
                                    <ScoreBalk waarde={ci.sleep_quality} />
                                  </div>
                                )}
                                {ci.stress_level && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground w-14">Stress</span>
                                    <ScoreBalk waarde={ci.stress_level} />
                                  </div>
                                )}
                                {ci.motivation && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-muted-foreground w-14">Motivatie</span>
                                    <ScoreBalk waarde={ci.motivation} />
                                  </div>
                                )}
                              </div>

                              {/* Pain alert */}
                              {ci.has_pain && ci.pain_location && (
                                <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-2.5 mt-3">
                                  <p className="text-xs text-destructive font-semibold mb-0.5">Pijn / ongemak</p>
                                  <p className="text-xs text-foreground">
                                    {ci.pain_location}
                                    {ci.pain_severity ? ` (ernst: ${ci.pain_severity}/5)` : ""}
                                  </p>
                                </div>
                              )}

                              {/* Notes */}
                              {ci.notes && (
                                <div className="flex gap-2 items-start mt-3">
                                  <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                                  <p className="text-xs text-muted-foreground leading-relaxed italic">{`"${ci.notes}"`}</p>
                                </div>
                              )}

                              {/* Coach feedback */}
                              {ci.coach_feedback && (
                                <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 mt-3">
                                  <p className="text-[10px] text-primary font-semibold mb-0.5">Jouw feedback</p>
                                  <p className="text-xs text-foreground">{ci.coach_feedback}</p>
                                </div>
                              )}

                              {/* Feedback input */}
                              <div className="flex gap-2 mt-3">
                                <input
                                  type="text"
                                  placeholder="Feedback..."
                                  value={feedbackText[ci.id] || ""}
                                  onChange={(e) => setFeedbackText((prev) => ({ ...prev, [ci.id]: e.target.value }))}
                                  onKeyDown={(e) => e.key === "Enter" && handleFeedback(ci.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleFeedback(ci.id)
                                  }}
                                  disabled={!feedbackText[ci.id]?.trim() || feedbackSending === ci.id}
                                  className="px-3"
                                >
                                  {feedbackSending === ci.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                                </Button>
                              </div>
                            </div>

                            {/* Training section */}
                            {summary && (
                              <div className="border border-border rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Dumbbell className="size-4 text-muted-foreground" />
                                  <p className="text-xs font-semibold text-foreground">Training</p>
                                  <Badge variant="secondary" className="text-[10px] ml-auto">
                                    {summary.workouts.completed}/{summary.workouts.scheduled}
                                  </Badge>
                                </div>
                                {summary.workouts.details.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {summary.workouts.details.map((w, i) => (
                                      <div key={i} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                          {w.completed ? (
                                            <Check className="size-3.5 text-success" />
                                          ) : (
                                            <X className="size-3.5 text-destructive" />
                                          )}
                                          <span className="text-foreground">{w.name}</span>
                                        </div>
                                        <span className="text-muted-foreground">
                                          {new Date(w.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" })}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">Geen trainingen ingepland</p>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Right: Nutrition + Daily check-ins */}
                          <div className="space-y-4">
                            {/* Nutrition section */}
                            {summary && (
                              <div className="border border-border rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Utensils className="size-4 text-muted-foreground" />
                                  <p className="text-xs font-semibold text-foreground">Voeding</p>
                                  <Badge variant="secondary" className="text-[10px] ml-auto">
                                    {summary.nutrition.daysLogged}/7 dagen
                                  </Badge>
                                </div>
                                {summary.nutrition.daysLogged > 0 ? (
                                  <div className="space-y-2">
                                    {summary.nutrition.target ? (
                                      <>
                                        <MacroBar
                                          label="Calorieën"
                                          value={summary.nutrition.dailyAvg.calories}
                                          target={summary.nutrition.target.calories}
                                          unit=" kcal"
                                        />
                                        <MacroBar
                                          label="Eiwit"
                                          value={summary.nutrition.dailyAvg.protein}
                                          target={summary.nutrition.target.protein}
                                        />
                                        <MacroBar
                                          label="Koolhydraten"
                                          value={summary.nutrition.dailyAvg.carbs}
                                          target={summary.nutrition.target.carbs}
                                        />
                                        <MacroBar
                                          label="Vetten"
                                          value={summary.nutrition.dailyAvg.fat}
                                          target={summary.nutrition.target.fat}
                                        />
                                      </>
                                    ) : (
                                      <div className="text-xs text-muted-foreground">
                                        <p>Gem. per dag: {summary.nutrition.dailyAvg.calories} kcal, {summary.nutrition.dailyAvg.protein}g eiwit</p>
                                        <p className="italic mt-1">Geen doelen ingesteld</p>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">Geen voeding gelogd</p>
                                )}
                              </div>
                            )}

                            {/* Daily check-ins section */}
                            {summary && (
                              <div className="border border-border rounded-lg p-3">
                                <div className="flex items-center gap-2 mb-3">
                                  <Calendar className="size-4 text-muted-foreground" />
                                  <p className="text-xs font-semibold text-foreground">Dagelijkse check-ins</p>
                                  <Badge variant="secondary" className="text-[10px] ml-auto">
                                    {summary.dailyCheckIns.length} dagen
                                  </Badge>
                                </div>
                                {summary.dailyCheckIns.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-border">
                                          <th className="text-left py-1.5 text-muted-foreground font-medium">Dag</th>
                                          <th className="text-center py-1.5 text-muted-foreground font-medium">Gewicht</th>
                                          <th className="text-center py-1.5 text-muted-foreground font-medium">Stemming</th>
                                          <th className="text-center py-1.5 text-muted-foreground font-medium">Slaap</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {summary.dailyCheckIns.map((d) => (
                                          <tr key={d.date} className="border-b border-border/50 last:border-0">
                                            <td className="py-1.5 text-foreground">
                                              {new Date(d.date).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric" })}
                                            </td>
                                            <td className="text-center py-1.5">
                                              {d.weight ? (
                                                <span className="font-medium text-foreground">{d.weight}</span>
                                              ) : (
                                                <span className="text-muted-foreground">—</span>
                                              )}
                                            </td>
                                            <td className="text-center py-1.5">
                                              {d.mood ? (
                                                <span className="text-foreground">{MOOD_LABELS[d.mood] || d.mood}</span>
                                              ) : (
                                                <span className="text-muted-foreground">—</span>
                                              )}
                                            </td>
                                            <td className="text-center py-1.5">
                                              {d.sleepQuality ? (
                                                <span className="text-foreground">{SLEEP_LABELS[d.sleepQuality] || d.sleepQuality}</span>
                                              ) : (
                                                <span className="text-muted-foreground">—</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="text-xs text-muted-foreground italic">Geen dagelijkse check-ins</p>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}
