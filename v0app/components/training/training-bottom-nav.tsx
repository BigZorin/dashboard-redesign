"use client"

import { Home, Dumbbell, UtensilsCrossed, BookOpen, LayoutGrid } from "lucide-react"

const navItems = [
  { icon: Home, label: "Home", active: false },
  { icon: Dumbbell, label: "Training", active: true },
  { icon: UtensilsCrossed, label: "Voeding", active: false },
  { icon: BookOpen, label: "Leren", active: false },
  { icon: LayoutGrid, label: "Meer", active: false },
]

export function TrainingBottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      <div className="max-w-md mx-auto">
        <div className="mx-4 mb-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                    item.active
                      ? "text-[#bad4e1]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 ${item.active ? "text-[#bad4e1]" : ""}`} />
                    {item.active && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#bad4e1]" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${item.active ? "text-[#bad4e1]" : ""}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
