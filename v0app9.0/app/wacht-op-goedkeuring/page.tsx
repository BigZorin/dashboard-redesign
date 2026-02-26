"use client"

import { useState, useEffect } from "react"
import { LogOut, CheckCircle2, Clock, FileText, User, Sparkles } from "lucide-react"
import { useRouter } from "next/navigation"

export default function WachtOpGoedkeuringPage() {
  const router = useRouter()
  const [dots, setDots] = useState("")

  // Animated dots for "In behandeling..."
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 500)
    return () => clearInterval(interval)
  }, [])

  const steps = [
    {
      icon: FileText,
      label: "Intake ontvangen",
      status: "complete" as const,
      detail: "Vandaag om 15:32",
    },
    {
      icon: User,
      label: "Coach toegewezen",
      status: "complete" as const,
      detail: "Coach Michael",
    },
    {
      icon: Clock,
      label: "Wordt beoordeeld",
      status: "active" as const,
      detail: "In behandeling" + dots,
    },
    {
      icon: Sparkles,
      label: "Plan wordt gemaakt",
      status: "pending" as const,
      detail: "Binnenkort",
    },
  ]

  return (
    <main className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <p className="text-xs text-[#bad4e1] font-semibold uppercase tracking-wider font-mono">Status</p>
        <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight mt-1">Wacht op goedkeuring</h1>
        <p className="text-sm text-muted-foreground mt-1">Je coach beoordeelt je intake</p>
      </div>

      {/* Content */}
      <div className="px-5 space-y-4">
        <div className="bg-card rounded-2xl border border-border p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-4">
            Voortgang
          </p>

          <div className="space-y-1">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isLast = idx === steps.length - 1

              return (
                <div key={step.label} className="flex gap-4">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        step.status === "complete"
                          ? "bg-[#bad4e1]/20 text-[#bad4e1]"
                          : step.status === "active"
                            ? "bg-[#bad4e1] text-background"
                            : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {step.status === "complete" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    {!isLast && (
                      <div
                        className={`w-0.5 flex-1 my-1 min-h-[24px] ${
                          step.status === "complete" ? "bg-[#bad4e1]/30" : "bg-border"
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pb-5">
                    <p
                      className={`text-sm font-semibold font-mono ${
                        step.status === "pending" ? "text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p
                      className={`text-xs mt-0.5 ${
                        step.status === "active" ? "text-[#bad4e1]" : "text-muted-foreground"
                      }`}
                    >
                      {step.detail}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </div>

      {/* Bottom actions - fixed */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={() => router.push("/login")}
          className="w-full h-12 rounded-xl bg-secondary text-muted-foreground font-mono font-semibold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all active:scale-[0.98]"
        >
          <LogOut className="h-4 w-4" />
          Uitloggen
        </button>
      </div>
    </main>
  )
}
