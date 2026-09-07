"use client";

import React from "react";
import NumberFlow from "@number-flow/react";
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  ArrowUp,
  ArrowDown,
  Droplets,
  Wind,
  Gauge,
  Eye,
  SunMedium,
  Cloud,
  Thermometer,
} from "lucide-react";
import { CurrentWeather, formatTemperature, getUvClassification } from "@/lib/weather";
import { WeatherIcon } from "@/components/weather-icon";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface WeatherHeroProps {
  current: CurrentWeather;
  unit: "C" | "F";
  isPinned: boolean;
  onTogglePin: () => void;
}

export function WeatherHero({
  current,
  unit,
  isPinned,
  onTogglePin,
}: WeatherHeroProps) {
  const displayTemp = formatTemperature(current.temp, unit);
  const displayFeelsLike = formatTemperature(current.feelsLike, unit);
  const displayMin = formatTemperature(current.tempMin, unit);
  const displayMax = formatTemperature(current.tempMax, unit);
  const displayDewPoint = current.dewPoint !== undefined ? formatTemperature(current.dewPoint, unit) : null;
  const uvClass = current.uvIndex !== undefined ? getUvClassification(current.uvIndex) : null;

  const localTime = new Date(current.dt * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="font-mono text-tiny gap-1">
              <MapPin className="size-2.5 text-primary" />
              <span>
                {current.lat.toFixed(2)}°N, {current.lon.toFixed(2)}°E
              </span>
            </Badge>
            <Badge variant="secondary" className="font-mono text-tiny">
              {current.country}
            </Badge>
            <span className="text-mini font-mono text-muted-foreground">
              Observed {localTime}
            </span>
            {current.uvIndex !== undefined && uvClass && (
              <Badge variant="outline" className={`font-mono text-tiny ${uvClass.color}`}>
                UV {current.uvIndex.toFixed(1)} {uvClass.risk}
              </Badge>
            )}
          </div>

          <CardTitle className="text-2xl sm:text-4xl font-heading font-semibold tracking-tight text-foreground">
            {current.cityName}
          </CardTitle>

          <CardDescription className="capitalize flex items-center gap-1.5">
            <span>{current.condition.description}</span>
            <span>•</span>
            <span>
              Feels like{" "}
              <span className="font-mono font-semibold text-foreground">
                <NumberFlow value={displayFeelsLike} />°{unit}
              </span>
            </span>
          </CardDescription>
        </div>

        <CardAction>
          <Button
            variant={isPinned ? "secondary" : "outline"}
            size="sm"
            onClick={onTogglePin}
            className="font-mono text-xs gap-1.5"
          >
            {isPinned ? <BookmarkCheck className="size-3.5 text-primary" /> : <Bookmark className="size-3.5" />}
            <span>{isPinned ? "PINNED" : "PIN STATION"}</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* Main Temperature & Icon Presentation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-baseline gap-2">
            <span className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-foreground">
              <NumberFlow value={displayTemp} />
            </span>
            <span className="text-3xl font-light text-muted-foreground font-mono">
              °{unit}
            </span>
          </div>

          <div className="flex items-center gap-4 sm:justify-end">
            <div className="p-3 bg-muted/40 border border-border flex items-center justify-center">
              <WeatherIcon type={current.condition.type} size={36} />
            </div>

            <div className="flex flex-col gap-1 text-xs font-mono text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ArrowDown className="size-3 text-sky-500" />
                <span>Min: </span>
                <span className="font-semibold text-foreground">
                  <NumberFlow value={displayMin} />°{unit}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowUp className="size-3 text-amber-500" />
                <span>Max: </span>
                <span className="font-semibold text-foreground">
                  <NumberFlow value={displayMax} />°{unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Telemetry Metric Cells */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2">
          <div className="p-3 bg-muted/30 border border-border flex items-center gap-3">
            <div className="size-7 bg-background border border-border flex items-center justify-center text-sky-500 shrink-0">
              <Droplets className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-tiny font-mono text-muted-foreground uppercase">Humidity</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                <NumberFlow value={current.humidity} />%
              </span>
            </div>
          </div>

          <div className="p-3 bg-muted/30 border border-border flex items-center gap-3">
            <div className="size-7 bg-background border border-border flex items-center justify-center text-teal-500 shrink-0">
              <Wind className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-tiny font-mono text-muted-foreground uppercase">Wind Velocity</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                <NumberFlow value={current.windSpeed} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} /> m/s
              </span>
            </div>
          </div>

          <div className="p-3 bg-muted/30 border border-border flex items-center gap-3">
            <div className="size-7 bg-background border border-border flex items-center justify-center text-amber-500 shrink-0">
              <Gauge className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-tiny font-mono text-muted-foreground uppercase">Barometer</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                <NumberFlow value={current.pressure} /> hPa
              </span>
            </div>
          </div>

          <div className="p-3 bg-muted/30 border border-border flex items-center gap-3">
            <div className="size-7 bg-background border border-border flex items-center justify-center text-indigo-500 shrink-0">
              <Eye className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-tiny font-mono text-muted-foreground uppercase">Visibility</span>
              <span className="text-sm font-mono font-semibold text-foreground">
                <NumberFlow value={Math.round(current.visibility / 1000)} /> km
              </span>
            </div>
          </div>
        </div>

        {/* Secondary MSN Weather Telemetry Row (UV, Dew Point, Cloud Cover, Gusts) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs font-mono">
          {current.uvIndex !== undefined && (
            <div className="p-2.5 bg-muted/20 border border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground text-tiny">
                <SunMedium className="size-3 text-amber-500" />
                <span>UV INDEX</span>
              </div>
              <span className="font-bold text-foreground">{current.uvIndex.toFixed(1)}</span>
            </div>
          )}

          {displayDewPoint !== null && (
            <div className="p-2.5 bg-muted/20 border border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground text-tiny">
                <Thermometer className="size-3 text-sky-500" />
                <span>DEW POINT</span>
              </div>
              <span className="font-bold text-foreground">{displayDewPoint}°{unit}</span>
            </div>
          )}

          <div className="p-2.5 bg-muted/20 border border-border flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-muted-foreground text-tiny">
              <Cloud className="size-3 text-muted-foreground" />
              <span>CLOUD COVER</span>
            </div>
            <span className="font-bold text-foreground">{current.clouds}%</span>
          </div>

          {current.windGusts !== undefined && (
            <div className="p-2.5 bg-muted/20 border border-border flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground text-tiny">
                <Wind className="size-3 text-teal-500" />
                <span>WIND GUSTS</span>
              </div>
              <span className="font-bold text-foreground">{current.windGusts.toFixed(1)} m/s</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
