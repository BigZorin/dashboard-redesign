"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Info, Layers, Calendar, Dumbbell, X } from "lucide-react"

interface ProgramHeroProps {
  name: string
  description: string
  image: string
  blocks: number
  weeks: number
  trainings: number
}

export function ProgramHero({ name, description, image, blocks, weeks, trainings }: ProgramHeroProps) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      <div className="relative h-56 w-full overflow-hidden">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

        {/* Top actions */}
        <div className="absolute top-12 left-5 right-5 flex items-center justify-between">
          <Link
            href="/training"
            className="h-9 w-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/60 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <button
            onClick={() => setShowInfo(true)}
            className="h-9 w-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/60 transition-colors"
          >
            <Info className="h-4 w-4" />
          </button>
        </div>

        {/* Title + meta */}
        <div className="absolute bottom-5 left-5 right-5">
          <h1 className="text-xl font-bold text-foreground font-mono tracking-tight text-balance">{name}</h1>
          <div className="flex items-center gap-2 mt-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/40 backdrop-blur-sm">
              <Layers className="h-3 w-3 text-[#bad4e1]" />
              <span className="text-[10px] font-semibold text-foreground font-mono">{blocks} blokken</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/40 backdrop-blur-sm">
              <Calendar className="h-3 w-3 text-[#bad4e1]" />
              <span className="text-[10px] font-semibold text-foreground font-mono">{weeks} weken</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-background/40 backdrop-blur-sm">
              <Dumbbell className="h-3 w-3 text-[#bad4e1]" />
              <span className="text-[10px] font-semibold text-foreground font-mono">{trainings} trainingen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info popup overlay */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}
          />

          {/* Bottom sheet */}
          <div className="relative w-full max-w-lg animate-in slide-in-from-bottom duration-300">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 bg-card rounded-t-3xl">
              <div className="h-1 w-10 rounded-full bg-muted-foreground/30" />
            </div>

            <div className="bg-card px-6 pb-8 pt-2">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1] font-mono">Over dit programma</p>
                  <h2 className="text-lg font-bold text-foreground font-mono mt-1">{name}</h2>
                </div>
                <button
                  onClick={() => setShowInfo(false)}
                  className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>

              <div className="flex items-center gap-3 mt-5">
                <div className="flex-1 rounded-xl bg-secondary p-3 text-center">
                  <Layers className="h-4 w-4 text-[#bad4e1] mx-auto mb-1" />
                  <span className="text-lg font-bold text-foreground font-mono">{blocks}</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Blokken</p>
                </div>
                <div className="flex-1 rounded-xl bg-secondary p-3 text-center">
                  <Calendar className="h-4 w-4 text-[#bad4e1] mx-auto mb-1" />
                  <span className="text-lg font-bold text-foreground font-mono">{weeks}</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Weken</p>
                </div>
                <div className="flex-1 rounded-xl bg-secondary p-3 text-center">
                  <Dumbbell className="h-4 w-4 text-[#bad4e1] mx-auto mb-1" />
                  <span className="text-lg font-bold text-foreground font-mono">{trainings}</span>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Trainingen</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
