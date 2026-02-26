import { Target, TrendingUp, Flame, Award } from "lucide-react"

const stats = [
  {
    icon: Target,
    label: "Voltooiing",
    value: "92%",
    sub: "deze maand",
  },
  {
    icon: TrendingUp,
    label: "Streak",
    value: "6",
    sub: "weken",
  },
  {
    icon: Flame,
    label: "Sessies",
    value: "14",
    sub: "deze maand",
  },
  {
    icon: Award,
    label: "PR's",
    value: "3",
    sub: "deze week",
  },
]

export function TrainingStats() {
  return (
    <section className="mx-5">
      <h2 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-3">
        Statistieken
      </h2>

      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={i}
              className="rounded-2xl bg-card border border-border p-4 flex flex-col gap-3"
            >
              <div className="h-9 w-9 rounded-xl bg-[#bad4e1]/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-[#bad4e1]" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-bold text-foreground font-mono tracking-tight">{stat.value}</span>
                  <span className="text-[10px] text-muted-foreground">{stat.sub}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
