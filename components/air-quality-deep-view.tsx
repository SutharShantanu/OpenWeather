"use client";

import React from "react";
import NumberFlow from "@number-flow/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ShieldCheck, HeartPulse, Activity, AlertCircle } from "lucide-react";
import { AirQualityData, getAQIClassification } from "@/lib/weather";

interface AirQualityDeepViewProps {
  airQuality?: AirQualityData;
}

export function AirQualityDeepView({ airQuality }: AirQualityDeepViewProps) {
  const aqi = airQuality?.aqi ?? 1;
  const classification = getAQIClassification(aqi);

  const pollutants = [
    { name: "Fine Particulate (PM2.5)", symbol: "PM2.5", val: airQuality?.pm2_5 ?? 8.4, max: 50, unit: "µg/m³", desc: "Combustion particles, organic compounds, metals" },
    { name: "Coarse Particulate (PM10)", symbol: "PM10", val: airQuality?.pm10 ?? 16.2, max: 100, unit: "µg/m³", desc: "Dust, pollen, mold spores, fly ash" },
    { name: "Tropospheric Ozone (O₃)", symbol: "O₃", val: airQuality?.o3 ?? 48.2, max: 180, unit: "µg/m³", desc: "Photochemical smog, vehicle exhaust reactions" },
    { name: "Nitrogen Dioxide (NO₂)", symbol: "NO₂", val: airQuality?.no2 ?? 12.4, max: 200, unit: "µg/m³", desc: "Thermal combustion and engine emissions" },
    { name: "Sulphur Dioxide (SO₂)", symbol: "SO₂", val: airQuality?.so2 ?? 3.1, max: 350, unit: "µg/m³", desc: "Industrial fuels, power generation byproduct" },
    { name: "Carbon Monoxide (CO)", symbol: "CO", val: airQuality?.co ?? 240.3, max: 10000, unit: "µg/m³", desc: "Incomplete fuel combustion, vehicle exhaust" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-emerald-500" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              Comprehensive Atmospheric Pollution Spectrum
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            WHO European & Global particulate concentration telemetry
          </CardDescription>
        </div>
        <Badge variant="outline" className={`font-mono text-tiny ${classification.color}`}>
          AQI {aqi} — {classification.label}
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Top Summary Box */}
        <div className="p-4 bg-muted/20 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-tiny font-mono text-muted-foreground uppercase">Air Quality Index</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-4xl font-mono font-bold text-foreground">
                <NumberFlow value={aqi} />
              </span>
              <span className="text-xs font-mono text-muted-foreground">/ 5 (Clean to Hazardous)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {classification.description}
            </p>
          </div>

          <div className="flex flex-col gap-1.5 text-xs font-mono border-t sm:border-t-0 sm:border-l border-border sm:pl-4 pt-2 sm:pt-0">
            <div className="flex items-center gap-2">
              <HeartPulse className="size-3.5 text-emerald-500" />
              <span>General Public: Minimal risk</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="size-3.5 text-sky-500" />
              <span>Outdoor Activity: Ideal conditions</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="size-3.5 text-muted-foreground" />
              <span>Sensitive Groups: Normal caution</span>
            </div>
          </div>
        </div>

        {/* 6 Pollutant Spec Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {pollutants.map((p) => {
            const pct = Math.min(100, Math.round((p.val / p.max) * 100));
            return (
              <div key={p.symbol} className="p-3 bg-muted/15 border border-border space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-heading font-semibold text-xs text-foreground">{p.symbol}</span>
                  <span className="font-mono text-xs font-bold text-foreground">
                    <NumberFlow value={p.val} format={{ maximumFractionDigits: 1 }} /> {p.unit}
                  </span>
                </div>
                <div className="w-full h-1 bg-muted overflow-hidden">
                  <div
                    className={`h-full ${
                      pct < 40 ? "bg-emerald-500" : pct < 70 ? "bg-amber-500" : "bg-destructive"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-micro font-mono text-muted-foreground">
                  <span>{p.name}</span>
                  <span>{pct}% of limit</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
