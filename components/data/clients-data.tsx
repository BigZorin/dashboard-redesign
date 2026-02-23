"use client"

import { useEffect, useState } from "react"
import { ClientsSection } from "@/components/sections/clients-section"
import { getCoachClients, type ClientData } from "@/app/actions/clients"
import { formatDistanceToNow } from "date-fns"
import { nl } from "date-fns/locale"

interface ClientsWithDataProps {
  onSelectClient?: (clientId: string) => void
}

export function ClientsSectionWithData({ onSelectClient }: ClientsWithDataProps) {
  const [loading, setLoading] = useState(true)
  const [clienten, setClienten] = useState<any[]>([])

  useEffect(() => {
    getCoachClients().then((result) => {
      if (result.success && result.clients) {
        // Transform ClientData → V0 component format
        setClienten(
          result.clients.map((c: ClientData) => ({
            id: c.id,
            naam: c.naam,
            initialen: c.initialen,
            email: c.email,
            status: c.status,
            programma: c.programma,
            voortgang: c.voortgang,
            volgendeSessie: formatSession(c.volgendeSessie),
            trend: c.trend,
            laatsteCheckin: formatRelative(c.laatsteCheckin),
            tags: c.tags.length > 0 ? c.tags : ["Online"],
            avatarUrl: c.avatarUrl,
          }))
        )
      }
      setLoading(false)
    })
  }, [])

  return (
    <ClientsSection
      clienten={loading ? undefined : clienten}
      loading={loading}
      onSelectClient={onSelectClient}
    />
  )
}

function formatRelative(dateStr: string | null): string {
  if (!dateStr) return "Geen data"
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: nl })
  } catch {
    return "Onbekend"
  }
}

function formatSession(dateStr: string | null): string {
  if (!dateStr) return "Geen sessie"
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((date.getTime() - now.getTime()) / 86400000)
    const timeStr = date.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })
    if (diffDays === 0) return `Vandaag, ${timeStr}`
    if (diffDays === 1) return `Morgen, ${timeStr}`
    return `${date.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}, ${timeStr}`
  } catch {
    return "Onbekend"
  }
}
