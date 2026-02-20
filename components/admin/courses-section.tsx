"use client"

import { useState } from "react"
import {
  Plus, Search, Filter, MoreHorizontal, GraduationCap, Play, FileText,
  Clock, Users, BarChart3, ArrowLeft, Trash2, Copy, Eye, Upload,
  ChevronRight, ChevronDown, GripVertical, Video, Image, BookOpen,
  Award, Lock, Globe, Sparkles, CheckCircle2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// ============================================================================
// COURSES / E-LEARNING — ADMIN-ONLY
//
// Dit is het e-learning gedeelte van CoachHub. Alleen admins kunnen courses
// aanmaken en beheren. Clienten bekijken courses in de app.
//
// CONCEPTUEEL MODEL:
//   Course -> Modules -> Lessen
//   - Course: overkoepelend onderwerp (bijv. "Krachttraining Fundamenten")
//   - Module: hoofdstuk binnen course (bijv. "Module 1: Squats")
//   - Les: individuele content-eenheid (video, tekst, quiz)
//
// Supabase tabellen:
//   - courses (id, titel, beschrijving, thumbnail_url, categorie, niveau,
//              status, prijs, is_gratis, geschatte_duur_min, created_at, updated_at)
//     status: "concept" | "gepubliceerd" | "gearchiveerd"
//     niveau: "beginner" | "gevorderd" | "expert"
//     categorie: "krachttraining" | "voeding" | "mindset" | "herstel" | "lifestyle"
//     prijs: null als is_gratis = true, anders bedrag in centen (Stripe integratie)
//
//   - course_modules (id, course_id, titel, beschrijving, volgorde, is_verplicht)
//     volgorde: integer, bepaalt volgorde binnen course
//     is_verplicht: boolean, client moet module afronden voor volgende
//
//   - course_lessons (id, module_id, titel, type, content, video_url,
//                     duur_min, volgorde, is_preview)
//     type: "video" | "tekst" | "quiz" | "opdracht"
//     content: rich text (Markdown) voor tekst-lessen
//     video_url: Supabase Storage of externe URL (YouTube/Vimeo)
//     is_preview: boolean, gratis preview beschikbaar voor niet-ingeschreven users
//
//   - course_enrollments (id, course_id, client_id, enrolled_at, completed_at, status)
//     status: "actief" | "voltooid" | "gepauzeerd"
//
//   - course_progress (id, enrollment_id, lesson_id, completed, completed_at)
//     Per les bijhouden of de client het heeft afgerond
//
//   - course_quiz_answers (id, lesson_id, enrollment_id, antwoorden, score, completed_at)
//     Voor quiz-type lessen: antwoorden opslaan en score berekenen
//
// Supabase Storage buckets:
//   - "course-thumbnails" (course thumbnail afbeeldingen, path: course-thumbnails/{course_id}.jpg)
//   - "course-videos" (les-video's, path: course-videos/{lesson_id}.mp4)
//   - "course-assets" (bijlagen bij lessen: PDF's, afbeeldingen, etc.)
//
// TOEGANG & PRICING:
//   - Courses kunnen gratis of betaald zijn
//   - Betaalde courses: via Stripe Checkout (eenmalige betaling of abonnement)
//   - Gratis courses: direct beschikbaar voor alle clienten
//   - Admins kunnen courses toewijzen aan specifieke clienten of coaches
//   - Voortgang wordt per client bijgehouden (course_progress tabel)
//
// AI INTEGRATIE (TOEKOMSTIG):
//   - AI kan course-structuur genereren op basis van een onderwerp-prompt
//   - AI kan quiz-vragen genereren op basis van les-inhoud
//   - AI kan samenvattingen genereren per module
//
// CLIENT APP WEERGAVE:
//   - Clienten zien een course-catalogus in de app
//   - Per course: overzicht, modules, voortgangsbalk
//   - Video's worden inline afgespeeld
//   - Quizzen zijn interactief met directe feedback
//   - Certificaat/badge na voltooiing (optioneel)
// ============================================================================

// --- Placeholder data -------------------------------------------------------

const courses = [
  {
    id: "c1",
    titel: "Krachttraining Fundamenten",
    beschrijving: "Leer de basis van effectieve krachttraining, van warming-up tot progressieve overbelasting.",
    categorie: "krachttraining",
    niveau: "beginner" as const,
    status: "gepubliceerd" as const,
    isGratis: true,
    thumbnailUrl: "",       // <-- Supabase Storage: course-thumbnails/{course_id}.jpg
    aantalModules: 6,       // <-- COUNT van course_modules WHERE course_id = c1
    aantalLessen: 24,       // <-- COUNT van course_lessons via modules
    geschatteDuurMin: 180,  // <-- SUM van course_lessons.duur_min
    aantalInschrijvingen: 34, // <-- COUNT van course_enrollments WHERE course_id = c1
    voltooiingsPercentage: 68, // <-- AVG voltooiing over alle enrollments
    prijsCenten: null,      // <-- null want is_gratis = true
  },
  {
    id: "c2",
    titel: "Voeding & Prestatie",
    beschrijving: "Optimaliseer je voeding voor betere trainingsresultaten. Van macro's tot timing.",
    categorie: "voeding",
    niveau: "gevorderd" as const,
    status: "gepubliceerd" as const,
    isGratis: false,
    thumbnailUrl: "",
    aantalModules: 8,
    aantalLessen: 32,
    geschatteDuurMin: 240,
    aantalInschrijvingen: 22,
    voltooiingsPercentage: 45,
    prijsCenten: 4900,      // <-- EUR 49,00 (Stripe: bedrag in centen)
  },
  {
    id: "c3",
    titel: "Mindset & Motivatie",
    beschrijving: "Mentale strategieen voor consistent trainen en doelen bereiken.",
    categorie: "mindset",
    niveau: "beginner" as const,
    status: "concept" as const,
    isGratis: false,
    thumbnailUrl: "",
    aantalModules: 4,
    aantalLessen: 12,
    geschatteDuurMin: 90,
    aantalInschrijvingen: 0,
    voltooiingsPercentage: 0,
    prijsCenten: 2900,
  },
  {
    id: "c4",
    titel: "Herstel & Mobiliteit",
    beschrijving: "Foam rolling, stretching en actief herstel voor sneller resultaat.",
    categorie: "herstel",
    niveau: "beginner" as const,
    status: "gepubliceerd" as const,
    isGratis: true,
    thumbnailUrl: "",
    aantalModules: 5,
    aantalLessen: 20,
    geschatteDuurMin: 150,
    aantalInschrijvingen: 41,
    voltooiingsPercentage: 72,
    prijsCenten: null,
  },
]

const niveauKleuren = {
  beginner: "bg-success/10 text-success border-success/20",
  gevorderd: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  expert: "bg-destructive/10 text-destructive border-destructive/20",
}

const categorieKleuren: Record<string, string> = {
  krachttraining: "bg-primary/10 text-primary",
  voeding: "bg-chart-2/10 text-chart-2",
  mindset: "bg-chart-4/10 text-chart-4",
  herstel: "bg-chart-3/10 text-chart-3",
  lifestyle: "bg-chart-5/10 text-chart-5",
}

// --- Course detail placeholder data (modules + lessen) ----------------------

const courseDetailModules = [
  {
    id: "m1",
    titel: "Introductie",
    beschrijving: "Wat je gaat leren en hoe je het meeste uit deze course haalt.",
    volgorde: 1,
    isVerplicht: true,
    lessen: [
      { id: "l1", titel: "Welkom & overzicht", type: "video" as const, duurMin: 5, isPreview: true },
      { id: "l2", titel: "Doelen stellen", type: "tekst" as const, duurMin: 8, isPreview: false },
    ],
  },
  {
    id: "m2",
    titel: "De Basis Bewegingen",
    beschrijving: "Squat, bench press, deadlift — de drie grote liften uitgelegd.",
    volgorde: 2,
    isVerplicht: true,
    lessen: [
      { id: "l3", titel: "Squat techniek", type: "video" as const, duurMin: 12, isPreview: true },
      { id: "l4", titel: "Bench press techniek", type: "video" as const, duurMin: 10, isPreview: false },
      { id: "l5", titel: "Deadlift techniek", type: "video" as const, duurMin: 14, isPreview: false },
      { id: "l6", titel: "Kennis check", type: "quiz" as const, duurMin: 5, isPreview: false },
    ],
  },
  {
    id: "m3",
    titel: "Programmering",
    beschrijving: "Hoe je een effectief trainingsschema opbouwt.",
    volgorde: 3,
    isVerplicht: true,
    lessen: [
      { id: "l7", titel: "Progressieve overbelasting", type: "video" as const, duurMin: 8, isPreview: false },
      { id: "l8", titel: "Sets, reps en rust", type: "tekst" as const, duurMin: 10, isPreview: false },
      { id: "l9", titel: "Jouw eerste schema", type: "opdracht" as const, duurMin: 15, isPreview: false },
    ],
  },
]

const lesTypeIcons = {
  video: Video,
  tekst: FileText,
  quiz: Award,
  opdracht: BookOpen,
}

const lesTypeKleuren = {
  video: "bg-chart-5/10 text-chart-5",
  tekst: "bg-chart-4/10 text-chart-4",
  quiz: "bg-chart-2/10 text-chart-2",
  opdracht: "bg-primary/10 text-primary",
}

// --- Main Component ---------------------------------------------------------

export function CoursesSection() {
  const [weergave, setWeergave] = useState<"overzicht" | "detail" | "aanmaken">("overzicht")
  const [geselecteerdeCourse, setGeselecteerdeCourse] = useState<typeof courses[0] | null>(null)

  if (weergave === "detail" && geselecteerdeCourse) {
    return (
      <CourseDetail
        course={geselecteerdeCourse}
        onTerug={() => { setWeergave("overzicht"); setGeselecteerdeCourse(null) }}
      />
    )
  }

  if (weergave === "aanmaken") {
    return <CourseAanmaken onTerug={() => setWeergave("overzicht")} />
  }

  return <CourseOverzicht
    onSelectCourse={(c) => { setGeselecteerdeCourse(c); setWeergave("detail") }}
    onNieuweCourse={() => setWeergave("aanmaken")}
  />
}

// --- Laag 1: Overzicht ------------------------------------------------------

function CourseOverzicht({ onSelectCourse, onNieuweCourse }: {
  onSelectCourse: (c: typeof courses[0]) => void
  onNieuweCourse: () => void
}) {
  const [zoek, setZoek] = useState("")
  const [statusFilter, setStatusFilter] = useState<"alle" | "gepubliceerd" | "concept">("alle")

  const gefilterd = courses.filter(c => {
    const matchZoek = c.titel.toLowerCase().includes(zoek.toLowerCase())
    const matchStatus = statusFilter === "alle" || c.status === statusFilter
    return matchZoek && matchStatus
  })

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* KPI's */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-border p-0 gap-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <GraduationCap className="size-3.5" />
              <span className="text-[11px] font-medium">Totaal Courses</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{courses.length}</p>
          </CardContent>
        </Card>
        <Card className="border-border p-0 gap-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <CheckCircle2 className="size-3.5" />
              <span className="text-[11px] font-medium">Gepubliceerd</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{courses.filter(c => c.status === "gepubliceerd").length}</p>
          </CardContent>
        </Card>
        <Card className="border-border p-0 gap-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="size-3.5" />
              <span className="text-[11px] font-medium">Inschrijvingen</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{courses.reduce((s, c) => s + c.aantalInschrijvingen, 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-border p-0 gap-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="size-3.5" />
              <span className="text-[11px] font-medium">Gem. Voltooiing</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {Math.round(courses.filter(c => c.aantalInschrijvingen > 0).reduce((s, c) => s + c.voltooiingsPercentage, 0) / Math.max(courses.filter(c => c.aantalInschrijvingen > 0).length, 1))}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Zoek + filter + aanmaken */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Zoek courses..."
            value={zoek}
            onChange={(e) => setZoek(e.target.value)}
            className="pl-9 h-9 bg-card border-border"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card">
            {(["alle", "gepubliceerd", "concept"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium transition-colors capitalize",
                  statusFilter === s
                    ? "bg-primary text-primary-foreground rounded-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button onClick={onNieuweCourse} className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="size-3.5" />
            Nieuwe Course
          </Button>
        </div>
      </div>

      {/* Course grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {gefilterd.map((course) => (
          <Card
            key={course.id}
            className="border-border shadow-sm hover:border-primary/30 transition-all cursor-pointer group overflow-hidden p-0 gap-0"
            onClick={() => onSelectCourse(course)}
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-secondary">
              {course.thumbnailUrl ? (
                <img src={course.thumbnailUrl} alt={course.titel} className="w-full h-full object-cover" />
              ) : (
                <div className={cn("w-full h-full flex items-center justify-center", categorieKleuren[course.categorie] || "bg-secondary")}>
                  <GraduationCap className="size-10 opacity-40" />
                </div>
              )}
              <div className="absolute top-2 left-2 flex items-center gap-1.5">
                <Badge className={cn("text-[10px] border", niveauKleuren[course.niveau])}>
                  {course.niveau}
                </Badge>
                {course.isGratis ? (
                  <Badge className="text-[10px] bg-success/10 text-success border border-success/20">Gratis</Badge>
                ) : (
                  <Badge className="text-[10px] bg-card text-foreground border border-border">
                    {"\u20AC"}{(course.prijsCenten! / 100).toFixed(2).replace(".", ",")}
                  </Badge>
                )}
              </div>
              {course.status === "concept" && (
                <div className="absolute top-2 right-2">
                  <Badge className="text-[10px] bg-secondary text-muted-foreground border border-border">Concept</Badge>
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{course.titel}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.beschrijving}</p>

              <div className="flex items-center gap-4 mt-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><BookOpen className="size-3" />{course.aantalModules} modules</span>
                <span className="flex items-center gap-1"><Play className="size-3" />{course.aantalLessen} lessen</span>
                <span className="flex items-center gap-1"><Clock className="size-3" />{Math.round(course.geschatteDuurMin / 60)}u</span>
              </div>

              {course.aantalInschrijvingen > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Users className="size-3" />{course.aantalInschrijvingen} ingeschreven
                  </span>
                  <span className="text-muted-foreground">{course.voltooiingsPercentage}% voltooid</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// --- Laag 2: Course Detail (bewerken) ---------------------------------------

function CourseDetail({ course, onTerug }: { course: typeof courses[0]; onTerug: () => void }) {
  const [openModuleId, setOpenModuleId] = useState<string | null>(courseDetailModules[0]?.id ?? null)

  return (
    <div className="flex flex-col gap-5 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={onTerug}>
            <ArrowLeft className="size-4" />
            Terug
          </Button>
          <div>
            <h2 className="text-lg font-bold text-foreground">{course.titel}</h2>
            <p className="text-xs text-muted-foreground">Course bewerken</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Eye className="size-3.5" />
            Preview
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90">
            <CheckCircle2 className="size-3.5" />
            Opslaan
          </Button>
        </div>
      </div>

      {/* Twee-koloms layout (zelfde als programma detail) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        {/* Links: Course info */}
        <div className="flex flex-col gap-5">
          <Card className="border-border p-0 gap-0 overflow-hidden">
            <CardContent className="p-5 flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">Course Info</h3>

              {/* Thumbnail */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Thumbnail</label>
                <div className="relative rounded-lg overflow-hidden bg-secondary aspect-video">
                  <div className={cn("w-full h-full flex items-center justify-center", categorieKleuren[course.categorie] || "bg-secondary")}>
                    <GraduationCap className="size-10 opacity-40" />
                  </div>
                </div>
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border w-full mt-1">
                  <Upload className="size-3.5" />
                  Wijzig thumbnail
                </Button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Titel</label>
                <Input defaultValue={course.titel} className="text-sm" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Beschrijving</label>
                <Textarea defaultValue={course.beschrijving} rows={3} className="text-sm resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Categorie</label>
                  <Select defaultValue={course.categorie}>
                    <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="krachttraining">Krachttraining</SelectItem>
                      <SelectItem value="voeding">Voeding</SelectItem>
                      <SelectItem value="mindset">Mindset</SelectItem>
                      <SelectItem value="herstel">Herstel</SelectItem>
                      <SelectItem value="lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-foreground">Niveau</label>
                  <Select defaultValue={course.niveau}>
                    <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="gevorderd">Gevorderd</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Pricing */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-foreground">Gratis course</label>
                  <Switch defaultChecked={course.isGratis} />
                </div>
                {!course.isGratis && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-foreground">Prijs ({"\u20AC"})</label>
                    <Input type="number" defaultValue={course.prijsCenten ? (course.prijsCenten / 100).toFixed(2) : ""} className="text-sm h-9" />
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Status</label>
                <Select defaultValue={course.status}>
                  <SelectTrigger className="text-sm h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="concept">Concept</SelectItem>
                    <SelectItem value="gepubliceerd">Gepubliceerd</SelectItem>
                    <SelectItem value="gearchiveerd">Gearchiveerd</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stats */}
              <div className="border-t border-border pt-3 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Modules</span>
                  <span className="font-medium text-foreground">{course.aantalModules}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Lessen</span>
                  <span className="font-medium text-foreground">{course.aantalLessen}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Inschrijvingen</span>
                  <span className="font-medium text-foreground">{course.aantalInschrijvingen}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Voltooiing</span>
                  <span className="font-medium text-foreground">{course.voltooiingsPercentage}%</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex flex-col gap-1.5">
                <Button variant="ghost" size="sm" className="justify-start h-8 text-xs gap-2 text-muted-foreground hover:text-foreground">
                  <Copy className="size-3.5" />
                  Course dupliceren
                </Button>
                <Button variant="ghost" size="sm" className="justify-start h-8 text-xs gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="size-3.5" />
                  Course verwijderen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Rechts: Modules & Lessen */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Modules & Lessen</h3>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
              <Plus className="size-3.5" />
              Module Toevoegen
            </Button>
          </div>

          {courseDetailModules.map((module, moduleIndex) => (
            <Card key={module.id} className={cn("border-border overflow-hidden", openModuleId === module.id && "ring-1 ring-primary/20")}>
              <button
                onClick={() => setOpenModuleId(openModuleId === module.id ? null : module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="size-4 text-muted-foreground/50" />
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary">
                    {moduleIndex + 1}
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-foreground">{module.titel}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{module.lessen.length} lessen</span>
                  {module.isVerplicht && (
                    <Badge variant="outline" className="text-[10px] border-border">Verplicht</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-destructive" onClick={(e) => e.stopPropagation()}>
                    <Trash2 className="size-3.5" />
                  </Button>
                  {openModuleId === module.id ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                </div>
              </button>

              {openModuleId === module.id && (
                <div className="border-t border-border p-5 flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">Modulenaam</label>
                      <Input defaultValue={module.titel} className="text-sm" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-medium text-foreground">Beschrijving</label>
                      <Input defaultValue={module.beschrijving} className="text-sm" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-foreground">Lessen</label>
                    <Button size="sm" variant="outline" className="h-7 text-[11px] gap-1 border-border">
                      <Plus className="size-3" />
                      Les toevoegen
                    </Button>
                  </div>

                  <div className="flex flex-col gap-2">
                    {module.lessen.map((les) => {
                      const LesIcon = lesTypeIcons[les.type]
                      return (
                        <div key={les.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors">
                          <GripVertical className="size-3.5 text-muted-foreground/40" />
                          <div className={cn("flex size-8 items-center justify-center rounded-md", lesTypeKleuren[les.type])}>
                            <LesIcon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{les.titel}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground capitalize">{les.type}</span>
                              <span className="text-[10px] text-muted-foreground">{les.duurMin} min</span>
                              {les.isPreview && (
                                <Badge variant="outline" className="text-[9px] h-4 border-border px-1">
                                  <Eye className="size-2.5 mr-0.5" />
                                  Preview
                                </Badge>
                              )}
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                                <MoreHorizontal className="size-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Bewerken</DropdownMenuItem>
                              <DropdownMenuItem>Dupliceren</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">Verwijderen</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// --- Laag 3: Course Aanmaken ------------------------------------------------

function CourseAanmaken({ onTerug }: { onTerug: () => void }) {
  return (
    <div className="flex flex-col gap-5 p-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={onTerug}>
          <ArrowLeft className="size-4" />
          Terug
        </Button>
        <div>
          <h2 className="text-lg font-bold text-foreground">Nieuwe Course</h2>
          <p className="text-xs text-muted-foreground">Maak een nieuwe e-learning cursus aan</p>
        </div>
      </div>

      {/* AI generatie banner */}
      <Card className="border-primary/20 bg-primary/5 p-0 gap-0">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-foreground">AI Course Generator</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Beschrijf het onderwerp en de AI stelt een complete course-structuur voor met modules en lessen.
            </p>
            <div className="flex gap-2 mt-3">
              <Input placeholder="Bijv. 'Complete gids voor krachttraining beginners'" className="text-sm h-9 flex-1" />
              <Button size="sm" className="gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 h-9 shrink-0">
                <Sparkles className="size-3.5" />
                Genereer
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Handmatig formulier */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[340px_1fr]">
        <Card className="border-border p-0 gap-0">
          <CardContent className="p-5 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">Course Details</h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Thumbnail</label>
              <div className="relative rounded-lg overflow-hidden bg-secondary aspect-video border border-border">
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                    <Image className="size-5 text-muted-foreground" />
                  </div>
                  <p className="text-[11px] text-muted-foreground">Klik om thumbnail te uploaden</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Titel</label>
              <Input placeholder="Course titel..." className="text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-foreground">Beschrijving</label>
              <Textarea placeholder="Waar gaat deze course over..." rows={3} className="text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Categorie</label>
                <Select>
                  <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Kies..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="krachttraining">Krachttraining</SelectItem>
                    <SelectItem value="voeding">Voeding</SelectItem>
                    <SelectItem value="mindset">Mindset</SelectItem>
                    <SelectItem value="herstel">Herstel</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-foreground">Niveau</label>
                <Select>
                  <SelectTrigger className="text-sm h-9"><SelectValue placeholder="Kies..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="gevorderd">Gevorderd</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-foreground">Gratis course</label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Modules</h3>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
              <Plus className="size-3.5" />
              Module Toevoegen
            </Button>
          </div>
          <Card className="border-border border-dashed">
            <CardContent className="p-10 flex flex-col items-center justify-center text-center">
              <div className="size-14 rounded-full bg-secondary flex items-center justify-center mb-4">
                <BookOpen className="size-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Nog geen modules</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Voeg modules toe en vul ze met lessen (video, tekst, quiz, opdracht). Of gebruik de AI generator hierboven.
              </p>
              <Button size="sm" className="mt-4 h-8 text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="size-3.5" />
                Eerste module toevoegen
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
