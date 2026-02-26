"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  Clock,
  Sun,
  Moon,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
} from "lucide-react"
import { BottomNav } from "@/components/shared/bottom-nav"

/* ── types ── */
interface Supplement {
  id: string
  name: string
  dosage: string
  time: string
  block: "ochtend" | "training" | "avond"
  note?: string
}

interface DayLog {
  [suppId: string]: boolean
}

/* ── seed data ── */
const defaultSupplements: Supplement[] = [
  { id: "s1", name: "Creatine Monohydraat", dosage: "5 g", time: "08:00", block: "ochtend", note: "Met ontbijt, voldoende water" },
  { id: "s2", name: "Vitamine D3", dosage: "2000 IU", time: "08:00", block: "ochtend", note: "Bij vetbevattende maaltijd" },
  { id: "s3", name: "Omega-3 Visolie", dosage: "2 g EPA/DHA", time: "08:30", block: "ochtend", note: "Bij ontbijt of lunch" },
  { id: "s4", name: "Whey Proteïne", dosage: "30 g", time: "16:00", block: "training", note: "Na de training" },
  { id: "s5", name: "Cafeïne", dosage: "200 mg", time: "15:30", block: "training", note: "30 min voor training" },
  { id: "s6", name: "Magnesium", dosage: "400 mg", time: "22:00", block: "avond", note: "30 min voor slapen" },
]

const blockConfig = {
  ochtend: { label: "Ochtend", icon: Sun, color: "text-chart-3", bgColor: "bg-chart-3/10", borderColor: "border-chart-3/20" },
  training: { label: "Training", icon: Dumbbell, color: "text-[#bad4e1]", bgColor: "bg-[#bad4e1]/10", borderColor: "border-[#bad4e1]/20" },
  avond: { label: "Avond", icon: Moon, color: "text-chart-2", bgColor: "bg-chart-2/10", borderColor: "border-chart-2/20" },
}

/* ── date helpers ── */
function formatDate(date: Date) {
  const days = ["Zondag", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag"]
  const months = ["jan", "feb", "mrt", "apr", "mei", "jun", "jul", "aug", "sep", "okt", "nov", "dec"]
  return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`
}

function getDayLabel(offset: number) {
  if (offset === 0) return "Vandaag"
  if (offset === -1) return "Gisteren"
  if (offset === 1) return "Morgen"
  return null
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export default function SupplementenPage() {
  const [dayOffset, setDayOffset] = useState(0)
  const [supplements, setSupplements] = useState<Supplement[]>(defaultSupplements)
  const [logs, setLogs] = useState<Record<string, DayLog>>({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Add form state
  const [newName, setNewName] = useState("")
  const [newDosage, setNewDosage] = useState("")
  const [newTime, setNewTime] = useState("08:00")
  const [newBlock, setNewBlock] = useState<"ochtend" | "training" | "avond">("ochtend")
  const [newNote, setNewNote] = useState("")

  const currentDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + dayOffset)
    return d
  }, [dayOffset])

  const currentKey = dateKey(currentDate)
  const dayLog = logs[currentKey] || {}

  const toggleSupp = (id: string) => {
    setLogs((prev) => ({
      ...prev,
      [currentKey]: {
        ...(prev[currentKey] || {}),
        [id]: !(prev[currentKey]?.[id]),
      },
    }))
  }

  const addSupplement = () => {
    if (!newName.trim() || !newDosage.trim()) return
    const newSupp: Supplement = {
      id: `s${Date.now()}`,
      name: newName.trim(),
      dosage: newDosage.trim(),
      time: newTime,
      block: newBlock,
      note: newNote.trim() || undefined,
    }
    setSupplements((prev) => [...prev, newSupp])
    setNewName("")
    setNewDosage("")
    setNewTime("08:00")
    setNewBlock("ochtend")
    setNewNote("")
    setShowAddForm(false)
  }

  const removeSupplement = (id: string) => {
    setSupplements((prev) => prev.filter((s) => s.id !== id))
    setDeletingId(null)
  }

  const grouped = {
    ochtend: supplements.filter((s) => s.block === "ochtend").sort((a, b) => a.time.localeCompare(b.time)),
    training: supplements.filter((s) => s.block === "training").sort((a, b) => a.time.localeCompare(b.time)),
    avond: supplements.filter((s) => s.block === "avond").sort((a, b) => a.time.localeCompare(b.time)),
  }

  const checkedCount = supplements.filter((s) => dayLog[s.id]).length
  const totalCount = supplements.length
  const progress = totalCount > 0 ? (checkedCount / totalCount) * 100 : 0

  const dayLabel = getDayLabel(dayOffset)

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative pb-32">
      {/* Header */}
      <div className="px-5 pt-14 pb-2">
        <div className="flex items-center justify-between mb-2">
          <Link
            href="/voeding"
            className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <button
            onClick={() => setShowAddForm(true)}
            className="h-10 w-10 rounded-xl bg-[#bad4e1]/15 flex items-center justify-center text-[#bad4e1] hover:bg-[#bad4e1]/25 transition-colors active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <h1 className="text-lg font-bold text-foreground font-mono text-center mb-4">
          Supplementen
        </h1>

        {/* Date navigator */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setDayOffset((d) => d - 1)}
            className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-foreground transition-all active:scale-95"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          <div className="text-center">
            {dayLabel && (
              <p className="text-sm font-bold text-foreground font-mono">{dayLabel}</p>
            )}
            <p className={`${dayLabel ? "text-[11px] text-muted-foreground" : "text-sm font-bold text-foreground font-mono"}`}>
              {formatDate(currentDate)}
            </p>
          </div>
          <button
            onClick={() => setDayOffset((d) => d + 1)}
            disabled={dayOffset >= 1}
            className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-foreground disabled:opacity-30 transition-all active:scale-95"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Progress card */}
        <div className="rounded-2xl bg-card border border-border p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Voortgang
              </span>
            </div>
            <span className="text-xs text-[#bad4e1] font-mono font-semibold">
              {checkedCount}/{totalCount}
            </span>
          </div>
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: "linear-gradient(90deg, #bad4e1 0%, oklch(0.7 0.17 155) 100%)",
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-1.5">
            {checkedCount === totalCount && totalCount > 0
              ? "Alles ingenomen"
              : `Nog ${totalCount - checkedCount} te gaan`}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {supplements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-5">
          <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
            <Clock className="h-7 w-7 text-muted-foreground" />
          </div>
          <p className="text-base font-bold text-foreground font-mono mb-1">Geen supplementen</p>
          <p className="text-sm text-muted-foreground text-center max-w-[260px]">
            Voeg supplementen toe met de + knop om je dagelijkse inname bij te houden.
          </p>
        </div>
      )}

      {/* Time blocks */}
      <div className="px-5 flex flex-col gap-5">
        {(["ochtend", "training", "avond"] as const).map((block, blockIdx) => {
          const items = grouped[block]
          if (items.length === 0) return null
          const config = blockConfig[block]
          const BlockIcon = config.icon
          const blockChecked = items.filter((s) => dayLog[s.id]).length

          return (
            <div
              key={block}
              style={{
                animationDelay: `${blockIdx * 100}ms`,
                animation: "fadeSlideUp 0.4s ease-out forwards",
                opacity: 0,
              }}
            >
              {/* Block header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <div className={`h-7 w-7 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                    <BlockIcon className={`h-3.5 w-3.5 ${config.color}`} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-foreground font-mono">
                    {config.label}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {blockChecked}/{items.length}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-2">
                {items.map((supp, idx) => {
                  const isChecked = !!dayLog[supp.id]
                  const isDeleting = deletingId === supp.id

                  return (
                    <div
                      key={supp.id}
                      className={`relative rounded-2xl border transition-all overflow-hidden ${
                        isChecked
                          ? `${config.bgColor} ${config.borderColor}`
                          : "bg-card border-border"
                      }`}
                      style={{
                        animationDelay: `${blockIdx * 100 + idx * 60}ms`,
                        animation: "fadeSlideUp 0.4s ease-out forwards",
                        opacity: 0,
                      }}
                    >
                      <div className="flex items-center gap-3 p-3.5">
                        {/* Toggle circle */}
                        <button
                          onClick={() => toggleSupp(supp.id)}
                          className={`h-10 w-10 rounded-full border-2 flex items-center justify-center shrink-0 transition-all active:scale-90 ${
                            isChecked
                              ? "bg-[#bad4e1] border-[#bad4e1]"
                              : "border-border hover:border-[#bad4e1]/50"
                          }`}
                        >
                          {isChecked && <Check className="h-4.5 w-4.5 text-[#1e1839]" />}
                        </button>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold font-mono truncate transition-colors ${
                              isChecked ? "text-foreground/50 line-through" : "text-foreground"
                            }`}>
                              {supp.name}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className={`text-[11px] font-mono font-semibold ${isChecked ? "text-[#bad4e1]/50" : "text-[#bad4e1]"}`}>
                              {supp.dosage}
                            </span>
                            <span className="text-muted-foreground/30">|</span>
                            <span className={`text-[11px] font-mono ${isChecked ? "text-muted-foreground/40" : "text-muted-foreground"}`}>
                              {supp.time}
                            </span>
                          </div>
                          {supp.note && (
                            <p className={`text-[10px] mt-1 leading-relaxed ${isChecked ? "text-muted-foreground/30" : "text-muted-foreground/70"}`}>
                              {supp.note}
                            </p>
                          )}
                        </div>

                        {/* Delete toggle */}
                        <button
                          onClick={() => setDeletingId(isDeleting ? null : supp.id)}
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-destructive transition-all active:scale-95 shrink-0"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Delete confirmation */}
                      {isDeleting && (
                        <div className="px-3.5 pb-3.5 flex gap-2">
                          <button
                            onClick={() => removeSupplement(supp.id)}
                            className="flex-1 h-9 rounded-xl bg-destructive/15 text-destructive text-xs font-semibold font-mono flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Verwijder
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="flex-1 h-9 rounded-xl bg-secondary text-muted-foreground text-xs font-semibold font-mono flex items-center justify-center active:scale-[0.98] transition-all"
                          >
                            Annuleer
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add form overlay */}
      {showAddForm && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setShowAddForm(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
            <div className="w-full max-w-md bg-card border-t border-border rounded-t-3xl p-5 pb-10">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-foreground font-mono">Supplement toevoegen</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Name */}
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-1.5">
                Naam
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="bijv. Creatine"
                className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#bad4e1]/50 mb-3"
              />

              {/* Dosage + Time */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-1.5">
                    Dosering
                  </label>
                  <input
                    type="text"
                    value={newDosage}
                    onChange={(e) => setNewDosage(e.target.value)}
                    placeholder="bijv. 5 g"
                    className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#bad4e1]/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-1.5">
                    Tijd
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-sm text-foreground font-mono focus:outline-none focus:border-[#bad4e1]/50 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Block selector */}
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-1.5">
                Moment
              </label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {(["ochtend", "training", "avond"] as const).map((b) => {
                  const cfg = blockConfig[b]
                  const Icon = cfg.icon
                  const active = newBlock === b
                  return (
                    <button
                      key={b}
                      onClick={() => setNewBlock(b)}
                      className={`h-10 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                        active
                          ? "bg-[#bad4e1]/15 text-[#bad4e1] border border-[#bad4e1]/30"
                          : "bg-secondary text-muted-foreground border border-border"
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {cfg.label}
                    </button>
                  )
                })}
              </div>

              {/* Note */}
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-1.5">
                Notitie (optioneel)
              </label>
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="bijv. Met ontbijt innemen"
                className="w-full h-11 rounded-xl bg-secondary border border-border px-3 text-sm text-foreground font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:border-[#bad4e1]/50 mb-5"
              />

              {/* Submit */}
              <button
                onClick={addSupplement}
                disabled={!newName.trim() || !newDosage.trim()}
                className="w-full h-12 rounded-2xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
              >
                <Plus className="h-4.5 w-4.5" />
                Toevoegen
              </button>
            </div>
          </div>
        </>
      )}

      <BottomNav />

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
