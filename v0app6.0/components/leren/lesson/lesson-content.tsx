"use client"

import { useState } from "react"
import { Video, Clock, CheckCircle2 } from "lucide-react"

interface LessonContentProps {
  type: "video" | "artikel" | "quiz"
  duration: string
  title: string
  content: string
}

export function LessonContent({ type, duration, title, content }: LessonContentProps) {
  const [completed, setCompleted] = useState(false)

  return (
    <div className="px-5 py-5">
      {/* Type badges */}
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary">
          <Video className="h-3 w-3 text-[#bad4e1]" />
          <span className="text-[11px] font-semibold text-foreground">{type === "video" ? "Video" : type === "artikel" ? "Artikel" : "Quiz"}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">{duration}</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold text-foreground font-mono tracking-tight mb-4">{title}</h2>

      {/* Content block */}
      <div className="rounded-2xl bg-card border border-border p-5 mb-6">
        <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {content}
        </div>
      </div>

      {/* Complete button */}
      <button
        onClick={() => setCompleted(!completed)}
        className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-sm transition-all ${
          completed
            ? "bg-[#bad4e1]/20 text-[#bad4e1] border border-[#bad4e1]/30"
            : "bg-[#bad4e1] text-[#1e1839]"
        }`}
      >
        <CheckCircle2 className="h-5 w-5" />
        {completed ? "Voltooid" : "Markeer als voltooid"}
      </button>
    </div>
  )
}
