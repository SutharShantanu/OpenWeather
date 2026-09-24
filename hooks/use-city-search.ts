"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useGeocodeSearch } from "./use-geocode-search"

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

  const handleSelect = useCallback(
    (cityName: string) => {
      onSearch(cityName)
      setQuery("")
      clearResults()
      setIsOpen(false)
    },
    [onSearch, clearResults]
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
  }
}
