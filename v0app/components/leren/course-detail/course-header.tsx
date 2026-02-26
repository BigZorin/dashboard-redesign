import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Layers, Clock, User } from "lucide-react"

interface CourseHeaderProps {
  title: string
  banner: string
  category: string
  categoryColor: string
  modules: number
  duration: string
  author: string
  lessonsCompleted: number
  lessonsTotal: number
}

export function CourseHeader({
  title,
  banner,
  category,
  categoryColor,
  modules,
  duration,
  author,
  lessonsCompleted,
  lessonsTotal,
}: CourseHeaderProps) {
  const progress = lessonsTotal > 0 ? (lessonsCompleted / lessonsTotal) * 100 : 0

  return (
    <div className="relative h-64 w-full overflow-hidden">
      <Image
        src={banner}
        alt={title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />

      {/* Top actions */}
      <div className="absolute top-12 left-5 right-5 flex items-center justify-between">
        <Link
          href="/leren"
          className="h-9 w-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${categoryColor}`}>
          {category}
        </div>
      </div>

      {/* Title + meta + progress */}
      <div className="absolute bottom-5 left-5 right-5">
        <h1 className="text-xl font-bold text-foreground font-mono tracking-tight text-balance">{title}</h1>

        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1 text-foreground/70">
            <Layers className="h-3 w-3" />
            <span className="text-[10px] font-mono">{modules} modules</span>
          </div>
          <div className="flex items-center gap-1 text-foreground/70">
            <Clock className="h-3 w-3" />
            <span className="text-[10px] font-mono">{duration}</span>
          </div>
          <div className="flex items-center gap-1 text-foreground/70">
            <User className="h-3 w-3" />
            <span className="text-[10px] font-mono">{author}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-white/15 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#bad4e1] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] text-foreground/60 font-mono shrink-0">
            {lessonsCompleted}/{lessonsTotal} lessen
          </span>
        </div>
      </div>
    </div>
  )
}
