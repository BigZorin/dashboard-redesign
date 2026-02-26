"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Check, Droplets, Moon, Footprints, Apple, Pill, Flame } from "lucide-react"
import { BottomNav } from "@/components/shared/bottom-nav"

interface Habit {
  id: string
  icon: typeof Droplets
  iconColor: string
  iconBg: string
  title: string
  target: string
  completedToday: boolean
  streak: number
  weekHistory: boolean[]
}

const defaultHabits: Habit[] = [
  {
    id: "water",
    icon: Droplets,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-400/15",
    title: "Water drinken",
    target: "2.5 liter",
    completedToday: true,
    streak: 12,
    weekHistory: [true, true, true, false, true, true, true],
  },
  {
    id: "sleep",
    icon: Moon,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-400/15",
    title: "8 uur slaap",
    target: "8 uur",
    completedToday: true,
    streak: 5,
    weekHistory: [true, false, true, true, true, false, true],
  },
  {
    id: "steps",
    icon: Footprints,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-400/15",
    title: "10.000 stappen",
    target: "10.000",
    completedToday: false,
    streak: 3,
    weekHistory: [true, true, true, false, false, true, false],
  },
  {
    id: "fruit",
    icon: Apple,
    iconColor: "text-red-400",
    iconBg: "bg-red-400/15",
    title: "Fruit eten",
    target: "2 stuks",
    completedToday: false,
    streak: 0,
    weekHistory: [false, true, false, false, true, false, false],
  },
  {
    id: "supplements",
    icon: Pill,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-400/15",
    title: "Supplementen",
    target: "Creatine + Vitamine D",
    completedToday: true,
    streak: 28,
    weekHistory: [true, true, true, true, true, true, true],
  },
]

const weekDays = ["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"]

export default function GewoontenPage() {
  const [habits, setHabits] = useState<Habit[]>(defaultHabits)

  const completedCount = habits.filter((h) => h.completedToday).length
  const totalCount = habits.length

  function toggleHabit(id: string) {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, completedToday: !h.completedToday } : h
      )
    )
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#1a1a2e] border-b border-border">
        <div className="flex items-center justify-between px-5 pt-14 pb-4">
          <div className="flex items-center gap-4">
            <Link
              href="/meer"
              className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-lg font-bold text-foreground font-mono">Gewoontes</h1>
          </div>
          <button className="h-9 w-9 rounded-full bg-[#bad4e1]/10 flex items-center justify-center text-[#bad4e1] hover:bg-[#bad4e1]/20 transition-colors">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <main className="pb-40">
        {/* Summary card */}
        <div className="px-4 pt-5">
          <div className="rounded-2xl bg-card border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">Vandaag</p>
              <div className="flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-400" />
                <span className="text-sm font-bold text-foreground font-mono">{completedCount}/{totalCount}</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-[#bad4e1] transition-all duration-500"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {completedCount === totalCount
                ? "Alle gewoontes voltooid vandaag!"
                : `Nog ${totalCount - completedCount} te gaan`}
            </p>
          </div>
        </div>

        {/* Habits list */}
        <div className="px-4 pt-4 flex flex-col gap-3">
          {habits.map((habit) => (
            <div key={habit.id} className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex items-center gap-4 px-4 py-4">
                {/* Toggle */}
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    habit.completedToday
                      ? "bg-[#bad4e1] text-background"
                      : `${habit.iconBg}`
                  }`}
                >
                  {habit.completedToday ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <habit.icon className={`h-5 w-5 ${habit.iconColor}`} />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold transition-colors ${habit.completedToday ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {habit.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{habit.target}</p>
                </div>

                {/* Streak */}
                {habit.streak > 0 && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-400/10 shrink-0">
                    <Flame className="h-3 w-3 text-amber-400" />
                    <span className="text-[10px] font-bold text-amber-400 font-mono">{habit.streak}</span>
                  </div>
                )}
              </div>

              {/* Week dots */}
              <div className="flex items-center gap-1 px-4 pb-3">
                {weekDays.map((day, i) => (
                  <div key={day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        habit.weekHistory[i] ? "bg-[#bad4e1]" : "bg-muted-foreground/20"
                      }`}
                    />
                    <span className="text-[8px] text-muted-foreground">{day}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
