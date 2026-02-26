"use client"

import { useEffect, useState } from "react"
import { Bell, Search, Sparkles } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { getNotificationCount } from "@/app/actions/dashboard"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  onAiClick?: () => void
}

export function DashboardHeader({ title, subtitle, onAiClick }: DashboardHeaderProps) {
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    getNotificationCount().then(setNotificationCount).catch(() => {})
    // Refresh every 60 seconds
    const interval = setInterval(() => {
      getNotificationCount().then(setNotificationCount).catch(() => {})
    }, 60000)
    return () => clearInterval(interval)
  }, [])
  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="h-6" />
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Zoek cliënten, programma's..."
            className="w-64 pl-9 h-9 bg-secondary border-border"
          />
        </div>
        {onAiClick && (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={onAiClick}
          >
            <Sparkles className="size-4" />
            <span className="hidden sm:inline text-xs font-medium">AI Coach</span>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
          <Bell className="size-4" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 size-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
              {notificationCount}
            </span>
          )}
          <span className="sr-only">Meldingen</span>
        </Button>
      </div>
    </header>
  )
}
