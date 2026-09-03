"use client";

import React, { useEffect, useState } from "react";
import NumberFlow from "@number-flow/react";
import { Bookmark, X, ArrowUpRight } from "lucide-react";
import { CurrentWeather, formatTemperature } from "@/lib/weather";
import { WeatherIcon } from "@/components/weather-icon";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PinnedLocationsProps {
  pinnedCities: string[];
  unit: "C" | "F";
  onSelectCity: (city: string) => void;
  onUnpinCity: (city: string) => void;
}

export function PinnedLocations({
  pinnedCities,
  unit,
  onSelectCity,
  onUnpinCity,
}: PinnedLocationsProps) {
  const [cityData, setCityData] = useState<Record<string, CurrentWeather>>({});

  useEffect(() => {
    if (pinnedCities.length === 0) return;

    let isMounted = true;

    Promise.all(
      pinnedCities.map(async (city) => {
        try {
          const res = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
          if (res.ok) {
            const data = await res.json();
            return { city, weather: data.current as CurrentWeather };
          }
        } catch {
          // ignore error
        }
        return null;
      })
    ).then((results) => {
      if (!isMounted) return;
      const map: Record<string, CurrentWeather> = {};
      results.forEach((r) => {
        if (r && r.weather) {
          map[r.city.toLowerCase()] = r.weather;
        }
      });
      setCityData(map);
    });

    return () => {
      isMounted = false;
    };
  }, [pinnedCities]);

  if (pinnedCities.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Bookmark className="size-3.5 text-primary" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              Pinned Weather Stations
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Persistent quick-access telemetry locations
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-[10px] font-mono">
          {pinnedCities.length} {pinnedCities.length === 1 ? "Station" : "Stations"}
        </Badge>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {pinnedCities.map((city) => {
            const weather = cityData[city.toLowerCase()];
            const temp = weather ? formatTemperature(weather.temp, unit) : null;

            return (
              <div
                key={city}
                onClick={() => onSelectCity(city)}
                className="group p-3 bg-muted/20 border border-border hover:bg-muted/40 transition-colors cursor-pointer flex flex-col justify-between h-28"
              >
                {/* Header: Name + Unpin Button */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-heading font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                      {weather?.cityName || city}
                      <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h4>
                    <p className="text-[11px] text-muted-foreground capitalize">
                      {weather?.condition.description || "Loading telemetry…"}
                    </p>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnpinCity(city);
                    }}
                    className="hover:text-destructive text-muted-foreground"
                    title="Unpin station"
                  >
                    <X className="size-3" />
                  </Button>
                </div>

                {/* Bottom: Temp & Icon */}
                <div className="flex items-baseline justify-between mt-auto">
                  <div className="text-xl font-mono font-bold text-foreground">
                    {temp !== null ? (
                      <>
                        <NumberFlow value={temp} />°{unit}
                      </>
                    ) : (
                      "--°"
                    )}
                  </div>

                  {weather && (
                    <div className="size-6 bg-background border border-border flex items-center justify-center">
                      <WeatherIcon type={weather.condition.type} size={14} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
