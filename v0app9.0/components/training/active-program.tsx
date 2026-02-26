"use client"

import { ChevronRight, Flame, Calendar, Dumbbell } from "lucide-react"
import Image from "next/image"

export function ActiveProgram() {
  return (
    <section className="mx-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-[#bad4e1] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#bad4e1] font-mono">Actief</span>
        </div>
      </div>

      <button className="w-full group relative overflow-hidden rounded-2xl bg-card border border-border text-left transition-all hover:border-[#bad4e1]/30">
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src="/images/gym-training.jpg"
            alt="Personal training in de sportschool"
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
          <div className="absolute top-3 right-3">
            <div className="px-2.5 py-1 rounded-lg bg-[#bad4e1]/15 backdrop-blur-sm border border-[#bad4e1]/20">
              <span className="text-[10px] font-semibold text-[#bad4e1] uppercase tracking-wider font-mono">Week 4/12</span>
            </div>
          </div>
        </div>

        <div className="p-5 pt-0 -mt-4 relative">
          <h3 className="text-lg font-bold text-foreground font-mono tracking-tight">The Personal Training Program</h3>
          <p className="text-xs text-muted-foreground mt-1">Op maat gemaakt trainingsschema</p>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-[#bad4e1]/10 flex items-center justify-center">
                <Calendar className="h-3.5 w-3.5 text-[#bad4e1]" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">4x /week</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-[#bad4e1]/10 flex items-center justify-center">
                <Flame className="h-3.5 w-3.5 text-[#bad4e1]" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">12 wkn</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-7 w-7 rounded-lg bg-[#bad4e1]/10 flex items-center justify-center">
                <Dumbbell className="h-3.5 w-3.5 text-[#bad4e1]" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">48 sess.</span>
            </div>
            <div className="ml-auto">
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#bad4e1] transition-colors" />
            </div>
          </div>
        </div>
      </button>
    </section>
  )
}
