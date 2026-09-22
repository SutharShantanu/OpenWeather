"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"
import { WeatherHeader } from "@/components/weather-header"
import { WeatherHero } from "@/components/weather-hero"
import { HourlyForecast } from "@/components/hourly-forecast"
import { DailyForecast } from "@/components/daily-forecast"
import { WindWidget } from "@/components/widgets/wind-widget"
import { HumidityWidget } from "@/components/widgets/humidity-widget"
import { AirQualityWidget } from "@/components/widgets/air-quality-widget"
import { SolarWidget } from "@/components/widgets/solar-widget"
import { UvWidget } from "@/components/widgets/uv-widget"
import { PinnedLocations } from "@/components/pinned-locations"
import { EmbeddedRadarCard } from "@/components/embedded-radar-card"
import { InlineAlertBanner } from "@/components/inline-alert-banner"
import { InlineComparisonMatrix } from "@/components/inline-comparison-matrix"
import { WeatherChartsCard } from "@/components/weather-charts-card"
import { AirQualityDeepView } from "@/components/air-quality-deep-view"
import { ClimateNormalsCard } from "@/components/climate-normals-card"
import {
  SettingsDialog,
  DEFAULT_EXTENDED_SETTINGS,
  ExtendedSettings,
} from "@/components/settings-dialog"
import { AiAdvisorBanner } from "@/components/ai-advisor-banner"
import { AiAdvisorDialog } from "@/components/ai-advisor-dialog"
import {
  WeatherData,
  WeatherDataSource,
  ForecastStationModel,
} from "@/lib/weather"
import { generateWeatherBriefing, WeatherSpeechSynthesizer } from "@/lib/speech"
import { LanguageProvider } from "@/components/language-provider"
import { getTranslation } from "@/lib/translations"
import { useLenis } from "@/components/lenis-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { CONFIG } from "@/lib/config"
import { MAX_PINNED_CITIES } from "@/lib/constants"
import {
  RefreshCw,
  Radio,
  LayoutGrid,
  TrendingUp,
  CloudRain,
  Sparkles,
  ArrowRightLeft,
  History,
} from "lucide-react"

export default function WeatherDashboardPage() {
  const [city, setCity] = useState("")
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  )
  const cityRef = useRef(city)
  useEffect(() => {
    cityRef.current = city
  }, [city])
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<ExtendedSettings>(
    DEFAULT_EXTENDED_SETTINGS
  )
  const [pinnedCities, setPinnedCities] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [showAiAdvisor, setShowAiAdvisor] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState("units")
  const [showNotifications, setShowNotifications] = useState(false)

  const lenis = useLenis()

  // Lock background scroll completely when modal dialogs are open
  useEffect(() => {
    const isModalOpen = showSettings || showAiAdvisor
    if (isModalOpen) {
      lenis?.stop()
      const prevBodyOverflow = document.body.style.overflow
      const prevHtmlOverflow = document.documentElement.style.overflow
      document.body.style.overflow = "hidden"
      document.documentElement.style.overflow = "hidden"

      return () => {
        lenis?.start()
        document.body.style.overflow = prevBodyOverflow
        document.documentElement.style.overflow = prevHtmlOverflow
      }
    } else {
      lenis?.start()
      document.body.style.overflow = ""
      document.documentElement.style.overflow = ""
    }
  }, [showSettings, showAiAdvisor, lenis])

  const isInitializedRef = useRef(false)
  const isPopStateRef = useRef(false)

  const unit = settings.tempUnit

  // Build industry-standard deep link URL query string
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

      // 3. Dialog / Popup / Modal State
      if (targetDialog) {
        params.set("dialog", targetDialog)
        if (
          targetDialog === "settings" &&
          targetSettingsTab &&
          targetSettingsTab !== "source"
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

  // Initialize settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("openweather_settings_v2")
      if (saved) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }))
      }
    } catch {
      // ignore
    }
  }, [])

  const handleUpdateSettings = (newPartial: Partial<ExtendedSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial }
      localStorage.setItem("openweather_settings_v2", JSON.stringify(updated))
      return updated
    })
  }

  const handleResetSettings = () => {
    setSettings(DEFAULT_EXTENDED_SETTINGS)
    localStorage.setItem(
      "openweather_settings_v2",
      JSON.stringify(DEFAULT_EXTENDED_SETTINGS)
    )
  }

  const toggleUnit = () => {
    handleUpdateSettings({ tempUnit: unit === "C" ? "F" : "C" })
  }

  // Initialize pinned cities from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("openweather_pinned_v2")
      if (saved) {
        setPinnedCities(JSON.parse(saved))
      } else {
        const defaults = ["Tokyo", "New York", "Paris"]
        setPinnedCities(defaults)
        localStorage.setItem("openweather_pinned_v2", JSON.stringify(defaults))
      }
    } catch {
      // ignore
    }
  }, [])

  const lastFetchKeyRef = useRef<string>("")

  // Fetch weather data with dynamic source and NWP forecast station model
  const fetchWeather = useCallback(
    async (
      targetCity?: string,
      targetCoords?: { lat: number; lon: number },
      sourceOverride?: WeatherDataSource,
      stationOverride?: ForecastStationModel,
      keyOverride?: string
    ) => {
      const src = sourceOverride ?? settings.weatherSource ?? "open-meteo"
      const stn = stationOverride ?? settings.forecastStation ?? "best_match"
      const apiKey = keyOverride ?? settings.customApiKey ?? ""
      const lang = settings.language || "en"
      const query = targetCity !== undefined ? targetCity : cityRef.current

      const fetchKey = `${targetCoords ? `${targetCoords.lat.toFixed(4)},${targetCoords.lon.toFixed(4)}` : query || "auto"}:${src}:${stn}:${lang}:${apiKey}`

      if (lastFetchKeyRef.current === fetchKey && weather) {
        return
      }

      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (targetCoords) {
          params.set("lat", targetCoords.lat.toString())
          params.set("lon", targetCoords.lon.toString())
        } else if (query) {
          params.set("city", query)
        }
        params.set("source", src)
        params.set("station", stn)
        params.set("lang", lang)
        if (apiKey) {
          params.set("apiKey", apiKey)
        }

        const res = await fetch(`/api/weather?${params.toString()}`)
        if (res.ok) {
          const data: WeatherData = await res.json()
          setWeather(data)
          lastFetchKeyRef.current = fetchKey
          if (data.current?.cityName) {
            setCity(data.current.cityName)
            cityRef.current = data.current.cityName
          }
          if (data.current?.lat && data.current?.lon && !targetCoords) {
            setCoords({ lat: data.current.lat, lon: data.current.lon })
          }
        }
      } catch (err) {
        console.warn("Failed to load meteorological telemetry", err)
      } finally {
        setLoading(false)
      }
    },
    [
      settings.weatherSource,
      settings.forecastStation,
      settings.customApiKey,
      settings.language,
      weather,
    ]
  )

  // Fetch location region from network call (/api/location with client-side BigDataCloud fallback)
  const fetchLocationRegionFromNetwork = useCallback(async (): Promise<{
    city: string
    region: string
    country: string
    lat: number
    lon: number
    displayName: string
  } | null> => {
    try {
      const res = await fetch("/api/location")
      if (res.ok) {
        const data = await res.json()
        if (
          data.lat !== undefined &&
          data.lon !== undefined &&
          !isNaN(data.lat) &&
          !isNaN(data.lon)
        ) {
          const region = data.region || ""
          const city = data.city || region || ""
          const country = data.country || ""
          const displayName = city || region
          return {
            city,
            region,
            country,
            lat: data.lat,
            lon: data.lon,
            displayName,
          }
        }
      }
    } catch (e) {
      console.warn("Network call to /api/location failed, trying direct network fallback:", e)
    }

    // Direct network fallback via BigDataCloud IP reverse-geocoding
    try {
      const bdcRes = await fetch(
        "https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=en"
      )
      if (bdcRes.ok) {
        const bdcData = await bdcRes.json()
        const region = bdcData.principalSubdivision || ""
        const city = bdcData.city || bdcData.locality || region || ""
        const country = bdcData.countryName || bdcData.countryCode || ""
        const lat = bdcData.latitude
        const lon = bdcData.longitude
        if (lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)) {
          return {
            city,
            region,
            country,
            lat,
            lon,
            displayName: city || region,
          }
        }
      }
    } catch (e) {
      console.warn("Direct network geolocation call failed:", e)
    }

    return null
  }, [])

  // Apply location region resolved from network call when location request is denied or unavailable
  const applyLocationFromNetwork = useCallback(async () => {
    setLoading(true)
    try {
      const netLoc = await fetchLocationRegionFromNetwork()
      if (netLoc) {
        const nextCoords = { lat: netLoc.lat, lon: netLoc.lon }
        setCoords(nextCoords)
        const locName = netLoc.displayName || netLoc.city || netLoc.region
        if (locName) {
          setCity(locName)
          cityRef.current = locName
        }
        await fetchWeather(locName || undefined, nextCoords)
        return true
      }
    } catch (e) {
      console.warn("Failed to apply location region from network call:", e)
    }
    await fetchWeather()
    return false
  }, [fetchLocationRegionFromNetwork, fetchWeather])

  // Automatically choose default city based on user's location.
  // If location request is denied, take the location region from the network call.
  const detectAndApplyUserLocation = useCallback(async () => {
    setLoading(true)

    // Check if location permission is already denied in browser permissions API
    if (typeof navigator !== "undefined" && navigator.permissions?.query) {
      try {
        const perm = await navigator.permissions.query({ name: "geolocation" })
        if (perm.state === "denied") {
          console.info(
            "Browser location request denied. Taking location region from network call..."
          )
          await applyLocationFromNetwork()
          return
        }
      } catch {
        // Permissions API query not supported; proceed to request
      }
    }

    // Request browser location
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // Location request granted: use accurate GPS coordinates
          const gpsCoords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }
          setCoords(gpsCoords)
          fetchWeather(undefined, gpsCoords)
        },
        async (err) => {
          // Location request denied or failed: take location region from network call
          console.warn(
            `Location request denied or unavailable (code ${err.code}: ${err.message}). Taking location region from network call...`
          )
          await applyLocationFromNetwork()
        },
        { timeout: 5000, maximumAge: 300000, enableHighAccuracy: false }
      )
    } else {
      // Geolocation not supported: take location region from network call
      await applyLocationFromNetwork()
    }
  }, [applyLocationFromNetwork, fetchWeather])

  // 1. Initial Mount: Read URL query parameters to restore location, tab, and dialog state
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
      typeof window !== "undefined"
        ? localStorage.getItem("openweather_user_searched") === "true"
        : false

    // Treat London as legacy default unless explicitly searched by user
    const isLegacyLondon =
      urlCity?.toLowerCase() === "london" && !userManuallySearched

    if (urlLat && urlLon) {
      const pLat = parseFloat(urlLat)
      const pLon = parseFloat(urlLon)
      if (!isNaN(pLat) && !isNaN(pLon)) {
        const nextCoords = { lat: pLat, lon: pLon }
        setCoords(nextCoords)
        fetchWeather(undefined, nextCoords)
      }
    } else if (urlCity && !isLegacyLondon) {
      setCity(urlCity)
      cityRef.current = urlCity
      fetchWeather(urlCity)
    } else {
      const savedLastCity =
        typeof window !== "undefined"
          ? localStorage.getItem("openweather_last_city")
          : null

      if (
        savedLastCity &&
        savedLastCity.toLowerCase() !== "london" &&
        userManuallySearched
      ) {
        setCity(savedLastCity)
        cityRef.current = savedLastCity
        fetchWeather(savedLastCity)
      } else {
        // Default city is chosen by user's location
        detectAndApplyUserLocation()
      }
    }

    if (
      urlTab &&
      [
        "overview",
        "charts",
        "radar",
        "air-quality",
        "climate",
        "compare",
      ].includes(urlTab)
    ) {
      setActiveTab(urlTab)
    }

    if (urlDialog === "settings") {
      setShowSettings(true)
    } else if (urlDialog === "ai-advisor" || urlDialog === "ai") {
      setShowAiAdvisor(true)
    } else if (urlDialog === "notifications" || urlDialog === "alerts") {
      setShowNotifications(true)
    }

    if (rawSettingsTab) {
      const norm =
        rawSettingsTab === "regional"
          ? "localization"
          : rawSettingsTab === "theme"
            ? "appearance"
            : rawSettingsTab === "station" || rawSettingsTab === "sources"
              ? "source"
              : rawSettingsTab === "favorites" || rawSettingsTab === "location" || rawSettingsTab === "stations"
                ? "locations"
                : rawSettingsTab === "keys" || rawSettingsTab === "apis"
                  ? "api"
                  : rawSettingsTab
      if (
        [
          "locations",
          "source",
          "api",
          "units",
          "favorites",
          "localization",
          "speech",
          "appearance",
        ].includes(norm)
      ) {
        setSettingsTab(norm)
      }
    }

    if (urlUnit && (urlUnit === "C" || urlUnit === "F")) {
      handleUpdateSettings({ tempUnit: urlUnit as "C" | "F" })
    }

    isInitializedRef.current = true
  }, [detectAndApplyUserLocation, fetchWeather])

  // 2. Popstate Listener: Seamless browser Back/Forward support for dialogs and location history
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
          const nextCoords = { lat: pLat, lon: pLon }
          setCoords(nextCoords)
          fetchWeather(undefined, nextCoords)
        }
      } else if (urlCity) {
        setCoords(null)
        setCity(urlCity)
        cityRef.current = urlCity
        fetchWeather(urlCity)
      } else {
        detectAndApplyUserLocation()
      }

      if (
        urlTab &&
        [
          "overview",
          "charts",
          "radar",
          "air-quality",
          "climate",
          "compare",
        ].includes(urlTab)
      ) {
        setActiveTab(urlTab)
      } else {
        setActiveTab("overview")
      }

      setShowSettings(urlDialog === "settings")
      setShowAiAdvisor(urlDialog === "ai-advisor" || urlDialog === "ai")
      setShowNotifications(
        urlDialog === "notifications" || urlDialog === "alerts"
      )

      if (rawSettingsTab) {
        const norm =
          rawSettingsTab === "regional"
            ? "localization"
            : rawSettingsTab === "theme"
              ? "appearance"
              : rawSettingsTab === "station" || rawSettingsTab === "sources"
                ? "source"
                : rawSettingsTab === "favorites" || rawSettingsTab === "location" || rawSettingsTab === "stations"
                  ? "locations"
                  : rawSettingsTab === "keys" || rawSettingsTab === "apis"
                    ? "api"
                    : rawSettingsTab
        if (
          [
            "locations",
            "source",
            "api",
            "units",
            "favorites",
            "localization",
            "speech",
            "appearance",
          ].includes(norm)
        ) {
          setSettingsTab(norm)
        }
      }
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [detectAndApplyUserLocation, fetchWeather])

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

  // Re-fetch when provider settings change
  useEffect(() => {
    if (!isInitializedRef.current) return
    if (coords) {
      fetchWeather(undefined, coords)
    } else if (cityRef.current) {
      fetchWeather(cityRef.current)
    } else {
      fetchWeather()
    }
  }, [
    settings.weatherSource,
    settings.forecastStation,
    settings.customApiKey,
    settings.language,
    coords,
    fetchWeather,
  ])

  // GPS Locate with URL update. If location request is denied, take location region from network call.
  const handleLocate = useCallback(() => {
    setLoading(true)
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nextCoords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }
          setCoords(nextCoords)
          fetchWeather(undefined, nextCoords)
          if (typeof window !== "undefined") {
            const nextUrl = buildCurrentUrl({ coords: nextCoords, city: null })
            window.history.pushState(nextCoords, "", nextUrl)
          }
        },
        async (err) => {
          console.warn(
            `Location request denied (code ${err.code}: ${err.message}). Taking location region from network call...`
          )
          const netLoc = await fetchLocationRegionFromNetwork()
          if (netLoc) {
            const nextCoords = { lat: netLoc.lat, lon: netLoc.lon }
            setCoords(nextCoords)
            const locName = netLoc.displayName || netLoc.city || netLoc.region
            if (locName) {
              setCity(locName)
              cityRef.current = locName
            }
            await fetchWeather(locName || undefined, nextCoords)
            if (typeof window !== "undefined") {
              const nextUrl = buildCurrentUrl({
                coords: nextCoords,
                city: locName || null,
              })
              window.history.pushState(nextCoords, "", nextUrl)
            }
          } else if (cityRef.current) {
            fetchWeather(cityRef.current)
          } else {
            setLoading(false)
          }
        },
        { timeout: 7000, enableHighAccuracy: true, maximumAge: 60000 }
      )
    } else {
      ;(async () => {
        const netLoc = await fetchLocationRegionFromNetwork()
        if (netLoc) {
          const nextCoords = { lat: netLoc.lat, lon: netLoc.lon }
          setCoords(nextCoords)
          const locName = netLoc.displayName || netLoc.city || netLoc.region
          if (locName) {
            setCity(locName)
            cityRef.current = locName
          }
          await fetchWeather(locName || undefined, nextCoords)
        } else {
          setLoading(false)
        }
      })()
    }
  }, [buildCurrentUrl, fetchLocationRegionFromNetwork, fetchWeather])

  // User Actions: City selection with URL history push
  const handleSelectCity = useCallback(
    (newCity: string) => {
      setCoords(null)
      setCity(newCity)
      cityRef.current = newCity
      try {
        localStorage.setItem("openweather_last_city", newCity)
        localStorage.setItem("openweather_user_searched", "true")
      } catch {}
      fetchWeather(newCity, undefined)
      if (typeof window !== "undefined") {
        const nextUrl = buildCurrentUrl({ city: newCity, coords: null })
        window.history.pushState({ city: newCity }, "", nextUrl)
      }
    },
    [buildCurrentUrl, fetchWeather]
  )

  // Tab change with shallow URL update
  const handleTabChange = useCallback(
    (newTab: string) => {
      setActiveTab(newTab)
      if (typeof window !== "undefined") {
        const nextUrl = buildCurrentUrl({ tab: newTab })
        window.history.replaceState(null, "", nextUrl)
      }
    },
    [buildCurrentUrl]
  )

  // Open / Close Settings Dialog with deep link
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

  // Open / Close AI Advisor Dialog with deep link
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

  // Open / Close Notifications Popover with deep link
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

  // Settings internal tab change
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

  // Pin / Unpin
  const isPinned = weather
    ? pinnedCities.some(
        (c) => c.toLowerCase() === weather.current.cityName.toLowerCase()
      )
    : false

  const togglePin = () => {
    if (!weather) return
    const cityName = weather.current.cityName
    let next: string[]
    if (isPinned) {
      next = pinnedCities.filter(
        (c) => c.toLowerCase() !== cityName.toLowerCase()
      )
    } else {
      if (pinnedCities.length >= MAX_PINNED_CITIES) return
      next = [...pinnedCities, cityName]
    }
    setPinnedCities(next)
    localStorage.setItem("openweather_pinned_v2", JSON.stringify(next))
  }

  const handleUnpinCity = (unpinnedCity: string) => {
    const next = pinnedCities.filter(
      (c) => c.toLowerCase() !== unpinnedCity.toLowerCase()
    )
    setPinnedCities(next)
    localStorage.setItem("openweather_pinned_v2", JSON.stringify(next))
  }

  const handleAddPinnedCity = (newCity: string) => {
    if (pinnedCities.length >= MAX_PINNED_CITIES) return
    if (pinnedCities.some((c) => c.toLowerCase() === newCity.toLowerCase()))
      return
    const next = [...pinnedCities, newCity]
    setPinnedCities(next)
    localStorage.setItem("openweather_pinned_v2", JSON.stringify(next))
  }

  const handleRemovePinnedCity = (removeCity: string) => {
    handleUnpinCity(removeCity)
  }

  const handleHome = useCallback(() => {
    setActiveTab("overview")
    setShowSettings(false)
    setShowAiAdvisor(false)
    setShowNotifications(false)
    try {
      localStorage.removeItem("openweather_user_searched")
      localStorage.removeItem("openweather_last_city")
    } catch {}
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/")
    }
    detectAndApplyUserLocation()
  }, [detectAndApplyUserLocation])

  const t = getTranslation(settings.language || "en")

  return (
    <LanguageProvider language={settings.language || "en"}>
      <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-150">
        <WeatherHeader
          onSearch={handleSelectCity}
          onLocate={handleLocate}
          onHome={handleHome}
          onOpenAiAdvisor={handleOpenAiAdvisor}
          onChangeStation={() => handleOpenSettings("source")}
          onOpenSettings={handleOpenSettings}
          showNotifications={showNotifications}
          onNotificationsOpenChange={handleNotificationsOpenChange}
          current={weather?.current}
          daily={weather?.daily}
          hourly={weather?.hourly}
          alerts={weather?.alerts}
          unit={unit}
          settings={settings}
          isLoading={loading}
        />

        <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-4 py-4 sm:px-6 lg:px-8">
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2.5 font-mono text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center gap-2">
              <span className="size-2 shrink-0 animate-pulse bg-emerald-500" />
              <span className="font-semibold text-foreground uppercase">
                {t.common.stationTelemetryActive}
              </span>
              <span>•</span>
              <button
                type="button"
                onClick={() => handleOpenSettings("source")}
                className="group inline-flex cursor-pointer items-center gap-1.5 text-left uppercase transition-colors hover:text-foreground"
                title="Click to choose weather data source & forecast station"
              >
                <span className="text-muted-foreground group-hover:text-foreground">
                  {t.common.source}:{" "}
                  <strong className="text-foreground">
                    {weather?.providerName ||
                      (weather?.dataSource === "LIVE_API"
                        ? "Open-Meteo"
                        : "Simulated Sensor")}
                  </strong>
                  {weather?.stationName && (
                    <span className="ml-1 font-semibold text-primary">
                      [{weather.stationName}]
                    </span>
                  )}
                </span>
                <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {t.common.change}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => fetchWeather(city, coords || undefined)}
                disabled={loading}
                className="gap-1.5 font-mono text-xs"
              >
                <RefreshCw
                  className={`size-3 ${loading ? "animate-spin text-primary" : ""}`}
                />
                <span>{t.common.refresh}</span>
              </Button>
              <Badge variant="outline" className="font-mono text-tiny">
                <Radio className="mr-1 size-2.5 text-primary" />
                1013.25 hPa
              </Badge>
            </div>
          </div>

          {/* Inline Active Weather Advisories Banner */}
          {weather && !loading && (
            <InlineAlertBanner
              current={weather.current}
              alerts={weather.alerts}
            />
          )}

          {/* MSN Weather Navigation Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full space-y-4"
          >
            <TabsList className="h-9 w-full scrollbar-none justify-start overflow-x-auto overflow-y-hidden border-b border-border bg-transparent p-0 [&::-webkit-scrollbar]:hidden">
              <TabsTrigger
                value="overview"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <LayoutGrid className="size-3.5" />
                <span>{t.tabs.overview}</span>
              </TabsTrigger>
              <TabsTrigger
                value="charts"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <TrendingUp className="size-3.5" />
                <span>{t.tabs.charts}</span>
              </TabsTrigger>
              <TabsTrigger
                value="radar"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <CloudRain className="size-3.5" />
                <span>{t.tabs.radar}</span>
              </TabsTrigger>
              <TabsTrigger
                value="air-quality"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <Sparkles className="size-3.5" />
                <span>{t.tabs.airQuality}</span>
              </TabsTrigger>
              <TabsTrigger
                value="climate"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <History className="size-3.5" />
                <span>{t.tabs.climate}</span>
              </TabsTrigger>
              <TabsTrigger
                value="compare"
                className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
              >
                <ArrowRightLeft className="size-3.5" />
                <span>{t.tabs.compare}</span>
              </TabsTrigger>
            </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent
            value="overview"
            className="space-y-4 focus-visible:outline-none"
          >
            {/* Hero Current Conditions */}
            {weather && !loading ? (
              <WeatherHero
                current={weather.current}
                unit={unit}
                isPinned={isPinned}
                onTogglePin={togglePin}
              />
            ) : (
              <Skeleton className="h-72 w-full" />
            )}

            {/* AI Synoptic Intelligence & Sudden Alert Advisor */}
            {weather && !loading && (
              <AiAdvisorBanner
                current={weather.current}
                hourly={weather.hourly}
                daily={weather.daily}
                unit={unit}
                onOpenDetailedAi={handleOpenAiAdvisor}
              />
            )}

            {/* Hourly Trajectory Sequence */}
            {weather && !loading ? (
              <HourlyForecast hourly={weather.hourly} unit={unit} />
            ) : (
              <Skeleton className="h-44 w-full" />
            )}

            {/* Embedded Live Doppler Radar Card */}
            {weather && !loading && (
              <EmbeddedRadarCard
                lat={weather.current.lat}
                lon={weather.current.lon}
                cityName={weather.current.cityName}
                heightClass="h-[340px]"
                onExpand={() => handleTabChange("radar")}
              />
            )}

            {/* Multi-Metric Progression Graph */}
            {weather && !loading ? (
              <WeatherChartsCard hourly={weather.hourly} unit={unit} />
            ) : (
              <Skeleton className="h-64 w-full" />
            )}

            {/* Bento Grid: 10-day outlook + atmospheric sensors */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Left 2 Cols: 10-day Forecast */}
              <div className="lg:col-span-2">
                {weather && !loading ? (
                  <DailyForecast daily={weather.daily} unit={unit} />
                ) : (
                  <Skeleton className="h-96 w-full" />
                )}
              </div>

              {/* Right 1 Col: Telemetry widgets */}
              <div className="space-y-4">
                {weather && !loading ? (
                  <>
                    <UvWidget
                      uvIndex={weather.current.uvIndex}
                      uvMax={weather.daily[0]?.uvIndexMax}
                    />
                    <WindWidget
                      speed={weather.current.windSpeed}
                      deg={weather.current.windDeg}
                    />
                    <HumidityWidget
                      humidity={weather.current.humidity}
                      tempC={weather.current.temp}
                      unit={unit}
                    />
                    <AirQualityWidget airQuality={weather.current.airQuality} />
                    <SolarWidget
                      sunrise={weather.current.sunrise}
                      sunset={weather.current.sunset}
                      currentDt={weather.current.dt}
                      moon={weather.current.moon}
                    />
                  </>
                ) : (
                  <Skeleton className="h-96 w-full" />
                )}
              </div>
            </div>

            {/* Pinned Locations */}
            <PinnedLocations
              pinnedCities={pinnedCities}
              unit={unit}
              onSelectCity={handleSelectCity}
              onUnpinCity={handleUnpinCity}
            />
          </TabsContent>

          {/* TAB 2: GRAPHS & TRENDS */}
          <TabsContent
            value="charts"
            className="space-y-4 focus-visible:outline-none"
          >
            {weather && !loading ? (
              <>
                <WeatherChartsCard hourly={weather.hourly} unit={unit} />
                <HourlyForecast hourly={weather.hourly} unit={unit} />
                <ClimateNormalsCard
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                  currentTemp={weather.current.temp}
                  unit={unit}
                />
                <DailyForecast daily={weather.daily} unit={unit} />
              </>
            ) : (
              <Skeleton className="h-96 w-full" />
            )}
          </TabsContent>

          {/* TAB 3: RADAR & SATELLITE */}
          <TabsContent
            value="radar"
            className="space-y-4 focus-visible:outline-none"
          >
            {weather && !loading ? (
              <>
                <EmbeddedRadarCard
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                  cityName={weather.current.cityName}
                  heightClass="h-[560px]"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <WindWidget
                    speed={weather.current.windSpeed}
                    deg={weather.current.windDeg}
                  />
                  <HumidityWidget
                    humidity={weather.current.humidity}
                    tempC={weather.current.temp}
                    unit={unit}
                  />
                </div>
              </>
            ) : (
              <Skeleton className="h-140 w-full" />
            )}
          </TabsContent>

          {/* TAB 4: AIR QUALITY & HEALTH */}
          <TabsContent
            value="air-quality"
            className="space-y-4 focus-visible:outline-none"
          >
            {weather && !loading ? (
              <AirQualityDeepView airQuality={weather.current.airQuality} />
            ) : (
              <Skeleton className="h-96 w-full" />
            )}
          </TabsContent>

          {/* TAB 5: HISTORICAL & CLIMATE */}
          <TabsContent
            value="climate"
            className="space-y-4 focus-visible:outline-none"
          >
            {weather && !loading ? (
              <>
                <ClimateNormalsCard
                  lat={weather.current.lat}
                  lon={weather.current.lon}
                  currentTemp={weather.current.temp}
                  unit={unit}
                />
                <DailyForecast daily={weather.daily} unit={unit} />
              </>
            ) : (
              <Skeleton className="h-96 w-full" />
            )}
          </TabsContent>

          {/* TAB 5: STATION COMPARISON */}
          <TabsContent
            value="compare"
            className="space-y-4 focus-visible:outline-none"
          >
            {weather && !loading ? (
              <>
                <InlineComparisonMatrix
                  baseCurrent={weather.current}
                  unit={unit}
                  onSwitchCity={handleSelectCity}
                />
                <PinnedLocations
                  pinnedCities={pinnedCities}
                  unit={unit}
                  onSelectCity={handleSelectCity}
                  onUnpinCity={handleUnpinCity}
                />
              </>
            ) : (
              <Skeleton className="h-96 w-full" />
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* AI Synoptic Advisor Interactive Dialog */}
      {weather && (
        <AiAdvisorDialog
          open={showAiAdvisor}
          onOpenChange={(open) => {
            if (open) {
              handleOpenAiAdvisor()
            } else {
              handleCloseAiAdvisor()
            }
          }}
          current={weather.current}
          hourly={weather.hourly}
          daily={weather.daily}
          unit={unit}
        />
      )}

      {/* Extended Station & Application Preferences Dialog */}
      <SettingsDialog
        open={showSettings}
        onOpenChange={(open) => {
          if (open) {
            handleOpenSettings()
          } else {
            handleCloseSettings()
          }
        }}
        activeTab={settingsTab}
        onActiveTabChange={handleSettingsTabChange}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetSettings={handleResetSettings}
        pinnedCities={pinnedCities}
        onAddPinnedCity={handleAddPinnedCity}
        onRemovePinnedCity={handleRemovePinnedCity}
        onSelectCity={handleSelectCity}
        currentTemp={weather?.current?.temp}
        city={city}
        coords={coords}
      />

      {/* Footer */}
      <footer className="space-y-1 border-t border-border px-4 py-6 text-center font-mono text-xs text-muted-foreground">
        <p>OpenWeather Precision Meteorological Console</p>
      </footer>
    </div>
  </LanguageProvider>
)
}
