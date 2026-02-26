"use client"

import { ShoppingCart, Pill } from "lucide-react"
import Link from "next/link"
import { useAnimatedNumber } from "@/hooks/use-animated-number"

interface VoedingHeaderProps {
  currentKcal: number
  targetKcal: number
}

export function VoedingHeader({ currentKcal, targetKcal }: VoedingHeaderProps) {
  const animatedKcal = useAnimatedNumber(currentKcal)

  return (
    <div className="flex items-end justify-between px-5 pt-14 pb-6">
      <div>
        <p className="text-xs text-[#bad4e1] font-semibold uppercase tracking-wider font-mono">Dagoverzicht</p>
        <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight mt-1">Voeding</h1>
        <p className="text-sm text-muted-foreground mt-1">
          <span className="text-foreground font-mono font-semibold">{animatedKcal}</span>
          {" / "}
          <span className="font-mono">{targetKcal} kcal</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/voeding/supplementen"
          className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pill className="h-5 w-5" />
        </Link>
        <Link
          href="/voeding/boodschappenlijst"
          className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ShoppingCart className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}
