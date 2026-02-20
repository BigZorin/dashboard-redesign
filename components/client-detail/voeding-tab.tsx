"use client"

import { useState } from "react"
import { Apple, Droplets, Pill, Clock, Edit3, Sparkles, ChevronLeft, ChevronRight, Check, X, ScanBarcode, Plus, AlertTriangle, ArrowUpDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { cn } from "@/lib/utils"

// ============================================================================
// PLACEHOLDER DATA — Voeding per dag voor een individuele cliënt
//
// Dit is de dag-gebaseerde voedingweergave die de coach ziet bij een cliënt.
// Het combineert het GEPLANDE maaltijdschema (template) met wat de cliënt
// DAADWERKELIJK heeft gelogd in de app.
//
// Supabase tabellen:
//   - nutrition_plan_templates (templates, gemaakt in sidebar Voeding tab)
//     Velden: id, naam, beschrijving, created_by (coach), macro_targets, status
//   - nutrition_plan_template_meals (maaltijden binnen een template)
//     Velden: id, template_id, naam, tijd, volgorde
//   - nutrition_plan_template_items (voedingsmiddelen per maaltijd)
//     Velden: id, meal_id, product_id, hoeveelheid, eenheid
//   - client_nutrition_plan (koppeling cliënt <-> template + overrides)
//     Velden: id, client_id, template_id, custom_macro_targets, assigned_at
//     Coach kan inline overrides maken per cliënt (afwijking van template)
//   - client_food_logs (wat cliënt scant/logt in de app)
//     Velden: id, client_id, meal_type, product_id, hoeveelheid, barcode,
//             kcal, eiwit, koolhydraten, vetten, vezels, logged_at
//     Barcode scanning: Open Food Facts API lookup -> opslaan in food_products
//   - food_products (productdatabase, aangevuld via barcode scans)
//     Velden: id, naam, barcode, kcal_per_100g, eiwit, koolhydraten, vetten,
//             vezels, bron (open_food_facts | handmatig), afbeelding_url
//   - client_supplements (supplementenprotocol per cliënt)
//     Velden: id, client_id, naam, dosering, timing, notitie
//   - client_nutrition_logs (dagelijkse compliance, berekend)
//     Aggregatie: per dag som van food_logs vs macro targets = compliance %
//
// Supabase Storage bucket: "food-product-images" (productafbeeldingen van scans)
//
// Flow in de client-app:
//   1. Cliënt opent voedingslog voor vandaag
//   2. Ziet hun geplande maaltijdschema (van template)
//   3. Kan producten loggen via barcode scanner (camera) of handmatig zoeken
//   4. Open Food Facts API haalt productinfo op bij barcode scan
//   5. Gelogde items verschijnen naast het geplande schema
//   6. Coach ziet real-time verschil gepland vs gelogd op dit dashboard
// ============================================================================

// --- Dagelijkse data ---

/** Macro-targets voor deze cliënt — Supabase: client_nutrition_plan.custom_macro_targets */
const macroTargets = {
  kcal: { doel: 2200, gelogd: 1920 },       // <-- Calorieën target vs daadwerkelijk gelogd
  eiwit: { doel: 160, gelogd: 145 },         // <-- Gram eiwit
  koolhydraten: { doel: 250, gelogd: 210 },  // <-- Gram koolhydraten
  vetten: { doel: 65, gelogd: 58 },           // <-- Gram vetten
  vezels: { doel: 30, gelogd: 22 },           // <-- Gram vezels
  water: { doel: 3.0, gelogd: 2.8 },          // <-- Liter water
}

/** Geplande maaltijden (template) + wat cliënt heeft gelogd — per maaltijd */
const maaltijden = [
  {
    naam: "Ontbijt",
    tijd: "07:30",
    gepland: [
      { naam: "Havermout", hoeveelheid: "80g", kcal: 304, eiwit: 10, kh: 52, vet: 6 },
      { naam: "Whey proteïne", hoeveelheid: "30g", kcal: 120, eiwit: 24, kh: 3, vet: 1 },
      { naam: "Banaan", hoeveelheid: "1 stuk", kcal: 105, eiwit: 1, kh: 27, vet: 0 },
      { naam: "Walnoten", hoeveelheid: "15g", kcal: 98, eiwit: 2, kh: 2, vet: 10 },
    ],
    gelogd: [
      { naam: "Havermout", hoeveelheid: "80g", kcal: 304, eiwit: 10, kh: 52, vet: 6, bron: "handmatig" as const },
      { naam: "Whey proteïne", hoeveelheid: "30g", kcal: 120, eiwit: 24, kh: 3, vet: 1, bron: "handmatig" as const },
      { naam: "Banaan", hoeveelheid: "1 stuk", kcal: 105, eiwit: 1, kh: 27, vet: 0, bron: "barcode" as const },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    gepland: [
      { naam: "Kipfilet", hoeveelheid: "150g", kcal: 165, eiwit: 31, kh: 0, vet: 4 },
      { naam: "Zilvervliesrijst", hoeveelheid: "100g", kcal: 130, eiwit: 3, kh: 28, vet: 1 },
      { naam: "Broccoli", hoeveelheid: "150g", kcal: 51, eiwit: 4, kh: 7, vet: 1 },
      { naam: "Olijfolie", hoeveelheid: "10ml", kcal: 88, eiwit: 0, kh: 0, vet: 10 },
    ],
    gelogd: [
      { naam: "Kipfilet", hoeveelheid: "150g", kcal: 165, eiwit: 31, kh: 0, vet: 4, bron: "handmatig" as const },
      { naam: "Witte rijst", hoeveelheid: "120g", kcal: 156, eiwit: 3, kh: 34, vet: 0, bron: "barcode" as const },
      { naam: "Broccoli", hoeveelheid: "100g", kcal: 34, eiwit: 3, kh: 5, vet: 0, bron: "handmatig" as const },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "15:30",
    gepland: [
      { naam: "Griekse yoghurt", hoeveelheid: "200g", kcal: 130, eiwit: 20, kh: 8, vet: 2 },
      { naam: "Blauwe bessen", hoeveelheid: "100g", kcal: 57, eiwit: 1, kh: 14, vet: 0 },
      { naam: "Honing", hoeveelheid: "10g", kcal: 30, eiwit: 0, kh: 8, vet: 0 },
    ],
    gelogd: [
      { naam: "Griekse yoghurt", hoeveelheid: "200g", kcal: 130, eiwit: 20, kh: 8, vet: 2, bron: "barcode" as const },
      { naam: "Granola bar", hoeveelheid: "1 stuk", kcal: 190, eiwit: 4, kh: 28, vet: 8, bron: "barcode" as const },
    ],
  },
  {
    naam: "Diner",
    tijd: "19:00",
    gepland: [
      { naam: "Zalm", hoeveelheid: "150g", kcal: 280, eiwit: 30, kh: 0, vet: 18 },
      { naam: "Zoete aardappel", hoeveelheid: "200g", kcal: 172, eiwit: 3, kh: 40, vet: 0 },
      { naam: "Sperziebonen", hoeveelheid: "150g", kcal: 47, eiwit: 3, kh: 7, vet: 0 },
    ],
    gelogd: [], // Nog niet gelogd
  },
  {
    naam: "Avondsnack",
    tijd: "21:00",
    gepland: [
      { naam: "Caseine shake", hoeveelheid: "30g", kcal: 115, eiwit: 24, kh: 3, vet: 1 },
      { naam: "Pindakaas", hoeveelheid: "15g", kcal: 94, eiwit: 4, kh: 3, vet: 8 },
    ],
    gelogd: [], // Nog niet gelogd
  },
]

/** Supplementenprotocol — Supabase: client_supplements */
const supplementen = [
  { naam: "Whey Proteïne", dosering: "30g", timing: "Ochtend + post-workout", notitie: "" },
  { naam: "Creatine Monohydraat", dosering: "5g", timing: "Dagelijks bij ontbijt", notitie: "Laadschema niet nodig" },
  { naam: "Vitamine D3", dosering: "2000 IU", timing: "Dagelijks bij lunch", notitie: "Winterperiode: verhoog naar 4000 IU" },
  { naam: "Omega-3 Visolie", dosering: "1000mg EPA/DHA", timing: "Bij het diner", notitie: "" },
  { naam: "Magnesium Bisglycinaat", dosering: "400mg", timing: "Voor het slapen", notitie: "Helpt bij slaapkwaliteit" },
]

/** Weekcompliance — Supabase: client_nutrition_logs (geaggregeerd) */
const complianceData = [
  { week: "Wk 1", eiwit: 88, koolhydraten: 82, vetten: 90 },
  { week: "Wk 2", eiwit: 92, koolhydraten: 78, vetten: 85 },
  { week: "Wk 3", eiwit: 85, koolhydraten: 80, vetten: 88 },
  { week: "Wk 4", eiwit: 90, koolhydraten: 85, vetten: 92 },
  { week: "Wk 5", eiwit: 94, koolhydraten: 76, vetten: 87 },
  { week: "Wk 6", eiwit: 91, koolhydraten: 84, vetten: 89 },
]

/** Actief voedingsplan info — Supabase: client_nutrition_plan join nutrition_plan_templates */
const actiefPlan = {
  naam: "Hoog Eiwit Lean",           // <-- Template naam
  type: "template" as const,          // <-- "template" | "ai-gegenereerd" | "custom"
  toewijzingDatum: "3 jan 2026",      // <-- Wanneer toegewezen
}

// ---- Helper: formateer datum ----
function formatDatum(datum: Date): string {
  const opties: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" }
  return datum.toLocaleDateString("nl-NL", opties)
}

// ---- Macro ring component ----
function MacroRing({ label, gelogd, doel, eenheid, kleur }: {
  label: string; gelogd: number; doel: number; eenheid: string; kleur: string
}) {
  const percentage = Math.min(Math.round((gelogd / doel) * 100), 100)
  const isOver = gelogd > doel
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative size-16">
        <svg className="size-16 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-secondary"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3"
          />
          <path
            className={isOver ? "text-destructive" : kleur}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none" stroke="currentColor" strokeWidth="3"
            strokeDasharray={`${Math.min(percentage, 100)}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("text-xs font-bold", isOver ? "text-destructive" : "text-foreground")}>{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-[11px] font-semibold text-foreground">{gelogd}{eenheid}</p>
        <p className="text-[10px] text-muted-foreground">/ {doel}{eenheid}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

// ---- Maaltijd kaart component ----
function MaaltijdKaart({ maaltijd }: { maaltijd: typeof maaltijden[0] }) {
  const geplandTotaal = {
    kcal: maaltijd.gepland.reduce((s, v) => s + v.kcal, 0),
    eiwit: maaltijd.gepland.reduce((s, v) => s + v.eiwit, 0),
  }
  const gelogdTotaal = {
    kcal: maaltijd.gelogd.reduce((s, v) => s + v.kcal, 0),
    eiwit: maaltijd.gelogd.reduce((s, v) => s + v.eiwit, 0),
  }
  const isGelogd = maaltijd.gelogd.length > 0
  const verschilKcal = gelogdTotaal.kcal - geplandTotaal.kcal

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      {/* Maaltijd header */}
      <div className="flex items-center justify-between bg-secondary/50 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Clock className="size-3 text-muted-foreground" />
          <span className="text-sm font-semibold text-foreground">{maaltijd.naam}</span>
          <span className="text-[11px] text-muted-foreground">{maaltijd.tijd}</span>
        </div>
        <div className="flex items-center gap-2">
          {isGelogd ? (
            <Badge className={cn(
              "text-[10px]",
              Math.abs(verschilKcal) <= 50
                ? "bg-success/10 text-success border-success/20"
                : verschilKcal > 0
                  ? "bg-warning/10 text-warning-foreground border-warning/20"
                  : "bg-chart-2/10 text-chart-2 border-chart-2/20"
            )}>
              {verschilKcal > 0 ? "+" : ""}{verschilKcal} kcal
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-muted-foreground">Nog niet gelogd</Badge>
          )}
          <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-muted-foreground hover:text-foreground">
            <Edit3 className="size-3" />
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Twee kolommen: gepland | gelogd */}
        <div className="grid grid-cols-2 gap-4">
          {/* Gepland */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Gepland</p>
            <div className="flex flex-col gap-1">
              {maaltijd.gepland.map((item, j) => (
                <div key={j} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-foreground truncate">{item.naam}</span>
                    <span className="text-muted-foreground shrink-0">({item.hoeveelheid})</span>
                  </div>
                  <span className="text-muted-foreground shrink-0 ml-2">{item.kcal}</span>
                </div>
              ))}
              <div className="border-t border-border pt-1 mt-1 flex justify-between text-xs">
                <span className="text-muted-foreground">Totaal</span>
                <span className="font-semibold text-foreground">{geplandTotaal.kcal} kcal / {geplandTotaal.eiwit}g E</span>
              </div>
            </div>
          </div>

          {/* Gelogd */}
          <div>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-2">Gelogd</p>
            {isGelogd ? (
              <div className="flex flex-col gap-1">
                {maaltijd.gelogd.map((item, j) => (
                  <div key={j} className="flex items-center justify-between text-xs py-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-foreground truncate">{item.naam}</span>
                      {item.bron === "barcode" && (
                        <ScanBarcode className="size-3 text-primary shrink-0" />
                      )}
                    </div>
                    <span className="text-muted-foreground shrink-0 ml-2">{item.kcal}</span>
                  </div>
                ))}
                <div className="border-t border-border pt-1 mt-1 flex justify-between text-xs">
                  <span className="text-muted-foreground">Totaal</span>
                  <span className={cn(
                    "font-semibold",
                    Math.abs(verschilKcal) <= 50 ? "text-success" : "text-foreground"
                  )}>{gelogdTotaal.kcal} kcal / {gelogdTotaal.eiwit}g E</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="size-8 rounded-full bg-secondary flex items-center justify-center mb-1.5">
                  <Clock className="size-3.5 text-muted-foreground" />
                </div>
                <p className="text-[11px] text-muted-foreground">Wacht op logging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ==== HOOFD COMPONENT ====

export function VoedingTab() {
  const [geselecteerdeDatum, setGeselecteerdeDatum] = useState(new Date())

  function vorigeDag() {
    setGeselecteerdeDatum(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() - 1)
      return d
    })
  }

  function volgendeDag() {
    setGeselecteerdeDatum(prev => {
      const d = new Date(prev)
      d.setDate(d.getDate() + 1)
      return d
    })
  }

  const isVandaag = geselecteerdeDatum.toDateString() === new Date().toDateString()

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Dag-selector + plan info */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-card">
            <Button variant="ghost" size="icon" className="size-8" onClick={vorigeDag}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="px-2 text-sm font-medium text-foreground min-w-[180px] text-center">
              {isVandaag ? "Vandaag" : formatDatum(geselecteerdeDatum)}
            </span>
            <Button variant="ghost" size="icon" className="size-8" onClick={volgendeDag} disabled={isVandaag}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          {isVandaag && (
            <Badge variant="outline" className="text-[10px]">Live</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-secondary text-foreground border-border text-[10px] gap-1">
            <Apple className="size-3" />
            {actiefPlan.naam}
          </Badge>
          <Badge variant="outline" className="text-[10px] text-muted-foreground">
            {actiefPlan.type === "template" ? "Template" : actiefPlan.type === "ai-gegenereerd" ? "AI" : "Aangepast"}
          </Badge>
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-border">
            <ArrowUpDown className="size-3" />
            Wissel plan
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-primary/30 text-primary">
            <Sparkles className="size-3" />
            AI optimalisatie
          </Button>
        </div>
      </div>

      {/* Macro overzicht: targets vs gelogd */}
      <Card className="border-border p-0 gap-0">
        <CardContent className="px-5 py-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Apple className="size-4 text-primary" />
              Dagelijkse macro{"'"}s
            </h3>
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1 border-border">
              <Edit3 className="size-3" />
              Targets aanpassen
            </Button>
          </div>
          <div className="flex items-center justify-around flex-wrap gap-3">
            <MacroRing label="Calorieën" gelogd={macroTargets.kcal.gelogd} doel={macroTargets.kcal.doel} eenheid="" kleur="text-primary" />
            <MacroRing label="Eiwit" gelogd={macroTargets.eiwit.gelogd} doel={macroTargets.eiwit.doel} eenheid="g" kleur="text-chart-1" />
            <MacroRing label="Koolhydraten" gelogd={macroTargets.koolhydraten.gelogd} doel={macroTargets.koolhydraten.doel} eenheid="g" kleur="text-chart-2" />
            <MacroRing label="Vetten" gelogd={macroTargets.vetten.gelogd} doel={macroTargets.vetten.doel} eenheid="g" kleur="text-chart-4" />
            <MacroRing label="Vezels" gelogd={macroTargets.vezels.gelogd} doel={macroTargets.vezels.doel} eenheid="g" kleur="text-chart-3" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex size-16 items-center justify-center rounded-full border-3 border-chart-2 bg-chart-2/10">
                <Droplets className="size-5 text-chart-2" />
              </div>
              <div className="text-center">
                <p className="text-[11px] font-semibold text-foreground">{macroTargets.water.gelogd}L</p>
                <p className="text-[10px] text-muted-foreground">/ {macroTargets.water.doel}L</p>
                <p className="text-[10px] text-muted-foreground">Water</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Maaltijden: gepland vs gelogd */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground">Maaltijden</h3>
          <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 border-border">
            <Edit3 className="size-3" />
            Schema bewerken
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          {maaltijden.map((maaltijd, i) => (
            <MaaltijdKaart key={i} maaltijd={maaltijd} />
          ))}
        </div>
      </div>

      {/* Onderste rij: supplementen + compliance */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Supplementen protocol */}
        <Card className="border-border p-0 gap-0">
          <CardHeader className="px-5 pt-4 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Pill className="size-4 text-primary" />
              Supplementenprotocol
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4 flex flex-col gap-2">
            {supplementen.map((supplement, i) => (
              <div key={i} className="flex items-start justify-between rounded-lg bg-secondary/50 p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium text-foreground">{supplement.naam}</span>
                  <span className="text-[11px] text-muted-foreground">{supplement.timing}</span>
                  {supplement.notitie && (
                    <span className="text-[11px] text-primary/80 italic">{supplement.notitie}</span>
                  )}
                </div>
                <Badge variant="outline" className="text-[10px] whitespace-nowrap">{supplement.dosering}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Compliance chart */}
        <Card className="border-border p-0 gap-0">
          <CardHeader className="px-5 pt-4 pb-3">
            <CardTitle className="text-sm font-semibold">Voedingscompliance per week</CardTitle>
          </CardHeader>
          <CardContent className="px-5 pb-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complianceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="eiwit" name="Eiwit" fill="oklch(0.22 0.05 290)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="koolhydraten" name="Koolhydraten" fill="oklch(0.45 0.12 200)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="vetten" name="Vetten" fill="oklch(0.7 0.15 80)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
