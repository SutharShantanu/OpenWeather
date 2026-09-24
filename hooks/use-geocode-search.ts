"use client"

import { useState, useEffect, useCallback } from "react"
import type { GeocodingResult } from "@/lib/weather"
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_QUERY_LENGTH } from "@/lib/constants"

interface UseGeocodeSearchOptions {
  /** UI language forwarded to `/api/search` as `lang`. */
  lang?: string
  debounceMs?: number
  minLength?: number
}

interface GeocodeState {
  /** The trimmed query the current `results` belong to. */
  query: string
  results: GeocodingResult[]
  isSearching: boolean
}

const EMPTY_STATE: GeocodeState = { query: "", results: [], isSearching: false }

function parseResults(data: unknown): GeocodingResult[] {
  if (Array.isArray(data)) return data as GeocodingResult[]
  const maybe = (data as { results?: unknown } | null)?.results
  return Array.isArray(maybe) ? (maybe as GeocodingResult[]) : []
}

/**
 * Debounced geocoding lookup against `/api/search`.
 *
 * Every new query aborts the previous in-flight request, so a slow older
 * response can never overwrite a newer one, and `isSearching` only flips
 * back to false when the *latest* request settles.
 */
export function useGeocodeSearch(
  query: string,
  {
    lang = "en",
    debounceMs = SEARCH_DEBOUNCE_MS,
    minLength = SEARCH_MIN_QUERY_LENGTH,
  }: UseGeocodeSearchOptions = {}
) {
  const [state, setState] = useState<GeocodeState>(EMPTY_STATE)
  const trimmed = query.trim()
  const isActive = trimmed.length >= minLength

  useEffect(() => {
    if (!isActive) return

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setState((prev) => ({ ...prev, isSearching: true }))
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}&lang=${encodeURIComponent(lang)}`,
          { signal: controller.signal }
        )
        const results = res.ok ? parseResults(await res.json()) : []
        if (controller.signal.aborted) return
        setState({ query: trimmed, results, isSearching: false })
      } catch (err) {
        if (controller.signal.aborted || (err as Error)?.name === "AbortError") {
          return
        }
        console.warn("Geocoding lookup error:", err)
        setState({ query: trimmed, results: [], isSearching: false })
      }
    }, debounceMs)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [trimmed, isActive, lang, debounceMs])

  /** Drop current results (e.g. after a selection) without touching the query. */
  const clear = useCallback(
    () => setState({ query: trimmed, results: [], isSearching: false }),
    [trimmed]
  )

  // Empty / too-short query: never expose stale results or a stuck spinner.
  if (!isActive) {
    return { results: EMPTY_STATE.results, isSearching: false, clear }
  }

  // Results only ever belong to the current query; while the debounce timer
  // or request for a newer query is pending we report `isSearching`.
  const isCurrent = state.query === trimmed
  return {
    results: isCurrent ? state.results : EMPTY_STATE.results,
    isSearching: state.isSearching || !isCurrent,
    clear,
  }
}
