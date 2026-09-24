import {
  WindSpeedUnit,
  PressureUnit,
  PrecipitationUnit,
} from "@/lib/weather"
import type { TemperatureUnit, UnitPresetConfig, UnitPresetId } from "../types"
import { UNIT_PRESETS } from "../constants"

/**
 * Checks whether the current settings match a predefined standard unit preset.
 */
export function matchesUnitPreset(
  settings: {
    tempUnit: TemperatureUnit
    windUnit: WindSpeedUnit
    pressureUnit: PressureUnit
    precipUnit: PrecipitationUnit
  },
  presetUnits: UnitPresetConfig["units"]
): boolean {
  return (
    settings.tempUnit === presetUnits.tempUnit &&
    settings.windUnit === presetUnits.windUnit &&
    settings.pressureUnit === presetUnits.pressureUnit &&
    settings.precipUnit === presetUnits.precipUnit
  )
}

/**
 * Resolves which standard preset the current units match, or "custom" when none do.
 */
export function getActiveUnitPreset(settings: {
  tempUnit: TemperatureUnit
  windUnit: WindSpeedUnit
  pressureUnit: PressureUnit
  precipUnit: PrecipitationUnit
}): UnitPresetId {
  if (matchesUnitPreset(settings, UNIT_PRESETS.metric.units)) return "metric"
  if (matchesUnitPreset(settings, UNIT_PRESETS.imperial.units)) return "imperial"
  return "custom"
}
