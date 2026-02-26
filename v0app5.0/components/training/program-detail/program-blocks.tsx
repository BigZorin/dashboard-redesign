"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle2, Info, X } from "lucide-react"

interface Session {
  id: string
  name: string
  completed: boolean
}

interface Week {
  id: string
  label: string
  dateRange: string
  sessions: Session[]
}

interface Block {
  id: string
  name: string
  description: string
  weeks: Week[]
  totalTrainings: number
  active: boolean
}

const blocks: Block[] = [
  {
    id: "1",
    name: "Voorbereiding",
    description: "Focus op techniek en opbouw van basisconditie. In dit blok leg je de fundamenten voor het zwaardere werk dat komt.",
    weeks: [
      {
        id: "w1",
        label: "Week 1",
        dateRange: "17 feb - 23 feb",
        sessions: [
          { id: "s1", name: "Upperbody", completed: true },
        ],
      },
      {
        id: "w2",
        label: "Week 2",
        dateRange: "24 feb - 2 mrt",
        sessions: [
          { id: "s2", name: "Lowerbody", completed: true },
        ],
      },
      {
        id: "w3",
        label: "Week 3",
        dateRange: "3 mrt - 9 mrt",
        sessions: [
          { id: "s3", name: "Upperbody", completed: false },
        ],
      },
      {
        id: "w4",
        label: "Week 4",
        dateRange: "10 mrt - 16 mrt",
        sessions: [
          { id: "s4", name: "Lowerbody", completed: false },
        ],
      },
    ],
    totalTrainings: 1,
    active: true,
  },
  {
    id: "2",
    name: "Zware Training",
    description: "Intensieve fase met focus op kracht en hypertrofie. Zwaardere gewichten en meer volume.",
    weeks: [
      {
        id: "w5",
        label: "Week 5",
        dateRange: "17 mrt - 23 mrt",
        sessions: [
          { id: "s5", name: "Push Day", completed: false },
        ],
      },
      {
        id: "w6",
        label: "Week 6",
        dateRange: "24 mrt - 30 mrt",
        sessions: [
          { id: "s6", name: "Pull Day", completed: false },
        ],
      },
      {
        id: "w7",
        label: "Week 7",
        dateRange: "31 mrt - 6 apr",
        sessions: [
          { id: "s7", name: "Legs Day", completed: false },
        ],
      },
      {
        id: "w8",
        label: "Week 8",
        dateRange: "7 apr - 13 apr",
        sessions: [
          { id: "s8", name: "Full Body", completed: false },
        ],
      },
    ],
    totalTrainings: 1,
    active: false,
  },
]

export function ProgramBlocks() {
  const [openBlock, setOpenBlock] = useState<string | null>(blocks[0]?.id ?? null)
  const [openWeeks, setOpenWeeks] = useState<Record<string, boolean>>({ w1: true })
  const [showBlockInfo, setShowBlockInfo] = useState<string | null>(null)

  const toggleBlock = (id: string) => {
    setOpenBlock(openBlock === id ? null : id)
  }

  const toggleWeek = (id: string) => {
    setOpenWeeks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const activeInfoBlock = showBlockInfo ? blocks.find((b) => b.id === showBlockInfo) : null

  return (
    <>
      <div className="flex flex-col">
        {blocks.map((block, blockIndex) => {
          const isOpen = openBlock === block.id
          const completedWeeks = block.weeks.filter((w) =>
            w.sessions.every((s) => s.completed)
          ).length

          return (
            <div key={block.id}>
              {/* Block header */}
              <div className="flex items-center bg-card border-b border-border">
                <button
                  onClick={() => toggleBlock(block.id)}
                  className="flex-1 flex items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-card/80"
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                      block.active ? "bg-[#bad4e1]" : "bg-muted-foreground/30"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground font-mono">{block.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {block.weeks.length} weken - {block.totalTrainings} trainingen
                    </p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <button
                  onClick={() => setShowBlockInfo(block.id)}
                  className="pr-4 pl-1 py-4 text-muted-foreground hover:text-[#bad4e1] transition-colors"
                >
                  <Info className="h-4 w-4" />
                </button>
              </div>

              {/* Block content - weeks */}
              {isOpen && (
                <div className="bg-background">
                  <div className="flex flex-col gap-2 px-5 py-4">
                    {block.weeks.map((week) => {
                      const isWeekOpen = openWeeks[week.id] ?? false
                      const completedSessions = week.sessions.filter((s) => s.completed).length
                      const allCompleted = completedSessions === week.sessions.length && week.sessions.length > 0

                      return (
                        <div key={week.id} className="rounded-xl overflow-hidden border border-border">
                          {/* Week header */}
                          <button
                            onClick={() => toggleWeek(week.id)}
                            className="w-full flex items-center gap-3 px-4 py-3.5 bg-card text-left transition-colors hover:bg-card/80"
                          >
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-bold text-foreground font-mono">{week.label}</span>
                              <p className="text-[11px] text-muted-foreground mt-0.5 font-mono">{week.dateRange}</p>
                            </div>

                            {/* Completion badge */}
                            {week.sessions.length > 0 && (
                              <span
                                className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${
                                  allCompleted
                                    ? "text-[#bad4e1] bg-[#bad4e1]/15"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {completedSessions}/{week.sessions.length}
                              </span>
                            )}

                            <ChevronDown
                              className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                                isWeekOpen ? "rotate-180" : ""
                              }`}
                            />
                          </button>

                          {/* Sessions inside week */}
                          {isWeekOpen && week.sessions.length > 0 && (
                            <div className="border-t border-border">
                              {week.sessions.map((session) => (
                                <button
                                  key={session.id}
                                  className="w-full flex items-center gap-3 px-4 py-3 bg-secondary/40 text-left hover:bg-secondary/60 transition-colors"
                                >
                                  <div
                                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                      session.completed
                                        ? "bg-[#bad4e1]/15"
                                        : "bg-secondary"
                                    }`}
                                  >
                                    {session.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-[#bad4e1]" />
                                    ) : (
                                      <div className="h-3 w-3 rounded-full border-2 border-muted-foreground/40" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-foreground font-mono">{session.name}</span>
                                    {session.completed && (
                                      <p className="text-[11px] text-[#bad4e1] mt-0.5">Voltooid</p>
                                    )}
                                  </div>

                                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Separator between blocks */}
              {blockIndex < blocks.length - 1 && !isOpen && (
                <div className="h-px bg-border" />
              )}
            </div>
          )
        })}
      </div>

      {/* Block info bottom sheet */}
      {activeInfoBlock && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowBlockInfo(null)}
          />
          <div className="relative w-full max-w-lg animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-center pt-3 pb-1 bg-card rounded-t-3xl">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>
            <div className="bg-card px-6 pb-8 pt-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1] font-mono">Blok info</p>
                  <h2 className="text-lg font-bold text-foreground font-mono mt-1">{activeInfoBlock.name}</h2>
                </div>
                <button
                  onClick={() => setShowBlockInfo(null)}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{activeInfoBlock.description}</p>

              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 rounded-xl bg-secondary p-3 text-center">
                  <span className="text-lg font-bold text-foreground font-mono">{activeInfoBlock.weeks.length}</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weken</p>
                </div>
                <div className="flex-1 rounded-xl bg-secondary p-3 text-center">
                  <span className="text-lg font-bold text-foreground font-mono">{activeInfoBlock.totalTrainings}</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trainingen</p>
                </div>
                <div className="flex-1 rounded-xl bg-secondary p-3 text-center">
                  <span className="text-lg font-bold text-foreground font-mono">
                    {activeInfoBlock.weeks.filter((w) => w.sessions.every((s) => s.completed)).length}/{activeInfoBlock.weeks.length}
                  </span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Voltooid</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
