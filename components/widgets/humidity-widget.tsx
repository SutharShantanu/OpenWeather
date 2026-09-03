"use client";

import React from "react";
import NumberFlow from "@number-flow/react";
import { Droplets, ThermometerSun } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateHeatIndex, formatTemperature } from "@/lib/weather";

interface HumidityWidgetProps {
  humidity: number; // %
  tempC: number;
  unit: "C" | "F";
}

export function HumidityWidget({ humidity, tempC, unit }: HumidityWidgetProps) {
  const heatIndexC = calculateHeatIndex(tempC, humidity);
  const displayHeatIndex = formatTemperature(heatIndexC, unit);

  // Approximate dew point using Magnus-Tetens formula
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100);
  const dewPointC = (b * alpha) / (a - alpha);
  const displayDewPoint = formatTemperature(dewPointC, unit);

  const getComfortLevel = (rh: number) => {
    if (rh < 30) return { label: "Arid", color: "text-amber-500" };
    if (rh <= 60) return { label: "Optimal", color: "text-emerald-500" };
    if (rh <= 80) return { label: "Humid", color: "text-sky-500" };
    return { label: "Saturated", color: "text-indigo-500" };
  };

  const comfort = getComfortLevel(humidity);

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="size-3.5 text-sky-500" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              Humidity & Thermal Comfort
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Relative moisture content and dewpoint
          </CardDescription>
        </div>
        <Badge variant="outline" className={`font-mono text-[10px] ${comfort.color}`}>
          {comfort.label}
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 space-y-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-mono font-bold text-foreground">
              <NumberFlow value={humidity} />
            </span>
            <span className="text-sm font-mono text-muted-foreground">%</span>
          </div>

          <div className="text-right text-xs font-mono">
            <span className="text-muted-foreground">Dew Point: </span>
            <span className="font-bold text-foreground">
              <NumberFlow value={displayDewPoint} />°{unit}
            </span>
          </div>
        </div>

        {/* Square Progress Track */}
        <div className="w-full h-1.5 bg-muted relative overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, humidity))}%` }}
          />
        </div>

        {/* Heat Index Callout */}
        <div className="p-2.5 bg-muted/20 border border-border flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <ThermometerSun className="size-3.5 text-amber-500" />
            <span className="text-muted-foreground">NOAA Heat Index:</span>
          </div>
          <span className="font-bold text-foreground">
            <NumberFlow value={displayHeatIndex} />°{unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
