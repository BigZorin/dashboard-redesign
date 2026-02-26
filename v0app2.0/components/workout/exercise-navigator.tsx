"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface ExerciseNavigatorProps {
  current: number
  total: number
  onPrev: () => void
  onNext: () => void
}

export function ExerciseNavigator({ current, total, onPrev, onNext }: ExerciseNavigatorProps) {
  const isFirst = current === 1
  const isLast = current === total

  return (
    <div className="flex items-center justify-between px-5 py-3">
      <button
        onClick={onPrev}
        disabled={isFirst}
        className={`h-9 w-9 rounded-full bg-secondary flex items-center justify-center transition-colors ${
          isFirst ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
        Oefening {current} / {total}
      </span>
      <button
        onClick={onNext}
        disabled={isLast}
        className={`h-9 w-9 rounded-full bg-secondary flex items-center justify-center transition-colors ${
          isLast ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
