"use client"

import Link from "next/link"
import { Trophy, Clock, Dumbbell, TrendingUp, Check } from "lucide-react"
import type { LoggedSet } from "@/app/workout/[sessionId]/page"

interface WorkoutCompleteProps {
  exercises: {
    id: string
    name: string
    sets: number
    reps: number
  }[]
  loggedSets: Record<string, LoggedSet[]>
  totalSets: number
}

export function WorkoutComplete({ exercises, loggedSets, totalSets }: WorkoutCompleteProps) {
  const totalReps = Object.values(loggedSets)
    .flat()
    .reduce((acc, s) => acc + s.reps, 0)
  const totalVolume = Object.values(loggedSets)
    .flat()
    .reduce((acc, s) => acc + s.reps * (parseFloat(s.weight) || 0), 0)

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto flex flex-col items-center justify-center px-5 py-12">
      {/* Trophy */}
      <div className="relative mb-6">
        <div
          className="absolute inset-0 rounded-full blur-2xl opacity-30"
          style={{
            background: "radial-gradient(circle, #bad4e1 0%, transparent 70%)",
            transform: "scale(4)",
          }}
        />
        <div className="relative h-20 w-20 rounded-full bg-[#bad4e1]/15 flex items-center justify-center">
          <Trophy className="h-10 w-10 text-[#bad4e1]" />
        </div>
      </div>

      <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight text-center">
        Training voltooid!
      </h1>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        Geweldig gedaan, je hebt alle oefeningen afgerond.
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mt-8 w-full">
        <div className="rounded-2xl bg-card border border-border p-4 flex flex-col items-center gap-1">
          <Dumbbell className="h-4 w-4 text-[#bad4e1] mb-1" />
          <span className="text-xl font-bold font-mono text-foreground">{totalSets}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Sets</span>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 flex flex-col items-center gap-1">
          <TrendingUp className="h-4 w-4 text-[#bad4e1] mb-1" />
          <span className="text-xl font-bold font-mono text-foreground">{totalReps}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">Reps</span>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 flex flex-col items-center gap-1">
          <Clock className="h-4 w-4 text-[#bad4e1] mb-1" />
          <span className="text-xl font-bold font-mono text-foreground">{Math.round(totalVolume)}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono">kg Vol.</span>
        </div>
      </div>

      {/* Exercise breakdown */}
      <div className="w-full mt-6 rounded-2xl bg-card border border-border overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Overzicht
          </span>
        </div>
        <div className="divide-y divide-border">
          {exercises.map((ex) => {
            const logs = loggedSets[ex.id] || []
            return (
              <div key={ex.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-[#bad4e1]/15 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5 text-[#bad4e1]" />
                  </div>
                  <span className="text-sm font-mono font-semibold text-foreground">{ex.name}</span>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{logs.length}/{ex.sets} sets</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Back button */}
      <Link
        href="/"
        className="w-full mt-8 h-13 rounded-xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono text-sm flex items-center justify-center hover:bg-[#bad4e1]/90 active:scale-[0.98] transition-all shadow-lg shadow-[#bad4e1]/15"
      >
        Terug naar Home
      </Link>
    </div>
  )
}
