"use client"

import { useEffect } from "react"

let lockCount = 0
let previousOverflow = ""

// Locks body scroll while `active` is true. Supports several simultaneous locks
// and restores the original overflow value only when the last one is released.
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = "hidden"
    }
    lockCount += 1

    return () => {
      lockCount = Math.max(0, lockCount - 1)
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow
      }
    }
  }, [active])
}
