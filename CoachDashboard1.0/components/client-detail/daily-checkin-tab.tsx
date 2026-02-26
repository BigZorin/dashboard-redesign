"use client"

import { useState, useEffect } from "react"
import { Calendar, Moon, Smile, MessageSquare, Send, Loader2, ClipboardList, Weight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  getClientDailyCheckIns,
  submitCheckInFeedback,
  type DailyCheckIn,
} from "@/app/actions/clients"

const MOOD_LABELS: Record<number, string> = { 1: "Slecht", 2: "Matig", 3: "Oké", 4: "Goed", 5: "Top" }
const MOOD_COLORS: Record<number, string> = { 1: "text-destructive", 2: "text-warning-foreground", 3: "text-muted-foreground", 4: "text-success", 5: "text-success" }
const SLEEP_LABELS: Record<number, string> = { 1: "Slecht", 2: "Matig", 3: "Oké", 4: "Goed", 5: "Diep" }

interface DailyCheckinTabProps {
  clientId: string
}

export function DailyCheckinTab({ clientId }: DailyCheckinTabProps) {
  const [checkins, setCheckins] = useState<DailyCheckIn[]>([])
  const [loading, setLoading] = useState(true)
  const [feedbackText, setFeedbackText] = useState<Record<string, string>>({})
  const [feedbackSending, setFeedbackSending] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return
    setLoading(true)
    getClientDailyCheckIns(clientId).then((res) => {
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
    const result = await submitCheckInFeedback(checkInId, "daily", text.trim())
    if (result.success) {
      setFeedbackText((prev) => ({ ...prev, [checkInId]: "" }))
      const res = await getClientDailyCheckIns(clientId)
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
        <p className="text-sm font-medium text-foreground">Nog geen dagelijkse check-ins</p>
        <p className="text-xs text-muted-foreground mt-1">Check-ins verschijnen hier zodra de cliënt ze invult</p>
      </div>
    )
  }

  // Group by week
  const grouped = checkins.reduce<Record<string, DailyCheckIn[]>>((acc, ci) => {
    const d = new Date(ci.check_in_date)
    // Get Monday of that week
    const day = d.getDay()
    const diff = d.getDate() - day + (day === 0 ? -6 : 1)
    const monday = new Date(d.setDate(diff))
    const weekKey = monday.toISOString().split("T")[0]
    if (!acc[weekKey]) acc[weekKey] = []
    acc[weekKey].push(ci)
    return acc
  }, {})

  const sortedWeeks = Object.keys(grouped).sort((a, b) => b.localeCompare(a))

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Dagelijkse check-ins</h3>
        <p className="text-xs text-muted-foreground">{checkins.length} check-ins, laatste 30 dagen</p>
      </div>

      {sortedWeeks.map((weekKey) => {
        const weekCheckins = grouped[weekKey].sort((a, b) =>
          b.check_in_date.localeCompare(a.check_in_date)
        )
        const weekStart = new Date(weekKey)
        const weekLabel = `Week van ${weekStart.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}`

        // Week averages
        const weights = weekCheckins.filter(c => c.weight).map(c => c.weight!)
        const moods = weekCheckins.filter(c => c.mood).map(c => c.mood!)
        const sleeps = weekCheckins.filter(c => c.sleep_quality).map(c => c.sleep_quality!)
        const avgWeight = weights.length > 0 ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : null
        const avgMood = moods.length > 0 ? (moods.reduce((a, b) => a + b, 0) / moods.length).toFixed(1) : null
        const avgSleep = sleeps.length > 0 ? (sleeps.reduce((a, b) => a + b, 0) / sleeps.length).toFixed(1) : null

        return (
          <div key={weekKey}>
            {/* Week header with averages */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">{weekLabel}</span>
                <Badge variant="secondary" className="text-[10px]">{weekCheckins.length} dagen</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                {avgWeight && <span>Gem. {avgWeight} kg</span>}
                {avgMood && <span>Stemming {avgMood}/5</span>}
                {avgSleep && <span>Slaap {avgSleep}/5</span>}
              </div>
            </div>

            <div className="space-y-2">
              {weekCheckins.map((ci) => (
                <Card key={ci.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <p className="text-xs text-muted-foreground">
                            {new Date(ci.check_in_date).toLocaleDateString("nl-NL", { weekday: "short" })}
                          </p>
                          <p className="text-sm font-semibold text-foreground">
                            {new Date(ci.check_in_date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                          </p>
                        </div>

                        <div className="h-8 w-px bg-border" />

                        <div className="flex items-center gap-4">
                          {ci.weight && (
                            <div className="flex items-center gap-1.5">
                              <Weight className="size-3.5 text-muted-foreground" />
                              <span className="text-sm font-medium text-foreground">{ci.weight} kg</span>
                            </div>
                          )}
                          {ci.mood && (
                            <div className="flex items-center gap-1.5">
                              <Smile className={cn("size-3.5", MOOD_COLORS[ci.mood])} />
                              <span className="text-sm text-foreground">{MOOD_LABELS[ci.mood]}</span>
                            </div>
                          )}
                          {ci.sleep_quality && (
                            <div className="flex items-center gap-1.5">
                              <Moon className="size-3.5 text-muted-foreground" />
                              <span className="text-sm text-foreground">{SLEEP_LABELS[ci.sleep_quality]}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {ci.notes && (
                      <div className="flex items-start gap-2 mt-3 pl-[66px]">
                        <MessageSquare className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground italic">{ci.notes}</p>
                      </div>
                    )}

                    {ci.coach_feedback && (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-3 ml-[66px]">
                        <p className="text-[10px] text-primary font-semibold mb-0.5">Jouw feedback</p>
                        <p className="text-xs text-foreground">{ci.coach_feedback}</p>
                      </div>
                    )}

                    {/* Feedback input */}
                    <div className="flex gap-2 mt-3 ml-[66px]">
                      <input
                        type="text"
                        placeholder="Feedback..."
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
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
