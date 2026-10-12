"use client"

import React from "react"
import NumberFlow from "@number-flow/react"
import { Wind, Navigation2 } from "lucide-react"
import { PhaseCard } from "@/components/widgets/phase-card"
import { Badge } from "@/components/ui/badge"
import { formatWind, getBeaufortScale, getWindDirection } from "@/lib/weather"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"

interface WindWidgetProps {
  speed: number // m/s
  deg: number // degrees
}

export function WindWidget({ speed, deg }: WindWidgetProps) {
  const { t } = useTranslation()
  const { wind, windUnit } = useDisplayPreferences()
  const primary = wind(speed)
  // Secondary readout: km/h unless that is already the primary unit, then m/s.
  const secondaryUnit = windUnit === "km/h" ? "m/s" : "km/h"
  const secondary = formatWind(speed, secondaryUnit)
  const direction = getWindDirection(deg)
  const beaufort = getBeaufortScale(speed)

  return (
    <PhaseCard
      icon={Wind}
      title={t.widgets.wind.title}
      subtitle={t.widgets.wind.subtitle}
      iconClassName="text-teal-700 dark:text-teal-500"
      badge={
        <Badge variant="outline" className="font-mono text-tiny">
          {direction} ({deg}°)
        </Badge>
      }
    >
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/* Compass Dial */}
        <div className="relative flex size-24 shrink-0 items-center justify-center border border-border bg-muted/20">
          <span className="absolute top-1 font-mono text-micro font-bold text-muted-foreground">
            N
          </span>
          <span className="absolute end-1.5 font-mono text-micro font-bold text-muted-foreground">
            E
          </span>
          <span className="absolute bottom-1 font-mono text-micro font-bold text-muted-foreground">
            S
          </span>
          <span className="absolute start-1.5 font-mono text-micro font-bold text-muted-foreground">
            W
          </span>

          <div
            className="flex items-center justify-center text-teal-700 transition-transform duration-500 ease-out dark:text-teal-500"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <Navigation2 className="size-6 fill-teal-500/20" />
          </div>
        </div>

        {/* Speed & Beaufort Readouts */}
        <div className="flex w-full flex-1 flex-col gap-2.5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-foreground">
              <NumberFlow
                value={primary.val}
                format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
              />
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {primary.unitStr}
            </span>
            <span className="text-muted-foreground/40">•</span>
            <span className="font-mono text-lg font-semibold text-foreground">
              <NumberFlow
                value={
                  secondaryUnit === "km/h"
                    ? Math.round(secondary.val)
                    : secondary.val
                }
              />
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {secondary.unitStr}
            </span>
          </div>

          <div className="border border-border bg-muted/20 p-2.5">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="text-muted-foreground">
                {t.widgets.wind.beaufortScale}
              </span>
              <span className="font-bold text-foreground">
                {t.widgets.wind.forceScale(beaufort.scale)}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-mini font-medium text-teal-700 dark:text-teal-500">
              {beaufort.scale === 0
                ? t.widgets.wind.calm
                : beaufort.scale <= 2
                  ? t.widgets.wind.lightBreeze
                  : beaufort.scale <= 4
                    ? t.widgets.wind.moderateBreeze
                    : beaufort.scale === 5
                      ? t.widgets.wind.freshBreeze
                      : beaufort.scale <= 7
                        ? t.widgets.wind.strongBreeze
                        : beaufort.scale <= 9
                          ? t.widgets.wind.gale
                          : t.widgets.wind.storm}
            </p>
          </div>
        </div>
      </div>
    </PhaseCard>
  )
}
