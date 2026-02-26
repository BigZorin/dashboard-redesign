"use client"

import Link from "next/link"
import { X, CheckCheck } from "lucide-react"

interface WorkoutHeaderProps {
  sessionName: string
  completedSets: number
  totalSets: number
}

export function WorkoutHeader({ sessionName, completedSets, totalSets }: WorkoutHeaderProps) {
  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-[#1e1839] pt-[env(safe-area-inset-top,12px)]">
      <div className="flex items-center justify-between px-5 py-3">
        <Link
          href="/training"
          className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </Link>
        <div className="text-center">
          <h1 className="text-sm font-bold text-foreground font-mono">{sessionName}</h1>
          <p className="text-[10px] text-muted-foreground font-mono">{completedSets}/{totalSets} sets</p>
        </div>
        <button className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-[#bad4e1] transition-colors">
          <CheckCheck className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
