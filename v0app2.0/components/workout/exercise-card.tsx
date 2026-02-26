import Image from "next/image"
import { Clock, Target, Timer } from "lucide-react"

interface ExerciseCardProps {
  name: string
  image: string
  sets: number
  reps: number
  rest: string
  rir?: number
  tempo?: string
}

export function ExerciseCard({ name, image, sets, reps, rest, rir, tempo }: ExerciseCardProps) {
  return (
    <div className="mx-5">
      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        {/* Exercise image */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>

        {/* Exercise info */}
        <div className="p-5">
          <h2 className="text-lg font-bold text-foreground font-mono tracking-tight">{name}</h2>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-3">
            <span className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground font-mono">
              {sets} sets
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground font-mono">
              {reps} reps
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-xs font-semibold text-secondary-foreground font-mono">
              <Clock className="h-3 w-3" />
              {rest}
            </span>
          </div>
        </div>
      </div>

      {/* Target info */}
      {(rir !== undefined || tempo) && (
        <div className="mt-3 rounded-2xl bg-[#1e1839] border border-border p-4 flex flex-col gap-2">
          {rir !== undefined && (
            <div className="flex items-center gap-2">
              <Target className="h-3.5 w-3.5 text-[#bad4e1]" />
              <span className="text-sm text-foreground font-mono">Doel: RIR {rir}</span>
            </div>
          )}
          {tempo && (
            <div className="flex items-center gap-2">
              <Timer className="h-3.5 w-3.5 text-[#bad4e1]" />
              <span className="text-sm text-foreground font-mono">Tempo: {tempo}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
