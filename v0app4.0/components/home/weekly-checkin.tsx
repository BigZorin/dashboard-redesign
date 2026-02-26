import Image from "next/image"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

export function WeeklyCheckin() {
  return (
    <section className="mx-5">
      <Link href="/intake" className="block">
        <div className="relative overflow-hidden rounded-2xl h-44">
          <Image
            src="/images/weekly-checkin-bg.jpg"
            alt="Weekly check-in"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

          <div className="relative h-full flex flex-col justify-between p-5">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#bad4e1]/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider text-[#bad4e1] mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-[#bad4e1] animate-pulse" />
                Wekelijks
              </span>
              <h3 className="text-lg font-bold text-white font-mono tracking-tight">
                Tijd voor een check-in
              </h3>
              <p className="text-sm text-white/70 mt-0.5">
                Deel je voortgang en laatste status
              </p>
            </div>

            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#0a0b0f] text-sm font-semibold">
                Start check-in
                <ChevronRight className="h-4 w-4" />
              </span>
              <span className="text-[11px] text-white/50">Elke zondag</span>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}
