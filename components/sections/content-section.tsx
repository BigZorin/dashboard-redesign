"use client"

import { Plus, Search, Video, FileText, Image, Play, Clock, Eye, MoreHorizontal, Upload, Filter } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte content uit je database/CMS
// ============================================================================

/** Educatieve content items (video's, artikelen, afbeeldingen) */
const contentItems = [
  {
    titel: "Correcte squat-techniek",
    type: "video",
    icon: Video,
    duur: "8:24",
    weergaven: 342,
    categorie: "Oefengidsen",
    toegevoegd: "2 dagen geleden",
    kleur: "bg-chart-5/10 text-chart-5",
  },
  {
    titel: "Macro's tellen voor beginners",
    type: "artikel",
    icon: FileText,
    duur: "5 min lezen",
    weergaven: 528,
    categorie: "Voeding",
    toegevoegd: "5 dagen geleden",
    kleur: "bg-chart-4/10 text-chart-4",
  },
  {
    titel: "Bench press progressie",
    type: "video",
    icon: Video,
    duur: "12:05",
    weergaven: 891,
    categorie: "Oefengidsen",
    toegevoegd: "1 week geleden",
    kleur: "bg-chart-5/10 text-chart-5",
  },
  {
    titel: "Pre-workout maaltijdideeën",
    type: "artikel",
    icon: FileText,
    duur: "3 min lezen",
    weergaven: 267,
    categorie: "Voeding",
    toegevoegd: "1 week geleden",
    kleur: "bg-chart-4/10 text-chart-4",
  },
  {
    titel: "Heup mobiliteitsroutine",
    type: "video",
    icon: Video,
    duur: "15:30",
    weergaven: 445,
    categorie: "Mobiliteit",
    toegevoegd: "2 weken geleden",
    kleur: "bg-chart-5/10 text-chart-5",
  },
  {
    titel: "Slaapoptimalisatie tips",
    type: "artikel",
    icon: FileText,
    duur: "4 min lezen",
    weergaven: 612,
    categorie: "Leefstijl",
    toegevoegd: "2 weken geleden",
    kleur: "bg-chart-4/10 text-chart-4",
  },
  {
    titel: "Deadlift setup checklist",
    type: "afbeelding",
    icon: Image,
    duur: "Infographic",
    weergaven: 198,
    categorie: "Oefengidsen",
    toegevoegd: "3 weken geleden",
    kleur: "bg-chart-2/10 text-chart-2",
  },
  {
    titel: "Actief herstel op rustdagen",
    type: "video",
    icon: Video,
    duur: "10:15",
    weergaven: 312,
    categorie: "Herstel",
    toegevoegd: "3 weken geleden",
    kleur: "bg-chart-5/10 text-chart-5",
  },
  {
    titel: "Eiwitbronnen vergelijking",
    type: "afbeelding",
    icon: Image,
    duur: "Infographic",
    weergaven: 445,
    categorie: "Voeding",
    toegevoegd: "1 maand geleden",
    kleur: "bg-chart-2/10 text-chart-2",
  },
]

export function ContentSection() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Contentbibliotheek</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Beheer educatieve content voor je cliënten</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-border">
            <Upload className="size-4" />
            Uploaden
          </Button>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="size-4" />
            Content aanmaken
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Zoek content..." className="pl-9 h-9 bg-card border-border" />
        </div>
        <Button variant="outline" size="sm" className="h-9 gap-2 border-border">
          <Filter className="size-4" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="alle">
        <TabsList>
          <TabsTrigger value="alle">Alle ({contentItems.length})</TabsTrigger>
          <TabsTrigger value="videos">{"Video's"} ({contentItems.filter(c => c.type === "video").length})</TabsTrigger>
          <TabsTrigger value="artikelen">Artikelen ({contentItems.filter(c => c.type === "artikel").length})</TabsTrigger>
          <TabsTrigger value="afbeeldingen">Afbeeldingen ({contentItems.filter(c => c.type === "afbeelding").length})</TabsTrigger>
        </TabsList>

        {["alle", "videos", "artikelen", "afbeeldingen"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {contentItems
                .filter((item) => tab === "alle" || (tab === "videos" && item.type === "video") || (tab === "artikelen" && item.type === "artikel") || (tab === "afbeeldingen" && item.type === "afbeelding"))
                .map((item) => (
                  <Card key={item.titel} className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-10 items-center justify-center rounded-lg ${item.kleur}`}>
                            {item.type === "video" ? (
                              <Play className="size-5" />
                            ) : (
                              <item.icon className="size-5" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">{item.titel}</p>
                            <Badge variant="outline" className="text-[10px] mt-1 border-border text-muted-foreground">
                              {item.categorie}
                            </Badge>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground shrink-0">
                              <MoreHorizontal className="size-4" />
                              <span className="sr-only">Acties</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Bewerken</DropdownMenuItem>
                            <DropdownMenuItem>Delen met cliënt</DropdownMenuItem>
                            <DropdownMenuItem>Dupliceren</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {item.duur}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="size-3" />
                          {item.weergaven} weergaven
                        </div>
                        <span>{item.toegevoegd}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
