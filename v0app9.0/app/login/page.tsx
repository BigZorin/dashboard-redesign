"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    await new Promise((r) => setTimeout(r, 1200))

    if (email && password) {
      router.push("/loading-screen")
    } else {
      setError("Vul je e-mail en wachtwoord in")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Full gradient background */}
      <div className="absolute inset-0 bg-[#0a0b0f]" />

      {/* Large radial gradient - top center, #bad4e1 tinted */}
      <div
        className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(186,212,225,0.18) 0%, rgba(186,212,225,0.06) 40%, transparent 70%)",
          animation: "bg-breathe 8s ease-in-out infinite",
        }}
      />

      {/* Secondary glow - bottom right */}
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(186,212,225,0.1) 0%, rgba(186,212,225,0.03) 50%, transparent 70%)",
          animation: "bg-breathe 8s ease-in-out infinite 4s",
        }}
      />

      {/* Tertiary glow - left middle */}
      <div
        className="absolute top-[30%] left-[-15%] w-[500px] h-[500px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(186,212,225,0.08) 0%, transparent 60%)",
          animation: "bg-breathe 10s ease-in-out infinite 2s",
        }}
      />

      {/* Content */}
      <div className="w-full max-w-sm relative z-10">
        {/* Logo + branding */}
        <div
          className="flex flex-col items-center mb-12 transition-all duration-1000"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(-20px)",
          }}
        >
          <div className="relative mb-6">
            {/* Soft glow behind logo */}
            <div
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                background: "radial-gradient(circle, rgba(186,212,225,0.5) 0%, transparent 70%)",
                transform: "scale(4)",
                animation: "bg-breathe 4s ease-in-out infinite",
              }}
            />
            <Image
              src="/images/evotion-logo-wit.png"
              alt="Evotion"
              width={72}
              height={72}
              className="relative z-10"
            />
          </div>
          <h1 className="text-3xl font-bold text-white font-mono tracking-tight">Evotion</h1>
          <p className="text-[11px] text-[#bad4e1]/60 mt-2 tracking-[0.2em] uppercase font-medium">Welkom terug</p>
        </div>

        {/* Form card */}
        <div
          className="rounded-3xl bg-white/[0.04] backdrop-blur-md border border-white/[0.08] p-6 transition-all duration-1000 delay-200"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div
              className="transition-all duration-700 delay-[400ms]"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider mb-2.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jouw@email.nl"
                autoComplete="email"
                className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 focus:bg-white/[0.08] transition-all duration-300"
              />
            </div>

            {/* Password */}
            <div
              className="transition-all duration-700 delay-[500ms]"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-[11px] font-semibold text-[#bad4e1]/50 uppercase tracking-wider">Wachtwoord</label>
                <Link href="/wachtwoord-vergeten" className="text-[10px] text-[#bad4e1]/40 hover:text-[#bad4e1]/70 transition-colors uppercase tracking-wider font-medium">
                  Vergeten?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Je wachtwoord"
                  autoComplete="current-password"
                  className="w-full rounded-xl bg-white/[0.06] border border-white/[0.1] px-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/25 focus:border-[#bad4e1]/25 focus:bg-white/[0.08] transition-all duration-300 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-300">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div
              className="transition-all duration-700 delay-[600ms] pt-1"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
              }}
            >
              <button
                type="submit"
                disabled={loading}
                className="group w-full py-4 rounded-2xl bg-[#bad4e1] text-[#0a0a0a] font-semibold text-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_40px_rgba(186,212,225,0.2)] hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
                    <span>Inloggen...</span>
                  </div>
                ) : (
                  <>
                    <span>Inloggen</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Register link */}
        <div
          className="transition-all duration-1000 delay-[800ms]"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <p className="text-center text-sm text-white/40 mt-8">
            {"Nog geen account? "}
            <Link href="/register" className="text-[#bad4e1] font-semibold hover:text-[#bad4e1]/80 transition-colors">
              Registreren
            </Link>
          </p>
        </div>

        {/* Version */}
        <div
          className="transition-all duration-1000 delay-[1000ms]"
          style={{ opacity: mounted ? 1 : 0 }}
        >
          <p className="text-center text-[10px] text-white/15 mt-12 uppercase tracking-[0.2em] font-medium">Evotion v1.0.0</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bg-breathe {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.7;
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  )
}
