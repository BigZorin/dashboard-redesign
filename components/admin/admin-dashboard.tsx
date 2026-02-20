"use client"

import { Users, UserCog, DollarSign, TrendingUp, Activity, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte data uit Supabase
//
// Supabase tabellen / views:
//   - users (totaal coaches, admins count)
//   - clients (totaal actief, wachtrij, churn)
//   - client_subscriptions (MRR berekening, gem. cliëntwaarde)
//   - client_sessions (sessies deze maand)
//   - client_checkins (check-in ratio)
//
// Stripe data (omzet KPI's):
//   - Maandelijkse omzet: stripe.balanceTransactions.list() of
//     berekend uit client_subscriptions.maand_prijs_centen (Supabase)
//   - Gem. clientwaarde: totaal MRR / actieve clienten
//   - Betalingen in "Recente Activiteit": stripe.charges.list() of
//     via webhook data opgeslagen in payments tabel
//
// KPI's worden berekend via Supabase RPC of Edge Functions
// ============================================================================

const kpiKaarten = [
  {
    label: "Totaal Coaches",
    waarde: "3",
    trend: "+1",
    trendRichting: "up" as const,
    icon: UserCog,
  },
  {
    label: "Actieve Clienten",
    waarde: "48",
    trend: "+6",
    trendRichting: "up" as const,
    icon: Users,
  },
  {
    label: "Maandelijkse Omzet",
    waarde: "\u20AC12.450",
    trend: "+8,2%",
    trendRichting: "up" as const,
    icon: DollarSign,
  },
  {
    label: "Gem. Clientwaarde",
    waarde: "\u20AC259",
    trend: "+12",
    trendRichting: "up" as const,
    icon: TrendingUp,
  },
  {
    label: "Client Retentie",
    waarde: "94%",
    trend: "-1%",
    trendRichting: "down" as const,
    icon: Activity,
  },
]

const recenteActiviteiten = [
  { tekst: "Nieuwe client George Clooney aangemeld", tijd: "2 min geleden", type: "client" },
  { tekst: "Coach Lisa heeft 3 check-ins beoordeeld", tijd: "15 min geleden", type: "coach" },
  { tekst: "Betaling \u20AC199 ontvangen van Tom Bakker", tijd: "1 uur geleden", type: "betaling" },
  { tekst: "Nieuw voedingsplan template aangemaakt", tijd: "2 uur geleden", type: "content" },
  { tekst: "Client Emma Jansen gepauzeerd", tijd: "3 uur geleden", type: "client" },
  { tekst: "Website contact formulier ingevuld", tijd: "5 uur geleden", type: "lead" },
]

export function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* KPI Kaarten */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {kpiKaarten.map((kpi) => {
          const TrendIcon = kpi.trendRichting === "up" ? ArrowUpRight : kpi.trendRichting === "down" ? ArrowDownRight : Minus
          return (
            <Card key={kpi.label} className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-muted-foreground">{kpi.label}</span>
                  <kpi.icon className="size-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">{kpi.waarde}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendIcon className={cn(
                    "size-3",
                    kpi.trendRichting === "up" && "text-success",
                    kpi.trendRichting === "down" && "text-destructive"
                  )} />
                  <span className={cn(
                    "text-xs font-medium",
                    kpi.trendRichting === "up" && "text-success",
                    kpi.trendRichting === "down" && "text-destructive"
                  )}>{kpi.trend}</span>
                  <span className="text-xs text-muted-foreground">vs vorige maand</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Coach Prestaties */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Coach Prestaties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {[
                { naam: "Mark Jensen", clienten: 18, checkins: 92, omzet: "\u20AC4.662" },
                { naam: "Lisa de Vries", clienten: 16, checkins: 88, omzet: "\u20AC4.144" },
                { naam: "Thomas Berg", clienten: 14, checkins: 95, omzet: "\u20AC3.626" },
              ].map((coach) => (
                <div key={coach.naam} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {coach.naam.split(" ").map(n => n[0]).join("")}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{coach.naam}</p>
                      <p className="text-xs text-muted-foreground">{coach.clienten} clienten</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className="text-xs text-muted-foreground">Check-in ratio</p>
                      <p className="text-sm font-medium text-foreground">{coach.checkins}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Omzet</p>
                      <p className="text-sm font-semibold text-foreground">{coach.omzet}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recente Activiteit */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recente Activiteit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              {recenteActiviteiten.map((activiteit, i) => (
                <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <div className={cn(
                    "size-2 rounded-full mt-1.5 shrink-0",
                    activiteit.type === "client" && "bg-primary",
                    activiteit.type === "coach" && "bg-chart-2",
                    activiteit.type === "betaling" && "bg-success",
                    activiteit.type === "content" && "bg-chart-4",
                    activiteit.type === "lead" && "bg-chart-5"
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activiteit.tekst}</p>
                    <p className="text-xs text-muted-foreground">{activiteit.tijd}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
