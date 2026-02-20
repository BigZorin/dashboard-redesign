"use client"

import { useState } from "react"
import { Search, Paperclip, Send, Image, Mic, MoreVertical, Phone, Video, Check, CheckCheck } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte chatdata uit je database/real-time systeem
// ============================================================================

/** Conversatielijst in de sidebar van berichten */
const gesprekken = [
  {
    id: "1",
    naam: "Sarah van Dijk",
    initialen: "SD",
    laatsteBericht: "Bedankt coach! Ik ga morgen de nieuwe schouder warm-up proberen",
    tijd: "10 min geleden",
    ongelezen: 2,
    online: true,
  },
  {
    id: "2",
    naam: "Tom Bakker",
    initialen: "TB",
    laatsteBericht: "Moet ik op rustdagen nog steeds cardio doen?",
    tijd: "32 min geleden",
    ongelezen: 1,
    online: true,
  },
  {
    id: "3",
    naam: "Lisa de Vries",
    initialen: "LV",
    laatsteBericht: "Check-in ingediend! Peak week gaat super",
    tijd: "1 uur geleden",
    ongelezen: 0,
    online: false,
  },
  {
    id: "4",
    naam: "James Peters",
    initialen: "JP",
    laatsteBericht: "Sorry, ik heb de sessie van maandag gemist. Kunnen we verzetten?",
    tijd: "2 uur geleden",
    ongelezen: 1,
    online: false,
  },
  {
    id: "5",
    naam: "Emma Jansen",
    initialen: "EJ",
    laatsteBericht: "Ik voel me zoveel beter na het mobiliteitswerk!",
    tijd: "3 uur geleden",
    ongelezen: 0,
    online: true,
  },
  {
    id: "6",
    naam: "Marco Visser",
    initialen: "MV",
    laatsteBericht: "Lange duurloop gedaan! 18km op een comfortabel tempo",
    tijd: "5 uur geleden",
    ongelezen: 0,
    online: false,
  },
  {
    id: "7",
    naam: "Anna Groot",
    initialen: "AG",
    laatsteBericht: "De oefeningen worden makkelijker, kunnen we opbouwen?",
    tijd: "1 dag geleden",
    ongelezen: 1,
    online: false,
  },
]

/** Chatberichten voor het geselecteerde gesprek */
const chatBerichten = [
  { id: "1", afzender: "client", tekst: "Hey coach! Net mijn workout afgerond. De bench voelde zwaar vandaag.", tijd: "09:15", gelezen: true },
  { id: "2", afzender: "coach", tekst: "Dat is normaal na de deload week. Je zenuwstelsel past zich weer aan. Hoe was je slaap vannacht?", tijd: "09:18", gelezen: true },
  { id: "3", afzender: "client", tekst: "Niet geweldig, maar 5-6 uur. Mijn schouder voelde ook een beetje stijf bij de warm-up sets.", tijd: "09:20", gelezen: true },
  { id: "4", afzender: "coach", tekst: "Slaap kan zeker je prestatie beïnvloeden. Laten we extra schoudermobiliteit toevoegen voor je volgende druksessie. Ik pas je warm-up protocol aan.", tijd: "09:22", gelezen: true },
  { id: "5", afzender: "client", tekst: "Dat zou top zijn! Moet ik donderdag nog steeds de geplande gewichten pakken?", tijd: "09:24", gelezen: true },
  { id: "6", afzender: "coach", tekst: "Ja, houd je aan het plan. Maar als je schouder gek aanvoelt bij de warm-up, ga 10% omlaag en focus op controle. Kwaliteit boven ego.", tijd: "09:26", gelezen: true },
  { id: "7", afzender: "client", tekst: "Bedankt coach! Ik ga morgen de nieuwe schouder warm-up proberen", tijd: "09:30", gelezen: false },
  { id: "8", afzender: "client", tekst: "Oh, en snelle vraag over voeding - mag ik de rijst omruilen voor zoete aardappel bij maaltijd 3?", tijd: "09:31", gelezen: false },
]

export function MessagesSection() {
  const [geselecteerdChat, setGeselecteerdChat] = useState("1")
  const geselecteerdGesprek = gesprekken.find((g) => g.id === geselecteerdChat)

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Gesprekkenlijst */}
      <div className="flex w-80 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-2 border-b border-border p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Zoek gesprekken..." className="pl-9 h-9 bg-secondary border-border" />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="flex flex-col">
            {gesprekken.map((gesprek) => (
              <button
                key={gesprek.id}
                onClick={() => setGeselecteerdChat(gesprek.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50 border-b border-border/50",
                  geselecteerdChat === gesprek.id && "bg-secondary"
                )}
              >
                <div className="relative">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {gesprek.initialen}
                    </AvatarFallback>
                  </Avatar>
                  {gesprek.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground truncate">{gesprek.naam}</p>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{gesprek.tijd}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{gesprek.laatsteBericht}</p>
                </div>
                {gesprek.ongelezen > 0 && (
                  <div className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shrink-0">
                    {gesprek.ongelezen}
                  </div>
                )}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chatvenster */}
      <div className="flex flex-1 flex-col">
        {/* Chat header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="size-9">
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {geselecteerdGesprek?.initialen}
                </AvatarFallback>
              </Avatar>
              {geselecteerdGesprek?.online && (
                <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-success" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{geselecteerdGesprek?.naam}</p>
              <p className="text-xs text-muted-foreground">
                {geselecteerdGesprek?.online ? "Online" : "Laatst gezien " + geselecteerdGesprek?.tijd}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <Phone className="size-4" />
              <span className="sr-only">Bellen</span>
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <Video className="size-4" />
              <span className="sr-only">Videogesprek</span>
            </Button>
            <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
              <MoreVertical className="size-4" />
              <span className="sr-only">Meer opties</span>
            </Button>
          </div>
        </div>

        {/* Berichten */}
        <ScrollArea className="flex-1 p-6">
          <div className="flex flex-col gap-4 max-w-3xl mx-auto">
            <div className="text-center">
              <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">Vandaag</span>
            </div>
            {chatBerichten.map((bericht) => (
              <div
                key={bericht.id}
                className={cn(
                  "flex flex-col max-w-[75%]",
                  bericht.afzender === "coach" ? "items-end ml-auto" : "items-start"
                )}
              >
                <div
                  className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    bericht.afzender === "coach"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-card border border-border text-foreground rounded-bl-md"
                  )}
                >
                  {bericht.tekst}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span className="text-[11px] text-muted-foreground">{bericht.tijd}</span>
                  {bericht.afzender === "coach" && (
                    bericht.gelezen ? (
                      <CheckCheck className="size-3 text-primary" />
                    ) : (
                      <Check className="size-3 text-muted-foreground" />
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Berichtinvoer */}
        <div className="border-t border-border bg-card p-4">
          <div className="flex items-center gap-2 max-w-3xl mx-auto">
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground shrink-0">
              <Paperclip className="size-4" />
              <span className="sr-only">Bestand bijvoegen</span>
            </Button>
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground shrink-0">
              <Image className="size-4" />
              <span className="sr-only">Afbeelding sturen</span>
            </Button>
            <Input
              placeholder="Typ je bericht..."
              className="flex-1 h-10 bg-secondary border-border rounded-full px-4"
            />
            <Button variant="ghost" size="icon" className="size-9 text-muted-foreground hover:text-foreground shrink-0">
              <Mic className="size-4" />
              <span className="sr-only">Spraakbericht</span>
            </Button>
            <Button size="icon" className="size-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full shrink-0">
              <Send className="size-4" />
              <span className="sr-only">Verstuur bericht</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
