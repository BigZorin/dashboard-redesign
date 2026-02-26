"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Eye, EyeOff, Check } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const passwordChecks = [
    { label: "Minimaal 8 tekens", valid: password.length >= 8 },
    { label: "Bevat een hoofdletter", valid: /[A-Z]/.test(password) },
    { label: "Bevat een cijfer", valid: /[0-9]/.test(password) },
  ]

  const allChecksValid = passwordChecks.every((c) => c.valid)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName || !email || !password) {
      setError("Vul alle velden in")
      return
    }
    if (!allChecksValid) {
      setError("Wachtwoord voldoet niet aan de eisen")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {/* Logo + branding */}
        <div className="flex flex-col items-center mb-10">
          <Image
            src="/images/evotion-logo-wit.png"
            alt="Evotion"
            width={64}
            height={64}
            className="mb-4"
          />
          <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight">Account aanmaken</h1>
          <p className="text-sm text-muted-foreground mt-1">Begin je fitness journey</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Voornaam</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Voornaam"
                autoComplete="given-name"
                className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Achternaam</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Achternaam"
                autoComplete="family-name"
                className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jouw@email.nl"
              autoComplete="email"
              className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">Wachtwoord</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Kies een sterk wachtwoord"
                autoComplete="new-password"
                className="w-full rounded-xl bg-secondary border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>

            {/* Password requirements */}
            {password.length > 0 && (
              <div className="flex flex-col gap-1.5 mt-3">
                {passwordChecks.map((check) => (
                  <div key={check.label} className="flex items-center gap-2">
                    <div
                      className={`h-4 w-4 rounded-full flex items-center justify-center transition-colors ${
                        check.valid ? "bg-[#bad4e1]" : "bg-secondary border border-border"
                      }`}
                    >
                      {check.valid && <Check className="h-2.5 w-2.5 text-[#0a0a0a]" />}
                    </div>
                    <span className={`text-xs transition-colors ${check.valid ? "text-foreground" : "text-muted-foreground"}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-[#bad4e1] text-[#0a0a0a] font-semibold text-sm hover:bg-[#bad4e1]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Account aanmaken..." : "Account aanmaken"}
          </button>
        </form>

        {/* Terms */}
        <p className="text-center text-[11px] text-muted-foreground mt-6 leading-relaxed">
          {"Door te registreren ga je akkoord met onze "}
          <Link href="/voorwaarden" className="text-[#bad4e1] hover:underline">voorwaarden</Link>
          {" en "}
          <Link href="/privacy" className="text-[#bad4e1] hover:underline">privacybeleid</Link>
          .
        </p>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          {"Al een account? "}
          <Link href="/login" className="text-[#bad4e1] font-semibold hover:text-[#bad4e1]/80 transition-colors">
            Inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
