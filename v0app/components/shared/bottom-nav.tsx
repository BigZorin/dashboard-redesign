"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Dumbbell, UtensilsCrossed, BookOpen, LayoutGrid } from "lucide-react"

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Dumbbell, label: "Training", href: "/training" },
  { icon: UtensilsCrossed, label: "Voeding", href: "/voeding" },
  { icon: BookOpen, label: "Leren", href: "/leren" },
  { icon: LayoutGrid, label: "Meer", href: "/meer" },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 pb-[env(safe-area-inset-bottom,16px)]">
        <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border px-2 py-2">
          <div className="flex items-center justify-around">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                    isActive
                      ? "text-[#bad4e1]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`h-5 w-5 ${isActive ? "text-[#bad4e1]" : ""}`} />
                    {isActive && (
                      <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#bad4e1]" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${isActive ? "text-[#bad4e1]" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
    </nav>
  )
}
