"use client"

import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Clock, Dumbbell, User, ChevronRight, Flame } from "lucide-react"

const exercises = [
  {
    id: "ex1",
    name: "Bench Press",
    muscle: "Borst",
    image: "/images/bench-press.jpg",
    sets: 4,
    reps: 10,
    restSeconds: 90,
    rir: 2,
    tempo: "2-1-2-0",
  },
  {
    id: "ex2",
    name: "Incline Dumbbell Press",
    muscle: "Borst / Schouders",
    image: "/images/shoulder-press.jpg",
    sets: 3,
    reps: 12,
    restSeconds: 75,
    rir: 3,
    tempo: "3-1-2-0",
  },
  {
    id: "ex3",
    name: "Cable Fly",
    muscle: "Borst",
    image: "/images/bench-press.jpg",
    sets: 3,
    reps: 15,
    restSeconds: 60,
    rir: 1,
    tempo: "2-1-2-1",
  },
  {
    id: "ex4",
    name: "Lateral Raise",
    muscle: "Schouders",
    image: "/images/shoulder-press.jpg",
    sets: 4,
    reps: 15,
    restSeconds: 45,
    rir: 1,
    tempo: "2-1-2-0",
  },
  {
    id: "ex5",
    name: "Tricep Pushdown",
    muscle: "Triceps",
    image: "/images/bench-press.jpg",
    sets: 3,
    reps: 12,
    restSeconds: 60,
    rir: 2,
    tempo: "2-0-2-1",
  },
]

const totalSets = exercises.reduce((a, e) => a + e.sets, 0)
const totalReps = exercises.reduce((a, e) => a + e.sets * e.reps, 0)

export default function WorkoutOverview() {
  const router = useRouter()
  const params = useParams()

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Header */}
      <div className="relative px-5 pt-14 pb-6">
        <button
          onClick={() => router.back()}
          className="absolute top-14 left-5 h-10 w-10 rounded-xl bg-secondary flex items-center justify-center"
        >
          <ArrowLeft className="h-4.5 w-4.5 text-foreground" />
        </button>

        <div className="text-center pt-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#bad4e1] mb-1">
            Push dag
          </p>
          <h1 className="text-2xl font-bold font-mono tracking-tight text-foreground">
            Upperbody
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Zaterdag 21 februari
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-5 grid grid-cols-3 gap-2.5 mb-6">
        {[
          { icon: Clock, label: "Duur", value: "~60 min" },
          { icon: Dumbbell, label: "Oefeningen", value: String(exercises.length) },
          { icon: Flame, label: "Sets", value: String(totalSets) },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl bg-card border border-border p-3.5 flex flex-col items-center gap-2"
          >
            <stat.icon className="h-4.5 w-4.5 text-[#bad4e1]" />
            <div className="text-center">
              <p className="text-base font-bold font-mono text-foreground">{stat.value}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mt-0.5">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Coach note */}
      <div className="mx-5 mb-6 rounded-xl bg-card border border-border p-4">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Notitie van coach</p>
            <p className="text-[10px] text-muted-foreground">Zorin Wijnands</p>
          </div>
        </div>
        <p className="text-sm text-secondary-foreground leading-relaxed">
          Focus vandaag op controlled tempo en goede form. Warm goed op met 2 lichte sets voor de Bench Press.
        </p>
      </div>

      {/* Exercises list */}
      <div className="mx-5 mb-32">
        <h2 className="text-sm font-semibold font-mono uppercase tracking-wider text-foreground mb-3">
          Oefeningen
        </h2>

        <div className="flex flex-col gap-2.5">
          {exercises.map((ex, i) => (
            <div
              key={ex.id}
              className="rounded-xl bg-card border border-border p-4 flex items-center gap-3.5"
            >
              {/* Number */}
              <div className="h-8 w-8 shrink-0 rounded-lg bg-secondary flex items-center justify-center">
                <span className="text-sm font-bold font-mono text-muted-foreground">{i + 1}</span>
              </div>

              {/* Image */}
              <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden">
                <Image
                  src={ex.image}
                  alt={ex.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{ex.name}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {ex.sets}x{ex.reps}
                  </span>
                  <span className="text-[10px] text-muted-foreground/40">|</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    RIR {ex.rir}
                  </span>
                  <span className="text-[10px] text-muted-foreground/40">|</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {ex.restSeconds}s rust
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#bad4e1]/10 text-[#bad4e1] font-mono">
                    {ex.muscle}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground font-mono">
                    Tempo {ex.tempo}
                  </span>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* Start button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-5 pb-8 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={() => router.push(`/workout/${params.sessionId}`)}
          className="w-full h-14 rounded-xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono text-base flex items-center justify-center gap-2.5 active:scale-[0.98] transition-transform shadow-lg shadow-[#bad4e1]/20"
        >
          <Dumbbell className="h-5 w-5" />
          Start training
        </button>
      </div>
    </div>
  )
}
