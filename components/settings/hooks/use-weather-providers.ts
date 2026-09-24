"use client"

import { useState, useEffect, useMemo } from "react"
import {
  ForecastStationModel,
  FORECAST_STATION_MODELS,
  WeatherDataProviderInfo,
  getWeatherDataProviders,
} from "@/lib/weather"

const PROVIDER_PROBE_DEBOUNCE_MS = 500

interface UseWeatherProvidersOptions {
  customApiKey?: string
  forecastStation?: ForecastStationModel
}

/**
 * Custom hook to dynamically discover weather provider capabilities,
 * active API key statuses, and NWP forecast station models.
 */
export function useWeatherProviders({
  customApiKey,
  forecastStation,
}: UseWeatherProvidersOptions) {
  const [serverState, setServerState] = useState<{
    apiKey: string | undefined
    providers: WeatherDataProviderInfo[]
  } | null>(null)

  // Probe provider health once the key text has settled (debounced), aborting
  // any probe that is superseded or outlived the component.
  useEffect(() => {
    const controller = new AbortController()
    const key = customApiKey?.trim() || ""
    const timer = setTimeout(() => {
      fetch("/api/weather?action=providers", {
        headers: key ? { "x-owm-api-key": key } : undefined,
        signal: controller.signal,
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.providers && Array.isArray(data.providers)) {
            setServerState({ apiKey: customApiKey, providers: data.providers })
          }
        })
        .catch(() => {})
    }, PROVIDER_PROBE_DEBOUNCE_MS)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [customApiKey])

  const providers = useMemo(() => {
    if (serverState && serverState.apiKey === customApiKey) {
      return serverState.providers
    }
    return getWeatherDataProviders({
      customApiKey,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    })
  }, [serverState, customApiKey])

  const activeForecastModel =
    FORECAST_STATION_MODELS.find(
      (m) => m.id === (forecastStation || "best_match")
    ) || FORECAST_STATION_MODELS[0]

  return {
    providers,
    activeForecastModel,
  }
}
