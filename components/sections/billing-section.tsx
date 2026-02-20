"use client"

import { CreditCard, DollarSign, Users, ArrowUpRight, Download, Receipt, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte betalingsdata uit je betalingsprovider (bijv. Stripe)
// ============================================================================

/** Facturatie KPI's */
const facturatieStats = [
  { titel: "Maandomzet", waarde: "\u20AC5.240", verandering: "+12,5%", icon: DollarSign },
  { titel: "Actieve abonnementen", waarde: "42", verandering: "+3", icon: Users },
  { titel: "Gem. cliëntwaarde", waarde: "\u20AC109/mnd", verandering: "+\u20AC4", icon: CreditCard },
  { titel: "Openstaand", waarde: "\u20AC320", verandering: "2 facturen", icon: Receipt },
]

/** Recente betalingen */
const recenteBetalingen = [
  { naam: "Sarah van Dijk", initialen: "SD", bedrag: "\u20AC149", plan: "Premium Maandelijks", datum: "20 feb 2026", status: "betaald" },
  { naam: "Tom Bakker", initialen: "TB", bedrag: "\u20AC89", plan: "Standaard Maandelijks", datum: "20 feb 2026", status: "betaald" },
  { naam: "Lisa de Vries", initialen: "LV", bedrag: "\u20AC199", plan: "Wedstrijd Prep", datum: "19 feb 2026", status: "betaald" },
  { naam: "James Peters", initialen: "JP", bedrag: "\u20AC89", plan: "Standaard Maandelijks", datum: "18 feb 2026", status: "achterstallig" },
  { naam: "Emma Jansen", initialen: "EJ", bedrag: "\u20AC119", plan: "Premium Maandelijks", datum: "18 feb 2026", status: "betaald" },
  { naam: "Marco Visser", initialen: "MV", bedrag: "\u20AC89", plan: "Standaard Maandelijks", datum: "17 feb 2026", status: "betaald" },
  { naam: "Anna Groot", initialen: "AG", bedrag: "\u20AC149", plan: "Premium Maandelijks", datum: "15 feb 2026", status: "betaald" },
  { naam: "David Smit", initialen: "DS", bedrag: "\u20AC89", plan: "Standaard Maandelijks", datum: "10 feb 2026", status: "in-afwachting" },
]

/** Abonnementsplannen die de coach aanbiedt */
const abonnementsPlannen = [
  { naam: "Standaard Maandelijks", prijs: "\u20AC89/mnd", clienten: 22, functies: ["Trainingsprogramma's", "Basis voeding", "Wekelijkse check-in", "Chat support"] },
  { naam: "Premium Maandelijks", prijs: "\u20AC149/mnd", clienten: 15, functies: ["Maatwerk workouts", "Volledig voedingsplan", "2x check-in per week", "Videogesprekken", "Prioriteit support"] },
  { naam: "Wedstrijd Prep", prijs: "\u20AC199/mnd", clienten: 3, functies: ["Dagelijkse coaching", "Wedstrijddieet", "Posing begeleiding", "Dagelijkse check-in", "24/7 support"] },
]

function getBetalingStatus(status: string) {
  switch (status) {
    case "betaald":
      return (
        <Badge className="bg-success/10 text-success border-success/20 text-[11px] gap-1">
          <CheckCircle2 className="size-3" />
          Betaald
        </Badge>
      )
    case "achterstallig":
      return (
        <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[11px] gap-1">
          <AlertCircle className="size-3" />
          Achterstallig
        </Badge>
      )
    case "in-afwachting":
      return (
        <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[11px] gap-1">
          <Clock className="size-3" />
          In afwachting
        </Badge>
      )
    default:
      return null
  }
}

export function BillingSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Facturatie</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer betalingen, abonnementen en facturen</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border">
            <Download className="size-4" />
            Exporteren
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Receipt className="size-4" />
            Factuur aanmaken
          </Button>
        </div>
      </div>

      {/* Facturatie stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {facturatieStats.map((stat) => (
          <Card key={stat.titel} className="border-border shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="size-5 text-primary" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-success">
                  <ArrowUpRight className="size-3" />
                  {stat.verandering}
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-foreground">{stat.waarde}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.titel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="betalingen">
        <TabsList>
          <TabsTrigger value="betalingen">Recente betalingen</TabsTrigger>
          <TabsTrigger value="plannen">Abonnementsplannen</TabsTrigger>
        </TabsList>

        <TabsContent value="betalingen" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Cliënt</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Plan</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Bedrag</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Datum</th>
                      <th className="text-left text-xs font-medium text-muted-foreground px-6 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recenteBetalingen.map((betaling, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                                {betaling.initialen}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-foreground">{betaling.naam}</span>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{betaling.plan}</td>
                        <td className="px-6 py-3 text-sm font-semibold text-foreground">{betaling.bedrag}</td>
                        <td className="px-6 py-3 text-sm text-muted-foreground">{betaling.datum}</td>
                        <td className="px-6 py-3">{getBetalingStatus(betaling.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plannen" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {abonnementsPlannen.map((plan) => (
              <Card key={plan.naam} className="border-border shadow-sm hover:border-primary/30 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col gap-4">
                    <div>
                      <h3 className="text-base font-bold text-foreground">{plan.naam}</h3>
                      <p className="text-2xl font-bold text-primary mt-1">{plan.prijs}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{plan.clienten} actieve cliënten</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {plan.functies.map((functie) => (
                        <div key={functie} className="flex items-center gap-2">
                          <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                          <span className="text-sm text-foreground">{functie}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant="outline" className="w-full border-border mt-2">
                      Plan bewerken
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
