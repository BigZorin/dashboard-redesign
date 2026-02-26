"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Camera, Plus, Scale, Ruler, Activity } from "lucide-react"
import { BottomNav } from "@/components/shared/bottom-nav"

type Tab = "gewicht" | "metingen" | "fotos"

const weightHistory = [
  { date: "21 feb", value: 82.3 },
  { date: "14 feb", value: 82.7 },
  { date: "7 feb", value: 83.0 },
  { date: "31 jan", value: 83.4 },
  { date: "24 jan", value: 83.1 },
  { date: "17 jan", value: 84.0 },
  { date: "10 jan", value: 84.5 },
]

const measurements = [
  { label: "Borst", value: 104, unit: "cm", prev: 103, icon: Ruler },
  { label: "Taille", value: 82, unit: "cm", prev: 84, icon: Ruler },
  { label: "Heupen", value: 98, unit: "cm", prev: 99, icon: Ruler },
  { label: "Biceps (L)", value: 37, unit: "cm", prev: 36, icon: Ruler },
  { label: "Biceps (R)", value: 37.5, unit: "cm", prev: 36.5, icon: Ruler },
  { label: "Bovenbeen (L)", value: 58, unit: "cm", prev: 57, icon: Ruler },
  { label: "Bovenbeen (R)", value: 58.5, unit: "cm", prev: 57, icon: Ruler },
]

const progressPhotos = [
  { date: "1 feb 2026", label: "Week 4" },
  { date: "1 jan 2026", label: "Week 1 (Start)" },
]

function TrendIcon({ current, prev }: { current: number; prev: number }) {
  if (current > prev) return <TrendingUp className="h-3.5 w-3.5 text-[#bad4e1]" />
  if (current < prev) return <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />
}

export default function VoortgangPage() {
  const [tab, setTab] = useState<Tab>("gewicht")

  const tabs: { key: Tab; label: string; icon: typeof Scale }[] = [
    { key: "gewicht", label: "Gewicht", icon: Scale },
    { key: "metingen", label: "Metingen", icon: Ruler },
    { key: "fotos", label: "Foto's", icon: Camera },
  ]

  const latestWeight = weightHistory[0]!
  const prevWeight = weightHistory[1]!
  const weightDiff = latestWeight.value - prevWeight.value

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#1a1a2e] border-b border-border">
        <div className="flex items-center gap-4 px-5 pt-14 pb-4">
          <Link
            href="/meer"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-bold text-foreground font-mono">Voortgang</h1>
        </div>

        {/* Tab bar */}
        <div className="flex px-5 pb-3 gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                tab === t.key
                  ? "bg-[#bad4e1]/15 text-[#bad4e1]"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="pb-40">
        {/* Gewicht tab */}
        {tab === "gewicht" && (
          <div className="px-4 pt-5 flex flex-col gap-4">
            {/* Current weight card */}
            <div className="rounded-2xl bg-card border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">Huidig gewicht</p>
                  <p className="text-3xl font-bold text-foreground font-mono mt-1">
                    {latestWeight.value} <span className="text-lg text-muted-foreground">kg</span>
                  </p>
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${weightDiff < 0 ? "bg-emerald-500/10" : weightDiff > 0 ? "bg-[#bad4e1]/10" : "bg-secondary"}`}>
                  {weightDiff < 0 ? (
                    <TrendingDown className="h-3.5 w-3.5 text-emerald-400" />
                  ) : weightDiff > 0 ? (
                    <TrendingUp className="h-3.5 w-3.5 text-[#bad4e1]" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <span className={`text-xs font-semibold font-mono ${weightDiff < 0 ? "text-emerald-400" : weightDiff > 0 ? "text-[#bad4e1]" : "text-muted-foreground"}`}>
                    {weightDiff > 0 ? "+" : ""}{weightDiff.toFixed(1)} kg
                  </span>
                </div>
              </div>

              {/* Mini chart visualization */}
              <div className="flex items-end gap-1.5 h-20">
                {[...weightHistory].reverse().map((entry, i) => {
                  const min = Math.min(...weightHistory.map((w) => w.value))
                  const max = Math.max(...weightHistory.map((w) => w.value))
                  const range = max - min || 1
                  const height = ((entry.value - min) / range) * 100
                  const isLatest = i === weightHistory.length - 1
                  return (
                    <div key={entry.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className={`w-full rounded-t-md transition-all ${isLatest ? "bg-[#bad4e1]" : "bg-[#bad4e1]/25"}`}
                        style={{ height: `${Math.max(height, 15)}%` }}
                      />
                      <span className="text-[8px] text-muted-foreground">{entry.date.split(" ")[0]}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Add weight button */}
            <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#bad4e1]/10 border border-[#bad4e1]/20 text-[#bad4e1] font-semibold text-sm hover:bg-[#bad4e1]/15 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Gewicht toevoegen</span>
            </button>

            {/* History list */}
            <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
              {weightHistory.map((entry, i) => {
                const prev = weightHistory[i + 1]
                const diff = prev ? entry.value - prev.value : 0
                return (
                  <div key={entry.date} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-foreground font-mono">{entry.value} kg</p>
                      <p className="text-xs text-muted-foreground">{entry.date} 2026</p>
                    </div>
                    {prev && (
                      <div className="flex items-center gap-1">
                        <TrendIcon current={entry.value} prev={prev.value} />
                        <span className="text-xs text-muted-foreground font-mono">
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Metingen tab */}
        {tab === "metingen" && (
          <div className="px-4 pt-5 flex flex-col gap-4">
            <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#bad4e1]/10 border border-[#bad4e1]/20 text-[#bad4e1] font-semibold text-sm hover:bg-[#bad4e1]/15 transition-colors">
              <Plus className="h-4 w-4" />
              <span>Metingen toevoegen</span>
            </button>

            <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
              {measurements.map((m) => {
                const diff = m.value - m.prev
                return (
                  <div key={m.label} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-[#bad4e1]/10 flex items-center justify-center">
                        <m.icon className="h-4 w-4 text-[#bad4e1]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{m.label}</p>
                        <p className="text-xs text-muted-foreground">Vorige: {m.prev} {m.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground font-mono">{m.value} {m.unit}</p>
                      <div className="flex items-center gap-1 justify-end">
                        <TrendIcon current={m.value} prev={m.prev} />
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {diff > 0 ? "+" : ""}{diff.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Foto's tab */}
        {tab === "fotos" && (
          <div className="px-4 pt-5 flex flex-col gap-4">
            <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#bad4e1]/10 border border-[#bad4e1]/20 text-[#bad4e1] font-semibold text-sm hover:bg-[#bad4e1]/15 transition-colors">
              <Camera className="h-4 w-4" />
              <span>{"Foto's toevoegen"}</span>
            </button>

            {progressPhotos.map((photo) => (
              <div key={photo.date} className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="h-48 bg-secondary flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Voorkant / Zijkant / Achterkant</p>
                  </div>
                </div>
                <div className="px-5 py-3">
                  <p className="text-sm font-semibold text-foreground">{photo.label}</p>
                  <p className="text-xs text-muted-foreground">{photo.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
