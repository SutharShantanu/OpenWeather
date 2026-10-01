"use client"

import React, { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"
import { CONFIG } from "@/lib/config"
import {
  Play,
  Pause,
  CloudRain,
  Cloud,
  Maximize2,
  Minimize2,
} from "lucide-react"

interface RadarFrame {
  time: number
  path: string
}

interface EmbeddedRadarCardProps {
  lat: number
  lon: number
  cityName: string
  heightClass?: string
  onExpand?: () => void
  customCartoApiKey?: string
}

const MapInner = dynamic(
  () => import("./radar-map-inner").then((mod) => mod.RadarMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-muted/20 font-mono text-xs text-muted-foreground">
        Loading Doppler radar stream…
      </div>
    ),
  }
)

export function EmbeddedRadarCard({
  lat,
  lon,
  cityName,
  heightClass = "h-[360px]",
  onExpand,
  customCartoApiKey,
}: EmbeddedRadarCardProps) {
  const { t } = useTranslation()
  const prefs = useDisplayPreferences()
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([])
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeLayer, setActiveLayer] = useState<
    "radar" | "satellite" | "none"
  >("radar")
  const [mapStyle, setMapStyle] = useState<"dark" | "voyager" | "osm">("dark")
  const opacity = 0.8
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(750)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const cardContainerRef = useRef<HTMLDivElement>(null)
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetch(`${CONFIG.api.rainViewerApiBaseUrl}/public/weather-maps.json`)
      .then((res) => {
        if (!res.ok) throw new Error("Radar API failed")
        return res.json()
      })
      .then((data) => {
        const past = data.radar?.past || []
        const nowcast = data.radar?.nowcast || []
        const all: RadarFrame[] = [...past, ...nowcast]
        setRadarFrames(all)
        if (all.length > 0) {
          const defaultIdx = past.length > 0 ? past.length - 1 : all.length - 1
          setCurrentFrameIndex(defaultIdx)
        }
      })
      .catch((err) => {
        console.warn("Could not load RainViewer radar frames", err)
      })
  }, [])

  useEffect(() => {
    if (isPlaying && radarFrames.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length)
      }, playbackSpeed)
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current)
    }
  }, [isPlaying, radarFrames.length, playbackSpeed])

  // Keep state in sync when the browser exits fullscreen itself (Esc key).
  useEffect(() => {
    const onChange = () => {
      if (!document.fullscreenElement) setIsFullscreen(false)
    }
    document.addEventListener("fullscreenchange", onChange)
    return () => document.removeEventListener("fullscreenchange", onChange)
  }, [])

  const toggleFullscreen = () => {
    if (!cardContainerRef.current) return
    if (!isFullscreen) {
      if (cardContainerRef.current.requestFullscreen) {
        cardContainerRef.current.requestFullscreen().catch(() => {})
      }
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {})
      }
      setIsFullscreen(false)
    }
  }

  const currentFrame = radarFrames[currentFrameIndex] || null
  const frameTimeStr = currentFrame ? prefs.time(currentFrame.time) : "--:--"

  return (
    <Card
      ref={cardContainerRef}
      className={`w-full overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 h-dvh rounded-none" : ""}`}
    >
      <CardHeader className="flex flex-col justify-between gap-2 border-b border-border pb-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <CloudRain className="size-3.5 text-primary" />
            <CardTitle className="flex min-w-0 items-center gap-2 font-heading text-sm font-semibold tracking-tight">
              <span className="shrink-0">{t.tabs.radar}</span>
              <Badge
                variant="outline"
                className="max-w-32 min-w-0 shrink truncate font-mono text-tiny"
              >
                {cityName}
              </Badge>
            </CardTitle>
          </div>
          <CardDescription className="text-xs">{t.radar.desc}</CardDescription>
        </div>

        <CardAction className="flex flex-wrap items-center gap-1.5">
          {/* Base Map Style */}
          <div className="flex items-center border border-border p-0.5 font-mono text-xs">
            <Button
              variant={mapStyle === "dark" ? "default" : "ghost"}
              aria-pressed={mapStyle === "dark"}
              size="xs"
              onClick={() => setMapStyle("dark")}
              className="h-6 px-2 font-mono text-tiny"
            >
              {t.radar.dark}
            </Button>
            <Button
              variant={mapStyle === "voyager" ? "default" : "ghost"}
              aria-pressed={mapStyle === "voyager"}
              size="xs"
              onClick={() => setMapStyle("voyager")}
              className="h-6 px-2 font-mono text-tiny"
            >
              {t.radar.light}
            </Button>
            <Button
              variant={mapStyle === "osm" ? "default" : "ghost"}
              aria-pressed={mapStyle === "osm"}
              size="xs"
              onClick={() => setMapStyle("osm")}
              className="h-6 px-2 font-mono text-tiny"
            >
              OSM
            </Button>
          </div>

          {/* Layer Mode */}
          <div className="flex items-center border border-border p-0.5 font-mono text-xs">
            <Button
              variant={activeLayer === "radar" ? "default" : "ghost"}
              aria-pressed={activeLayer === "radar"}
              size="xs"
              onClick={() => setActiveLayer("radar")}
              className="h-6 gap-1 px-2 font-mono text-tiny"
            >
              <CloudRain className="size-3" />
              <span>{t.radar.radarLayer}</span>
            </Button>
            <Button
              variant={activeLayer === "satellite" ? "default" : "ghost"}
              aria-pressed={activeLayer === "satellite"}
              size="xs"
              onClick={() => setActiveLayer("satellite")}
              className="h-6 gap-1 px-2 font-mono text-tiny"
            >
              <Cloud className="size-3" />
              <span>{t.radar.cloudsLayer}</span>
            </Button>
            <Button
              variant={activeLayer === "none" ? "default" : "ghost"}
              aria-pressed={activeLayer === "none"}
              size="xs"
              onClick={() => setActiveLayer("none")}
              className="h-6 px-2 font-mono text-tiny"
            >
              {t.radar.clearLayer}
            </Button>
          </div>

          {/* Speed Toggle */}
          <Button
            variant="outline"
            size="xs"
            onClick={() =>
              setPlaybackSpeed((prev) => (prev === 750 ? 400 : 750))
            }
            className="h-6 px-2 font-mono text-tiny"
            title={t.radar.playbackSpeed}
          >
            {playbackSpeed === 750 ? "1x" : "2x"}
          </Button>

          {/* Fullscreen Button */}
          <Button
            variant="outline"
            size="icon-xs"
            onClick={toggleFullscreen}
            className="h-6 w-6"
            title={t.radar.toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize2 className="size-3" />
            ) : (
              <Maximize2 className="size-3" />
            )}
          </Button>

          {onExpand && (
            <Button
              variant="outline"
              size="xs"
              onClick={onExpand}
              className="h-6 px-2 font-mono text-tiny"
              title={t.radar.openFullRadar}
            >
              {t.radar.fullRadar}
            </Button>
          )}
        </CardAction>
      </CardHeader>

      <CardContent
        className={`relative isolate z-0 overflow-hidden p-0 ${
          isFullscreen ? "h-[calc(100dvh-110px)]" : heightClass
        } bg-muted/10`}
      >
        <MapInner
          lat={lat}
          lon={lon}
          cityName={cityName}
          activeLayer={activeLayer}
          currentFrame={currentFrame}
          mapStyle={mapStyle}
          opacity={opacity}
          customCartoApiKey={customCartoApiKey}
        />

        {/* Live Legend Overlay on Map */}
        <div className="absolute end-3 top-3 z-10 hidden border border-border bg-background/90 p-2 font-mono text-tiny shadow-md backdrop-blur-sm sm:block">
          <div className="mb-1 font-bold text-foreground">
            {t.radar.precipDbz}
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2 w-4 bg-[#00ffff]" title="Light Drizzle" />
            <div className="h-2 w-4 bg-[#0000ff]" title="Rain" />
            <div className="h-2 w-4 bg-[#00ff00]" title="Moderate" />
            <div className="h-2 w-4 bg-[#ffff00]" title="Heavy" />
            <div className="h-2 w-4 bg-[#ff0000]" title="Violent / Hail" />
          </div>
          <div className="flex justify-between pt-0.5 text-nano text-muted-foreground">
            <span>{t.radar.drizzle}</span>
            <span>{t.radar.heavy}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-center justify-between gap-3 border-t border-border bg-muted/10 p-3 sm:flex-row">
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={radarFrames.length === 0}
            className="h-7 gap-1.5 px-2.5 font-mono text-xs"
          >
            {isPlaying ? (
              <Pause className="size-3" />
            ) : (
              <Play className="size-3" />
            )}
            <span>{isPlaying ? t.radar.pause : t.radar.playLoop}</span>
          </Button>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-tiny text-muted-foreground uppercase">
              {t.radar.frame}
            </span>
            <span className="font-semibold text-foreground">
              {frameTimeStr}
            </span>
            <Badge
              variant="outline"
              className="h-4 px-1.5 py-0 font-mono text-tiny"
            >
              {currentFrameIndex + 1}/{radarFrames.length}
            </Badge>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="flex w-full items-center gap-2 sm:w-72">
          <span className="shrink-0 font-mono text-tiny text-muted-foreground">
            -2h
          </span>
          <input
            type="range"
            min={0}
            max={Math.max(0, radarFrames.length - 1)}
            value={currentFrameIndex}
            onChange={(e) => {
              setIsPlaying(false)
              setCurrentFrameIndex(parseInt(e.target.value, 10))
            }}
            disabled={radarFrames.length === 0}
            aria-label={t.radar.frame}
            aria-valuetext={frameTimeStr}
            className="h-1 w-full cursor-pointer bg-muted accent-primary"
          />
          <span className="shrink-0 font-mono text-tiny text-muted-foreground">
            {t.common.now}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
