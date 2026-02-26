import { TrainingHeader } from "@/components/training/training-header"
import { ProgramsList } from "@/components/training/programs-list"
import { BottomNav } from "@/components/shared/bottom-nav"

export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <TrainingHeader />

      <main className="flex flex-col gap-6 pb-40">
        <ProgramsList />
      </main>

      <BottomNav />
    </div>
  )
}
