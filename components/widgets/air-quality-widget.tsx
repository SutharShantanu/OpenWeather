"use client";

import React from "react";
import NumberFlow from "@number-flow/react";
import { Sparkles, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AirQualityData, getAQIClassification } from "@/lib/weather";

interface AirQualityWidgetProps {
  airQuality?: AirQualityData;
}

export function AirQualityWidget({ airQuality }: AirQualityWidgetProps) {
  const aqi = airQuality?.aqi ?? 1;
  const classification = getAQIClassification(aqi);

  const pollutants = [
    { label: "PM2.5", val: airQuality?.pm2_5 ?? 8, max: 50, unit: "µg/m³" },
    { label: "PM10", val: airQuality?.pm10 ?? 15, max: 100, unit: "µg/m³" },
    { label: "O₃", val: airQuality?.o3 ?? 45, max: 180, unit: "µg/m³" },
    { label: "NO₂", val: airQuality?.no2 ?? 12, max: 200, unit: "µg/m³" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-emerald-500" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              Air Quality Index (AQI)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Atmospheric particulate matter and gases
          </CardDescription>
        </div>
        <Badge variant="outline" className={`font-mono text-[10px] ${classification.color}`}>
          AQI {aqi} — {classification.label}
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-foreground">
                <NumberFlow value={aqi} />
              </span>
              <span className="text-xs font-mono text-muted-foreground">/ 5 Scale</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {classification.description}
            </p>
          </div>

          <div className="size-8 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="size-4" />
          </div>
        </div>

        {/* Multi-pollutant Breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {pollutants.map((p) => {
            const pct = Math.min(100, Math.round((p.val / p.max) * 100));
            return (
              <div key={p.label} className="p-2 bg-muted/20 border border-border">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="font-semibold text-foreground">{p.label}</span>
                  <span className="text-muted-foreground text-[11px]">
                    <NumberFlow value={p.val} format={{ maximumFractionDigits: 1 }} />
                  </span>
                </div>
                <div className="w-full h-1 bg-muted overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
