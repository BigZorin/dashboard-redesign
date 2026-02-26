import { LessonHeader } from "@/components/leren/lesson/lesson-header"
import { VideoPlayer } from "@/components/leren/lesson/video-player"
import { LessonContent } from "@/components/leren/lesson/lesson-content"
import { BottomNav } from "@/components/shared/bottom-nav"

const lessonData: Record<string, {
  title: string
  number: number
  type: "video" | "artikel" | "quiz"
  duration: string
  heading: string
  content: string
}> = {
  l1: {
    title: "Welkom bij de cursus",
    number: 1,
    type: "video",
    duration: "5 min",
    heading: "Welkom bij de cursus",
    content: `Welkom bij deze cursus! In de komende modules gaan we alles leren over krachttraining.

Wat je gaat leren:
- De basis van krachttraining
- Correcte techniek voor de grote oefeningen
- Hoe je een effectief trainingsschema maakt
- Progressief overbelasten en periodisering

Neem de tijd om elke les goed door te nemen. Je kunt altijd terug naar eerdere lessen als je iets wilt herhalen.

Veel succes!`,
  },
  l6: {
    title: "Techniek: Deadlift",
    number: 6,
    type: "video",
    duration: "12 min",
    heading: "De conventionele deadlift",
    content: `De deadlift is een van de meest effectieve oefeningen voor het opbouwen van totale lichaamskracht. In deze les leer je de juiste techniek.

Belangrijke punten:
- Begin met de stang boven het midden van je voeten
- Grijp de stang net buiten je knieën
- Houd je rug recht en je borst omhoog
- Duw de grond weg met je benen
- Lock uit met je heupen, niet met je rug

Veelgemaakte fouten:
- De stang te ver van je lichaam houden
- Je rug ronden tijdens de lift
- Te snel gewicht verhogen
- Niet genoeg aandacht voor de excentrische fase

Tip: Film jezelf van de zijkant om je techniek te controleren. Vergelijk het met de voorbeelden in de video.`,
  },
}

const defaultLesson = {
  title: "Les",
  number: 1,
  type: "video" as const,
  duration: "5 min",
  heading: "Lesinhoud",
  content: "De inhoud van deze les wordt binnenkort toegevoegd.",
}

export default async function LessonPage({ params }: { params: Promise<{ courseId: string; lessonId: string }> }) {
  const { courseId, lessonId } = await params
  const lesson = lessonData[lessonId] ?? defaultLesson

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <LessonHeader
        courseId={courseId}
        title={lesson.title}
        lessonNumber={lesson.number}
        totalLessons={11}
      />

      {lesson.type === "video" && (
        <VideoPlayer duration={lesson.duration} />
      )}

      <main className="pb-40">
        <LessonContent
          type={lesson.type}
          duration={lesson.duration}
          title={lesson.heading}
          content={lesson.content}
        />
      </main>

      <BottomNav />
    </div>
  )
}
