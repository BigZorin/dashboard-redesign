"use client"

import { User, Target, Dumbbell, Apple, Heart, Briefcase, Sparkles, Save, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// ============================================================================
// PLACEHOLDER DATA — Intake formulier: baseline informatie per cliënt
//
// COACH-SCOPED: Coach kan alleen intake van eigen clienten bekijken/bewerken.
// RLS: SELECT/UPDATE op client_intake via JOIN clients WHERE coach_id = auth.uid()
//
// De intake is de belangrijkste bron voor AI-gegenereerde eerste programma's
// en voedingsplannen. Alle velden worden meegestuurd als context naar de AI.
//
// Supabase tabel: client_intake
//   Velden:
//     - client_id (FK -> clients.id)
//     - geboortedatum (date)
//     - geslacht (text: man | vrouw | anders)
//     - lengte_cm (integer)
//     - huidig_gewicht_kg (decimal)
//     - primair_doel (text: afvallen | spiermassa | kracht | gezondheid | sport_specifiek)
//     - doel_gewicht_kg (decimal, nullable — niet altijd relevant)
//     - doel_deadline (date, nullable)
//     - ervaring (text: beginner | gemiddeld | gevorderd)
//     - huidige_frequentie (integer — sessies per week nu)
//     - beschikbare_dagen (integer — hoeveel dagen per week beschikbaar)
//     - beschikbare_apparatuur (text[]: sportschool | homegym | bodyweight | banden | etc.)
//     - allergieen (text[] — voedselallergieën)
//     - dieet (text: normaal | vegetarisch | veganistisch | keto | paleo | halal)
//     - maaltijdmomenten (integer — hoeveel maaltijden per dag gewenst)
//     - blessures (text — vrij tekstveld)
//     - medicatie (text — vrij tekstveld)
//     - slaap_uren (decimal — gemiddelde slaap per nacht)
//     - beroep_type (text: zittend | staand | actief)
//     - stress_niveau (integer 1-10)
//     - extra_notities (text — vrij tekstveld voor overige info)
//     - ingevuld_op (timestamptz)
//     - laatst_bijgewerkt (timestamptz)
//
// AI koppeling:
//   Bij "AI Programma Genereren" wordt de volledige intake als context
//   meegestuurd naar de AI (via Supabase Edge Function + OpenAI/Anthropic).
//   De AI genereert een eerste trainings- + voedingsplan op basis hiervan.
//   Output wordt opgeslagen in: programs + nutrition_plan_templates
// ============================================================================

/** Intake gegevens — Supabase: client_intake */
const intakeGegevens = {
  // Persoonlijk
  geboortedatum: "1996-04-12",              // <-- client_intake.geboortedatum
  geslacht: "vrouw",                         // <-- client_intake.geslacht
  lengte: 168,                               // <-- client_intake.lengte_cm
  huidigGewicht: 71.5,                       // <-- client_intake.huidig_gewicht_kg

  // Doelstellingen
  primairDoel: "afvallen",                   // <-- client_intake.primair_doel
  doelGewicht: 65,                           // <-- client_intake.doel_gewicht_kg
  doelDeadline: "2026-06-01",               // <-- client_intake.doel_deadline

  // Training
  ervaring: "gemiddeld",                     // <-- client_intake.ervaring
  huidigeFrequentie: 3,                      // <-- client_intake.huidige_frequentie
  beschikbareDagen: 4,                       // <-- client_intake.beschikbare_dagen
  beschikbareApparatuur: ["sportschool"],    // <-- client_intake.beschikbare_apparatuur

  // Voeding
  allergieen: ["noten"],                     // <-- client_intake.allergieen
  dieet: "normaal",                          // <-- client_intake.dieet
  maaltijdmomenten: 4,                       // <-- client_intake.maaltijdmomenten

  // Gezondheid
  blessures: "Lichte knieklachten links, geen operatie gehad",  // <-- client_intake.blessures
  medicatie: "Geen",                         // <-- client_intake.medicatie
  slaapUren: 7.5,                            // <-- client_intake.slaap_uren

  // Leefstijl
  beroepType: "zittend",                     // <-- client_intake.beroep_type
  stressNiveau: 5,                           // <-- client_intake.stress_niveau (1-10)
  extraNotities: "Wil graag 3x per week trainen met 1 optionele cardiodag. Heeft eerder een 12-weken programma gevolgd maar niet afgemaakt.",

  // Meta
  ingevuldOp: "15 sep 2025",                // <-- client_intake.ingevuld_op
  laatstBijgewerkt: "3 jan 2026",           // <-- client_intake.laatst_bijgewerkt
}

// ---- Sectie wrapper ----
function IntakeSectie({ icon: Icon, titel, children }: {
  icon: React.ComponentType<{ className?: string }>
  titel: string
  children: React.ReactNode
}) {
  return (
    <Card className="border-border p-0 gap-0">
      <CardContent className="p-5">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
          <Icon className="size-4 text-primary" />
          {titel}
        </h3>
        <div className="flex flex-col gap-4">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

// ---- Veld component ----
function Veld({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}

// ==== HOOFD COMPONENT ====

export function IntakeTab() {
  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Intake Formulier</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Baseline informatie — deze data wordt gebruikt door AI voor het genereren van programma{"'"}s en voedingsplannen.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">Laatst bijgewerkt: {intakeGegevens.laatstBijgewerkt}</span>
          <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <Save className="size-3.5" />
            Opslaan
          </Button>
        </div>
      </div>

      {/* AI Generatie banner */}
      <div className="flex items-center gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="size-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">AI Programma Genereren</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Genereer automatisch een trainings- en voedingsplan op basis van deze intake gegevens.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
          <Sparkles className="size-3.5" />
          Genereren
        </Button>
      </div>

      {/* Formulier secties */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Kolom 1 */}
        <div className="flex flex-col gap-5">
          {/* Persoonlijke gegevens */}
          <IntakeSectie icon={User} titel="Persoonlijke gegevens">
            <div className="grid grid-cols-2 gap-3">
              <Veld label="Geboortedatum">
                <Input type="date" defaultValue={intakeGegevens.geboortedatum} className="text-sm" />
              </Veld>
              <Veld label="Geslacht">
                <Select defaultValue={intakeGegevens.geslacht}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="man">Man</SelectItem>
                    <SelectItem value="vrouw">Vrouw</SelectItem>
                    <SelectItem value="anders">Anders</SelectItem>
                  </SelectContent>
                </Select>
              </Veld>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Veld label="Lengte (cm)">
                <Input type="number" defaultValue={intakeGegevens.lengte} className="text-sm" />
              </Veld>
              <Veld label="Huidig gewicht (kg)">
                <Input type="number" step="0.1" defaultValue={intakeGegevens.huidigGewicht} className="text-sm" />
              </Veld>
            </div>
          </IntakeSectie>

          {/* Doelstellingen */}
          <IntakeSectie icon={Target} titel="Doelstellingen">
            <Veld label="Primair doel">
              <Select defaultValue={intakeGegevens.primairDoel}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="afvallen">Afvallen</SelectItem>
                  <SelectItem value="spiermassa">Spiermassa opbouwen</SelectItem>
                  <SelectItem value="kracht">Kracht verbeteren</SelectItem>
                  <SelectItem value="gezondheid">Algemene gezondheid</SelectItem>
                  <SelectItem value="sport_specifiek">Sport-specifiek</SelectItem>
                </SelectContent>
              </Select>
            </Veld>
            <div className="grid grid-cols-2 gap-3">
              <Veld label="Doelgewicht (kg)">
                <Input type="number" step="0.1" defaultValue={intakeGegevens.doelGewicht} className="text-sm" />
              </Veld>
              <Veld label="Deadline">
                <Input type="date" defaultValue={intakeGegevens.doelDeadline} className="text-sm" />
              </Veld>
            </div>
          </IntakeSectie>

          {/* Trainingshistorie */}
          <IntakeSectie icon={Dumbbell} titel="Trainingshistorie">
            <Veld label="Ervaring">
              <Select defaultValue={intakeGegevens.ervaring}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 jaar)</SelectItem>
                  <SelectItem value="gemiddeld">Gemiddeld (1-3 jaar)</SelectItem>
                  <SelectItem value="gevorderd">Gevorderd (3+ jaar)</SelectItem>
                </SelectContent>
              </Select>
            </Veld>
            <div className="grid grid-cols-2 gap-3">
              <Veld label="Huidige frequentie (per week)">
                <Input type="number" min={0} max={7} defaultValue={intakeGegevens.huidigeFrequentie} className="text-sm" />
              </Veld>
              <Veld label="Beschikbare dagen (per week)">
                <Input type="number" min={1} max={7} defaultValue={intakeGegevens.beschikbareDagen} className="text-sm" />
              </Veld>
            </div>
            <Veld label="Beschikbare apparatuur">
              <div className="flex flex-wrap gap-2">
                {["sportschool", "homegym", "bodyweight", "banden", "dumbbells", "kettlebells"].map((item) => (
                  <Badge
                    key={item}
                    variant={intakeGegevens.beschikbareApparatuur.includes(item) ? "default" : "outline"}
                    className={
                      intakeGegevens.beschikbareApparatuur.includes(item)
                        ? "text-[11px] cursor-pointer bg-primary text-primary-foreground"
                        : "text-[11px] cursor-pointer text-muted-foreground hover:border-primary/50"
                    }
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </Veld>
          </IntakeSectie>
        </div>

        {/* Kolom 2 */}
        <div className="flex flex-col gap-5">
          {/* Voedingsvoorkeuren */}
          <IntakeSectie icon={Apple} titel="Voedingsvoorkeuren">
            <Veld label="Dieet">
              <Select defaultValue={intakeGegevens.dieet}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normaal">Normaal</SelectItem>
                  <SelectItem value="vegetarisch">Vegetarisch</SelectItem>
                  <SelectItem value="veganistisch">Veganistisch</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="paleo">Paleo</SelectItem>
                  <SelectItem value="halal">Halal</SelectItem>
                </SelectContent>
              </Select>
            </Veld>
            <Veld label="Allergieën">
              <div className="flex flex-wrap gap-2">
                {["noten", "gluten", "lactose", "schaaldieren", "soja", "eieren"].map((item) => (
                  <Badge
                    key={item}
                    variant={intakeGegevens.allergieen.includes(item) ? "default" : "outline"}
                    className={
                      intakeGegevens.allergieen.includes(item)
                        ? "text-[11px] cursor-pointer bg-destructive text-primary-foreground border-destructive"
                        : "text-[11px] cursor-pointer text-muted-foreground hover:border-primary/50"
                    }
                  >
                    {item}
                  </Badge>
                ))}
              </div>
            </Veld>
            <Veld label="Gewenste maaltijdmomenten per dag">
              <Input type="number" min={2} max={8} defaultValue={intakeGegevens.maaltijdmomenten} className="text-sm" />
            </Veld>
          </IntakeSectie>

          {/* Gezondheid */}
          <IntakeSectie icon={Heart} titel="Gezondheid">
            <Veld label="Blessures / beperkingen">
              <Textarea defaultValue={intakeGegevens.blessures} rows={2} className="text-sm resize-none" />
            </Veld>
            <Veld label="Medicatie">
              <Input defaultValue={intakeGegevens.medicatie} className="text-sm" />
            </Veld>
            <Veld label="Gemiddelde slaap (uren per nacht)">
              <Input type="number" step="0.5" min={3} max={12} defaultValue={intakeGegevens.slaapUren} className="text-sm" />
            </Veld>
            {intakeGegevens.blessures && intakeGegevens.blessures !== "Geen" && (
              <div className="flex items-start gap-2 rounded-md bg-warning/10 p-3 border border-warning/20">
                <AlertCircle className="size-4 text-warning-foreground shrink-0 mt-0.5" />
                <p className="text-[11px] text-warning-foreground">
                  Let op: blessure-informatie wordt meegenomen bij AI-generatie om oefeningen automatisch aan te passen.
                </p>
              </div>
            )}
          </IntakeSectie>

          {/* Leefstijl */}
          <IntakeSectie icon={Briefcase} titel="Leefstijl">
            <Veld label="Type beroep">
              <Select defaultValue={intakeGegevens.beroepType}>
                <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="zittend">Zittend (kantoor)</SelectItem>
                  <SelectItem value="staand">Staand (retail, horeca)</SelectItem>
                  <SelectItem value="actief">Actief (bouw, sport)</SelectItem>
                </SelectContent>
              </Select>
            </Veld>
            <Veld label="Stressniveau (1-10)">
              <Input type="number" min={1} max={10} defaultValue={intakeGegevens.stressNiveau} className="text-sm" />
            </Veld>
            <Veld label="Extra notities">
              <Textarea defaultValue={intakeGegevens.extraNotities} rows={3} className="text-sm resize-none" />
            </Veld>
          </IntakeSectie>
        </div>
      </div>
    </div>
  )
}
