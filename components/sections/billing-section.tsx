"use client"

import { useState } from "react"
import {
  CreditCard, DollarSign, Users, ArrowUpRight, ArrowDownRight, Download, Receipt, CheckCircle2,
  AlertCircle, Clock, Plus, MoreHorizontal, Trash2, Copy, Send, Eye, Edit2, RefreshCw,
  TrendingUp, Percent, CalendarDays, Ban, FileText, Mail, ExternalLink, Settings, Sparkles,
  Link2, Globe, GraduationCap, ShieldCheck, X
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
// ADMIN-ONLY SECTIE: Dit component wordt gebruikt in /admin -> Facturatie tab.
// Alleen admins mogen financiele data zien. Coaches hebben GEEN toegang.
// RLS: Alle queries hier vereisen users.rol = "admin"
//
// ============================================================================
// STRIPE INTEGRATIE ARCHITECTUUR
// ============================================================================
//
// A. STRIPE PRODUCTEN & PRIJZEN
//    - Elk pakket (subscription_plans) = 1 Stripe Product
//    - Elk pakket heeft 4 Stripe Prices (1m, 6m, 12m, 24m)
//    - Bij aanmaken pakket:
//      1. stripe.products.create({ name, description, metadata: { plan_id } })
//      2. stripe.prices.create({ product, unit_amount, currency: "eur", recurring: { interval, interval_count } }) x4
//      3. Sla stripe_product_id + stripe_price_ids op in subscription_plans
//    - Bij VERWIJDEREN pakket:
//      1. stripe.products.update(id, { active: false }) — NOOIT deleten, archiveren
//      2. stripe.prices.update(price_id, { active: false }) — per price
//      3. Bestaande subscriptions op dit product lopen door tot einde periode
//      4. Markeer subscription_plans.is_actief = false in Supabase
//      5. Verwijder bijbehorende payment link (stripe.paymentLinks.update(id, { active: false }))
//    - Bij BEWERKEN pakket (prijs wijzigen):
//      1. Stripe Prices zijn IMMUTABLE — maak nieuwe Prices aan
//      2. Bestaande subscriptions behouden hun oude prijs
//      3. Nieuwe subscriptions krijgen de nieuwe prijs
//      4. Optioneel: migrate bestaande subs via stripe.subscriptions.update()
//
// B. STRIPE PAYMENT LINKS (per pakket, per periode)
//    - Bij aanmaken pakket worden 4 Payment Links gegenereerd:
//      stripe.paymentLinks.create({
//        line_items: [{ price: price_id, quantity: 1 }],
//        after_completion: { type: "redirect", redirect: { url: "https://app.coachhub.nl/welkom" } },
//        metadata: { plan_id, periode },
//        allow_promotion_codes: true,
//        billing_address_collection: "auto",
//        phone_number_collection: { enabled: false },
//        custom_text: { submit: { message: "Je abonnement start direct na betaling." } }
//      })
//    - Payment Links worden opgeslagen in subscription_plans.stripe_payment_links
//      (jsonb: { "1m": "https://buy.stripe.com/xxx", "6m": "...", "12m": "...", "24m": "..." })
//    - LANDING PAGINA: Elke plan krijgt een publieke landingspagina:
//      /prijzen/[plan-slug] — toont plan details + periode keuze + CTA naar Payment Link
//    - Kopieerbare links: Admin kan payment link URL kopieren voor marketing/socials
//    - QR codes: Genereer QR code per payment link (voor flyers, gym posters etc.)
//
// C. ABONNEMENTEN & AUTOMATISCHE INCASSO
//    - Bij client aanmaken via Payment Link: Stripe maakt automatisch Customer + Subscription
//    - Handmatig via dashboard: stripe.customers.create() + stripe.subscriptions.create()
//    - Automatische incasso via SEPA Direct Debit / iDEAL / Card
//    - Proeftijd: trial_period_days instelbaar per plan
//    - Bij opzegging: cancel_at_period_end = true (loopt door tot einde periode)
//
// D. FACTUREN
//    - Stripe genereert automatisch facturen bij elke subscription renewal
//    - Handmatige facturen: Stripe Invoice API voor losse diensten
//    - BTW (21%), KvK, BTW-nummer in factuur instellingen
//    - PDF download via Stripe hosted_invoice_url
//
// E. WEBHOOKS (Stripe -> API route / Supabase Edge Function)
//    - checkout.session.completed     -> client account aanmaken + subscription record
//    - invoice.payment_succeeded      -> payments record + status update
//    - invoice.payment_failed         -> notificatie naar coach + client
//    - customer.subscription.updated  -> plan/status wijziging sync
//    - customer.subscription.deleted  -> abonnement geannuleerd
//    - payment_method.attached        -> betaalmethode opslaan
//    - payment_link.created/updated   -> payment link sync
//
// F. DUNNING (MISLUKTE BETALINGEN)
//    - Stripe Smart Retries: automatisch 3x opnieuw proberen
//    - Escalatie: e-mail client -> notificatie coach -> annulering
//
// G. TERUGBETALINGEN
//    - Via Stripe Refund API: volledig of gedeeltelijk
//    - Creditnota automatisch gegenereerd
//
// ============================================================================
// SUPABASE TABELLEN
// ============================================================================
//
// subscription_plans:
//   - id, naam, slug, beschrijving, maand_prijs_centen
//   - korting_6m, korting_12m, korting_24m (integer %)
//   - proef_dagen, max_clienten, is_actief, is_populair
//   - features (jsonb: ["training_programma", "maatwerk_voeding", ...])
//   - exclusieve_courses (jsonb: [course_id, ...])
//   - all_courses_included (boolean)
//   - stripe_product_id, stripe_prices (jsonb: { "1m": "price_xxx", ... })
//   - stripe_payment_links (jsonb: { "1m": "https://buy.stripe.com/xxx", ... })
//   - landing_pagina_url (string, bijv. "/prijzen/premium")
//   - btw_percentage (default 21)
//   - created_at, updated_at
//
// plan_feature_definitions:
//   - id, key, label, beschrijving, categorie, volgorde
//   - Categorieen: "coaching" | "voeding" | "support" | "extra"
//
// client_subscriptions:
//   - id, client_id, plan_id
//   - stripe_subscription_id, stripe_customer_id
//   - status: "active" | "trialing" | "past_due" | "canceled" | "paused"
//   - periode: "1m" | "6m" | "12m" | "24m"
//   - huidige_periode_start, huidige_periode_einde
//   - proef_einde, opzeg_datum
//   - maand_bedrag_centen, valuta
//   - betaalmethode, automatische_incasso
//   - created_at, updated_at
//
// payments:
//   - id, client_id, subscription_id
//   - stripe_payment_intent_id, stripe_invoice_id
//   - bedrag_centen, btw_centen, totaal_centen, valuta
//   - status: "succeeded" | "pending" | "failed" | "refunded"
//   - betaalmethode, beschrijving, factuur_url
//   - terugbetaling_bedrag_centen, terugbetaling_reden
//   - created_at
//
// invoices:
//   - id, client_id, payment_id
//   - stripe_invoice_id, factuur_nummer
//   - bedrag_centen, btw_centen, totaal_centen
//   - status: "draft" | "open" | "paid" | "void"
//   - vervaldatum, betaald_op, pdf_url
//   - regels (jsonb), bedrijfsgegevens (jsonb)
//   - created_at
//
// ============================================================================

// --- Feature & Course definities -------------------------------------------

const allePlanFeatures = [
  { key: "training_programma", label: "Trainingsprogramma", categorie: "coaching" },
  { key: "basis_voeding", label: "Basis voedingsplan", categorie: "voeding" },
  { key: "maatwerk_voeding", label: "Maatwerk voedingsplan", categorie: "voeding" },
  { key: "wekelijkse_checkin", label: "Wekelijkse check-in", categorie: "coaching" },
  { key: "2x_checkin", label: "2x check-in per week", categorie: "coaching" },
  { key: "dagelijkse_checkin", label: "Dagelijkse check-in", categorie: "coaching" },
  { key: "chat_support", label: "Chat support", categorie: "support" },
  { key: "prioriteit_support", label: "Prioriteit support", categorie: "support" },
  { key: "24_7_support", label: "24/7 support", categorie: "support" },
  { key: "video_calls", label: "Videogesprekken", categorie: "coaching" },
  { key: "pt_sessies", label: "PT sessies (fysiek)", categorie: "extra" },
  { key: "wedstrijd_begeleiding", label: "Wedstrijdbegeleiding", categorie: "extra" },
  { key: "barcode_scanner", label: "Barcode scanner voeding", categorie: "voeding" },
  { key: "ai_coach", label: "AI Coach assistent", categorie: "extra" },
]

const beschikbareCourses = [
  { id: "course-1", titel: "Krachttraining Fundamenten", categorie: "krachttraining" },
  { id: "course-2", titel: "Voeding & Macros Masterclass", categorie: "voeding" },
  { id: "course-3", titel: "Mindset & Discipline", categorie: "mindset" },
  { id: "course-4", titel: "Wedstrijd Prep Complete Guide", categorie: "krachttraining" },
  { id: "course-5", titel: "Herstel & Mobiliteit", categorie: "herstel" },
  { id: "course-6", titel: "Supplementen Gids", categorie: "voeding" },
]

const categorieFeatureLabels: Record<string, string> = {
  coaching: "Coaching",
  voeding: "Voeding",
  support: "Support",
  extra: "Extra",
}

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
  { naam: "Sarah van Dijk", initialen: "SD", bedrag: 11900, plan: "Premium", periode: "Maandelijks", datum: "20 feb 2026", status: "succeeded" as const, methode: "iDEAL", factuurNr: "FT-2026-0042" },
  { naam: "Tom Bakker", initialen: "TB", bedrag: 6900, plan: "Basis", periode: "Maandelijks", datum: "20 feb 2026", status: "succeeded" as const, methode: "SEPA", factuurNr: "FT-2026-0041" },
  { naam: "Lisa de Vries", initialen: "LV", bedrag: 19900, plan: "All-Inclusive", periode: "Maandelijks", datum: "19 feb 2026", status: "succeeded" as const, methode: "iDEAL", factuurNr: "FT-2026-0040" },
  { naam: "James Peters", initialen: "JP", bedrag: 6900, plan: "Basis", periode: "Maandelijks", datum: "18 feb 2026", status: "failed" as const, methode: "SEPA", factuurNr: "FT-2026-0039" },
  { naam: "Emma Jansen", initialen: "EJ", bedrag: 10710, plan: "Premium", periode: "6 maanden", datum: "18 feb 2026", status: "succeeded" as const, methode: "Card", factuurNr: "FT-2026-0038" },
  { naam: "Marco Visser", initialen: "MV", bedrag: 5520, plan: "Basis", periode: "12 maanden", datum: "17 feb 2026", status: "succeeded" as const, methode: "iDEAL", factuurNr: "FT-2026-0037" },
]

const pakketten = [
  {
    id: "plan-1", naam: "Basis", slug: "basis",
    beschrijving: "Online coaching met trainingsprogramma en basis begeleiding",
    maandPrijsCenten: 6900, korting6m: 10, korting12m: 20, korting24m: 30, proefDagen: 7,
    clienten: 22, maxClienten: 50, isActief: true, isPopulair: false,
    features: ["training_programma", "basis_voeding", "wekelijkse_checkin", "chat_support", "barcode_scanner"],
    exclusieveCourses: ["course-1"],
    allCoursesIncluded: false,
    paymentLinks: { "1m": "https://buy.stripe.com/bk_test_basis_1m", "6m": "https://buy.stripe.com/bk_test_basis_6m", "12m": "https://buy.stripe.com/bk_test_basis_12m", "24m": "https://buy.stripe.com/bk_test_basis_24m" },
    landingUrl: "/prijzen/basis",
  },
  {
    id: "plan-2", naam: "Premium", slug: "premium",
    beschrijving: "Intensieve online coaching met maatwerk voeding en videogesprekken",
    maandPrijsCenten: 11900, korting6m: 10, korting12m: 15, korting24m: 25, proefDagen: 7,
    clienten: 15, maxClienten: 30, isActief: true, isPopulair: true,
    features: ["training_programma", "maatwerk_voeding", "2x_checkin", "chat_support", "prioriteit_support", "video_calls", "barcode_scanner", "ai_coach"],
    exclusieveCourses: ["course-1", "course-2", "course-3", "course-5"],
    allCoursesIncluded: false,
    paymentLinks: { "1m": "https://buy.stripe.com/bk_test_premium_1m", "6m": "https://buy.stripe.com/bk_test_premium_6m", "12m": "https://buy.stripe.com/bk_test_premium_12m", "24m": "https://buy.stripe.com/bk_test_premium_24m" },
    landingUrl: "/prijzen/premium",
  },
  {
    id: "plan-3", naam: "All-Inclusive", slug: "all-inclusive",
    beschrijving: "Volledige coaching ervaring met alle courses, PT sessies en 24/7 support",
    maandPrijsCenten: 19900, korting6m: 5, korting12m: 10, korting24m: 15, proefDagen: 0,
    clienten: 5, maxClienten: 10, isActief: true, isPopulair: false,
    features: ["training_programma", "maatwerk_voeding", "dagelijkse_checkin", "24_7_support", "video_calls", "pt_sessies", "wedstrijd_begeleiding", "barcode_scanner", "ai_coach"],
    exclusieveCourses: [],
    allCoursesIncluded: true,
    paymentLinks: { "1m": "https://buy.stripe.com/bk_test_allinc_1m", "6m": "https://buy.stripe.com/bk_test_allinc_6m", "12m": "https://buy.stripe.com/bk_test_allinc_12m", "24m": "https://buy.stripe.com/bk_test_allinc_24m" },
    landingUrl: "/prijzen/all-inclusive",
  },
]

const actieveAbonnementen = [
  { naam: "Sarah van Dijk", initialen: "SD", plan: "Premium", periode: "1m", bedrag: 11900, status: "active" as const, methode: "SEPA", volgendeBetaling: "20 mrt 2026", startDatum: "20 jan 2025" },
  { naam: "Tom Bakker", initialen: "TB", plan: "Basis", periode: "12m", bedrag: 5520, status: "active" as const, methode: "iDEAL", volgendeBetaling: "15 jun 2026", startDatum: "15 jun 2025" },
  { naam: "Lisa de Vries", initialen: "LV", plan: "All-Inclusive", periode: "6m", bedrag: 18905, status: "active" as const, methode: "iDEAL", volgendeBetaling: "1 apr 2026", startDatum: "1 okt 2025" },
  { naam: "James Peters", initialen: "JP", plan: "Basis", periode: "1m", bedrag: 6900, status: "past_due" as const, methode: "SEPA", volgendeBetaling: "Achterstallig", startDatum: "10 sep 2025" },
  { naam: "Emma Jansen", initialen: "EJ", plan: "Premium", periode: "6m", bedrag: 10710, status: "active" as const, methode: "Card", volgendeBetaling: "18 apr 2026", startDatum: "18 okt 2025" },
  { naam: "Marco Visser", initialen: "MV", plan: "Basis", periode: "1m", bedrag: 6900, status: "trialing" as const, methode: "-", volgendeBetaling: "24 feb 2026", startDatum: "17 feb 2026" },
  { naam: "Nina de Boer", initialen: "NB", plan: "All-Inclusive", periode: "24m", bedrag: 16915, status: "active" as const, methode: "SEPA", volgendeBetaling: "1 mrt 2026", startDatum: "1 mrt 2024" },
]

// --- Helpers ----------------------------------------------------------------

function formatBedrag(centen: number): string {
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" }).format(centen / 100)
}

function berekenPeriodePrijs(maandCenten: number, kortingPct: number): number {
  return Math.round(maandCenten * (1 - kortingPct / 100))
}

function getBetalingStatus(status: string) {
  switch (status) {
    case "succeeded": return <Badge className="bg-success/10 text-success border-success/20 text-[10px] gap-1"><CheckCircle2 className="size-2.5" />Betaald</Badge>
    case "failed": return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] gap-1"><AlertCircle className="size-2.5" />Mislukt</Badge>
    case "pending": return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px] gap-1"><Clock className="size-2.5" />In afwachting</Badge>
    case "refunded": return <Badge className="bg-muted text-muted-foreground border-border text-[10px] gap-1"><RefreshCw className="size-2.5" />Terugbetaald</Badge>
    default: return null
  }
}

function getAbonnementStatus(status: string) {
  switch (status) {
    case "active": return <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Actief</Badge>
    case "trialing": return <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-[10px]">Proefperiode</Badge>
    case "past_due": return <Badge className="bg-destructive/10 text-destructive border-destructive/20 text-[10px]">Achterstallig</Badge>
    case "canceled": return <Badge className="bg-muted text-muted-foreground border-border text-[10px]">Opgezegd</Badge>
    case "paused": return <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[10px]">Gepauzeerd</Badge>
    default: return null
  }
}

function getPeriodeLabel(p: string) {
  switch (p) { case "1m": return "Maandelijks"; case "6m": return "6 maanden"; case "12m": return "12 maanden"; case "24m": return "24 maanden"; default: return p }
}

// ============================================================================
// HOOFDCOMPONENT
// ============================================================================

export function BillingSection() {
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [factuurDialogOpen, setFactuurDialogOpen] = useState(false)
  const [linksDialogPakket, setLinksDialogPakket] = useState<typeof pakketten[0] | null>(null)
  const [stripeConnected] = useState(true)
  const [bewerkPakketId, setBewerkPakketId] = useState<string | null>(null)

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
            Nieuw pakket
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
                <p className="text-xs text-muted-foreground">Verbind je Stripe account om betalingen te ontvangen en abonnementen te beheren.</p>
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
                <div className={cn("flex items-center gap-0.5 text-[10px] font-medium", stat.positief ? "text-success" : "text-destructive")}>
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
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Pakket / Periode</th>
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
                            <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">{b.initialen}</AvatarFallback></Avatar>
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
                            <FileText className="size-3" />{b.factuurNr}
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
                      <SelectItem value="alle-plannen">Alle pakketten</SelectItem>
                      <SelectItem value="basis">Basis</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="all-inclusive">All-Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Client</th>
                      <th className="text-left text-[11px] font-medium text-muted-foreground px-4 py-2.5">Pakket</th>
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
                            <Avatar className="size-7"><AvatarFallback className="bg-primary/10 text-primary text-[9px] font-semibold">{a.initialen}</AvatarFallback></Avatar>
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
                              <DropdownMenuItem><Edit2 className="mr-2 size-3.5" />Pakket wijzigen</DropdownMenuItem>
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
          <div className="flex flex-col gap-6">
            {pakketten.map((pakket) => {
              const isOpen = bewerkPakketId === pakket.id
              const inclusieveFeatures = allePlanFeatures.filter((f) => pakket.features.includes(f.key))
              const exclusieveFeatures = allePlanFeatures.filter((f) => !pakket.features.includes(f.key))
              const inclCourses = beschikbareCourses.filter((c) => pakket.exclusieveCourses.includes(c.id))

              return (
                <Card key={pakket.id} className={cn("border-border shadow-sm p-0 gap-0 overflow-hidden", pakket.isPopulair && "ring-1 ring-primary/30")}>
                  {/* Compacte pakket header — altijd zichtbaar */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Links: naam, prijs, badges */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={cn(
                          "flex size-12 items-center justify-center rounded-xl shrink-0",
                          pakket.isPopulair ? "bg-primary/10" : "bg-secondary"
                        )}>
                          <ShieldCheck className={cn("size-6", pakket.isPopulair ? "text-primary" : "text-muted-foreground")} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-foreground">{pakket.naam}</h3>
                            {pakket.isPopulair && <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">Meest gekozen</Badge>}
                            {pakket.isActief ? (
                              <Badge className="bg-success/10 text-success border-success/20 text-[10px]">Actief</Badge>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground border-border text-[10px]">Inactief</Badge>
                            )}
                            {pakket.allCoursesIncluded && (
                              <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/20 text-[10px] gap-1">
                                <GraduationCap className="size-2.5" />Alle courses
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{pakket.beschrijving}</p>

                          {/* Compacte prijs + features samenvatting */}
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-bold text-foreground">{formatBedrag(pakket.maandPrijsCenten)}</span>
                              <span className="text-xs text-muted-foreground">/mnd</span>
                            </div>
                            <div className="h-5 w-px bg-border" />
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {inclusieveFeatures.slice(0, 4).map((f) => (
                                <Badge key={f.key} variant="outline" className="text-[9px] border-border bg-secondary/50 font-normal">{f.label}</Badge>
                              ))}
                              {inclusieveFeatures.length > 4 && (
                                <Badge variant="outline" className="text-[9px] border-border bg-secondary/50 font-normal">+{inclusieveFeatures.length - 4} meer</Badge>
                              )}
                            </div>
                            <div className="h-5 w-px bg-border" />
                            <span className="text-[10px] text-muted-foreground">{pakket.clienten}/{pakket.maxClienten} clienten</span>
                          </div>
                        </div>
                      </div>

                      {/* Rechts: acties */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5 border-border" onClick={() => setLinksDialogPakket(pakket)}>
                          <Link2 className="size-3" />
                          Links
                        </Button>
                        <Button variant="outline" size="sm" className="h-8 text-[11px] gap-1.5 border-border" onClick={() => setBewerkPakketId(isOpen ? null : pakket.id)}>
                          <Edit2 className="size-3" />
                          {isOpen ? "Sluiten" : "Bewerken"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground"><MoreHorizontal className="size-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Copy className="mr-2 size-3.5" />Dupliceren</DropdownMenuItem>
                            <DropdownMenuItem><Globe className="mr-2 size-3.5" />Bekijk landingspagina</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>{pakket.isActief ? <Ban className="mr-2 size-3.5" /> : <CheckCircle2 className="mr-2 size-3.5" />}{pakket.isActief ? "Deactiveren" : "Activeren"}</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 size-3.5" />Verwijderen</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>

                    {/* Periode prijzen — altijd zichtbaar, compact */}
                    <div className="grid grid-cols-4 gap-2 mt-4">
                      {[
                        { label: "1 maand", prijs: pakket.maandPrijsCenten, korting: 0 },
                        { label: "6 maanden", prijs: berekenPeriodePrijs(pakket.maandPrijsCenten, pakket.korting6m), korting: pakket.korting6m },
                        { label: "12 maanden", prijs: berekenPeriodePrijs(pakket.maandPrijsCenten, pakket.korting12m), korting: pakket.korting12m },
                        { label: "24 maanden", prijs: berekenPeriodePrijs(pakket.maandPrijsCenten, pakket.korting24m), korting: pakket.korting24m },
                      ].map((p) => (
                        <div key={p.label} className="rounded-lg border border-border px-3 py-2 bg-card">
                          <p className="text-[10px] text-muted-foreground">{p.label}</p>
                          <p className="text-sm font-bold text-foreground mt-0.5">{formatBedrag(p.prijs)}<span className="text-[10px] font-normal text-muted-foreground">/mnd</span></p>
                          {p.korting > 0 && <p className="text-[10px] text-success font-medium">-{p.korting}% korting</p>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Uitklapbaar bewerk-paneel */}
                  {isOpen && (
                    <div className="border-t border-border p-5 bg-secondary/20">
                      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        {/* Links: Features */}
                        <div className="flex flex-col gap-3">
                          <h4 className="text-xs font-semibold text-foreground">Features</h4>
                          <div className="rounded-lg border border-border overflow-hidden bg-card">
                            {(["coaching", "voeding", "support", "extra"] as const).map((cat, ci) => {
                              const features = allePlanFeatures.filter((f) => f.categorie === cat)
                              return (
                                <div key={cat}>
                                  {ci > 0 && <div className="border-t border-border" />}
                                  <div className="px-3 py-1.5 bg-secondary/50">
                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{categorieFeatureLabels[cat]}</span>
                                  </div>
                                  {features.map((feature) => {
                                    const isChecked = pakket.features.includes(feature.key)
                                    return (
                                      <label key={feature.key} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/30 transition-colors cursor-pointer border-t border-border/50">
                                        <input type="checkbox" defaultChecked={isChecked} className="size-3.5 rounded border-border accent-primary" />
                                        <span className="text-xs text-foreground">{feature.label}</span>
                                      </label>
                                    )
                                  })}
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Rechts: Courses + instellingen */}
                        <div className="flex flex-col gap-4">
                          {/* Courses */}
                          <div className="flex flex-col gap-3">
                            <h4 className="text-xs font-semibold text-foreground">Courses</h4>
                            <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                              <div className="flex items-center gap-2">
                                <Sparkles className="size-4 text-primary" />
                                <div>
                                  <p className="text-xs font-medium text-foreground">Alle courses inclusief</p>
                                  <p className="text-[10px] text-muted-foreground">Toegang tot alle huidige en toekomstige courses</p>
                                </div>
                              </div>
                              <Switch defaultChecked={pakket.allCoursesIncluded} />
                            </div>
                            {!pakket.allCoursesIncluded && (
                              <div className="rounded-lg border border-border overflow-hidden bg-card">
                                {beschikbareCourses.map((course) => {
                                  const isChecked = pakket.exclusieveCourses.includes(course.id)
                                  return (
                                    <label key={course.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors cursor-pointer border-b border-border/50 last:border-0">
                                      <input type="checkbox" defaultChecked={isChecked} className="size-3.5 rounded border-border accent-primary" />
                                      <div className="flex-1 min-w-0">
                                        <span className="text-xs font-medium text-foreground">{course.titel}</span>
                                        <span className="text-[10px] text-muted-foreground ml-2 capitalize">{course.categorie}</span>
                                      </div>
                                    </label>
                                  )
                                })}
                              </div>
                            )}
                          </div>

                          {/* Instellingen compact */}
                          <div className="flex flex-col gap-3">
                            <h4 className="text-xs font-semibold text-foreground">Instellingen</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-foreground">Proefperiode</label>
                                <div className="flex items-center gap-1">
                                  <Input type="number" defaultValue={pakket.proefDagen} min={0} className="text-sm h-8" />
                                  <span className="text-[10px] text-muted-foreground shrink-0">dagen</span>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-medium text-foreground">Max clienten</label>
                                <Input type="number" defaultValue={pakket.maxClienten} min={1} className="text-sm h-8" />
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <Switch defaultChecked={pakket.isPopulair} />
                                <label className="text-xs text-muted-foreground">Populair badge</label>
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch defaultChecked={pakket.isActief} />
                                <label className="text-xs text-muted-foreground">Actief</label>
                              </div>
                            </div>
                          </div>

                          {/* Opslaan */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                              <Sparkles className="size-3 text-chart-4" />
                              Wijzigingen worden gesynchroniseerd met Stripe
                            </p>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setBewerkPakketId(null)}>Annuleren</Button>
                              <Button size="sm" className="h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                                <CheckCircle2 className="size-3.5" />
                                Opslaan
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}

            {/* Nieuw pakket toevoegen */}
            <Card className="border-border border-dashed shadow-sm cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setPlanDialogOpen(true)}>
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="size-10 rounded-full bg-secondary flex items-center justify-center mb-2">
                  <Plus className="size-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">Nieuw pakket toevoegen</p>
                <p className="text-xs text-muted-foreground mt-0.5">Wordt automatisch als Stripe Product met Payment Links aangemaakt</p>
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
                  <div className="grid grid-cols-2 gap-3">
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
                </div>
              </CardContent>
            </Card>

            {/* Dunning */}
            <Card className="border-border shadow-sm">
              <CardContent className="p-5 flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground">Mislukte betalingen</h3>
                <p className="text-[11px] text-muted-foreground">Wat gebeurt er als een automatische incasso mislukt</p>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Automatisch opnieuw proberen</p>
                      <p className="text-[10px] text-muted-foreground">Stripe Smart Retries (3x automatisch)</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">E-mail bij mislukte betaling</p>
                      <p className="text-[10px] text-muted-foreground">Herinnering naar client per e-mail</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-foreground">Coach notificatie</p>
                      <p className="text-[10px] text-muted-foreground">Na 2e mislukte poging</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Annuleer na</label>
                    <Select defaultValue="30">
                      <SelectTrigger className="text-sm h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="14">14 dagen</SelectItem>
                        <SelectItem value="30">30 dagen</SelectItem>
                        <SelectItem value="60">60 dagen</SelectItem>
                        <SelectItem value="nooit">Nooit automatisch annuleren</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* --- DIALOGS --- */}

      {/* Payment Links dialog */}
      <Dialog open={!!linksDialogPakket} onOpenChange={(open) => !open && setLinksDialogPakket(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Payment Links — {linksDialogPakket?.naam}</DialogTitle>
            <DialogDescription>Kopieer deze links om te delen via je website, socials of e-mail. Clienten kunnen direct betalen via Stripe.</DialogDescription>
          </DialogHeader>
          {linksDialogPakket && (
            <div className="flex flex-col gap-3 py-2">
              {[
                { label: "Maandelijks", key: "1m" as const, prijs: linksDialogPakket.maandPrijsCenten, korting: 0 },
                { label: "6 maanden", key: "6m" as const, prijs: berekenPeriodePrijs(linksDialogPakket.maandPrijsCenten, linksDialogPakket.korting6m), korting: linksDialogPakket.korting6m },
                { label: "12 maanden", key: "12m" as const, prijs: berekenPeriodePrijs(linksDialogPakket.maandPrijsCenten, linksDialogPakket.korting12m), korting: linksDialogPakket.korting12m },
                { label: "24 maanden", key: "24m" as const, prijs: berekenPeriodePrijs(linksDialogPakket.maandPrijsCenten, linksDialogPakket.korting24m), korting: linksDialogPakket.korting24m },
              ].map((p) => (
                <div key={p.key} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-card">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-foreground">{p.label}</p>
                      <span className="text-xs font-bold text-foreground">{formatBedrag(p.prijs)}/mnd</span>
                      {p.korting > 0 && <Badge variant="outline" className="text-[9px] text-success border-success/30">-{p.korting}%</Badge>}
                    </div>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 truncate">{linksDialogPakket.paymentLinks[p.key]}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-border">
                      <Copy className="size-3" />
                      Kopieer
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                      <ExternalLink className="size-3" />
                    </Button>
                  </div>
                </div>
              ))}

              {/* Landing pagina link */}
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3 mt-1">
                <Globe className="size-4 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">Landingspagina</p>
                  <p className="text-[10px] text-muted-foreground font-mono truncate">{linksDialogPakket.landingUrl}</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-border shrink-0">
                  <Copy className="size-3" />
                  Kopieer
                </Button>
              </div>

              <p className="text-[10px] text-muted-foreground mt-1">
                Payment Links zijn automatisch gegenereerd door Stripe. Bij het deactiveren of verwijderen van dit pakket worden de links ook gedeactiveerd.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Nieuw pakket dialog */}
      <Dialog open={planDialogOpen} onOpenChange={setPlanDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nieuw coaching pakket</DialogTitle>
            <DialogDescription>Stel een pakket samen. Wordt automatisch als Stripe Product + Prices + Payment Links aangemaakt.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-5 py-2">
            {/* Basis info */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pakket info</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Pakketnaam</label>
                  <Input placeholder="bijv. Basis, Premium, All-Inclusive..." className="text-sm" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Maandprijs (excl. BTW)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">{"\u20AC"}</span>
                    <Input type="number" placeholder="89.00" step="0.01" min="0" className="text-sm" />
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Beschrijving</label>
                <Textarea placeholder="Korte beschrijving van het pakket..." rows={2} className="text-sm resize-none" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Korting 6 mnd", val: 10 },
                  { label: "Korting 12 mnd", val: 20 },
                  { label: "Korting 24 mnd", val: 30 },
                ].map((k) => (
                  <div key={k.label} className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-foreground">{k.label}</label>
                    <div className="flex items-center gap-1">
                      <Input type="number" defaultValue={k.val} min={0} max={50} className="text-sm" />
                      <span className="text-xs text-muted-foreground">%</span>
                    </div>
                  </div>
                ))}
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
            </div>

            {/* Features */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Features selecteren</h4>
              <div className="rounded-lg border border-border overflow-hidden bg-card">
                {(["coaching", "voeding", "support", "extra"] as const).map((cat, ci) => {
                  const features = allePlanFeatures.filter((f) => f.categorie === cat)
                  return (
                    <div key={cat}>
                      {ci > 0 && <div className="border-t border-border" />}
                      <div className="px-3 py-1.5 bg-secondary/50">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{categorieFeatureLabels[cat]}</span>
                      </div>
                      {features.map((f) => (
                        <label key={f.key} className="flex items-center gap-3 px-3 py-2 hover:bg-secondary/30 transition-colors cursor-pointer border-t border-border/50">
                          <input type="checkbox" className="size-3.5 rounded border-border accent-primary" />
                          <span className="text-xs text-foreground">{f.label}</span>
                        </label>
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Courses */}
            <div className="flex flex-col gap-3">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Courses</h4>
              <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  <div>
                    <p className="text-xs font-medium text-foreground">Alle courses inclusief</p>
                    <p className="text-[10px] text-muted-foreground">Toegang tot alle huidige en toekomstige courses</p>
                  </div>
                </div>
                <Switch />
              </div>
              <div className="rounded-lg border border-border overflow-hidden bg-card">
                {beschikbareCourses.map((c) => (
                  <label key={c.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-secondary/30 transition-colors cursor-pointer border-b border-border/50 last:border-0">
                    <input type="checkbox" className="size-3.5 rounded border-border accent-primary" />
                    <span className="text-xs font-medium text-foreground">{c.titel}</span>
                    <span className="text-[10px] text-muted-foreground capitalize">{c.categorie}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Opties */}
            <div className="flex items-center gap-4 pt-1 border-t border-border">
              <div className="flex items-center gap-2"><Switch defaultChecked /><label className="text-xs text-muted-foreground">Direct activeren</label></div>
              <div className="flex items-center gap-2"><Switch /><label className="text-xs text-muted-foreground">Markeer als populair</label></div>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-chart-4/5 border border-chart-4/20 px-3 py-2">
              <Sparkles className="size-3.5 text-chart-4 shrink-0" />
              <p className="text-[10px] text-chart-4">Er wordt automatisch een Stripe Product, 4 Prices (1m/6m/12m/24m), 4 Payment Links en een landingspagina aangemaakt.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Annuleren</Button>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5">
              <Plus className="size-3.5" />
              Pakket aanmaken
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Handmatige factuur dialog */}
      <Dialog open={factuurDialogOpen} onOpenChange={setFactuurDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Factuur aanmaken</DialogTitle>
            <DialogDescription>Handmatige factuur voor losse diensten. Wordt via Stripe Invoice API verstuurd.</DialogDescription>
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
