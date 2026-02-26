import { CourseHeader } from "@/components/leren/course-detail/course-header"
import { ContinueCard } from "@/components/leren/course-detail/continue-card"
import { CourseModules } from "@/components/leren/course-detail/course-modules"

const coursesData: Record<string, {
  title: string
  banner: string
  category: string
  categoryColor: string
  modules: number
  duration: string
  author: string
  lessonsCompleted: number
  lessonsTotal: number
  continueLesson?: { id: string; title: string }
}> = {
  "strength-fundamentals": {
    title: "Fundamentals of Strength Training",
    banner: "/images/courses/strength-fundamentals.jpg",
    category: "Training",
    categoryColor: "bg-[#bad4e1]/20 text-[#bad4e1]",
    modules: 6,
    duration: "4 uur",
    author: "Mark Jensen",
    lessonsCompleted: 5,
    lessonsTotal: 11,
    continueLesson: { id: "l6", title: "Techniek: Deadlift" },
  },
  "voeding-masterclass": {
    title: "Voeding & Macros Masterclass",
    banner: "/images/courses/voeding-masterclass.jpg",
    category: "Voeding",
    categoryColor: "bg-white/15 text-white",
    modules: 5,
    duration: "3.5 uur",
    author: "Mark Jensen",
    lessonsCompleted: 20,
    lessonsTotal: 20,
  },
  "mindset-motivatie": {
    title: "Mindset & Motivatie",
    banner: "/images/courses/mindset-motivatie.jpg",
    category: "Mindset",
    categoryColor: "bg-white/15 text-white",
    modules: 4,
    duration: "2.5 uur",
    author: "Mark Jensen",
    lessonsCompleted: 0,
    lessonsTotal: 16,
    continueLesson: { id: "l1", title: "Welkom bij de cursus" },
  },
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const course = coursesData[courseId] ?? coursesData["strength-fundamentals"]!

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <CourseHeader
        title={course.title}
        banner={course.banner}
        category={course.category}
        categoryColor={course.categoryColor}
        modules={course.modules}
        duration={course.duration}
        author={course.author}
        lessonsCompleted={course.lessonsCompleted}
        lessonsTotal={course.lessonsTotal}
      />

      <main className="pb-8">
        {course.continueLesson && (
          <div className="mt-5">
            <ContinueCard
              courseId={courseId}
              lessonId={course.continueLesson.id}
              lessonTitle={course.continueLesson.title}
            />
          </div>
        )}

        <CourseModules courseId={courseId} />
      </main>
    </div>
  )
}
