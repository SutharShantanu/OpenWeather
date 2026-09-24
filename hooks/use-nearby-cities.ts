"use client"

import { useState, useEffect, useCallback } from "react"
import type { NearbyCity } from "@/lib/weather"

interface UseNearbyCitiesOptions {
  coords?: { lat: number; lon: number } | null
}

export type NearbyCitiesStatus = "idle" | "loading" | "success" | "error"

interface NearbyState {
  /** `lat,lon` key the data belongs to. */
  key: string
  status: NearbyCitiesStatus
  cities: NearbyCity[]
  currentCity: string
}

const EMPTY: NearbyCity[] = []

/**
 * Custom hook to fetch regional nearby cities given geographic coordinates.
 * Coordinates are compared by value, so a new `coords` object with the same
 * lat/lon does not trigger a refetch. In-flight requests are aborted when the
 * coordinates change or the component unmounts.
 */
export function useNearbyCities({ coords }: UseNearbyCitiesOptions) {
  const lat = coords?.lat
  const lon = coords?.lon
  const hasCoords =
    typeof lat === "number" &&
    typeof lon === "number" &&
    Number.isFinite(lat) &&
    Number.isFinite(lon)
  const key = hasCoords ? `${lat},${lon}` : ""

  const [state, setState] = useState<NearbyState>({
    key: "",
    status: "idle",
    cities: EMPTY,
    currentCity: "",
  })

  const [attempt, setAttempt] = useState(0)
  /** Re-run the lookup for the current coordinates (e.g. after an error). */
  const retryNearby = useCallback(() => {
    setState((prev) => ({ ...prev, key: "" }))
    setAttempt((n) => n + 1)
  }, [])

  useEffect(() => {
    if (!key) return
    const [qLat, qLon] = key.split(",")
    const controller = new AbortController()

    fetch(
      `/api/nearby?lat=${encodeURIComponent(qLat)}&lon=${encodeURIComponent(qLon)}`,
      { signal: controller.signal }
    )
      .then((res) => {
        if (!res.ok) throw new Error(`Nearby cities request failed (${res.status})`)
        return res.json()
      })
      .then((data) => {
        if (controller.signal.aborted) return
        setState({
          key,
          status: "success",
          cities: Array.isArray(data?.cities) ? data.cities : EMPTY,
          currentCity: typeof data?.currentCity === "string" ? data.currentCity : "",
        })
      })
      .catch((err) => {
        if (controller.signal.aborted || err?.name === "AbortError") return
        console.warn("Nearby cities resolution failed:", err)
        setState({ key, status: "error", cities: EMPTY, currentCity: "" })
      })

    return () => controller.abort()
  }, [key, attempt])

  // Derive the view for the *current* coordinates; anything else is stale.
  const status: NearbyCitiesStatus = !key
    ? "idle"
    : state.key === key
      ? state.status
      : "loading"
  const isCurrent = status === "success"

  return {
    nearbyCities: isCurrent ? state.cities : EMPTY,
    nearbyLoading: status === "loading",
    nearbyCurrentCity: isCurrent ? state.currentCity : "",
    /** True when the lookup for the current coordinates failed. */
    nearbyError: status === "error",
    /** True when there are no usable coordinates to look up. */
    hasCoords,
    nearbyStatus: status,
    retryNearby,
  }
}
