"use client";

import React from "react";
import NumberFlow from "@number-flow/react";
import { Calendar, CloudRain, SunMedium, Wind } from "lucide-react";
import { DailyForecastItem, formatTemperature } from "@/lib/weather";
import { WeatherIcon } from "@/components/weather-icon";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/components/language-provider";

interface DailyForecastProps {
  daily: DailyForecastItem[];
  unit: "C" | "F";
}

export function DailyForecast({ daily, unit }: DailyForecastProps) {
  const { t, translateCondition, translateDay } = useTranslation();
  const allMins = daily.map((d) => formatTemperature(d.tempMin, unit));
  const allMaxs = daily.map((d) => formatTemperature(d.tempMax, unit));
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const spreadRange = Math.max(1, globalMax - globalMin);

  const titleText = t.forecast.dailyTitle.includes("{n}")
    ? t.forecast.dailyTitle.replace("{n}", String(daily.length))
    : `${daily.length} ${t.forecast.dailyTitle}`;

  return (
    <Card className="w-full h-full">
      <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-primary" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              {titleText}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t.forecast.dailyDesc}
          </CardDescription>
        </div>
        <Badge variant="outline" className="text-tiny font-mono">
          {t.forecast.tenDayOutlook}
        </Badge>
      </CardHeader>

      <CardContent className="pt-3 divide-y divide-border">
        {daily.map((day, idx) => {
          const minTemp = formatTemperature(day.tempMin, unit);
          const maxTemp = formatTemperature(day.tempMax, unit);
          const popPercent = Math.round(day.pop * 100);

          const leftPct = ((minTemp - globalMin) / spreadRange) * 100;
          const widthPct = Math.max(8, ((maxTemp - minTemp) / spreadRange) * 100);

          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 py-2.5 hover:bg-muted/20 transition-colors px-1"
            >
              {/* Day Name & Precip */}
              <div className="w-24 sm:w-28 flex flex-col shrink-0">
                <span className="text-xs font-mono font-bold text-foreground">
                  {translateDay(day.day)}
                </span>
                {popPercent > 10 ? (
                  <span className="flex items-center gap-1 text-tiny font-mono text-sky-500 font-semibold">
                    <CloudRain className="size-2.5" />
                    {popPercent}%
                  </span>
                ) : (
                  <span className="text-tiny font-mono text-muted-foreground">0% {t.common.precip}</span>
                )}
              </div>

              {/* Weather Icon & Label */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="size-7 bg-background border border-border flex items-center justify-center shrink-0">
                  <WeatherIcon type={day.conditionType} size={15} />
                </div>
                <span className="text-xs text-muted-foreground truncate hidden sm:inline capitalize">
                  {translateCondition(day.description)}
                </span>
                {day.uvIndexMax !== undefined && (
                  <span className="hidden md:flex items-center gap-0.5 text-micro font-mono text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1 py-0.5">
                    <SunMedium className="size-2.5" />
                    UV {Math.round(day.uvIndexMax)}
                  </span>
                )}
              </div>

              {/* Thermal Range Bar & Min/Max Temperatures */}
              <div className="flex items-center gap-3 w-40 sm:w-56 shrink-0 justify-end">
                <span className="w-7 text-right text-xs font-mono text-muted-foreground">
                  <NumberFlow value={minTemp} />°
                </span>

                <div className="flex-1 h-1.5 bg-muted relative overflow-hidden hidden sm:block">
                  <div
                    className="absolute top-0 bottom-0 bg-primary"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>

                <span className="w-7 text-left text-xs font-mono font-semibold text-foreground">
                  <NumberFlow value={maxTemp} />°
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
