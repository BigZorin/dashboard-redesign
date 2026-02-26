"use client"

import { Play } from "lucide-react"

interface VideoPlayerProps {
  duration: string
}

export function VideoPlayer({ duration }: VideoPlayerProps) {
  return (
    <div className="relative bg-[#1e1839] flex items-center justify-center" style={{ aspectRatio: "16/9" }}>
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b69]/60 to-[#1e1839]" />

      {/* Play button */}
      <button className="relative z-10 flex flex-col items-center gap-2 group">
        <div className="h-16 w-16 rounded-full bg-[#bad4e1]/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-[#bad4e1]/30 transition-colors border border-[#bad4e1]/30">
          <Play className="h-7 w-7 text-[#bad4e1] ml-1" />
        </div>
        <span className="text-xs text-muted-foreground">Video: {duration}</span>
      </button>
    </div>
  )
}
