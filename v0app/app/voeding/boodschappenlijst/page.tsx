import Link from "next/link"
import { ArrowLeft, ShoppingCart } from "lucide-react"

export default function BoodschappenlijstPage() {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-14 pb-4 bg-[#1e1839]">
        <Link
          href="/voeding"
          className="h-9 w-9 rounded-full bg-background/40 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background/60 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-sm font-bold text-foreground font-mono flex-1 text-center pr-9">
          Boodschappenlijst
        </h1>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center px-8 pt-48">
        <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-5">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-base font-bold text-foreground font-mono text-center mb-2">
          Geen boodschappenlijst
        </h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          Je coach heeft nog geen voedingsschema aan je toegewezen.
        </p>
      </div>
    </div>
  )
}
