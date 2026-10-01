"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useGeocodeSearch } from "./use-geocode-search"

const RECENT_KEY = "openweather:recent-searches"
const RECENT_MAX = 6

function readRecent(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]")
    return Array.isArray(parsed)
      ? parsed
          .filter((v): v is string => typeof v === "string")
          .slice(0, RECENT_MAX)
      : []
  } catch {
    return []
  }
}

function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list))
  } catch {
    // storage full or blocked: recent searches just won't persist
  }
}

interface UseCitySearchOptions {
  language?: string
  onSearch: (city: string) => void
  onLocate: () => void
}

/**
 * Custom hook to manage city geocoding search, debouncing, keyboard shortcuts (Cmd+K, /),
 * pre-emptive geolocation caching on search focus, and dropdown click-outside behavior.
 */
export function useCitySearch({
  language = "en",
  onSearch,
  onLocate,
}: UseCitySearchOptions) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [detectedCoords, setDetectedCoords] = useState<{
    lat: number
    lon: number
  } | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Catch user location as soon as search is activated
  const handleSearchFocus = useCallback(() => {
    setIsOpen(true)
    if (
      typeof navigator !== "undefined" &&
      navigator.geolocation &&
      !detectedCoords &&
      !isLocating
    ) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDetectedCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          })
          setIsLocating(false)
        },
        (err) => {
          console.warn("Geolocation catch on search activation failed:", err)
          setIsLocating(false)
        },
        { timeout: 8000, maximumAge: 60000 }
      )
    }
  }, [detectedCoords, isLocating])

  // Keyboard shortcut: "/" or "Cmd+K" to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && document.activeElement !== inputRef.current)
      ) {
        e.preventDefault()
        inputRef.current?.focus()
        handleSearchFocus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleSearchFocus])

  // Keyless Geocoding API search via internal Next.js route (debounced, abortable)
  const {
    results,
    isSearching,
    clear: clearResults,
  } = useGeocodeSearch(query, { lang: language })

  // Most recent first, no duplicates (case-insensitive). The dropdown that shows
  // them only renders on the client, so reading storage up front is safe.
  const [recentSearches, setRecentSearches] = useState<string[]>(() =>
    typeof window === "undefined" ? [] : readRecent()
  )
  const rememberSearch = useCallback((cityName: string) => {
    setRecentSearches((prev) => {
      const next = [
        cityName,
        ...prev.filter((c) => c.toLowerCase() !== cityName.toLowerCase()),
      ].slice(0, RECENT_MAX)
      writeRecent(next)
      return next
    })
  }, [])
  const clearRecentSearches = useCallback(() => {
    setRecentSearches([])
    writeRecent([])
  }, [])

  const handleSelect = useCallback(
    (cityName: string) => {
      rememberSearch(cityName)
      onSearch(cityName)
      setQuery("")
      clearResults()
      setIsOpen(false)
    },
    [onSearch, clearResults, rememberSearch]
  )

  const handleFormSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (results.length > 0) {
        handleSelect(results[0].name)
      } else if (query.trim()) {
        handleSelect(query.trim())
      } else {
        onLocate()
        setIsOpen(false)
      }
    },
    [results, query, handleSelect, onLocate]
  )

  const clearSearch = useCallback(() => {
    setQuery("")
    clearResults()
    setIsOpen(false)
  }, [clearResults])

  return {
    query,
    setQuery,
    isOpen,
    setIsOpen,
    results,
    clearResults,
    isSearching,
    detectedCoords,
    isLocating,
    inputRef,
    handleSearchFocus,
    handleSelect,
    handleFormSubmit,
    clearSearch,
    recentSearches,
    clearRecentSearches,
  }
}
