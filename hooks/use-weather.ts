"use client"

import { useState, useRef, useEffect, useCallback } from "react"
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

/**
 * Custom hook to manage weather data fetching, meteorological telemetry state,
 * deduplication, and synchronization with location coordinates / city name.
 */
export function useWeather({ settings, isInitialized = true }: UseWeatherOptions) {
  const [city, setCity] = useState("")
  const [coords, setCoords] = useState<Coords | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

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
          setLoading(false)
        }
        return lastDataRef.current
      }

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      const requestId = ++requestIdRef.current

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

        const res = await fetch(`/api/weather?${params.toString()}`, {
          headers: apiKey ? { "x-owm-api-key": apiKey } : undefined,
          signal: controller.signal,
        })
        if (res.ok) {
          const data: WeatherData = await res.json()
          if (requestId !== requestIdRef.current) return null
          setWeather(data)
          lastDataRef.current = data
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
          return data
        }
      } catch (err) {
        if ((err as Error)?.name !== "AbortError") {
          console.warn("Failed to load meteorological telemetry:", err)
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
    return fetchWeather(city, coords || undefined)
  }, [city, coords, fetchWeather])

  return {
    weather,
    loading,
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
