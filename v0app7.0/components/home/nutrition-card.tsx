"use client"

/* Gesynchroniseerd met voeding pagina */
const macros = [
  { label: "Eiwit", current: 149, target: 160, color: "bg-chart-4" },
  { label: "Koolh.", current: 218, target: 380, color: "bg-chart-2" },
  { label: "Vet", current: 30, target: 100, color: "bg-chart-3" },
]

export function NutritionCard() {
  const currentCals = 1756
  const targetCals = 3200

  return (
    <section className="mx-5 rounded-2xl bg-card p-5 border border-border">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
          Voeding vandaag
        </h2>
        <span className="text-xs text-muted-foreground">
          {currentCals} / {targetCals} kcal
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Circular progress */}
        <div className="relative shrink-0">
          <svg width="110" height="110" viewBox="0 0 110 110">
            <circle
              cx="55"
              cy="55"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-secondary"
            />
            <circle
              cx="55"
              cy="55"
              r="46"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray={`${(currentCals / targetCals) * 289} 289`}
              strokeLinecap="round"
              transform="rotate(-90 55 55)"
              className="text-primary transition-all duration-700"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground font-mono">{currentCals}</span>
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">kcal</span>
          </div>
        </div>

        {/* Macro bars */}
        <div className="flex-1 flex flex-col gap-4">
          {macros.map((macro) => (
            <div key={macro.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-foreground">{macro.label}</span>
                <span className="text-xs text-muted-foreground font-mono">
                  {macro.current}
                  <span className="text-muted-foreground/50">g</span>
                  {" / "}
                  {macro.target}
                </span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full ${macro.color} transition-all duration-700`}
                  style={{ width: `${Math.max((macro.current / macro.target) * 100, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
