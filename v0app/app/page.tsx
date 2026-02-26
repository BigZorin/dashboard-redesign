import { Header } from "@/components/home/header"
import { DailyCheckin } from "@/components/home/daily-checkin"
import { NextTraining } from "@/components/home/next-training"
import { NutritionCard } from "@/components/home/nutrition-card"
import { WeightProgress } from "@/components/home/weight-progress"
import { BottomNav } from "@/components/shared/bottom-nav"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <Header />

      <main className="flex flex-col gap-4 pb-40 pt-4">
        <DailyCheckin />
        <NextTraining />
        <NutritionCard />
        <WeightProgress />
      </main>

      <BottomNav />
    </div>
  )
}
