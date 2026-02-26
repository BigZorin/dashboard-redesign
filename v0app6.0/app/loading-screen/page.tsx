"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

const loadingSteps = [
  "Profiel laden...",
  "Trainingsschema ophalen...",
  "Voedingsplan synchroniseren...",
  "Dashboard klaarzetten...",
]

export default function LoadingScreen() {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [logoRevealed, setLogoRevealed] = useState(false)
  const [lineWidth, setLineWidth] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    // Logo reveal
    const t0 = setTimeout(() => setLogoRevealed(true), 200)

    // Animated line under logo
    const t1 = setTimeout(() => setLineWidth(100), 600)

    // Progress simulation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        // Variable speed - starts fast, slows in middle, finishes fast
        const remaining = 100 - prev
        const increment = remaining > 60 ? 3.5 : remaining > 20 ? 1.8 : 4
        return Math.min(prev + increment, 100)
      })
    }, 80)

    // Step text changes
    const t2 = setTimeout(() => setCurrentStep(1), 1200)
    const t3 = setTimeout(() => setCurrentStep(2), 2400)
    const t4 = setTimeout(() => setCurrentStep(3), 3400)

    // Fade out and redirect
    const t5 = setTimeout(() => setFadeOut(true), 4200)
    const t6 = setTimeout(() => router.push("/"), 4900)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearInterval(interval)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(t6)
    }
  }, [router])

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center relative overflow-hidden transition-opacity duration-700 ${
        fadeOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
      }`}
      style={{ transitionProperty: "opacity, transform" }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0b0f]" />

      {/* Ambient glow that follows progress */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-1000 ease-out"
        style={{
          width: `${300 + progress * 4}px`,
          height: `${300 + progress * 4}px`,
          background: `radial-gradient(circle, rgba(186,212,225,${0.08 + progress * 0.002}) 0%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />

      {/* Rotating ring */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full border border-[#bad4e1]/[0.06]"
        style={{ animation: "spin-slow 20s linear infinite" }}
      >
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#bad4e1]/30"
        />
      </div>

      {/* Second rotating ring */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full border border-[#bad4e1]/[0.03]"
        style={{ animation: "spin-slow 30s linear infinite reverse" }}
      >
        <div
          className="absolute -bottom-1 right-1/4 w-1.5 h-1.5 rounded-full bg-[#bad4e1]/20"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div
          className="transition-all duration-1000 ease-out"
          style={{
            opacity: logoRevealed ? 1 : 0,
            transform: logoRevealed ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
          }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-full blur-2xl"
              style={{
                background: "radial-gradient(circle, rgba(186,212,225,0.4) 0%, transparent 70%)",
                transform: "scale(3.5)",
                animation: "pulse-glow 3s ease-in-out infinite",
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
        </div>

        {/* Brand name */}
        <h1
          className="text-2xl font-bold text-white font-mono tracking-tight mt-6 transition-all duration-700 delay-300"
          style={{
            opacity: logoRevealed ? 1 : 0,
            transform: logoRevealed ? "translateY(0)" : "translateY(10px)",
          }}
        >
          Evotion
        </h1>

        {/* Animated line */}
        <div className="w-16 h-px bg-white/10 mt-4 mb-10 relative overflow-hidden rounded-full">
          <div
            className="absolute inset-y-0 left-0 bg-[#bad4e1]/50 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${lineWidth}%` }}
          />
        </div>

        {/* Progress bar */}
        <div className="w-48 mb-5">
          <div className="h-[3px] bg-white/[0.08] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#bad4e1]/60 to-[#bad4e1] rounded-full transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              {/* Shimmer effect on progress bar */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                  animation: "shimmer 1.5s ease-in-out infinite",
                }}
              />
            </div>
          </div>
        </div>

        {/* Loading step text */}
        <div className="h-5 relative">
          {loadingSteps.map((step, i) => (
            <p
              key={step}
              className="text-[11px] text-[#bad4e1]/50 tracking-wider uppercase font-medium absolute left-1/2 -translate-x-1/2 whitespace-nowrap transition-all duration-500"
              style={{
                opacity: currentStep === i ? 1 : 0,
                transform: currentStep === i ? "translateY(0)" : currentStep > i ? "translateY(-8px)" : "translateY(8px)",
              }}
            >
              {step}
            </p>
          ))}
        </div>

        {/* Floating dots */}
        <div className="flex items-center gap-1.5 mt-8">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-[#bad4e1]/30"
              style={{
                animation: `dot-bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.6; transform: scale(3.5); }
          50% { opacity: 1; transform: scale(4); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes dot-bounce {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          40% {
            opacity: 1;
            transform: scale(1.8);
          }
        }
      `}</style>
    </div>
  )
}
