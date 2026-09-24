"use client"

import React, { createContext, useContext, useMemo } from "react"
import {
  formatWind,
  formatPressure,
  formatPrecip,
  type WindSpeedUnit,
  type PressureUnit,
  type PrecipitationUnit,
  type TimeFormat,
} from "@/lib/weather"
import {
  formatClockString,
  formatCoords,
  formatDate,
  formatShortDate,
  formatTime,
  type DateInput,
} from "@/lib/format"
import type {
  CoordinateFormatOption,
  DateFormatOption,
} from "@/components/settings/types"

export interface DisplayPreferences {
  windUnit: WindSpeedUnit
  pressureUnit: PressureUnit
  precipUnit: PrecipitationUnit
  timeFormat: TimeFormat
  dateFormat: DateFormatOption
  coordinateFormat: CoordinateFormatOption
  language: string
}

type Measurement = { val: number; unitStr: string }

export interface DisplayPreferencesContextValue extends DisplayPreferences {
  /** Converts a m/s speed into the preferred wind unit. */
  wind: (mps: number) => Measurement
  /** Converts hPa into the preferred pressure unit. */
  pressure: (hpa: number) => Measurement
  /** Converts mm into the preferred precipitation unit. */
  precip: (mm: number) => Measurement
  /** "12.3 km/h" */
  windText: (mps: number) => string
  /** "1013 hPa" */
  pressureText: (hpa: number) => string
  /** "2.5 mm" */
  precipText: (mm: number) => string
  /** Clock time from a Date / Unix timestamp (viewer's timezone unless given). */
  time: (input: DateInput, opts?: { timeZone?: string; showMinutes?: boolean }) => string
  /** Re-format a preformatted "HH:mm" wall-clock string (no TZ conversion). */
  clock: (hhmm: string, opts?: { showMinutes?: boolean }) => string
  /** Full calendar date in the preferred date format. */
  date: (input: DateInput) => string
  /** Compact day/month label in the preferred ordering. */
  shortDate: (input: DateInput) => string
  /** Coordinate pair in decimal or DMS. */
  coords: (lat: number, lon: number, precision?: number) => string
}

export const DEFAULT_DISPLAY_PREFERENCES: DisplayPreferences = {
  windUnit: "m/s",
  pressureUnit: "hPa",
  precipUnit: "mm",
  timeFormat: "24h",
  dateFormat: "iso",
  coordinateFormat: "decimal",
  language: "en",
}

function buildValue(prefs: DisplayPreferences): DisplayPreferencesContextValue {
  const wind = (mps: number) => formatWind(mps, prefs.windUnit)
  const pressure = (hpa: number) => formatPressure(hpa, prefs.pressureUnit)
  const precip = (mm: number) => formatPrecip(mm, prefs.precipUnit)
  const text = ({ val, unitStr }: Measurement) => `${val} ${unitStr}`
  return {
    ...prefs,
    wind,
    pressure,
    precip,
    windText: (mps) => text(wind(mps)),
    pressureText: (hpa) => text(pressure(hpa)),
    precipText: (mm) => text(precip(mm)),
    time: (input, opts) =>
      formatTime(input, prefs.timeFormat, prefs.language, opts?.timeZone, {
        showMinutes: opts?.showMinutes,
      }),
    clock: (hhmm, opts) => formatClockString(hhmm, prefs.timeFormat, opts),
    date: (input) => formatDate(input, prefs.dateFormat),
    shortDate: (input) => formatShortDate(input, prefs.dateFormat),
    coords: (lat, lon, precision) =>
      formatCoords(lat, lon, prefs.coordinateFormat, precision),
  }
}

const DisplayPreferencesContext = createContext<DisplayPreferencesContextValue>(
  buildValue(DEFAULT_DISPLAY_PREFERENCES)
)

export function DisplayPreferencesProvider({
  preferences,
  children,
}: {
  preferences: Partial<DisplayPreferences>
  children: React.ReactNode
}) {
  const {
    windUnit = DEFAULT_DISPLAY_PREFERENCES.windUnit,
    pressureUnit = DEFAULT_DISPLAY_PREFERENCES.pressureUnit,
    precipUnit = DEFAULT_DISPLAY_PREFERENCES.precipUnit,
    timeFormat = DEFAULT_DISPLAY_PREFERENCES.timeFormat,
    dateFormat = DEFAULT_DISPLAY_PREFERENCES.dateFormat,
    coordinateFormat = DEFAULT_DISPLAY_PREFERENCES.coordinateFormat,
    language = DEFAULT_DISPLAY_PREFERENCES.language,
  } = preferences

  const value = useMemo(
    () =>
      buildValue({
        windUnit,
        pressureUnit,
        precipUnit,
        timeFormat,
        dateFormat,
        coordinateFormat,
        language,
      }),
    [windUnit, pressureUnit, precipUnit, timeFormat, dateFormat, coordinateFormat, language]
  )

  return (
    <DisplayPreferencesContext.Provider value={value}>
      {children}
    </DisplayPreferencesContext.Provider>
  )
}

export function useDisplayPreferences() {
  return useContext(DisplayPreferencesContext)
}
