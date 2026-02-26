"use client"

import { useState } from "react"
import { Search, Users, Crown, Dumbbell, User, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ============================================================================
// PLACEHOLDER DATA — Vervang met echte data uit Supabase
//
// Supabase tabellen:
//   - users (id, naam, email, rol, avatar_url, created_at, last_sign_in_at)
//   - Supabase Auth voor authenticatie (auth.users)
//
// Rollen: "admin" | "coach" | "client"
// Rol wijzigen: update users.rol + Supabase Auth metadata
// Verwijderen: soft-delete (users.deleted_at) of hard-delete via Supabase Admin API
// ============================================================================

type Rol = "admin" | "coach" | "client"

interface Gebruiker {
  id: string
  naam: string
  email: string
  rol: Rol
  initialen: string
  geregistreerd: string
  laatstActief: string
}

const gebruikers: Gebruiker[] = [
  { id: "1", naam: "Zorin Wijnands", email: "zorin@hotmail.nl", rol: "admin", initialen: "ZW", geregistreerd: "12 feb 2026", laatstActief: "20 feb" },
  { id: "2", naam: "George Clooney", email: "zorinwijnands.prive@outlook.com", rol: "client", initialen: "GC", geregistreerd: "16 feb 2026", laatstActief: "18 feb" },
  { id: "3", naam: "Michael Jackson", email: "info@bigzorin.nl", rol: "client", initialen: "MJ", geregistreerd: "15 feb 2026", laatstActief: "20 feb" },
]

const rolConfig: Record<Rol, { label: string; kleur: string; icon: typeof Crown }> = {
  admin: { label: "Admin", kleur: "bg-chart-5/10 text-chart-5 border-chart-5/20", icon: Crown },
  coach: { label: "Coach", kleur: "bg-primary/10 text-primary border-primary/20", icon: Dumbbell },
  client: { label: "Client", kleur: "bg-chart-2/10 text-chart-2 border-chart-2/20", icon: User },
}

export function GebruikersSection() {
  const [zoekTerm, setZoekTerm] = useState("")
  const [filterRol, setFilterRol] = useState<"alle" | Rol>("alle")

  const gefilterd = gebruikers.filter((g) => {
    const matchZoek = zoekTerm === "" ||
      g.naam.toLowerCase().includes(zoekTerm.toLowerCase()) ||
      g.email.toLowerCase().includes(zoekTerm.toLowerCase())
    const matchRol = filterRol === "alle" || g.rol === filterRol
    return matchZoek && matchRol
  })

  const telRol = (rol: Rol) => gebruikers.filter(g => g.rol === rol).length

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Gebruikers</h2>
        <p className="text-xs text-muted-foreground">Rollen beheren en accounts verwijderen</p>
      </div>

      {/* KPI Kaarten */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Totaal", waarde: gebruikers.length, icon: Users },
          { label: "Admins", waarde: telRol("admin"), icon: Crown },
          { label: "Coaches", waarde: telRol("coach"), icon: Dumbbell },
          { label: "Clients", waarde: telRol("client"), icon: User },
        ].map((kpi) => (
          <Card key={kpi.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <kpi.icon className="size-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{kpi.waarde}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Zoek + Filter */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Zoek op naam of email..."
                value={zoekTerm}
                onChange={(e) => setZoekTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-1.5">
              {(["alle", "admin", "coach", "client"] as const).map((rol) => (
                <button
                  key={rol}
                  onClick={() => setFilterRol(rol)}
                  className={cn(
                    "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                    filterRol === rol
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {rol === "alle" ? "Alle" : rolConfig[rol].label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gebruikerslijst */}
      <Card className="border-border">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground">
              Geregistreerde Gebruikers ({gefilterd.length})
            </h3>
          </div>

          <div className="flex flex-col gap-1">
            {gefilterd.map((gebruiker) => {
              const config = rolConfig[gebruiker.rol]
              return (
                <div
                  key={gebruiker.id}
                  className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-border">
                      <AvatarFallback className={cn(
                        "text-xs font-semibold",
                        gebruiker.rol === "admin" ? "bg-chart-5/10 text-chart-5" : "bg-secondary text-foreground"
                      )}>
                        {gebruiker.initialen}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{gebruiker.naam}</p>
                        <Badge variant="outline" className={cn("text-[10px] border", config.kleur)}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {gebruiker.email} &middot; Geregistreerd: {gebruiker.geregistreerd} &middot; Laatst actief: {gebruiker.laatstActief}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Select defaultValue={gebruiker.rol}>
                      <SelectTrigger className="h-8 w-[100px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="client">Client</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
