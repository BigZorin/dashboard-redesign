"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  ShoppingCart,
  Wheat,
  Drumstick,
  Milk,
  Apple,
  Package,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Share2,
} from "lucide-react"

interface GroceryItem {
  id: string
  name: string
  amount: string
  checked: boolean
  category: string
}

const initialItems: GroceryItem[] = [
  // Zuivel
  { id: "1", name: "Franse Magere Kwark", amount: "2.1 kg", checked: false, category: "Zuivel" },
  { id: "2", name: "Melk (halfvol)", amount: "1 L", checked: false, category: "Zuivel" },
  // Granen & brood
  { id: "3", name: "Havermout", amount: "350 g", checked: false, category: "Granen & brood" },
  { id: "4", name: "Volkoren brood", amount: "980 g", checked: false, category: "Granen & brood" },
  { id: "5", name: "Rijst (ongekookt)", amount: "900 g", checked: false, category: "Granen & brood" },
  // Vlees & vis
  { id: "6", name: "Kipfilet", amount: "2.45 kg", checked: false, category: "Vlees & vis" },
  // Groente & fruit
  { id: "7", name: "Banaan", amount: "7 stuks", checked: false, category: "Groente & fruit" },
  { id: "8", name: "Broccoli", amount: "500 g", checked: false, category: "Groente & fruit" },
  { id: "9", name: "Spinazie", amount: "300 g", checked: false, category: "Groente & fruit" },
  // Overig
  { id: "10", name: "Pindakaas", amount: "210 g", checked: false, category: "Overig" },
  { id: "11", name: "Olijfolie", amount: "1 fles", checked: false, category: "Overig" },
]

const categoryConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  "Zuivel": { icon: <Milk className="h-4 w-4" />, color: "#bad4e1" },
  "Granen & brood": { icon: <Wheat className="h-4 w-4" />, color: "oklch(0.75 0.18 80)" },
  "Vlees & vis": { icon: <Drumstick className="h-4 w-4" />, color: "oklch(0.6 0.2 25)" },
  "Groente & fruit": { icon: <Apple className="h-4 w-4" />, color: "oklch(0.7 0.17 155)" },
  "Overig": { icon: <Package className="h-4 w-4" />, color: "oklch(0.7 0.15 300)" },
}

const categoryOrder = ["Zuivel", "Granen & brood", "Vlees & vis", "Groente & fruit", "Overig"]

export default function BoodschappenlijstPage() {
  const [items, setItems] = useState<GroceryItem[]>(initialItems)
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  const toggleCheck = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    )
  }

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(cat)) next.delete(cat)
      else next.add(cat)
      return next
    })
  }

  const resetAll = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: false })))
  }

  const totalItems = items.length
  const checkedItems = items.filter((i) => i.checked).length
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0

  // Group by category
  const grouped = categoryOrder
    .map((cat) => ({
      category: cat,
      items: items.filter((i) => i.category === cat),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <div className="flex items-center gap-3 mb-5">
          <Link
            href="/voeding"
            className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <h1 className="text-lg font-bold text-foreground font-mono flex-1">
            Boodschappenlijst
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={resetAll}
              className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95"
              aria-label="Reset"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-all active:scale-95"
              aria-label="Delen"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Progress card */}
        <div className="rounded-2xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
              Weekschema
            </p>
            <span className="text-xs text-[#bad4e1] font-mono font-semibold">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-3">
            <span className="text-3xl font-bold font-mono text-foreground">{checkedItems}</span>
            <span className="text-sm text-muted-foreground font-mono">/ {totalItems} items</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, #bad4e1 0%, oklch(0.7 0.17 155) 100%)`,
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-mono mt-2">
            {checkedItems === totalItems ? "Alles afgevinkt" : `Nog ${totalItems - checkedItems} items te gaan`}
          </p>
        </div>
      </div>

      {/* Category sections */}
      <main className="px-5 pt-5 pb-24">
        <div className="flex flex-col gap-4">
          {grouped.map((group, gIdx) => {
            const config = categoryConfig[group.category] || categoryConfig["Overig"]
            const isCollapsed = collapsedCategories.has(group.category)
            const groupChecked = group.items.filter((i) => i.checked).length
            const allChecked = groupChecked === group.items.length

            return (
              <div
                key={group.category}
                style={{
                  animationDelay: `${gIdx * 60}ms`,
                  animation: "fadeSlideUp 0.4s ease-out forwards",
                  opacity: 0,
                }}
              >
                {/* Category header */}
                <button
                  onClick={() => toggleCategory(group.category)}
                  className="flex items-center gap-2.5 w-full mb-2 group"
                >
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `color-mix(in oklch, ${config.color} 15%, transparent)` }}
                  >
                    <span style={{ color: config.color }}>{config.icon}</span>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider font-mono flex-1 text-left transition-colors ${allChecked ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {group.category}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono mr-1">
                    {groupChecked}/{group.items.length}
                  </span>
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  )}
                </button>

                {/* Items */}
                {!isCollapsed && (
                  <div className="flex flex-col gap-1.5 ml-0.5">
                    {group.items.map((item, iIdx) => (
                      <button
                        key={item.id}
                        onClick={() => toggleCheck(item.id)}
                        className={`flex items-center gap-3 p-3.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                          item.checked
                            ? "bg-card/50 border border-border/50"
                            : "bg-card border border-border hover:border-[#bad4e1]/20"
                        }`}
                        style={{
                          animationDelay: `${gIdx * 60 + iIdx * 40}ms`,
                          animation: "fadeSlideUp 0.35s ease-out forwards",
                          opacity: 0,
                        }}
                      >
                        {/* Checkbox */}
                        <div
                          className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-300 ${
                            item.checked
                              ? "bg-[#bad4e1] border-[#bad4e1]"
                              : "border-border"
                          }`}
                        >
                          {item.checked && <Check className="h-3.5 w-3.5 text-[#1e1839]" strokeWidth={3} />}
                        </div>

                        {/* Name + amount */}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`text-sm font-semibold block truncate transition-all duration-300 ${
                              item.checked ? "text-muted-foreground line-through" : "text-foreground"
                            }`}
                          >
                            {item.name}
                          </span>
                        </div>

                        {/* Amount badge */}
                        <span
                          className={`text-xs font-mono font-semibold shrink-0 px-2.5 py-1 rounded-lg transition-all duration-300 ${
                            item.checked
                              ? "bg-secondary/50 text-muted-foreground"
                              : "bg-[#bad4e1]/10 text-[#bad4e1]"
                          }`}
                        >
                          {item.amount}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* All done state */}
        {checkedItems === totalItems && totalItems > 0 && (
          <div
            className="mt-8 flex flex-col items-center text-center"
            style={{ animation: "fadeSlideUp 0.5s ease-out forwards" }}
          >
            <div className="h-16 w-16 rounded-2xl bg-[#bad4e1]/15 flex items-center justify-center mb-4">
              <ShoppingCart className="h-7 w-7 text-[#bad4e1]" />
            </div>
            <p className="text-base font-bold font-mono text-foreground mb-1">Alles afgevinkt</p>
            <p className="text-sm text-muted-foreground">Je boodschappen zijn compleet voor deze week.</p>
          </div>
        )}
      </main>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
