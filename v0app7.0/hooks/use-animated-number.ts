"use client"

import { useState, useEffect, useRef } from "react"

/**
 * Animates a number from its previous value to the new target.
 *
 * - Duration scales with the size of the change:
 *   small changes (<50) → 400ms, medium (50-500) → 600ms, large (>500) → 900ms
 * - Uses an ease-out cubic curve so the count decelerates at the end
 * - Rounds to integers for display
 */
export function useAnimatedNumber(target: number): number {
  const [display, setDisplay] = useState(target)
  const prevTarget = useRef(target)
  const rafId = useRef<number>(0)

  useEffect(() => {
    const from = prevTarget.current
    const to = target
    prevTarget.current = target

    const diff = Math.abs(to - from)
    if (diff === 0) return

    // Duration scales with change size
    // +10 kcal → 1000ms, +100 kcal → 1600ms, +500 kcal → 3000ms, +800 kcal → 3500ms
    const duration = Math.min(1000 + diff * 6, 3500)

    const startTime = performance.now()

    // Single smooth ease-out curve (power 5) - no kinks, no two-phase
    // Decelerates continuously: fast start, smooth slowdown throughout
    const easeOut = (t: number): number => {
      return 1 - Math.pow(1 - t, 5)
    }

    const animate = (now: number) => {
      const elapsed = now - startTime
      const rawProgress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOut(rawProgress)

      const current = Math.round(from + (to - from) * easedProgress)
      setDisplay(current)

      if (rawProgress < 1) {
        rafId.current = requestAnimationFrame(animate)
      }
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(rafId.current)
    }
  }, [target])

  return display
}
