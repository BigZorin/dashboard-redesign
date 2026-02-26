"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { BottomNav } from "@/components/shared/bottom-nav"

export default function ProfielPage() {
  const [firstName, setFirstName] = useState("Michael")
  const [lastName, setLastName] = useState("Jackson")
  const email = "info@bigzorin.nl"
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[hsl(var(--header))] border-b border-border px-5 pt-12 pb-4 flex items-center gap-4">
        <Link
          href="/meer"
          className="h-9 w-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-base font-bold text-foreground font-mono flex-1 text-center pr-9">Profiel bewerken</h1>
      </div>

      <main className="px-5 pb-40 pt-8">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-[#bad4e1]/30">
            <Image
              src="/images/avatar-michael.jpg"
              alt="Profielfoto"
              fill
              className="object-cover"
            />
          </div>
          <button className="mt-3 text-sm font-semibold text-[#bad4e1]">
            Foto wijzigen
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Voornaam</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Achternaam</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">E-mail</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                readOnly
                className="w-full rounded-xl bg-secondary/60 border border-border px-4 py-3 text-sm text-muted-foreground cursor-not-allowed pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <MessageSquare className="h-5 w-5 text-muted-foreground/40" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">E-mailadres kan niet worden gewijzigd</p>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full mt-3 py-3.5 rounded-2xl bg-[#bad4e1] text-[#0a0a0a] font-semibold text-sm hover:bg-[#bad4e1]/90 transition-colors"
          >
            {saved ? "Opgeslagen" : "Opslaan"}
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
