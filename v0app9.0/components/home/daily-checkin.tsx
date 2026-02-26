"use client"

import Link from "next/link"
import { Check } from "lucide-react"

const days = [
  { label: "DI", date: 17, checked: true, active: false },
  { label: "WO", date: 18, checked: true, active: false },
  { label: "DO", date: 19, checked: false, active: false },
  { label: "VR", date: 20, checked: true, active: false },
  { label: "ZA", date: 21, checked: false, active: true },
]

export function DailyCheckin() {
  return (
    <section className="mx-5 rounded-2xl bg-card p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
          Dagelijkse check-in
        </h2>
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full bg-[#bad4e1]" />
          <span className="text-xs text-[#bad4e1] font-medium">3/5</span>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        {days.map((day) => {
          const inner = (
            <div
              className={`flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                day.active
                  ? "bg-[#bad4e1] text-[#1e1839] shadow-lg shadow-[#bad4e1]/25 active:scale-95"
                  : day.checked
                    ? "bg-[#bad4e1]/15 text-foreground"
                    : "bg-secondary text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1">
                {day.checked && !day.active && (
                  <Check className="h-3 w-3 text-[#bad4e1]" />
                )}
                <span className="text-[10px] font-semibold uppercase tracking-wider">
                  {day.label}
                </span>
              </div>
              <span className={`text-lg font-bold font-mono ${day.active ? "text-[#1e1839]" : ""}`}>
                {day.date}
              </span>
            </div>
          )

          if (day.active) {
            return (
              <Link key={day.label} href="/checkin" className="flex-1">
                {inner}
              </Link>
            )
          }

          return <div key={day.label} className="flex-1">{inner}</div>
        })}
      </div>
    </section>
  )
}
