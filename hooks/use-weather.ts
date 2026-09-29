"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useLatest } from "./use-latest"
import {
  type WeatherData,
  type WeatherDataSource,
  type ForecastStationModel,
} from "@/lib/weather"
import type { ExtendedSettings } from "@/components/settings-dialog"

interface UseWeatherOptions {
  settings: ExtendedSettings
  isInitialized?: boolean
}

type Coords = { lat: number; lon: number }

/** Delay before refetching after the OpenWeatherMap key text changes. */
const API_KEY_DEBOUNCE_MS = 500
/** Data older than this is refreshed in the background while the tab is visible. */
const STALE_AFTER_MS = 10 * 60 * 1000
const STALE_CHECK_INTERVAL_MS = 60 * 1000

/**
 * Custom hook to manage weather data fetching, meteorological telemetry state,
 * deduplication, and synchronization with location coordinates / city name.
 */
export function useWeather({ settings, isInitialized = true }: UseWeatherOptions) {
  const [city, setCity] = useState("")
  const [coords, setCoords] = useState<Coords | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cityRef = useRef(city)
  useEffect(() => {
    cityRef.current = city
  }, [city])

  const coordsRef = useRef(coords)
  useEffect(() => {
    coordsRef.current = coords
  }, [coords])

  const lastFetchKeyRef = useRef<string>("")
  const lastDataRef = useRef<WeatherData | null>(null)
  // Only the most recent request may commit results; older ones are aborted.
  const requestIdRef = useRef(0)
  const abortRef = useRef<AbortController | null>(null)
  // Background refreshes keep the current data on screen (no loading state).
  const silentRef = useRef(false)
  const lastSuccessAtRef = useRef(0)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const fetchWeather = useCallback(
    async (
      targetCity?: string,
      targetCoords?: Coords,
      sourceOverride?: WeatherDataSource,
      stationOverride?: ForecastStationModel,
      keyOverride?: string
    ) => {
      const silent = silentRef.current
      silentRef.current = false
      const src = sourceOverride ?? settings.weatherSource ?? "open-meteo"
      const stn = stationOverride ?? settings.forecastStation ?? "best_match"
      const apiKey = (keyOverride ?? settings.customApiKey ?? "").trim()
      const lang = settings.language || "en"
      const query = targetCity !== undefined ? targetCity : cityRef.current
      const isAutoDetect = !targetCoords && !query

      const fetchKey = `${targetCoords ? `${targetCoords.lat.toFixed(4)},${targetCoords.lon.toFixed(4)}` : query || "auto"}:${src}:${stn}:${lang}:${apiKey}`

      if (lastFetchKeyRef.current === fetchKey && lastDataRef.current) {
        // Cancel any in-flight request for a different location/config so it
        // cannot overwrite the data the user just returned to.
        if (abortRef.current) {
          abortRef.current.abort()
          abortRef.current = null
          requestIdRef.current++
        }
        // Callers may have set loading before calling; always release it.
        setLoading(false)
        setError(null)
        return lastDataRef.current
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const requestId = ++requestIdRef.current

      if (!silent) setLoading(true)
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

        const res = await fetch(`/api/weather?${params.toString()}`, {
          headers: apiKey ? { "x-owm-api-key": apiKey } : undefined,
          signal: controller.signal,
        })
        if (res.ok) {
          const data: WeatherData = await res.json()
          if (requestId !== requestIdRef.current) return null
          setWeather(data)
          lastDataRef.current = data
          lastSuccessAtRef.current = Date.now()
          lastFetchKeyRef.current = fetchKey
          if (data.current?.cityName) {
            setCity(data.current.cityName)
            cityRef.current = data.current.cityName
          }
          // Only an auto-detected (IP/geo header) lookup learns its coordinates
          // from the response. A city-name query must stay a city query:
          // setting coords here would flip the URL from ?city= to ?lat=&lon=.
          if (isAutoDetect && data.current?.lat && data.current?.lon) {
            const nextCoords = { lat: data.current.lat, lon: data.current.lon }
            coordsRef.current = nextCoords
            setCoords(nextCoords)
          }
          setError(null)
          return data
        }
        const body = await res.json().catch(() => null)
        if (requestId === requestIdRef.current) {
          setError(body?.error || `Weather request failed (${res.status})`)
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          console.warn("Failed to load meteorological telemetry:", err)
          if (requestId === requestIdRef.current) {
            setError((err as Error)?.message || "Network error")
          }
        }
      } finally {
        if (requestId === requestIdRef.current) {
          abortRef.current = null
          setLoading(false)
        }
      }
      return null
    },
    [
      settings.weatherSource,
      settings.forecastStation,
      settings.customApiKey,
      settings.language,
    ]
  )

  // Re-fetch the current location when provider settings or language change.
  // The initial load is driven by the page (URL restore / geolocation), so the
  // first initialized run only records the baseline. Location changes are also
  // fetched explicitly by the caller, so coords/city are read from refs and are
  // intentionally not dependencies (that caused a duplicate fetch per change).
  // The fetch is scheduled from a timer: this both debounces key typing and
  // keeps state updates out of the synchronous effect body.
  const hasBaselineRef = useRef(false)
  const prevApiKeyRef = useRef(settings.customApiKey ?? "")
  const customApiKey = settings.customApiKey ?? ""
  useEffect(() => {
    if (!isInitialized) return
    const keyChanged = prevApiKeyRef.current !== customApiKey
    prevApiKeyRef.current = customApiKey
    if (!hasBaselineRef.current) {
      hasBaselineRef.current = true
      return
    }
    const timer = setTimeout(
      () => {
        const currentCoords = coordsRef.current
        if (currentCoords) {
          fetchWeather(undefined, currentCoords)
        } else if (cityRef.current) {
          fetchWeather(cityRef.current)
        } else {
          fetchWeather()
        }
      },
      keyChanged ? API_KEY_DEBOUNCE_MS : 0
    )
    return () => clearTimeout(timer)
  }, [fetchWeather, customApiKey, isInitialized])

  const refetch = useCallback(() => {
    // Refresh must hit the network, so bypass the dedupe cache.
    lastFetchKeyRef.current = ""
    return fetchWeather(city, coords || undefined)
  }, [city, coords, fetchWeather])

  // Keep data fresh without user action: refresh in the background when data is
  // stale and the tab is visible, and retry as soon as the connection returns.
  const refreshInBackground = useLatest(() => {
    if (!lastDataRef.current && !lastFetchKeyRef.current && !error) return // initial load not done yet
    silentRef.current = !!lastDataRef.current
    lastFetchKeyRef.current = ""
    const currentCoords = coordsRef.current
    void fetchWeather(currentCoords ? undefined : cityRef.current, currentCoords ?? undefined)
  })
  useEffect(() => {
    const refreshIfStale = () => {
      if (document.hidden || !navigator.onLine || !lastDataRef.current) return
      if (Date.now() - lastSuccessAtRef.current >= STALE_AFTER_MS) refreshInBackground.current()
    }
    const onOnline = () => refreshInBackground.current()
    const timer = setInterval(refreshIfStale, STALE_CHECK_INTERVAL_MS)
    document.addEventListener("visibilitychange", refreshIfStale)
    window.addEventListener("online", onOnline)
    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", refreshIfStale)
      window.removeEventListener("online", onOnline)
    }
  }, [refreshInBackground])

  return {
    weather,
    loading,
    error,
    setLoading,
    city,
    setCity,
    coords,
    setCoords,
    fetchWeather,
    refetch,
    cityRef,
  }
}
