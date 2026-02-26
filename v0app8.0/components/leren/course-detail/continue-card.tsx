import Link from "next/link"
import { Play, ChevronRight } from "lucide-react"

interface ContinueCardProps {
  courseId: string
  lessonId: string
  lessonTitle: string
}

export function ContinueCard({ courseId, lessonId, lessonTitle }: ContinueCardProps) {
  return (
    <div className="mx-5 mb-5">
      <Link
        href={`/leren/${courseId}/les/${lessonId}`}
        className="group flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-[#bad4e1]/30 transition-all"
      >
        <div className="h-11 w-11 rounded-xl bg-[#bad4e1]/15 flex items-center justify-center shrink-0 group-hover:bg-[#bad4e1]/25 transition-colors">
          <Play className="h-5 w-5 text-[#bad4e1] ml-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#bad4e1] font-mono">Verder met</p>
          <p className="text-sm font-bold text-foreground font-mono mt-0.5 truncate">{lessonTitle}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-[#bad4e1] transition-colors shrink-0" />
      </Link>
    </div>
  )
}
