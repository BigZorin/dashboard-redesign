"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Minus, MessageSquare, ArrowLeftRight, Send, AlertTriangle, ClipboardList, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getClientWeeklyCheckIns,
  submitCheckInFeedback,
  type WeeklyCheckIn,
} from "@/app/actions/clients"

const FEELING_LABELS: Record<number, string> = { 1: "Slecht", 2: "Matig", 3: "Oké", 4: "Goed", 5: "Uitstekend" }

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

interface CheckinsTabProps {
  clientId: string
}

export function CheckinsTab({ clientId }: CheckinsTabProps) {
  const [checkins, setCheckins] = useState<WeeklyCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [feedbackSending, setFeedbackSending] = useState<string | null>(null)
  const [weergave, setWeergave] = useState<"tijdlijn" | "tabel">("tijdlijn")

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

  const handleFeedback = async (checkInId: string) => {
    const text = feedbackText[checkInId]
    if (!text?.trim()) return
    setFeedbackSending(checkInId)
    const result = await submitCheckInFeedback(checkInId, "weekly", text.trim())
    if (result.success) {
      setFeedbackText((prev) => ({ ...prev, [checkInId]: "" }))
      // Refresh check-ins
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

  // Calculate weight changes between consecutive check-ins
  const checkinsWithTrend = checkins.map((ci, i) => {
    const prev = checkins[i + 1]
    const gewichtVerandering = (ci.weight && prev?.weight)
      ? Number((ci.weight - prev.weight).toFixed(1))
      : 0
    return { ...ci, gewichtVerandering }
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Wekelijkse check-ins</h3>
          <p className="text-xs text-muted-foreground">{checkins.length} check-ins vastgelegd</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <Button
            variant={weergave === "tijdlijn" ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setWeergave("tijdlijn")}
          >
            Tijdlijn
          </Button>
          <Button
            variant={weergave === "tabel" ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1.5 text-xs"
            onClick={() => setWeergave("tabel")}
          >
            Tabel
          </Button>
        </div>
      </div>

      {/* Tijdlijn weergave */}
      {weergave === "tijdlijn" && (
        <div className="relative flex flex-col gap-0">
          <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

          {checkinsWithTrend.map((ci) => (
            <div key={ci.id} className="relative flex gap-4 pb-6">
              <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-card">
                <span className="text-[11px] font-bold text-primary">W{ci.week_number}</span>
              </div>

              <Card className="flex-1 border-border">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/20">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-base font-semibold text-foreground">Week {ci.week_number}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ci.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                    {ci.weight && (
                      <div className="flex flex-col pl-4 border-l border-border">
                        <span className="text-[10px] text-muted-foreground uppercase">Gewicht</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-lg font-bold text-foreground">{ci.weight}</span>
                          <span className="text-xs text-muted-foreground">kg</span>
                          {ci.gewichtVerandering !== 0 && (
                            <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                              ci.gewichtVerandering <= 0 ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                            }`}>
                              {ci.gewichtVerandering < 0 ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
                              {ci.gewichtVerandering > 0 ? "+" : ""}{ci.gewichtVerandering}
                            </div>
                          )}
                        </div>
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
                  </div>
                </div>

                <CardContent className="p-4">
                  {/* Welzijn scores */}
                  <div className="flex items-center gap-6 mb-4 flex-wrap">
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
                    <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3 mb-4">
                      <p className="text-xs text-destructive font-semibold mb-0.5">Pijn / ongemak</p>
                      <p className="text-sm text-foreground">
                        {ci.pain_location}
                        {ci.pain_severity ? ` (ernst: ${ci.pain_severity}/5)` : ""}
                      </p>
                    </div>
                  )}

                  {/* Client notes */}
                  {ci.notes && (
                    <div className="flex gap-2 items-start mb-3">
                      <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                      <p className="text-xs text-muted-foreground leading-relaxed italic">
                        {`"${ci.notes}"`}
                      </p>
                    </div>
                  )}

                  {/* Coach feedback */}
                  {ci.coach_feedback && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
                      <p className="text-[10px] text-primary font-semibold mb-0.5">Jouw feedback</p>
                      <p className="text-xs text-foreground">{ci.coach_feedback}</p>
                    </div>
                  )}

                  {/* Feedback input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Feedback op deze check-in..."
                      value={feedbackText[ci.id] || ""}
                      onChange={(e) => setFeedbackText((prev) => ({ ...prev, [ci.id]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleFeedback(ci.id)}
                      className="flex-1 px-3 py-2 text-sm border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleFeedback(ci.id)}
                      disabled={!feedbackText[ci.id]?.trim() || feedbackSending === ci.id}
                      className="px-3"
                    >
                      {feedbackSending === ci.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Tabel weergave */}
      {weergave === "tabel" && (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[11px] font-semibold">Week</TableHead>
                    <TableHead className="text-[11px] font-semibold">Datum</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Gewicht</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Gevoel</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Energie</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Slaap</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Stress</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Motivatie</TableHead>
                    <TableHead className="text-[11px] font-semibold text-center">Pijn</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkinsWithTrend.map((ci) => (
                    <TableRow key={ci.id}>
                      <TableCell className="text-sm font-medium text-foreground">W{ci.week_number}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(ci.created_at).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-sm font-medium text-foreground">{ci.weight ?? "—"}</span>
                          {ci.gewichtVerandering !== 0 && (
                            <span className={`text-[10px] ${ci.gewichtVerandering <= 0 ? "text-success" : "text-destructive"}`}>
                              {ci.gewichtVerandering > 0 ? "+" : ""}{ci.gewichtVerandering}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs text-foreground">{ci.feeling ? `${ci.feeling}/5` : "—"}</TableCell>
                      <TableCell className="text-center text-xs text-foreground">{ci.energy_level ? `${ci.energy_level}/5` : "—"}</TableCell>
                      <TableCell className="text-center text-xs text-foreground">{ci.sleep_quality ? `${ci.sleep_quality}/5` : "—"}</TableCell>
                      <TableCell className="text-center text-xs text-foreground">{ci.stress_level ? `${ci.stress_level}/5` : "—"}</TableCell>
                      <TableCell className="text-center text-xs text-foreground">{ci.motivation ? `${ci.motivation}/5` : "—"}</TableCell>
                      <TableCell className="text-center">
                        {ci.has_pain ? (
                          <Badge variant="outline" className="text-[10px] border-destructive/30 text-destructive">
                            {ci.pain_location}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
