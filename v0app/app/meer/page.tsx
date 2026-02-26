"use client"

import Image from "next/image"
import Link from "next/link"
import {
  TrendingUp,
  CheckSquare,
  UserCircle,
  Watch,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { BottomNav } from "@/components/shared/bottom-nav"

const sections = [
  {
    label: "GEZONDHEID",
    items: [
      {
        icon: TrendingUp,
        iconBg: "bg-[#bad4e1]/15",
        iconColor: "text-[#bad4e1]",
        title: "Voortgang",
        description: "Gewicht, foto's & metingen",
        href: "/meer/voortgang",
      },
      {
        icon: CheckSquare,
        iconBg: "bg-[#bad4e1]/15",
        iconColor: "text-[#bad4e1]",
        title: "Gewoontes",
        description: "Dagelijkse habits bijhouden",
        href: "/meer/gewoontes",
      },
    ],
  },
  {
    label: "INSTELLINGEN",
    items: [
      {
        icon: UserCircle,
        iconBg: "bg-[#bad4e1]/15",
        iconColor: "text-[#bad4e1]",
        title: "Profiel bewerken",
        description: "Pas je gegevens aan",
        href: "/meer/profiel",
      },
      {
        icon: Watch,
        iconBg: "bg-[#bad4e1]/15",
        iconColor: "text-[#bad4e1]",
        title: "Wearables",
        description: "Koppel je smartwatch of tracker",
        href: "/meer/wearables",
      },
      {
        icon: Bell,
        iconBg: "bg-[#bad4e1]/15",
        iconColor: "text-[#bad4e1]",
        title: "Notificaties",
        description: "Beheer je meldingen",
        href: "/meer/notificaties",
      },
      {
        icon: ShieldCheck,
        iconBg: "bg-red-500/15",
        iconColor: "text-red-400",
        title: "Privacy & Beveiliging",
        description: "Wachtwoord en gegevens",
        href: "/meer/privacy",
      },
    ],
  },
]

export default function MeerPage() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Profile header */}
      <div className="pt-14 px-5 pb-6">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-full overflow-hidden border-2 border-[#bad4e1]/30">
            <Image
              src="/images/avatar-michael.jpg"
              alt="Profielfoto"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground font-mono">Michael Jackson</h1>
            <p className="text-sm text-muted-foreground">info@bigzorin.nl</p>
          </div>
        </div>
      </div>

      <main className="pb-40">
        {sections.map((section) => (
          <div key={section.label} className="mb-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-5 pb-2 pt-4 font-mono">
              {section.label}
            </p>
            <div className="mx-4 rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
              {section.items.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors"
                >
                  <div className={`h-10 w-10 rounded-xl ${item.iconBg} flex items-center justify-center shrink-0`}>
                    <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Logout button */}
        <div className="px-4 mt-6">
          <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold text-sm hover:bg-red-500/15 transition-colors">
            <LogOut className="h-4 w-4" />
            <span>Uitloggen</span>
          </button>
        </div>

        {/* Version */}
        <p className="text-center text-[11px] text-muted-foreground/50 mt-4 font-mono">
          Evotion v1.0.0
        </p>
      </main>

      <BottomNav />
    </div>
  )
}
