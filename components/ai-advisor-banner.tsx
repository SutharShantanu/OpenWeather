"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CurrentWeather, DailyForecastItem, HourlyForecastItem } from "@/lib/weather";
import { analyzeWeatherWithAi, AiWeatherAnalysis } from "@/lib/ai-weather-advisor";

interface AiAdvisorBannerProps {
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  unit: "C" | "F";
  onOpenDetailedAi?: () => void;
}

export function AiAdvisorBanner({
  current,
  hourly,
  daily,
  unit,
  onOpenDetailedAi,
}: AiAdvisorBannerProps) {
  const analysis: AiWeatherAnalysis = analyzeWeatherWithAi(current, hourly, daily, unit);
  const hasSudden = analysis.suddenAlerts.length > 0;

  const clothingAdvice = analysis.recommendations.find((r) => r.category === "CLOTHING")?.advice;
  const sportsAdvice = analysis.recommendations.find((r) => r.category === "OUTDOOR_SPORTS");

  return (
    <Card className="w-full border-primary/40 bg-gradient-to-r from-primary/5 via-background to-background">
      <CardHeader className="p-3 sm:p-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="size-8 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-heading font-semibold tracking-tight">
                AI Synoptic Intelligence & Advisory
              </CardTitle>
              <Badge variant="outline" className="text-tiny font-mono text-primary border-primary/30">
                Live Insights
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Automated pattern analysis for sudden atmospheric variations & planned shifts
            </CardDescription>
          </div>
        </div>

        {onOpenDetailedAi && (
          <CardAction>
            <Button
              variant="outline"
              size="xs"
              onClick={onOpenDetailedAi}
              className="font-mono text-xs gap-1.5 h-7"
            >
              <span>Full Synoptic Brief</span>
              <ChevronRight className="size-3" />
            </Button>
          </CardAction>
        )}
      </CardHeader>

      <CardContent className="p-3 sm:p-4 space-y-3">
        {/* Sudden Change Warning Box if any */}
        {hasSudden ? (
          <div className="space-y-2">
            {analysis.suddenAlerts.map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-destructive/10 border border-destructive/30 flex items-start gap-2.5 text-xs font-mono"
              >
                <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-destructive">{alert.title}</span>
                    <Badge variant="destructive" className="text-micro font-mono uppercase">
                      {alert.timing}
                    </Badge>
                  </div>
                  <p className="text-foreground leading-relaxed">{alert.detail}</p>
                  <p className="text-muted-foreground text-mini">
                    <span className="font-semibold text-foreground">Action Directive:</span> {alert.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-2.5 bg-muted/20 border border-border flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Info className="size-3.5 text-primary" />
              <span>No sudden micro-climate disturbances detected in the 6-hour forecast window.</span>
            </div>
            <Badge variant="outline" className="text-micro font-mono text-emerald-500 border-emerald-500/30">
              Stable
            </Badge>
          </div>
        )}

        {/* Practical AI Telemetry & Recommendations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 text-xs font-mono">
          {clothingAdvice && (
            <div className="p-2.5 bg-muted/20 border border-border space-y-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-tiny uppercase">
                <Shirt className="size-3 text-primary" />
                <span>Attire Guidance</span>
              </div>
              <p className="text-mini leading-snug text-foreground">{clothingAdvice}</p>
            </div>
          )}

          {sportsAdvice && (
            <div className="p-2.5 bg-muted/20 border border-border space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-muted-foreground text-tiny uppercase">
                  <Bike className="size-3 text-teal-500" />
                  <span>Outdoor Activity</span>
                </div>
                <Badge variant="outline" className="text-micro font-mono text-teal-500">
                  {sportsAdvice.score}/10
                </Badge>
              </div>
              <p className="text-mini leading-snug text-foreground">{sportsAdvice.advice}</p>
            </div>
          )}

          {analysis.plannedShifts[0] && (
            <div className="p-2.5 bg-muted/20 border border-border space-y-1 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-1.5 text-muted-foreground text-tiny uppercase">
                <Thermometer className="size-3 text-amber-500" />
                <span>Tomorrow Shift</span>
              </div>
              <p className="text-mini leading-snug text-foreground">
                <span className="font-semibold text-primary">{analysis.plannedShifts[0].temperatureShift}</span>:{" "}
                {analysis.plannedShifts[0].summary}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
