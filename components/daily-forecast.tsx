"use client"

import React from "react"
import NumberFlow from "@number-flow/react"
import { Calendar, CloudRain, SunMedium } from "lucide-react"
import { DailyForecastItem, formatTemperature } from "@/lib/weather"
import { WeatherIcon } from "@/components/weather-icon"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"

interface DailyForecastProps {
  daily: DailyForecastItem[]
  unit: "C" | "F"
}

export function DailyForecast({ daily, unit }: DailyForecastProps) {
  const { t, translateCondition, translateDay } = useTranslation()
  const prefs = useDisplayPreferences()
  const allMins = daily.map((d) => formatTemperature(d.tempMin, unit))
  const allMaxs = daily.map((d) => formatTemperature(d.tempMax, unit))
  const globalMin = Math.min(...allMins)
  const globalMax = Math.max(...allMaxs)
  const spreadRange = Math.max(1, globalMax - globalMin)

  const titleText = t.forecast.dailyTitle.includes("{n}")
    ? t.forecast.dailyTitle.replace("{n}", String(daily.length))
    : `${daily.length} ${t.forecast.dailyTitle}`

  return (
    <Card className="h-full w-full">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="size-3.5 text-primary" />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {titleText}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t.forecast.dailyDesc}
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className="hidden shrink-0 font-mono text-tiny sm:inline-flex"
        >
          {t.forecast.tenDayOutlook}
        </Badge>
      </CardHeader>

      <CardContent className="divide-y divide-border pt-3">
        {daily.map((day, idx) => {
          const minTemp = formatTemperature(day.tempMin, unit)
          const maxTemp = formatTemperature(day.tempMax, unit)
          const popPercent = Math.round(day.pop * 100)

          const leftPct = ((minTemp - globalMin) / spreadRange) * 100
          const widthPct = Math.max(
            8,
            ((maxTemp - minTemp) / spreadRange) * 100
          )

          return (
            <div
              key={idx}
              className="flex items-center justify-between gap-3 px-1 py-2.5 transition-colors hover:bg-muted/20"
            >
              {/* Day Name & Precip */}
              <div className="flex w-24 shrink-0 flex-col sm:w-28">
                <span className="font-mono text-xs font-bold text-foreground">
                  {translateDay(day.day)}
                </span>
                {day.date && (
                  <span className="font-mono text-micro text-muted-foreground">
                    {prefs.date(day.date)}
                  </span>
                )}
                {popPercent > 10 ? (
                  <span className="flex items-center gap-1 font-mono text-tiny font-semibold text-sky-700 dark:text-sky-500">
                    <CloudRain className="size-2.5" />
                    {popPercent}%
                    {(day.precipitationSum ?? 0) > 0 && (
                      <span className="font-normal text-muted-foreground">
                        · {prefs.precipText(day.precipitationSum!)}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="font-mono text-tiny text-muted-foreground">
                    0% {t.common.precip}
                  </span>
                )}
              </div>

              {/* Weather Icon & Label */}
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center border border-border bg-background">
                  <WeatherIcon type={day.conditionType} size={15} />
                </div>
                <span className="hidden truncate text-xs text-muted-foreground capitalize sm:inline">
                  {translateCondition(day.description)}
                </span>
                {day.uvIndexMax !== undefined && (
                  <span className="hidden items-center gap-0.5 border border-amber-500/20 bg-amber-500/10 px-1 py-0.5 font-mono text-micro text-amber-700 md:flex dark:text-amber-500">
                    <SunMedium className="size-2.5" />
                    UV {Math.round(day.uvIndexMax)}
                  </span>
                )}
              </div>

              {/* Thermal Range Bar & Min/Max Temperatures */}
              <div className="flex w-40 shrink-0 items-center justify-end gap-3 sm:w-56">
                <span className="w-7 text-end font-mono text-xs text-muted-foreground">
                  <NumberFlow value={minTemp} />°
                </span>

                <div className="relative hidden h-1.5 flex-1 overflow-hidden bg-muted sm:block">
                  <div
                    className="absolute top-0 bottom-0 bg-primary"
                    style={{
                      insetInlineStart: `${leftPct}%`,
                      width: `${widthPct}%`,
                    }}
                  />
                </div>

                <span className="w-7 text-start font-mono text-xs font-semibold text-foreground">
                  <NumberFlow value={maxTemp} />°
                </span>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
