"use client"

import { ChevronRight, Dumbbell, Clock, Zap } from "lucide-react"

const sessions = [
  {
    day: "MA",
    date: "24 FEB",
    name: "Upperbody",
    type: "Push",
    duration: "60 min",
    exercises: 8,
    isNext: true,
  },
  {
    day: "DI",
    date: "25 FEB",
    name: "Lowerbody",
    type: "Quads",
    duration: "55 min",
    exercises: 7,
    isNext: false,
  },
  {
    day: "DO",
    date: "27 FEB",
    name: "Upperbody",
    type: "Pull",
    duration: "60 min",
    exercises: 8,
    isNext: false,
  },
  {
    day: "VR",
    date: "28 FEB",
    name: "Lowerbody",
    type: "Hams & Glutes",
    duration: "50 min",
    exercises: 6,
    isNext: false,
  },
]

export function UpcomingSessions() {
  return (
    <section className="mx-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
          Deze week
        </h2>
        <span className="text-xs text-muted-foreground font-mono">4 sessies</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {sessions.map((session, i) => (
          <button
            key={i}
            className={`w-full group relative overflow-hidden rounded-2xl border text-left transition-all ${
              session.isNext
                ? "bg-[#bad4e1]/8 border-[#bad4e1]/25 hover:border-[#bad4e1]/40"
                : "bg-card border-border hover:border-[#bad4e1]/20"
            }`}
          >
            {session.isNext && (
              <div className="absolute inset-0 bg-gradient-to-r from-[#bad4e1]/5 to-transparent" />
            )}
            <div className="relative flex items-center gap-4 p-4">
              <div className={`flex flex-col items-center justify-center w-12 shrink-0 ${
                session.isNext ? "" : ""
              }`}>
                <span className={`text-[10px] font-semibold uppercase tracking-wider font-mono ${
                  session.isNext ? "text-[#bad4e1]" : "text-muted-foreground"
                }`}>
                  {session.day}
                </span>
                <span className={`text-lg font-bold font-mono ${
                  session.isNext ? "text-foreground" : "text-foreground"
                }`}>
                  {session.date.split(" ")[0]}
                </span>
              </div>

              <div className="h-10 w-px bg-border" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground font-mono truncate">{session.name}</h3>
                  {session.isNext && (
                    <span className="px-1.5 py-0.5 rounded-md bg-[#bad4e1]/15 text-[10px] font-semibold text-[#bad4e1] uppercase tracking-wider font-mono">
                      Volgende
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">{session.type}</span>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">{session.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">{session.exercises} oef.</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#bad4e1] transition-colors shrink-0" />
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}
