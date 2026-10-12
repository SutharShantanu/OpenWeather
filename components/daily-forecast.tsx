"use client"

import React, { useState } from "react"
import NumberFlow from "@number-flow/react"
import { Calendar, CloudRain, SunMedium, TrendingUp } from "lucide-react"
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { DailyForecastItem, formatTemperature } from "@/lib/weather"
import { WeatherIcon } from "@/components/weather-icon"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"

interface DailyForecastProps {
  daily: DailyForecastItem[]
  unit: "C" | "F"
  /** Rendered in the header, e.g. a tab switch shared with another card. */
  tabs?: React.ReactNode
}

export function DailyForecast({ daily, unit, tabs }: DailyForecastProps) {
  const [showChart, setShowChart] = useState(false)
  const { t, translateCondition, translateDay } = useTranslation()
  const prefs = useDisplayPreferences()
  const allMins = daily.map((d) => formatTemperature(d.tempMin, unit))
  const allMaxs = daily.map((d) => formatTemperature(d.tempMax, unit))
  const globalMin = Math.min(...allMins)
  const globalMax = Math.max(...allMaxs)
  const spreadRange = Math.max(1, globalMax - globalMin)

  const chartData = daily.map((day, idx) => ({
    day: translateDay(day.day),
    max: formatTemperature(day.tempMax, unit),
    min: formatTemperature(day.tempMin, unit),
    date: day.date ? prefs.date(day.date) : "",
    pop: Math.round(day.pop * 100),
    key: idx,
  }))

  const titleText = t.forecast.dailyTitle.includes("{n}")
    ? t.forecast.dailyTitle.replace("{n}", String(daily.length))
    : `${daily.length} ${t.forecast.dailyTitle}`

  return (
    <Card className="h-fit w-full">
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
        <div className="flex flex-wrap items-center gap-2">
          {tabs}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="gap-1.5 font-mono text-xs"
          >
            <TrendingUp className="size-3" />
            <span>{showChart ? t.forecast.cards : t.forecast.curve}</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-3">
        {showChart ? (
          <div className="h-52 w-full pt-2 [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-ring [&_.recharts-surface:focus:not(:focus-visible)]:outline-none">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="dailyMaxGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--chart-temp)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-temp)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  // Unique index: day names repeat (two Saturdays) and would merge points
                  dataKey="key"
                  tickFormatter={(i: number) => chartData[i]?.day ?? ""}
                  interval={0}
                  padding={{ left: 24, right: 24 }}
                  tickMargin={6}
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload
                    return (
                      <div className="border border-border bg-popover p-2.5 font-mono text-xs shadow-md">
                        <div className="font-semibold text-foreground">
                          {d.day}
                        </div>
                        {d.date && (
                          <div className="text-tiny text-muted-foreground">
                            {d.date}
                          </div>
                        )}
                        <div className="font-bold text-primary">
                          {d.max}°{unit}
                        </div>
                        <div className="text-tiny text-muted-foreground">
                          {d.min}°{unit}
                        </div>
                        <div className="text-tiny text-muted-foreground">
                          {t.common.precip}: {d.pop}%
                        </div>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="max"
                  stroke="var(--chart-temp)"
                  strokeWidth={2}
                  fill="url(#dailyMaxGradient)"
                />
                <Area
                  type="monotone"
                  dataKey="min"
                  stroke="var(--muted-foreground)"
                  strokeWidth={2}
                  strokeDasharray="4 3"
                  fill="none"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex scrollbar-thin gap-2 overflow-x-auto pb-2">
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
                  className="grid w-44 shrink-0 grid-rows-[auto_auto_auto_auto_1fr] gap-2.5 border border-border bg-muted/20 p-2.5 transition-colors hover:bg-muted/40"
                >
                  {/* Day + date, weather icon on the opposite side */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate font-mono text-xs font-bold text-foreground">
                        {translateDay(day.day)}
                      </span>
                      {day.date && (
                        <span className="truncate font-mono text-micro text-muted-foreground">
                          {prefs.date(day.date)}
                        </span>
                      )}
                    </div>
                    <div className="flex size-8 shrink-0 items-center justify-center border border-border bg-background">
                      <WeatherIcon type={day.conditionType} size={16} />
                    </div>
                  </div>

                  <span className="line-clamp-2 min-h-8 text-xs text-muted-foreground capitalize">
                    {translateCondition(day.description)}
                  </span>

                  {/* High and low side by side over the shared range bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-baseline justify-between font-mono">
                      <span className="text-base font-bold text-foreground">
                        <NumberFlow value={maxTemp} />°
                      </span>
                      <span className="text-xs text-muted-foreground">
                        <NumberFlow value={minTemp} />°
                      </span>
                    </div>
                    <div className="relative h-1.5 w-full overflow-hidden bg-muted">
                      <div
                        className="absolute top-0 bottom-0 bg-primary"
                        style={{
                          insetInlineStart: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Precipitation and UV pinned to the bottom edge */}
                  <div className="flex items-center justify-between gap-2 self-end border-t border-border/40 pt-2">
                    {popPercent > 10 ? (
                      <span className="flex min-w-0 items-center gap-1 font-mono text-tiny font-semibold text-sky-700 dark:text-sky-500">
                        <CloudRain className="size-2.5 shrink-0" />
                        <NumberFlow value={popPercent} />%
                        {(day.precipitationSum ?? 0) > 0 && (
                          <span className="truncate font-normal text-muted-foreground">
                            · {prefs.precipText(day.precipitationSum!)}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="font-mono text-tiny text-muted-foreground">
                        0% {t.common.precip}
                      </span>
                    )}
                    {day.uvIndexMax !== undefined && (
                      <span className="flex shrink-0 items-center gap-0.5 border border-amber-500/20 bg-amber-500/10 px-1 py-0.5 font-mono text-micro text-amber-700 dark:text-amber-500">
                        <SunMedium className="size-2.5" />
                        UV <NumberFlow value={Math.round(day.uvIndexMax)} />
                      </span>
                    )}
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
