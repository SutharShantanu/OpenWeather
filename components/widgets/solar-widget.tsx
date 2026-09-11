"use client";

import React, { useState } from "react";
import { Sunrise, Sunset, Sun, Moon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoonInfo } from "@/lib/weather";
import { useTranslation } from "@/components/language-provider";

interface SolarWidgetProps {
  sunrise: number; // Unix seconds
  sunset: number; // Unix seconds
  currentDt: number; // Unix seconds
  moon?: MoonInfo;
}

export function SolarWidget({ sunrise, sunset, currentDt, moon }: SolarWidgetProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"sun" | "moon">("sun");

  const sunriseTime = new Date(sunrise * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  const sunsetTime = new Date(sunset * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalDaylightSeconds = Math.max(1, sunset - sunrise);
  const elapsedSeconds = Math.max(0, Math.min(totalDaylightSeconds, currentDt - sunrise));
  const progressRatio = elapsedSeconds / totalDaylightSeconds;

  const isDaylight = currentDt >= sunrise && currentDt <= sunset;

  const curveT = Math.max(0, Math.min(1, progressRatio));
  const p0 = { x: 15, y: 75 };
  const p1 = { x: 100, y: 15 };
  const p2 = { x: 185, y: 75 };

  const sunX = Math.round((1 - curveT) * (1 - curveT) * p0.x + 2 * (1 - curveT) * curveT * p1.x + curveT * curveT * p2.x);
  const sunY = Math.round((1 - curveT) * (1 - curveT) * p0.y + 2 * (1 - curveT) * curveT * p1.y + curveT * curveT * p2.y);

  const daylightHours = Math.floor(totalDaylightSeconds / 3600);
  const daylightMinutes = Math.floor((totalDaylightSeconds % 3600) / 60);

  const moonData = moon || {
    phase: 0.5,
    illumination: 50,
    name: "Full Moon",
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            {activeTab === "sun" ? (
              <Sun className="size-3.5 text-amber-500" />
            ) : (
              <Moon className="size-3.5 text-indigo-400" />
            )}
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              {t.widgets.solar.title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {activeTab === "sun" ? t.widgets.solar.subtitle : "Lunar phase & illumination"}
          </CardDescription>
        </div>

        <div className="flex items-center border border-border p-0.5 text-xs font-mono">
          <Button
            variant={activeTab === "sun" ? "default" : "ghost"}
            size="xs"
            onClick={() => setActiveTab("sun")}
            className="h-6 px-2 font-mono text-tiny"
          >
            Sun
          </Button>
          <Button
            variant={activeTab === "moon" ? "default" : "ghost"}
            size="xs"
            onClick={() => setActiveTab("moon")}
            className="h-6 px-2 font-mono text-tiny"
          >
            Moon
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        {activeTab === "sun" ? (
          <>
            {/* SVG Arc Path */}
            <div className="relative w-full h-20 flex items-center justify-center">
              <svg viewBox="0 0 200 85" className="w-full h-full overflow-visible">
                <line x1="10" y1="75" x2="190" y2="75" stroke="currentColor" strokeOpacity={0.2} strokeDasharray="2 2" />
                <path
                  d="M 15 75 Q 100 15 185 75"
                  fill="none"
                  stroke="currentColor"
                  strokeOpacity={0.3}
                  strokeWidth="1.5"
                />
                {isDaylight && (
                  <g>
                    <circle cx={sunX} cy={sunY} r="5" className="fill-amber-500" />
                  </g>
                )}
              </svg>
            </div>

            {/* Timings Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2.5 p-2 bg-muted/20 border border-border">
                <Sunrise className="size-4 text-amber-500 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-micro font-mono text-muted-foreground uppercase">{t.widgets.solar.sunrise}</span>
                  <span className="text-xs font-mono font-bold text-foreground">{sunriseTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-muted/20 border border-border">
                <Sunset className="size-4 text-indigo-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-micro font-mono text-muted-foreground uppercase">{t.widgets.solar.sunset}</span>
                  <span className="text-xs font-mono font-bold text-foreground">{sunsetTime}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center text-tiny font-mono text-muted-foreground pt-1">
              <span>{t.widgets.solar.dayLength}: {daylightHours}h {daylightMinutes}m</span>
              <Badge variant="outline" className="font-mono text-micro">
                {isDaylight ? "Sun Above Horizon" : "Night Cycle"}
              </Badge>
            </div>
          </>
        ) : (
          <div className="space-y-3 py-1">
            <div className="flex items-center justify-between p-3 bg-muted/20 border border-border">
              <div className="space-y-1">
                <span className="text-tiny font-mono text-muted-foreground uppercase">Lunar Phase</span>
                <div className="text-base font-heading font-bold text-foreground">
                  {moonData.name}
                </div>
                <div className="text-xs font-mono text-primary font-semibold">
                  {moonData.illumination}% Illumination
                </div>
              </div>

              {/* Graphic representation of Moon */}
              <div className="size-14 border border-border bg-slate-950 flex items-center justify-center relative overflow-hidden">
                <div
                  className="size-10 rounded-full border border-slate-700 bg-gradient-to-r from-slate-200 to-slate-400 opacity-90 shadow-inner"
                  style={{
                    opacity: Math.max(0.2, moonData.illumination / 100),
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-muted/20 border border-border">
                <span className="text-micro text-muted-foreground uppercase block">Cycle Phase</span>
                <span className="font-bold text-foreground">{(moonData.phase * 29.53).toFixed(1)} / 29.5d</span>
              </div>
              <div className="p-2 bg-muted/20 border border-border">
                <span className="text-micro text-muted-foreground uppercase block">Sky Visibility</span>
                <span className="font-bold text-foreground">{moonData.illumination > 40 ? "Bright Sky" : "Dark Sky"}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
