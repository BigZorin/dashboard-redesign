"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Moon,
  Zap,
  Brain,
  Smile,
  Frown,
  Meh,
  SmilePlus,
  Angry,
  CheckCircle2,
  Scale,
  Droplets,
  Dumbbell,
  Minus,
  Plus,
} from "lucide-react"

type Step = "mood" | "energy" | "sleep" | "weight" | "water" | "training" | "notes" | "done"

const moodOptions = [
  { icon: Angry, label: "Slecht", value: 1, color: "text-red-400 bg-red-400/15 border-red-400/30" },
  { icon: Frown, label: "Matig", value: 2, color: "text-orange-400 bg-orange-400/15 border-orange-400/30" },
  { icon: Meh, label: "Neutraal", value: 3, color: "text-yellow-400 bg-yellow-400/15 border-yellow-400/30" },
  { icon: Smile, label: "Goed", value: 4, color: "text-emerald-400 bg-emerald-400/15 border-emerald-400/30" },
  { icon: SmilePlus, label: "Geweldig", value: 5, color: "text-[#bad4e1] bg-[#bad4e1]/15 border-[#bad4e1]/30" },
]

const energyLevels = [
  { label: "Uitgeput", value: 1 },
  { label: "Laag", value: 2 },
  { label: "Gemiddeld", value: 3 },
  { label: "Hoog", value: 4 },
  { label: "Vol energie", value: 5 },
]

const trainingOptions = [
  { label: "Rust dag", value: "rest" },
  { label: "Licht (wandelen, yoga)", value: "light" },
  { label: "Gemiddeld (cardio, conditie)", value: "moderate" },
  { label: "Zwaar (krachttraining)", value: "heavy" },
  { label: "Intensief (HIIT, competitie)", value: "intense" },
]

const steps: Step[] = ["mood", "energy", "sleep", "weight", "water", "training", "notes", "done"]

const stepInfo: Record<Exclude<Step, "done">, { title: string; subtitle: string; icon: typeof Smile }> = {
  mood: { title: "Hoe voel je je?", subtitle: "Selecteer je stemming van vandaag", icon: Smile },
  energy: { title: "Energielevel", subtitle: "Hoe energiek voel je je vandaag?", icon: Zap },
  sleep: { title: "Slaap", subtitle: "Hoe heb je geslapen?", icon: Moon },
  weight: { title: "Gewicht", subtitle: "Stap op de weegschaal", icon: Scale },
  water: { title: "Waterinname", subtitle: "Hoeveel heb je vandaag gedronken?", icon: Droplets },
  training: { title: "Training", subtitle: "Heb je vandaag getraind?", icon: Dumbbell },
  notes: { title: "Notities", subtitle: "Iets bijzonders of opmerkingen? (optioneel)", icon: Brain },
}

export default function CheckinPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("mood")
  const [mood, setMood] = useState<number | null>(null)
  const [energy, setEnergy] = useState<number | null>(null)
  const [sleepHours, setSleepHours] = useState(7.5)
  const [sleepQuality, setSleepQuality] = useState<number | null>(null)
  const [weight, setWeight] = useState(82.1)
  const [waterGlasses, setWaterGlasses] = useState(0)
  const [training, setTraining] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isAnimating, setIsAnimating] = useState(false)

  const stepIndex = steps.indexOf(currentStep)
  const totalSteps = steps.length - 1
  const progress = (stepIndex / totalSteps) * 100

  const goNext = () => {
    setIsAnimating(true)
    setTimeout(() => {
      const next = steps[stepIndex + 1]
      if (next) setCurrentStep(next)
      setIsAnimating(false)
    }, 200)
  }

  const goBack = () => {
    if (stepIndex === 0) {
      router.back()
      return
    }
    setIsAnimating(true)
    setTimeout(() => {
      const prev = steps[stepIndex - 1]
      if (prev) setCurrentStep(prev)
      setIsAnimating(false)
    }, 200)
  }

  const canProceed = () => {
    switch (currentStep) {
      case "mood": return mood !== null
      case "energy": return energy !== null
      case "sleep": return sleepQuality !== null
      case "weight": return true
      case "water": return true
      case "training": return training !== null
      case "notes": return true
      default: return false
    }
  }

  const waterMl = waterGlasses * 250

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative flex flex-col">
      {/* Header */}
      {currentStep !== "done" && (
        <div className="px-5 pt-14 pb-4">
          <div className="flex items-center gap-4 mb-5">
            <button onClick={goBack} className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-foreground font-mono">Check-in</h1>
              <p className="text-xs text-muted-foreground">Zaterdag 21 februari</p>
            </div>
            <span className="text-xs text-muted-foreground font-mono">{stepIndex + 1}/{totalSteps}</span>
          </div>

          {/* Progress bar */}
          <div className="h-1 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-[#bad4e1] transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 px-5 overflow-y-auto transition-all duration-200 ${isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"}`}>

        {/* Step heading (reusable for non-done steps) */}
        {currentStep !== "done" && (() => {
          const info = stepInfo[currentStep]
          const Icon = info.icon
          return (
            <div className="pt-6 mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/15 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-[#bad4e1]" />
                </div>
                <h2 className="text-2xl font-bold text-foreground font-mono tracking-tight">
                  {info.title}
                </h2>
              </div>
              <p className="text-sm text-muted-foreground ml-[52px]">{info.subtitle}</p>
            </div>
          )
        })()}

        {/* Mood step */}
        {currentStep === "mood" && (
          <div className="flex flex-col gap-3">
            {moodOptions.map((option) => {
              const Icon = option.icon
              const selected = mood === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    selected ? option.color : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                    selected ? "bg-white/10" : "bg-secondary"
                  }`}>
                    <Icon className={`h-6 w-6 ${selected ? "" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`font-semibold text-sm ${selected ? "" : "text-foreground"}`}>
                    {option.label}
                  </span>
                  {selected && (
                    <div className="ml-auto">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Energy step */}
        {currentStep === "energy" && (
          <div className="flex flex-col gap-3">
            {energyLevels.map((level) => {
              const selected = energy === level.value
              const fillWidth = (level.value / 5) * 100
              return (
                <button
                  key={level.value}
                  onClick={() => setEnergy(level.value)}
                  className={`relative flex items-center p-4 rounded-2xl border-2 transition-all overflow-hidden ${
                    selected
                      ? "bg-[#bad4e1]/15 border-[#bad4e1]/30 text-[#bad4e1]"
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  <div
                    className={`absolute left-0 top-0 bottom-0 transition-all duration-500 ${
                      selected ? "bg-[#bad4e1]/10" : "bg-secondary/50"
                    }`}
                    style={{ width: `${fillWidth}%` }}
                  />
                  <div className="relative flex items-center justify-between w-full">
                    <span className={`font-semibold text-sm ${selected ? "text-[#bad4e1]" : "text-foreground"}`}>
                      {level.label}
                    </span>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-2 rounded-full transition-colors ${
                            i < level.value
                              ? selected ? "bg-[#bad4e1]" : "bg-muted-foreground/40"
                              : "bg-secondary"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* Sleep step */}
        {currentStep === "sleep" && (
          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Uren geslapen</p>
              <div className="flex items-center justify-center gap-6 mb-4">
                <button
                  onClick={() => setSleepHours(Math.max(0, sleepHours - 0.5))}
                  className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Minus className="h-5 w-5 text-foreground" />
                </button>
                <div className="text-center min-w-[100px]">
                  <span className="text-5xl font-bold text-foreground font-mono">{sleepHours.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground ml-1">uur</span>
                </div>
                <button
                  onClick={() => setSleepHours(Math.min(14, sleepHours + 0.5))}
                  className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
                >
                  <Plus className="h-5 w-5 text-foreground" />
                </button>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#bad4e1] transition-all duration-300"
                  style={{ width: `${(sleepHours / 14) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-1.5">
                <span className="text-[10px] text-muted-foreground">0u</span>
                <span className="text-[10px] text-muted-foreground">7u</span>
                <span className="text-[10px] text-muted-foreground">14u</span>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Slaapkwaliteit</p>
              <div className="flex gap-2">
                {[
                  { label: "Slecht", value: 1 },
                  { label: "Matig", value: 2 },
                  { label: "Oké", value: 3 },
                  { label: "Goed", value: 4 },
                  { label: "Top", value: 5 },
                ].map((q) => {
                  const selected = sleepQuality === q.value
                  return (
                    <button
                      key={q.value}
                      onClick={() => setSleepQuality(q.value)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        selected
                          ? "bg-[#bad4e1]/20 text-[#bad4e1] border border-[#bad4e1]/30"
                          : "bg-secondary text-muted-foreground border border-transparent hover:text-foreground"
                      }`}
                    >
                      {q.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Weight step */}
        {currentStep === "weight" && (
          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-center gap-6 mb-6">
                <button
                  onClick={() => setWeight(Math.max(30, parseFloat((weight - 0.1).toFixed(1))))}
                  className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
                >
                  <Minus className="h-6 w-6 text-foreground" />
                </button>
                <div className="text-center min-w-[140px]">
                  <span className="text-6xl font-bold text-foreground font-mono">{weight.toFixed(1)}</span>
                  <span className="text-lg text-muted-foreground ml-2">kg</span>
                </div>
                <button
                  onClick={() => setWeight(Math.min(250, parseFloat((weight + 0.1).toFixed(1))))}
                  className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors active:scale-95"
                >
                  <Plus className="h-6 w-6 text-foreground" />
                </button>
              </div>

              {/* Quick adjust buttons */}
              <div className="flex gap-2 justify-center">
                {[-1, -0.5, +0.5, +1].map((adj) => (
                  <button
                    key={adj}
                    onClick={() => setWeight(Math.max(30, Math.min(250, parseFloat((weight + adj).toFixed(1)))))}
                    className="px-3 py-1.5 rounded-lg bg-secondary text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {adj > 0 ? "+" : ""}{adj} kg
                  </button>
                ))}
              </div>
            </div>

            {/* Previous weight context */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Laatste metingen</p>
              <div className="flex flex-col gap-2">
                {[
                  { date: "Gisteren", value: 82.3 },
                  { date: "Woensdag", value: 82.6 },
                  { date: "Dinsdag", value: 82.8 },
                ].map((m) => (
                  <div key={m.date} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{m.date}</span>
                    <span className="text-sm font-semibold text-foreground font-mono">{m.value} kg</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Water step */}
        {currentStep === "water" && (
          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="text-center mb-6">
                <span className="text-6xl font-bold text-foreground font-mono">{waterMl}</span>
                <span className="text-lg text-muted-foreground ml-2">ml</span>
                <p className="text-xs text-muted-foreground mt-1">{waterGlasses} glazen van 250ml</p>
              </div>

              {/* Water visual */}
              <div className="relative h-4 rounded-full bg-secondary overflow-hidden mb-4">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (waterMl / 3000) * 100)}%` }}
                />
                <div className="absolute top-0 bottom-0 left-[66.7%] w-px bg-muted-foreground/30" />
              </div>
              <div className="flex justify-between mb-6">
                <span className="text-[10px] text-muted-foreground">0 ml</span>
                <span className="text-[10px] text-[#bad4e1]">Doel: 2000 ml</span>
                <span className="text-[10px] text-muted-foreground">3000 ml</span>
              </div>

              {/* Glass buttons */}
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                  <button
                    key={g}
                    onClick={() => setWaterGlasses(g)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      g <= waterGlasses
                        ? "bg-blue-400/15 border border-blue-400/30"
                        : "bg-secondary border border-transparent hover:border-border"
                    }`}
                  >
                    <Droplets className={`h-5 w-5 ${g <= waterGlasses ? "text-blue-400" : "text-muted-foreground/40"}`} />
                    <span className={`text-[10px] font-semibold ${g <= waterGlasses ? "text-blue-400" : "text-muted-foreground"}`}>
                      {g * 250}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Training step */}
        {currentStep === "training" && (
          <div className="flex flex-col gap-3">
            {trainingOptions.map((option) => {
              const selected = training === option.value
              return (
                <button
                  key={option.value}
                  onClick={() => setTraining(option.value)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                    selected
                      ? "bg-[#bad4e1]/15 border-[#bad4e1]/30"
                      : "bg-card border-border hover:border-border/80"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                    selected ? "bg-[#bad4e1]/20" : "bg-secondary"
                  }`}>
                    <Dumbbell className={`h-5 w-5 ${selected ? "text-[#bad4e1]" : "text-muted-foreground"}`} />
                  </div>
                  <span className={`font-semibold text-sm ${selected ? "text-[#bad4e1]" : "text-foreground"}`}>
                    {option.label}
                  </span>
                  {selected && (
                    <div className="ml-auto">
                      <CheckCircle2 className="h-5 w-5 text-[#bad4e1]" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Notes step */}
        {currentStep === "notes" && (
          <div className="flex flex-col gap-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Hoe gaat het met je training, voeding, mentale gesteldheid..."
                rows={5}
                className="w-full bg-transparent text-foreground text-sm placeholder:text-muted-foreground/50 resize-none focus:outline-none leading-relaxed"
              />
            </div>

            <div className="bg-card rounded-2xl border border-border p-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-3">Snelle tags</p>
              <div className="flex flex-wrap gap-2">
                {["Spierpijn", "Stress", "Goed gegeten", "Slecht gegeten", "Gemotiveerd", "Moe", "Ziek", "Menstruatie"].map((tag) => {
                  const selected = notes.includes(tag)
                  return (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selected) {
                          setNotes(notes.replace(tag, "").replace(/, ,/g, ",").replace(/^, |, $/g, "").trim())
                        } else {
                          setNotes(notes ? `${notes}, ${tag}` : tag)
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        selected
                          ? "bg-[#bad4e1]/20 text-[#bad4e1] border border-[#bad4e1]/30"
                          : "bg-secondary text-muted-foreground border border-transparent hover:text-foreground"
                      }`}
                    >
                      {tag}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Done step */}
        {currentStep === "done" && (
          <div className="flex flex-col items-center pt-14 pb-8">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full blur-3xl opacity-30 bg-[#bad4e1]" style={{ transform: "scale(3)" }} />
              <div className="relative h-20 w-20 rounded-full bg-[#bad4e1]/20 flex items-center justify-center border-2 border-[#bad4e1]/30">
                <CheckCircle2 className="h-10 w-10 text-[#bad4e1]" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-foreground font-mono tracking-tight mb-2">Check-in voltooid!</h2>
            <p className="text-sm text-muted-foreground max-w-[280px] text-center leading-relaxed mb-2">
              Je dagelijkse check-in voor zaterdag 21 februari is opgeslagen.
            </p>
            <p className="text-xs text-[#bad4e1] font-medium mb-8">4 van 5 dagen deze week ingevuld</p>

            {/* Summary */}
            <div className="w-full bg-card rounded-2xl border border-border p-5 mb-6">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Samenvatting</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: "Stemming", value: moodOptions.find((m) => m.value === mood)?.label ?? "-" },
                  { label: "Energie", value: energyLevels.find((e) => e.value === energy)?.label ?? "-" },
                  { label: "Slaap", value: `${sleepHours}u - ${["Slecht", "Matig", "Oké", "Goed", "Top"][(sleepQuality ?? 1) - 1]}` },
                  { label: "Gewicht", value: `${weight.toFixed(1)} kg` },
                  { label: "Water", value: `${waterMl} ml (${waterGlasses} glazen)` },
                  { label: "Training", value: trainingOptions.find((t) => t.value === training)?.label ?? "-" },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="text-sm font-semibold text-foreground">{item.value}</span>
                    </div>
                    {i < 5 && <div className="h-px bg-border mt-3" />}
                  </div>
                ))}
                {notes && (
                  <>
                    <div className="h-px bg-border" />
                    <div>
                      <span className="text-sm text-muted-foreground">Notities</span>
                      <p className="text-sm text-foreground mt-1">{notes}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => router.push("/")}
              className="w-full py-3.5 rounded-xl bg-[#bad4e1] text-[#0a0b0f] font-semibold text-sm hover:bg-[#bad4e1]/90 transition-colors"
            >
              Terug naar home
            </button>
          </div>
        )}
      </div>

      {/* Bottom button */}
      {currentStep !== "done" && (
        <div className="px-5 py-6 mt-auto">
          <button
            onClick={goNext}
            disabled={!canProceed()}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all ${
              canProceed()
                ? "bg-[#bad4e1] text-[#0a0b0f] hover:bg-[#bad4e1]/90 active:scale-[0.98]"
                : "bg-secondary text-muted-foreground cursor-not-allowed"
            }`}
          >
            {currentStep === "notes" ? "Afronden" : "Volgende"}
          </button>
        </div>
      )}
    </div>
  )
}
