"use client"

import { Plus, Copy, MoreHorizontal, Clock, Users, Dumbbell, Flame, Target, Zap, Heart } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte programma's uit je database
// ============================================================================

/** Trainingsprogramma's die de coach aanbiedt */
const programmas = [
  {
    naam: "Kracht Fase 2",
    beschrijving: "Progressief overbelastingsprogramma gericht op samengestelde oefeningen",
    categorie: "kracht",
    duur: "8 weken",
    clienten: 12,            // <-- Aantal cliënten op dit programma
    icon: Dumbbell,
    kleur: "bg-chart-1/10 text-chart-1",
    sessiesPerWeek: 4,
    status: "actief",        // actief | concept
  },
  {
    naam: "Afvallen 12 weken",
    beschrijving: "HIIT en weerstandstraining met calorieën-deficit protocollen",
    categorie: "afvallen",
    duur: "12 weken",
    clienten: 18,
    icon: Flame,
    kleur: "bg-chart-5/10 text-chart-5",
    sessiesPerWeek: 5,
    status: "actief",
  },
  {
    naam: "Wedstrijd Prep",
    beschrijving: "Gevorderd bodybuilding prep met periodisering en peak week",
    categorie: "kracht",
    duur: "16 weken",
    clienten: 3,
    icon: Target,
    kleur: "bg-chart-3/10 text-chart-3",
    sessiesPerWeek: 6,
    status: "actief",
  },
  {
    naam: "Marathon Prep",
    beschrijving: "Opbouw van uithoudingsvermogen met progressieve kilometers",
    categorie: "uithoudingsvermogen",
    duur: "20 weken",
    clienten: 8,
    icon: Zap,
    kleur: "bg-chart-4/10 text-chart-4",
    sessiesPerWeek: 5,
    status: "actief",
  },
  {
    naam: "Wellness & Mobiliteit",
    beschrijving: "Flexibiliteit, mobiliteit en stressmanagement routines",
    categorie: "wellness",
    duur: "Doorlopend",
    clienten: 6,
    icon: Heart,
    kleur: "bg-chart-2/10 text-chart-2",
    sessiesPerWeek: 3,
    status: "actief",
  },
  {
    naam: "Spiermassa Basis",
    beschrijving: "Beginners hypertrofie programma met progressieve volume-opbouw",
    categorie: "kracht",
    duur: "10 weken",
    clienten: 14,
    icon: Dumbbell,
    kleur: "bg-chart-1/10 text-chart-1",
    sessiesPerWeek: 4,
    status: "actief",
  },
  {
    naam: "Postnataal Herstel",
    beschrijving: "Zacht herstelprogramma voor nieuwe moeders",
    categorie: "wellness",
    duur: "12 weken",
    clienten: 4,
    icon: Heart,
    kleur: "bg-chart-2/10 text-chart-2",
    sessiesPerWeek: 3,
    status: "concept",
  },
  {
    naam: "HIIT Express",
    beschrijving: "Korte, intense workouts voor drukke professionals",
    categorie: "afvallen",
    duur: "6 weken",
    clienten: 0,
    icon: Flame,
    kleur: "bg-chart-5/10 text-chart-5",
    sessiesPerWeek: 4,
    status: "concept",
  },
]

export function ProgramsSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">{"Programma's"}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{"Maak en beheer trainingsprogramma's voor je cliënten"}</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="size-4" />
          Programma aanmaken
        </Button>
      </div>

      <Tabs defaultValue="alle">
        <TabsList>
          <TabsTrigger value="alle">Alle ({programmas.length})</TabsTrigger>
          <TabsTrigger value="actief">Actief ({programmas.filter(p => p.status === "actief").length})</TabsTrigger>
          <TabsTrigger value="concept">Concepten ({programmas.filter(p => p.status === "concept").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="alle" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programmas.map((programma) => (
              <ProgrammaKaart key={programma.naam} programma={programma} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="actief" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programmas.filter(p => p.status === "actief").map((programma) => (
              <ProgrammaKaart key={programma.naam} programma={programma} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="concept" className="mt-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {programmas.filter(p => p.status === "concept").map((programma) => (
              <ProgrammaKaart key={programma.naam} programma={programma} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ProgrammaKaart({ programma }: { programma: typeof programmas[number] }) {
  return (
    <Card className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`flex size-10 items-center justify-center rounded-lg ${programma.kleur}`}>
              <programma.icon className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{programma.naam}</p>
              {programma.status === "concept" ? (
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
              <DropdownMenuItem>Programma bewerken</DropdownMenuItem>
              <DropdownMenuItem><Copy className="mr-2 size-4" />Dupliceren</DropdownMenuItem>
              <DropdownMenuItem>Toewijzen aan cliënt</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="mt-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">{programma.beschrijving}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {programma.duur}
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="size-3.5" />
            {programma.clienten} cliënten
          </div>
          <div className="flex items-center gap-1.5">
            <Dumbbell className="size-3.5" />
            {programma.sessiesPerWeek}x/week
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
