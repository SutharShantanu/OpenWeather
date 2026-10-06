"use client"

import React, { useState } from "react"
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
  Accordion,
  AccordionItem,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertAction,
} from "@/components/ui/alert"
import {
  AlertTriangle,
  ShieldCheck,
  Clock,
  Building2,
  ChevronUp,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { CurrentWeather, WeatherAlert } from "@/lib/weather"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"

interface InlineAlertBannerProps {
  current: CurrentWeather
  alerts?: WeatherAlert[]
}

export function InlineAlertBanner({
  current,
  alerts: propAlerts,
}: InlineAlertBannerProps) {
  const { t } = useTranslation()
  const prefs = useDisplayPreferences()
  const [isExpanded, setIsExpanded] = useState(false)
  const [checkedProtocols, setCheckedProtocols] = useState<
    Record<string, boolean>
  >({})

  // Use alerts from props if provided, or derive from current telemetry
  const activeAlerts: WeatherAlert[] =
    propAlerts && propAlerts.length > 0 ? propAlerts : []

  // Fallback heuristic if none in props
  if (activeAlerts.length === 0) {
    const cond = current.condition.description.toLowerCase()
    if (cond.includes("storm") || cond.includes("thunder")) {
      activeAlerts.push({
        id: "storm",
        source: "Doppler Severe Weather Radar",
        event: "Severe Thunderstorm Watch",
        headline:
          "Atmospheric instability and localized electrical discharge detected in radar vector.",
        severity: "Severe",
        instruction:
          "Seek shelter indoors. Avoid elevated structures and disconnect sensitive equipment.",
      })
    }
    if (current.temp >= 35) {
      activeAlerts.push({
        id: "heat",
        source: "WMO Global Alert System",
        event: "Excessive Heat Advisory",
        headline: `Ambient temperature has exceeded 35°C (Observed: ${current.temp.toFixed(1)}°C).`,
        severity: "Severe",
        instruction:
          "Hydrate frequently, avoid direct midday sun exposure, limit strenuous outdoor activities.",
      })
    } else if (current.temp <= 0) {
      activeAlerts.push({
        id: "freeze",
        source: "Synoptic Warning Bureau",
        event: "Sub-Zero Freeze Hazard",
        headline: `Temperature at ${current.temp.toFixed(1)}°C. Black ice formation possible on transit routes.`,
        severity: "Moderate",
        instruction:
          "Exercise caution while driving; protect exposed plumbing and warm shelters.",
      })
    }
    if (current.windSpeed >= 13.9) {
      activeAlerts.push({
        id: "wind",
        source: "Marine & Terrestrial Wind Service",
        event: "High Wind Velocity Warning",
        headline: `Sustained wind velocities exceeding ${prefs.windText(current.windSpeed)}.`,
        severity: "Moderate",
        instruction:
          "Secure loose exterior items, inspect balcony furniture, watch for falling tree branches.",
      })
    }
  }

  const hasCritical = activeAlerts.some(
    (a) => a.severity === "Extreme" || a.severity === "Severe"
  )

  const toggleProtocol = (id: string) => {
    setCheckedProtocols((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  if (activeAlerts.length === 0) {
    return (
      <Alert
        variant="default"
        className="border-border bg-card py-2.5 shadow-2xs"
      >
        <ShieldCheck className="size-4 text-success-foreground dark:text-success" />
        <AlertTitle className="text-xs font-semibold tracking-tight">
          {t.common.advisorySystem}
        </AlertTitle>
        <AlertDescription className="text-xs text-muted-foreground">
          {t.common.noActiveAlerts}
        </AlertDescription>
        <AlertAction>
          <Badge variant="success-light" className="font-mono text-tiny">
            {t.alerts.nominal}
          </Badge>
        </AlertAction>
      </Alert>
    )
  }

  return (
    <Card
      className={`w-full gap-0 border-s-4 py-0 ${hasCritical ? "border-border border-s-destructive" : "border-border border-s-warning"}`}
    >
      <CardHeader className="flex flex-col justify-between gap-2 p-3 sm:flex-row sm:items-center sm:p-4">
        <div className="flex items-center gap-2.5">
          <div
            className={`shrink-0 border border-border p-1.5 ${hasCritical ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning-foreground dark:text-warning"}`}
          >
            <AlertTriangle className="size-4" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <CardTitle className="font-heading text-sm font-semibold tracking-tight">
                {t.alerts.bulletinTitle}
              </CardTitle>
              <Badge
                variant={hasCritical ? "destructive" : "outline"}
                className="font-mono text-tiny"
              >
                {t.alerts.activeAlerts(activeAlerts.length)}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              {t.alerts.bulletinDesc(current.cityName)}
            </CardDescription>
          </div>
        </div>

        <CardAction className="flex items-center gap-1.5">
          <Button
            variant="accent"
            size="icon-xs"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
          >
            {/* <span>{isExpanded ? t.alerts.collapse : t.alerts.expand}</span> */}
            <ChevronUp
              className={`size-3 transition-all duration-200 ease-in-out ${isExpanded ? "rotate-180" : "rotate-0"}`}
            />
          </Button>
        </CardAction>
      </CardHeader>

      <Accordion
        type="single"
        collapsible
        value={isExpanded ? "directives" : ""}
        onValueChange={(val) => setIsExpanded(val === "directives")}
        className="w-full"
      >
        <AccordionItem value="directives" className="border-none">
          <AccordionContent className="h-auto p-0">
            <CardContent className="space-y-3 divide-y divide-border/60 border-t border-border p-3 sm:p-4">
              {activeAlerts.map((alert) => {
                const isChecked = checkedProtocols[alert.id] || false
                return (
                  <div key={alert.id} className="space-y-2 pt-3 first:pt-0">
                    <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-center">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-foreground">
                          {alert.event}
                        </span>
                        <Badge
                          variant={
                            alert.severity === "Extreme" ||
                            alert.severity === "Severe"
                              ? "destructive"
                              : "outline"
                          }
                          className="font-mono text-micro uppercase"
                        >
                          {alert.severity}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 font-mono text-tiny text-muted-foreground">
                        <Building2 className="size-2.5 text-primary" />
                        <span>{alert.source}</span>
                        {alert.expires && (
                          <>
                            <span>•</span>
                            <Clock className="size-2.5" />
                            <span>
                              {t.alerts.expires} {alert.expires}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {alert.headline}
                    </p>

                    {/* Safety Protocol Checklist */}
                    <Item
                      asChild
                      variant="outline"
                      size="sm"
                      className={`cursor-pointer items-start font-mono transition-colors ${
                        isChecked
                          ? "border-success/15 bg-success/10 dark:border-success/25 dark:bg-success/15"
                          : "bg-muted/20 hover:bg-muted/40"
                      }`}
                    >
                      <label htmlFor={`protocol-${alert.id}`}>
                        <ItemMedia>
                          <Checkbox
                            id={`protocol-${alert.id}`}
                            checked={isChecked}
                            onCheckedChange={() => toggleProtocol(alert.id)}
                            className="data-[state=checked]:border-success data-[state=checked]:bg-success data-[state=checked]:text-white"
                          />
                        </ItemMedia>
                        <ItemContent className="min-w-0">
                          <ItemTitle className="text-mini font-semibold">
                            {t.alerts.safetyProtocol}{" "}
                            {isChecked
                              ? t.alerts.acknowledged
                              : t.alerts.actionRequired}
                          </ItemTitle>
                          <ItemDescription className="text-mini leading-relaxed">
                            {alert.instruction}
                          </ItemDescription>
                        </ItemContent>
                      </label>
                    </Item>
                  </div>
                )
              })}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  )
}
