"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

interface DateNavigatorProps {
  label: string
  onPrev: () => void
  onNext: () => void
}

export function DateNavigator({ label, onPrev, onNext }: DateNavigatorProps) {
  return (
    <div className="flex items-center justify-center gap-6 px-5 py-3">
      <button
        onClick={onPrev}
        className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm font-semibold text-foreground font-mono min-w-[100px] text-center">
        {label}
      </span>
      <button
        onClick={onNext}
        className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
