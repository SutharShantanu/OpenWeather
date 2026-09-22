"use client"

import React from "react"
import {
  Sliders,
  Thermometer,
  Wind,
  Gauge,
  CloudRain,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"
import { cToF } from "@/lib/weather"
import { useTranslation } from "@/components/language-provider"
import {
  TabBaseProps,
  UnitPresetId,
  StandardUnitPresetId,
} from "./types"
import {
  UNIT_PRESETS,
  METRIC_UNIT_PRESET,
  IMPERIAL_UNIT_PRESET,
  TEMPERATURE_UNIT_OPTIONS,
  WIND_SPEED_UNIT_OPTIONS,
  PRESSURE_UNIT_OPTIONS,
  PRECIPITATION_UNIT_OPTIONS,
  DEFAULT_FALLBACK_TEMP_BY_UNIT,
  matchesUnitPreset,
} from "./constants"
import {
  UnitSettingCard,
  SelectionCheckIndicator,
} from "./shared-widgets"

export interface UnitsTabProps extends TabBaseProps {
  currentTemp?: number
}

export function UnitsTabContent({
  settings,
  onUpdateSettings,
  currentTemp,
}: UnitsTabProps) {
  const { t } = useTranslation()
  const hasTemp = typeof currentTemp === "number" && !isNaN(currentTemp)
  const isCelsius = settings.tempUnit === "C"
  const cVal = hasTemp
    ? Math.round(currentTemp)
    : isCelsius
      ? DEFAULT_FALLBACK_TEMP_BY_UNIT.C
      : DEFAULT_FALLBACK_TEMP_BY_UNIT.F
  const fVal = Math.round(cToF(cVal))
  const isMetric = matchesUnitPreset(settings, METRIC_UNIT_PRESET)
  const isImperial = matchesUnitPreset(settings, IMPERIAL_UNIT_PRESET)
  const activePreset: UnitPresetId = isMetric
    ? "metric"
    : isImperial
      ? "imperial"
      : "custom"

  const applyPreset = (presetId: StandardUnitPresetId) => {
    onUpdateSettings(UNIT_PRESETS[presetId].units)
  }

  const presets: { id: UnitPresetId; label: string }[] = [
    ...Object.values(UNIT_PRESETS),
    ...(activePreset === "custom"
      ? [{ id: "custom" as const, label: "Custom" }]
      : []),
  ]

  return (
    <>
      {/* Quick Standard Presets Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Sliders className="size-4 text-primary" />
            <span>{t.settingsDialog.units.headerTitle}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {t.settingsDialog.units.headerSubtitle}
          </CardDescription>
          <CardAction className="flex">
            <ToggleGroup
              type="single"
              orientation="horizontal"
              spacing={0}
              className="flex-row"
              size="sm"
              value={activePreset}
              onValueChange={(val) => {
                if (val === "metric" || val === "imperial") {
                  applyPreset(val)
                }
              }}
            >
              {presets.map((preset) => {
                const isSelected = activePreset === preset.id
                return (
                  <ToggleGroupItem
                    key={preset.id}
                    value={preset.id}
                    className={cn(
                      "w-fit cursor-pointer transition-all",
                      isSelected && "data-[state=on]:bg-primary/5"
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-heading text-xs font-semibold text-foreground">
                        {preset.label}
                      </span>
                      <SelectionCheckIndicator isSelected={isSelected} />
                    </div>
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </CardAction>
        </CardHeader>
      </Card>

      {/* 4-Card Unit Standards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <UnitSettingCard
          icon={Thermometer}
          iconColor="text-destructive"
          title={t.settingsDialog.units.tempTitle}
          description={t.settingsDialog.units.tempDesc}
          badgeText={`°${settings.tempUnit}`}
          badgeVariant="primary-light"
          badgeClassName="font-mono text-xs text-primary"
          value={settings.tempUnit}
          onValueChange={(val) => onUpdateSettings({ tempUnit: val })}
          placeholder="Select temperature unit"
          options={TEMPERATURE_UNIT_OPTIONS}
        />

        <UnitSettingCard
          icon={Wind}
          iconColor="text-sky-500"
          title={t.settingsDialog.units.windTitle}
          description={t.settingsDialog.units.windDesc}
          badgeText={settings.windUnit}
          value={settings.windUnit}
          onValueChange={(val) => onUpdateSettings({ windUnit: val })}
          placeholder="Select wind unit"
          options={WIND_SPEED_UNIT_OPTIONS}
        />

        <UnitSettingCard
          icon={Gauge}
          iconColor="text-amber-500"
          title={t.settingsDialog.units.pressureTitle}
          description={t.settingsDialog.units.pressureDesc}
          badgeText={settings.pressureUnit}
          value={settings.pressureUnit}
          onValueChange={(val) => onUpdateSettings({ pressureUnit: val })}
          placeholder="Select pressure unit"
          options={PRESSURE_UNIT_OPTIONS}
        />

        <UnitSettingCard
          icon={CloudRain}
          iconColor="text-blue-500"
          title={t.settingsDialog.units.precipTitle}
          description={t.settingsDialog.units.precipDesc}
          badgeText={settings.precipUnit}
          value={settings.precipUnit}
          onValueChange={(val) => onUpdateSettings({ precipUnit: val })}
          placeholder="Select precipitation unit"
          options={PRECIPITATION_UNIT_OPTIONS}
        />
      </div>
    </>
  )
}
