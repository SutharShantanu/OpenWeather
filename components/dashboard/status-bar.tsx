"use client"

import { RefreshCw, Radio } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/language-provider"
import {
  formatPressure,
  type PressureUnit,
  type WeatherData,
} from "@/lib/weather"

interface StatusBarProps {
  weather: WeatherData | null
  error: string | null
  loading: boolean
  onRefresh: () => void
  onChangeSource: () => void
  pressureUnit: PressureUnit
}

/** Data source, refresh and reference-pressure strip above the dashboard. */
export function StatusBar({
  weather,
  error,
  loading,
  onRefresh,
  onChangeSource,
  pressureUnit,
}: StatusBarProps) {
  const { t } = useTranslation()
  const referencePressure = formatPressure(1013.25, pressureUnit)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-2.5 font-mono text-xs text-muted-foreground">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`size-2 shrink-0 ${weather && !error ? "animate-pulse bg-emerald-500" : "bg-muted-foreground"}`}
        />
        <span className="font-semibold text-foreground uppercase">
          {t.common.stationTelemetryActive}
        </span>
        <span>•</span>
        <button
          type="button"
          onClick={onChangeSource}
          className="group inline-flex cursor-pointer items-center gap-1.5 text-start uppercase transition-colors hover:text-foreground"
          title={t.common.sourceTooltip}
        >
          <span className="text-muted-foreground group-hover:text-foreground">
            {t.common.source}:{" "}
            <strong className="text-foreground">
              {weather?.providerName ||
                (weather?.dataSource === "LIVE_API"
                  ? "Open-Meteo"
                  : t.common.simulatedSensor)}
            </strong>
            {weather?.stationName && (
              <span className="ms-1 font-semibold text-primary">
                [{weather.stationName}]
              </span>
            )}
          </span>
          <span className="border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            {t.common.change}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="xs"
          onClick={onRefresh}
          disabled={loading}
          className="gap-1.5 font-mono text-xs"
        >
          <RefreshCw
            className={`size-3 ${loading ? "animate-spin text-primary" : ""}`}
          />
          <span>{t.common.refresh}</span>
        </Button>
        <Badge variant="focus-light" className="font-mono text-tiny">
          <Radio className="size-3.5 text-primary" />
          {referencePressure.val} {referencePressure.unitStr}
        </Badge>
      </div>
    </div>
  )
}
