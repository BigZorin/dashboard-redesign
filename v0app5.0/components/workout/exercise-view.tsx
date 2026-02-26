"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Target, Timer, Info, Check } from "lucide-react"
import type { LoggedSet } from "@/app/workout/[sessionId]/page"

interface ExerciseViewProps {
  exercise: {
    id: string
    name: string
    muscle: string
    image: string
    sets: number
    reps: number
    restSeconds: number
    rir?: number
    tempo?: string
    notes?: string
  }
  exerciseIndex: number
  totalExercises: number
  loggedSets: LoggedSet[]
  onLogSet: (data: { reps: number; weight: string; rir: number | null }) => void
  onPrev: () => void
  onNext: () => void
}

export function ExerciseView({
  exercise,
  exerciseIndex,
  totalExercises,
  loggedSets,
  onLogSet,
  onPrev,
  onNext,
}: ExerciseViewProps) {
  const currentSetNumber = loggedSets.length + 1
  const isDone = loggedSets.length >= exercise.sets
  const [reps, setReps] = useState(exercise.reps.toString())
  const [weight, setWeight] = useState("")
  const [selectedRir, setSelectedRir] = useState<number | null>(null)
  const [showNotes, setShowNotes] = useState(false)

  const handleLog = () => {
    onLogSet({
      reps: parseInt(reps) || 0,
      weight,
      rir: selectedRir,
    })
    setWeight("")
    setSelectedRir(null)
    setReps(exercise.reps.toString())
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Exercise navigator */}
      <div className="flex items-center justify-between px-5">
        <button
          onClick={onPrev}
          disabled={exerciseIndex === 0}
          className={`h-8 w-8 rounded-full bg-secondary flex items-center justify-center transition-colors ${
            exerciseIndex === 0 ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Vorige oefening"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {/* Exercise dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalExercises }).map((_, i) => {
            const exId = ["ex1", "ex2", "ex3", "ex4", "ex5"][i]
            const exLogs = exId ? (loggedSets.length > 0 && exercise.id === exId ? loggedSets : []) : []
            const isActive = i === exerciseIndex
            const exDone = i < exerciseIndex

            return (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  isActive
                    ? "w-6 h-2 bg-[#bad4e1]"
                    : exDone
                      ? "w-2 h-2 bg-[#bad4e1]/40"
                      : "w-2 h-2 bg-secondary"
                }`}
              />
            )
          })}
        </div>

        <button
          onClick={onNext}
          disabled={exerciseIndex === totalExercises - 1}
          className={`h-8 w-8 rounded-full bg-secondary flex items-center justify-center transition-colors ${
            exerciseIndex === totalExercises - 1 ? "opacity-30 cursor-not-allowed" : "text-muted-foreground hover:text-foreground"
          }`}
          aria-label="Volgende oefening"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Exercise card */}
      <div className="mx-5">
        <div className="rounded-2xl bg-card border border-border overflow-hidden">
          {/* Image */}
          <div className="relative h-40 w-full overflow-hidden">
            <Image src={exercise.image} alt={exercise.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />

            {/* Muscle tag */}
            <div className="absolute bottom-3 left-3">
              <span className="px-2 py-1 rounded-md bg-background/70 backdrop-blur-sm text-[10px] font-semibold text-foreground font-mono uppercase tracking-wider">
                {exercise.muscle}
              </span>
            </div>

            {/* Notes button */}
            {exercise.notes && (
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="absolute top-3 right-3 h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Notities bekijken"
              >
                <Info className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Info */}
          <div className="p-4">
            <h2 className="text-base font-bold text-foreground font-mono tracking-tight">{exercise.name}</h2>

            {/* Target info row */}
            <div className="flex items-center gap-3 mt-2">
              <span className="px-2 py-1 rounded-lg bg-secondary text-[11px] font-semibold text-foreground font-mono">
                {exercise.sets} sets x {exercise.reps} reps
              </span>
              {exercise.rir !== undefined && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <Target className="h-3 w-3 text-[#bad4e1]" />
                  RIR {exercise.rir}
                </span>
              )}
              {exercise.tempo && (
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <Timer className="h-3 w-3 text-[#bad4e1]" />
                  {exercise.tempo}
                </span>
              )}
            </div>

            {/* Notes */}
            {showNotes && exercise.notes && (
              <div className="mt-3 p-3 rounded-xl bg-[#bad4e1]/8 border border-[#bad4e1]/15">
                <p className="text-xs text-[#bad4e1]">{exercise.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logged sets */}
      {loggedSets.length > 0 && (
        <div className="mx-5">
          <div className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Gelogde sets
              </span>
            </div>
            <div className="divide-y divide-border">
              {loggedSets.map((s) => (
                <div key={s.set} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-full bg-[#bad4e1]/15 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-[#bad4e1]" />
                    </div>
                    <span className="text-sm font-mono font-semibold text-foreground">Set {s.set}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-foreground">{s.reps} reps</span>
                    {s.weight && (
                      <span className="text-sm font-mono text-muted-foreground">{s.weight} kg</span>
                    )}
                    {s.rir !== null && (
                      <span className="text-[10px] font-mono text-[#bad4e1] bg-[#bad4e1]/10 px-1.5 py-0.5 rounded">
                        RIR {s.rir}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Set input */}
      {!isDone ? (
        <div className="mx-5">
          <div className="rounded-2xl bg-card border border-border p-4">
            <h3 className="text-sm font-bold text-foreground font-mono">
              Set {currentSetNumber} <span className="text-muted-foreground font-normal">van {exercise.sets}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-1.5">
                  Reps
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setReps((r) => Math.max(1, parseInt(r) - 1).toString())}
                    className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-foreground font-mono text-lg font-bold hover:bg-secondary/80 active:scale-95 transition-all shrink-0"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    className="w-full h-11 rounded-xl bg-secondary border border-border text-center text-foreground font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/50 transition-all"
                  />
                  <button
                    onClick={() => setReps((r) => (parseInt(r) + 1).toString())}
                    className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center text-foreground font-mono text-lg font-bold hover:bg-secondary/80 active:scale-95 transition-all shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-1.5">
                  Gewicht (kg)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full h-11 rounded-xl bg-secondary border border-border text-center text-foreground font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/50 transition-all placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:text-xs"
                  placeholder="bv. 80"
                />
              </div>
            </div>

            {/* RIR */}
            <div className="mt-4">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-2">
                Reps in Reserve (RIR)
              </label>
              <div className="grid grid-cols-6 gap-1.5">
                {[0, 1, 2, 3, 4, 5].map((rir) => (
                  <button
                    key={rir}
                    onClick={() => setSelectedRir(selectedRir === rir ? null : rir)}
                    className={`h-10 rounded-xl font-mono font-bold text-sm transition-all ${
                      selectedRir === rir
                        ? "bg-[#bad4e1] text-[#1e1839] shadow-lg shadow-[#bad4e1]/20"
                        : "bg-secondary text-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {rir}
                  </button>
                ))}
              </div>
            </div>

            {/* Log button */}
            <button
              onClick={handleLog}
              className="w-full mt-4 h-12 rounded-xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono text-sm flex items-center justify-center gap-2 hover:bg-[#bad4e1]/90 active:scale-[0.98] transition-all shadow-lg shadow-[#bad4e1]/15"
            >
              <Check className="h-4 w-4" />
              Set loggen
            </button>
          </div>
        </div>
      ) : (
        <div className="mx-5">
          <div className="rounded-2xl bg-[#bad4e1]/8 border border-[#bad4e1]/20 p-5 flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-[#bad4e1]/15 flex items-center justify-center">
              <Check className="h-5 w-5 text-[#bad4e1]" />
            </div>
            <p className="text-sm font-bold text-foreground font-mono">Oefening voltooid</p>
            <p className="text-xs text-muted-foreground text-center">
              {exerciseIndex < totalExercises - 1
                ? "Ga naar de volgende oefening"
                : "Alle oefeningen zijn voltooid!"
              }
            </p>
            {exerciseIndex < totalExercises - 1 && (
              <button
                onClick={onNext}
                className="mt-2 px-6 py-2 rounded-xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono text-sm hover:bg-[#bad4e1]/90 active:scale-[0.98] transition-all"
              >
                Volgende oefening
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
