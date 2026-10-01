"use client"

import React, { useState, useEffect } from "react"
import NumberFlow from "@number-flow/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRightLeft,
  Navigation,
  Droplets,
  Wind,
  Gauge,
  Sparkles,
  CloudSun,
} from "lucide-react"
import { CurrentWeather, formatTemperature } from "@/lib/weather"
import { WeatherIcon } from "@/components/weather-icon"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"
import { CONFIG } from "@/lib/config"

interface InlineComparisonMatrixProps {
  baseCurrent: CurrentWeather
  unit: "C" | "F"
  onSwitchCity: (cityName: string) => void
}

const POPULAR_TARGETS = CONFIG.location.popularCities

export function InlineComparisonMatrix({
  baseCurrent,
  unit,
  onSwitchCity,
}: InlineComparisonMatrixProps) {
  const { t, language, translateCondition } = useTranslation()
  const prefs = useDisplayPreferences()
  const initialTarget =
    POPULAR_TARGETS.find(
      (c) => c.toLowerCase() !== baseCurrent.cityName.toLowerCase()
    ) ||
    POPULAR_TARGETS[0] ||
    "Tokyo"
  const [targetCity, setTargetCity] = useState(initialTarget)
  const [targetWeather, setTargetWeather] = useState<CurrentWeather | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [prevTarget, setPrevTarget] = useState({
    city: initialTarget,
    lang: language,
  })

  if (prevTarget.city !== targetCity || prevTarget.lang !== language) {
    setPrevTarget({ city: targetCity, lang: language })
    setLoading(true)
  }

  useEffect(() => {
    let isMounted = true

    fetch(
      `/api/weather?city=${encodeURIComponent(targetCity)}&lang=${encodeURIComponent(language || "en")}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.current) {
          setTargetWeather(data.current)
        }
      })
      .catch((err) => console.warn("Failed to fetch target telemetry", err))
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [targetCity, language])

  const baseTemp = formatTemperature(baseCurrent.temp, unit)
  const targetTemp = targetWeather
    ? formatTemperature(targetWeather.temp, unit)
    : 0
  const tempDiff = targetTemp - baseTemp

  const humidityDiff = targetWeather
    ? targetWeather.humidity - baseCurrent.humidity
    : 0
  const baseWind = prefs.wind(baseCurrent.windSpeed)
  const targetWind = targetWeather
    ? prefs.wind(targetWeather.windSpeed)
    : baseWind
  const windDiff = targetWeather ? targetWind.val - baseWind.val : 0
  const basePressure = prefs.pressure(baseCurrent.pressure)
  const targetPressure = targetWeather
    ? prefs.pressure(targetWeather.pressure)
    : basePressure
  const pressureDiff = targetWeather ? targetPressure.val - basePressure.val : 0
  const pressureDecimals = basePressure.unitStr === "inHg" ? 2 : 1

  const renderDelta = (
    delta: number,
    suffix: string,
    invertGood = false,
    decimals = 1
  ) => {
    const isZero = Math.abs(delta) < Math.pow(10, -decimals)
    if (isZero) {
      return (
        <span className="font-mono text-xs text-muted-foreground">
          0{suffix}
        </span>
      )
    }
    const isPositive = delta > 0
    const isGood = invertGood ? !isPositive : isPositive

    return (
      <span
        className={`border px-1.5 py-0.5 font-mono text-xs font-semibold ${
          isGood
            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-500"
            : "border-destructive/20 bg-destructive/10 text-destructive"
        }`}
      >
        {isPositive ? "+" : ""}
        {delta.toFixed(decimals)}
        {suffix}
      </span>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="size-3.5 text-primary" />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {t.tabs.compare}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t.compare.desc}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* City chips: own scroll row so the title keeps its width */}
        <div className="flex [scrollbar-width:none] gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          {POPULAR_TARGETS.filter(
            (c) => c.toLowerCase() !== baseCurrent.cityName.toLowerCase()
          ).map((c) => (
            <Button
              key={c}
              variant={
                targetCity.toLowerCase() === c.toLowerCase()
                  ? "default"
                  : "outline"
              }
              aria-pressed={targetCity.toLowerCase() === c.toLowerCase()}
              size="xs"
              onClick={() => setTargetCity(c)}
              className="shrink-0 font-mono text-xs"
            >
              {c}
            </Button>
          ))}
        </div>
        {/* Dual Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* Base Station */}
          <div className="flex flex-col justify-between border border-border bg-muted/20 p-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-tiny">
                  {t.compare.primaryStation}
                </Badge>
                <span className="font-mono text-tiny text-muted-foreground">
                  {t.compare.active}
                </span>
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground">
                {baseCurrent.cityName}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {translateCondition(baseCurrent.condition.description)}
              </p>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-mono text-3xl font-bold text-foreground">
                <NumberFlow value={baseTemp} />°{unit}
              </span>
              <WeatherIcon type={baseCurrent.condition.type} size={22} />
            </div>
          </div>

          {/* Target Station */}
          <div className="flex flex-col justify-between border border-border bg-muted/20 p-3">
            <div>
              <div className="mb-1 flex items-center justify-between">
                <Badge variant="secondary" className="font-mono text-tiny">
                  {t.compare.targetStation}
                </Badge>
                {renderDelta(tempDiff, `°${unit}`)}
              </div>
              <h3 className="font-heading text-base font-semibold text-foreground">
                {targetWeather?.cityName || targetCity}
              </h3>
              <p className="text-xs text-muted-foreground capitalize">
                {loading
                  ? t.compare.syncingTelemetry
                  : targetWeather?.condition.description
                    ? translateCondition(targetWeather.condition.description)
                    : t.compare.connected}
              </p>
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <span className="font-mono text-3xl font-bold text-foreground">
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
                  className="gap-1 font-mono text-xs text-primary"
                >
                  <Navigation className="size-2.5" />
                  <span>{t.compare.switchDashboard}</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Delta table */}
        {targetWeather && (
          <div className="overflow-x-auto border border-border">
            <table className="w-full font-mono text-xs">
              <thead className="bg-muted/40 text-tiny text-muted-foreground">
                <tr className="border-b border-border">
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-start font-semibold uppercase"
                  >
                    {t.compare.atmosphericMetric}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-center font-semibold uppercase"
                  >
                    {baseCurrent.cityName}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-center font-semibold uppercase"
                  >
                    {targetWeather.cityName}
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-1.5 text-end font-semibold uppercase"
                  >
                    {t.compare.spreadDelta}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  {
                    icon: CloudSun,
                    iconClass: "text-amber-700 dark:text-amber-500",
                    label: t.compare.temperature,
                    base: `${baseTemp}°${unit}`,
                    target: `${targetTemp}°${unit}`,
                    delta: renderDelta(tempDiff, `°${unit}`),
                  },
                  {
                    icon: Droplets,
                    iconClass: "text-sky-700 dark:text-sky-500",
                    label: t.compare.humidity,
                    base: `${baseCurrent.humidity}%`,
                    target: `${targetWeather.humidity}%`,
                    delta: renderDelta(humidityDiff, "%"),
                  },
                  {
                    icon: Wind,
                    iconClass: "text-teal-700 dark:text-teal-500",
                    label: t.compare.windVelocity,
                    base: `${baseWind.val.toFixed(1)} ${baseWind.unitStr}`,
                    target: `${targetWind.val.toFixed(1)} ${targetWind.unitStr}`,
                    delta: renderDelta(windDiff, ` ${baseWind.unitStr}`),
                  },
                  {
                    icon: Gauge,
                    iconClass: "text-amber-700 dark:text-amber-500",
                    label: t.compare.pressure,
                    base: `${basePressure.val} ${basePressure.unitStr}`,
                    target: `${targetPressure.val} ${targetPressure.unitStr}`,
                    delta: renderDelta(
                      pressureDiff,
                      ` ${basePressure.unitStr}`,
                      false,
                      pressureDecimals
                    ),
                  },
                  {
                    icon: Sparkles,
                    iconClass: "text-emerald-700 dark:text-emerald-500",
                    label: t.compare.airQuality,
                    base: baseCurrent.airQuality
                      ? `AQI ${baseCurrent.airQuality.aqi}`
                      : "—",
                    target: targetWeather.airQuality
                      ? `AQI ${targetWeather.airQuality.aqi}`
                      : "—",
                    delta:
                      baseCurrent.airQuality && targetWeather.airQuality
                        ? renderDelta(
                            targetWeather.airQuality.aqi -
                              baseCurrent.airQuality.aqi,
                            "",
                            true
                          )
                        : "—",
                  },
                ].map(
                  ({ icon: Icon, iconClass, label, base, target, delta }) => (
                    <tr key={label}>
                      <th
                        scope="row"
                        className="px-3 py-2 text-start font-normal"
                      >
                        <span className="flex items-center gap-1.5">
                          <Icon className={`size-3 shrink-0 ${iconClass}`} />
                          {label}
                        </span>
                      </th>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {base}
                      </td>
                      <td className="px-3 py-2 text-center whitespace-nowrap">
                        {target}
                      </td>
                      <td className="px-3 py-2 text-end whitespace-nowrap">
                        {delta}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
