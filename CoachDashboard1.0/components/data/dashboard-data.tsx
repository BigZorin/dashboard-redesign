"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, ClipboardCheck, TrendingUp, AlertTriangle, MessageCircle, CalendarCheck, Smile } from "lucide-react"
import { DashboardOverview } from "@/components/sections/dashboard-overview"
import {
  getDashboardStats,
  getRecentCheckIns,
  getUpcomingSessions,
  getClientProgress,
  getComplianceData,
  getClientActivityData,
  getRedFlags,
  getClientWeightTrends,
  type RedFlag,
  type ClientWeightTrend,
} from "@/app/actions/dashboard"
import { getAiDashboardInsights, type AiInsight } from "@/app/actions/ai-coach"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

export function DashboardOverviewWithData() {
  const [loading, setLoading] = useState(true)
  const [statKaarten, setStatKaarten] = useState<any[]>([])
  const [recenteCheckins, setRecenteCheckins] = useState<any[]>([])
  const [aankomendeSessies, setAankomendeSessies] = useState<any[]>([])
  const [clientVoortgang, setClientVoortgang] = useState<any[]>([])
  const [complianceChartData, setComplianceChartData] = useState<any[]>([])
  const [activiteitChartData, setActiviteitChartData] = useState<any[]>([])
  const [redFlags, setRedFlags] = useState<RedFlag[]>([])
  const [weightTrends, setWeightTrends] = useState<ClientWeightTrend[]>([])
  const [aiInsights, setAiInsights] = useState<AiInsight[]>([])
  const [aiInsightsLoading, setAiInsightsLoading] = useState(true)

  const refreshAiInsights = useCallback(() => {
    setAiInsightsLoading(true)
    getAiDashboardInsights().then(result => {
      setAiInsights(result.insights || [])
      setAiInsightsLoading(false)
    }).catch(() => {
      setAiInsightsLoading(false)
    })
  }, [])

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentCheckIns(5),
      getUpcomingSessions(4),
      getClientProgress(),
      getComplianceData(),
      getClientActivityData(),
      getRedFlags(),
      getClientWeightTrends(),
    ]).then(([stats, checkins, sessions, progress, compliance, activity, flags, trends]) => {
      // Transform stats → statKaarten format (new relevant KPIs)
      if (stats) {
        const flagCount = (flags || []).length
        setStatKaarten([
          { titel: "Actieve cliënten", waarde: String(stats.actieveClienten || 0), icon: Users },
          { titel: "Review nodig", waarde: String(stats.reviewNodig || 0), icon: ClipboardCheck },
          { titel: "Gem. compliance", waarde: stats.gemCompliance ? `${stats.gemCompliance}%` : "—", icon: TrendingUp },
          { titel: "Aandachtspunten", waarde: String(flagCount), icon: AlertTriangle },
          { titel: "Ongelezen", waarde: String(stats.ongelezen || 0), icon: MessageCircle },
          { titel: "Check-ins", waarde: String(stats.checkInsDezeWeek || 0), icon: CalendarCheck },
          { titel: "Gem. mood", waarde: stats.gemMood ? `${stats.gemMood}/5` : "—", icon: Smile },
        ])
      }

      // Transform checkins → recenteCheckins format
      setRecenteCheckins(
        (checkins || []).map((ci: any) => ({
          id: ci.id,
          naam: ci.naam,
          initialen: ci.initialen,
          tijd: formatTime(ci.tijd),
          status: ci.status,
          notitie: ci.notitie || "Geen notitie",
        }))
      )

      // Transform sessions → aankomendeSessies format
      setAankomendeSessies(
        (sessions || []).map((s: any) => ({
          id: s.id,
          naam: s.naam,
          initialen: s.initialen,
          tijd: new Date(s.tijd).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" }),
          type: s.type,
        }))
      )

      // Transform progress → clientVoortgang format
      setClientVoortgang(
        (progress || []).map((p: any) => ({
          naam: p.naam,
          initialen: p.initialen,
          voortgang: p.voortgang,
          programma: p.programma,
        }))
      )

      // Chart data
      setComplianceChartData(compliance || [])
      setActiviteitChartData(activity || [])

      // New widgets
      setRedFlags(flags || [])
      setWeightTrends(trends || [])

      setLoading(false)
    })

    // AI insights loaded separately (slower, non-blocking)
    refreshAiInsights()
  }, [refreshAiInsights])

  return (
    <DashboardOverview
      statKaarten={loading ? undefined : statKaarten}
      recenteCheckins={loading ? undefined : recenteCheckins}
      aankomendeSessies={loading ? undefined : aankomendeSessies}
      clientVoortgang={loading ? undefined : clientVoortgang}
      complianceChartData={loading ? undefined : complianceChartData}
      activiteitChartData={loading ? undefined : activiteitChartData}
      redFlags={loading ? undefined : redFlags}
      weightTrends={loading ? undefined : weightTrends}
      aiInsights={aiInsights}
      aiInsightsLoading={aiInsightsLoading}
      onRefreshAiInsights={refreshAiInsights}
      loading={loading}
    />
  )
}

function formatTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: nl })
  } catch {
    return "Onbekend"
  }
}
