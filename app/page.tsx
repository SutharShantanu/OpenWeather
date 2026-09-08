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
import { useLenis } from "@/components/lenis-provider"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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
  const [city, setCity] = useState("London")
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null
  )
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

    if (urlLat && urlLon) {
      const pLat = parseFloat(urlLat)
      const pLon = parseFloat(urlLon)
      if (!isNaN(pLat) && !isNaN(pLon)) {
        setCoords({ lat: pLat, lon: pLon })
      }
    } else if (urlCity) {
      setCity(urlCity)
    } else {
      const savedLastCity =
        typeof window !== "undefined"
          ? localStorage.getItem("openweather_last_city")
          : null
      if (savedLastCity) {
        setCity(savedLastCity)
        const p = new URLSearchParams(window.location.search)
        p.set("city", savedLastCity)
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${p.toString()}`
        )
      } else if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const locCoords = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
            }
            setCoords(locCoords)
            const p = new URLSearchParams(window.location.search)
            p.set("lat", locCoords.lat.toFixed(4))
            p.set("lon", locCoords.lon.toFixed(4))
            window.history.replaceState(
              null,
              "",
              `${window.location.pathname}?${p.toString()}`
            )
          },
          () => {
            const p = new URLSearchParams(window.location.search)
            p.set("city", "London")
            window.history.replaceState(
              null,
              "",
              `${window.location.pathname}?${p.toString()}`
            )
          },
          { timeout: 5000, maximumAge: 300000 }
        )
      } else {
        const p = new URLSearchParams(window.location.search)
        p.set("city", "London")
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${p.toString()}`
        )
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
              : rawSettingsTab
      if (
        [
          "source",
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
  }, [])

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
          setCoords({ lat: pLat, lon: pLon })
        }
      } else if (urlCity) {
        setCoords(null)
        setCity(urlCity)
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
                : rawSettingsTab
        if (
          [
            "source",
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
  }, [])

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

  // Fetch weather data with dynamic source and NWP forecast station model
  const fetchWeather = useCallback(
    async (
      targetCity?: string,
      targetCoords?: { lat: number; lon: number },
      sourceOverride?: WeatherDataSource,
      stationOverride?: ForecastStationModel,
      keyOverride?: string
    ) => {
      setLoading(true)
      try {
        const src = sourceOverride ?? settings.weatherSource ?? "open-meteo"
        const stn = stationOverride ?? settings.forecastStation ?? "best_match"
        const apiKey = keyOverride ?? settings.customApiKey ?? ""

        const params = new URLSearchParams()
        if (targetCoords) {
          params.set("lat", targetCoords.lat.toString())
          params.set("lon", targetCoords.lon.toString())
        } else {
          const query = targetCity || city
          params.set("city", query)
        }
        params.set("source", src)
        params.set("station", stn)
        if (apiKey) {
          params.set("apiKey", apiKey)
        }

        const res = await fetch(`/api/weather?${params.toString()}`)
        if (res.ok) {
          const data: WeatherData = await res.json()
          setWeather(data)
          if (data.current?.cityName) {
            setCity(data.current.cityName)
            try {
              localStorage.setItem(
                "openweather_last_city",
                data.current.cityName
              )
            } catch {}
          }
        }
      } catch (err) {
        console.warn("Failed to load meteorological telemetry", err)
      } finally {
        setLoading(false)
      }
    },
    [
      city,
      settings.weatherSource,
      settings.forecastStation,
      settings.customApiKey,
    ]
  )

  useEffect(() => {
    if (coords) {
      fetchWeather(undefined, coords)
    } else {
      fetchWeather(city)
    }
  }, [
    city,
    coords,
    fetchWeather,
    settings.weatherSource,
    settings.forecastStation,
    settings.customApiKey,
  ])

  // Automatic meteorological briefing with Google TTS on station load
  const lastSpokenCityRef = useRef<string>("")
  useEffect(() => {
    if (
      settings.autoSpeakOnLoad &&
      weather?.current &&
      weather.current.cityName &&
      weather.current.cityName !== lastSpokenCityRef.current &&
      isInitializedRef.current
    ) {
      lastSpokenCityRef.current = weather.current.cityName
      const script = generateWeatherBriefing(
        weather.current,
        weather.daily || [],
        weather.hourly || [],
        unit
      )
      WeatherSpeechSynthesizer.speak(script, {
        rate: settings.speechRate,
        pitch: settings.googleTtsPitch,
        lang: settings.language,
        voiceName: settings.googleTtsVoice,
        model: settings.googleTtsModel,
        audioProfile: settings.googleTtsAudioProfile,
        volumeGainDb: settings.googleTtsVolumeGain,
        googleApiKey: settings.googleApiKey,
      })
    }
  }, [weather, settings, unit])

  // GPS Locate with URL update
  const handleLocate = () => {
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const nextCoords = {
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          }
          setCoords(nextCoords)
          if (typeof window !== "undefined") {
            const nextUrl = buildCurrentUrl({ coords: nextCoords, city: null })
            window.history.pushState(nextCoords, "", nextUrl)
          }
        },
        (err) => {
          console.warn("Geolocation denied or unavailable", err)
          fetchWeather(city)
        }
      )
    }
  }

  // User Actions: City selection with URL history push
  const handleSelectCity = useCallback(
    (newCity: string) => {
      setCoords(null)
      setCity(newCity)
      if (typeof window !== "undefined") {
        const nextUrl = buildCurrentUrl({ city: newCity, coords: null })
        window.history.pushState({ city: newCity }, "", nextUrl)
      }
    },
    [buildCurrentUrl]
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
    if (typeof window !== "undefined") {
      window.history.pushState(null, "", "/")
    }
  }, [])

  return (
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
              Station Telemetry Active
            </span>
            <span>•</span>
            <button
              type="button"
              onClick={() => handleOpenSettings("source")}
              className="group inline-flex cursor-pointer items-center gap-1.5 text-left uppercase transition-colors hover:text-foreground"
              title="Click to choose weather data source & forecast station"
            >
              <span className="text-muted-foreground group-hover:text-foreground">
                Source:{" "}
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
                CHANGE
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
              <span>Refresh</span>
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
          <TabsList className="h-9 w-full [scrollbar-width:none] justify-start overflow-x-auto overflow-y-hidden border-b border-border bg-transparent p-0 [&::-webkit-scrollbar]:hidden">
            <TabsTrigger
              value="overview"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              <LayoutGrid className="size-3.5" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="charts"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              <TrendingUp className="size-3.5" />
              <span>Graphs & Trends</span>
            </TabsTrigger>
            <TabsTrigger
              value="radar"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              <CloudRain className="size-3.5" />
              <span>Radar & Satellite</span>
            </TabsTrigger>
            <TabsTrigger
              value="air-quality"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              <Sparkles className="size-3.5" />
              <span>Air Quality & Health</span>
            </TabsTrigger>
            <TabsTrigger
              value="climate"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              <History className="size-3.5" />
              <span>Historical & Climate</span>
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="gap-1.5 rounded-none border-b-2 border-transparent px-3 font-heading text-xs font-medium data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground"
            >
              <ArrowRightLeft className="size-3.5" />
              <span>Station Comparison</span>
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
              <Skeleton className="h-[560px] w-full" />
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
      />

      {/* Footer */}
      <footer className="space-y-1 border-t border-border px-4 py-6 text-center font-mono text-xs text-muted-foreground">
        <p>OpenWeather Precision Meteorological Console</p>
      </footer>
    </div>
  )
}
