"use client"

import { useState } from "react"
import { WorkoutHeader } from "@/components/workout/workout-header"
import { ExerciseNavigator } from "@/components/workout/exercise-navigator"
import { ExerciseCard } from "@/components/workout/exercise-card"
import { SetLogger } from "@/components/workout/set-logger"

const exercises = [
  {
    id: "ex1",
    name: "Bench Press - Powerlifting",
    image: "/images/bench-press.jpg",
    sets: 3,
    reps: 10,
    rest: "60s rust",
    rir: 2,
    tempo: "2-1-2-3",
  },
  {
    id: "ex2",
    name: "Barbell Shoulder Press",
    image: "/images/shoulder-press.jpg",
    sets: 3,
    reps: 10,
    rest: "60s rust",
    rir: 4,
    tempo: "3-1-2-3",
  },
]

export default function WorkoutPage() {
  const [currentExercise, setCurrentExercise] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [completedSets, setCompletedSets] = useState(0)

  const exercise = exercises[currentExercise]
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets, 0)

  const handleLogSet = () => {
    const newCompleted = completedSets + 1
    setCompletedSets(newCompleted)

    if (currentSet < exercise.sets) {
      setCurrentSet(currentSet + 1)
    } else if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setCurrentSet(1)
    }
  }

  const handlePrevExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1)
      setCurrentSet(1)
    }
  }

  const handleNextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1)
      setCurrentSet(1)
    }
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <WorkoutHeader
        sessionName="Upperbody"
        completedSets={completedSets}
        totalSets={totalSets}
      />

      <main className="pt-24 pb-8">
        <ExerciseNavigator
          current={currentExercise + 1}
          total={exercises.length}
          onPrev={handlePrevExercise}
          onNext={handleNextExercise}
        />

        <ExerciseCard
          name={exercise.name}
          image={exercise.image}
          sets={exercise.sets}
          reps={exercise.reps}
          rest={exercise.rest}
          rir={exercise.rir}
          tempo={exercise.tempo}
        />

        <SetLogger
          currentSet={currentSet}
          totalSets={exercise.sets}
          targetReps={exercise.reps}
          onLog={handleLogSet}
        />
      </main>
    </div>
  )
}
