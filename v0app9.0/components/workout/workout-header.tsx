"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X } from "lucide-react"

interface WorkoutHeaderProps {
  sessionName: string
  completedSets: number
  totalSets: number
}

export function WorkoutHeader({ sessionName, completedSets, totalSets }: WorkoutHeaderProps) {
  const [elapsed, setElapsed] = useState(0)
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  useEffect(() => {
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top,12px)]">
      <div className="flex items-center justify-between px-5 py-3">
        <Link
          href="/training"
          className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Workout sluiten"
        >
          <X className="h-4 w-4" />
        </Link>

        <div className="text-center">
          <h1 className="text-sm font-bold text-foreground font-mono">{sessionName}</h1>
          <div className="flex items-center gap-2 justify-center mt-0.5">
            <span className="text-[10px] text-[#bad4e1] font-mono font-semibold">{formatTime(elapsed)}</span>
            <span className="text-[10px] text-muted-foreground font-mono">{completedSets}/{totalSets} sets</span>
          </div>
        </div>

        <div className="w-9" />
      </div>

      {/* Progress bar */}
      <div className="h-0.5 bg-secondary">
        <div
          className="h-full bg-[#bad4e1] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
