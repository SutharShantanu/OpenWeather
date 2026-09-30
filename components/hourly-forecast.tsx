"use client"

import React, { useState } from "react"
import NumberFlow from "@number-flow/react"
import { Clock, TrendingUp, CloudRain, Wind } from "lucide-react"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { HourlyForecastItem, formatTemperature } from "@/lib/weather"
import { WeatherIcon } from "@/components/weather-icon"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"

interface HourlyForecastProps {
  hourly: HourlyForecastItem[]
  unit: "C" | "F"
}

export function HourlyForecast({ hourly, unit }: HourlyForecastProps) {
  const { t } = useTranslation()
  const prefs = useDisplayPreferences()
  const [showChart, setShowChart] = useState(false)
  const [hoursLimit, setHoursLimit] = useState<24 | 48>(24)

  const displayedHourly = hourly.slice(0, hoursLimit)

  const chartData = displayedHourly.map((item) => ({
    time: prefs.clock(item.time),
    temp: formatTemperature(item.temp, unit),
    feelsLike: formatTemperature(item.feelsLike, unit),
    pop: Math.round(item.pop * 100),
    precip: item.precipitation ?? 0,
    humidity: item.humidity,
    wind: prefs.wind(item.windSpeed).val,
    uv: item.uvIndex ?? 0,
  }))

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col justify-between gap-2 border-b border-border pb-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-primary" />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {t.forecast.hourlyTitle}
            </CardTitle>
            <Badge variant="outline" className="font-mono text-tiny">
              {t.forecast.oneHourPrecision}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {t.forecast.hourlyDesc}
          </CardDescription>
        </div>

        <CardAction className="flex items-center gap-2">
          {hourly.length > 24 && (
            <div className="flex items-center border border-border p-0.5 font-mono text-xs">
              <Button
                variant={hoursLimit === 24 ? "default" : "ghost"}
                size="xs"
                onClick={() => setHoursLimit(24)}
                className="h-6 px-2 font-mono text-tiny"
              >
                24H
              </Button>
              <Button
                variant={hoursLimit === 48 ? "default" : "ghost"}
                size="xs"
                onClick={() => setHoursLimit(48)}
                className="h-6 px-2 font-mono text-tiny"
              >
                48H
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="h-7 gap-1.5 font-mono text-xs"
          >
            <TrendingUp className="size-3" />
            <span>{showChart ? t.forecast.cards : t.forecast.curve}</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-4">
        {showChart ? (
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--chart-temp)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-temp)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="border border-border bg-popover p-2.5 font-mono text-xs shadow-md">
                          <div className="font-semibold text-foreground">
                            {data.time}
                          </div>
                          <div className="font-bold text-primary">
                            {data.temp}°{unit}
                          </div>
                          <div className="text-tiny text-muted-foreground">
                            {t.common.feelsLike} {data.feelsLike}°{unit}
                          </div>
                          <div className="text-tiny text-muted-foreground">
                            {t.common.precip}: {data.pop}%
                            {data.precip > 0 &&
                              ` · ${prefs.precipText(data.precip)}`}
                          </div>
                          <div className="text-tiny text-muted-foreground">
                            {t.hero.humidity}: {data.humidity}%
                          </div>
                          <div className="text-tiny text-muted-foreground">
                            {t.hero.wind}: {data.wind} {prefs.wind(0).unitStr}
                          </div>
                          {data.uv > 0 && (
                            <div className="text-tiny text-amber-700 dark:text-amber-500">
                              {t.hero.uvIndex}: {data.uv}
                            </div>
                          )}
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="var(--chart-temp)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex scrollbar-thin gap-2 overflow-x-auto pb-2">
            {displayedHourly.map((item, idx) => {
              const formattedTemp = formatTemperature(item.temp, unit)
              const popPercent = Math.round(item.pop * 100)

              return (
                <div
                  key={idx}
                  className="flex min-w-[5.25rem] shrink-0 flex-col items-center justify-between gap-2 border border-border bg-muted/20 p-2.5 text-center transition-colors hover:bg-muted/40"
                >
                  <span className="font-mono text-tiny font-medium text-muted-foreground">
                    {prefs.clock(item.time)}
                  </span>

                  <div className="flex size-7 items-center justify-center border border-border bg-background">
                    <WeatherIcon type={item.conditionType} size={15} />
                  </div>

                  <span className="font-mono text-sm font-bold text-foreground">
                    <NumberFlow value={formattedTemp} />°
                  </span>

                  {popPercent > 10 ? (
                    <div className="flex flex-wrap items-center justify-center gap-x-0.5 font-mono text-tiny font-semibold text-sky-700 dark:text-sky-500">
                      <CloudRain className="size-2.5" />
                      <span>{popPercent}%</span>
                      {(item.precipitation ?? 0) > 0 && (
                        <span className="font-normal text-muted-foreground">
                          {prefs.precipText(item.precipitation!)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="font-mono text-tiny text-muted-foreground/60">
                      0%
                    </span>
                  )}

                  <div className="flex w-full items-center justify-center gap-1 border-t border-border/40 pt-1 font-mono text-micro text-muted-foreground">
                    <Wind className="size-2.5 text-muted-foreground" />
                    <span>
                      {Math.round(prefs.wind(item.windSpeed).val)}
                      {prefs.wind(0).unitStr}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
