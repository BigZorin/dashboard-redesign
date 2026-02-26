"use client"

import { useState } from "react"
import { X, Search, ScanBarcode, PenSquare, ChevronRight, ArrowLeft } from "lucide-react"
import type { FoodItem } from "./meal-section"

// Dummy search database
const foodDatabase = [
  { name: "Franse Magere Kwark", brand: "Milbona", kcalPer100: 52, proteinPer100: 9, carbsPer100: 5, fatPer100: 1, defaultPortion: 300 },
  { name: "Franse kwark mager", brand: "Jumbo", kcalPer100: 59, proteinPer100: 9, carbsPer100: 4, fatPer100: 1, defaultPortion: 300 },
  { name: "Magere kwark Aardbei", brand: "Optimel", kcalPer100: 45, proteinPer100: 7, carbsPer100: 4, fatPer100: 0, defaultPortion: 300 },
  { name: "Havermout", brand: "Quaker", kcalPer100: 370, proteinPer100: 13, carbsPer100: 60, fatPer100: 7, defaultPortion: 50 },
  { name: "Volkoren brood", brand: "Bolletje", kcalPer100: 247, proteinPer100: 10, carbsPer100: 41, fatPer100: 3, defaultPortion: 35 },
  { name: "Kipfilet", brand: "Kip", kcalPer100: 110, proteinPer100: 24, carbsPer100: 0, fatPer100: 1, defaultPortion: 150 },
  { name: "Rijst (gekookt)", brand: "", kcalPer100: 130, proteinPer100: 3, carbsPer100: 28, fatPer100: 0, defaultPortion: 200 },
  { name: "Pindakaas", brand: "Calvé", kcalPer100: 623, proteinPer100: 22, carbsPer100: 14, fatPer100: 51, defaultPortion: 15 },
  { name: "Banaan", brand: "", kcalPer100: 89, proteinPer100: 1, carbsPer100: 23, fatPer100: 0, defaultPortion: 120 },
  { name: "Ei (gekookt)", brand: "", kcalPer100: 155, proteinPer100: 13, carbsPer100: 1, fatPer100: 11, defaultPortion: 60 },
]

interface AddFoodSheetProps {
  isOpen: boolean
  onClose: () => void
  mealLabel: string
  onAddItem: (item: Omit<FoodItem, "id" | "fromSchema">) => void
}

type SheetView = "options" | "search" | "detail"

interface SelectedProduct {
  name: string
  brand: string
  kcalPer100: number
  proteinPer100: number
  carbsPer100: number
  fatPer100: number
  defaultPortion: number
}

export function AddFoodSheet({ isOpen, onClose, mealLabel, onAddItem }: AddFoodSheetProps) {
  const [view, setView] = useState<SheetView>("options")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<SelectedProduct | null>(null)
  const [portion, setPortion] = useState("")
  const [quantity, setQuantity] = useState("1")

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

    // Reset
    setView("options")
    setSearchQuery("")
    setSelectedProduct(null)
    onClose()
  }

  const handleBack = () => {
    if (view === "detail") setView("search")
    else if (view === "search") { setView("options"); setSearchQuery("") }
    else onClose()
  }

  const handleClose = () => {
    setView("options")
    setSearchQuery("")
    setSelectedProduct(null)
    onClose()
  }

  // Calculate totals for detail view
  const portionG = parseFloat(portion) || 0
  const qty = parseFloat(quantity) || 1
  const multiplier = (portionG * qty) / 100
  const totals = selectedProduct ? {
    kcal: Math.round(selectedProduct.kcalPer100 * multiplier),
    protein: Math.round(selectedProduct.proteinPer100 * multiplier),
    carbs: Math.round(selectedProduct.carbsPer100 * multiplier),
    fat: Math.round(selectedProduct.fatPer100 * multiplier),
  } : { kcal: 0, protein: 0, carbs: 0, fat: 0 }

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative mt-auto w-full max-w-md mx-auto h-[85vh] flex flex-col bg-background rounded-t-3xl animate-in slide-in-from-bottom duration-300 overflow-hidden">
        {/* Sheet header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0 bg-[#1e1839]">
          <button onClick={handleBack} className="h-8 w-8 flex items-center justify-center text-foreground">
            {view === "options" ? <X className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </button>
          <h2 className="text-sm font-bold text-foreground font-mono">
            {view === "options" && "Voeding toevoegen"}
            {view === "search" && "Zoek voeding"}
            {view === "detail" && "Product details"}
          </h2>
          <div className="w-8" />
        </div>

        {/* OPTIONS VIEW */}
        {view === "options" && (
          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-8">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1] font-mono mb-4">
              {mealLabel}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setView("search")}
                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border text-left hover:border-[#bad4e1]/30 transition-colors"
              >
                <div className="h-11 w-11 rounded-xl bg-[#bad4e1]/15 flex items-center justify-center shrink-0">
                  <Search className="h-5 w-5 text-[#bad4e1]" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground font-mono">Zoeken</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Zoek in de voedingsdatabase</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border text-left hover:border-[#bad4e1]/30 transition-colors opacity-60">
                <div className="h-11 w-11 rounded-xl bg-chart-3/15 flex items-center justify-center shrink-0">
                  <ScanBarcode className="h-5 w-5 text-chart-3" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground font-mono">Barcode scannen</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Scan het etiket van een product</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>

              <button className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border text-left hover:border-[#bad4e1]/30 transition-colors opacity-60">
                <div className="h-11 w-11 rounded-xl bg-chart-4/15 flex items-center justify-center shrink-0">
                  <PenSquare className="h-5 w-5 text-chart-4" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-semibold text-foreground font-mono">Handmatig invoeren</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Voer voedingswaarden zelf in</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {/* SEARCH VIEW */}
        {view === "search" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search input */}
            <div className="px-5 py-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Zoek een product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#bad4e1] font-sans"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {filteredResults.map((product, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-card/50 transition-colors border-b border-border/50"
                >
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-muted-foreground font-mono">
                      {product.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-semibold text-foreground block truncate">{product.name}</span>
                    {product.brand && (
                      <span className="text-xs text-muted-foreground">{product.brand}</span>
                    )}
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
            {/* Product name */}
            <div className="text-center mb-6">
              <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-bold text-muted-foreground font-mono">
                  {selectedProduct.name.charAt(0)}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground font-mono">{selectedProduct.name}</h3>
              {selectedProduct.brand && (
                <p className="text-sm text-muted-foreground">{selectedProduct.brand}</p>
              )}
            </div>

            {/* Per 100g */}
            <div className="rounded-2xl bg-card border border-border p-4 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-2">Per 100g</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground font-mono">{selectedProduct.kcalPer100} kcal</span>
                <span className="text-sm text-muted-foreground font-mono">E {selectedProduct.proteinPer100}g</span>
                <span className="text-sm text-muted-foreground font-mono">K {selectedProduct.carbsPer100}g</span>
                <span className="text-sm text-muted-foreground font-mono">V {selectedProduct.fatPer100}g</span>
              </div>
            </div>

            {/* Portion size */}
            <div className="rounded-2xl bg-card border border-border p-4 mb-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-3">Portiegrootte</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="number"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#bad4e1]"
                  />
                </div>
                <span className="text-muted-foreground font-mono">x</span>
                <div className="w-20">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl bg-secondary border border-border text-foreground font-mono font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#bad4e1]"
                  />
                </div>
              </div>
              <div className="mt-2">
                <span className="inline-flex px-2.5 py-1 rounded-lg bg-secondary text-xs text-muted-foreground">
                  Standaardportie: {selectedProduct.defaultPortion} gram
                </span>
              </div>
            </div>

            {/* Totals */}
            <div className="rounded-2xl bg-card border border-border p-4 mb-6">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-3">Totale voedingswaarden</p>
              <div className="flex items-center justify-around">
                {[
                  { label: "kcal", value: totals.kcal, color: "#bad4e1" },
                  { label: "Eiwit", value: totals.protein, color: "#bad4e1" },
                  { label: "Koolh.", value: totals.carbs, color: "oklch(0.75 0.18 80)" },
                  { label: "Vet", value: totals.fat, color: "oklch(0.6 0.2 25)" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col items-center">
                    <div className="relative">
                      <svg width={52} height={52} viewBox="0 0 52 52">
                        <circle cx={26} cy={26} r={22} fill="none" stroke="currentColor" strokeWidth={5} className="text-secondary" />
                        <circle cx={26} cy={26} r={22} fill="none" stroke={item.color} strokeWidth={5}
                          strokeDasharray={`${(item.value / (item.label === "kcal" ? 3200 : 200)) * 138} 138`}
                          strokeLinecap="round" transform="rotate(-90 26 26)" className="transition-all duration-500"
                        />
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

            {/* Add button */}
            <button
              onClick={handleAdd}
              className="w-full h-12 rounded-2xl bg-[#bad4e1] text-[#1e1839] font-bold font-mono flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            >
              <PlusCircle className="h-5 w-5" />
              Toevoegen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
