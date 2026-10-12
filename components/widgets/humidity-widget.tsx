"use client"

import React from "react"
import NumberFlow from "@number-flow/react"
import { Droplets, ThermometerSun } from "lucide-react"
import { PhaseCard } from "@/components/widgets/phase-card"
import { Badge } from "@/components/ui/badge"
import { calculateHeatIndex, formatTemperature } from "@/lib/weather"
import { useTranslation } from "@/components/language-provider"

interface HumidityWidgetProps {
  humidity: number // %
  tempC: number
  unit: "C" | "F"
}

export function HumidityWidget({ humidity, tempC, unit }: HumidityWidgetProps) {
  const { t } = useTranslation()
  const heatIndexC = calculateHeatIndex(tempC, humidity)
  const displayHeatIndex = formatTemperature(heatIndexC, unit)

  // Approximate dew point using Magnus-Tetens formula
  const a = 17.27
  const b = 237.7
  const alpha = (a * tempC) / (b + tempC) + Math.log(humidity / 100)
  const dewPointC = (b * alpha) / (a - alpha)
  const displayDewPoint = formatTemperature(dewPointC, unit)

  const getComfortLevel = (rh: number) => {
    if (rh < 30)
      return {
        label: t.widgets.humidity.dry || "Arid",
        color: "text-amber-700 dark:text-amber-500",
      }
    if (rh <= 60)
      return {
        label: t.widgets.humidity.comfortable || "Optimal",
        color: "text-emerald-700 dark:text-emerald-500",
      }
    if (rh <= 80)
      return {
        label: t.widgets.humidity.humid || "Humid",
        color: "text-sky-700 dark:text-sky-500",
      }
    return {
      label: t.widgets.humidity.veryHumid || "Saturated",
      color: "text-indigo-700 dark:text-indigo-500",
    }
  }

  const comfort = getComfortLevel(humidity)

  return (
    <PhaseCard
      icon={Droplets}
      title={t.widgets.humidity.title}
      subtitle={t.widgets.humidity.subtitle}
      iconClassName="text-sky-700 dark:text-sky-500"
      badge={
        <Badge
          variant="outline"
          className={`font-mono text-tiny ${comfort.color}`}
        >
          {comfort.label}
        </Badge>
      }
    >
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-3xl font-bold text-foreground">
            <NumberFlow value={humidity} />
          </span>
          <span className="font-mono text-sm text-muted-foreground">%</span>
        </div>

        <div className="text-end font-mono text-xs">
          <span className="text-muted-foreground">
            {t.widgets.humidity.dewPoint}:{" "}
          </span>
          <span className="font-bold text-foreground">
            <NumberFlow value={displayDewPoint} />°{unit}
          </span>
        </div>
      </div>

      {/* Square Progress Track */}
      <div className="relative h-1.5 w-full overflow-hidden bg-muted">
        <div
          className="h-full bg-sky-500 transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, humidity))}%` }}
        />
      </div>

      {/* Heat Index Callout */}
      <div className="flex items-center justify-between border border-border bg-muted/20 p-2.5 font-mono text-xs">
        <div className="flex items-center gap-2">
          <ThermometerSun className="size-3.5 text-amber-700 dark:text-amber-500" />
          <span className="text-muted-foreground">
            {t.widgets.humidity.heatIndex}
          </span>
        </div>
        <span className="font-bold text-foreground">
          <NumberFlow value={displayHeatIndex} />°{unit}
        </span>
      </div>
    </PhaseCard>
  )
}
