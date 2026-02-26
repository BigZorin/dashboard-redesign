"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { BottomNav } from "@/components/shared/bottom-nav"

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative h-7 w-12 rounded-full transition-colors shrink-0 ${
        enabled ? "bg-[#bad4e1]" : "bg-secondary"
      }`}
    >
      <div
        className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? "translate-x-5.5" : "translate-x-0.5"
        }`}
      />
    </button>
  )
}

interface NotificationSetting {
  id: string
  title: string
  description: string
  enabled: boolean
}

export default function NotificatiesPage() {
  const [settings, setSettings] = useState<Record<string, NotificationSetting[]>>({
    ALGEMEEN: [
      { id: "push", title: "Push notificaties", description: "Ontvang meldingen op je telefoon", enabled: true },
    ],
    HERINNERINGEN: [
      { id: "training", title: "Trainingsherinneringen", description: "Ontvang notificaties voor geplande workouts", enabled: true },
      { id: "maaltijd", title: "Maaltijdherinneringen", description: "Herinneringen voor je voedingsschema", enabled: true },
    ],
    ACTIVITEIT: [
      { id: "cursus", title: "Cursus updates", description: "Nieuwe lessen en materiaal", enabled: false },
    ],
    "E-MAIL": [
      { id: "email", title: "E-mail notificaties", description: "Ontvang updates per e-mail", enabled: true },
    ],
  })

  function toggleSetting(section: string, id: string) {
    setSettings((prev) => ({
      ...prev,
      [section]: prev[section].map((s) =>
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ),
    }))
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[hsl(var(--header))] border-b border-border px-5 pt-12 pb-4 flex items-center gap-4">
        <Link
          href="/meer"
          className="h-9 w-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-base font-bold text-foreground font-mono flex-1 text-center pr-9">Notificaties</h1>
      </div>

      <main className="pb-40">
        {Object.entries(settings).map(([section, items]) => (
          <div key={section} className="mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-5 pb-2 pt-4 font-mono">
              {section}
            </p>
            <div className="mx-4 rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 px-4 py-3.5"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <Toggle
                    enabled={item.enabled}
                    onChange={() => toggleSetting(section, item.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  )
}
