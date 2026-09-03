"use client";

import React, { useState, useEffect } from "react";
import NumberFlow from "@number-flow/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRightLeft,
  Navigation,
  Droplets,
  Wind,
  Gauge,
  Sparkles,
  CloudSun,
} from "lucide-react";
import { CurrentWeather, formatTemperature } from "@/lib/weather";
import { WeatherIcon } from "@/components/weather-icon";

interface InlineComparisonMatrixProps {
  baseCurrent: CurrentWeather;
  unit: "C" | "F";
  onSwitchCity: (cityName: string) => void;
}

const POPULAR_TARGETS = [
  "New York",
  "Tokyo",
  "London",
  "Paris",
  "Sydney",
  "Singapore",
  "Dubai",
  "Mumbai",
];

export function InlineComparisonMatrix({
  baseCurrent,
  unit,
  onSwitchCity,
}: InlineComparisonMatrixProps) {
  const [targetCity, setTargetCity] = useState("Tokyo");
  const [targetWeather, setTargetWeather] = useState<CurrentWeather | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`/api/weather?city=${encodeURIComponent(targetCity)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.current) {
          setTargetWeather(data.current);
        }
      })
      .catch((err) => console.warn("Failed to fetch target telemetry", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [targetCity]);

  const baseTemp = formatTemperature(baseCurrent.temp, unit);
  const targetTemp = targetWeather ? formatTemperature(targetWeather.temp, unit) : 0;
  const tempDiff = targetTemp - baseTemp;

  const humidityDiff = targetWeather ? targetWeather.humidity - baseCurrent.humidity : 0;
  const windDiff = targetWeather ? targetWeather.windSpeed - baseCurrent.windSpeed : 0;
  const pressureDiff = targetWeather ? targetWeather.pressure - baseCurrent.pressure : 0;

  const renderDelta = (delta: number, suffix: string, invertGood = false) => {
    const isZero = Math.abs(delta) < 0.1;
    if (isZero) {
      return (
        <span className="font-mono text-xs text-muted-foreground">0{suffix}</span>
      );
    }
    const isPositive = delta > 0;
    const isGood = invertGood ? !isPositive : isPositive;

    return (
      <span
        className={`font-mono text-xs font-semibold px-1.5 py-0.5 border ${
          isGood ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
        }`}
      >
        {isPositive ? "+" : ""}
        {delta.toFixed(1)}
        {suffix}
      </span>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-3.5 text-primary" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              Comparative Station Telemetry Matrix
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Direct variance analysis between primary station and global metropolises
          </CardDescription>
        </div>

        <CardAction className="flex items-center gap-1 overflow-x-auto">
          {POPULAR_TARGETS.filter((c) => c.toLowerCase() !== baseCurrent.cityName.toLowerCase()).map(
            (c) => (
              <Button
                key={c}
                variant={targetCity.toLowerCase() === c.toLowerCase() ? "default" : "outline"}
                size="xs"
                onClick={() => setTargetCity(c)}
                className="font-mono text-xs shrink-0"
              >
                {c}
              </Button>
            )
          )}
        </CardAction>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Dual Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Base Station */}
          <div className="p-3 bg-muted/20 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="outline" className="text-[10px] font-mono">
                  PRIMARY STATION
                </Badge>
                <span className="text-[10px] font-mono text-muted-foreground">Active</span>
              </div>
              <h3 className="text-base font-heading font-semibold text-foreground">{baseCurrent.cityName}</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {baseCurrent.condition.description}
              </p>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <span className="text-3xl font-mono font-bold text-foreground">
                <NumberFlow value={baseTemp} />°{unit}
              </span>
              <WeatherIcon type={baseCurrent.condition.type} size={22} />
            </div>
          </div>

          {/* Target Station */}
          <div className="p-3 bg-muted/20 border border-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <Badge variant="secondary" className="text-[10px] font-mono">
                  TARGET STATION
                </Badge>
                {renderDelta(tempDiff, `°${unit}`)}
              </div>
              <h3 className="text-base font-heading font-semibold text-foreground">
                {targetWeather?.cityName || targetCity}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {loading ? "Syncing telemetry…" : targetWeather?.condition.description || "Connected"}
              </p>
            </div>

            <div className="flex items-baseline justify-between mt-3">
              <span className="text-3xl font-mono font-bold text-foreground">
                {targetWeather ? (
                  <>
                    <NumberFlow value={targetTemp} />°{unit}
                  </>
                ) : (
                  "--°"
                )}
              </span>

              {targetWeather && (
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onSwitchCity(targetWeather.cityName)}
                  className="gap-1 text-primary font-mono text-xs"
                >
                  <Navigation className="size-2.5" />
                  <span>Switch Dashboard</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Delta Table */}
        {targetWeather && (
          <div className="border border-border text-xs">
            <div className="bg-muted/40 px-3 py-1.5 border-b border-border flex justify-between font-mono text-[10px] text-muted-foreground font-semibold">
              <span className="w-1/3">ATMOSPHERIC METRIC</span>
              <span className="w-1/4 text-center">{baseCurrent.cityName.toUpperCase()}</span>
              <span className="w-1/4 text-center">{targetWeather.cityName.toUpperCase()}</span>
              <span className="w-1/6 text-right">SPREAD DELTA</span>
            </div>

            <div className="divide-y divide-border">
              <div className="px-3 py-2 flex justify-between items-center font-mono">
                <div className="w-1/3 flex items-center gap-1.5">
                  <CloudSun className="size-3 text-amber-500" />
                  <span>Temperature</span>
                </div>
                <span className="w-1/4 text-center">{baseTemp}°{unit}</span>
                <span className="w-1/4 text-center">{targetTemp}°{unit}</span>
                <div className="w-1/6 flex justify-end">{renderDelta(tempDiff, `°${unit}`)}</div>
              </div>

              <div className="px-3 py-2 flex justify-between items-center font-mono">
                <div className="w-1/3 flex items-center gap-1.5">
                  <Droplets className="size-3 text-sky-500" />
                  <span>Relative Humidity</span>
                </div>
                <span className="w-1/4 text-center">{baseCurrent.humidity}%</span>
                <span className="w-1/4 text-center">{targetWeather.humidity}%</span>
                <div className="w-1/6 flex justify-end">{renderDelta(humidityDiff, "%")}</div>
              </div>

              <div className="px-3 py-2 flex justify-between items-center font-mono">
                <div className="w-1/3 flex items-center gap-1.5">
                  <Wind className="size-3 text-teal-500" />
                  <span>Wind Velocity</span>
                </div>
                <span className="w-1/4 text-center">{baseCurrent.windSpeed.toFixed(1)} m/s</span>
                <span className="w-1/4 text-center">{targetWeather.windSpeed.toFixed(1)} m/s</span>
                <div className="w-1/6 flex justify-end">{renderDelta(windDiff, " m/s")}</div>
              </div>

              <div className="px-3 py-2 flex justify-between items-center font-mono">
                <div className="w-1/3 flex items-center gap-1.5">
                  <Gauge className="size-3 text-amber-500" />
                  <span>Barometric Pressure</span>
                </div>
                <span className="w-1/4 text-center">{baseCurrent.pressure} hPa</span>
                <span className="w-1/4 text-center">{targetWeather.pressure} hPa</span>
                <div className="w-1/6 flex justify-end">{renderDelta(pressureDiff, " hPa")}</div>
              </div>

              <div className="px-3 py-2 flex justify-between items-center font-mono">
                <div className="w-1/3 flex items-center gap-1.5">
                  <Sparkles className="size-3 text-emerald-500" />
                  <span>Air Quality Index</span>
                </div>
                <span className="w-1/4 text-center">AQI {baseCurrent.airQuality?.aqi ?? 1}</span>
                <span className="w-1/4 text-center">AQI {targetWeather.airQuality?.aqi ?? 1}</span>
                <div className="w-1/6 flex justify-end">
                  {renderDelta(
                    (targetWeather.airQuality?.aqi ?? 1) - (baseCurrent.airQuality?.aqi ?? 1),
                    "",
                    true
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
