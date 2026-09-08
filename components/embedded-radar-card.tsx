"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  CloudRain,
  Cloud,
  Layers,
  Maximize2,
  Minimize2,
  Gauge,
  Sliders,
  Map,
} from "lucide-react";

interface RadarFrame {
  time: number;
  path: string;
}

interface EmbeddedRadarCardProps {
  lat: number;
  lon: number;
  cityName: string;
  heightClass?: string;
  onExpand?: () => void;
}

const MapInner = dynamic(
  () => import("./radar-map-inner").then((mod) => mod.RadarMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 text-xs font-mono text-muted-foreground">
        Loading Doppler radar stream…
      </div>
    ),
  }
);

export function EmbeddedRadarCard({
  lat,
  lon,
  cityName,
  heightClass = "h-[360px]",
  onExpand,
}: EmbeddedRadarCardProps) {
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [currentFrameIndex, setCurrentFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"radar" | "satellite" | "none">("radar");
  const [mapStyle, setMapStyle] = useState<"dark" | "voyager" | "osm">("dark");
  const [opacity, setOpacity] = useState<number>(0.8);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(750);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const cardContainerRef = useRef<HTMLDivElement>(null);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetch("https://api.rainviewer.com/public/weather-maps.json")
      .then((res) => {
        if (!res.ok) throw new Error("Radar API failed");
        return res.json();
      })
      .then((data) => {
        const past = data.radar?.past || [];
        const nowcast = data.radar?.nowcast || [];
        const all: RadarFrame[] = [...past, ...nowcast];
        setRadarFrames(all);
        if (all.length > 0) {
          const defaultIdx = past.length > 0 ? past.length - 1 : all.length - 1;
          setCurrentFrameIndex(defaultIdx);
        }
      })
      .catch((err) => {
        console.warn("Could not load RainViewer radar frames", err);
      });
  }, []);

  useEffect(() => {
    if (isPlaying && radarFrames.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setCurrentFrameIndex((prev) => (prev + 1) % radarFrames.length);
      }, playbackSpeed);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, radarFrames.length, playbackSpeed]);

  const toggleFullscreen = () => {
    if (!cardContainerRef.current) return;
    if (!isFullscreen) {
      if (cardContainerRef.current.requestFullscreen) {
        cardContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const currentFrame = radarFrames[currentFrameIndex] || null;
  const frameTimeStr = currentFrame
    ? new Date(currentFrame.time * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--:--";

  return (
    <Card ref={cardContainerRef} className={`w-full overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : ""}`}>
      <CardHeader className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <CloudRain className="size-3.5 text-primary" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight flex items-center gap-2">
              <span>Doppler Radar & Atmospheric Layers</span>
              <Badge variant="outline" className="text-tiny font-mono">
                {cityName}
              </Badge>
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Live precipitation Doppler scan & multi-source base maps
          </CardDescription>
        </div>

        <CardAction className="flex flex-wrap items-center gap-1.5">
          {/* Base Map Style */}
          <div className="flex items-center border border-border p-0.5 text-xs font-mono">
            <Button
              variant={mapStyle === "dark" ? "default" : "ghost"}
              size="xs"
              onClick={() => setMapStyle("dark")}
              className="h-6 px-2 text-tiny font-mono"
            >
              Dark
            </Button>
            <Button
              variant={mapStyle === "voyager" ? "default" : "ghost"}
              size="xs"
              onClick={() => setMapStyle("voyager")}
              className="h-6 px-2 text-tiny font-mono"
            >
              Light
            </Button>
          </div>

          {/* Layer Mode */}
          <div className="flex items-center border border-border p-0.5 text-xs font-mono">
            <Button
              variant={activeLayer === "radar" ? "default" : "ghost"}
              size="xs"
              onClick={() => setActiveLayer("radar")}
              className="gap-1 font-mono text-tiny h-6 px-2"
            >
              <CloudRain className="size-3" />
              <span>Radar</span>
            </Button>
            <Button
              variant={activeLayer === "satellite" ? "default" : "ghost"}
              size="xs"
              onClick={() => setActiveLayer("satellite")}
              className="gap-1 font-mono text-tiny h-6 px-2"
            >
              <Cloud className="size-3" />
              <span>Clouds</span>
            </Button>
            <Button
              variant={activeLayer === "none" ? "default" : "ghost"}
              size="xs"
              onClick={() => setActiveLayer("none")}
              className="font-mono text-tiny h-6 px-2"
            >
              Clear
            </Button>
          </div>

          {/* Speed Toggle */}
          <Button
            variant="outline"
            size="xs"
            onClick={() => setPlaybackSpeed((prev) => (prev === 750 ? 400 : 750))}
            className="h-6 px-2 font-mono text-tiny"
            title="Playback Speed"
          >
            {playbackSpeed === 750 ? "1x" : "2x"}
          </Button>

          {/* Fullscreen Button */}
          <Button
            variant="outline"
            size="icon-xs"
            onClick={toggleFullscreen}
            className="h-6 w-6"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="size-3" /> : <Maximize2 className="size-3" />}
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent
        className={`p-0 relative isolate overflow-hidden z-0 ${
          isFullscreen ? "h-[calc(100vh-110px)]" : heightClass
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
        />

        {/* Live Legend Overlay on Map */}
        <div className="absolute top-3 right-3 z-10 bg-background/90 border border-border p-2 text-tiny font-mono shadow-md backdrop-blur-sm hidden sm:block">
          <div className="font-bold text-foreground mb-1">Precipitation dBZ</div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-2 bg-[#00ffff]" title="Light Drizzle" />
            <div className="w-4 h-2 bg-[#0000ff]" title="Rain" />
            <div className="w-4 h-2 bg-[#00ff00]" title="Moderate" />
            <div className="w-4 h-2 bg-[#ffff00]" title="Heavy" />
            <div className="w-4 h-2 bg-[#ff0000]" title="Violent / Hail" />
          </div>
          <div className="flex justify-between text-nano text-muted-foreground pt-0.5">
            <span>Drizzle</span>
            <span>Heavy</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="border-t border-border p-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-muted/10">
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={radarFrames.length === 0}
            className="gap-1.5 font-mono text-xs h-7 px-2.5"
          >
            {isPlaying ? <Pause className="size-3" /> : <Play className="size-3" />}
            <span>{isPlaying ? "PAUSE" : "PLAY LOOP"}</span>
          </Button>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-muted-foreground text-tiny uppercase">Frame</span>
            <span className="font-semibold text-foreground">{frameTimeStr}</span>
            <Badge variant="outline" className="text-tiny font-mono px-1.5 py-0 h-4">
              {currentFrameIndex + 1}/{radarFrames.length}
            </Badge>
          </div>
        </div>

        {/* Timeline Scrubber */}
        <div className="w-full sm:w-72 flex items-center gap-2">
          <span className="text-tiny font-mono text-muted-foreground shrink-0">-2h</span>
          <input
            type="range"
            min={0}
            max={Math.max(0, radarFrames.length - 1)}
            value={currentFrameIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentFrameIndex(parseInt(e.target.value, 10));
            }}
            disabled={radarFrames.length === 0}
            className="w-full accent-primary h-1 bg-muted cursor-pointer"
          />
          <span className="text-tiny font-mono text-muted-foreground shrink-0">Now</span>
        </div>
      </CardFooter>
    </Card>
  );
}
