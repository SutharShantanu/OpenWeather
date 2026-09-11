"use client";

import React from "react";
import { SunMedium, ShieldAlert, Clock, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUvClassification } from "@/lib/weather";
import { useTranslation } from "@/components/language-provider";

interface UvWidgetProps {
  uvIndex?: number;
  uvMax?: number;
}

export function UvWidget({ uvIndex = 0, uvMax = 0 }: UvWidgetProps) {
  const { t } = useTranslation();
  const currentVal = Math.max(0, uvIndex);
  const maxVal = Math.max(currentVal, uvMax);
  const classification = getUvClassification(currentVal);

  // 0 to 12 scale percentage for the gauge bar
  const pct = Math.min(100, (currentVal / 12) * 100);

  // Approximate burn time in minutes based on UV
  const getBurnTime = (uv: number) => {
    if (uv < 3) return "> 60 mins";
    if (uv < 6) return "~ 40 mins";
    if (uv < 8) return "~ 25 mins";
    if (uv < 11) return "~ 15 mins";
    return "< 10 mins";
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-row items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <SunMedium className="size-3.5 text-amber-500" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              {t.widgets.uv.title}
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            {t.widgets.uv.subtitle}
          </CardDescription>
        </div>
        <Badge variant="outline" className={`font-mono text-tiny ${classification.color}`}>
          {classification.risk}
        </Badge>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Main UV Readout */}
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-mono font-bold tracking-tight text-foreground">
              {currentVal.toFixed(1)}
            </div>
            <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
              Current Intensity
            </div>
          </div>
          <div className="text-right">
            <div className="text-base font-mono font-semibold text-foreground">
              {maxVal.toFixed(1)}
            </div>
            <div className="text-tiny font-mono text-muted-foreground uppercase">
              Daily Peak Index
            </div>
          </div>
        </div>

        {/* Segmented UV Spectrum Bar */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-muted border border-border relative overflow-hidden flex">
            <div className="h-full w-1/4 bg-emerald-500/80 border-r border-background/20" title="0-3 Low" />
            <div className="h-full w-1/4 bg-amber-500/80 border-r border-background/20" title="3-6 Moderate" />
            <div className="h-full w-1/6 bg-orange-500/80 border-r border-background/20" title="6-8 High" />
            <div className="h-full w-1/4 bg-rose-500/80 border-r border-background/20" title="8-11 Very High" />
            <div className="h-full flex-1 bg-purple-500/80" title="11+ Extreme" />
          </div>

          {/* Marker pointer */}
          <div className="relative h-2 w-full">
            <div
              className="absolute top-0 -translate-x-1/2 w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-foreground"
              style={{ left: `${pct}%` }}
            />
          </div>

          <div className="flex justify-between text-micro font-mono text-muted-foreground pt-0.5">
            <span>0 Low</span>
            <span>3 Mod</span>
            <span>6 High</span>
            <span>8 V.High</span>
            <span>11+ Ext</span>
          </div>
        </div>

        {/* Protection & Exposure Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2 bg-muted/20 border border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground text-tiny mb-1">
              <Clock className="size-3 text-primary" />
              <span>Skin Burn Time</span>
            </div>
            <div className="font-bold text-foreground">
              {getBurnTime(currentVal)}
            </div>
          </div>

          <div className="p-2 bg-muted/20 border border-border">
            <div className="flex items-center gap-1.5 text-muted-foreground text-tiny mb-1">
              <ShieldAlert className="size-3 text-amber-500" />
              <span>Recommended SPF</span>
            </div>
            <div className="font-bold text-foreground">
              {currentVal < 3 ? "SPF 15+" : currentVal < 8 ? "SPF 30+" : "SPF 50+"}
            </div>
          </div>
        </div>

        {/* WHO Advice Box */}
        <div className="p-2.5 bg-muted/30 border border-border text-mini leading-relaxed text-muted-foreground flex items-start gap-2">
          <Sparkles className="size-3.5 text-primary shrink-0 mt-0.5" />
          <span>{classification.advice}</span>
        </div>
      </CardContent>
    </Card>
  );
}
