"use client"

import { useEffect, useState } from "react"
import { Users, TrendingUp, MessageCircle, CalendarDays } from "lucide-react"
import { DashboardOverview } from "@/components/sections/dashboard-overview"
import { getDashboardStats, getRecentCheckIns, getUpcomingSessions, getClientProgress } from "@/app/actions/dashboard"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

export function DashboardOverviewWithData() {
  const [loading, setLoading] = useState(true)
  const [statKaarten, setStatKaarten] = useState<any[]>([])
  const [recenteCheckins, setRecenteCheckins] = useState<any[]>([])
  const [aankomendeSessies, setAankomendeSessies] = useState<any[]>([])
  const [clientVoortgang, setClientVoortgang] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentCheckIns(5),
      getUpcomingSessions(4),
      getClientProgress(),
    ]).then(([stats, checkins, sessions, progress]) => {
      // Transform stats → statKaarten format
      if (stats) {
        setStatKaarten([
          {
            titel: "Actieve cliënten",
            waarde: String(stats.actieveClienten || 0),
            verandering: "",
            trend: "up" as const,
            icon: Users,
            beschrijving: "Toegewezen cliënten",
          },
          {
            titel: "Check-ins",
            waarde: String((stats.weekCheckIns || 0) + (stats.dagCheckIns || 0)),
            verandering: "",
            trend: "up" as const,
            icon: TrendingUp,
            beschrijving: "Wekelijks + dagelijks",
          },
          {
            titel: "Ongelezen berichten",
            waarde: String(stats.ongelezen || 0),
            verandering: "",
            trend: (stats.ongelezen || 0) > 0 ? "up" as const : "down" as const,
            icon: MessageCircle,
            beschrijving: "Onbeantwoord",
          },
          {
            titel: "Sessies deze week",
            waarde: String(stats.sessiesDezWeek || 0),
            verandering: "",
            trend: "up" as const,
            icon: CalendarDays,
            beschrijving: "Gepland",
          },
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

      setLoading(false)
    })
  }, [])

  return (
    <DashboardOverview
      statKaarten={loading ? undefined : statKaarten}
      recenteCheckins={loading ? undefined : recenteCheckins}
      aankomendeSessies={loading ? undefined : aankomendeSessies}
      clientVoortgang={loading ? undefined : clientVoortgang}
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
