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
import type {
  TabBaseProps,
  UnitPresetId,
  StandardUnitPresetId,
} from "../../types"
import {
  UNIT_PRESETS,
  TEMPERATURE_UNIT_OPTIONS,
  WIND_SPEED_UNIT_OPTIONS,
  PRESSURE_UNIT_OPTIONS,
  PRECIPITATION_UNIT_OPTIONS,
} from "../../constants"
import { getActiveUnitPreset } from "../../utils"
import { UnitSettingCard } from "../widgets/unit-setting-card"
import { SelectionCheckIndicator } from "../widgets/selection-check-indicator"

export interface UnitsTabProps extends TabBaseProps {
  currentTemp?: number
}

export function UnitsTabContent({
  settings,
  onUpdateSettings,
  currentTemp,
}: UnitsTabProps) {
  const { t } = useTranslation()
  const hasTemp = typeof currentTemp === "number" && Number.isFinite(currentTemp)
  // Live preview of the current reading in the selected unit (source data is °C)
  const tempBadge = hasTemp
    ? `${Math.round(settings.tempUnit === "F" ? cToF(currentTemp) : currentTemp)}°${settings.tempUnit}`
    : `°${settings.tempUnit}`
  const activePreset: UnitPresetId = getActiveUnitPreset(settings)

  const applyPreset = (presetId: StandardUnitPresetId) => {
    onUpdateSettings(UNIT_PRESETS[presetId].units)
  }

  const unitLabels = t.settingsDialog.units
  const withLabels = <T extends string>(
    options: { value: T }[],
    labels: Record<T, string>
  ) => options.map((opt) => ({ value: opt.value, label: labels[opt.value] }))

  // "Custom" is always rendered (no layout shift) but only reflects state; it can't be chosen directly
  const presetIds: UnitPresetId[] = [...Object.values(UNIT_PRESETS).map((p) => p.id), "custom"]

  return (
    <>
      {/* Quick Standard Presets Bar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Sliders className="size-4 text-primary" />
            <span>{unitLabels.headerTitle}</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {unitLabels.headerSubtitle}
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
              {presetIds.map((presetId) => {
                const isSelected = activePreset === presetId
                return (
                  <ToggleGroupItem
                    key={presetId}
                    value={presetId}
                    disabled={presetId === "custom" && !isSelected}
                    aria-disabled={presetId === "custom" ? true : undefined}
                    className={cn(
                      "w-fit cursor-pointer transition-all",
                      isSelected && "data-[state=on]:bg-primary/5"
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="font-heading text-xs font-semibold text-foreground">
                        {unitLabels.presets[presetId]}
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
          title={unitLabels.tempTitle}
          description={unitLabels.tempDesc}
          badgeText={tempBadge}
          badgeVariant="primary-light"
          badgeClassName="font-mono text-xs text-primary"
          value={settings.tempUnit}
          onValueChange={(val) => onUpdateSettings({ tempUnit: val })}
          placeholder={unitLabels.selectTempPlaceholder}
          options={withLabels(TEMPERATURE_UNIT_OPTIONS, unitLabels.options.temp)}
        />

        <UnitSettingCard
          icon={Wind}
          iconColor="text-sky-500"
          title={unitLabels.windTitle}
          description={unitLabels.windDesc}
          badgeText={settings.windUnit}
          value={settings.windUnit}
          onValueChange={(val) => onUpdateSettings({ windUnit: val })}
          placeholder={unitLabels.selectWindPlaceholder}
          options={withLabels(WIND_SPEED_UNIT_OPTIONS, unitLabels.options.wind)}
        />

        <UnitSettingCard
          icon={Gauge}
          iconColor="text-amber-500"
          title={unitLabels.pressureTitle}
          description={unitLabels.pressureDesc}
          badgeText={settings.pressureUnit}
          value={settings.pressureUnit}
          onValueChange={(val) => onUpdateSettings({ pressureUnit: val })}
          placeholder={unitLabels.selectPressurePlaceholder}
          options={withLabels(PRESSURE_UNIT_OPTIONS, unitLabels.options.pressure)}
        />

        <UnitSettingCard
          icon={CloudRain}
          iconColor="text-blue-500"
          title={unitLabels.precipTitle}
          description={unitLabels.precipDesc}
          badgeText={settings.precipUnit}
          value={settings.precipUnit}
          onValueChange={(val) => onUpdateSettings({ precipUnit: val })}
          placeholder={unitLabels.selectPrecipPlaceholder}
          options={withLabels(PRECIPITATION_UNIT_OPTIONS, unitLabels.options.precip)}
        />
      </div>
    </>
  )
}
