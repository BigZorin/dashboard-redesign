"use client"

import { useState, useEffect } from "react"
import { X, Search, ScanBarcode, PenSquare, ChevronRight, ArrowLeft, Sparkles, BookmarkCheck, Copy, PlusCircle, Trash2, Minus, Plus, ChevronLeft, Apple, Camera } from "lucide-react"
import type { FoodItem } from "./meal-section"

const foodDatabase = [
  { name: "Franse Magere Kwark", brand: "Milbona", kcalPer100: 52, proteinPer100: 9, carbsPer100: 5, fatPer100: 1, defaultPortion: 300 },
  { name: "Franse kwark mager", brand: "Jumbo", kcalPer100: 59, proteinPer100: 9, carbsPer100: 4, fatPer100: 1, defaultPortion: 300 },
  { name: "Magere kwark Aardbei", brand: "Optimel", kcalPer100: 45, proteinPer100: 7, carbsPer100: 4, fatPer100: 0, defaultPortion: 300 },
  { name: "Havermout", brand: "Quaker", kcalPer100: 370, proteinPer100: 13, carbsPer100: 60, fatPer100: 7, defaultPortion: 50 },
  { name: "Volkoren brood", brand: "Bolletje", kcalPer100: 247, proteinPer100: 10, carbsPer100: 41, fatPer100: 3, defaultPortion: 35 },
  { name: "Kipfilet", brand: "Kip", kcalPer100: 110, proteinPer100: 24, carbsPer100: 0, fatPer100: 1, defaultPortion: 150 },
  { name: "Rijst (gekookt)", brand: "", kcalPer100: 130, proteinPer100: 3, carbsPer100: 28, fatPer100: 0, defaultPortion: 200 },
  { name: "Pindakaas", brand: "Calve", kcalPer100: 623, proteinPer100: 22, carbsPer100: 14, fatPer100: 51, defaultPortion: 15 },
  { name: "Banaan", brand: "", kcalPer100: 89, proteinPer100: 1, carbsPer100: 23, fatPer100: 0, defaultPortion: 120 },
  { name: "Ei (gekookt)", brand: "", kcalPer100: 155, proteinPer100: 13, carbsPer100: 1, fatPer100: 11, defaultPortion: 60 },
]

/*
 * TODO [Claude / Backend]:
 * Opgeslagen recepten moeten een `imageUrl` veld krijgen.
 * Wanneer AI recepten worden gegenereerd, moet er ook een afbeelding bij komen
 * (via image generation API of stock foto). Gebruik dan <Image> met het pad
 * in plaats van het placeholder-icoon. Het recept-type wordt dan:
 * { id, name, description, imageUrl?, kcal, protein, carbs, fat, ingredients[], steps[] }
 */
interface SavedRecipe {
  id: string
  name: string
  description: string
  imageUrl?: string // TODO: vullen wanneer AI recepten afbeeldingen genereren
  kcal: number
  protein: number
  carbs: number
  fat: number
}

const savedRecipes: SavedRecipe[] = [
  {
    id: "r1",
    name: "Kaas- en Spinazie Omelet met Groenten",
    description: "Een voedzaam en smaakvol ontbijt met veel eiwitten",
    kcal: 800,
    protein: 40,
    carbs: 95,
    fat: 25,
  },
  {
    id: "r2",
    name: "Griekse Yoghurt Bowl met Noten",
    description: "Licht en voedzaam met crunchy toppings",
    kcal: 450,
    protein: 28,
    carbs: 42,
    fat: 18,
  },
  {
    id: "r3",
    name: "Kip Teriyaki met Rijst",
    description: "Smaakvolle Aziatische maaltijd vol eiwitten",
    kcal: 680,
    protein: 52,
    carbs: 78,
    fat: 12,
  },
]

interface PastMealItem {
  name: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

interface PastMealGroup {
  label: string
  icon: string
  items: PastMealItem[]
}

interface PastDay {
  dayLabel: string
  dateLabel: string
  groups: PastMealGroup[]
}

const pastDays: PastDay[] = [
  {
    dayLabel: "Gisteren",
    dateLabel: "Zondag 23 feb",
    groups: [
      { label: "Ontbijt", icon: "sun", items: [
        { name: "Havermout met banaan", kcal: 340, protein: 12, carbs: 58, fat: 8 },
        { name: "Ei (gekookt) x2", kcal: 186, protein: 16, carbs: 1, fat: 13 },
      ]},
      { label: "Lunch", icon: "utensils", items: [
        { name: "Broodje kipfilet", kcal: 380, protein: 32, carbs: 41, fat: 8 },
      ]},
      { label: "Avondeten", icon: "moon", items: [
        { name: "Rijst met kip teriyaki", kcal: 680, protein: 52, carbs: 78, fat: 12 },
      ]},
      { label: "Snack", icon: "cookie", items: [
        { name: "Griekse yoghurt", kcal: 150, protein: 14, carbs: 8, fat: 6 },
      ]},
    ],
  },
  {
    dayLabel: "Eergisteren",
    dateLabel: "Zaterdag 22 feb",
    groups: [
      { label: "Ontbijt", icon: "sun", items: [
        { name: "Kwark met fruit en muesli", kcal: 320, protein: 28, carbs: 35, fat: 6 },
      ]},
      { label: "Lunch", icon: "utensils", items: [
        { name: "Volkoren wrap met tonijn", kcal: 410, protein: 34, carbs: 38, fat: 12 },
      ]},
      { label: "Avondeten", icon: "moon", items: [
        { name: "Pasta bolognese", kcal: 620, protein: 38, carbs: 72, fat: 18 },
      ]},
    ],
  },
]

interface AddFoodSheetProps {
  isOpen: boolean
  onClose: () => void
  mealLabel: string
  onAddItem: (item: Omit<FoodItem, "id" | "fromSchema">) => void
  onAddItemsStaggered?: (items: Omit<FoodItem, "id" | "fromSchema">[]) => void
}

type SheetView = "options" | "search" | "detail" | "manual" | "ai" | "saved" | "copy" | "barcode"

interface SelectedProduct {
  name: string
  brand: string
  kcalPer100: number
  proteinPer100: number
  carbsPer100: number
  fatPer100: number
  defaultPortion: number
}

const options = [
  { id: "search", icon: Search, label: "Zoeken", description: "Zoek in de voedingsdatabase", color: "#bad4e1", enabled: true },
  { id: "barcode", icon: ScanBarcode, label: "Barcode scannen", description: "Scan het etiket van een product", color: "oklch(0.75 0.18 80)", enabled: true },
  { id: "manual", icon: PenSquare, label: "Handmatig invoeren", description: "Voer voedingswaarden zelf in", color: "oklch(0.72 0.22 25)", enabled: true },
  { id: "ai", icon: Sparkles, label: "AI Recept", description: "Genereer een recept op basis van je macro's", color: "oklch(0.7 0.15 300)", enabled: true },
  { id: "saved", icon: BookmarkCheck, label: "Opgeslagen recepten", description: "Bekijk je opgeslagen AI recepten", color: "oklch(0.7 0.17 155)", enabled: true },
  { id: "copy", icon: Copy, label: "Kopieer maaltijd", description: "Kopieer een eerdere maaltijd", color: "oklch(0.6 0.12 250)", enabled: true },
]

export function AddFoodSheet({ isOpen, onClose, mealLabel, onAddItem, onAddItemsStaggered }: AddFoodSheetProps) {
  const [view, setView] = useState<SheetView>("options")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null)
  const [portion, setPortion] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [revealed, setRevealed] = useState(false)

  // Manual entry state
  const [manualName, setManualName] = useState("")
  const [manualPortion, setManualPortion] = useState("100")
  const [manualUnit, setManualUnit] = useState<"g" | "ml" | "stuks">("g")
  const [manualKcal, setManualKcal] = useState("")
  const [manualProtein, setManualProtein] = useState("")
  const [manualCarbs, setManualCarbs] = useState("")
  const [manualFat, setManualFat] = useState("")

  // AI recipe state
  const [aiPreferences, setAiPreferences] = useState("")
  const [aiGenerating, setAiGenerating] = useState(false)

  // Copy meal state
  const [copyDayIdx, setCopyDayIdx] = useState(0)
  const [selectedCopyItems, setSelectedCopyItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (isOpen) {
      setRevealed(false)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setRevealed(true))
      })
    } else {
      setRevealed(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const filteredResults = searchQuery.length > 0
    ? foodDatabase.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.brand.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : foodDatabase

  const handleSelectProduct = (product: SelectedProduct) => {
    setSelectedProduct(product)
    setPortion(product.defaultPortion.toString())
    setQuantity("1")
    setView("detail")
  }

  const handleAdd = () => {
    if (!selectedProduct) return
    const portionG = parseFloat(portion) || 0
    const qty = parseFloat(quantity) || 1
    const multiplier = (portionG * qty) / 100
    onAddItem({
      name: selectedProduct.name,
      brand: selectedProduct.brand,
      amount: portionG * qty,
      unit: "g",
      kcal: Math.round(selectedProduct.kcalPer100 * multiplier),
      protein: Math.round(selectedProduct.proteinPer100 * multiplier),
      carbs: Math.round(selectedProduct.carbsPer100 * multiplier),
      fat: Math.round(selectedProduct.fatPer100 * multiplier),
    })
    resetAndClose()
  }

  const handleManualAdd = () => {
    if (!manualName) return
    onAddItem({
      name: manualName,
      brand: "",
      amount: parseFloat(manualPortion) || 100,
      unit: manualUnit,
      kcal: parseFloat(manualKcal) || 0,
      protein: parseFloat(manualProtein) || 0,
      carbs: parseFloat(manualCarbs) || 0,
      fat: parseFloat(manualFat) || 0,
    })
    resetAndClose()
  }

  const handleAddRecipe = (recipe: SavedRecipe) => {
    onAddItem({
      name: recipe.name,
      brand: "Recept",
      amount: 1,
      unit: "stuks",
      kcal: recipe.kcal,
      protein: recipe.protein,
      carbs: recipe.carbs,
      fat: recipe.fat,
    })
    resetAndClose()
  }

  const handleBack = () => {
    if (view === "detail") setView("search")
    else if (view !== "options") { setView("options"); setSearchQuery("") }
    else onClose()
  }

  const resetAndClose = () => {
    setView("options")
    setSearchQuery("")
    setSelectedProduct(null)
    setManualName(""); setManualPortion("100"); setManualUnit("g")
    setManualKcal(""); setManualProtein(""); setManualCarbs(""); setManualFat("")
    onClose()
  }

  const handleOptionClick = (id: string) => {
    if (id === "search") setView("search")
    else if (id === "manual") setView("manual")
    else if (id === "ai") setView("ai")
    else if (id === "saved") setView("saved")
    else if (id === "copy") setView("copy")
    else if (id === "barcode") setView("barcode")
  }

  const portionG = parseFloat(portion) || 0
  const qty = parseFloat(quantity) || 1
  const multiplier = (portionG * qty) / 100
  const totals = selectedProduct ? {
    kcal: Math.round(selectedProduct.kcalPer100 * multiplier),
    protein: Math.round(selectedProduct.proteinPer100 * multiplier),
    carbs: Math.round(selectedProduct.carbsPer100 * multiplier),
    fat: Math.round(selectedProduct.fatPer100 * multiplier),
  } : { kcal: 0, protein: 0, carbs: 0, fat: 0 }

  const viewTitle: Record<SheetView, string> = {
    options: "Voeding toevoegen",
    search: "Zoek voeding",
    detail: "Product details",
    manual: "Handmatig invoeren",
    ai: "AI Recept",
    saved: "Opgeslagen recepten",
    copy: "Kopieer maaltijd",
    barcode: "Barcode scannen",
  }

  // Resterende macro's (hardcoded voorbeeld)
  const remaining = { kcal: 1052, protein: 106, carbs: 168, fat: 0 }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${revealed ? "opacity-100" : "opacity-0"}`}
        onClick={resetAndClose}
      />

      <div className={`relative mt-auto w-full max-w-md mx-auto h-[90vh] flex flex-col bg-background rounded-t-3xl overflow-hidden transition-transform duration-500 ease-out ${revealed ? "translate-y-0" : "translate-y-full"}`}>
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <button onClick={handleBack} className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors">
            {view === "options" ? <X className="h-4.5 w-4.5" /> : <ArrowLeft className="h-4.5 w-4.5" />}
          </button>
          <h2 className="text-sm font-bold text-foreground font-mono">{viewTitle[view]}</h2>
          <div className="w-9" />
        </div>

        {/* OPTIONS VIEW */}
        {view === "options" && (
          <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1] font-mono mb-5">
              {mealLabel}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {options.slice(0, 2).map((opt, i) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    style={{ transitionDelay: `${i * 60}ms` }}
                    className={`relative overflow-hidden rounded-2xl bg-card border border-border p-4 text-left transition-all duration-500 ease-out ${
                      revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    } hover:border-[#bad4e1]/40 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <div className="h-12 w-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: `color-mix(in oklch, ${opt.color} 15%, transparent)` }}>
                      <Icon className="h-5.5 w-5.5" style={{ color: opt.color }} />
                    </div>
                    <span className="text-sm font-bold text-foreground font-mono block">{opt.label}</span>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{opt.description}</p>
                    <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full opacity-[0.04] blur-xl"
                      style={{ backgroundColor: opt.color }} />
                  </button>
                )
              })}
            </div>

            <div className="flex flex-col gap-2">
              {options.slice(2).map((opt, i) => {
                const Icon = opt.icon
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionClick(opt.id)}
                    style={{ transitionDelay: `${(i + 2) * 60}ms` }}
                    className={`flex items-center gap-3.5 p-3.5 rounded-xl bg-card border border-border text-left transition-all duration-500 ease-out ${
                      revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    } hover:border-[#bad4e1]/30 active:scale-[0.98]`}
                  >
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `color-mix(in oklch, ${opt.color} 15%, transparent)` }}>
                      <Icon className="h-4.5 w-4.5" style={{ color: opt.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-foreground font-mono">{opt.label}</span>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{opt.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* SEARCH VIEW */}
        {view === "search" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-5 py-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Zoek een product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#bad4e1] font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {filteredResults.length === 0 && (
                <div className="flex flex-col items-center justify-center pt-20 px-8">
                  <Apple className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-sm font-bold text-foreground font-mono mb-1">Geen resultaten</p>
                  <p className="text-xs text-muted-foreground text-center">Probeer een andere zoekterm</p>
                </div>
              )}
              {filteredResults.map((product, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-card/50 transition-colors border-b border-border/50"
                >
                  <div className="h-11 w-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-base font-bold text-muted-foreground font-mono">{product.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground block truncate">{product.name}</span>
                    {product.brand && <span className="text-xs text-muted-foreground">{product.brand}</span>}
                    <p className="text-[11px] text-muted-foreground/70 font-mono mt-0.5">
                      {product.kcalPer100} kcal | E{product.proteinPer100}g | K{product.carbsPer100}g | V{product.fatPer100}g
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === "detail" && selectedProduct && (
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
            <div className="text-center mb-6">
              <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-muted-foreground font-mono">{selectedProduct.name.charAt(0)}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground font-mono">{selectedProduct.name}</h3>
              {selectedProduct.brand && <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>}
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-2">Per 100g</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground font-mono">{selectedProduct.kcalPer100} kcal</span>
                <span className="text-sm text-muted-foreground font-mono">E {selectedProduct.proteinPer100}g</span>
                <span className="text-sm text-muted-foreground font-mono">K {selectedProduct.carbsPer100}g</span>
                <span className="text-sm text-muted-foreground font-mono">V {selectedProduct.fatPer100}g</span>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-3">Portiegrootte</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input type="number" value={portion} onChange={(e) => setPortion(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#bad4e1]" />
                </div>
                <span className="text-muted-foreground font-mono">x</span>
                <div className="w-20">
                  <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#bad4e1]" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-card border border-border p-4 mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-3">Totale voedingswaarden</p>
              <div className="flex items-center justify-around">
                {[
                  { label: "kcal", value: totals.kcal, color: "#bad4e1", max: 3200 },
                  { label: "Eiwit", value: totals.protein, color: "var(--chart-4)", max: 160 },
                  { label: "Koolh.", value: totals.carbs, color: "var(--chart-2)", max: 380 },
                  { label: "Vet", value: totals.fat, color: "var(--chart-3)", max: 100 },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <div className="relative">
                      <svg width={52} height={52} viewBox="0 0 52 52">
                        <circle cx={26} cy={26} r={22} fill="none" stroke="currentColor" strokeWidth={5} className="text-secondary" />
                        <circle cx={26} cy={26} r={22} fill="none" stroke={item.color} strokeWidth={5}
                          strokeDasharray={`${Math.min((item.value / item.max), 1) * 138} 138`}
                          strokeLinecap="round" transform="rotate(-90 26 26)" className="transition-all duration-700" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-foreground font-mono">{item.value}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={handleAdd}
              className="w-full h-12 rounded-2xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]">
              <PlusCircle className="h-5 w-5" />
              Toevoegen
            </button>
          </div>
        )}

        {/* MANUAL ENTRY VIEW */}
        {view === "manual" && (
          <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1] font-mono mb-5">{mealLabel}</p>

            {/* Name */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-foreground font-mono mb-2 block">Naam *</label>
              <input type="text" placeholder="bijv. Havermout met banaan" value={manualName} onChange={(e) => setManualName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#bad4e1]" />
            </div>

            {/* Portion & Unit */}
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <label className="text-xs font-semibold text-foreground font-mono mb-2 block">Portie</label>
                <input type="number" value={manualPortion} onChange={(e) => setManualPortion(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm text-foreground font-mono text-center focus:outline-none focus:ring-1 focus:ring-[#bad4e1]" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-foreground font-mono mb-2 block">Eenheid</label>
                <div className="flex gap-1.5">
                  {(["g", "ml", "stuks"] as const).map((u) => (
                    <button key={u} onClick={() => setManualUnit(u)}
                      className={`flex-1 h-12 rounded-xl text-xs font-bold font-mono transition-all ${
                        manualUnit === u ? "bg-[#bad4e1] text-[#1e1839]" : "bg-secondary text-foreground border border-border"
                      }`}>
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Macro inputs */}
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-3">Voedingswaarden</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { label: "Calorieen", value: manualKcal, set: setManualKcal, color: "#bad4e1" },
                { label: "Eiwit (g)", value: manualProtein, set: setManualProtein, color: "var(--chart-4)" },
                { label: "Koolhydraten (g)", value: manualCarbs, set: setManualCarbs, color: "var(--chart-2)" },
                { label: "Vet (g)", value: manualFat, set: setManualFat, color: "var(--chart-3)" },
              ].map((field) => (
                <div key={field.label}>
                  <label className="text-xs font-semibold text-foreground font-mono mb-2 flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: field.color }} />
                    {field.label}
                  </label>
                  <input type="number" placeholder="0" value={field.value} onChange={(e) => field.set(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-sm text-foreground font-mono text-center focus:outline-none focus:ring-1 focus:ring-[#bad4e1]" />
                </div>
              ))}
            </div>

            <button onClick={handleManualAdd} disabled={!manualName}
              className="w-full h-12 rounded-2xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40">
              <PlusCircle className="h-5 w-5" />
              Opslaan
            </button>
          </div>
        )}

        {/* BARCODE VIEW */}
        {view === "barcode" && (
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="h-48 w-48 rounded-3xl border-2 border-dashed border-[#bad4e1]/40 flex items-center justify-center mb-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-[#bad4e1]/5" />
              <Camera className="h-12 w-12 text-[#bad4e1]/60" />
              {/* Animated scan line */}
              <div className="absolute left-4 right-4 h-0.5 bg-[#bad4e1]/60 animate-[scan_2s_ease-in-out_infinite]"
                style={{ animation: "scan 2s ease-in-out infinite" }} />
            </div>
            <h3 className="text-base font-bold text-foreground font-mono mb-2">Scan een barcode</h3>
            <p className="text-sm text-muted-foreground text-center leading-relaxed mb-6">
              Richt je camera op de barcode van het product
            </p>
            <p className="text-xs text-muted-foreground/60 text-center">
              Binnenkort beschikbaar in de app
            </p>
            <style>{`
              @keyframes scan {
                0%, 100% { top: 20%; }
                50% { top: 75%; }
              }
            `}</style>
          </div>
        )}

        {/* AI RECIPE VIEW */}
        {view === "ai" && (
          <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1] font-mono mb-5">{mealLabel}</p>

            {/* Remaining macros */}
            <div className="rounded-2xl bg-card border border-border p-4 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-3">
                {"Resterende macro's vandaag"}
              </p>
              <div className="flex items-center justify-around">
                {[
                  { label: "kcal", value: remaining.kcal, color: "#bad4e1" },
                  { label: "Eiwit", value: `${remaining.protein}g`, color: "var(--chart-4)" },
                  { label: "Koolh.", value: `${remaining.carbs}g`, color: "var(--chart-2)" },
                  { label: "Vet", value: `${remaining.fat}g`, color: "var(--chart-3)" },
                ].map((m) => (
                  <div key={m.label} className="flex flex-col items-center">
                    <span className="text-lg font-bold font-mono" style={{ color: m.color }}>{m.value}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI target */}
            <div className="rounded-2xl bg-card border border-border p-4 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-[oklch(0.7_0.15_300)]" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                  AI target voor {mealLabel.toLowerCase()}
                </p>
              </div>
              <div className="flex items-center justify-around">
                {[
                  { label: "kcal", value: 263 },
                  { label: "Eiwit", value: 27 },
                  { label: "Koolh.", value: 42 },
                  { label: "Vet", value: 0 },
                ].map((t) => (
                  <div key={t.label} className="flex flex-col items-center">
                    <div className="h-11 w-14 rounded-xl bg-secondary border border-border flex items-center justify-center">
                      <span className="text-sm font-bold text-foreground font-mono">{t.value}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1.5">{t.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground text-center mt-3">Tap een waarde om aan te passen</p>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl bg-card border border-border p-4 mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-3">
                Voorkeuren (optioneel)
              </p>
              <textarea
                placeholder="bijv. vegetarisch, vis, Italiaans, snel..."
                value={aiPreferences}
                onChange={(e) => setAiPreferences(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#bad4e1] resize-none"
              />
            </div>

            <button
              onClick={() => {
                setAiGenerating(true)
                setTimeout(() => setAiGenerating(false), 2000)
              }}
              disabled={aiGenerating}
              className="w-full h-12 rounded-2xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
            >
              {aiGenerating ? (
                <>
                  <div className="h-5 w-5 border-2 border-[#1e1839]/30 border-t-[#1e1839] rounded-full animate-spin" />
                  Genereren...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Genereer recept
                </>
              )}
            </button>
          </div>
        )}

        {/* SAVED RECIPES VIEW */}
        {view === "saved" && (
          <div className="flex-1 overflow-y-auto px-5 pt-3 pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1] font-mono mb-4">
              {savedRecipes.length} {savedRecipes.length === 1 ? "recept" : "recepten"} opgeslagen
            </p>

            {savedRecipes.length === 0 ? (
              <div className="flex flex-col items-center justify-center pt-20">
                <BookmarkCheck className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-sm font-bold text-foreground font-mono mb-1">Geen recepten</p>
                <p className="text-xs text-muted-foreground text-center">Genereer eerst een AI recept om op te slaan</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {savedRecipes.map((recipe, i) => (
                  <div
                    key={recipe.id}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="rounded-2xl bg-card border border-border overflow-hidden animate-[fadeSlideUp_0.4s_ease-out_forwards] opacity-0"
                  >
                    {/*
                      TODO [Claude / Backend]:
                      Wanneer recipe.imageUrl beschikbaar is, vervang het placeholder-icoon
                      met een <Image> component:
                      {recipe.imageUrl ? (
                        <Image src={recipe.imageUrl} alt={recipe.name} width={400} height={160}
                          className="w-full h-32 object-cover" />
                      ) : ( <placeholder> )}
                    */}
                    <div className="h-28 bg-secondary/50 flex items-center justify-center relative">
                      <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center">
                        <span className="text-2xl font-bold text-muted-foreground font-mono">{recipe.name.charAt(0)}</span>
                      </div>
                      {/* Accent line */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#bad4e1]/30 to-transparent" />
                    </div>

                    <div className="p-4">
                      <h3 className="text-sm font-bold text-foreground font-mono mb-1 truncate">{recipe.name}</h3>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{recipe.description}</p>

                      <div className="flex items-center gap-3 mb-3">
                        {[
                          { label: "kcal", value: recipe.kcal, color: "#bad4e1" },
                          { label: "E", value: `${recipe.protein}g`, color: "var(--chart-4)" },
                          { label: "K", value: `${recipe.carbs}g`, color: "var(--chart-2)" },
                          { label: "V", value: `${recipe.fat}g`, color: "var(--chart-3)" },
                        ].map((m) => (
                          <div key={m.label} className="flex items-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
                            <span className="text-[11px] text-muted-foreground font-mono">{m.label} {m.value}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <button onClick={() => handleAddRecipe(recipe)}
                          className="flex-1 h-10 rounded-xl bg-[#bad4e1]/15 text-[#bad4e1] text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                          <PlusCircle className="h-3.5 w-3.5" />
                          Toevoegen
                        </button>
                        <button className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <style>{`
              @keyframes fadeSlideUp {
                from { opacity: 0; transform: translateY(12px); }
                to { opacity: 1; transform: translateY(0); }
              }
            `}</style>
          </div>
        )}

        {/* COPY MEAL VIEW */}
        {view === "copy" && (() => {
          const currentDay = pastDays[copyDayIdx]
          if (!currentDay) return null

          const toggleItem = (key: string) => {
            setSelectedCopyItems(prev => {
              const next = new Set(prev)
              if (next.has(key)) next.delete(key)
              else next.add(key)
              return next
            })
          }

          const toggleGroup = (groupLabel: string) => {
            const group = currentDay.groups.find(g => g.label === groupLabel)
            if (!group) return
            const groupKeys = group.items.map((_, i) => `${copyDayIdx}-${groupLabel}-${i}`)
            const allSelected = groupKeys.every(k => selectedCopyItems.has(k))
            setSelectedCopyItems(prev => {
              const next = new Set(prev)
              groupKeys.forEach(k => allSelected ? next.delete(k) : next.add(k))
              return next
            })
          }

          const selectAll = () => {
            const allKeys = currentDay.groups.flatMap((g) =>
              g.items.map((_, i) => `${copyDayIdx}-${g.label}-${i}`)
            )
            const allSelected = allKeys.every(k => selectedCopyItems.has(k))
            setSelectedCopyItems(allSelected ? new Set() : new Set(allKeys))
          }

          // Gather selected items for summary
          const selectedItems: PastMealItem[] = []
          currentDay.groups.forEach((g) => {
            g.items.forEach((item, i) => {
              if (selectedCopyItems.has(`${copyDayIdx}-${g.label}-${i}`)) {
                selectedItems.push(item)
              }
            })
          })

          const totalKcal = selectedItems.reduce((s, i) => s + i.kcal, 0)
          const totalP = selectedItems.reduce((s, i) => s + i.protein, 0)
          const totalC = selectedItems.reduce((s, i) => s + i.carbs, 0)
          const totalF = selectedItems.reduce((s, i) => s + i.fat, 0)

          const allDayKeys = currentDay.groups.flatMap((g) =>
            g.items.map((_, i) => `${copyDayIdx}-${g.label}-${i}`)
          )
          const allSelected = allDayKeys.length > 0 && allDayKeys.every(k => selectedCopyItems.has(k))

          return (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Day navigator */}
              <div className="px-5 pt-2 pb-3 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => { setCopyDayIdx(Math.min(copyDayIdx + 1, pastDays.length - 1)); setSelectedCopyItems(new Set()) }}
                    disabled={copyDayIdx >= pastDays.length - 1}
                    className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-foreground disabled:opacity-30 transition-all active:scale-95"
                  >
                    <ChevronLeft className="h-4.5 w-4.5" />
                  </button>
                  <div className="text-center">
                    <p className="text-sm font-bold text-foreground font-mono">{currentDay.dayLabel}</p>
                    <p className="text-[11px] text-muted-foreground">{currentDay.dateLabel}</p>
                  </div>
                  <button
                    onClick={() => { setCopyDayIdx(Math.max(copyDayIdx - 1, 0)); setSelectedCopyItems(new Set()) }}
                    disabled={copyDayIdx <= 0}
                    className="h-9 w-9 rounded-xl bg-secondary flex items-center justify-center text-foreground disabled:opacity-30 transition-all active:scale-95"
                  >
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Select all */}
                <button
                  onClick={selectAll}
                  className={`w-full h-9 rounded-xl text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] ${
                    allSelected
                      ? "bg-[#bad4e1]/15 text-[#bad4e1] border border-[#bad4e1]/30"
                      : "bg-secondary text-muted-foreground border border-border"
                  }`}
                >
                  <Copy className="h-3.5 w-3.5" />
                  {allSelected ? "Deselecteer alles" : "Selecteer alles"}
                </button>
              </div>

              {/* Meal groups */}
              <div className="flex-1 overflow-y-auto px-5 pb-32">
                {currentDay.groups.map((group, gIdx) => {
                  const groupKeys = group.items.map((_, i) => `${copyDayIdx}-${group.label}-${i}`)
                  const groupAllSelected = groupKeys.every(k => selectedCopyItems.has(k))
                  const groupSomeSelected = groupKeys.some(k => selectedCopyItems.has(k))

                  return (
                    <div
                      key={group.label}
                      className="mb-4"
                      style={{ animationDelay: `${gIdx * 80}ms`, animation: "fadeSlideUp 0.4s ease-out forwards", opacity: 0 }}
                    >
                      {/* Group header */}
                      <button
                        onClick={() => toggleGroup(group.label)}
                        className="flex items-center gap-2 mb-2 w-full text-left group"
                      >
                        <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center transition-all ${
                          groupAllSelected
                            ? "bg-[#bad4e1] border-[#bad4e1]"
                            : groupSomeSelected
                              ? "border-[#bad4e1]/50 bg-[#bad4e1]/20"
                              : "border-border bg-transparent"
                        }`}>
                          {(groupAllSelected || groupSomeSelected) && (
                            <svg className="h-3 w-3 text-[#1e1839]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              {groupAllSelected
                                ? <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                : <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                              }
                            </svg>
                          )}
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground font-mono group-hover:text-foreground transition-colors">
                          {group.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60 font-mono">{group.items.length}</span>
                      </button>

                      {/* Items */}
                      <div className="flex flex-col gap-1.5">
                        {group.items.map((item, iIdx) => {
                          const itemKey = `${copyDayIdx}-${group.label}-${iIdx}`
                          const isSelected = selectedCopyItems.has(itemKey)

                          return (
                            <button
                              key={iIdx}
                              onClick={() => toggleItem(itemKey)}
                              className={`flex items-center gap-3 p-3 rounded-xl text-left transition-all active:scale-[0.98] ${
                                isSelected
                                  ? "bg-[#bad4e1]/10 border border-[#bad4e1]/30"
                                  : "bg-card border border-border hover:border-border/80"
                              }`}
                            >
                              <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                                isSelected ? "bg-[#bad4e1] border-[#bad4e1]" : "border-border"
                              }`}>
                                {isSelected && (
                                  <svg className="h-3 w-3 text-[#1e1839]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className={`text-sm font-semibold block truncate transition-colors ${isSelected ? "text-foreground" : "text-foreground/80"}`}>
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[11px] text-[#bad4e1] font-mono font-semibold">{item.kcal}</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">E{item.protein}g</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">K{item.carbs}g</span>
                                  <span className="text-[10px] text-muted-foreground font-mono">V{item.fat}g</span>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Fixed bottom bar with selection summary */}
              {selectedItems.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-4 bg-gradient-to-t from-background via-background to-transparent">
                  {/* Summary */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-xs text-muted-foreground font-mono">{selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#bad4e1] font-mono font-semibold">{totalKcal} kcal</span>
                      <span className="text-[10px] text-muted-foreground font-mono">E{totalP}g</span>
                      <span className="text-[10px] text-muted-foreground font-mono">K{totalC}g</span>
                      <span className="text-[10px] text-muted-foreground font-mono">V{totalF}g</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const itemsToAdd = selectedItems.map((item) => ({
                        name: item.name,
                        brand: "",
                        amount: 1,
                        unit: "stuks",
                        kcal: item.kcal,
                        protein: item.protein,
                        carbs: item.carbs,
                        fat: item.fat,
                      }))
                      console.log("[v0] copy button clicked, items:", itemsToAdd.length, "staggered?", !!onAddItemsStaggered)
                      if (onAddItemsStaggered && itemsToAdd.length > 1) {
                        onAddItemsStaggered(itemsToAdd)
                      } else {
                        itemsToAdd.forEach((item) => onAddItem(item))
                      }
                      resetAndClose()
                    }}
                    className="w-full h-12 rounded-2xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  >
                    <Copy className="h-4.5 w-4.5" />
                    Kopieer {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""}
                  </button>
                </div>
              )}

              <style>{`
                @keyframes fadeSlideUp {
                  from { opacity: 0; transform: translateY(12px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}</style>
            </div>
          )
        })()}
      </div>
    </div>
  )
}
