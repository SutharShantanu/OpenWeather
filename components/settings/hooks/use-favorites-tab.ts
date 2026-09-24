"use client"

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react"
import type { GeocodingResult, NearbyCity } from "@/lib/weather"
import { MAX_PINNED_CITIES } from "@/lib/constants"
import { useTranslation } from "@/components/language-provider"
import { useGeocodeSearch } from "@/hooks/use-geocode-search"
import { includesCityName, normalizeCityName } from "@/hooks/use-pinned-cities"
import { POPULAR_CITIES } from "../constants"

interface UseFavoritesTabOptions {
  pinnedCities: string[]
  onAddPinnedCity: (city: string) => void
  onRemovePinnedCity: (city: string) => void
  onSelectCity: (city: string) => void
  onCloseDialog: () => void
  nearbyCities: NearbyCity[]
  /** Overrides the UI language from LanguageProvider for geocoding. */
  language?: string
}

/** Inline search feedback; components map these to translated messages. */
export type FavoritesSearchFeedback = "noMatch" | "allPinned"

/** Delay before closing the dialog so the user sees the selection feedback. */
const SELECT_CLOSE_DELAY_MS = 300

/**
 * Custom hook managing favorites tab state: debounced/abortable station
 * search, combobox keyboard navigation, station selection (with a short
 * close delay), and popular/nearby filtering.
 */
export function useFavoritesTab({
  pinnedCities,
  onAddPinnedCity,
  onRemovePinnedCity,
  onSelectCity,
  onCloseDialog,
  nearbyCities,
  language,
}: UseFavoritesTabOptions) {
  const { language: uiLanguage } = useTranslation()
  const [newCityInput, setNewCityInput] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  /** Inline feedback for the search box (e.g. all matches already pinned). */
  const [searchFeedback, setSearchFeedback] =
    useState<FavoritesSearchFeedback | null>(null)
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const [suggestionTab, setSuggestionTab] = useState<string>("nearby")
  const [selectingCity, setSelectingCity] = useState<string | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { results: searchResults, isSearching } = useGeocodeSearch(
    newCityInput,
    { lang: language ?? uiLanguage }
  )

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Clear pending dialog-close timer on unmount
  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    },
    []
  )

  const isMaxPinned = pinnedCities.length >= MAX_PINNED_CITIES

  const isPinned = useCallback(
    (name: string) => includesCityName(pinnedCities, name),
    [pinnedCities]
  )

  const isResultDisabled = useCallback(
    (r: GeocodingResult) => isMaxPinned || isPinned(r.name),
    [isMaxPinned, isPinned]
  )

  const resetSearch = useCallback(() => {
    setNewCityInput("")
    setIsSearchOpen(false)
    setActiveIndex(-1)
    setSearchFeedback(null)
  }, [])

  const updateSearchInput = useCallback((value: string) => {
    setNewCityInput(value)
    setIsSearchOpen(true)
    setActiveIndex(-1)
    setSearchFeedback(null)
  }, [])

  const pinResult = useCallback(
    (r: GeocodingResult) => {
      if (isResultDisabled(r)) return
      const name = r.name.trim()
      if (!name) return
      onAddPinnedCity(name)
      resetSearch()
    },
    [isResultDisabled, onAddPinnedCity, resetSearch]
  )

  /**
   * Enter / submit: pin the highlighted result, else the first unpinned
   * geocoded result. Free text that doesn't match a geocoded station is
   * never pinned.
   */
  const handleAddCity = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (isMaxPinned || !newCityInput.trim()) return

      const active = searchResults[activeIndex]
      if (active && !isResultDisabled(active)) {
        pinResult(active)
        return
      }

      if (isSearching) return // wait for the current query to resolve

      if (searchResults.length === 0) {
        setIsSearchOpen(true)
        setSearchFeedback("noMatch")
        return
      }

      const firstUnpinned = searchResults.find((r) => !isPinned(r.name))
      if (firstUnpinned) {
        pinResult(firstUnpinned)
      } else {
        setIsSearchOpen(true)
        setSearchFeedback("allPinned")
      }
    },
    [
      isMaxPinned,
      newCityInput,
      searchResults,
      activeIndex,
      isResultDisabled,
      isSearching,
      isPinned,
      pinResult,
    ]
  )

  const handleSelectSearchResult = pinResult

  /** Combobox keyboard handling for the search input. */
  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const count = searchResults.length
      switch (e.key) {
        case "ArrowDown": {
          if (count === 0) return
          e.preventDefault()
          setIsSearchOpen(true)
          setActiveIndex((i) => (i + 1) % count)
          break
        }
        case "ArrowUp": {
          if (count === 0) return
          e.preventDefault()
          setIsSearchOpen(true)
          setActiveIndex((i) => (i <= 0 ? count - 1 : i - 1))
          break
        }
        case "Escape": {
          if (isSearchOpen) {
            // Close the listbox only; don't let the dialog close too
            e.preventDefault()
            e.stopPropagation()
            setIsSearchOpen(false)
            setActiveIndex(-1)
          } else if (newCityInput) {
            e.preventDefault()
            e.stopPropagation()
            resetSearch()
          }
          break
        }
        // Enter is handled by the surrounding <form onSubmit={handleAddCity}>
      }
    },
    [searchResults.length, isSearchOpen, newCityInput, resetSearch]
  )

  const handleSelectStation = useCallback(
    (cityName: string) => {
      setSelectingCity(cityName)
      onSelectCity(cityName)
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null
        setSelectingCity(null)
        onCloseDialog()
      }, SELECT_CLOSE_DELAY_MS)
    },
    [onSelectCity, onCloseDialog]
  )

  const handleRemoveStation = useCallback(
    (cityName: string) => onRemovePinnedCity(cityName),
    [onRemovePinnedCity]
  )

  // Filter nearby cities that aren't already pinned
  const filteredNearbyCities = useMemo(
    () => nearbyCities.filter((c) => !includesCityName(pinnedCities, c.name)),
    [nearbyCities, pinnedCities]
  )

  // Filter popular cities: exclude pinned and nearby
  const filteredPopularCities = useMemo(() => {
    const nearbyNames = new Set(nearbyCities.map((c) => normalizeCityName(c.name)))
    return POPULAR_CITIES.filter(
      (c) =>
        !includesCityName(pinnedCities, c) &&
        !nearbyNames.has(normalizeCityName(c))
    ).slice(0, 10)
  }, [nearbyCities, pinnedCities])

  return {
    newCityInput,
    setNewCityInput: updateSearchInput,
    clearSearch: resetSearch,
    searchResults,
    isSearching,
    isSearchOpen,
    setIsSearchOpen,
    activeIndex,
    setActiveIndex,
    searchFeedback,
    searchContainerRef,
    suggestionTab,
    setSuggestionTab,
    selectingCity,
    isMaxPinned,
    isPinned,
    isResultDisabled,
    handleAddCity,
    handleSearchKeyDown,
    handleSelectSearchResult,
    handleSelectStation,
    handleRemoveStation,
    filteredNearbyCities,
    filteredPopularCities,
  }
}
