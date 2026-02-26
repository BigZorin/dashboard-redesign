"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Heart, Info } from "lucide-react"
import { BottomNav } from "@/components/shared/bottom-nav"

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative h-7 w-12 rounded-full transition-colors shrink-0 ${
        enabled ? "bg-[#bad4e1]" : "bg-secondary"
      }`}
    >
      <div
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

export default function WearablesPage() {
  const [googleFit, setGoogleFit] = useState(false)

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
        <h1 className="text-base font-bold text-foreground font-mono flex-1 text-center pr-9">Wearables</h1>
      </div>

      <main className="pb-40">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-5 pb-2 pt-4 font-mono">
          KOPPELINGEN
        </p>

        <div className="mx-4 rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center gap-4 px-4 py-3.5">
            <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/15 flex items-center justify-center shrink-0">
              <Heart className="h-5 w-5 text-[#bad4e1]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Google Fit</p>
              <p className="text-xs text-muted-foreground">Vereist development build</p>
            </div>
            <Toggle enabled={googleFit} onChange={setGoogleFit} />
          </div>
        </div>

        {/* Info banner */}
        <div className="mx-4 mt-4 rounded-2xl bg-[#bad4e1]/10 border border-[#bad4e1]/20 p-4 flex gap-3">
          <Info className="h-5 w-5 text-[#bad4e1] shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            Health integratie vereist een Expo development build. In Expo Go zijn de toggles uitgeschakeld. De data wordt alsnog opgeslagen in je profiel.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
