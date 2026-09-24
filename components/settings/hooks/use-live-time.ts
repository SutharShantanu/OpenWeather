"use client"

import * as React from "react"
import { LIVE_CLOCK_INTERVAL_MS } from "@/lib/constants"

export const subscribeToClock = (callback: () => void) => {
  const timer = setInterval(callback, LIVE_CLOCK_INTERVAL_MS)
  return () => clearInterval(timer)
}

/**
 * Hook subscribing to an external tick store for synchronized, efficient clock display without timer drift.
 */
export function useLiveTime(): Date | null {
  const seconds = React.useSyncExternalStore(
    subscribeToClock,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  return seconds !== null ? new Date(seconds * 1000) : null
}
