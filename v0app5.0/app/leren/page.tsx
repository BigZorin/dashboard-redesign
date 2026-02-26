"use client"

import { useState } from "react"
import { LerenHeader } from "@/components/leren/leren-header"
import { CourseCard, type Course } from "@/components/leren/course-card"
import { BottomNav } from "@/components/shared/bottom-nav"

const courses: Course[] = [
  {
    id: "strength-fundamentals",
    title: "Fundamentals of Strength Training",
    category: "Training",
    banner: "/images/courses/strength-fundamentals.jpg",
    categoryColor: "bg-[#bad4e1]/20 text-[#bad4e1]",
    modules: 6,
    duration: "4 uur",
    author: "Mark Jensen",
    lessonsCompleted: 18,
    lessonsTotal: 24,
  },
  {
    id: "voeding-masterclass",
    title: "Voeding & Macros Masterclass",
    category: "Voeding",
    banner: "/images/courses/voeding-masterclass.jpg",
    categoryColor: "bg-white/15 text-white",
    modules: 5,
    duration: "3.5 uur",
    author: "Mark Jensen",
    lessonsCompleted: 20,
    lessonsTotal: 20,
  },
  {
    id: "mindset-motivatie",
    title: "Mindset & Motivatie",
    category: "Mindset",
    banner: "/images/courses/mindset-motivatie.jpg",
    categoryColor: "bg-white/15 text-white",
    modules: 4,
    duration: "2.5 uur",
    author: "Mark Jensen",
    lessonsCompleted: 0,
    lessonsTotal: 16,
  },
  {
    id: "slaap-herstel",
    title: "Slaap & Herstel Optimalisatie",
    category: "Lifestyle",
    banner: "/images/courses/slaap-herstel.jpg",
    categoryColor: "bg-white/15 text-white",
    modules: 3,
    duration: "2 uur",
    author: "Mark Jensen",
    lessonsCompleted: 0,
    lessonsTotal: 12,
    locked: true,
  },
]

export default function LerenPage() {
  const [filter, setFilter] = useState("Alles")

  const completedCount = courses.filter((c) => c.lessonsCompleted === c.lessonsTotal && !c.locked).length
  const inProgressCount = courses.filter((c) => c.lessonsCompleted > 0 && c.lessonsCompleted < c.lessonsTotal).length

  const filtered = courses.filter((course) => {
    if (filter === "Alles") return true
    if (filter === "Bezig") return course.lessonsCompleted > 0 && course.lessonsCompleted < course.lessonsTotal
    if (filter === "Voltooid") return course.lessonsCompleted === course.lessonsTotal && !course.locked
    return true
  })

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <LerenHeader
        activeFilter={filter}
        onFilterChange={setFilter}
        completedCount={completedCount}
        inProgressCount={inProgressCount}
      />

      <main className="flex flex-col gap-5 px-5 pb-40">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">Geen cursussen gevonden voor dit filter.</p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}
