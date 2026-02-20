"use client"

import { useState } from "react"
import { Globe, TrendingUp, MousePointerClick, CheckCircle2, UserPlus, Mail, RefreshCw, Download, Clock, ExternalLink } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte analytics data
//
// Data bronnen:
//   - Vercel Analytics / Google Analytics API (bezoekers, populaire pagina's)
//   - Supabase tabellen:
//     - calculator_sessions (calculator starts, voltooid)
//     - leads (lead conversies via calculator of contact)
//     - contact_submissions (contactformulier invullingen)
//
// Laatste update timestamp komt van de API response
// ============================================================================

const kpiKaarten = [
  { label: "Bezoekers", waarde: "0", icon: Globe, kleur: "text-primary" },
  { label: "Calculator Starts", waarde: "0", icon: MousePointerClick, kleur: "text-chart-2" },
  { label: "Voltooid", waarde: "0", icon: CheckCircle2, kleur: "text-chart-3" },
  { label: "Leads", waarde: "0", icon: UserPlus, kleur: "text-chart-4" },
  { label: "Contact", waarde: "0", icon: Mail, kleur: "text-chart-5" },
]

const populairePaginas: { pad: string; weergaven: number }[] = []
const recenteActiviteit: { tekst: string; tijd: string }[] = []

export function WebsiteAnalytics() {
  const [activeTab, setActiveTab] = useState<"server" | "debug">("server")
  const laatsteUpdate = new Date().toLocaleString("nl-NL", {
    day: "numeric", month: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">Website Analytics</h2>
          <p className="text-xs text-muted-foreground">Bezoekers, calculator en contact statistieken</p>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            <span>Laatste update: {laatsteUpdate}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RefreshCw className="size-3.5" />
            Vernieuwen
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="size-3.5" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("server")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            activeTab === "server" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          <Globe className="size-3" />
          Server Analytics
        </button>
        <button
          onClick={() => setActiveTab("debug")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
            activeTab === "debug" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="size-3" />
          Debug Logs
        </button>
      </div>

      {activeTab === "server" && (
        <>
          {/* KPI Kaarten */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {kpiKaarten.map((kpi) => (
              <Card key={kpi.label} className="border-border">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <kpi.icon className={cn("size-4", kpi.kleur)} />
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  </div>
                  <p className="text-2xl font-bold text-foreground">{kpi.waarde}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Populaire Pagina's + Recente Activiteit */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Globe className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Populaire Pagina{"'"}s</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {populairePaginas.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {populairePaginas.map((pagina, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div className="flex items-center gap-2">
                          <ExternalLink className="size-3 text-muted-foreground" />
                          <span className="text-sm text-foreground">{pagina.pad}</span>
                        </div>
                        <span className="text-sm font-medium text-foreground">{pagina.weergaven}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Nog geen data</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Recente Activiteit</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {recenteActiviteit.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {recenteActiviteit.map((item, i) => (
                      <div key={i} className="flex items-start justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-foreground">{item.tekst}</span>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">{item.tijd}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">Geen recente activiteit</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "debug" && (
        <Card className="border-border">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <Clock className="size-8 text-muted-foreground mb-3" />
            <p className="text-sm font-medium text-foreground">Debug Logs</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Server logs en debug informatie worden hier getoond wanneer de backend is verbonden.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
