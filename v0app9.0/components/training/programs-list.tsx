"use client"

import Link from "next/link"
import { ChevronRight, Calendar, Dumbbell, Clock } from "lucide-react"
import Image from "next/image"

const programs = [
  {
    id: 1,
    name: "The Personal Training Program",
    description: "Op maat gemaakt trainingsschema",
    image: "/images/gym-training.jpg",
    frequency: "4x /week",
    duration: "12 weken",
    sessions: 48,
    currentWeek: 4,
    totalWeeks: 12,
    nextSession: "Upperbody - Push",
    nextSessionDate: "Ma 24 feb",
    completedSessions: 14,
    active: true,
  },
  {
    id: 2,
    name: "Strength Fundamentals",
    description: "Focus op compound lifts en kracht",
    image: "/images/strength-training.jpg",
    frequency: "3x /week",
    duration: "8 weken",
    sessions: 24,
    currentWeek: 2,
    totalWeeks: 8,
    nextSession: "Deadlift Day",
    nextSessionDate: "Di 25 feb",
    completedSessions: 5,
    active: true,
  },
  {
    id: 3,
    name: "Mobility & Recovery",
    description: "Flexibiliteit en herstel routine",
    image: "/images/mobility-training.jpg",
    frequency: "2x /week",
    duration: "Doorlopend",
    sessions: 0,
    currentWeek: 6,
    totalWeeks: 0,
    nextSession: "Full Body Stretch",
    nextSessionDate: "Wo 26 feb",
    completedSessions: 11,
    active: false,
  },
]

export function ProgramsList() {
  const activePrograms = programs.filter((p) => p.active)
  const otherPrograms = programs.filter((p) => !p.active)

  return (
    <div className="flex flex-col gap-8 mx-5">
      {/* Active programs */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-1.5 w-1.5 rounded-full bg-[#bad4e1] animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#bad4e1] font-mono">
            Actief ({activePrograms.length})
          </span>
        </div>

        <div className="flex flex-col gap-5">
          {activePrograms.map((program) => (
            <ProgramCard key={program.id} program={program} />
          ))}
        </div>
      </section>

      {/* Divider */}
      {otherPrograms.length > 0 && (
        <div className="h-px bg-border" />
      )}

      {/* Other programs */}
      {otherPrograms.length > 0 && (
        <section>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
            Overig ({otherPrograms.length})
          </span>

          <div className="flex flex-col gap-5 mt-4">
            {otherPrograms.map((program) => (
              <ProgramCard key={program.id} program={program} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ProgramCard({ program }: { program: (typeof programs)[number] }) {
  const progress = program.totalWeeks > 0
    ? Math.round((program.currentWeek / program.totalWeeks) * 100)
    : null

  return (
    <Link href={`/training/${program.id}`} className="block w-full group relative overflow-hidden rounded-2xl bg-card border border-border text-left transition-all hover:border-[#bad4e1]/30">
      {/* Image */}
      <div className="relative h-36 w-full overflow-hidden">
        <Image
          src={program.image}
          alt={program.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />

        {/* Week badge */}
        {program.totalWeeks > 0 && (
          <div className="absolute top-3 right-3">
            <div className="px-2.5 py-1 rounded-lg bg-[#bad4e1]/15 backdrop-blur-sm border border-[#bad4e1]/20">
              <span className="text-[10px] font-semibold text-[#bad4e1] uppercase tracking-wider font-mono">
                Week {program.currentWeek}/{program.totalWeeks}
              </span>
            </div>
          </div>
        )}

        {/* Active indicator */}
        {program.active && (
          <div className="absolute top-3 left-3">
            <div className="h-2 w-2 rounded-full bg-[#bad4e1] animate-pulse" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-0 -mt-3 relative">
        <h3 className="text-base font-bold text-foreground font-mono tracking-tight">
          {program.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{program.description}</p>

        {/* Progress bar */}
        {progress !== null && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] text-muted-foreground font-mono">Voortgang</span>
              <span className="text-[10px] text-[#bad4e1] font-semibold font-mono">{progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-[#bad4e1] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Next session */}
        <div className="mt-3 p-2.5 rounded-xl bg-secondary/60 border border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Volgende sessie</p>
              <p className="text-xs font-semibold text-foreground font-mono mt-0.5 truncate">{program.nextSession}</p>
            </div>
            <span className="text-[10px] text-[#bad4e1] font-mono shrink-0 ml-2">{program.nextSessionDate}</span>
          </div>
        </div>

        {/* Meta info */}
        <div className="flex items-center gap-3 mt-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono">{program.frequency}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground font-mono">{program.duration}</span>
          </div>
          {program.sessions > 0 && (
            <div className="flex items-center gap-1.5">
              <Dumbbell className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-mono">{program.completedSessions}/{program.sessions} sess.</span>
            </div>
          )}
          <div className="ml-auto">
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-[#bad4e1] transition-colors" />
          </div>
        </div>
      </div>
    </Link>
  )
}
