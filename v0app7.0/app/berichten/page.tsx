"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, ChevronRight, Users } from "lucide-react"

type Tab = "coach" | "groepen"

const coachChat = {
  id: "coach",
  name: "Zorin Wijnands",
  role: "Je personal coach",
  avatar: "/images/avatar-michael.jpg",
  lastMessage: "goedemorgen zonnestraal",
  time: "08:24",
  unread: 2,
  online: true,
}

export default function BerichtenPage() {
  const [tab, setTab] = useState<Tab>("coach")
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <header className="px-5 pt-14 pb-4">
        <div className="flex items-center gap-4 mb-1">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-secondary/80"
          >
            <ArrowLeft className="h-4.5 w-4.5 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground font-mono tracking-tight">Berichten</h1>
            <p className="text-xs text-muted-foreground">Alles gelezen</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mt-4 bg-secondary/50 rounded-xl p-1">
          <button
            onClick={() => setTab("coach")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "coach"
                ? "bg-[#bad4e1]/15 text-[#bad4e1] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Coach
          </button>
          <button
            onClick={() => setTab("groepen")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              tab === "groepen"
                ? "bg-[#bad4e1]/15 text-[#bad4e1] shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Groepen
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-5 pb-32">
        {tab === "coach" ? (
          <div className="space-y-3">
            {/* Coach chat card */}
            <button
              onClick={() => router.push("/berichten/coach")}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-card border border-border transition-colors hover:bg-card/80 text-left"
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-12 w-12 rounded-full bg-[#bad4e1]/20 overflow-hidden">
                  <Image
                    src={coachChat.avatar}
                    alt={coachChat.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                </div>
                {coachChat.online && (
                  <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-card" />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <h3 className="text-sm font-semibold text-foreground truncate">{coachChat.name}</h3>
                  <span className="text-[11px] text-muted-foreground shrink-0 ml-2">{coachChat.time}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground truncate">{coachChat.lastMessage}</p>
                  {coachChat.unread > 0 && (
                    <span className="shrink-0 ml-2 h-5 min-w-5 rounded-full bg-[#bad4e1] flex items-center justify-center px-1.5">
                      <span className="text-[10px] font-bold text-[#0a0b0f]">{coachChat.unread}</span>
                    </span>
                  )}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </button>
          </div>
        ) : (
          /* Groepen empty state */
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
              <Users className="h-7 w-7 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground font-mono mb-1">Geen groepen</h3>
            <p className="text-sm text-muted-foreground text-center max-w-[240px]">
              Je coach kan je toevoegen aan groepsgesprekken.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
