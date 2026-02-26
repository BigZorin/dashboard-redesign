"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Lock, Eye, EyeOff, Shield, Trash2, Download, KeyRound } from "lucide-react"
import { BottomNav } from "@/components/shared/bottom-nav"

export default function PrivacyPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#1a1a2e] border-b border-border">
        <div className="flex items-center gap-4 px-5 pt-14 pb-4">
          <Link
            href="/meer"
            className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-foreground hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="text-lg font-bold text-foreground font-mono">Privacy & Beveiliging</h1>
        </div>
      </div>

      <main className="pb-40">
        {/* Change password */}
        <div className="px-4 pt-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-2 font-mono">
            Wachtwoord wijzigen
          </p>
          <div className="rounded-2xl bg-card border border-border p-5 flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Huidig wachtwoord</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Voer je huidige wachtwoord in"
                  className="w-full bg-secondary rounded-xl py-3 pl-10 pr-10 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border border-transparent focus:border-[#bad4e1]/30 transition-colors"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Nieuw wachtwoord</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimaal 8 tekens"
                  className="w-full bg-secondary rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border border-transparent focus:border-[#bad4e1]/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-1.5 block">Bevestig wachtwoord</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Herhaal je nieuwe wachtwoord"
                  className="w-full bg-secondary rounded-xl py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border border-transparent focus:border-[#bad4e1]/30 transition-colors"
                />
              </div>
            </div>

            <button className="w-full py-3.5 rounded-2xl bg-[#bad4e1] text-background font-semibold text-sm hover:bg-[#a8c4d1] transition-colors">
              Wachtwoord opslaan
            </button>
          </div>
        </div>

        {/* Data & Privacy */}
        <div className="px-4 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1 pb-2 font-mono">
            Gegevens
          </p>
          <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/15 flex items-center justify-center shrink-0">
                <Download className="h-5 w-5 text-[#bad4e1]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Gegevens downloaden</p>
                <p className="text-xs text-muted-foreground">Download al je data als bestand</p>
              </div>
            </button>

            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-secondary/50 transition-colors text-left">
              <div className="h-10 w-10 rounded-xl bg-[#bad4e1]/15 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-[#bad4e1]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">Privacybeleid</p>
                <p className="text-xs text-muted-foreground">Lees ons privacybeleid</p>
              </div>
            </button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="px-4 pt-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-red-400/70 px-1 pb-2 font-mono">
            Gevarenzone
          </p>
          <div className="rounded-2xl bg-card border border-red-500/20 overflow-hidden">
            <button className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-red-500/5 transition-colors text-left">
              <div className="h-10 w-10 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-400">Account verwijderen</p>
                <p className="text-xs text-muted-foreground">Verwijder je account en alle data permanent</p>
              </div>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
