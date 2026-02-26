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
} from "lucide-react"

const STEPS = [
  { id: "welcome", label: "Welkom" },
  { id: "personal", label: "Over jou" },
  { id: "body", label: "Lichaam" },
  { id: "goal", label: "Doel" },
  { id: "experience", label: "Ervaring" },
  { id: "schedule", label: "Schema" },
  { id: "done", label: "Klaar" },
]

export default function IntakePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState<"forward" | "back">("forward")

  // Form state
  const [data, setData] = useState({
    name: "",
    age: "",
    gender: "",
    height: "",
    weight: "",
    goalWeight: "",
    goal: "",
    experience: "",
    days: [] as string[],
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

  function toggleDay(day: string) {
    setData((d) => ({
      ...d,
      days: d.days.includes(day) ? d.days.filter((x) => x !== day) : [...d.days, day],
    }))
  }

  const progress = ((step) / (STEPS.length - 1)) * 100

  // Check if current step can proceed
  function canProceed() {
    switch (STEPS[step].id) {
      case "welcome":
        return true
      case "personal":
        return data.name.trim() !== "" && data.age !== "" && data.gender !== ""
      case "body":
        return data.height !== "" && data.weight !== ""
      case "goal":
        return data.goal !== ""
      case "experience":
        return data.experience !== ""
      case "schedule":
        return data.days.length > 0
      case "done":
        return true
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col bg-[#0a0b0f] overflow-hidden">
      {/* Gradient background */}
      <div
        className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(186,212,225,0.12) 0%, rgba(186,212,225,0.04) 40%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(186,212,225,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Header with progress */}
      <div className="relative z-10 px-6 pt-6 pb-4">
        <div className="max-w-sm mx-auto">
          {/* Back button + Step label */}
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

          {/* Progress bar */}
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
      <div className="flex-1 flex items-center justify-center px-6 relative z-10">
        <div
          key={step}
          className="w-full max-w-sm animate-in fade-in duration-400"
          style={{
            animationName: direction === "forward" ? "slideInRight" : "slideInLeft",
            animationDuration: "400ms",
            animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Step: Welcome */}
          {STEPS[step].id === "welcome" && (
            <div className="flex flex-col items-center text-center">
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
              <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                Voordat we beginnen, willen we je graag wat beter leren kennen. Zo kunnen we je de beste ervaring geven.
              </p>
            </div>
          )}

          {/* Step: Personal */}
          {STEPS[step].id === "personal" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-[#bad4e1]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">Over jou</h2>
                  <p className="text-white/40 text-xs">Vertel ons wie je bent</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">Naam</label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    placeholder="Je voornaam"
                    className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">Leeftijd</label>
                  <input
                    type="number"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: e.target.value })}
                    placeholder="25"
                    className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">Geslacht</label>
                  <div className="flex gap-3">
                    {["Man", "Vrouw", "Anders"].map((g) => (
                      <button
                        key={g}
                        onClick={() => setData({ ...data, gender: g })}
                        className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all border ${
                          data.gender === g
                            ? "bg-[#bad4e1]/15 border-[#bad4e1]/30 text-[#bad4e1]"
                            : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step: Body */}
          {STEPS[step].id === "body" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/10 flex items-center justify-center">
                  <Ruler className="h-5 w-5 text-[#bad4e1]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">Lichaam</h2>
                  <p className="text-white/40 text-xs">Je huidige gegevens</p>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">Lengte (cm)</label>
                  <input
                    type="number"
                    value={data.height}
                    onChange={(e) => setData({ ...data, height: e.target.value })}
                    placeholder="180"
                    className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">Huidig gewicht (kg)</label>
                  <div className="relative">
                    <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                    <input
                      type="number"
                      value={data.weight}
                      onChange={(e) => setData({ ...data, weight: e.target.value })}
                      placeholder="80"
                      className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2">Streefgewicht (kg, optioneel)</label>
                  <input
                    type="number"
                    value={data.goalWeight}
                    onChange={(e) => setData({ ...data, goalWeight: e.target.value })}
                    placeholder="75"
                    className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step: Goal */}
          {STEPS[step].id === "goal" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/10 flex items-center justify-center">
                  <Target className="h-5 w-5 text-[#bad4e1]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">Wat is je doel?</h2>
                  <p className="text-white/40 text-xs">Kies je primaire focus</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                {[
                  { id: "afvallen", title: "Afvallen", desc: "Vetpercentage verlagen en droog worden" },
                  { id: "spiermassa", title: "Spiermassa opbouwen", desc: "Meer spiermassa en kracht opbouwen" },
                  { id: "fit", title: "Fitter worden", desc: "Algemene conditie en gezondheid verbeteren" },
                  { id: "kracht", title: "Sterker worden", desc: "Focus op kracht en compound lifts" },
                  { id: "revalidatie", title: "Revalidatie", desc: "Herstel na blessure of operatie" },
                ].map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setData({ ...data, goal: goal.id })}
                    className={`w-full text-left px-4 py-4 rounded-2xl border transition-all ${
                      data.goal === goal.id
                        ? "bg-[#bad4e1]/10 border-[#bad4e1]/30"
                        : "bg-white/[0.03] border-white/[0.06] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${data.goal === goal.id ? "text-[#bad4e1]" : "text-white"}`}>
                          {goal.title}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">{goal.desc}</p>
                      </div>
                      {data.goal === goal.id && (
                        <div className="h-6 w-6 rounded-full bg-[#bad4e1]/20 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-[#bad4e1]" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Experience */}
          {STEPS[step].id === "experience" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/10 flex items-center justify-center">
                  <Dumbbell className="h-5 w-5 text-[#bad4e1]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">Ervaring</h2>
                  <p className="text-white/40 text-xs">Hoe ervaren ben je?</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-6">
                {[
                  { id: "beginner", title: "Beginner", desc: "Minder dan 6 maanden trainingservaring" },
                  { id: "gevorderd", title: "Gevorderd", desc: "6 maanden tot 2 jaar ervaring" },
                  { id: "ervaren", title: "Ervaren", desc: "Meer dan 2 jaar consistent getraind" },
                  { id: "expert", title: "Expert", desc: "5+ jaar ervaring, gevorderde technieken" },
                ].map((exp) => (
                  <button
                    key={exp.id}
                    onClick={() => setData({ ...data, experience: exp.id })}
                    className={`w-full text-left px-4 py-4 rounded-2xl border transition-all ${
                      data.experience === exp.id
                        ? "bg-[#bad4e1]/10 border-[#bad4e1]/30"
                        : "bg-white/[0.03] border-white/[0.06] hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-semibold ${data.experience === exp.id ? "text-[#bad4e1]" : "text-white"}`}>
                          {exp.title}
                        </p>
                        <p className="text-xs text-white/40 mt-0.5">{exp.desc}</p>
                      </div>
                      {data.experience === exp.id && (
                        <div className="h-6 w-6 rounded-full bg-[#bad4e1]/20 flex items-center justify-center">
                          <Check className="h-3.5 w-3.5 text-[#bad4e1]" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Schedule */}
          {STEPS[step].id === "schedule" && (
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#bad4e1]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white font-mono">Trainingsdagen</h2>
                  <p className="text-white/40 text-xs">Wanneer wil je trainen?</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6">
                {["Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"].map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleDay(day)}
                    className={`px-4 py-3.5 rounded-xl text-sm font-medium transition-all border ${
                      data.days.includes(day)
                        ? "bg-[#bad4e1]/15 border-[#bad4e1]/30 text-[#bad4e1]"
                        : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {data.days.includes(day) && <Check className="h-3.5 w-3.5" />}
                      <span>{day.slice(0, 2)}</span>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-center text-xs text-white/30 mt-4">
                {data.days.length} {data.days.length === 1 ? "dag" : "dagen"} geselecteerd
              </p>
            </div>
          )}

          {/* Step: Done */}
          {STEPS[step].id === "done" && (
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-[#bad4e1]/10 border-2 border-[#bad4e1]/30 flex items-center justify-center mb-6">
                <Check className="h-10 w-10 text-[#bad4e1]" />
              </div>
              <h2 className="text-2xl font-bold text-white font-mono mb-3">Je bent er klaar voor!</h2>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-2">
                Bedankt {data.name ? data.name : ""}! We hebben alle info die we nodig hebben. Je coach gaat voor je aan de slag.
              </p>
              <div className="flex flex-wrap gap-2 justify-center mt-4">
                {data.goal && (
                  <span className="px-3 py-1 rounded-full bg-[#bad4e1]/10 text-[#bad4e1] text-xs font-medium">
                    {data.goal === "afvallen" ? "Afvallen" : data.goal === "spiermassa" ? "Spiermassa" : data.goal === "fit" ? "Fitter worden" : data.goal === "kracht" ? "Sterker worden" : "Revalidatie"}
                  </span>
                )}
                {data.experience && (
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white/60 text-xs font-medium capitalize">
                    {data.experience}
                  </span>
                )}
                {data.days.length > 0 && (
                  <span className="px-3 py-1 rounded-full bg-white/[0.06] text-white/60 text-xs font-medium">
                    {data.days.length}x per week
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="relative z-10 px-6 pb-10 pt-4">
        <div className="max-w-sm mx-auto">
          <button
            onClick={next}
            disabled={!canProceed()}
            className="group w-full py-4 rounded-2xl bg-[#bad4e1] text-[#0a0a0a] font-semibold text-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-[0_0_40px_rgba(186,212,225,0.2)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {STEPS[step].id === "welcome" ? (
              <>
                <span>Laten we beginnen</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : STEPS[step].id === "done" ? (
              <>
                <span>Ga naar mijn dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            ) : (
              <>
                <span>Volgende</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  )
}
