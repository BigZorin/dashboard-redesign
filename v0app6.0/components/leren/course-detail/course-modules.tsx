"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown, ChevronRight, CheckCircle2, Video, FileText, HelpCircle } from "lucide-react"

interface Lesson {
  id: string
  title: string
  duration: string
  type: "video" | "artikel" | "quiz"
  completed: boolean
}

interface Module {
  id: string
  number: number
  title: string
  lessons: Lesson[]
}

const typeIcons = {
  video: Video,
  artikel: FileText,
  quiz: HelpCircle,
}

const typeLabels = {
  video: "Video",
  artikel: "Artikel",
  quiz: "Quiz",
}

const modules: Module[] = [
  {
    id: "m1",
    number: 1,
    title: "Introductie",
    lessons: [
      { id: "l1", title: "Welkom bij de cursus", duration: "5 min", type: "video", completed: true },
      { id: "l2", title: "Wat kun je verwachten?", duration: "3 min", type: "artikel", completed: true },
      { id: "l3", title: "Basiskennis test", duration: "10 min", type: "quiz", completed: true },
    ],
  },
  {
    id: "m2",
    number: 2,
    title: "Fundamentals",
    lessons: [
      { id: "l4", title: "Spiergroepen & bewegingen", duration: "8 min", type: "video", completed: true },
      { id: "l5", title: "Techniek: Squat", duration: "12 min", type: "video", completed: true },
      { id: "l6", title: "Techniek: Deadlift", duration: "12 min", type: "video", completed: false },
      { id: "l7", title: "Module test", duration: "8 min", type: "quiz", completed: false },
    ],
  },
  {
    id: "m3",
    number: 3,
    title: "Programmering",
    lessons: [
      { id: "l8", title: "Volume & intensiteit", duration: "10 min", type: "video", completed: false },
      { id: "l9", title: "Periodisering uitgelegd", duration: "7 min", type: "artikel", completed: false },
      { id: "l10", title: "Je eigen schema bouwen", duration: "15 min", type: "video", completed: false },
      { id: "l11", title: "Eindtoets", duration: "12 min", type: "quiz", completed: false },
    ],
  },
]

export function CourseModules({ courseId }: { courseId: string }) {
  const [openModule, setOpenModule] = useState<string | null>(
    // Open the first module with incomplete lessons
    modules.find((m) => m.lessons.some((l) => !l.completed))?.id ?? modules[0]?.id ?? null
  )

  return (
    <div className="flex flex-col gap-2 px-5">
      {modules.map((mod) => {
        const isOpen = openModule === mod.id
        const completedCount = mod.lessons.filter((l) => l.completed).length
        const allCompleted = completedCount === mod.lessons.length

        return (
          <div key={mod.id} className="rounded-2xl bg-card border border-border overflow-hidden">
            {/* Module header */}
            <button
              onClick={() => setOpenModule(isOpen ? null : mod.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-card/80"
            >
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold font-mono ${
                  allCompleted
                    ? "bg-[#bad4e1]/15 text-[#bad4e1]"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {allCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-[#bad4e1]" />
                ) : (
                  mod.number
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground font-mono">
                  Module {mod.number}: {mod.title}
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {completedCount}/{mod.lessons.length} voltooid
                </p>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Lessons */}
            {isOpen && (
              <div className="border-t border-border">
                {mod.lessons.map((lesson, idx) => {
                  const TypeIcon = typeIcons[lesson.type]
                  return (
                    <Link
                      key={lesson.id}
                      href={`/leren/${courseId}/les/${lesson.id}`}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors hover:bg-secondary/50 ${
                        idx < mod.lessons.length - 1 ? "border-b border-border/50" : ""
                      }`}
                    >
                      {lesson.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-[#bad4e1] shrink-0" />
                      ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${lesson.completed ? "text-muted-foreground" : "text-foreground"}`}>
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[11px] text-muted-foreground">{lesson.duration}</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <TypeIcon className="h-3 w-3" />
                            <span className="text-[11px]">{typeLabels[lesson.type]}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
