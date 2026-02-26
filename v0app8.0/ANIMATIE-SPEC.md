# Evotion Animatie Specificatie

Alle animaties in de app volgen deze regels. Houd je hier EXACT aan.
Verander NOOIT de timing, easing of duur zonder expliciete toestemming.

---

## 1. Geanimeerde Kcal/Macro Tellers (`useAnimatedNumber`)

Wanneer voeding wordt toegevoegd of verwijderd, moeten alle getallen (kcal, eiwit, koolhydraten, vet) vloeiend op- of aflopen. NOOIT direct springen.

### Hook: `hooks/use-animated-number.ts`

```typescript
import { useState, useEffect, useRef } from "react"

export function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(target)
  const prevTarget = useRef(target)
  const rafId = useRef<number>(0)

  useEffect(() => {
    const from = prevTarget.current
    const to = target
    prevTarget.current = target

    const diff = Math.abs(to - from)
    if (diff === 0) return

    const duration = Math.min(1000 + diff * 6, 3500)
    const startTime = performance.now()

    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 5)
    }

    const animate = (now: number) => {
      const elapsed = now - startTime
      const rawProgress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOut(rawProgress)
      const current = Math.round(from + (to - from) * easedProgress)
      setDisplay(current)
      if (rawProgress < 1) {
        rafId.current = requestAnimationFrame(animate)
      }
    }

    rafId.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId.current)
  }, [target])

  return display
}
```

### Regels:
- **Duur:** `Math.min(1000 + verschil * 6, 3500)` -- schaalt: +10=1060ms, +100=1600ms, +500=3000ms, +800+=3500ms
- **Easing:** `1 - (1-t)^5` -- power 5 ease-out, single smooth curve
- **VERBODEN:** Twee-fasen curves, knikken, stops halverwege
- **VERBODEN:** CSS `transition` op SVG ring `<circle>` strokeDashoffset -- ring wordt ALLEEN aangestuurd door de JS geanimeerde waarde
- **Alle tellers starten TEGELIJK** -- header kcal, grote kcal ring, eiwit ring, koolhydraten ring, vet ring

### Gebruik in componenten:
```tsx
// Header (voeding-header.tsx):
const animatedKcal = useAnimatedNumber(currentKcal)
// Render: {animatedKcal}

// Grote kcal ring (macro-rings.tsx):
const animatedKcal = useAnimatedNumber(kcal.current)
// Geef animatedKcal door aan ZOWEL het getal ALS de CircleRing component

// Kleine macro ringen (macro-rings.tsx):
function AnimatedCircleRing(props) {
  const animatedCurrent = useAnimatedNumber(props.current)
  return <CircleRing {...props} current={animatedCurrent} />
}

function AnimatedMacroValue({ value, className }) {
  const animated = useAnimatedNumber(value)
  return <span className={className}>{animated}</span>
}
```

### CircleRing component:
De `<circle>` die de voortgang toont mag GEEN van deze hebben:
- `className="transition-all ..."` 
- `className="transition-[stroke-dashoffset] ..."`
- Enige CSS transition op strokeDashoffset

De animatie komt 100% vanuit de JS hook via `current` prop.

---

## 2. Voedingsitem Toevoegen -- Smooth Entrance

Wanneer een voedingsitem wordt toegevoegd, moet het NIET direct verschijnen. Het item expandeert smooth van collapsed naar zichtbaar.

### Bestand: `components/voeding/meal-section.tsx`

### Hoe het werkt:
1. Nieuw item wordt aan de array toegevoegd
2. `useEffect` detecteert het nieuwe ID (niet in `prevItemIds` ref)
3. Het item rendert EERST in collapsed state: `max-height: 0px`, `opacity: 0`, `translateY(12px)`
4. Na double `requestAnimationFrame` wordt het ID toegevoegd aan `enteredIds` Set
5. CSS transition animeert naar `max-height: 120px`, `opacity: 1`, `translateY(0)`

### Implementatie:

**State:**
```tsx
const [enteredIds, setEnteredIds] = useState<Set<string>>(() => new Set(items.map(i => i.id)))
const prevItemIds = useRef<Set<string>>(new Set(items.map(i => i.id)))
```

**Effect (detecteert nieuwe items):**
```tsx
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
    // Double rAF: frame 1 rendert collapsed, frame 2 triggert transition
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
```

**Op het item element:**
```tsx
const isNew = !enteredIds.has(item.id)

<div
  className="relative overflow-hidden"
  style={{
    maxHeight: isNew ? "0px" : "120px",
    opacity: isNew ? 0 : 1,
    transform: isNew ? "translateY(12px)" : "translateY(0)",
    transitionProperty: "max-height, opacity, transform",
    transitionDuration: "700ms",
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
  }}
>
```

### Regels:
- **Duur:** 700ms
- **Easing:** `cubic-bezier(0.16, 1, 0.3, 1)` -- "ease-out expo", zeer smooth
- **translateY:** 12px (van onder naar positie)
- **max-height:** 0px naar 120px
- **overflow: hidden** op het item is VERPLICHT
- **Double requestAnimationFrame** is VERPLICHT -- zonder dit start de transition niet correct
- Bestaande items bij eerste render worden METEEN in `enteredIds` gezet (geen animatie bij page load)

---

## 3. Voedingsitem Verwijderen -- Smooth Collapse

Wanneer een voedingsitem wordt verwijderd, collapst het smooth omhoog. NIET direct verdwijnen.

### Uitzondering: Als het item het ENIGE item in de maaltijd is, direct verwijderen zonder animatie.

### Hoe het werkt:
1. User swipt en tikt verwijder-knop
2. `removingId` state wordt gezet
3. CSS transition animeert: `max-height: 120px -> 0px` en `opacity: 1 -> 0`
4. Na 400ms timeout wordt het item daadwerkelijk uit de state verwijderd

### Implementatie:

**Handler:**
```tsx
const handleRemove = useCallback((id: string) => {
  // Geen animatie als het het enige item is
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
```

**Op het item element:**
```tsx
const isRemoving = removingId === item.id

<div
  className="relative overflow-hidden"
  style={{
    maxHeight: isRemoving ? "0px" : "120px",
    opacity: isRemoving ? 0 : 1,
    transitionProperty: "max-height, opacity",
    transitionDuration: "400ms",
    transitionTimingFunction: "ease-out",
  }}
>
```

### Regels:
- **Duur:** 400ms
- **Easing:** ease-out (CSS native)
- **Geen animatie bij enig item:** als `items.length <= 1`, direct verwijderen
- De opacity fade en height collapse gebeuren TEGELIJK
- setTimeout moet EXACT matchen met de CSS transition duur (400ms)

---

## 4. Kopieer Maaltijd -- Staggered Toevoeging

Wanneer meerdere items worden gekopieerd van een vorige dag, verschijnen ze een voor een. NIET allemaal tegelijk.

### Bestand: `app/voeding/page.tsx`

### Hoe het werkt:
1. Sheet roept `onAddItemsStaggered(items)` aan bij meerdere items
2. Eerste item verschijnt na 400ms (sheet moet eerst dicht)
3. Elk volgend item 300ms later
4. Elk item triggert individueel de entrance-animatie (sectie 2) en de kcal teller (sectie 1)

### Implementatie:

**Handler in voeding page:**
```tsx
const handleAddItemsStaggered = (mealKey: string, items: Omit<FoodItem, "id" | "fromSchema">[]) => {
  items.forEach((item, idx) => {
    const delay = 400 + idx * 300
    setTimeout(() => {
      setMeals((prev) => ({
        ...prev,
        [mealKey]: [...(prev[mealKey] || []), {
          ...item,
          id: `stagger-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          fromSchema: false,
        }],
      }))
    }, delay)
  })
}
```

**In de AddFoodSheet (kopieer knop):**
```tsx
if (onAddItemsStaggered && itemsToAdd.length > 1) {
  onAddItemsStaggered(itemsToAdd)
} else {
  itemsToAdd.forEach((item) => onAddItem(item))
}
```

### Regels:
- **Initiele delay:** 400ms (wacht tot sheet dicht is)
- **Delay tussen items:** 300ms
- **ID generatie:** `stagger-${Date.now()}-${random}` -- MOET uniek zijn, anders detecteert de entrance-animatie ze niet
- ALLEEN gebruiken bij kopieer maaltijd (meerdere items)
- Bij enkel item (zoeken, handmatig, AI recept) gewoon direct `onAddItem`

---

## 5. Staggered FadeSlideUp (Statische Lijsten)

Voor lijsten die in beeld komen bij navigatie (kopieer maaltijd groepen, opgeslagen recepten, categorieen). Dit is ANDERS dan sectie 2 -- dit is voor statische content die bij het openen van een view verschijnt.

### CSS keyframe:
```css
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Toepassing:
```tsx
<div
  style={{
    animationDelay: `${index * 80}ms`,
    animation: "fadeSlideUp 0.4s ease-out forwards",
    opacity: 0,
  }}
>
```

### Regels:
- **Duur per item:** 400ms
- **Delay tussen items:** 80ms
- **translateY:** 12px
- **Easing:** ease-out
- **Start opacity:** 0 (via inline style, NIET via de keyframe -- anders flikkert het)
- `animation-fill-mode: forwards` (via "forwards" in shorthand) -- zodat het op opacity 1 blijft

---

## 6. Sheet Slide-Up (Add Food Sheet)

De bottom sheet schuift van onder het scherm omhoog.

### Regels:
- **Overlay:** `opacity-0` naar `opacity-100`, 300ms, ease-out
- **Sheet:** `translate-y-full` naar `translate-y-0`, 300ms, ease-out (Tailwind `transition-transform duration-300`)
- **Sluiten:** omgekeerd, na 300ms unmount
- Sheet hoogte: `max-h-[90vh]`, afgeronde bovenkant: `rounded-t-3xl`

---

## Timing Samenvatting

| Animatie | Duur | Easing | Delay |
|---|---|---|---|
| Kcal/macro teller oplopen | 1000-3500ms (schaalt) | `1-(1-t)^5` JS | geen |
| Item entrance (expand) | 700ms | `cubic-bezier(0.16, 1, 0.3, 1)` CSS | double rAF |
| Item collapse (verwijder) | 400ms | ease-out CSS | geen |
| Staggered kopieer items | n.v.t. per item | n.v.t. | 400ms + idx*300ms |
| FadeSlideUp lijst items | 400ms | ease-out CSS | idx*80ms |
| Sheet open/close | 300ms | ease-out CSS | geen |

---

## ABSOLUUT VERBODEN

1. **GEEN** CSS `transition` op SVG `<circle>` strokeDashoffset -- alleen JS animatie via hook
2. **GEEN** twee-fasen easing curves (veroorzaakt zichtbare knik/stop halverwege)
3. **GEEN** `transition-all` op elementen die door `useAnimatedNumber` worden aangestuurd
4. **GEEN** directe state-wijzigingen zonder animatie bij toevoegen/verwijderen van voedingsitems
5. **GEEN** items die "poppen" -- alles moet smooth in/uit transitioneren
6. **GEEN** andere duur/easing dan hierboven gespecificeerd zonder expliciete toestemming
