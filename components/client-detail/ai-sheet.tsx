"use client"

import { useState } from "react"
import { Sparkles, Send, Brain, Dumbbell, Apple, Pill, RefreshCw, BookOpen, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

// ============================================================================
// PLACEHOLDER DATA — AI Sheet (compacte versie van AI Coach)
// Vervang met echte data uit:
//   - AI API responses (Groq/OpenAI via RAG pipeline)
//   - ai_conversations (Supabase: chatgeschiedenis, context = "sheet")
//
// Dit is de slide-over variant — beschikbaar vanuit elke tab.
// Deelt dezelfde API maar heeft een compactere UI.
// ============================================================================

/** Snelle prompts voor de sheet — Voorgedefinieerde acties */
const sheetPrompts = [
  { label: "Wekelijkse review", icon: RefreshCw },
  { label: "Trainingsadvies", icon: Dumbbell },
  { label: "Voedingsadvies", icon: Apple },
  { label: "Supplementen", icon: Pill },
  { label: "Kennisbank", icon: BookOpen },
]

/** Recente AI berichten (compact) — Supabase: ai_conversations WHERE context = 'sheet' */
const recenteBerichten = [
  {
    id: "sheet_001",
    rol: "coach" as const,                // <-- "ai" | "coach"
    tekst: "Wat zijn de beste supplementen voor herstel na zware training?",
    timestamp: "14:30",
  },
  {
    id: "sheet_002",
    rol: "ai" as const,
    tekst: "Op basis van de RAG-data en het profiel van Sarah, raad ik het volgende aan voor optimaal herstel:\n\n1. **Creatine monohydraat** (5g/dag) - al in protocol, behouden\n2. **Magnesium bisglycinaat** (400mg voor het slapen) - al in protocol\n3. **Tart cherry extract** (500mg 2x/dag) - nieuw, sterk bewijs voor ontstekingsremming\n4. **Ashwagandha** (300mg KSM-66) - overweeg bij verhoogde stress\n\nDeze zijn gebaseerd op haar huidige trainingsvolume en de stressklachten die je eerder noteerde.",
    timestamp: "14:31",
    bronnen: ["Supplement Efficacy Database", "Herstel & Adaptatie Research"],
  },
  {
    id: "sheet_003",
    rol: "coach" as const,
    tekst: "Hoeveel eiwitten heeft ze nodig op rustdagen vs trainingsdagen?",
    timestamp: "14:33",
  },
  {
    id: "sheet_004",
    rol: "ai" as const,
    tekst: "Bij Sarah's gewicht (71.1 kg) en trainingsintensiteit:\n\n**Trainingsdagen:** 160-180g eiwit (2.2-2.5g/kg)\n**Rustdagen:** 140-160g eiwit (2.0-2.2g/kg)\n\nHet verschil zit in de verhoogde spiereiwitsynthese na training. Op rustdagen kan ze de calorieën beter herverdelen naar koolhydraten voor glycogeenherstel.",
    timestamp: "14:34",
    bronnen: ["Eiwit Timing & Dosering Review"],
  },
]

interface AiSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AiSheet({ open, onOpenChange }: AiSheetProps) {
  const [berichtTekst, setBerichtTekst] = useState("")

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col gap-0 border-border">
        {/* Header */}
        <SheetHeader className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                <Brain className="size-3.5 text-primary" />
              </div>
              <div>
                <SheetTitle className="text-sm font-semibold">AI Coach</SheetTitle>
                <p className="text-[10px] text-muted-foreground">Snelle vragen & advies</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[9px] gap-1">
                <span className="size-1.5 rounded-full bg-success" />
                RAG actief
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => onOpenChange(false)}
              >
                <X className="size-4" />
                <span className="sr-only">Sluiten</span>
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* Snelle prompts */}
        <div className="px-4 py-2 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {sheetPrompts.map((prompt, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-6 text-[10px] gap-1 whitespace-nowrap shrink-0 border-border hover:border-primary/30 hover:text-primary px-2"
                onClick={() => setBerichtTekst(prompt.label + ": ")}
              >
                <prompt.icon className="size-2.5" />
                {prompt.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat berichten */}
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-3">
            {recenteBerichten.map((bericht) => (
              <div
                key={bericht.id}
                className={`flex flex-col gap-0.5 ${bericht.rol === "coach" ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[90%] rounded-lg p-2.5 ${
                    bericht.rol === "ai"
                      ? "bg-secondary/60 border border-border"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {bericht.rol === "ai" && (
                    <div className="flex items-center gap-1 mb-1.5">
                      <Sparkles className="size-2.5 text-primary" />
                      <span className="text-[9px] font-semibold text-primary">AI Coach</span>
                    </div>
                  )}
                  <p className={`text-xs leading-relaxed whitespace-pre-line ${
                    bericht.rol === "coach" ? "text-primary-foreground" : "text-foreground"
                  }`}>
                    {bericht.tekst}
                  </p>
                  {"bronnen" in bericht && bericht.bronnen && bericht.bronnen.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5 pt-1.5 border-t border-border/50">
                      {bericht.bronnen.map((bron, i) => (
                        <Badge key={i} variant="outline" className="text-[8px] px-1 py-0 h-3.5">
                          {bron}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-muted-foreground px-1">{bericht.timestamp}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <Textarea
              value={berichtTekst}
              onChange={(e) => setBerichtTekst(e.target.value)}
              placeholder="Stel een snelle vraag..."
              className="min-h-[50px] max-h-[100px] resize-none border-border text-xs"
              rows={2}
            />
            <Button
              size="icon"
              className="size-9 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={!berichtTekst.trim()}
            >
              <Send className="size-3.5" />
              <span className="sr-only">Verstuur</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
