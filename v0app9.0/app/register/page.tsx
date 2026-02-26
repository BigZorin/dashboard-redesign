"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck, ArrowRight, Phone } from "lucide-react"

export default function RegisterPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!firstName || !lastName || !email || !phone || !password || !confirmPassword) {
      setError("Vul alle velden in")
      return
    }
    if (password.length < 6) {
      setError("Wachtwoord moet minimaal 6 tekens zijn")
      return
    }
    if (password !== confirmPassword) {
      setError("Wachtwoorden komen niet overeen")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    router.push("/intake")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="px-5 pt-14 pb-6">
        <p className="text-xs text-[#bad4e1] font-semibold uppercase tracking-wider font-mono">Stap 1 van 2</p>
        <h1 className="text-2xl font-bold text-foreground font-mono tracking-tight mt-1">
          Account aanmaken
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Begin je coaching journey
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-8">
        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name fields - side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Voornaam"
                autoComplete="given-name"
                className="w-full rounded-xl bg-card border border-border pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
              />
            </div>
            <div>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Achternaam"
                autoComplete="family-name"
                className="w-full rounded-xl bg-card border border-border px-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mailadres"
              autoComplete="email"
              className="w-full rounded-xl bg-card border border-border pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Phone className="h-5 w-5" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Telefoonnummer"
              autoComplete="tel"
              className="w-full rounded-xl bg-card border border-border pl-12 pr-4 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Lock className="h-5 w-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Wachtwoord (min. 6 tekens)"
              autoComplete="new-password"
              className="w-full rounded-xl bg-card border border-border pl-12 pr-12 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Bevestig wachtwoord"
              autoComplete="new-password"
              className="w-full rounded-xl bg-card border border-border pl-12 pr-12 py-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#bad4e1]/40 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </form>

        {/* Login link */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {"Al een account? "}
          <Link href="/login" className="text-foreground font-semibold underline hover:text-[#bad4e1] transition-colors">
            Inloggen
          </Link>
        </p>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 bg-gradient-to-t from-background via-background to-transparent">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full h-14 rounded-2xl bg-[#bad4e1] text-[#0a0a0a] font-bold font-mono flex items-center justify-center gap-2 hover:bg-[#bad4e1]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
        >
          {loading ? "Account aanmaken..." : "Volgende"}
          {!loading && <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
