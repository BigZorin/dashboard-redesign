"use client"

import Link from "next/link"
import { Bell, MessageCircle } from "lucide-react"

export function Header() {
  return (
    <header className="flex items-center justify-between px-5 pt-14 pb-2">
      <div className="flex items-center gap-3">
        <div className="relative h-11 w-11 rounded-full bg-[#bad4e1] flex items-center justify-center">
          <span className="text-lg font-bold text-[#1e1839] font-mono">M</span>
          <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-[#bad4e1] border-2 border-background" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground font-mono tracking-tight">Michael</h1>
          <p className="text-xs text-muted-foreground">Goedemiddag</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="relative h-10 w-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-secondary/80">
          <Bell className="h-4.5 w-4.5 text-muted-foreground" />
          <div className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#bad4e1]" />
        </button>
        <Link href="/berichten" className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center transition-colors hover:bg-secondary/80">
          <MessageCircle className="h-4.5 w-4.5 text-muted-foreground" />
        </Link>
      </div>
    </header>
  )
}
