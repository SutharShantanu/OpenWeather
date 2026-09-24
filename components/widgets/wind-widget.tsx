"use client";

import React from "react";
import NumberFlow from "@number-flow/react";
import { Wind, Navigation2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatWind, getBeaufortScale, getWindDirection } from "@/lib/weather";
import { useTranslation } from "@/components/language-provider";
import { useDisplayPreferences } from "@/components/display-preferences-provider";

interface WindWidgetProps {
  speed: number; // m/s
  deg: number; // degrees
}

export function WindWidget({ speed, deg }: WindWidgetProps) {
  const { t } = useTranslation();
  const { wind, windUnit } = useDisplayPreferences();
  const primary = wind(speed);
  // Secondary readout: km/h unless that is already the primary unit, then m/s.
  const secondaryUnit = windUnit === "km/h" ? "m/s" : "km/h";
  const secondary = formatWind(speed, secondaryUnit);
  const direction = getWindDirection(deg);
  const beaufort = getBeaufortScale(speed);

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wind className="size-3.5 text-teal-500" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              {t.widgets.wind.title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t.widgets.wind.subtitle}
          </CardDescription>
        </div>
        <Badge variant="outline" className="font-mono text-tiny">
          {direction} ({deg}°)
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Compass Dial */}
        <div className="relative size-24 border border-border bg-muted/20 flex items-center justify-center shrink-0">
          <span className="absolute top-1 font-mono text-micro font-bold text-muted-foreground">N</span>
          <span className="absolute right-1.5 font-mono text-micro font-bold text-muted-foreground">E</span>
          <span className="absolute bottom-1 font-mono text-micro font-bold text-muted-foreground">S</span>
          <span className="absolute left-1.5 font-mono text-micro font-bold text-muted-foreground">W</span>

          <div
            className="transition-transform duration-500 ease-out flex items-center justify-center text-teal-500"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <Navigation2 className="size-6 fill-teal-500/20" />
          </div>
        </div>

        {/* Speed & Beaufort Readouts */}
        <div className="flex-1 flex flex-col gap-2.5 w-full">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-foreground">
              <NumberFlow value={primary.val} format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }} />
            </span>
            <span className="text-xs font-mono text-muted-foreground">{primary.unitStr}</span>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-lg font-mono font-semibold text-foreground">
              <NumberFlow value={secondaryUnit === "km/h" ? Math.round(secondary.val) : secondary.val} />
            </span>
            <span className="text-xs font-mono text-muted-foreground">{secondary.unitStr}</span>
          </div>

          <div className="p-2.5 bg-muted/20 border border-border">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-muted-foreground">Beaufort Scale:</span>
              <span className="font-bold text-foreground">Force {beaufort.scale}</span>
            </div>
            <p className="text-mini font-mono text-teal-500 font-medium mt-0.5">
              {beaufort.label}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
