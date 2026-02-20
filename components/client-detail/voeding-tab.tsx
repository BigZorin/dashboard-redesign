"use client"

import { Apple, Droplets, Pill, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

// ============================================================================
// PLACEHOLDER DATA — Voedingsplan van de cliënt
// Vervang met echte data uit Supabase tabellen:
//   - client_nutrition (macro targets + plan)
//   - client_meals (maaltijden per dag)
//   - client_supplements (supplementenprotocol)
//   - client_nutrition_logs (dagelijkse tracking/compliance)
// ============================================================================

/** Dagelijkse macro-targets — Supabase: client_nutrition */
const macroTargets = {
  kcal: { doel: 2200, huidig: 1920 },      // <-- Calorieën doel vs huidige inname
  eiwit: { doel: 160, huidig: 145 },        // <-- Gram eiwit
  koolhydraten: { doel: 250, huidig: 210 }, // <-- Gram koolhydraten
  vetten: { doel: 65, huidig: 58 },          // <-- Gram vetten
  vezels: { doel: 30, huidig: 22 },          // <-- Gram vezels
}

/** Waterdoel — Supabase: client_nutrition */
const waterDoel = {
  doel: 3.0,              // <-- Liter per dag
  huidig: 2.8,            // <-- Huidige gemiddelde inname
}

/** Maaltijdschema — Supabase: client_meals */
const maaltijden = [
  {
    naam: "Ontbijt",                         // <-- Maaltijd naam
    tijd: "07:30",                           // <-- Geplande tijd
    voedingsmiddelen: [                      // <-- Lijst voedingsmiddelen
      { naam: "Havermout", hoeveelheid: "80g", kcal: 304, eiwit: 10 },
      { naam: "Whey proteïne", hoeveelheid: "30g", kcal: 120, eiwit: 24 },
      { naam: "Banaan", hoeveelheid: "1 stuk", kcal: 105, eiwit: 1 },
      { naam: "Walnoten", hoeveelheid: "15g", kcal: 98, eiwit: 2 },
    ],
  },
  {
    naam: "Lunch",
    tijd: "12:30",
    voedingsmiddelen: [
      { naam: "Kipfilet", hoeveelheid: "150g", kcal: 165, eiwit: 31 },
      { naam: "Zilvervliesrijst", hoeveelheid: "100g", kcal: 130, eiwit: 3 },
      { naam: "Broccoli", hoeveelheid: "150g", kcal: 51, eiwit: 4 },
      { naam: "Olijfolie", hoeveelheid: "10ml", kcal: 88, eiwit: 0 },
    ],
  },
  {
    naam: "Tussendoortje",
    tijd: "15:30",
    voedingsmiddelen: [
      { naam: "Griekse yoghurt", hoeveelheid: "200g", kcal: 130, eiwit: 20 },
      { naam: "Blauwe bessen", hoeveelheid: "100g", kcal: 57, eiwit: 1 },
      { naam: "Honing", hoeveelheid: "10g", kcal: 30, eiwit: 0 },
    ],
  },
  {
    naam: "Diner",
    tijd: "19:00",
    voedingsmiddelen: [
      { naam: "Zalm", hoeveelheid: "150g", kcal: 280, eiwit: 30 },
      { naam: "Zoete aardappel", hoeveelheid: "200g", kcal: 172, eiwit: 3 },
      { naam: "Sperziebonen", hoeveelheid: "150g", kcal: 47, eiwit: 3 },
      { naam: "Boter", hoeveelheid: "10g", kcal: 72, eiwit: 0 },
    ],
  },
  {
    naam: "Avondsnack",
    tijd: "21:00",
    voedingsmiddelen: [
      { naam: "Caseine shake", hoeveelheid: "30g", kcal: 115, eiwit: 24 },
      { naam: "Pindakaas", hoeveelheid: "15g", kcal: 94, eiwit: 4 },
    ],
  },
]

/** Supplementenprotocol — Supabase: client_supplements */
const supplementen = [
  {
    naam: "Whey Proteïne",           // <-- Supplement naam
    dosering: "30g",                  // <-- Dosering
    timing: "Ochtend + post-workout", // <-- Wanneer innemen
    notitie: "",                       // <-- Eventuele notitie
  },
  {
    naam: "Creatine Monohydraat",
    dosering: "5g",
    timing: "Dagelijks bij ontbijt",
    notitie: "Laadschema niet nodig",
  },
  {
    naam: "Vitamine D3",
    dosering: "2000 IU",
    timing: "Dagelijks bij lunch",
    notitie: "Winterperiode: verhoog naar 4000 IU",
  },
  {
    naam: "Omega-3 Visolie",
    dosering: "1000mg EPA/DHA",
    timing: "Bij het diner",
    notitie: "",
  },
  {
    naam: "Magnesium Bisglycinaat",
    dosering: "400mg",
    timing: "Voor het slapen",
    notitie: "Helpt bij slaapkwaliteit",
  },
]

/** Voedingscompliance per week — Supabase: client_nutrition_logs */
const complianceData = [
  { week: "Wk 1", eiwit: 88, koolhydraten: 82, vetten: 90 },   // <-- % van target gehaald
  { week: "Wk 2", eiwit: 92, koolhydraten: 78, vetten: 85 },
  { week: "Wk 3", eiwit: 85, koolhydraten: 80, vetten: 88 },
  { week: "Wk 4", eiwit: 90, koolhydraten: 85, vetten: 92 },
  { week: "Wk 5", eiwit: 94, koolhydraten: 76, vetten: 87 },
  { week: "Wk 6", eiwit: 91, koolhydraten: 84, vetten: 89 },
]

function MacroRing({ label, huidig, doel, eenheid, kleur }: {
  label: string; huidig: number; doel: number; eenheid: string; kleur: string
}) {
  const percentage = Math.min(Math.round((huidig / doel) * 100), 100)
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative size-20">
        <svg className="size-20 -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-secondary"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
          />
          <path
            className={kleur}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${percentage}, 100`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-foreground">{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-semibold text-foreground">{huidig}{eenheid}</p>
        <p className="text-[10px] text-muted-foreground">van {doel}{eenheid}</p>
        <p className="text-[10px] text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

export function VoedingTab() {
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Macro overzicht */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Apple className="size-4 text-primary" />
              Dagelijkse macro-targets
            </CardTitle>
            <Badge variant="outline" className="text-[10px]">Vandaag</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-around flex-wrap gap-4">
            <MacroRing label="Calorieën" huidig={macroTargets.kcal.huidig} doel={macroTargets.kcal.doel} eenheid=" kcal" kleur="text-primary" />
            <MacroRing label="Eiwit" huidig={macroTargets.eiwit.huidig} doel={macroTargets.eiwit.doel} eenheid="g" kleur="text-chart-1" />
            <MacroRing label="Koolhydraten" huidig={macroTargets.koolhydraten.huidig} doel={macroTargets.koolhydraten.doel} eenheid="g" kleur="text-chart-2" />
            <MacroRing label="Vetten" huidig={macroTargets.vetten.huidig} doel={macroTargets.vetten.doel} eenheid="g" kleur="text-chart-4" />
            <MacroRing label="Vezels" huidig={macroTargets.vezels.huidig} doel={macroTargets.vezels.doel} eenheid="g" kleur="text-chart-3" />
            <div className="flex flex-col items-center gap-2">
              <div className="flex size-20 items-center justify-center rounded-full border-3 border-chart-2 bg-chart-2/10">
                <Droplets className="size-6 text-chart-2" />
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">{waterDoel.huidig}L</p>
                <p className="text-[10px] text-muted-foreground">van {waterDoel.doel}L</p>
                <p className="text-[10px] text-muted-foreground">Water</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Maaltijdschema */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Maaltijdschema</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {maaltijden.map((maaltijd, i) => (
              <div key={i} className="rounded-lg border border-border overflow-hidden">
                <div className="flex items-center justify-between bg-secondary/50 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="size-3 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{maaltijd.naam}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground">{maaltijd.tijd}</span>
                </div>
                <div className="p-3 flex flex-col gap-1">
                  {maaltijd.voedingsmiddelen.map((item, j) => (
                    <div key={j} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{item.naam}</span>
                        <span className="text-muted-foreground">({item.hoeveelheid})</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <span>{item.kcal} kcal</span>
                        <span className="font-medium text-foreground">{item.eiwit}g E</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-end border-t border-border pt-1.5 mt-1.5 text-xs">
                    <span className="text-muted-foreground">
                      Totaal: <span className="font-semibold text-foreground">
                        {maaltijd.voedingsmiddelen.reduce((s, v) => s + v.kcal, 0)} kcal
                      </span>{" / "}
                      <span className="font-semibold text-foreground">
                        {maaltijd.voedingsmiddelen.reduce((s, v) => s + v.eiwit, 0)}g eiwit
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Supplementen + Compliance chart */}
        <div className="flex flex-col gap-6">
          {/* Supplementen protocol */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Pill className="size-4 text-primary" />
                Supplementenprotocol
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
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
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Voedingscompliance per week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={complianceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.91 0.005 240)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="oklch(0.5 0.01 240)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "oklch(1 0 0)",
                        border: "1px solid oklch(0.91 0.005 240)",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => [`${value}%`, name]}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Bar dataKey="eiwit" name="Eiwit" fill="oklch(0.55 0.15 160)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="koolhydraten" name="Koolhydraten" fill="oklch(0.6 0.12 200)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="vetten" name="Vetten" fill="oklch(0.7 0.15 80)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
