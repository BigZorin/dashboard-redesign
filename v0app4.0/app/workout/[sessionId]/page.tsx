"use client"

import { useState, useCallback } from "react"
import { WorkoutHeader } from "@/components/workout/workout-header"
import { ExerciseView } from "@/components/workout/exercise-view"
import { RestTimer } from "@/components/workout/rest-timer"
import { WorkoutComplete } from "@/components/workout/workout-complete"

export interface LoggedSet {
  set: number
  reps: number
  weight: string
  rir: number | null
}

const exercises = [
  {
    id: "ex1",
    name: "Bench Press",
    muscle: "Borst",
    image: "/images/bench-press.jpg",
    sets: 4,
    reps: 10,
    restSeconds: 90,
    rir: 2,
    tempo: "2-1-2-0",
    notes: "Schouderbladen samen, brug in onderrug",
  },
  {
    id: "ex2",
    name: "Incline Dumbbell Press",
    muscle: "Borst / Schouders",
    image: "/images/shoulder-press.jpg",
    sets: 3,
    reps: 12,
    restSeconds: 75,
    rir: 3,
    tempo: "3-1-2-0",
    notes: "Bank op 30 graden",
  },
  {
    id: "ex3",
    name: "Cable Fly",
    muscle: "Borst",
    image: "/images/bench-press.jpg",
    sets: 3,
    reps: 15,
    restSeconds: 60,
    rir: 1,
    tempo: "2-1-2-1",
    notes: "Focus op squeeze bovenaan",
  },
  {
    id: "ex4",
    name: "Lateral Raise",
    muscle: "Schouders",
    image: "/images/shoulder-press.jpg",
    sets: 4,
    reps: 15,
    restSeconds: 45,
    rir: 1,
    tempo: "2-1-2-0",
    notes: "Licht voorover leunen",
  },
  {
    id: "ex5",
    name: "Tricep Pushdown",
    muscle: "Triceps",
    image: "/images/bench-press.jpg",
    sets: 3,
    reps: 12,
    restSeconds: 60,
    rir: 2,
    tempo: "2-0-2-1",
    notes: "Ellebogen tegen het lichaam",
  },
]

export default function WorkoutPage() {
  const [currentExercise, setCurrentExercise] = useState(0)
  const [loggedSets, setLoggedSets] = useState<Record<string, LoggedSet[]>>({})
  const [showRest, setShowRest] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const exercise = exercises[currentExercise]!
  const exerciseLogs = loggedSets[exercise.id] || []
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0)
  const completedSets = Object.values(loggedSets).reduce((acc, sets) => acc + sets.length, 0)

  const handleLogSet = useCallback((data: { reps: number; weight: string; rir: number | null }) => {
    const setNumber = exerciseLogs.length + 1
    const newLog: LoggedSet = { set: setNumber, ...data }

    setLoggedSets((prev) => ({
      ...prev,
      [exercise.id]: [...(prev[exercise.id] || []), newLog],
    }))

    // Check if exercise is complete
    if (setNumber >= exercise.sets) {
      if (currentExercise >= exercises.length - 1) {
        // All exercises done
        setTimeout(() => setIsComplete(true), 300)
      } else {
        setShowRest(true)
      }
    } else {
      setShowRest(true)
    }
  }, [exercise, exerciseLogs.length, currentExercise])

  const handleRestDone = useCallback(() => {
    setShowRest(false)
    // Move to next exercise if current one is done
    if (exerciseLogs.length + 1 >= exercise.sets && currentExercise < exercises.length - 1) {
      setCurrentExercise((prev) => prev + 1)
    }
  }, [exerciseLogs.length, exercise.sets, currentExercise])

  const handlePrev = useCallback(() => {
    if (currentExercise > 0) setCurrentExercise((prev) => prev - 1)
  }, [currentExercise])

  const handleNext = useCallback(() => {
    if (currentExercise < exercises.length - 1) setCurrentExercise((prev) => prev + 1)
  }, [currentExercise])

  if (isComplete) {
    return (
      <WorkoutComplete
        exercises={exercises}
        loggedSets={loggedSets}
        totalSets={completedSets}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <WorkoutHeader
        sessionName="Upperbody - Push"
        completedSets={completedSets}
        totalSets={totalSets}
      />

      <main className="pt-20 pb-8">
        <ExerciseView
          exercise={exercise}
          exerciseIndex={currentExercise}
          totalExercises={exercises.length}
          loggedSets={exerciseLogs}
          onLogSet={handleLogSet}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </main>

      {showRest && (
        <RestTimer
          seconds={exercise.restSeconds}
          onDone={handleRestDone}
          onSkip={handleRestDone}
        />
      )}
    </div>
  )
}
