"use client"

import { useState, useEffect, useCallback } from "react"
import {
  STORAGE_KEYS,
  DEFAULT_PINNED_CITIES,
  MAX_PINNED_CITIES,
} from "@/lib/constants"

/** Canonical form used for all pinned-city comparisons. */
export const normalizeCityName = (s: string) => s.trim().toLowerCase()

/** Case/whitespace-insensitive membership check against a list of city names. */
export function includesCityName(list: readonly string[], name: string) {
  const key = normalizeCityName(name)
  return list.some((c) => normalizeCityName(c) === key)
}

/**
 * Validate an arbitrary (parsed) storage value into a clean pinned list:
 * strings only, trimmed, non-empty, de-duplicated by normalized name,
 * capped at MAX_PINNED_CITIES. Returns null if the shape is invalid.
 */
function sanitizePinned(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((v) => typeof v === "string")) {
    return null
  }
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of value as string[]) {
    const name = raw.trim()
    const key = normalizeCityName(name)
    if (!name || seen.has(key)) continue
    seen.add(key)
    out.push(name)
  }
  return out.slice(0, MAX_PINNED_CITIES)
}

function readStoredPinned(raw: string | null): string[] | null {
  if (raw === null) return null
  try {
    return sanitizePinned(JSON.parse(raw))
  } catch {
    return null
  }
}

function persist(next: string[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.PINNED_CITIES, JSON.stringify(next))
  } catch {
    // LocalStorage may be unavailable (private mode / quota)
  }
}

/**
 * Custom hook to manage user's pinned/favorited cities with persistence.
 * Kept in sync across browser tabs via the `storage` event.
 */
export function usePinnedCities() {
  const [pinnedCities, setPinnedCities] = useState<string[]>([])

  // Initialize pinned cities from localStorage (validated)
  useEffect(() => {
    let initial: string[]
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PINNED_CITIES)
      const stored = readStoredPinned(raw)
      initial = stored ?? [...DEFAULT_PINNED_CITIES]
      // Rewrite when missing or when sanitising changed the stored value
      if (raw === null || stored === null || JSON.stringify(stored) !== raw) {
        persist(initial)
      }
    } catch {
      initial = [...DEFAULT_PINNED_CITIES]
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate from localStorage after mount (SSR-safe)
    setPinnedCities(initial)
  }, [])

  // Cross-tab sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== STORAGE_KEYS.PINNED_CITIES) return
      const next = readStoredPinned(e.newValue)
      setPinnedCities(next ?? [])
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const isCityPinned = useCallback(
    (cityName?: string | null) => {
      if (!cityName || !cityName.trim()) return false
      return includesCityName(pinnedCities, cityName)
    },
    [pinnedCities]
  )

  /**
   * Returns true when the city was (or will be) added. Uses a functional
   * update so rapid successive calls never operate on a stale list.
   */
  const addPinnedCity = useCallback(
    (newCity: string) => {
      const name = newCity?.trim()
      if (!name) return false
      // Pre-check against the rendered list for the return value; the
      // functional update below re-validates against the latest state.
      if (
        pinnedCities.length >= MAX_PINNED_CITIES ||
        includesCityName(pinnedCities, name)
      ) {
        return false
      }
      setPinnedCities((prev) => {
        if (prev.length >= MAX_PINNED_CITIES || includesCityName(prev, name)) {
          return prev
        }
        const next = [...prev, name]
        persist(next)
        return next
      })
      return true
    },
    [pinnedCities]
  )

  const removePinnedCity = useCallback((cityToRemove: string) => {
    if (!cityToRemove) return
    const key = normalizeCityName(cityToRemove)
    setPinnedCities((prev) => {
      const next = prev.filter((c) => normalizeCityName(c) !== key)
      if (next.length === prev.length) return prev
      persist(next)
      return next
    })
  }, [])

  const togglePinCity = useCallback(
    (cityName?: string | null) => {
      if (!cityName) return
      if (isCityPinned(cityName)) {
        removePinnedCity(cityName)
      } else {
        addPinnedCity(cityName)
      }
    },
    [isCityPinned, removePinnedCity, addPinnedCity]
  )

  return {
    pinnedCities,
    isCityPinned,
    togglePinCity,
    addPinnedCity,
    removePinnedCity,
  }
}
