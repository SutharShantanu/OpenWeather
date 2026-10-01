"use client"

import React, { useState } from "react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Badge } from "@/components/ui/badge"
import { HourlyForecastItem, formatTemperature } from "@/lib/weather"
import { TrendingUp, CloudRain, Wind, Droplets, SunMedium } from "lucide-react"

const METRICS = [
  { id: "temp", icon: TrendingUp },
  { id: "precip", icon: CloudRain },
  { id: "wind", icon: Wind },
  { id: "humidity", icon: Droplets },
  { id: "uv", icon: SunMedium },
] as const
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"

interface WeatherChartsCardProps {
  hourly: HourlyForecastItem[]
  unit: "C" | "F"
}

export function WeatherChartsCard({ hourly, unit }: WeatherChartsCardProps) {
  const { t } = useTranslation()
  const prefs = useDisplayPreferences()
  const windUnitLabel = prefs.wind(0).unitStr
  const [metric, setMetric] = useState<
    "temp" | "precip" | "wind" | "humidity" | "uv"
  >("temp")

  const chartData = hourly.slice(0, 24).map((item) => ({
    time: prefs.clock(item.time),
    temp: formatTemperature(item.temp, unit),
    feelsLike: formatTemperature(item.feelsLike, unit),
    precip: Math.round(item.pop * 100),
    wind: prefs.wind(item.windSpeed).val,
    humidity: item.humidity,
    uv: item.uvIndex ?? 0,
  }))

  const metricLabel = {
    temp: t.charts.tempTab,
    precip: t.common.precip,
    wind: t.hero.wind,
    humidity: t.hero.humidity,
    uv: t.hero.uvIndex,
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col justify-between gap-2 border-b border-border pb-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-3.5 text-primary" />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {t.tabs.charts}
            </CardTitle>
            <Badge variant="outline" className="font-mono text-tiny">
              {t.charts.twentyFourHour}
            </Badge>
          </div>
          <CardDescription className="text-xs">
            {t.charts.interactiveDesc}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        {/* Metric selector: own row so it never squeezes the title; scrolls on narrow screens */}
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          value={metric}
          onValueChange={(value) => value && setMetric(value as typeof metric)}
          aria-label={t.tabs.charts}
          className="w-full [scrollbar-width:none] justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden"
        >
          {METRICS.map(({ id, icon: Icon }) => (
            <ToggleGroupItem
              key={id}
              value={id}
              className="shrink-0 gap-1 font-mono text-xs capitalize"
            >
              <Icon className="size-3" />
              {metricLabel[id]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <div className="h-56 w-full [&_.recharts-surface:focus-visible]:outline-2 [&_.recharts-surface:focus-visible]:outline-ring [&_.recharts-surface:focus:not(:focus-visible)]:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            {metric === "temp" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="chartTempGrad"
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
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  width={36}
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}°`}
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
                            {t.charts.ambient} {data.temp}°{unit}
                          </div>
                          <div className="text-muted-foreground">
                            {t.charts.apparent} {data.feelsLike}°{unit}
                          </div>
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
                  fill="url(#chartTempGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="feelsLike"
                  stroke="currentColor"
                  strokeOpacity={0.4}
                  strokeDasharray="3 3"
                  dot={false}
                  strokeWidth={1.5}
                />
              </AreaChart>
            ) : metric === "precip" ? (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  width={36}
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
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
                          <div className="font-bold text-sky-700 dark:text-sky-500">
                            {t.charts.precipProbability} {data.precip}%
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="precip" fill="var(--chart-precip)" radius={0} />
              </BarChart>
            ) : metric === "wind" ? (
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  width={36}
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}`}
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
                          <div className="font-bold text-teal-700 dark:text-teal-500">
                            {t.charts.windSpeed} {data.wind} {windUnitLabel}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="wind"
                  stroke="var(--chart-wind)"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "var(--chart-wind)" }}
                />
              </LineChart>
            ) : metric === "humidity" ? (
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient
                    id="humidityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="var(--chart-humidity)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--chart-humidity)"
                      stopOpacity={0.0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  width={36}
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${val}%`}
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
                          <div className="font-bold text-sky-700 dark:text-sky-500">
                            {t.charts.relativeHumidity} {data.humidity}%
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="humidity"
                  stroke="var(--chart-humidity)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#humidityGradient)"
                />
              </AreaChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="currentColor"
                  strokeOpacity={0.08}
                />
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  width={36}
                  stroke="currentColor"
                  className="font-mono text-tiny text-muted-foreground"
                  domain={[0, 12]}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `UV ${val}`}
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
                          <div className="font-bold text-amber-700 dark:text-amber-500">
                            {t.charts.uvRadiation} {data.uv}
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="uv" fill="var(--chart-uv)" radius={0} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
