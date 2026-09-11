"use client"

import React, { useState } from "react"
import {
  Sparkles,
  AlertCircle,
  CloudRain,
  Thermometer,
  Wind,
  Shirt,
  Bike,
  Car,
  ChevronRight,
  Info,
} from "lucide-react"
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
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert"
import {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
} from "@/lib/weather"
import {
  analyzeWeatherWithAi,
  AiWeatherAnalysis,
} from "@/lib/ai-weather-advisor"

interface AiAdvisorBannerProps {
  current: CurrentWeather
  hourly: HourlyForecastItem[]
  daily: DailyForecastItem[]
  unit: "C" | "F"
  onOpenDetailedAi?: () => void
}

export function AiAdvisorBanner({
  current,
  hourly,
  daily,
  unit,
  onOpenDetailedAi,
}: AiAdvisorBannerProps) {
  const analysis: AiWeatherAnalysis = analyzeWeatherWithAi(
    current,
    hourly,
    daily,
    unit
  )
  const hasSudden = analysis.suddenAlerts.length > 0

  const clothingAdvice = analysis.recommendations.find(
    (r) => r.category === "CLOTHING"
  )?.advice
  const sportsAdvice = analysis.recommendations.find(
    (r) => r.category === "OUTDOOR_SPORTS"
  )

  return (
    <Card className="w-full border-primary/40 bg-gradient-to-r from-primary/5 via-background to-background">
      <CardHeader className="flex flex-col justify-between gap-2 border-b border-border/60 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center border border-primary/30 bg-primary/10 text-primary">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="font-heading text-sm font-semibold tracking-tight">
                AI Synoptic Intelligence & Advisory
              </CardTitle>
              <Badge
                variant="outline"
                className="border-primary/30 font-mono text-tiny text-primary"
              >
                Live Insights
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Automated pattern analysis for sudden atmospheric variations &
              planned shifts
            </CardDescription>
          </div>
        </div>

        {onOpenDetailedAi && (
          <CardAction>
            <Button
              variant="outline"
              size="xs"
              onClick={onOpenDetailedAi}
              className="h-7 gap-1.5 font-mono text-xs"
            >
              <span>Full Synoptic Brief</span>
              <ChevronRight className="size-3" />
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="space-y-3 p-3 sm:p-4">
        {/* Sudden Change Warning Box if any */}
        {hasSudden ? (
          <div className="space-y-2">
            {analysis.suddenAlerts.map((alert) => (
              <Alert key={alert.id} variant="destructive" className="py-2.5">
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
                <div className="flex w-full items-center justify-between gap-2">
                  <AlertTitle className="text-xs font-bold text-destructive">
                    {alert.title}
                  </AlertTitle>
                  <Badge
                    variant="destructive"
                    className="h-4 px-1.5 py-0 font-mono text-[10px] uppercase"
                  >
                    {alert.timing}
                  </Badge>
                </div>
                <AlertDescription className="mt-1 space-y-1 text-xs text-foreground">
                  <p className="leading-relaxed">{alert.detail}</p>
                  <p className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      Action Directive:
                    </span>{" "}
                    {alert.action}
                  </p>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        ) : (
          <Alert variant="default" className="border-border bg-muted/20 py-2.5">
            <Info className="size-3.5 shrink-0 text-primary" />
            <AlertTitle className="text-xs font-semibold text-foreground">
              Micro-Climate Stability
            </AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              No sudden micro-climate disturbances detected in the 6-hour
              forecast window.
            </AlertDescription>
            <AlertAction>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 font-mono text-[10px] text-emerald-600 dark:text-emerald-400"
              >
                STABLE
              </Badge>
            </AlertAction>
          </Alert>
        )}

        {/* Practical AI Telemetry & Recommendations Grid */}
        <div className="grid grid-cols-1 gap-2 pt-1 font-mono text-xs sm:grid-cols-2 lg:grid-cols-3">
          {clothingAdvice && (
            <div className="space-y-1 border border-border bg-muted/20 p-2.5">
              <div className="flex items-center gap-1.5 text-tiny text-muted-foreground uppercase">
                <Shirt className="size-3 text-primary" />
                <span>Attire Guidance</span>
              </div>
              <p className="text-mini leading-snug text-foreground">
                {clothingAdvice}
              </p>
            </div>
          )}

          {sportsAdvice && (
            <div className="space-y-1 border border-border bg-muted/20 p-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-tiny text-muted-foreground uppercase">
                  <Bike className="size-3 text-teal-500" />
                  <span>Outdoor Activity</span>
                </div>
                <Badge
                  variant="outline"
                  className="font-mono text-micro text-teal-500"
                >
                  {sportsAdvice.score}/10
                </Badge>
              </div>
              <p className="text-mini leading-snug text-foreground">
                {sportsAdvice.advice}
              </p>
            </div>
          )}

          {analysis.plannedShifts[0] && (
            <div className="space-y-1 border border-border bg-muted/20 p-2.5 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-1.5 text-tiny text-muted-foreground uppercase">
                <Thermometer className="size-3 text-amber-500" />
                <span>Tomorrow Shift</span>
              </div>
              <p className="text-mini leading-snug text-foreground">
                <span className="font-semibold text-primary">
                  {analysis.plannedShifts[0].temperatureShift}
                </span>
                : {analysis.plannedShifts[0].summary}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
