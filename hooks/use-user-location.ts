"use client"

import { useState, useCallback } from "react"

export interface NetworkLocationResult {
  city: string
  region: string
  country: string
  lat: number
  lon: number
  displayName: string
}

export interface DetectedLocation {
  coords: { lat: number; lon: number }
  city?: string
  /** Where the fix came from: browser GPS or IP/network fallback. */
  source?: "gps" | "network"
}

/**
 * Why precise (browser) geolocation was not obtained.
 * - denied: user/browser blocked the permission
 * - unavailable: position could not be determined
 * - timeout: the request timed out
 * - unsupported: no Geolocation API in this environment
 */
export type LocationErrorReason =
  | "denied"
  | "unavailable"
  | "timeout"
  | "unsupported"

export interface LocationError {
  reason: LocationErrorReason
  /** True when the network fallback also failed (no location at all). */
  fallbackFailed: boolean
  message?: string
}

interface UseUserLocationOptions {
  /** Language for reverse-geocoded place names (BigDataCloud fallback). */
  language?: string
}

function reasonFromGeoError(err: GeolocationPositionError): LocationErrorReason {
  switch (err.code) {
    case 1: // PERMISSION_DENIED
      return "denied"
    case 3: // TIMEOUT
      return "timeout"
    default: // POSITION_UNAVAILABLE
      return "unavailable"
  }
}

/**
 * Custom hook to detect user location with robust fallback cascade:
 * GPS Coordinates -> Internal `/api/location` -> BigDataCloud Reverse-Geocode Client
 */
export function useUserLocation({ language = "en" }: UseUserLocationOptions = {}) {
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<LocationError | null>(null)

  // Fetch location region from network call (/api/location with client-side BigDataCloud fallback)
  const fetchLocationRegionFromNetwork = useCallback(async (): Promise<NetworkLocationResult | null> => {
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
        `https://api.bigdatacloud.net/data/reverse-geocode-client?localityLanguage=${encodeURIComponent(language)}`
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
  }, [language])

  // Detect user location using browser GPS with network fallback.
  // On GPS failure the reason is exposed via `locationError`.
  const detectUserLocation = useCallback(
    async (options?: {
      highAccuracy?: boolean
      timeout?: number
      maximumAge?: number
    }): Promise<DetectedLocation | null> => {
      setIsLocating(true)
      setLocationError(null)

      const fallbackToNetwork = async (
        reason: LocationErrorReason,
        message?: string
      ): Promise<DetectedLocation | null> => {
        const netLoc = await fetchLocationRegionFromNetwork()
        setLocationError({ reason, fallbackFailed: !netLoc, message })
        setIsLocating(false)
        if (!netLoc) return null
        return {
          coords: { lat: netLoc.lat, lon: netLoc.lon },
          city: netLoc.displayName || netLoc.city || netLoc.region,
          source: "network",
        }
      }

      // 1. Check if geolocation permission is explicitly denied via Permissions API
      if (typeof navigator !== "undefined" && navigator.permissions?.query) {
        try {
          const perm = await navigator.permissions.query({ name: "geolocation" })
          if (perm.state === "denied") {
            return fallbackToNetwork("denied", "Geolocation permission denied")
          }
        } catch {
          // Permissions API query not supported in all browsers; proceed to standard request
        }
      }

      // 2. Request browser geolocation with promise wrapper
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        return new Promise<DetectedLocation | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              setIsLocating(false)
              resolve({
                coords: {
                  lat: pos.coords.latitude,
                  lon: pos.coords.longitude,
                },
                source: "gps",
              })
            },
            (err) => {
              resolve(fallbackToNetwork(reasonFromGeoError(err), err.message))
            },
            {
              timeout: options?.timeout ?? 7000,
              enableHighAccuracy: options?.highAccuracy ?? false,
              maximumAge: options?.maximumAge ?? 300000,
            }
          )
        })
      }

      // 3. Geolocation unsupported: fallback to network
      return fallbackToNetwork("unsupported", "Geolocation API unavailable")
    },
    [fetchLocationRegionFromNetwork]
  )

  const clearLocationError = useCallback(() => setLocationError(null), [])

  return {
    isLocating,
    locationError,
    clearLocationError,
    fetchLocationRegionFromNetwork,
    detectUserLocation,
  }
}
