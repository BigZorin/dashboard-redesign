import { ProgramHero } from "@/components/training/program-detail/program-hero"
import { ProgramBlocks } from "@/components/training/program-detail/program-blocks"


export default async function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Mock data - zou normaal uit een database komen
  const program = {
    id,
    name: "The Personal Training Program",
    description: "Een 8-weeks programma gericht op het opbouwen van kracht en spiermassa. Je begint met een voorbereidingsblok om techniek en conditie op te bouwen, gevolgd door een intensief blok met zwaardere gewichten en meer volume.",
    image: "/images/gym-training.jpg",
    blocks: 2,
    weeks: 8,
    trainings: 2,
  }

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      <ProgramHero
        name={program.name}
        description={program.description}
        image={program.image}
        blocks={program.blocks}
        weeks={program.weeks}
        trainings={program.trainings}
      />

      <main className="pb-8">
        <ProgramBlocks />
      </main>
    </div>
  )
}
