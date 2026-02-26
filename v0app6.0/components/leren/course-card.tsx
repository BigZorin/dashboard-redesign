import Link from "next/link"
import Image from "next/image"
import { Layers, Clock, User, CheckCircle2, Lock } from "lucide-react"

export interface Course {
  id: string
  title: string
  category: string
  banner: string
  categoryColor: string
  modules: number
  duration: string
  author: string
  lessonsCompleted: number
  lessonsTotal: number
  locked?: boolean
}

export function CourseCard({ course }: { course: Course }) {
  const progress = course.lessonsTotal > 0 ? (course.lessonsCompleted / course.lessonsTotal) * 100 : 0
  const isCompleted = progress === 100

  const content = (
    <div className="relative overflow-hidden rounded-2xl border border-border">
      {/* Banner image */}
      <div className="relative h-44 w-full overflow-hidden">
        <Image
          src={course.banner}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

        {/* Category badge */}
        <div className="absolute top-4 left-5">
          <div className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ${course.categoryColor}`}>
            {course.category}
          </div>
        </div>

        {/* Lock icon for locked courses */}
        {course.locked && (
          <div className="absolute top-4 right-5">
            <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <Lock className="h-4 w-4 text-white/80" />
            </div>
          </div>
        )}

        {/* Completed check */}
        {isCompleted && !course.locked && (
          <div className="absolute top-4 right-5">
            <CheckCircle2 className="h-7 w-7 text-[#bad4e1] fill-[#bad4e1]/20" />
          </div>
        )}

        {/* Title + progress over image */}
        <div className="absolute bottom-4 left-5 right-5">
          <h3 className="text-lg font-bold text-white font-mono tracking-tight text-balance">{course.title}</h3>

          {!course.locked && (
            <div className="mt-2.5 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#bad4e1] transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[11px] text-white/70 font-mono shrink-0">
                {isCompleted ? "Voltooid" : `${course.lessonsCompleted}/${course.lessonsTotal} lessen`}
              </span>
            </div>
          )}

          {course.locked && (
            <div className="mt-2.5">
              <span className="text-[11px] text-white/50 font-medium">Ontgrendel deze cursus</span>
            </div>
          )}
        </div>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 px-5 py-3 bg-card">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Layers className="h-3 w-3" />
          <span className="text-[11px]">{course.modules} modules</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-[11px]">{course.duration}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <User className="h-3 w-3" />
          <span className="text-[11px]">{course.author}</span>
        </div>
      </div>
    </div>
  )

  if (course.locked) {
    return <div className="opacity-75">{content}</div>
  }

  return (
    <Link href={`/leren/${course.id}`} className="block transition-transform active:scale-[0.98]">
      {content}
    </Link>
  )
}
