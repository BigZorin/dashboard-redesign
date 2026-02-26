"use client"

import Link from "next/link"
import { Dumbbell, ChevronRight, Clock } from "lucide-react"

export function NextTraining() {
  return (
    <section className="mx-5">
      <Link href="/workout/upperbody/overview" className="w-full group relative overflow-hidden rounded-2xl bg-card border border-border p-5 text-left transition-all hover:border-[#bad4e1]/30 block">
        <div className="absolute inset-0 bg-gradient-to-r from-[#bad4e1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="relative flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-[#bad4e1]/15 flex items-center justify-center shrink-0">
            <Dumbbell className="h-5 w-5 text-[#bad4e1]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1]">
                Volgende training
              </span>
              <span className="text-[10px] text-muted-foreground">17 feb</span>
            </div>
            <h3 className="text-base font-bold text-foreground font-mono">Upperbody</h3>
            <div className="flex items-center gap-1 mt-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">~60 min</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#bad4e1] transition-colors shrink-0" />
        </div>
      </Link>
    </section>
  )
}
