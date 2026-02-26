"use client"

import { useState, useMemo } from "react"
import { Sun, UtensilsCrossed, Moon, Cookie } from "lucide-react"
import { VoedingHeader } from "@/components/voeding/voeding-header"
import { DateNavigator } from "@/components/voeding/date-navigator"
import { MacroRings } from "@/components/voeding/macro-rings"
import { MealSection, type FoodItem } from "@/components/voeding/meal-section"
import { AddFoodSheet } from "@/components/voeding/add-food-sheet"
import { BottomNav } from "@/components/shared/bottom-nav"

// Pre-filled schema items (as if coach assigned them)
const schemaItems: Record<string, FoodItem[]> = {
  ontbijt: [
    { id: "s1", name: "Franse Magere Kwark", brand: "Milbona", amount: 300, unit: "g", kcal: 156, protein: 27, carbs: 15, fat: 3, fromSchema: true },
    { id: "s2", name: "Havermout", brand: "Quaker", amount: 50, unit: "g", kcal: 185, protein: 7, carbs: 30, fat: 4, fromSchema: true },
    { id: "s3", name: "Banaan", brand: "", amount: 120, unit: "g", kcal: 107, protein: 1, carbs: 28, fat: 0, fromSchema: true },
  ],
  lunch: [
    { id: "s4", name: "Volkoren brood", brand: "Bolletje", amount: 140, unit: "g", kcal: 346, protein: 14, carbs: 57, fat: 4, fromSchema: true },
    { id: "s5", name: "Kipfilet", brand: "", amount: 150, unit: "g", kcal: 165, protein: 36, carbs: 0, fat: 2, fromSchema: true },
  ],
  avondeten: [
    { id: "s6", name: "Rijst (gekookt)", brand: "", amount: 300, unit: "g", kcal: 390, protein: 9, carbs: 84, fat: 0, fromSchema: true },
    { id: "s7", name: "Kipfilet", brand: "", amount: 200, unit: "g", kcal: 220, protein: 48, carbs: 0, fat: 2, fromSchema: true },
  ],
  snack: [
    { id: "s8", name: "Pindakaas", brand: "Calvé", amount: 30, unit: "g", kcal: 187, protein: 7, carbs: 4, fat: 15, fromSchema: true },
  ],
}

const mealConfig = [
  { key: "ontbijt", label: "Ontbijt", icon: <Sun className="h-4 w-4" /> },
  { key: "lunch", label: "Lunch", icon: <UtensilsCrossed className="h-4 w-4" /> },
  { key: "avondeten", label: "Avondeten", icon: <Moon className="h-4 w-4" /> },
  { key: "snack", label: "Snack", icon: <Cookie className="h-4 w-4" /> },
]

const dateLabels = ["Gisteren", "Vandaag", "Morgen"]

export default function VoedingPage() {
  const [dateIndex, setDateIndex] = useState(1)
  const [meals, setMeals] = useState<Record<string, FoodItem[]>>(schemaItems)
  const [addFoodMeal, setAddFoodMeal] = useState<string | null>(null)

  const activeMealLabel = mealConfig.find((m) => m.key === addFoodMeal)?.label ?? ""

  // Calculate totals
  const totals = useMemo(() => {
    const allItems = Object.values(meals).flat()
    return {
      kcal: allItems.reduce((s, i) => s + i.kcal, 0),
      protein: allItems.reduce((s, i) => s + i.protein, 0),
      carbs: allItems.reduce((s, i) => s + i.carbs, 0),
      fat: allItems.reduce((s, i) => s + i.fat, 0),
    }
  }, [meals])

  const handleAddItem = (mealKey: string, item: Omit<FoodItem, "id" | "fromSchema">) => {
    const newItem: FoodItem = {
      ...item,
      id: `u${Date.now()}`,
      fromSchema: false,
    }
    setMeals((prev) => ({
      ...prev,
      [mealKey]: [...(prev[mealKey] || []), newItem],
    }))
  }

  const handleRemoveItem = (mealKey: string, itemId: string) => {
    setMeals((prev) => ({
      ...prev,
      [mealKey]: prev[mealKey].filter((i) => i.id !== itemId),
    }))
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <VoedingHeader currentKcal={totals.kcal} targetKcal={3200} />

      <main className="flex flex-col gap-4 pb-40">
        <DateNavigator
          label={dateLabels[dateIndex] ?? "Vandaag"}
          onPrev={() => setDateIndex((i) => Math.max(0, i - 1))}
          onNext={() => setDateIndex((i) => Math.min(2, i + 1))}
        />

        <MacroRings
          kcal={{ current: totals.kcal, target: 3200 }}
          protein={{ current: totals.protein, target: 160 }}
          carbs={{ current: totals.carbs, target: 380 }}
          fat={{ current: totals.fat, target: 100 }}
        />

        {mealConfig.map((meal) => (
          <MealSection
            key={meal.key}
            icon={meal.icon}
            label={meal.label}
            items={meals[meal.key] || []}
            onAddFood={() => setAddFoodMeal(meal.key)}
            onRemoveFood={(id) => handleRemoveItem(meal.key, id)}
            onEditFood={() => {}}
          />
        ))}
      </main>

      <BottomNav />

      <AddFoodSheet
        isOpen={addFoodMeal !== null}
        onClose={() => setAddFoodMeal(null)}
        mealLabel={activeMealLabel}
        onAddItem={(item) => {
          if (addFoodMeal) handleAddItem(addFoodMeal, item)
        }}
      />
    </div>
  )
}
