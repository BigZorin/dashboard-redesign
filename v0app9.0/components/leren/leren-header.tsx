"use client"

import { useState } from "react"

const filters = ["Alles", "Bezig", "Voltooid"]

interface LerenHeaderProps {
  activeFilter: string
  onFilterChange: (filter: string) => void
  completedCount: number
  inProgressCount: number
}

export function LerenHeader({ activeFilter, onFilterChange, completedCount, inProgressCount }: LerenHeaderProps) {
  return (
    <div className="px-5 pt-14 pb-6">
      <p className="text-xs text-[#bad4e1] font-semibold uppercase tracking-wider font-mono">Kennisbank</p>
      <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight mt-1">Cursussen</h1>
      <p className="text-sm text-muted-foreground mt-1">
        {completedCount} voltooid, {inProgressCount} bezig
      </p>

      {/* Filter chips */}
      <div className="flex items-center gap-2 mt-4">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => onFilterChange(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeFilter === filter
                ? "bg-foreground text-background"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>
    </div>
  )
}
