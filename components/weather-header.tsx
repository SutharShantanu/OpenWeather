"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useTheme } from "next-themes"
import {
  Search,
  MapPin,
  Sparkles,
  Settings,
  Sun,
  Moon,
  X,
  Compass,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherAlert,
} from "@/lib/weather"
import { cn } from "@/lib/utils"
import { WeatherTtsButton } from "@/components/weather-tts-button"
import { NotificationsPopover } from "@/components/notifications-popover"
import { ButtonGroup } from "@/components/ui/button-group"

interface GeocodingResult {
  name: string
  lat: number
  lon: number
  country: string
  state?: string
}

interface WeatherHeaderProps {
  onSearch: (city: string) => void
  onLocate: () => void
  onHome?: () => void
  onOpenAiAdvisor?: () => void
  onOpenSettings?: () => void
  showNotifications?: boolean
  onNotificationsOpenChange?: (open: boolean) => void
  current?: CurrentWeather
  daily?: DailyForecastItem[]
  hourly?: HourlyForecastItem[]
  alerts?: WeatherAlert[]
  unit: "C" | "F"
  isLoading?: boolean
}

export function WeatherHeader({
  onSearch,
  onLocate,
  onHome,
  onOpenAiAdvisor,
  onOpenSettings,
  showNotifications,
  onNotificationsOpenChange,
  current,
  daily,
  hourly,
  alerts = [],
  unit,
  isLoading = false,
}: WeatherHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [detectedCoords, setDetectedCoords] = useState<{
    lat: number
    lon: number
  } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Catch user location as soon as search is activated
  const handleSearchFocus = () => {
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
  }

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
  }, [detectedCoords, isLocating])

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Keyless Geocoding API search via internal Next.js route
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query.trim())}`
        )
        if (res.ok) {
          const data = await res.json()
          const list: GeocodingResult[] = Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : []
          setResults(list)
        }
      } catch (err) {
        console.warn("Geocoding lookup error:", err)
      } finally {
        setIsSearching(false)
      }
    }, 280)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (cityName: string) => {
    onSearch(cityName)
    setQuery("")
    setResults([])
    setIsOpen(false)
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (results.length > 0) {
      handleSelect(results[0].name)
    } else if (query.trim()) {
      handleSelect(query.trim())
    } else {
      // Empty input with Enter: use current location
      onLocate()
      setIsOpen(false)
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo & Brand: Home route */}
        <Link
          href="/"
          onClick={(e) => {
            setQuery("")
            setResults([])
            setIsOpen(false)
            if (onHome) {
              e.preventDefault()
              onHome()
            }
          }}
          className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring sm:gap-2.5"
          title="OpenWeather Home"
        >
          <div className="flex size-8 items-center justify-center bg-primary text-primary-foreground">
            <Compass className="size-4" />
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="font-heading text-sm font-medium tracking-tight text-foreground">
              OpenWeather
            </span>
          </div>
        </Link>

        {/* Center: Search with integrated GPS pin */}
        <div ref={searchRef} className="relative max-w-md flex-1">
          <form onSubmit={handleFormSubmit} className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={handleSearchFocus}
              placeholder="Search station or coordinates… (Press /)"
              className="pr-16 pl-8 font-mono text-xs"
            />
            <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    setResults([])
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={onLocate}
                    disabled={isLoading}
                    className="p-1 text-muted-foreground transition-colors hover:text-primary"
                    title="GPS Auto-Detect"
                  >
                    <MapPin className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>GPS Auto-Detect Location</TooltipContent>
              </Tooltip>
              <kbd className="hidden border border-border px-1 py-0.5 font-mono text-micro text-muted-foreground sm:inline-flex">
                /
              </kbd>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isOpen && (
            <div className="absolute top-full right-0 left-0 z-50 mt-1 border border-border bg-popover text-xs shadow-md ring-1 ring-foreground/10">
              {/* 0. GPS Current Station (Caught instantly on search activation) */}
              <button
                type="button"
                onClick={() => {
                  onLocate()
                  setIsOpen(false)
                  setQuery("")
                  setResults([])
                }}
                className="group flex w-full items-center justify-between border-b border-border bg-primary/5 px-3 py-2 text-left font-mono text-xs transition-colors hover:bg-muted/80"
              >
                <div className="flex items-center gap-2">
                  <div className="flex size-6 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
                    <MapPin
                      className={cn(
                        "size-3.5",
                        isLocating && "animate-pulse text-primary"
                      )}
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <span>Current Station (GPS)</span>
                      {isLocating ? (
                        <Badge
                          variant="outline"
                          className="h-4 animate-pulse border-primary/30 py-0 font-mono text-nano text-primary"
                        >
                          Detecting...
                        </Badge>
                      ) : detectedCoords ? (
                        <Badge
                          variant="outline"
                          className="h-4 border-emerald-500/30 py-0 font-mono text-nano text-emerald-600 dark:text-emerald-400"
                        >
                          GPS Locked
                        </Badge>
                      ) : null}
                    </div>
                    <div className="text-mini text-muted-foreground">
                      {detectedCoords
                        ? `${detectedCoords.lat.toFixed(3)}°, ${detectedCoords.lon.toFixed(3)}° • Click to load station`
                        : "Auto-detect meteorological station from device sensors"}
                    </div>
                  </div>
                </div>
                <span className="text-tiny font-bold text-primary group-hover:underline">
                  Locate →
                </span>
              </button>

              {isSearching ? (
                <div className="p-3 text-center font-mono text-xs text-muted-foreground">
                  Locating stations…
                </div>
              ) : results.length > 0 ? (
                <div className="max-h-64 overflow-y-auto py-1">
                  <div className="border-b border-border px-3 py-1 font-mono text-tiny text-muted-foreground uppercase">
                    Geocoding Matches
                  </div>
                  {results.map((r, i) => (
                    <button
                      key={`${r.name}-${r.lat}-${i}`}
                      onClick={() => handleSelect(r.name)}
                      className="flex w-full items-center justify-between border-b border-border/40 px-3 py-2 text-left transition-colors last:border-0 hover:bg-muted"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3 shrink-0 text-primary" />
                        <div>
                          <span className="font-medium text-foreground">
                            {r.name}
                          </span>
                          <span className="ml-1.5 text-mini text-muted-foreground">
                            {r.state ? `${r.state}, ` : ""}
                            {r.country}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-tiny text-muted-foreground">
                        {r.lat.toFixed(2)}°, {r.lon.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              ) : query.trim().length >= 2 ? (
                <div className="p-3 text-center font-mono text-xs text-muted-foreground">
                  No meteorological station found for &ldquo;{query}&rdquo;
                </div>
              ) : (
                <div className="p-2.5">
                  <div className="mb-1.5 font-mono text-tiny text-muted-foreground uppercase">
                    Popular Hubs
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {[
                      "Tokyo",
                      "New York",
                      "London",
                      "Paris",
                      "Sydney",
                      "Dubai",
                      "Singapore",
                    ].map((c) => (
                      <Button
                        key={c}
                        variant="secondary"
                        size="xs"
                        onClick={() => handleSelect(c)}
                        className="font-mono text-xs"
                      >
                        {c}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Actions: Decluttered, unified controls */}
        <div className="flex shrink-0 items-center gap-1.5">
          {/* 1. Spoken Audio Briefing (Text-to-Speech) */}
          {current && (
            <WeatherTtsButton
              current={current}
              daily={daily}
              hourly={hourly}
              unit={unit}
            />
          )}

          {/* 2. AI Weather Intelligence Advisor */}
          {onOpenAiAdvisor && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenAiAdvisor}
                  className="h-8 gap-1.5 px-2.5 font-mono text-xs"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  <span className="hidden text-mini md:inline">AI Advisor</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                AI Synoptic Intelligence & Sudden Shift Analysis
              </TooltipContent>
            </Tooltip>
          )}

          {/* Real Notifications Center with Web Push */}
          <NotificationsPopover
            alerts={alerts}
            current={current}
            open={showNotifications}
            onOpenChange={onNotificationsOpenChange}
          />
          {/* 3, 4, 5: Actions Button Group */}
          <ButtonGroup>
            {/* Comprehensive Settings Menu */}
            {onOpenSettings && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={onOpenSettings}
                    className="size-8"
                    title="Configure Station Settings"
                  >
                    <Settings className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Station & Application Preferences
                </TooltipContent>
              </Tooltip>
            )}

            {/* Theme Toggle with smooth Sun/Moon transition */}
            <Button
              variant="outline"
              size="icon-sm"
              className="relative size-8"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
              aria-label={
                mounted
                  ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`
                  : "Toggle theme"
              }
              title="Toggle Dark / Light Theme"
              disabled={!mounted}
            >
              <Sun
                className={cn(
                  "size-3.5 transition-all duration-300",
                  mounted && resolvedTheme === "dark"
                    ? "scale-0 -rotate-90 opacity-0"
                    : "scale-100 rotate-0 opacity-100"
                )}
              />
              <Moon
                className={cn(
                  "absolute size-3.5 transition-all duration-300",
                  mounted && resolvedTheme === "dark"
                    ? "scale-100 rotate-0 opacity-100"
                    : "scale-0 rotate-90 opacity-0"
                )}
              />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </ButtonGroup>
        </div>
      </div>
    </header>
  )
}
