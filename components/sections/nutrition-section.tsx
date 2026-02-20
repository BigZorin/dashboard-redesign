"use client"

import { Plus, MoreHorizontal, Copy, Users, Utensils } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte voedingsplannen uit Supabase
//
// COACH-SCOPED DATA:
//   De coach ziet ALLEEN voedingsplannen die hij/zij zelf heeft aangemaakt.
//   Filter: WHERE nutrition_plan_templates.created_by = auth.uid()
//   Clienten-count per plan: alleen eigen clienten (via client_nutrition_plan JOIN)
//
// Supabase tabellen (gefilterd op coach_id):
//   - nutrition_plan_templates (id, naam, beschrijving, macro_targets, status, created_by = auth.uid())
//   - nutrition_plan_template_meals (id, template_id, naam, tijd, volgorde)
//   - nutrition_plan_template_items (id, meal_id, product_id, hoeveelheid, eenheid)
//   - client_nutrition_plan (koppeling cliënt <-> template + custom overrides)
//   - client_food_logs (dagelijkse tracking via barcode scan of handmatig)
//   - food_products (gedeelde tabel, iedereen kan lezen)
//
// RLS Policies:
//   nutrition_plan_templates: SELECT/INSERT/UPDATE/DELETE WHERE created_by = auth.uid()
//   nutrition_plan_template_meals/items: via JOIN templates WHERE created_by = auth.uid()
//   client_nutrition_plan: SELECT/INSERT WHERE client.coach_id = auth.uid()
//   client_food_logs: SELECT WHERE client.coach_id = auth.uid() (read-only voor coach)
//   food_products: SELECT voor iedereen (gedeelde database)
//
// Status: actief (beschikbaar) | concept (in ontwikkeling)
// Naleving: berekend uit client_food_logs vs nutrition_plan_templates macro targets
// ============================================================================

/** Voedingsschema's / maaltijdplannen */
const voedingsplannen = [
  {
    naam: "Hoog Eiwit Lean",
    beschrijving: "Hoog eiwit, matig koolhydraat plan voor spieropbouw met magere bronnen",
    calorieen: 2400,
    eiwit: 200,     // gram
    koolhydraten: 250,
    vet: 70,
    clienten: 8,
    status: "actief",
  },
  {
    naam: "Afvallen Deficit",
    beschrijving: "Calorietekort plan met focus op verzadiging en micronutriënten",
    calorieen: 1800,
    eiwit: 160,
    koolhydraten: 150,
    vet: 60,
    clienten: 14,
    status: "actief",
  },
  {
    naam: "Wedstrijd Prep Piek",
    beschrijving: "Competitie dieet met carb cycling en waterregulatie",
    calorieen: 2000,
    eiwit: 220,
    koolhydraten: 180,
    vet: 45,
    clienten: 3,
    status: "actief",
  },
  {
    naam: "Duurprestatie Brandstof",
    beschrijving: "Hoog koolhydraat plan geoptimaliseerd voor duurtraining en herstel",
    calorieen: 2800,
    eiwit: 140,
    koolhydraten: 380,
    vet: 75,
    clienten: 6,
    status: "actief",
  },
  {
    naam: "Onderhoud Balans",
    beschrijving: "Gebalanceerd onderhoudsplan voor algemene gezondheid en welzijn",
    calorieen: 2200,
    eiwit: 150,
    koolhydraten: 260,
    vet: 72,
    clienten: 10,
    status: "concept",
  },
]

/** Voedingstracking per cliënt */
const clientVoedingTracking = [
  { naam: "Sarah van Dijk", initialen: "SD", plan: "Hoog Eiwit Lean", naleving: 92, calGemiddeld: 2380, trend: "op-schema" },
  { naam: "Tom Bakker", initialen: "TB", plan: "Afvallen Deficit", naleving: 75, calGemiddeld: 2050, trend: "boven-doel" },
  { naam: "Lisa de Vries", initialen: "LV", plan: "Wedstrijd Prep Piek", naleving: 98, calGemiddeld: 1990, trend: "op-schema" },
  { naam: "James Peters", initialen: "JP", plan: "Hoog Eiwit Lean", naleving: 58, calGemiddeld: 2800, trend: "boven-doel" },
  { naam: "Emma Jansen", initialen: "EJ", plan: "Onderhoud Balans", naleving: 84, calGemiddeld: 2250, trend: "op-schema" },
  { naam: "Marco Visser", initialen: "MV", plan: "Duurprestatie Brandstof", naleving: 88, calGemiddeld: 2760, trend: "op-schema" },
]

function MacroBalk({ label, waarde, max, kleur }: { label: string; waarde: number; max: number; kleur: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium text-foreground">{waarde}g</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${kleur}`}
          style={{ width: `${Math.min((waarde / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  )
}

export function NutritionSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Voeding</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer voedingsplannen en volg cliëntvoeding</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Voedingsplan aanmaken
        </Button>
      </div>

      <Tabs defaultValue="plannen">
        <TabsList>
          <TabsTrigger value="plannen">Voedingsplannen</TabsTrigger>
          <TabsTrigger value="tracking">Cliënt tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="plannen" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {voedingsplannen.map((plan) => (
              <Card key={plan.naam} className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-chart-4/10 text-chart-4">
                        <Utensils className="size-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{plan.naam}</p>
                        {plan.status === "concept" ? (
                          <Badge variant="secondary" className="text-[10px] mt-0.5">Concept</Badge>
                        ) : (
                          <Badge className="bg-success/10 text-success border-success/20 text-[10px] mt-0.5">Actief</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Acties</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Plan bewerken</DropdownMenuItem>
                        <DropdownMenuItem><Copy className="mr-2 size-4" />Dupliceren</DropdownMenuItem>
                        <DropdownMenuItem>Toewijzen aan cliënt</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">{plan.beschrijving}</p>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{plan.calorieen} kcal</span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Users className="size-3.5" />
                      {plan.clienten} cliënten
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <MacroBalk label="Eiwit" waarde={plan.eiwit} max={250} kleur="bg-chart-1" />
                    <MacroBalk label="Koolhydraten" waarde={plan.koolhydraten} max={400} kleur="bg-chart-4" />
                    <MacroBalk label="Vet" waarde={plan.vet} max={100} kleur="bg-chart-5" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-foreground">Voedingsnaleving cliënten</CardTitle>
              <p className="text-xs text-muted-foreground">Weekgemiddelden en tracking compliance</p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-1">
                {clientVoedingTracking.map((client) => (
                  <div
                    key={client.naam}
                    className="flex items-center gap-4 rounded-lg px-3 py-3 hover:bg-secondary/50 transition-colors cursor-pointer"
                  >
                    <Avatar className="size-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {client.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{client.naam}</p>
                      <p className="text-xs text-muted-foreground">{client.plan}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Gem. calorieën</p>
                        <p className="text-sm font-medium text-foreground">{client.calGemiddeld} kcal</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 w-28">
                        <div className="flex justify-between w-full text-xs">
                          <span className="text-muted-foreground">Naleving</span>
                          <span className={`font-semibold ${client.naleving >= 80 ? "text-success" : client.naleving >= 60 ? "text-warning-foreground" : "text-destructive"}`}>
                            {client.naleving}%
                          </span>
                        </div>
                        <Progress value={client.naleving} className="h-1.5" />
                      </div>
                    </div>
                    {client.trend === "boven-doel" ? (
                      <Badge className="bg-warning/10 text-warning-foreground border-warning/20 text-[11px] hidden lg:flex">Boven doel</Badge>
                    ) : (
                      <Badge className="bg-success/10 text-success border-success/20 text-[11px] hidden lg:flex">Op schema</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
