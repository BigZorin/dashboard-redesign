"use client"

import { ShoppingCart } from "lucide-react"
import Link from "next/link"

interface VoedingHeaderProps {
  currentKcal: number
  targetKcal: number
}

export function VoedingHeader({ currentKcal, targetKcal }: VoedingHeaderProps) {
  return (
    <div className="flex items-end justify-between px-5 pt-14 pb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">Voeding</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          <span className="text-foreground font-mono font-semibold">{currentKcal}</span>
          {" / "}
          <span className="font-mono">{targetKcal} kcal</span>
        </p>
      </div>
      <Link
        href="/voeding/boodschappenlijst"
        className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ShoppingCart className="h-5 w-5" />
      </Link>
    </div>
  )
}
