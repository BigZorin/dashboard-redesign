"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
  ArrowRight,
  ArrowLeft,
  User,
  Target,
  Dumbbell,
  Calendar,
  Ruler,
  Scale,
  Check,
  Heart,
  Utensils,
  Moon,
  Clock,
  AlertCircle,
  Briefcase,
  ChevronDown,
} from "lucide-react"

const STEPS = [
  { id: "welcome", label: "Welkom", icon: null },
  { id: "personal", label: "Persoonlijk", icon: User },
  { id: "body", label: "Lichaam", icon: Ruler },
  { id: "goals", label: "Doelen", icon: Target },
  { id: "experience", label: "Ervaring", icon: Dumbbell },
  { id: "training", label: "Training", icon: Calendar },
  { id: "nutrition", label: "Voeding", icon: Utensils },
  { id: "health", label: "Gezondheid", icon: Heart },
  { id: "lifestyle", label: "Leefstijl", icon: Briefcase },
  { id: "done", label: "Klaar", icon: Check },
]

export default function IntakePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "back">("forward")

  // Form state
  const [data, setData] = useState({
    // Personal
    name: "",
    birthdate: "",
    gender: "",
    
    // Body
    height: "",
    weight: "",
    goalWeight: "",
    fatPercentage: "",
    waist: "",
    hip: "",
    
    // Goals
    goals: [] as string[],
    goalPriority: "",
    shortTermGoals: "",
    longTermGoals: "",
    
    // Experience
    experience: "",
    trainingYears: "",
    
    // Training
    currentFrequency: "",
    trainingStyle: "",
    splitPreference: "",
    sessionDuration: "",
    equipment: "",
    trainingDays: [] as string[],
    preferredTime: "",
    benchPress: "",
    squat: "",
    deadlift: "",
    overheadPress: "",
    favoriteExercises: "",
    avoidedExercises: "",
    
    // Nutrition
    dietaryRestrictions: "",
    allergies: "",
    currentKcal: "",
    currentProtein: "",
    mealsPerDay: "",
    cookingSkills: "",
    foodBudget: "",
    waterIntake: "",
    alcohol: "",
    caffeine: "",
    currentSupplements: "",
    dietHistory: "",
    
    // Health
    injuries: "",
    medicalConditions: "",
    medications: "",
    hormonalIssues: "",
    digestiveIssues: "",
    previousSurgeries: "",
    energyLevel: "",
    
    // Lifestyle
    occupation: "",
    stressLevel: "",
    sleepHours: "",
    dailySteps: "",
    commute: "",
    motivation: "",
    previousCoaching: "",
    biggestChallenges: "",
    communicationPreference: "",
    accountabilityPreference: "",
    extraNotes: "",
  })

  function next() {
    setDirection("forward")
    if (step === STEPS.length - 1) {
      router.push("/")
    } else {
      setStep((s) => s + 1)
    }
  }

  function back() {
    setDirection("back")
    if (step > 0) setStep((s) => s - 1)
  }

  function toggleGoal(goal: string) {
    setData((d) => ({
      ...d,
      goals: d.goals.includes(goal) ? d.goals.filter((x) => x !== goal) : [...d.goals, goal],
    }))
  }

  function toggleDay(day: string) {
    setData((d) => ({
      ...d,
      trainingDays: d.trainingDays.includes(day) ? d.trainingDays.filter((x) => x !== day) : [...d.trainingDays, day],
    }))
  }

  const progress = ((step) / (STEPS.length - 1)) * 100

  function canProceed() {
    switch (STEPS[step].id) {
      case "welcome":
        return true
      case "personal":
        return data.name.trim() !== "" && data.gender !== ""
      case "body":
        return data.height !== "" && data.weight !== ""
      case "goals":
        return data.goals.length > 0
      case "experience":
        return data.experience !== ""
      case "training":
        return data.trainingDays.length > 0
      case "nutrition":
        return true // Optional fields
      case "health":
        return true // Optional fields
      case "lifestyle":
        return true // Optional fields
      case "done":
        return true
      default:
        return true
    }
  }

  // Reusable input component
  const TextInput = ({ label, value, onChange, placeholder, type = "text", icon: Icon }: {
    label: string
    value: string
    onChange: (val: string) => void
    placeholder?: string
    type?: string
    icon?: React.ElementType
  }) => (
    <div>
      <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-xl bg-white/[0.06] border border-white/[0.1] ${Icon ? "pl-11" : "px-4"} pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 transition-all`}
        />
      </div>
    </div>
  )

  const TextArea = ({ label, value, onChange, placeholder, rows = 3 }: {
    label: string
    value: string
    onChange: (val: string) => void
    placeholder?: string
    rows?: number
  }) => (
    <div>
      <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 transition-all resize-none"
      />
    </div>
  )

  const SelectInput = ({ label, value, onChange, options, placeholder }: {
    label: string
    value: string
    onChange: (val: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
  }) => (
    <div>
      <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-3.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 transition-all appearance-none cursor-pointer"
        >
          {placeholder && <option value="" className="bg-[#0a0b0f] text-white/50">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0a0b0f]">{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 pointer-events-none" />
      </div>
    </div>
  )

  const OptionCard = ({ selected, onClick, title, desc }: {
    selected: boolean
    onClick: () => void
    title: string
    desc?: string
  }) => (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-4 rounded-2xl border transition-all ${
        selected
          ? "bg-[#bad4e1]/10 border-[#bad4e1]/30"
          : "bg-white/[0.03] border-white/[0.06] hover:border-white/15"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold ${selected ? "text-[#bad4e1]" : "text-white"}`}>{title}</p>
          {desc && <p className="text-xs text-white/40 mt-0.5">{desc}</p>}
        </div>
        {selected && (
          <div className="h-6 w-6 rounded-full bg-[#bad4e1]/20 flex items-center justify-center">
            <Check className="h-3.5 w-3.5 text-[#bad4e1]" />
          </div>
        )}
      </div>
    </button>
  )

  const ChipSelect = ({ options, selected, onToggle, multi = false }: {
    options: string[]
    selected: string | string[]
    onToggle: (val: string) => void
    multi?: boolean
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isSelected = multi ? (selected as string[]).includes(opt) : selected === opt
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isSelected
                ? "bg-[#bad4e1]/15 border-[#bad4e1]/30 text-[#bad4e1]"
                : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20"
            }`}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )

  const StepHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) => (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-[#bad4e1]" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white font-mono">{title}</h2>
        <p className="text-white/40 text-xs">{subtitle}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen relative flex flex-col bg-[#0a0b0f] overflow-hidden">
      {/* Gradient backgrounds */}
      <div
        className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(186,212,225,0.12) 0%, rgba(186,212,225,0.04) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(186,212,225,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Header with progress */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            {step > 0 && step < STEPS.length - 1 ? (
              <button onClick={back} className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-sm">
                <ArrowLeft className="h-4 w-4" />
                <span>Terug</span>
              </button>
            ) : (
              <div />
            )}
            {step > 0 && step < STEPS.length - 1 && (
              <span className="text-[11px] text-white/30 uppercase tracking-wider font-medium">
                {step}/{STEPS.length - 2}
              </span>
            )}
          </div>

          {step > 0 && step < STEPS.length - 1 && (
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#bad4e1] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-32 relative z-10">
        <div
          key={step}
          className="w-full max-w-md mx-auto animate-in fade-in duration-400"
          style={{
            animationName: direction === "forward" ? "slideInRight" : "slideInLeft",
            animationDuration: "400ms",
            animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Step: Welcome */}
          {STEPS[step].id === "welcome" && (
            <div className="flex flex-col items-center text-center pt-12">
              <div className="relative mb-8">
                <div
                  className="absolute inset-0 rounded-full blur-3xl"
                  style={{
                    background: "radial-gradient(circle, rgba(186,212,225,0.5) 0%, transparent 70%)",
                    transform: "scale(4)",
                  }}
                />
                <Image
                  src="/images/evotion-logo-wit.png"
                  alt="Evotion"
                  width={80}
                  height={80}
                  className="relative z-10"
                />
              </div>
              <h1 className="text-3xl font-bold text-white font-mono tracking-tight mb-3">
                Welkom bij Evotion
              </h1>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
                Laten we je profiel opzetten zodat je coach een plan op maat kan maken. Dit duurt ongeveer 5-10 minuten.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {STEPS.slice(1, -1).map((s) => (
                  <span key={s.id} className="px-3 py-1.5 rounded-lg bg-white/[0.04] text-white/40 text-[11px] font-medium">
                    {s.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Step: Personal */}
          {STEPS[step].id === "personal" && (
            <div>
              <StepHeader icon={User} title="Persoonlijke gegevens" subtitle="Vertel ons wie je bent" />
              <div className="flex flex-col gap-4">
                <TextInput
                  label="Voornaam"
                  value={data.name}
                  onChange={(val) => setData({ ...data, name: val })}
                  placeholder="Je voornaam"
                />
                <TextInput
                  label="Geboortedatum"
                  value={data.birthdate}
                  onChange={(val) => setData({ ...data, birthdate: val })}
                  placeholder="dd-mm-jjjj"
                  type="date"
                />
                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">Geslacht</label>
                  <ChipSelect
                    options={["Man", "Vrouw", "Anders"]}
                    selected={data.gender}
                    onToggle={(val) => setData({ ...data, gender: val })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: Body */}
          {STEPS[step].id === "body" && (
            <div>
              <StepHeader icon={Ruler} title="Lichaamsgegevens" subtitle="Je huidige metingen" />
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Lengte (cm)"
                    value={data.height}
                    onChange={(val) => setData({ ...data, height: val })}
                    placeholder="180"
                    type="number"
                  />
                  <TextInput
                    label="Gewicht (kg)"
                    value={data.weight}
                    onChange={(val) => setData({ ...data, weight: val })}
                    placeholder="80"
                    type="number"
                  />
                </div>
                <TextInput
                  label="Streefgewicht (kg, optioneel)"
                  value={data.goalWeight}
                  onChange={(val) => setData({ ...data, goalWeight: val })}
                  placeholder="75"
                  type="number"
                />
                <div className="grid grid-cols-3 gap-3">
                  <TextInput
                    label="Vetpercentage"
                    value={data.fatPercentage}
                    onChange={(val) => setData({ ...data, fatPercentage: val })}
                    placeholder="15%"
                  />
                  <TextInput
                    label="Taille (cm)"
                    value={data.waist}
                    onChange={(val) => setData({ ...data, waist: val })}
                    placeholder="85"
                    type="number"
                  />
                  <TextInput
                    label="Heup (cm)"
                    value={data.hip}
                    onChange={(val) => setData({ ...data, hip: val })}
                    placeholder="95"
                    type="number"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: Goals */}
          {STEPS[step].id === "goals" && (
            <div>
              <StepHeader icon={Target} title="Doelstellingen" subtitle="Wat wil je bereiken?" />
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-3">Selecteer je doelen (meerdere mogelijk)</label>
                  <ChipSelect
                    options={["Afvallen", "Spiermassa opbouwen", "Fitter worden", "Krachtopbouw", "Gezonder leven", "Revalidatie"]}
                    selected={data.goals}
                    onToggle={toggleGoal}
                    multi
                  />
                </div>
                {data.goals.length > 1 && (
                  <SelectInput
                    label="Wat is je hoofdprioriteit?"
                    value={data.goalPriority}
                    onChange={(val) => setData({ ...data, goalPriority: val })}
                    options={data.goals.map((g) => ({ value: g, label: g }))}
                    placeholder="Selecteer je prioriteit"
                  />
                )}
                <TextArea
                  label="Korte-termijn doelen (4-8 weken)"
                  value={data.shortTermGoals}
                  onChange={(val) => setData({ ...data, shortTermGoals: val })}
                  placeholder="Bijv. 3kg afvallen, 5x per week trainen..."
                />
                <TextArea
                  label="Lange-termijn doelen (3-12 maanden)"
                  value={data.longTermGoals}
                  onChange={(val) => setData({ ...data, longTermGoals: val })}
                  placeholder="Bijv. 10kg afvallen, marathon lopen..."
                />
              </div>
            </div>
          )}

          {/* Step: Experience */}
          {STEPS[step].id === "experience" && (
            <div>
              <StepHeader icon={Dumbbell} title="Fitnesservaring" subtitle="Hoe ervaren ben je?" />
              <div className="flex flex-col gap-4">
                {[
                  { id: "beginner", title: "Beginner", desc: "Weinig tot geen ervaring" },
                  { id: "gemiddeld", title: "Gemiddeld", desc: "1-3 jaar ervaring" },
                  { id: "gevorderd", title: "Gevorderd", desc: "3+ jaar ervaring" },
                ].map((exp) => (
                  <OptionCard
                    key={exp.id}
                    selected={data.experience === exp.id}
                    onClick={() => setData({ ...data, experience: exp.id })}
                    title={exp.title}
                    desc={exp.desc}
                  />
                ))}
                <TextInput
                  label="Hoeveel jaar train je al?"
                  value={data.trainingYears}
                  onChange={(val) => setData({ ...data, trainingYears: val })}
                  placeholder="Bijv. 2 jaar"
                />
              </div>
            </div>
          )}

          {/* Step: Training */}
          {STEPS[step].id === "training" && (
            <div>
              <StepHeader icon={Calendar} title="Training" subtitle="Je trainingsvoorkeuren" />
              <div className="flex flex-col gap-5">
                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-3">Beschikbare trainingsdagen</label>
                  <div className="grid grid-cols-4 gap-2">
                    {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((day, i) => {
                      const fullDay = ["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"][i]
                      const isSelected = data.trainingDays.includes(fullDay)
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(fullDay)}
                          className={`py-3 rounded-xl text-sm font-medium transition-all border ${
                            isSelected
                              ? "bg-[#bad4e1]/15 border-[#bad4e1]/30 text-[#bad4e1]"
                              : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20"
                          }`}
                        >
                          {day}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-center text-xs text-white/30 mt-2">
                    {data.trainingDays.length} {data.trainingDays.length === 1 ? "dag" : "dagen"} geselecteerd
                  </p>
                </div>

                <SelectInput
                  label="Voorkeurstijd training"
                  value={data.preferredTime}
                  onChange={(val) => setData({ ...data, preferredTime: val })}
                  options={[
                    { value: "ochtend", label: "Ochtend (6:00 - 10:00)" },
                    { value: "middag", label: "Middag (10:00 - 14:00)" },
                    { value: "namiddag", label: "Namiddag (14:00 - 18:00)" },
                    { value: "avond", label: "Avond (18:00 - 22:00)" },
                  ]}
                  placeholder="Selecteer tijdslot"
                />

                <SelectInput
                  label="Sessieduur"
                  value={data.sessionDuration}
                  onChange={(val) => setData({ ...data, sessionDuration: val })}
                  options={[
                    { value: "30-45", label: "30-45 minuten" },
                    { value: "45-60", label: "45-60 minuten" },
                    { value: "60-90", label: "60-90 minuten" },
                    { value: "90+", label: "90+ minuten" },
                  ]}
                  placeholder="Selecteer duur"
                />

                <SelectInput
                  label="Beschikbare uitrusting"
                  value={data.equipment}
                  onChange={(val) => setData({ ...data, equipment: val })}
                  options={[
                    { value: "thuis-minimal", label: "Thuis - Minimaal (geen/weinig)" },
                    { value: "thuis-basic", label: "Thuis - Basis (dumbbells, banden)" },
                    { value: "thuis-volledig", label: "Thuis - Volledig (rack, barbell)" },
                    { value: "sportschool", label: "Volledige sportschool" },
                  ]}
                  placeholder="Selecteer uitrusting"
                />

                <div className="pt-2 border-t border-white/[0.06]">
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-3">Krachtlevels (1RM, optioneel)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <TextInput
                      label="Bench Press"
                      value={data.benchPress}
                      onChange={(val) => setData({ ...data, benchPress: val })}
                      placeholder="kg"
                      type="number"
                    />
                    <TextInput
                      label="Squat"
                      value={data.squat}
                      onChange={(val) => setData({ ...data, squat: val })}
                      placeholder="kg"
                      type="number"
                    />
                    <TextInput
                      label="Deadlift"
                      value={data.deadlift}
                      onChange={(val) => setData({ ...data, deadlift: val })}
                      placeholder="kg"
                      type="number"
                    />
                    <TextInput
                      label="Overhead Press"
                      value={data.overheadPress}
                      onChange={(val) => setData({ ...data, overheadPress: val })}
                      placeholder="kg"
                      type="number"
                    />
                  </div>
                </div>

                <TextArea
                  label="Favoriete oefeningen"
                  value={data.favoriteExercises}
                  onChange={(val) => setData({ ...data, favoriteExercises: val })}
                  placeholder="Welke oefeningen doe je graag?"
                  rows={2}
                />
                <TextArea
                  label="Vermeden oefeningen"
                  value={data.avoidedExercises}
                  onChange={(val) => setData({ ...data, avoidedExercises: val })}
                  placeholder="Welke oefeningen wil je vermijden?"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step: Nutrition */}
          {STEPS[step].id === "nutrition" && (
            <div>
              <StepHeader icon={Utensils} title="Voeding" subtitle="Je eetpatroon en voorkeuren" />
              <div className="flex flex-col gap-4">
                <TextInput
                  label="Voedingsrestricties"
                  value={data.dietaryRestrictions}
                  onChange={(val) => setData({ ...data, dietaryRestrictions: val })}
                  placeholder="Bijv. vegetarisch, veganistisch, halal..."
                />
                <TextInput
                  label="Allergieën"
                  value={data.allergies}
                  onChange={(val) => setData({ ...data, allergies: val })}
                  placeholder="Bijv. noten, lactose, gluten..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <TextInput
                    label="Huidige kcal/dag"
                    value={data.currentKcal}
                    onChange={(val) => setData({ ...data, currentKcal: val })}
                    placeholder="2000"
                    type="number"
                  />
                  <TextInput
                    label="Huidige eiwit/dag"
                    value={data.currentProtein}
                    onChange={(val) => setData({ ...data, currentProtein: val })}
                    placeholder="120g"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <SelectInput
                    label="Maaltijden/dag"
                    value={data.mealsPerDay}
                    onChange={(val) => setData({ ...data, mealsPerDay: val })}
                    options={[
                      { value: "2", label: "2 maaltijden" },
                      { value: "3", label: "3 maaltijden" },
                      { value: "4", label: "4 maaltijden" },
                      { value: "5", label: "5 maaltijden" },
                      { value: "6+", label: "6+ maaltijden" },
                    ]}
                    placeholder="Selecteer"
                  />
                  <SelectInput
                    label="Kookvaardigheden"
                    value={data.cookingSkills}
                    onChange={(val) => setData({ ...data, cookingSkills: val })}
                    options={[
                      { value: "geen", label: "Minimaal" },
                      { value: "basis", label: "Basis" },
                      { value: "goed", label: "Goed" },
                      { value: "ervaren", label: "Ervaren" },
                    ]}
                    placeholder="Selecteer"
                  />
                </div>
                <TextInput
                  label="Water (L/dag)"
                  value={data.waterIntake}
                  onChange={(val) => setData({ ...data, waterIntake: val })}
                  placeholder="2.5"
                />
                <TextInput
                  label="Huidige supplementen"
                  value={data.currentSupplements}
                  onChange={(val) => setData({ ...data, currentSupplements: val })}
                  placeholder="Bijv. creatine, whey, vitamines..."
                />
              </div>
            </div>
          )}

          {/* Step: Health */}
          {STEPS[step].id === "health" && (
            <div>
              <StepHeader icon={Heart} title="Gezondheid" subtitle="Belangrijke medische info" />
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 mb-5 flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/80">
                  Deze informatie wordt gebruikt om je trainings- en voedingsplan aan te passen. Het wordt vertrouwelijk behandeld.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <TextArea
                  label="Blessures / beperkingen"
                  value={data.injuries}
                  onChange={(val) => setData({ ...data, injuries: val })}
                  placeholder="Bijv. knieblessure, rugklachten..."
                  rows={2}
                />
                <TextArea
                  label="Medische aandoeningen"
                  value={data.medicalConditions}
                  onChange={(val) => setData({ ...data, medicalConditions: val })}
                  placeholder="Bijv. diabetes, astma, hoge bloeddruk..."
                  rows={2}
                />
                <TextInput
                  label="Medicijnen"
                  value={data.medications}
                  onChange={(val) => setData({ ...data, medications: val })}
                  placeholder="Welke medicijnen gebruik je?"
                />
                <SelectInput
                  label="Energieniveau"
                  value={data.energyLevel}
                  onChange={(val) => setData({ ...data, energyLevel: val })}
                  options={[
                    { value: "laag", label: "Laag - vaak moe" },
                    { value: "gemiddeld", label: "Gemiddeld" },
                    { value: "hoog", label: "Hoog - veel energie" },
                  ]}
                  placeholder="Selecteer"
                />
              </div>
            </div>
          )}

          {/* Step: Lifestyle */}
          {STEPS[step].id === "lifestyle" && (
            <div>
              <StepHeader icon={Briefcase} title="Leefstijl" subtitle="Je dagelijkse routine" />
              <div className="flex flex-col gap-4">
                <TextInput
                  label="Beroep"
                  value={data.occupation}
                  onChange={(val) => setData({ ...data, occupation: val })}
                  placeholder="Wat doe je voor werk?"
                />
                <div className="grid grid-cols-2 gap-3">
                  <SelectInput
                    label="Stressniveau"
                    value={data.stressLevel}
                    onChange={(val) => setData({ ...data, stressLevel: val })}
                    options={[
                      { value: "1-3", label: "Laag (1-3)" },
                      { value: "4-6", label: "Gemiddeld (4-6)" },
                      { value: "7-10", label: "Hoog (7-10)" },
                    ]}
                    placeholder="Selecteer"
                  />
                  <TextInput
                    label="Slaap (uur/nacht)"
                    value={data.sleepHours}
                    onChange={(val) => setData({ ...data, sleepHours: val })}
                    placeholder="7"
                    type="number"
                  />
                </div>
                <TextInput
                  label="Dagelijkse stappen (gemiddeld)"
                  value={data.dailySteps}
                  onChange={(val) => setData({ ...data, dailySteps: val })}
                  placeholder="8000"
                  type="number"
                />
                <TextArea
                  label="Wat motiveert je?"
                  value={data.motivation}
                  onChange={(val) => setData({ ...data, motivation: val })}
                  placeholder="Waarom wil je dit doel bereiken?"
                  rows={2}
                />
                <TextArea
                  label="Grootste uitdagingen"
                  value={data.biggestChallenges}
                  onChange={(val) => setData({ ...data, biggestChallenges: val })}
                  placeholder="Waar heb je moeite mee?"
                  rows={2}
                />
                <TextArea
                  label="Extra opmerkingen"
                  value={data.extraNotes}
                  onChange={(val) => setData({ ...data, extraNotes: val })}
                  placeholder="Iets anders dat je coach moet weten?"
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Step: Done */}
          {STEPS[step].id === "done" && (
            <div className="flex flex-col items-center text-center pt-8">
              <div className="h-20 w-20 rounded-full bg-[#bad4e1]/10 border-2 border-[#bad4e1]/30 flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-[#bad4e1]" />
              </div>
              <h2 className="text-2xl font-bold text-white font-mono mb-3">Je bent er klaar voor!</h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-4">
                Bedankt {data.name || ""}! We hebben alle informatie die we nodig hebben. Je coach gaat aan de slag met je persoonlijke plan.
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {data.goals.length > 0 && data.goals.slice(0, 2).map((goal) => (
                  <span key={goal} className="px-3 py-1 rounded-full bg-[#bad4e1]/10 text-[#bad4e1] text-xs font-medium">
                    {goal}
                  </span>
                ))}
                {data.experience && (
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white/60 text-xs font-medium capitalize">
                    {data.experience}
                  </span>
                )}
                {data.trainingDays.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white/60 text-xs font-medium">
                    {data.trainingDays.length}x per week
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-10 pt-4 bg-gradient-to-t from-[#0a0b0f] via-[#0a0b0f] to-transparent">
        <div className="max-w-md mx-auto">
          <button
            onClick={next}
            disabled={!canProceed()}
            className="group w-full py-4 rounded-2xl bg-[#bad4e1] text-[#0a0b0f] font-bold font-mono flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            <span>{step === STEPS.length - 1 ? "Naar de app" : step === 0 ? "Laten we beginnen" : "Volgende"}</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
