"use client"

import React from "react"
import NumberFlow from "@number-flow/react"
import { SunMedium, ShieldAlert, Clock, Sparkles } from "lucide-react"
import { PhaseCard } from "@/components/widgets/phase-card"
import { Badge } from "@/components/ui/badge"
import { getUvClassification } from "@/lib/weather"
import { useTranslation } from "@/components/language-provider"

interface UvWidgetProps {
  uvIndex?: number
  uvMax?: number
}

export function UvWidget({ uvIndex = 0, uvMax = 0 }: UvWidgetProps) {
  const { t } = useTranslation()
  const currentVal = Math.max(0, uvIndex)
  const maxVal = Math.max(currentVal, uvMax)
  const classification = getUvClassification(currentVal)

  // 0 to 12 scale percentage for the gauge bar
  const pct = Math.min(100, (currentVal / 12) * 100)

  // Approximate burn time in minutes based on UV
  const getBurnTime = (uv: number) => {
    if (uv < 3) return t.widgets.uv.burnTimeOver60
    if (uv < 6) return t.widgets.uv.burnTime40
    if (uv < 8) return t.widgets.uv.burnTime25
    if (uv < 11) return t.widgets.uv.burnTime15
    return t.widgets.uv.burnTimeUnder10
  }

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case "Low":
        return t.widgets.uv.low
      case "Moderate":
        return t.widgets.uv.moderate
      case "High":
        return t.widgets.uv.high
      case "Very High":
        return t.widgets.uv.veryHigh
      case "Extreme":
        return t.widgets.uv.extreme
      default:
        return risk
    }
  }

  return (
    <PhaseCard
      icon={SunMedium}
      title={t.widgets.uv.title}
      subtitle={t.widgets.uv.subtitle}
      iconClassName="text-amber-700 dark:text-amber-500"
      badge={
        <Badge
          variant="outline"
          className={`font-mono text-tiny ${classification.color}`}
        >
          {getRiskLabel(classification.risk)}
        </Badge>
      }
    >
      {/* Main UV Readout */}
      <div className="flex items-baseline justify-between">
        <div>
          <div className="font-mono text-3xl font-bold tracking-tight text-foreground">
            <NumberFlow
              value={currentVal}
              format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
            />
          </div>
          <div className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
            {t.widgets.uv.currentIntensity}
          </div>
        </div>
        <div className="text-end">
          <div className="font-mono text-base font-semibold text-foreground">
            <NumberFlow
              value={maxVal}
              format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
            />
          </div>
          <div className="font-mono text-tiny text-muted-foreground uppercase">
            {t.widgets.uv.dailyPeak}
          </div>
        </div>
      </div>

      {/* Segmented UV Spectrum Bar */}
      <div className="space-y-1.5">
        <div className="relative flex h-2 w-full overflow-hidden border border-border bg-muted">
          <div
            className="h-full w-1/4 border-e border-background/20 bg-emerald-500/80"
            title={`0-3 ${t.widgets.uv.low}`}
          />
          <div
            className="h-full w-1/4 border-e border-background/20 bg-amber-500/80"
            title={`3-6 ${t.widgets.uv.moderate}`}
          />
          <div
            className="h-full w-1/6 border-e border-background/20 bg-orange-500/80"
            title={`6-8 ${t.widgets.uv.high}`}
          />
          <div
            className="h-full w-1/4 border-e border-background/20 bg-rose-500/80"
            title={`8-11 ${t.widgets.uv.veryHigh}`}
          />
          <div
            className="h-full flex-1 bg-purple-500/80"
            title={`11+ ${t.widgets.uv.extreme}`}
          />
        </div>

        {/* Marker pointer */}
        <div className="relative h-2 w-full">
          <div
            className="absolute top-0 h-0 w-0 -translate-x-1/2 border-s-[4px] border-e-[4px] border-b-[6px] border-s-transparent border-e-transparent border-b-foreground rtl:translate-x-1/2"
            style={{ insetInlineStart: `${pct}%` }}
          />
        </div>

        <div className="flex justify-between pt-0.5 font-mono text-micro text-muted-foreground">
          <span>0 {t.widgets.uv.low}</span>
          <span>3 {t.widgets.uv.moderate}</span>
          <span>6 {t.widgets.uv.high}</span>
          <span>8 {t.widgets.uv.veryHigh}</span>
          <span>11+ {t.widgets.uv.extreme}</span>
        </div>
      </div>

      {/* Protection & Exposure Metrics */}
      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
        <div className="border border-border bg-muted/20 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-tiny text-muted-foreground">
            <Clock className="size-3 text-primary" />
            <span>{t.widgets.uv.burnTime}</span>
          </div>
          <div className="font-bold text-foreground">
            {getBurnTime(currentVal)}
          </div>
        </div>

        <div className="border border-border bg-muted/20 p-2">
          <div className="mb-1 flex items-center gap-1.5 text-tiny text-muted-foreground">
            <ShieldAlert className="size-3 text-amber-700 dark:text-amber-500" />
            <span>{t.widgets.uv.recommendedSpf}</span>
          </div>
          <div className="font-bold text-foreground">
            {currentVal < 3
              ? "SPF 15+"
              : currentVal < 8
                ? "SPF 30+"
                : "SPF 50+"}
          </div>
        </div>
      </div>

      {/* WHO Advice Box */}
      <div className="flex items-start gap-2 border border-border bg-muted/30 p-2.5 text-mini leading-relaxed text-muted-foreground">
        <Sparkles className="mt-0.5 size-3.5 shrink-0 text-primary" />
        <span>
          {currentVal < 3
            ? t.widgets.uv.lowAdvice
            : currentVal < 6
              ? t.widgets.uv.moderateAdvice
              : currentVal < 8
                ? t.widgets.uv.highAdvice
                : currentVal < 11
                  ? t.widgets.uv.veryHighAdvice
                  : t.widgets.uv.extremeAdvice}
        </span>
      </div>
    </PhaseCard>
  )
}
