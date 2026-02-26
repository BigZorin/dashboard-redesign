"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Plus, PlusCircle, Trash2, Pencil } from "lucide-react"

export interface FoodItem {
  id: string
  name: string
  brand: string
  amount: number
  unit: string
  kcal: number
  protein: number
  carbs: number
  fat: number
  fromSchema: boolean
}

interface MealSectionProps {
  icon: React.ReactNode
  label: string
  items: FoodItem[]
  onAddFood: () => void
  onRemoveFood: (id: string) => void
  onEditFood: (item: FoodItem) => void
}

export function MealSection({ icon, label, items, onAddFood, onRemoveFood, onEditFood }: MealSectionProps) {
  const [swipedId, setSwipedId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  // Track which items have completed their entrance — start with all existing items
  const [enteredIds, setEnteredIds] = useState<Set<string>>(() => new Set(items.map(i => i.id)))
  const prevItemIds = useRef<Set<string>>(new Set(items.map(i => i.id)))

  const totalKcal = items.reduce((sum, item) => sum + item.kcal, 0)

  // Detect newly added items and trigger smooth entrance
  useEffect(() => {
    const currentIds = new Set(items.map(i => i.id))
    const newIds: string[] = []
    currentIds.forEach(id => {
      if (!prevItemIds.current.has(id)) {
        newIds.push(id)
      }
    })
    prevItemIds.current = currentIds

    if (newIds.length > 0) {
      // Double rAF: first frame renders at max-height:0, second frame transitions to full height
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setEnteredIds(prev => {
            const next = new Set(prev)
            newIds.forEach(id => next.add(id))
            return next
          })
        })
      })
    }
  }, [items])

  const handleRemove = useCallback((id: string) => {
    if (items.length <= 1) {
      onRemoveFood(id)
      return
    }
    setRemovingId(id)
    setSwipedId(null)
    setTimeout(() => {
      onRemoveFood(id)
      setRemovingId(null)
    }, 400)
  }, [onRemoveFood, items.length])

  return (
    <div className="mx-5 rounded-2xl bg-card border border-border overflow-hidden">
      {/* Meal header */}
      <div className="flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-muted-foreground">{icon}</span>
          <span className="text-sm font-bold text-foreground font-mono">{label}</span>
          {totalKcal > 0 && (
            <span className="text-xs text-muted-foreground font-mono">{totalKcal} kcal</span>
          )}
        </div>
        <button
          onClick={onAddFood}
          className="h-7 w-7 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-[#bad4e1] transition-colors"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Food items */}
      {items.length > 0 ? (
        <div className="border-t border-border">
          {items.map((item) => {
            const isRemoving = removingId === item.id
            const isNew = !enteredIds.has(item.id)

            // Determine max-height and opacity based on state
            let maxHeight = "120px"
            let opacity = 1
            let transform = "translateY(0)"

            if (isRemoving) {
              maxHeight = "0px"
              opacity = 0
              transform = "translateY(0)"
            } else if (isNew) {
              maxHeight = "0px"
              opacity = 0
              transform = "translateY(12px)"
            }

            return (
              <div
                key={item.id}
                className="relative overflow-hidden"
                style={{
                  maxHeight,
                  opacity,
                  transform,
                  transitionProperty: "max-height, opacity, transform",
                  transitionDuration: isRemoving ? "400ms" : "700ms",
                  transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {/* Swipe actions background */}
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    onClick={() => onEditFood(item)}
                    className="h-full w-14 bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="h-full w-14 bg-destructive/20 flex items-center justify-center text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Item content */}
                <button
                  onClick={() => setSwipedId(swipedId === item.id ? null : item.id)}
                  className={`relative w-full bg-card flex items-center justify-between px-4 py-3 text-left transition-transform duration-200 ${
                    swipedId === item.id ? "-translate-x-28" : "translate-x-0"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-foreground font-medium truncate">
                        {item.name}
                        {item.brand && (
                          <span className="text-muted-foreground"> ({item.brand})</span>
                        )}
                      </span>
                      {item.fromSchema && (
                        <span className="shrink-0 px-1.5 py-0.5 rounded text-[8px] font-semibold uppercase tracking-wider bg-[#bad4e1]/10 text-[#bad4e1]">
                          Schema
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono mt-0.5">
                      {item.amount}{item.unit}
                    </span>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <span className="text-sm font-semibold text-foreground font-mono">{item.kcal} kcal</span>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      E{item.protein} | K{item.carbs} | V{item.fat}
                    </p>
                  </div>
                </button>

                {/* Divider */}
                <div className="h-px bg-border/50 ml-4" />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="border-t border-border px-4 py-4">
          <button
            onClick={onAddFood}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mx-auto"
          >
            <PlusCircle className="h-4 w-4" />
            <span className="text-sm">Voeding toevoegen</span>
          </button>
        </div>
      )}
    </div>
  )
}
