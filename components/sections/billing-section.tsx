"use client"

import { useState } from "react"
import {
  CreditCard, DollarSign, Users, ArrowUpRight, ArrowDownRight, Download, Receipt, CheckCircle2,
  AlertCircle, Clock, Plus, MoreHorizontal, Trash2, Copy, Send, Eye, Edit2, RefreshCw,
  TrendingUp, Percent, CalendarDays, Ban, FileText, Mail, ExternalLink, Settings, Sparkles
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

// ============================================================================
// FACTURATIE — Volledig Stripe-geintegreerd betalingssysteem
//
// ============================================================================
// STRIPE INTEGRATIE ARCHITECTUUR
// ============================================================================
//
// A. STRIPE PRODUCTEN & PRIJZEN
//    - Elk abonnementsplan (subscription_plans) correspondeert met een Stripe Product
//    - Elk plan heeft meerdere Stripe Prices voor verschillende perioden:
//      * Maandelijks (interval: "month", interval_count: 1)
//      * 6 maanden  (interval: "month", interval_count: 6)  -> korting bijv. 10%
//      * 12 maanden (interval: "month", interval_count: 12) -> korting bijv. 20%
//      * 24 maanden (interval: "month", interval_count: 24) -> korting bijv. 30%
//    - Prijzen worden aangemaakt via Stripe API bij het opslaan van een plan
//    - stripe_product_id en stripe_price_ids worden opgeslagen in subscription_plans
//
// B. ABONNEMENTEN & AUTOMATISCHE INCASSO
//    - Bij client aanmaken: Stripe Customer aanmaken + payment method koppelen
//    - Stripe Checkout Session voor eerste betaling + mandaat (SEPA / iDEAL / card)
//    - Stripe Subscription met:
//      * collection_method: "charge_automatically" (automatische incasso)
//      * payment_behavior: "default_incomplete" (wacht op eerste betaling)
//      * days_until_due: null (directe incasso) of 14 (factuur betaling)
//    - Proeftijd: trial_period_days instelbaar per plan
//    - Bij upgrade/downgrade: Stripe proration automatisch
//    - Bij opzegging: cancel_at_period_end = true (loopt door tot einde periode)
//
// C. BETAALMETHODEN (NL-gericht)
//    - iDEAL (primair, NL banken): via Stripe Payment Element
//    - SEPA automatische incasso: voor recurring, mandaat bij eerste betaling
//    - Creditcard (Visa, Mastercard): als fallback
//    - Bancontact (BE clienten): optioneel
//    - Setup: Stripe Payment Element met `mode: "setup"` voor mandaat
//    - Terugkerende betalingen: SEPA Direct Debit of card on file
//
// D. FACTUREN
//    - Stripe genereert automatisch facturen bij elke subscription renewal
//    - Handmatige facturen: Stripe Invoice API voor losse diensten/producten
//    - Facturen bevatten: BTW (21%), bedrijfsgegevens, KvK, BTW-nummer
//    - PDF download via Stripe hosted_invoice_url
//    - Creditnota's: via Stripe Credit Note API bij terugbetalingen
//    - Factuur nummering: automatisch via Stripe (configureerbaar prefix)
//
// E. WEBHOOKS (Stripe -> Supabase Edge Function)
//    - Endpoint: /api/webhooks/stripe (of Supabase Edge Function)
//    - Events die afgehandeld moeten worden:
//      * checkout.session.completed     -> client_subscriptions aanmaken
//      * invoice.payment_succeeded      -> payments record + status update
//      * invoice.payment_failed         -> notificatie naar coach + client
//      * customer.subscription.updated  -> plan/status wijziging sync
//      * customer.subscription.deleted  -> abonnement geannuleerd
//      * payment_method.attached        -> betaalmethode opslaan
//      * invoice.finalized              -> factuur beschikbaar
//    - Webhook signature verificatie: stripe.webhooks.constructEvent()
//    - Idempotency: check event.id om duplicaten te voorkomen
//
// F. DUNNING (MISLUKTE BETALINGEN)
//    - Stripe Smart Retries: automatisch 3x opnieuw proberen
//    - Na 1e mislukte poging: e-mail naar client (via Stripe of eigen systeem)
//    - Na 2e mislukte poging: notificatie naar coach in dashboard
//    - Na 3e mislukte poging: abonnement -> "past_due" status
//    - Na X dagen (instelbaar): abonnement geannuleerd + toegang geblokkeerd
//    - Dunning configuratie: Stripe Dashboard > Settings > Subscriptions
//
// G. TERUGBETALINGEN
//    - Via Stripe Refund API: volledig of gedeeltelijk
//    - Reden opslaan: "duplicate", "fraudulent", "requested_by_customer"
//    - Creditnota automatisch gegenereerd bij refund op invoice
//    - Refund status sync via webhook: charge.refunded
//
// ============================================================================
// SUPABASE TABELLEN
// ============================================================================
//
// subscription_plans:
//   - id, naam, beschrijving, maand_prijs_centen, features (jsonb)
//   - kortingspercentages: korting_6m, korting_12m, korting_24m (integer %)
//   - proef_dagen (trial days), max_clienten (capacity), status
//   - stripe_product_id, stripe_prices (jsonb: { "1m": "price_xxx", "6m": "price_xxx", ... })
//   - btw_percentage (default 21), is_actief (boolean)
//   - created_at, updated_at
//
// client_subscriptions:
//   - id, client_id (FK users), plan_id (FK subscription_plans)
//   - stripe_subscription_id, stripe_customer_id
//   - status: "active" | "trialing" | "past_due" | "canceled" | "paused" | "incomplete"
//   - periode: "1m" | "6m" | "12m" | "24m"
//   - huidige_periode_start, huidige_periode_einde
//   - proef_einde (nullable), opzeg_datum (nullable)
//   - maand_bedrag_centen, valuta (default "eur")
//   - betaalmethode: "ideal" | "sepa" | "card" | "bancontact"
//   - automatische_incasso (boolean, default true)
//   - created_at, updated_at
//
// payments:
//   - id, client_id (FK users), subscription_id (FK client_subscriptions, nullable)
//   - stripe_payment_intent_id, stripe_invoice_id (nullable)
//   - bedrag_centen, btw_centen, totaal_centen, valuta
//   - status: "succeeded" | "pending" | "failed" | "refunded" | "partially_refunded"
//   - betaalmethode, beschrijving (string)
//   - factuur_url (Stripe hosted_invoice_url)
//   - terugbetaling_bedrag_centen (nullable), terugbetaling_reden (nullable)
//   - created_at
//
// invoices:
//   - id, client_id, payment_id (nullable)
//   - stripe_invoice_id, factuur_nummer (string, bijv. "FT-2026-0001")
//   - bedrag_centen, btw_centen, totaal_centen
//   - status: "draft" | "open" | "paid" | "void" | "uncollectible"
//   - vervaldatum, betaald_op (nullable)
//   - pdf_url (Stripe hosted_invoice_url)
//   - regels (jsonb: [{ beschrijving, aantal, prijs_centen, btw_pct }])
//   - bedrijfsgegevens (jsonb: { naam, adres, kvk, btw_nummer })
//   - created_at
//
// ============================================================================

// --- Placeholder data -------------------------------------------------------

const facturatieStats = [
  { titel: "MRR", waarde: "\u20AC5.240", verandering: "+12,5%", positief: true, icon: TrendingUp, beschrijving: "Monthly Recurring Revenue" },
  { titel: "Actieve abonnementen", waarde: "42", verandering: "+3", positief: true, icon: Users, beschrijving: "Betalende clienten" },
  { titel: "Gem. clientwaarde", waarde: "\u20AC109/mnd", verandering: "+\u20AC4", positief: true, icon: CreditCard, beschrijving: "Average Revenue Per User" },
  { titel: "Churn rate", waarde: "2,4%", verandering: "-0,3%", positief: true, icon: Percent, beschrijving: "Maandelijks verloop" },
  { titel: "Openstaand", waarde: "\u20AC320", verandering: "2 facturen", positief: false, icon: AlertCircle, beschrijving: "Onbetaalde facturen" },
  { titel: "Jaaromzet (ARR)", waarde: "\u20AC62.880", verandering: "+18%", positief: true, icon: DollarSign, beschrijving: "Annualized Recurring Revenue" },
]

const recenteBetalingen = [
  { naam: "Sarah van Dijk", initialen: "SD", bedrag: 14900, plan: "Premium", periode: "Maandelijks", datum: "20 feb 2026", status: "succeeded" as const, methode: "iDEAL", factuurNr: "FT-2026-0042" },
  { naam: "Tom Bakker", initialen: "TB", bedrag: 8900, plan: "Standaard", periode: "Maandelijks", datum: "20 feb 2026", status: "succeeded" as const, methode: "SEPA", factuurNr: "FT-2026-0041" },
  { naam: "Lisa de Vries", initialen: "LV", bedrag: 19900, plan: "Wedstrijd Prep", periode: "Maandelijks", datum: "19 feb 2026", status: "succeeded" as const, methode: "iDEAL", factuurNr: "FT-2026-0040" },
  { naam: "James Peters", initialen: "JP", bedrag: 8900, plan: "Standaard", periode: "Maandelijks", datum: "18 feb 2026", status: "failed" as const, methode: "SEPA", factuurNr: "FT-2026-0039" },
  { naam: "Emma Jansen", initialen: "EJ", bedrag: 11900, plan: "Premium", periode: "6 maanden", datum: "18 feb 2026", status: "succeeded" as const, methode: "Card", factuurNr: "FT-2026-0038" },
  { naam: "Marco Visser", initialen: "MV", bedrag: 8900, plan: "Standaard", periode: "12 maanden", datum: "17 feb 2026", status: "succeeded" as const, methode: "iDEAL", factuurNr: "FT-2026-0037" },
  { naam: "Anna Groot", initialen: "AG", bedrag: 14900, plan: "Premium", periode: "Maandelijks", datum: "15 feb 2026", status: "succeeded" as const, methode: "SEPA", factuurNr: "FT-2026-0036" },
  { naam: "David Smit", initialen: "DS", bedrag: 8900, plan: "Standaard", periode: "Maandelijks", datum: "10 feb 2026", status: "pending" as const, methode: "SEPA", factuurNr: "FT-2026-0035" },
]

const abonnementsPlannen = [
  {
    id: "plan-1", naam: "Standaard", beschrijving: "Voor clienten die zelfstandig willen trainen met begeleiding",
    maandPrijsCenten: 8900, korting6m: 10, korting12m: 20, korting24m: 30, proefDagen: 7,
    clienten: 22, maxClienten: 50, isActief: true,
    functies: ["Trainingsprogramma's", "Basis voeding", "Wekelijkse check-in", "Chat support"],
  },
  {
    id: "plan-2", naam: "Premium", beschrijving: "Intensieve begeleiding met maatwerk",
    maandPrijsCenten: 14900, korting6m: 10, korting12m: 15, korting24m: 25, proefDagen: 7,
    clienten: 15, maxClienten: 30, isActief: true,
    functies: ["Maatwerk workouts", "Volledig voedingsplan", "2x check-in per week", "Videogesprekken", "Prioriteit support"],
  },
  {
    id: "plan-3", naam: "Wedstrijd Prep", beschrijving: "Dagelijkse coaching voor wedstrijdvoorbereiding",
    maandPrijsCenten: 19900, korting6m: 5, korting12m: 10, korting24m: 15, proefDagen: 0,
    clienten: 3, maxClienten: 5, isActief: true,
    functies: ["Dagelijkse coaching", "Wedstrijddieet", "Posing begeleiding", "Dagelijkse check-in", "24/7 support"],
  },
]

const actieveAbonnementen = [
  { naam: "Sarah van Dijk", initialen: "SD", plan: "Premium", periode: "1m", bedrag: 14900, status: "active" as const, methode: "SEPA", volgendeBetaling: "20 mrt 2026", startDatum: "20 jan 2025" },
  { naam: "Tom Bakker", initialen: "TB", plan: "Standaard", periode: "12m", bedrag: 7120, status: "active" as const, methode: "iDEAL", volgendeBetaling: "15 jun 2026", startDatum: "15 jun 2025" },
  { naam: "Lisa de Vries", initialen: "LV", plan: "Wedstrijd Prep", periode: "6m", bedrag: 18905, status: "active" as const, methode: "iDEAL", volgendeBetaling: "1 apr 2026", startDatum: "1 okt 2025" },
  { naam: "James Peters", initialen: "JP", plan: "Standaard", periode: "1m", bedrag: 8900, status: "past_due" as const, methode: "SEPA", volgendeBetaling: "Achterstallig", startDatum: "10 sep 2025" },
  { naam: "Emma Jansen", initialen: "EJ", plan: "Premium", periode: "6m", bedrag: 13410, status: "active" as const, methode: "Card", volgendeBetaling: "18 apr 2026", startDatum: "18 okt 2025" },
  { naam: "Marco Visser", initialen: "MV", plan: "Standaard", periode: "1m", bedrag: 8900, status: "trialing" as const, methode: "-", volgendeBetaling: "24 feb 2026", startDatum: "17 feb 2026" },
  { naam: "Nina de Boer", initialen: "NB", plan: "Premium", periode: "24m", bedrag: 11175, status: "active" as const, methode: "SEPA", volgendeBetaling: "1 mrt 2026", startDatum: "1 mrt 2024" },
]

function formatBedrag(centen: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(centen / 100)
}

function berekenPeriodePrijs(maandCenten: number, kortingPct: number): number {
  return Math.round(maandCenten * (1 - kortingPct / 100))
}

function getBetalingStatus(status: string) {
  switch (status) {
    case "succeeded":
      return <Badge className="bg-success/10 text-success border-success/20 text-[10px] gap-1"><CheckCircle2 className="size-2.5" />Betaald</Badge>
    case "failed":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] gap-1"><AlertCircle className="size-2.5" />Mislukt</Badge>
    case "pending":
      return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px] gap-1"><Clock className="size-2.5" />In afwachting</Badge>
    case "refunded":
      return <Badge className="bg-muted text-muted-foreground border-border text-[10px] gap-1"><RefreshCw className="size-2.5" />Terugbetaald</Badge>
    default: return null
  }
}

function getAbonnementStatus(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Actief</Badge>
    case "trialing":
      return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-[10px]">Proefperiode</Badge>
    case "past_due":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Achterstallig</Badge>
    case "canceled":
      return <Badge className="bg-muted text-muted-foreground border-border text-[10px]">Opgezegd</Badge>
    case "paused":
      return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px]">Gepauzeerd</Badge>
    default: return null
  }
}

function getPeriodeLabel(periode: string) {
  switch (periode) {
    case "1m": return "Maandelijks"
    case "6m": return "6 maanden"
    case "12m": return "12 maanden"
    case "24m": return "24 maanden"
    default: return periode
  }
}

// ============================================================================
// HOOFDCOMPONENT
// ============================================================================

export function BillingSection() {
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [factuurDialogOpen, setFactuurDialogOpen] = useState(false)
  const [stripeConnected] = useState(true) // Stripe Connect status

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Facturatie</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Betalingen, abonnementen, facturen en Stripe beheer</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border">
            <Download className="size-3.5" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs border-border" onClick={() => setFactuurDialogOpen(true)}>
            <Receipt className="size-3.5" />
            Factuur aanmaken
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => setPlanDialogOpen(true)}>
            <Plus className="size-3.5" />
            Nieuw plan
          </Button>
        </div>
      </div>

      {/* Stripe connectie banner */}
      {!stripeConnected && (
        <Card className="border-chart-5/30 bg-chart-5/5 p-0 gap-0">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                <CreditCard className="size-5 text-chart-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Stripe koppelen</p>
                <p className="text-xs text-muted-foreground">Verbind je Stripe account om betalingen te ontvangen, facturen te versturen en abonnementen te beheren.</p>
              </div>
            </div>
            <Button size="sm" className="gap-1.5 text-xs bg-chart-5 text-white hover:bg-chart-5/90">
              <ExternalLink className="size-3.5" />
              Verbind Stripe
            </Button>
          </CardContent>
        </Card>
      )}

      {/* KPI's */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        {facturatieStats.map((stat) => (
          <Card key={stat.titel} className="border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
                  <stat.icon className="size-4 text-primary" />
                </div>
                <div className={cn(
                  "flex items-center gap-0.5 text-[10px] font-medium",
                  stat.positief ? "text-success" : "text-destructive"
                )}>
                  {stat.positief ? <ArrowUpRight className="size-2.5" /> : <ArrowDownRight className="size-2.5" />}
                  {stat.verandering}
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">{stat.waarde}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{stat.beschrijving}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="betalingen">
        <TabsList>
          <TabsTrigger value="betalingen">Betalingen</TabsTrigger>
          <TabsTrigger value="abonnementen">Abonnementen</TabsTrigger>
          <TabsTrigger value="plannen">Plannen & Prijzen</TabsTrigger>
          <TabsTrigger value="instellingen">Instellingen</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: BETALINGEN --- */}
        <TabsContent value="betalingen" className="mt-4">
          <Card className="border-border shadow-sm p-0 gap-0">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Input placeholder="Zoek op naam of factuurnr..." className="w-64 h-8 text-xs" />
                  <Select defaultValue="alle">
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle">Alle statussen</SelectItem>
                      <SelectItem value="succeeded">Betaald</SelectItem>
                      <SelectItem value="failed">Mislukt</SelectItem>
                      <SelectItem value="pending">In afwachting</SelectItem>
                      <SelectItem value="refunded">Terugbetaald</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Client</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Plan / Periode</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Bedrag</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Methode</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Datum</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Factuur</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Status</th>
                      <th className="text-right text-[11px] font-medium text-muted-foreground px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recenteBetalingen.map((b, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-7">
                              <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">{b.initialen}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs font-medium text-foreground">{b.naam}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs text-foreground">{b.plan}</span>
                          <span className="text-[10px] text-muted-foreground ml-1.5">{b.periode}</span>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{formatBedrag(b.bedrag)}</td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{b.methode}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{b.datum}</td>
                        <td className="px-4 py-2.5">
                          <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground px-1.5">
                            <FileText className="size-3" />
                            {b.factuurNr}
                          </Button>
                        </td>
                        <td className="px-4 py-2.5">{getBetalingStatus(b.status)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground"><MoreHorizontal className="size-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 size-3.5" />Bekijk factuur</DropdownMenuItem>
                              <DropdownMenuItem><Download className="mr-2 size-3.5" />Download PDF</DropdownMenuItem>
                              <DropdownMenuItem><Send className="mr-2 size-3.5" />Stuur herinnering</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive"><RefreshCw className="mr-2 size-3.5" />Terugbetaling</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: ABONNEMENTEN --- */}
        <TabsContent value="abonnementen" className="mt-4">
          <Card className="border-border shadow-sm p-0 gap-0">
            <CardContent className="p-0">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Input placeholder="Zoek client..." className="w-56 h-8 text-xs" />
                  <Select defaultValue="alle">
                    <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle">Alle statussen</SelectItem>
                      <SelectItem value="active">Actief</SelectItem>
                      <SelectItem value="trialing">Proefperiode</SelectItem>
                      <SelectItem value="past_due">Achterstallig</SelectItem>
                      <SelectItem value="canceled">Opgezegd</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select defaultValue="alle-plannen">
                    <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle-plannen">Alle plannen</SelectItem>
                      <SelectItem value="standaard">Standaard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="wedstrijd">Wedstrijd Prep</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Client</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Plan</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Periode</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Bedrag/mnd</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Methode</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Volgende betaling</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Status</th>
                      <th className="text-right text-[11px] font-medium text-muted-foreground px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {actieveAbonnementen.map((a, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-secondary/30 transition-colors">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar className="size-7">
                              <AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">{a.initialen}</AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="text-xs font-medium text-foreground block">{a.naam}</span>
                              <span className="text-[10px] text-muted-foreground">Sinds {a.startDatum}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-medium text-foreground">{a.plan}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{getPeriodeLabel(a.periode)}</td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{formatBedrag(a.bedrag)}</td>
                        <td className="px-4 py-2.5 text-[11px] text-muted-foreground">{a.methode}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{a.volgendeBetaling}</td>
                        <td className="px-4 py-2.5">{getAbonnementStatus(a.status)}</td>
                        <td className="px-4 py-2.5 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground"><MoreHorizontal className="size-3.5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Edit2 className="mr-2 size-3.5" />Plan wijzigen</DropdownMenuItem>
                              <DropdownMenuItem><CalendarDays className="mr-2 size-3.5" />Periode wijzigen</DropdownMenuItem>
                              <DropdownMenuItem><CreditCard className="mr-2 size-3.5" />Betaalmethode</DropdownMenuItem>
                              <DropdownMenuItem><Mail className="mr-2 size-3.5" />Stuur herinnering</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem><Clock className="mr-2 size-3.5" />Pauzeren</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive"><Ban className="mr-2 size-3.5" />Opzeggen</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 3: PLANNEN & PRIJZEN --- */}
        <TabsContent value="plannen" className="mt-4">
          <div className="flex flex-col gap-4">
            {abonnementsPlannen.map((plan) => (
              <Card key={plan.id} className="border-border shadow-sm p-0 gap-0 overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-start justify-between p-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-foreground">{plan.naam}</h3>
                        {plan.isActief ? (
                          <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Actief</Badge>
                        ) : (
                          <Badge className="bg-muted text-muted-foreground border-border text-[10px]">Inactief</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-3">{plan.beschrijving}</p>

                      {/* Prijzen per periode */}
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-4">
                        <div className="rounded-lg border border-border p-3 bg-card">
                          <p className="text-[10px] text-muted-foreground mb-1">Maandelijks</p>
                          <p className="text-sm font-bold text-foreground">{formatBedrag(plan.maandPrijsCenten)}</p>
                          <p className="text-[10px] text-muted-foreground">/maand</p>
                        </div>
                        <div className="rounded-lg border border-border p-3 bg-card">
                          <p className="text-[10px] text-muted-foreground mb-1">6 maanden</p>
                          <p className="text-sm font-bold text-foreground">{formatBedrag(berekenPeriodePrijs(plan.maandPrijsCenten, plan.korting6m))}</p>
                          <p className="text-[10px] text-success font-medium">-{plan.korting6m}% korting</p>
                        </div>
                        <div className="rounded-lg border border-border p-3 bg-card">
                          <p className="text-[10px] text-muted-foreground mb-1">12 maanden</p>
                          <p className="text-sm font-bold text-foreground">{formatBedrag(berekenPeriodePrijs(plan.maandPrijsCenten, plan.korting12m))}</p>
                          <p className="text-[10px] text-success font-medium">-{plan.korting12m}% korting</p>
                        </div>
                        <div className="rounded-lg border border-border p-3 bg-card">
                          <p className="text-[10px] text-muted-foreground mb-1">24 maanden</p>
                          <p className="text-sm font-bold text-foreground">{formatBedrag(berekenPeriodePrijs(plan.maandPrijsCenten, plan.korting24m))}</p>
                          <p className="text-[10px] text-success font-medium">-{plan.korting24m}% korting</p>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {plan.functies.map((f) => (
                          <div key={f} className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <CheckCircle2 className="size-3 text-primary shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>{plan.clienten}/{plan.maxClienten} clienten</span>
                        {plan.proefDagen > 0 && <span>{plan.proefDagen} dagen proefperiode</span>}
                        <span>21% BTW</span>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground shrink-0"><MoreHorizontal className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Edit2 className="mr-2 size-3.5" />Plan bewerken</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="mr-2 size-3.5" />Dupliceren</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>{plan.isActief ? <Ban className="mr-2 size-3.5" /> : <CheckCircle2 className="mr-2 size-3.5" />}{plan.isActief ? "Deactiveren" : "Activeren"}</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 size-3.5" />Verwijderen</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Nieuw plan toevoegen */}
            <Card className="border-border border-dashed shadow-sm cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setPlanDialogOpen(true)}>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Plus className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Nieuw plan toevoegen</p>
                <p className="text-xs text-muted-foreground mt-0.5">Maak een nieuw abonnementsplan met flexibele perioden en prijzen</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* --- TAB 4: INSTELLINGEN --- */}
        <TabsContent value="instellingen" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Stripe connectie */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                    <CreditCard className="size-5 text-chart-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">Stripe Account</h3>
                    <p className="text-[11px] text-muted-foreground">Betalingsverwerking & automatische incasso</p>
                  </div>
                  <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Verbonden</Badge>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Account ID</span>
                    <span className="font-mono text-foreground">acct_1Nv0...X4qR</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Webhooks</span>
                    <Badge className="bg-success/10 text-success border-success/20 text-[9px]">Actief</Badge>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-muted-foreground">Modus</span>
                    <Badge variant="outline" className="text-[9px]">Live</Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 w-full">
                  <ExternalLink className="size-3.5" />
                  Stripe Dashboard openen
                </Button>
              </CardContent>
            </Card>

            {/* Betaalmethoden */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="size-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Betaalmethoden</h3>
                    <p className="text-[11px] text-muted-foreground">Welke methoden mogen clienten gebruiken</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {[
                    { naam: "iDEAL", desc: "Nederlandse banken (primair)", actief: true },
                    { naam: "SEPA Automatische Incasso", desc: "Voor terugkerende betalingen", actief: true },
                    { naam: "Creditcard", desc: "Visa, Mastercard", actief: true },
                    { naam: "Bancontact", desc: "Belgische clienten", actief: false },
                  ].map((m) => (
                    <div key={m.naam} className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-foreground">{m.naam}</p>
                        <p className="text-[10px] text-muted-foreground">{m.desc}</p>
                      </div>
                      <Switch defaultChecked={m.actief} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Factuur instellingen */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground">Factuur instellingen</h3>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Bedrijfsnaam</label>
                    <Input defaultValue="CoachHub B.V." className="text-sm h-8" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">KvK-nummer</label>
                      <Input defaultValue="12345678" className="text-sm h-8" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">BTW-nummer</label>
                      <Input defaultValue="NL123456789B01" className="text-sm h-8" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Factuur prefix</label>
                    <Input defaultValue="FT" className="text-sm h-8" />
                    <p className="text-[10px] text-muted-foreground">Voorbeeld: FT-2026-0001</p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">BTW percentage</label>
                    <Select defaultValue="21">
                      <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">0% (vrijgesteld)</SelectItem>
                        <SelectItem value="9">9% (laag tarief)</SelectItem>
                        <SelectItem value="21">21% (standaard)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dunning / mislukte betalingen */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground">Mislukte betalingen</h3>
                <p className="text-[11px] text-muted-foreground">Wat gebeurt er als een automatische incasso mislukt</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Automatisch opnieuw proberen</p>
                      <p className="text-[10px] text-muted-foreground">Stripe probeert 3x automatisch (Smart Retries)</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">E-mail bij mislukte betaling</p>
                      <p className="text-[10px] text-muted-foreground">Stuur client een herinnering per e-mail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Coach notificatie</p>
                      <p className="text-[10px] text-muted-foreground">Notificeer coach na 2e mislukte poging</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Annuleer na (dagen)</label>
                    <Select defaultValue="30">
                      <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14">14 dagen</SelectItem>
                        <SelectItem value="30">30 dagen</SelectItem>
                        <SelectItem value="60">60 dagen</SelectItem>
                        <SelectItem value="nooit">Nooit automatisch annuleren</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-[10px] text-muted-foreground">Abonnement wordt automatisch geannuleerd na X dagen onbetaald</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}

      {/* Nieuw plan dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nieuw abonnementsplan</DialogTitle>
            <DialogDescription>Maak een nieuw plan aan. Prijzen en perioden worden automatisch als Stripe Product + Prices aangemaakt.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Plannaam</label>
              <Input placeholder="bijv. Standaard, Premium, VIP..." className="text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Beschrijving</label>
              <Textarea placeholder="Korte beschrijving van het plan..." rows={2} className="text-sm resize-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Maandprijs (excl. BTW)</label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">{"\u20AC"}</span>
                <Input type="number" placeholder="89.00" step="0.01" min="0" className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-foreground">Korting 6 mnd</label>
                <div className="flex items-center gap-1">
                  <Input type="number" defaultValue={10} min={0} max={50} className="text-sm" />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-foreground">Korting 12 mnd</label>
                <div className="flex items-center gap-1">
                  <Input type="number" defaultValue={20} min={0} max={50} className="text-sm" />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-medium text-foreground">Korting 24 mnd</label>
                <div className="flex items-center gap-1">
                  <Input type="number" defaultValue={30} min={0} max={50} className="text-sm" />
                  <span className="text-xs text-muted-foreground">%</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Proefperiode (dagen)</label>
                <Input type="number" defaultValue={7} min={0} className="text-sm" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Max clienten</label>
                <Input type="number" defaultValue={50} min={1} className="text-sm" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Functies (1 per regel)</label>
              <Textarea placeholder={"Trainingsprogramma's\nVoedingsplan\nWekelijkse check-in\nChat support"} rows={4} className="text-sm resize-none" />
            </div>
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-2">
                <Switch defaultChecked />
                <label className="text-xs text-muted-foreground">Direct activeren</label>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-chart-4" />
                <label className="text-xs text-chart-4 font-medium">Stripe Product wordt automatisch aangemaakt</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Annuleren</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Plus className="size-3.5" />
              Plan aanmaken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Handmatige factuur dialog */}
      <Dialog open={factuurDialogOpen} onOpenChange={setFactuurDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Factuur aanmaken</DialogTitle>
            <DialogDescription>Maak een handmatige factuur aan voor losse diensten of producten. Wordt via Stripe Invoice API verstuurd.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Client</label>
              <Select>
                <SelectTrigger className="text-sm"><SelectValue placeholder="Selecteer een client..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah van Dijk</SelectItem>
                  <SelectItem value="tom">Tom Bakker</SelectItem>
                  <SelectItem value="lisa">Lisa de Vries</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Factuurregels */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-foreground">Regels</label>
              <div className="rounded-lg border border-border p-3 flex flex-col gap-2">
                <div className="grid grid-cols-[1fr_80px_80px] gap-2 items-end">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground">Omschrijving</label>
                    <Input placeholder="bijv. Extra PT sessie" className="text-sm h-8" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground">Aantal</label>
                    <Input type="number" defaultValue={1} min={1} className="text-sm h-8" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-muted-foreground">Prijs ({"\u20AC"})</label>
                    <Input type="number" placeholder="50.00" step="0.01" className="text-sm h-8" />
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1 border-dashed w-full">
                <Plus className="size-3" />
                Regel toevoegen
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Vervaldatum</label>
                <Select defaultValue="14">
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dagen</SelectItem>
                    <SelectItem value="14">14 dagen</SelectItem>
                    <SelectItem value="30">30 dagen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">BTW</label>
                <Select defaultValue="21">
                  <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">0%</SelectItem>
                    <SelectItem value="9">9%</SelectItem>
                    <SelectItem value="21">21%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Notitie (optioneel)</label>
              <Textarea placeholder="Extra informatie op de factuur..." rows={2} className="text-sm resize-none" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFactuurDialogOpen(false)}>Annuleren</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Send className="size-3.5" />
              Factuur versturen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
