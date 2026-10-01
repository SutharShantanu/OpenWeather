"use client"

import React from "react"
import NumberFlow from "@number-flow/react"
import { Sparkles, ShieldCheck } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AirQualityData, getAQIClassification } from "@/lib/weather"
import { useTranslation } from "@/components/language-provider"

interface AirQualityWidgetProps {
  airQuality?: AirQualityData
}

export function AirQualityWidget({ airQuality }: AirQualityWidgetProps) {
  const { t } = useTranslation()
  if (!airQuality) {
    return (
      <Card className="w-full">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-muted-foreground" />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {t.widgets.airQuality.title}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent
          role="status"
          className="py-6 text-center text-sm text-muted-foreground"
        >
          {t.common.dataUnavailable}
        </CardContent>
      </Card>
    )
  }
  const aqi = airQuality.aqi
  const classification = getAQIClassification(aqi)

  const pollutants = [
    { label: "PM2.5", val: airQuality.pm2_5, max: 50, unit: "µg/m³" },
    { label: "PM10", val: airQuality.pm10, max: 100, unit: "µg/m³" },
    { label: "O₃", val: airQuality.o3, max: 180, unit: "µg/m³" },
    { label: "NO₂", val: airQuality.no2, max: 200, unit: "µg/m³" },
  ]

  const getTranslatedAqiLabel = (level: number) => {
    switch (level) {
      case 1:
        return t.widgets.airQuality.good
      case 2:
        return t.widgets.airQuality.moderate
      case 3:
        return t.widgets.airQuality.sensitive
      case 4:
        return t.widgets.airQuality.unhealthy
      case 5:
        return t.widgets.airQuality.hazardous
      default:
        return classification.label
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-emerald-700 dark:text-emerald-500" />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {t.widgets.airQuality.title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t.widgets.airQuality.subtitle}
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className={`font-mono text-tiny ${classification.color}`}
        >
          AQI {aqi} — {getTranslatedAqiLabel(aqi)}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-foreground">
                <NumberFlow value={aqi} />
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                / 5 {t.widgets.airQuality.scale}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {aqi === 1
                ? t.widgets.airQuality.level1Desc
                : aqi === 2
                  ? t.widgets.airQuality.level2Desc
                  : aqi === 3
                    ? t.widgets.airQuality.level3Desc
                    : aqi === 4
                      ? t.widgets.airQuality.level4Desc
                      : t.widgets.airQuality.level5Desc}
            </p>
          </div>

          <div className="flex size-8 shrink-0 items-center justify-center border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-500">
            <ShieldCheck className="size-4" />
          </div>
        </div>

        {/* Multi-pollutant Breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {pollutants.map((p) => {
            const pct = Math.min(100, Math.round((p.val / p.max) * 100))
            return (
              <div
                key={p.label}
                className="border border-border bg-muted/20 p-2"
              >
                <div className="mb-1 flex items-center justify-between font-mono text-xs">
                  <span className="font-semibold text-foreground">
                    {p.label}
                  </span>
                  <span className="text-mini text-muted-foreground">
                    <NumberFlow
                      value={p.val}
                      format={{ maximumFractionDigits: 1 }}
                    />
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden bg-muted">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
