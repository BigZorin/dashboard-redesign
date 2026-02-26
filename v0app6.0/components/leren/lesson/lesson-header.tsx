import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface LessonHeaderProps {
  courseId: string
  title: string
  lessonNumber: number
  totalLessons: number
}

export function LessonHeader({ courseId, title, lessonNumber, totalLessons }: LessonHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-5 pt-14 pb-4 bg-[#1e1839]">
      <Link
        href={`/leren/${courseId}`}
        className="h-9 w-9 rounded-full bg-secondary/60 backdrop-blur-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <ArrowLeft className="h-4 w-4" />
      </Link>
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-bold text-foreground font-mono truncate">{title}</h1>
        <p className="text-[11px] text-muted-foreground font-mono">
          Les {lessonNumber} van {totalLessons}
        </p>
      </div>
    </div>
  )
}
