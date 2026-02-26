"use client"

import { useState } from "react"
import { Check } from "lucide-react"

interface SetLoggerProps {
  currentSet: number
  totalSets: number
  targetReps: number
  onLog: (data: { reps: number; weight: string; rir: number | null }) => void
}

export function SetLogger({ currentSet, totalSets, targetReps, onLog }: SetLoggerProps) {
  const [reps, setReps] = useState(targetReps.toString())
  const [weight, setWeight] = useState("")
  const [selectedRir, setSelectedRir] = useState<number | null>(null)

  const handleLog = () => {
    onLog({
      reps: parseInt(reps) || 0,
      weight,
      rir: selectedRir,
    })
    // Reset for next set
    setWeight("")
    setSelectedRir(null)
  }

  return (
    <div className="mx-5 mt-5">
      <div className="rounded-2xl bg-card border border-border p-5">
        {/* Set counter */}
        <h3 className="text-base font-bold text-foreground font-mono">
          Set {currentSet} van {totalSets}
        </h3>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-2">
              Reps
            </label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              className="w-full h-12 rounded-xl bg-secondary border border-border text-center text-foreground font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/50 focus:border-[#bad4e1]/50 transition-all"
              placeholder={targetReps.toString()}
            />
          </div>
          <div>
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono block mb-2">
              Gewicht (kg)
            </label>
            <input
              type="text"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full h-12 rounded-xl bg-secondary border border-border text-center text-foreground font-mono text-lg font-bold focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/50 focus:border-[#bad4e1]/50 transition-all placeholder:text-muted-foreground/40 placeholder:font-normal placeholder:text-sm"
              placeholder="optioneel"
            />
          </div>
        </div>

        {/* RIR selector */}
        <div className="mt-5">
          <label className="text-sm font-bold text-foreground font-mono block mb-1">
            Reps in Reserve
          </label>
          <p className="text-[11px] text-muted-foreground mb-3">
            Hoeveel reps had je nog kunnen doen?
          </p>
          <div className="grid grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((rir) => (
              <button
                key={rir}
                onClick={() => setSelectedRir(selectedRir === rir ? null : rir)}
                className={`h-11 rounded-xl font-mono font-bold text-sm transition-all ${
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
          className="w-full mt-6 h-13 rounded-xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono text-sm flex items-center justify-center gap-2 hover:bg-[#bad4e1]/90 active:scale-[0.98] transition-all"
        >
          <Check className="h-4 w-4" />
          Set Loggen
        </button>
      </div>
    </div>
  )
}
