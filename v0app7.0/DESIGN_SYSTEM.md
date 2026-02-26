# Evotion App - Design System & Styling Guide

> Dit document beschrijft het volledige design system van de Evotion fitness app.
> Gebruik dit als referentie bij het bouwen van nieuwe schermen en componenten.

---

## 1. Brand Kleuren

| Naam | Hex | Gebruik |
|------|-----|---------|
| **Evotion Dark** | `#1e1839` | Donker paars - wordt gebruikt als foreground op lichte accenten, tekst op primaire buttons |
| **Evotion Ice** | `#bad4e1` | Licht ijs-blauw - primaire accent kleur op donkere achtergronden |

### Kleurregels
- `#bad4e1` is de **primaire accent kleur** (vergelijkbaar met hoe een "brand green" of "brand blue" werkt)
- `#1e1839` wordt gebruikt als **tekst/foreground op elementen met `#bad4e1` achtergrond** (bijv. actieve states, buttons)
- De app is **dark mode by default** - alle achtergronden zijn donker
- Gebruik **nooit** `#1e1839` als zichtbare lijn of tekst op donkere achtergrond (te weinig contrast)

---

## 2. Design Tokens (CSS Custom Properties)

Gedefinieerd in `app/globals.css` via Tailwind CSS v4.

### Achtergronden
```
--background: oklch(0.13 0.005 270)   /* Diep donker blauw-zwart - pagina achtergrond */
--card: oklch(0.18 0.005 270)          /* Iets lichter - kaart achtergronden */
--secondary: oklch(0.22 0.008 270)     /* Nog lichter - secondaire achtergrond, input velden */
--muted: oklch(0.22 0.008 270)         /* Zelfde als secondary - gedempte elementen */
```

### Tekst
```
--foreground: oklch(0.97 0 0)              /* Bijna wit - primaire tekst */
--card-foreground: oklch(0.97 0 0)         /* Bijna wit - tekst op kaarten */
--secondary-foreground: oklch(0.85 0 0)    /* Lichtgrijs - secondaire tekst */
--muted-foreground: oklch(0.6 0 0)         /* Grijs - gedempte tekst, labels */
```

### Accenten
```
--primary: #bad4e1                /* Ijs-blauw - primaire accent */
--primary-foreground: #1e1839     /* Donker paars - tekst OP primaire accent */
--accent: #bad4e1                 /* Zelfde als primary */
--accent-foreground: #1e1839      /* Zelfde als primary-foreground */
--ring: #bad4e1                   /* Focus ring kleur */
```

### Borders & Input
```
--border: oklch(0.25 0.008 270)   /* Subtiele border kleur */
--input: oklch(0.25 0.008 270)    /* Input border kleur */
```

### Chart kleuren
```
--chart-1: #bad4e1                     /* Primaire chart kleur (ijs-blauw) */
--chart-2: oklch(0.7 0.15 200)        /* Teal/cyaan */
--chart-3: oklch(0.75 0.18 80)        /* Goud/amber */
--chart-4: oklch(0.6 0.2 25)          /* Koraal/rood */
--chart-5: oklch(0.7 0.15 300)        /* Paars/violet */
```

### Overig
```
--radius: 1rem                    /* Basis border-radius (16px) */
--destructive: oklch(0.65 0.2 25) /* Rood - foutmeldingen, negatieve trends */
```

---

## 3. Typografie

### Fonts (via Next.js `next/font/google`)

| Font | Google Font naam | Tailwind class | CSS variable | Gebruik |
|------|-----------------|----------------|--------------|---------|
| **Inter** | `Inter` | `font-sans` | `--font-inter` | Alle body tekst, beschrijvingen, labels, subtitels |
| **Space Grotesk** | `Space_Grotesk` | `font-mono` | `--font-space-grotesk` | Alle headings, titels, cijfers, datums, namen, getallen |

**Vuistregel:** Als het een *getal*, *titel*, *heading* of *naam* is -> `font-mono` (Space Grotesk). Als het *beschrijvende tekst* is -> `font-sans` (Inter).

### Font configuratie in layout.tsx
```tsx
import { Inter, Space_Grotesk } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

// Body class op <body>:
// `${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`
```

### Font mapping in globals.css (Tailwind v4)
```css
@theme inline {
  --font-sans: var(--font-inter), 'Inter', system-ui, sans-serif;
  --font-mono: var(--font-space-grotesk), 'Space Grotesk', monospace;
}
```
Dit koppelt `font-sans` aan Inter en `font-mono` aan Space Grotesk. De body is standaard `font-sans`, voeg `font-mono` toe aan specifieke elementen.

### Typografie patronen
| Element | Classes | Voorbeeld |
|---------|---------|-----------|
| Sectie titel | `text-sm font-semibold text-foreground font-mono uppercase tracking-wider` | "DAGELIJKSE CHECK-IN" |
| Grote cijfers | `text-3xl font-bold text-foreground font-mono tracking-tight` | "131.0" |
| Medium cijfers | `text-2xl font-bold text-foreground font-mono` | "0" (kcal) |
| Dag nummer | `text-lg font-bold font-mono` | "21" |
| Component titel | `text-base font-bold text-foreground font-mono` | "Upperbody" |
| Naam heading | `text-lg font-bold text-foreground font-mono tracking-tight` | "Michael" |
| Label tekst | `text-[10px] font-semibold uppercase tracking-wider` | "VOLGENDE TRAINING" |
| Body tekst | `text-xs text-muted-foreground` | "Goedemiddag" |
| Eenheid tekst | `text-base text-muted-foreground` | "kg" |
| Kleine waarde | `text-xs text-muted-foreground font-mono` | "0g / 160" |

---

## 4. Layout Structuur

### Pagina container
```tsx
<div className="min-h-screen bg-background max-w-md mx-auto relative">
```
- Mobile-first: `max-w-md` (448px) gecentreerd
- Altijd `bg-background` als pagina achtergrond

### Content flow
```tsx
<main className="flex flex-col gap-4 pb-28 pt-4">
```
- `gap-4` tussen secties
- `pb-28` voor ruimte onder de bottom nav
- `pt-4` boven de content (onder header)

### Sectie kaarten
```tsx
<section className="mx-5 rounded-2xl bg-card p-5 border border-border">
```
- `mx-5` horizontale marge (20px)
- `rounded-2xl` grote afronding (1rem + 4px)
- `bg-card` kaart achtergrond
- `p-5` padding (20px)
- `border border-border` subtiele rand

### Klikbare kaarten (zonder border card)
```tsx
<button className="w-full group relative overflow-hidden rounded-2xl bg-card border border-border p-5 text-left transition-all hover:border-[#bad4e1]/30">
  <div className="absolute inset-0 bg-gradient-to-r from-[#bad4e1]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
  <div className="relative ...">
    {/* content */}
  </div>
</button>
```
- Subtiele hover gradient overlay
- Border licht op bij hover

---

## 5. Component Patronen

### Header
- **Structuur:** Flex row, `justify-between`, padding `px-5 pt-14 pb-2`
- **Avatar:** `h-11 w-11 rounded-full bg-[#bad4e1]` met donkere tekst (`text-[#1e1839]`)
- **Status dot:** `h-3.5 w-3.5 rounded-full bg-[#bad4e1] border-2 border-background`
- **Action buttons:** `h-10 w-10 rounded-xl bg-secondary` met `text-muted-foreground`
- **Notification dot:** `h-2 w-2 rounded-full bg-[#bad4e1]` (absoluut gepositioneerd)

### Dagelijkse Check-in
- **Actieve dag:** `bg-[#bad4e1] text-[#1e1839] shadow-lg shadow-[#bad4e1]/25`
- **Gecheckte dag:** `bg-[#bad4e1]/15 text-foreground`
- **Inactieve dag:** `bg-secondary text-muted-foreground`
- **Check icoon:** `text-[#bad4e1]` (lucide `Check`, h-3 w-3)
- **Score indicator:** `h-1.5 w-1.5 rounded-full bg-[#bad4e1]` + `text-[#bad4e1]`

### Training kaart
- **Icon container:** `h-12 w-12 rounded-xl bg-[#bad4e1]/15` met `text-[#bad4e1]`
- **Label:** `text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1]`
- **Chevron hover:** `group-hover:text-[#bad4e1]`

### Voeding kaart
- **Circulaire progressie:** SVG met `r="46"`, `strokeWidth="8"`
  - Track: `text-secondary`
  - Progress: `text-primary` (= `#bad4e1`)
  - strokeDasharray berekening: `(current / target) * 289`
- **Macro balken:** `h-2 rounded-full bg-secondary` (track) met gekleurde fill
  - Eiwit: `bg-chart-4` (koraal/rood)
  - Koolh.: `bg-chart-2` (teal/cyaan)
  - Vet: `bg-chart-3` (goud/amber)

### Gewichtsverloop (Grafiek) - VOLLEDIG RECEPT

De grafiek gebruikt **Recharts** (`recharts` package). Hieronder staat het exacte recept:

#### Benodigde imports
```tsx
"use client"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
```

#### Chart configuratie - stap voor stap

**1. Container:** Wrap de chart in een `<ResponsiveContainer>` voor responsiviteit:
```tsx
<div className="h-44 -mx-2">
  <ResponsiveContainer width="100%" height="100%">
    <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
```
- `h-44` = 176px hoogte
- `-mx-2` = laat de chart iets over de kaart padding heen lopen
- `left: -20` margin om Y-axis labels niet af te snijden

**2. Gradient fill (de transparante kleurvulling onder de lijn):**
```tsx
<defs>
  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor="#bad4e1" stopOpacity={0.3} />
    <stop offset="100%" stopColor="#bad4e1" stopOpacity={0} />
  </linearGradient>
</defs>
```
- Dit maakt een verticale gradient van `#bad4e1` met 30% opacity bovenaan naar 0% onderaan
- Geeft een "glow" effect onder de lijn

**3. Grid (horizontale stippellijnen):**
```tsx
<CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.008 270)" vertical={false} />
```
- `strokeDasharray="3 3"` = stippellijn patroon
- `vertical={false}` = ALLEEN horizontale lijnen, geen verticale
- Kleur = `--border` token waarde

**4. X-as (datums onderaan):**
```tsx
<XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} dy={8} />
```
- `axisLine={false}` + `tickLine={false}` = geen lijn, geen streepjes
- `fill: "oklch(0.6 0 0)"` = `--muted-foreground` kleur
- `dy={8}` = 8px naar beneden voor ademruimte

**5. Y-as (gewicht links):**
```tsx
<YAxis domain={[121, 133]} axisLine={false} tickLine={false} tick={{ fill: "oklch(0.6 0 0)", fontSize: 11 }} dx={-4} />
```
- `domain` = min/max bereik, stel in op basis van data range
- `dx={-4}` = 4px naar links

**6. Tooltip (hover popup):**
```tsx
<Tooltip
  contentStyle={{
    background: "oklch(0.22 0.008 270)",
    border: "1px solid oklch(0.25 0.008 270)",
    borderRadius: "12px",
    color: "oklch(0.97 0 0)",
    fontSize: "12px",
    padding: "8px 12px",
  }}
  labelStyle={{ color: "oklch(0.6 0 0)" }}
  formatter={(value: number) => [`${value} kg`, "Gewicht"]}
/>
```
- Achtergrond = `--secondary`, border = `--border`, tekst = `--foreground`
- Afgeronde hoeken, compacte padding

**7. De lijn zelf (Area component) - BELANGRIJK:**
```tsx
<Area
  type="monotone"
  dataKey="weight"
  stroke="#bad4e1"
  strokeWidth={2.5}
  fill="url(#weightGradient)"
  dot={{ r: 4, fill: "#bad4e1", stroke: "oklch(0.18 0.005 270)", strokeWidth: 2 }}
  activeDot={{ r: 6, fill: "#bad4e1", stroke: "oklch(0.18 0.005 270)", strokeWidth: 2 }}
/>
```
- `type="monotone"` = **VLOEIENDE LIJN** (geen scherpe hoeken, Bezier curves)
- `stroke="#bad4e1"` = lijnkleur is de primaire accent
- `strokeWidth={2.5}` = medium-dikke lijn
- `fill="url(#weightGradient)"` = verwijst naar de gradient `<defs>` hierboven
- `dot` = altijd zichtbare punten op datapunten:
  - `r: 4` = straal 4px
  - `fill: "#bad4e1"` = gevuld met accent kleur
  - `stroke: "oklch(0.18 0.005 270)"` = rand in `--card` kleur (maakt een "ring" effect)
  - `strokeWidth: 2` = 2px rand
- `activeDot` = hover/actieve punt:
  - `r: 6` = groter (6px straal) bij hover
  - Zelfde kleuren als `dot`

#### Volledig data format
```tsx
const data = [
  { date: "15 feb", weight: 125.0 },
  { date: "16 feb", weight: 125.5 },
  // ...
]
```

#### Trend badge boven de chart
```tsx
<div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-destructive/15">
  <TrendingUp className="h-3 w-3 text-destructive" />
  <span className="text-xs font-semibold text-destructive">+6.0</span>
</div>
```
- Stijging bij afval-doel = `destructive` (rood, negatief)
- Daling bij afval-doel = gebruik een groene kleur (positief)
- Lucide `TrendingUp` of `TrendingDown` icoon

### Bottom Navigation
- **Container:** Fixed bottom, `mx-4 mb-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border`
- **Actief item:** `text-[#bad4e1]` met notification dot `bg-[#bad4e1]`
- **Inactief item:** `text-muted-foreground hover:text-foreground`
- **Icoon grootte:** `h-5 w-5`
- **Label:** `text-[10px] font-medium`

---

## 6. Iconen

Gebruik **Lucide React** (`lucide-react`) voor alle iconen.

### Gebruikte iconen per component
- **Header:** `Bell`, `MessageCircle`
- **Check-in:** `Check`
- **Training:** `Dumbbell`, `ChevronRight`, `Clock`
- **Gewicht:** `TrendingUp`
- **Bottom nav:** `Home`, `Dumbbell`, `UtensilsCrossed`, `BookOpen`, `LayoutGrid`

### Icoon styling patronen
- Standaard muted: `text-muted-foreground`
- Op accent achtergrond: `text-[#bad4e1]`
- Op primaire achtergrond: `text-[#1e1839]` (of `text-white` voor actieve dag check)
- Hover state: `group-hover:text-[#bad4e1]`

---

## 7. Tech Stack

| Technologie | Versie | Doel |
|-------------|--------|------|
| **Next.js** | 16.1.6 | App Router framework |
| **React** | 19.2.4 | UI library |
| **Tailwind CSS** | v4.2.0 | Utility-first CSS |
| **TypeScript** | 5.7.3 | Type safety |
| **Recharts** | 2.15.0 | Charts/grafieken |
| **Lucide React** | 0.564.0 | Iconen |
| **Radix UI** | diverse | Accessible UI primitives |
| **shadcn/ui** | - | Component library (basis) |
| **tw-animate-css** | 1.3.3 | Animaties |

### Bestandsstructuur
```
app/
  globals.css          # Design tokens + Tailwind config
  layout.tsx           # Root layout met fonts
  page.tsx             # Homescreen compositie

components/
  home/
    header.tsx         # Top header met avatar + acties
    daily-checkin.tsx   # Weekdag check-in strip
    next-training.tsx   # Volgende training kaart
    nutrition-card.tsx  # Voeding tracking (cirkel + macro's)
    weight-progress.tsx # Gewichtsgrafiek
    bottom-nav.tsx      # Floating bottom navigatie

  ui/                  # shadcn/ui basis componenten
    button.tsx, card.tsx, etc.
```

---

## 8. Taal

De app is volledig in het **Nederlands**. HTML lang is `nl`.

### Veelvoorkomende labels
- "Dagelijkse check-in", "Volgende training", "Voeding vandaag", "Gewichtsverloop"
- "Eiwit", "Koolh.", "Vet" (macro's)
- "Huidig gewicht", "kcal"
- "Home", "Training", "Voeding", "Leren", "Meer" (navigatie)
- Begroetingen: "Goedemorgen", "Goedemiddag", "Goedenavond"
- Dagen: "MA", "DI", "WO", "DO", "VR", "ZA", "ZO"
- Maanden: "jan", "feb", "mrt", "apr", etc.

---

## 9. Design Principes

1. **Dark mode only** - Geen light mode variant nodig
2. **Mobile-first** - Alles geoptimaliseerd voor `max-w-md` (448px)
3. **Subtiele accenten** - `#bad4e1` spaarzaam gebruiken, niet overal
4. **Consistent spacing** - `mx-5` voor secties, `gap-4` tussen kaarten, `p-5` padding in kaarten
5. **Monospace voor data** - Alle cijfers, datums en titels in `font-mono` (Space Grotesk)
6. **Sans-serif voor body** - Alle beschrijvende tekst in `font-sans` (Inter)
7. **Rounded corners** - `rounded-2xl` voor kaarten, `rounded-xl` voor buttons/inputs, `rounded-full` voor avatars/dots
8. **Glasmorphism nav** - Bottom nav met `backdrop-blur-xl` en `bg-card/80`
9. **Hover feedback** - Altijd subtiele hover states met `transition-all`
10. **Opacity varianten** - Gebruik `/15`, `/25`, `/30` opacity voor lichtere varianten van `#bad4e1`

---

## 10. Kleur Toepassing Cheatsheet

### Wanneer gebruik je `#bad4e1` (Evotion Ice)?
- Als **achtergrond** van actieve/geselecteerde elementen (met `text-[#1e1839]` erop)
- Als **tekst kleur** voor accent labels en actieve nav items
- Als **icoon kleur** in accent containers
- Als **chart lijn** en **chart dots**
- Als **notification dots** en **status indicators**
- Als **opacity variant** (`/15`, `/25`) voor subtiele achtergronden

### Wanneer gebruik je `#1e1839` (Evotion Dark)?
- Als **tekst/foreground** op `#bad4e1` achtergronden
- **Nooit** als zichtbaar element op donkere achtergronden (te weinig contrast)

### Wanneer gebruik je de design tokens?
- `bg-background` - pagina achtergrond
- `bg-card` - kaart achtergronden
- `bg-secondary` - input achtergronden, inactieve elementen
- `text-foreground` - primaire witte tekst
- `text-muted-foreground` - gedempte/grijze tekst
- `border-border` - alle borders
