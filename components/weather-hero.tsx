"use client"

import React from "react"
import NumberFlow from "@number-flow/react"
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
  Share2,
  Check,
} from "lucide-react"
import {
  CurrentWeather,
  formatTemperature,
  getUvClassification,
} from "@/lib/weather"
import { WeatherIcon } from "@/components/weather-icon"
import { WeatherAtmosphere } from "@/components/weather-atmosphere"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"

interface WeatherHeroProps {
  current: CurrentWeather
  unit: "C" | "F"
  isPinned: boolean
  onTogglePin: () => void
}

export function WeatherHero({
  current,
  unit,
  isPinned,
  onTogglePin,
}: WeatherHeroProps) {
  const { t, translateCondition } = useTranslation()
  const prefs = useDisplayPreferences()
  const wind = prefs.wind(current.windSpeed)
  const pressure = prefs.pressure(current.pressure)
  const displayTemp = formatTemperature(current.temp, unit)
  const displayFeelsLike = formatTemperature(current.feelsLike, unit)
  const displayMin = formatTemperature(current.tempMin, unit)
  const displayMax = formatTemperature(current.tempMax, unit)
  const displayDewPoint =
    current.dewPoint !== undefined
      ? formatTemperature(current.dewPoint, unit)
      : null
  const uvClass =
    current.uvIndex !== undefined ? getUvClassification(current.uvIndex) : null

  const [copied, setCopied] = React.useState(false)

  const handleShare = () => {
    if (typeof window === "undefined") return
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const localTime = prefs.time(current.dt)

  return (
    <Card className="relative w-full overflow-hidden">
      {/* Real-time Weather Atmosphere Animation Layer (Only for this card) */}
      <WeatherAtmosphere
        condition={current.condition.type}
        isNight={current.condition.icon?.includes("n")}
        windSpeed={current.windSpeed}
      />
      <CardHeader className="relative z-10 border-b border-border pb-4 backdrop-blur-[0.5px]">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1 font-mono text-tiny">
              <MapPin className="size-2.5 text-primary" />
              <span>{prefs.coords(current.lat, current.lon)}</span>
            </Badge>
            <Badge variant="secondary" className="font-mono text-tiny">
              {current.country || t.common.stationTelemetry}
            </Badge>
            {uvClass && current.uvIndex !== undefined && (
              <Badge
                variant="outline"
                className={`font-mono text-tiny ${uvClass.color}`}
              >
                UV {current.uvIndex} •{" "}
                {current.uvIndex < 3
                  ? t.widgets.uv.low
                  : current.uvIndex < 6
                    ? t.widgets.uv.moderate
                    : current.uvIndex < 8
                      ? t.widgets.uv.high
                      : current.uvIndex < 11
                        ? t.widgets.uv.veryHigh
                        : t.widgets.uv.extreme}
              </Badge>
            )}
            <span className="hidden font-mono text-tiny text-muted-foreground sm:inline">
              {t.common.synopticTime}: {localTime}
            </span>
          </div>

          <CardTitle
            aria-level={1}
            className="font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-4xl"
          >
            {current.cityName}
          </CardTitle>

          <CardDescription className="flex items-center gap-1.5 capitalize">
            <span>{translateCondition(current.condition.description)}</span>
            <span>•</span>
            <span>
              {t.common.feelsLike}{" "}
              <span className="font-mono font-semibold text-foreground">
                <NumberFlow value={displayFeelsLike} />°{unit}
              </span>
            </span>
          </CardDescription>
        </div>

        <CardAction className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="gap-1.5 font-mono text-xs"
            title={t.common.shareStation}
            aria-label={t.common.shareStation}
          >
            {copied ? (
              <>
                <Check className="size-3.5 text-emerald-700 dark:text-emerald-500" />
                <span className="hidden text-emerald-700 sm:inline dark:text-emerald-500">
                  {t.common.copied}
                </span>
              </>
            ) : (
              <>
                <Share2 className="size-3.5 text-muted-foreground" />
                <span className="hidden uppercase sm:inline">
                  {t.common.shareStation}
                </span>
              </>
            )}
          </Button>
          <Button
            variant={isPinned ? "secondary" : "outline"}
            size="sm"
            onClick={onTogglePin}
            aria-label={isPinned ? t.common.saved : t.common.save}
            aria-pressed={isPinned}
            className="gap-1.5 font-mono text-xs"
          >
            {isPinned ? (
              <BookmarkCheck className="size-3.5 text-primary" />
            ) : (
              <Bookmark className="size-3.5" />
            )}
            <span className="hidden uppercase sm:inline">
              {isPinned ? t.common.saved : t.common.save}
            </span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6 pt-4">
        {/* Main Temperature & Icon Presentation */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-6xl font-bold tracking-tight text-foreground sm:text-7xl">
              <NumberFlow value={displayTemp} />
            </span>
            <span className="font-mono text-3xl font-light text-muted-foreground">
              °{unit}
            </span>
          </div>

          <div className="flex items-center gap-4 sm:justify-end">
            <div className="flex items-center justify-center border border-border bg-muted/40 p-3">
              <WeatherIcon type={current.condition.type} size={36} />
            </div>

            <div className="flex flex-col gap-1 font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <ArrowDown className="size-3 text-sky-700 dark:text-sky-500" />
                <span>{t.hero.min}: </span>
                <span className="font-semibold text-foreground">
                  <NumberFlow value={displayMin} />°{unit}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowUp className="size-3 text-amber-700 dark:text-amber-500" />
                <span>{t.hero.max}: </span>
                <span className="font-semibold text-foreground">
                  <NumberFlow value={displayMax} />°{unit}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Primary Telemetry Metric Cells */}
        <div className="grid grid-cols-2 gap-2 pt-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 border border-border bg-muted/30 p-3">
            <div className="flex size-7 shrink-0 items-center justify-center border border-border bg-background text-sky-700 dark:text-sky-500">
              <Droplets className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-tiny text-muted-foreground uppercase">
                {t.hero.humidity}
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                <NumberFlow value={current.humidity} />%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border border-border bg-muted/30 p-3">
            <div className="flex size-7 shrink-0 items-center justify-center border border-border bg-background text-teal-700 dark:text-teal-500">
              <Wind className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-tiny text-muted-foreground uppercase">
                {t.hero.wind}
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                <NumberFlow
                  value={wind.val}
                  format={{
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  }}
                />{" "}
                {wind.unitStr}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border border-border bg-muted/30 p-3">
            <div className="flex size-7 shrink-0 items-center justify-center border border-border bg-background text-amber-700 dark:text-amber-500">
              <Gauge className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-tiny text-muted-foreground uppercase">
                {t.hero.barometer}
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                <NumberFlow
                  value={pressure.val}
                  format={
                    pressure.unitStr === "inHg"
                      ? { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                      : undefined
                  }
                />{" "}
                {pressure.unitStr}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 border border-border bg-muted/30 p-3">
            <div className="flex size-7 shrink-0 items-center justify-center border border-border bg-background text-indigo-700 dark:text-indigo-500">
              <Eye className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-tiny text-muted-foreground uppercase">
                {t.hero.visibility}
              </span>
              <span className="font-mono text-sm font-semibold text-foreground">
                <NumberFlow value={Math.round(current.visibility / 1000)} /> km
              </span>
            </div>
          </div>
        </div>

        {/* Secondary MSN Weather Telemetry Row (UV, Dew Point, Cloud Cover, Gusts) */}
        <div className="grid grid-cols-2 gap-2 font-mono text-xs lg:grid-cols-4">
          {current.uvIndex !== undefined && (
            <div className="flex items-center justify-between border border-border bg-muted/20 p-2.5">
              <div className="flex items-center gap-1.5 text-tiny text-muted-foreground">
                <SunMedium className="size-3 text-amber-700 dark:text-amber-500" />
                <span className="uppercase">{t.hero.uvIndex}</span>
              </div>
              <span className="font-bold text-foreground">
                {current.uvIndex.toFixed(1)}
              </span>
            </div>
          )}

          {displayDewPoint !== null && (
            <div className="flex items-center justify-between border border-border bg-muted/20 p-2.5">
              <div className="flex items-center gap-1.5 text-tiny text-muted-foreground">
                <Thermometer className="size-3 text-sky-700 dark:text-sky-500" />
                <span className="uppercase">{t.hero.dewPoint}</span>
              </div>
              <span className="font-bold text-foreground">
                {displayDewPoint}°{unit}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between border border-border bg-muted/20 p-2.5">
            <div className="flex items-center gap-1.5 text-tiny text-muted-foreground">
              <Cloud className="size-3 text-muted-foreground" />
              <span className="uppercase">{t.hero.clouds}</span>
            </div>
            <span className="font-bold text-foreground">{current.clouds}%</span>
          </div>

          {current.windGusts !== undefined && (
            <div className="flex items-center justify-between border border-border bg-muted/20 p-2.5">
              <div className="flex items-center gap-1.5 text-tiny text-muted-foreground">
                <Wind className="size-3 text-teal-700 dark:text-teal-500" />
                <span className="uppercase">{t.widgets.wind.gusts}</span>
              </div>
              <span className="font-bold text-foreground">
                {prefs.windText(current.windGusts)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
