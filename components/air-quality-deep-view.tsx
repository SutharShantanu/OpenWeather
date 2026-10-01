"use client"

import React from "react"
import NumberFlow from "@number-flow/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, HeartPulse, Activity, AlertCircle } from "lucide-react"
import { AirQualityData, getAQIClassification } from "@/lib/weather"
import { useTranslation } from "@/components/language-provider"

interface AirQualityDeepViewProps {
  airQuality?: AirQualityData
}

export function AirQualityDeepView({ airQuality }: AirQualityDeepViewProps) {
  const { t } = useTranslation()
  const aq = t.airQualityDeep
  if (!airQuality) {
    return (
      <Card className="w-full">
        <CardHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-muted-foreground" />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {t.tabs.airQuality}
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
    {
      name: aq.pm25,
      symbol: "PM2.5",
      val: airQuality.pm2_5,
      max: 50,
      unit: "µg/m³",
      desc: "Combustion particles, organic compounds, metals",
    },
    {
      name: aq.pm10,
      symbol: "PM10",
      val: airQuality.pm10,
      max: 100,
      unit: "µg/m³",
      desc: "Dust, pollen, mold spores, fly ash",
    },
    {
      name: aq.o3,
      symbol: "O₃",
      val: airQuality.o3,
      max: 180,
      unit: "µg/m³",
      desc: "Photochemical smog, vehicle exhaust reactions",
    },
    {
      name: aq.no2,
      symbol: "NO₂",
      val: airQuality.no2,
      max: 200,
      unit: "µg/m³",
      desc: "Thermal combustion and engine emissions",
    },
    {
      name: aq.so2,
      symbol: "SO₂",
      val: airQuality.so2,
      max: 350,
      unit: "µg/m³",
      desc: "Industrial fuels, power generation byproduct",
    },
    {
      name: aq.co,
      symbol: "CO",
      val: airQuality.co,
      max: 10000,
      unit: "µg/m³",
      desc: "Incomplete fuel combustion, vehicle exhaust",
    },
  ]

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-emerald-700 dark:text-emerald-500" />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {t.tabs.airQuality}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {aq.whoSubtitle}
          </CardDescription>
        </div>
        <Badge
          variant="outline"
          className={`font-mono text-tiny ${classification.color}`}
        >
          AQI {aqi} — {classification.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        {/* Top Summary Box */}
        <div className="flex flex-col justify-between gap-4 border border-border bg-muted/20 p-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-mono text-tiny text-muted-foreground uppercase">
              {aq.aqiTitle}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="font-mono text-4xl font-bold text-foreground">
                <NumberFlow value={aqi} />
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {aq.scaleDesc}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {classification.description}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-border pt-2 font-mono text-xs sm:border-s sm:border-t-0 sm:ps-4 sm:pt-0">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-3.5 text-emerald-700 dark:text-emerald-500" />
              <span>{aq.generalPublic}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="size-3.5 text-sky-700 dark:text-sky-500" />
              <span>{aq.outdoorActivity}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-3.5 text-muted-foreground" />
              <span>{aq.sensitiveGroups}</span>
            </div>
          </div>
        </div>

        {/* 6 Pollutant Spec Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {pollutants.map((p) => {
            const pct = Math.min(100, Math.round((p.val / p.max) * 100))
            return (
              <div
                key={p.symbol}
                className="space-y-1.5 border border-border bg-muted/15 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-heading text-xs font-semibold text-foreground">
                    {p.symbol}
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    <NumberFlow
                      value={p.val}
                      format={{ maximumFractionDigits: 1 }}
                    />{" "}
                    {p.unit}
                  </span>
                </div>
                <div className="h-1 w-full overflow-hidden bg-muted">
                  <div
                    className={`h-full ${
                      pct < 40
                        ? "bg-emerald-500"
                        : pct < 70
                          ? "bg-amber-500"
                          : "bg-destructive"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between font-mono text-micro text-muted-foreground">
                  <span>{p.name}</span>
                  <span>{aq.percentOfLimit(pct)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
