"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  APP_TABS,
  SETTINGS_TABS,
  STORAGE_KEYS,
  type AppTab,
  type SettingsTab,
} from "@/lib/constants"

// Kept in sync with SettingsDialog's default tab; omitted from the URL when active
const DEFAULT_SETTINGS_TAB: SettingsTab = "source"

function normalizeSettingsTab(raw: string | null): SettingsTab | null {
  if (!raw) return null
  const aliasMap: Record<string, SettingsTab> = {
    regional: "localization",
    theme: "appearance",
    station: "source",
    sources: "source",
    favorites: "locations",
    location: "locations",
    stations: "locations",
    keys: "api",
    apis: "api",
  }
  const candidate = aliasMap[raw] || raw
  return (SETTINGS_TABS as readonly string[]).includes(candidate)
    ? (candidate as SettingsTab)
    : null
}

interface UseUrlSyncOptions {
  city: string
  coords: { lat: number; lon: number } | null
  onLocationChange: (target: {
    city?: string
    coords?: { lat: number; lon: number }
    fallbackToGeo?: boolean
  }) => void
  onUnitRestore?: (unit: "C" | "F") => void
}

/**
 * Custom hook to bi-directionally synchronize application state with URL query parameters.
 * Provides deep-linking, browser history navigation (back/forward popstate), and clean URLs.
 */
export function useUrlSync({
  city,
  coords,
  onLocationChange,
  onUnitRestore,
}: UseUrlSyncOptions) {
  const [activeTab, setActiveTab] = useState<AppTab>("overview")
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState<string>(DEFAULT_SETTINGS_TAB)
  const [showAiAdvisor, setShowAiAdvisor] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const isInitializedRef = useRef(false)
  const isPopStateRef = useRef(false)

  // Build deep link URL query string
  const buildCurrentUrl = useCallback(
    (overrides?: {
      city?: string | null
      coords?: { lat: number; lon: number } | null
      tab?: string | null
      dialog?: string | null
      settingsTab?: string | null
    }) => {
      if (typeof window === "undefined") return ""

      const targetCity =
        overrides && "city" in overrides ? overrides.city : city
      const targetCoords =
        overrides && "coords" in overrides ? overrides.coords : coords
      const targetTab =
        overrides && "tab" in overrides ? overrides.tab : activeTab
      const targetDialog =
        overrides && "dialog" in overrides
          ? overrides.dialog
          : showSettings
            ? "settings"
            : showAiAdvisor
              ? "ai-advisor"
              : showNotifications
                ? "notifications"
                : null
      const targetSettingsTab =
        overrides && "settingsTab" in overrides
          ? overrides.settingsTab
          : settingsTab

      const params = new URLSearchParams()

      // 1. Weather Location (Coordinates take precedence if active, else city)
      if (targetCoords) {
        params.set("lat", targetCoords.lat.toFixed(4))
        params.set("lon", targetCoords.lon.toFixed(4))
      } else if (targetCity) {
        params.set("city", targetCity)
      }

      // 2. Active Tab (omit default 'overview' to keep URLs clean)
      if (targetTab && targetTab !== "overview") {
        params.set("tab", targetTab)
      }

      // 3. Dialog / Modal State
      if (targetDialog) {
        params.set("dialog", targetDialog)
        if (
          targetDialog === "settings" &&
          targetSettingsTab &&
          targetSettingsTab !== DEFAULT_SETTINGS_TAB
        ) {
          params.set("settingsTab", targetSettingsTab)
        }
      }

      const qs = params.toString()
      return qs ? `${window.location.pathname}?${qs}` : window.location.pathname
    },
    [
      city,
      coords,
      activeTab,
      showSettings,
      showAiAdvisor,
      showNotifications,
      settingsTab,
    ]
  )

  // 1. Initial Mount: Read URL query parameters to restore state.
  // The URL is an external system that is only readable after hydration, so
  // restoring from it inside a mount effect is intentional.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (typeof window === "undefined") return

    const params = new URLSearchParams(window.location.search)
    const urlCity =
      params.get("city") ||
      params.get("q") ||
      params.get("loc") ||
      params.get("location")
    const urlLat = params.get("lat")
    const urlLon = params.get("lon")
    const urlTab = params.get("tab")
    const urlDialog =
      params.get("dialog") || params.get("modal") || params.get("popup")
    const rawSettingsTab = params.get("settingsTab") || params.get("setting")
    const urlUnit = params.get("unit")

    // Check if user manually searched London previously
    const userManuallySearched =
      localStorage.getItem(STORAGE_KEYS.USER_SEARCHED) === "true"

    // Treat London as legacy default unless explicitly searched by user
    const isLegacyLondon =
      urlCity?.toLowerCase() === "london" && !userManuallySearched

    if (urlLat && urlLon) {
      const pLat = parseFloat(urlLat)
      const pLon = parseFloat(urlLon)
      if (!isNaN(pLat) && !isNaN(pLon)) {
        onLocationChange({ coords: { lat: pLat, lon: pLon } })
      }
    } else if (urlCity && !isLegacyLondon) {
      onLocationChange({ city: urlCity })
    } else {
      const savedLastCity = localStorage.getItem(STORAGE_KEYS.LAST_CITY)
      if (
        savedLastCity &&
        savedLastCity.toLowerCase() !== "london" &&
        userManuallySearched
      ) {
        onLocationChange({ city: savedLastCity })
      } else {
        onLocationChange({ fallbackToGeo: true })
      }
    }

    if (urlTab && (APP_TABS as readonly string[]).includes(urlTab)) {
      setActiveTab(urlTab as AppTab)
    }

    if (urlDialog === "settings") {
      setShowSettings(true)
    } else if (urlDialog === "ai-advisor" || urlDialog === "ai") {
      setShowAiAdvisor(true)
    } else if (urlDialog === "notifications" || urlDialog === "alerts") {
      setShowNotifications(true)
    }

    const normTab = normalizeSettingsTab(rawSettingsTab)
    if (normTab) {
      setSettingsTab(normTab)
    }

    if (urlUnit && (urlUnit === "C" || urlUnit === "F")) {
      onUnitRestore?.(urlUnit as "C" | "F")
    }

    isInitializedRef.current = true
  }, [onLocationChange, onUnitRestore])
  /* eslint-enable react-hooks/set-state-in-effect */

  // 2. Popstate Listener: Browser Back/Forward navigation support
  useEffect(() => {
    if (typeof window === "undefined") return

    const handlePopState = () => {
      isPopStateRef.current = true
      const params = new URLSearchParams(window.location.search)
      const urlCity =
        params.get("city") ||
        params.get("q") ||
        params.get("loc") ||
        params.get("location")
      const urlLat = params.get("lat")
      const urlLon = params.get("lon")
      const urlTab = params.get("tab")
      const urlDialog =
        params.get("dialog") || params.get("modal") || params.get("popup")
      const rawSettingsTab = params.get("settingsTab") || params.get("setting")

      if (urlLat && urlLon) {
        const pLat = parseFloat(urlLat)
        const pLon = parseFloat(urlLon)
        if (!isNaN(pLat) && !isNaN(pLon)) {
          onLocationChange({ coords: { lat: pLat, lon: pLon } })
        }
      } else if (urlCity) {
        onLocationChange({ city: urlCity })
      } else {
        onLocationChange({ fallbackToGeo: true })
      }

      if (urlTab && (APP_TABS as readonly string[]).includes(urlTab)) {
        setActiveTab(urlTab as AppTab)
      } else {
        setActiveTab("overview")
      }

      setShowSettings(urlDialog === "settings")
      setShowAiAdvisor(urlDialog === "ai-advisor" || urlDialog === "ai")
      setShowNotifications(
        urlDialog === "notifications" || urlDialog === "alerts"
      )

      setSettingsTab(normalizeSettingsTab(rawSettingsTab) ?? DEFAULT_SETTINGS_TAB)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [onLocationChange])

  // 3. Keep URL query synced with active state
  useEffect(() => {
    if (typeof window === "undefined" || !isInitializedRef.current) return

    if (isPopStateRef.current) {
      isPopStateRef.current = false
      return
    }

    const targetUrl = buildCurrentUrl()
    const currentUrl = `${window.location.pathname}${window.location.search}`

    if (targetUrl !== currentUrl) {
      window.history.replaceState(null, "", targetUrl)
    }
  }, [buildCurrentUrl])

  // Navigation callbacks
  const handleTabChange = useCallback(
    (newTab: string) => {
      if ((APP_TABS as readonly string[]).includes(newTab)) {
        setActiveTab(newTab as AppTab)
        if (typeof window !== "undefined") {
          const nextUrl = buildCurrentUrl({ tab: newTab })
          window.history.replaceState(null, "", nextUrl)
        }
      }
    },
    [buildCurrentUrl]
  )

  const handleOpenSettings = useCallback(
    (tab?: string) => {
      if (tab) setSettingsTab(tab)
      setShowSettings(true)
      setShowAiAdvisor(false)
      setShowNotifications(false)
      if (typeof window !== "undefined") {
        const nextUrl = buildCurrentUrl({
          dialog: "settings",
          settingsTab: tab || settingsTab,
        })
        window.history.pushState({ dialog: "settings" }, "", nextUrl)
      }
    },
    [buildCurrentUrl, settingsTab]
  )

  const handleCloseSettings = useCallback(() => {
    setShowSettings(false)
    if (typeof window !== "undefined") {
      const nextUrl = buildCurrentUrl({ dialog: null, settingsTab: null })
      window.history.replaceState(null, "", nextUrl)
    }
  }, [buildCurrentUrl])

  const handleOpenAiAdvisor = useCallback(() => {
    setShowAiAdvisor(true)
    setShowSettings(false)
    setShowNotifications(false)
    if (typeof window !== "undefined") {
      const nextUrl = buildCurrentUrl({ dialog: "ai-advisor" })
      window.history.pushState({ dialog: "ai-advisor" }, "", nextUrl)
    }
  }, [buildCurrentUrl])

  const handleCloseAiAdvisor = useCallback(() => {
    setShowAiAdvisor(false)
    if (typeof window !== "undefined") {
      const nextUrl = buildCurrentUrl({ dialog: null })
      window.history.replaceState(null, "", nextUrl)
    }
  }, [buildCurrentUrl])

  const handleNotificationsOpenChange = useCallback(
    (open: boolean) => {
      setShowNotifications(open)
      if (open) {
        setShowSettings(false)
        setShowAiAdvisor(false)
        if (typeof window !== "undefined") {
          const nextUrl = buildCurrentUrl({ dialog: "notifications" })
          window.history.pushState({ dialog: "notifications" }, "", nextUrl)
        }
      } else {
        if (typeof window !== "undefined") {
          const nextUrl = buildCurrentUrl({ dialog: null })
          window.history.replaceState(null, "", nextUrl)
        }
      }
    },
    [buildCurrentUrl]
  )

  const handleSettingsTabChange = useCallback(
    (newTab: string) => {
      setSettingsTab(newTab)
      if (typeof window !== "undefined") {
        const nextUrl = buildCurrentUrl({
          dialog: "settings",
          settingsTab: newTab,
        })
        window.history.replaceState(null, "", nextUrl)
      }
    },
    [buildCurrentUrl]
  )

  const pushLocationUrl = useCallback(
    (next: { city?: string | null; coords?: { lat: number; lon: number } | null }) => {
      if (typeof window !== "undefined") {
        const nextUrl = buildCurrentUrl({
          city: next.city !== undefined ? next.city : null,
          coords: next.coords !== undefined ? next.coords : null,
        })
        window.history.pushState(next, "", nextUrl)
      }
    },
    [buildCurrentUrl]
  )

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
    showSettings,
    setShowSettings,
    settingsTab,
    setSettingsTab,
    handleOpenSettings,
    handleCloseSettings,
    handleSettingsTabChange,
    showAiAdvisor,
    setShowAiAdvisor,
    handleOpenAiAdvisor,
    handleCloseAiAdvisor,
    showNotifications,
    setShowNotifications,
    handleNotificationsOpenChange,
    buildCurrentUrl,
    pushLocationUrl,
  }
}
