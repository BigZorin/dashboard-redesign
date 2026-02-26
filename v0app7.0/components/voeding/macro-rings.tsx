"use client"

import { useAnimatedNumber } from "@/hooks/use-animated-number"

interface MacroRingsProps {
  kcal: { current: number; target: number }
  protein: { current: number; target: number }
  carbs: { current: number; target: number }
  fat: { current: number; target: number }
}

function CircleRing({
  current,
  target,
  size,
  strokeWidth,
  color,
}: {
  current: number
  target: number
  size: number
  strokeWidth: number
  color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(current / target, 1)
  const offset = circumference - progress * circumference

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-secondary"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
    </svg>
  )
}

function AnimatedMacroValue({ value, className }: { value: number; className: string }) {
  const animated = useAnimatedNumber(value)
  return <span className={className}>{animated}</span>
}

export function MacroRings({ kcal, protein, carbs, fat }: MacroRingsProps) {
  const macroSmall = [
    { label: "Eiwit", ...protein, color: "var(--chart-4)" },
    { label: "Koolh.", ...carbs, color: "var(--chart-2)" },
    { label: "Vet", ...fat, color: "var(--chart-3)" },
  ]

  const animatedKcal = useAnimatedNumber(kcal.current)

  return (
    <div className="mx-5 rounded-2xl bg-card p-5 border border-border">
      {/* Main kcal ring */}
      <div className="flex flex-col items-center mb-5">
        <div className="relative">
          <CircleRing current={animatedKcal} target={kcal.target} size={120} strokeWidth={10} color="#bad4e1" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground font-mono">{animatedKcal}</span>
            <span className="text-[10px] text-[#bad4e1] font-medium uppercase tracking-wider">kcal</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground font-mono mt-2">/ {kcal.target}</span>
      </div>

      {/* Macro rings row */}
      <div className="flex items-center justify-around">
        {macroSmall.map((macro) => (
          <div key={macro.label} className="flex flex-col items-center">
            <div className="relative">
              <AnimatedCircleRing current={macro.current} target={macro.target} size={64} strokeWidth={6} color={macro.color} />
              <div className="absolute inset-0 flex items-center justify-center">
                <AnimatedMacroValue value={macro.current} className="text-sm font-bold text-foreground font-mono" />
              </div>
            </div>
            <span className="text-[11px] text-muted-foreground mt-1.5">{macro.label}</span>
            <span className="text-[10px] text-muted-foreground/60 font-mono">/ {macro.target}g</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnimatedCircleRing(props: { current: number; target: number; size: number; strokeWidth: number; color: string }) {
  const animatedCurrent = useAnimatedNumber(props.current)
  return <CircleRing {...props} current={animatedCurrent} />
}
