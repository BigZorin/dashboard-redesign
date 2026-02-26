"use client"

import { useState, useEffect, useCallback } from "react"
import { SkipForward, Plus, Minus } from "lucide-react"

interface RestTimerProps {
  seconds: number
  onDone: () => void
  onSkip: () => void
}

export function RestTimer({ seconds, onDone, onSkip }: RestTimerProps) {
  const [remaining, setRemaining] = useState(seconds)
  const [total, setTotal] = useState(seconds)

  useEffect(() => {
    if (remaining <= 0) {
      onDone()
      return
    }
    const timer = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(timer)
  }, [remaining, onDone])

  const progress = total > 0 ? ((total - remaining) / total) * 100 : 0
  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60

  const addTime = useCallback(() => {
    setRemaining((r) => r + 15)
    setTotal((t) => t + 15)
  }, [])

  const removeTime = useCallback(() => {
    setRemaining((r) => Math.max(0, r - 15))
  }, [])

  // Circumference for SVG circle
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center max-w-md mx-auto">
      {/* Circular timer */}
      <div className="relative">
        <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="oklch(0.22 0.008 270)"
            strokeWidth="6"
          />
          <circle
            cx="90"
            cy="90"
            r={radius}
            fill="none"
            stroke="#bad4e1"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold font-mono text-foreground tracking-tight">
            {mins}:{secs.toString().padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-1">
            Rust
          </span>
        </div>
      </div>

      {/* Time controls */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={removeTime}
          className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          aria-label="15 seconden minder"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground font-mono w-12 text-center">15 sec</span>
        <button
          onClick={addTime}
          className="h-11 w-11 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors active:scale-95"
          aria-label="15 seconden meer"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="mt-8 flex items-center gap-2 px-6 py-3 rounded-xl bg-secondary text-foreground font-mono font-semibold text-sm hover:bg-secondary/80 active:scale-[0.98] transition-all"
      >
        <SkipForward className="h-4 w-4" />
        Overslaan
      </button>
    </div>
  )
}
