"use client"

import React, { useEffect, useRef, useCallback } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { CONFIG } from "@/lib/config"
import { useDisplayPreferences } from "@/components/display-preferences-provider"
import { useTranslation } from "@/components/language-provider"

interface RadarMapInnerProps {
  lat: number
  lon: number
  cityName: string
  activeLayer: "radar" | "satellite" | "none"
  currentFrame: { time: number; path: string } | null
  mapStyle?: "dark" | "voyager" | "osm"
  opacity?: number
  customCartoApiKey?: string
}

const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors'

// Tile licences (OSM ODbL, CARTO) require visible attribution.
function baseAttribution(style: string) {
  return style === "osm"
    ? OSM_ATTRIBUTION
    : `${OSM_ATTRIBUTION} &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener">CARTO</a>`
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)
}

export function RadarMapInner({
  lat,
  lon,
  cityName,
  activeLayer,
  currentFrame,
  mapStyle = "dark",
  opacity = 0.75,
  customCartoApiKey,
}: RadarMapInnerProps) {
  const { t } = useTranslation()
  const prefs = useDisplayPreferences()
  // Leaflet popups render HTML; the city name comes from upstream data, so escape it.
  const popupHtml = `<b>${escapeHtml(t.radar.stationPopup(cityName))}</b><br/>${prefs.coords(lat, lon, 3)}`
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const baseTileRef = useRef<L.TileLayer | null>(null)
  const overlayRef = useRef<L.TileLayer | null>(null)

  const getBaseTileUrl = useCallback(
    (style: string) => {
      const withCartoKey = (url: string) => {
        const apiKey =
          customCartoApiKey ||
          process.env.NEXT_PUBLIC_CARTO_API_KEY ||
          CONFIG.keys.cartoApiKey
        if (!apiKey || url.includes("key=")) return url
        const separator = url.includes("?") ? "&" : "?"
        return `${url}${separator}key=${apiKey}`
      }

      switch (style) {
        case "voyager":
          return withCartoKey(
            `${CONFIG.api.cartoCdnTileBaseUrl}/rastertiles/voyager/{z}/{x}/{y}{r}.png`
          )
        case "osm":
          return `${CONFIG.api.openStreetMapTileBaseUrl}/{z}/{x}/{y}.png`
        case "dark":
        default:
          return withCartoKey(
            `${CONFIG.api.cartoCdnTileBaseUrl}/rastertiles/dark_all/{z}/{x}/{y}{r}.png`
          )
      }
    },
    [customCartoApiKey]
  )

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = L.map(containerRef.current, {
      center: [lat, lon],
      zoom: 7,
      zoomControl: true,
      attributionControl: true,
    })
    map.attributionControl.setPrefix(false)

    const baseTile = L.tileLayer(getBaseTileUrl(mapStyle), {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: baseAttribution(mapStyle),
    }).addTo(map)
    baseTileRef.current = baseTile

    const marker = L.marker([lat, lon], {
      icon: L.divIcon({
        className: "custom-pin",
        html: `<div style="width: 12px; height: 12px; background: var(--primary); border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.5);"></div>`,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      }),
    }).addTo(map)

    marker.bindPopup(popupHtml)

    mapRef.current = map
    markerRef.current = marker

    return () => {
      map.remove()
      mapRef.current = null
    }
    // Map instance is created once on mount; dynamic prop updates are handled by subsequent effects
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update base map style or API key if switched
  useEffect(() => {
    if (!mapRef.current) return
    if (baseTileRef.current) {
      mapRef.current.removeLayer(baseTileRef.current)
    }
    const newBase = L.tileLayer(getBaseTileUrl(mapStyle), {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: baseAttribution(mapStyle),
    }).addTo(mapRef.current)
    baseTileRef.current = newBase
    if (overlayRef.current) {
      overlayRef.current.bringToFront()
    }
  }, [mapStyle, getBaseTileUrl])

  // Update center when coordinates change
  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.setView([lat, lon], mapRef.current.getZoom() || 7)
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lon])
      markerRef.current.setPopupContent(popupHtml)
    }
  }, [lat, lon, popupHtml])

  // Update Doppler radar or satellite overlay
  useEffect(() => {
    if (!mapRef.current) return

    if (overlayRef.current) {
      mapRef.current.removeLayer(overlayRef.current)
      overlayRef.current = null
    }

    if (activeLayer === "none" || !currentFrame) return

    let tileUrl = ""
    if (activeLayer === "radar") {
      // 2 = Universal Blue-Green-Yellow-Red palette
      tileUrl = `${CONFIG.api.rainViewerTileBaseUrl}${currentFrame.path}/256/{z}/{x}/{y}/2/1_1.png`
    } else if (activeLayer === "satellite") {
      // 0 = infrared
      tileUrl = `${CONFIG.api.rainViewerTileBaseUrl}${currentFrame.path}/256/{z}/{x}/{y}/0/0_0.png`
    }

    const overlay = L.tileLayer(tileUrl, {
      opacity: opacity,
      zIndex: 10,
      attribution:
        '<a href="https://www.rainviewer.com/" target="_blank" rel="noopener">RainViewer</a>',
      maxNativeZoom: 7,
      maxZoom: 19,
    })

    overlay.addTo(mapRef.current)
    overlayRef.current = overlay
  }, [activeLayer, currentFrame, opacity])

  return (
    <div
      ref={containerRef}
      role="region"
      aria-label={t.tabs.radar}
      className="relative isolate z-0 h-full w-full overflow-hidden focus:outline-none focus-visible:outline-2 focus-visible:outline-ring"
    />
  )
}
