import { Moon, Sun, Laptop } from "lucide-react"
import { CONFIG } from "@/lib/config"
import {
  DEFAULT_GOOGLE_AI_KEY,
  DEFAULT_GEMINI_TTS_MODEL,
} from "@/lib/constants"
import {
  FORECAST_STATION_MODELS,
  WEATHER_DATA_PROVIDERS,
  WindSpeedUnit,
  PressureUnit,
  PrecipitationUnit,
} from "@/lib/weather"
import {
  GOOGLE_LANGUAGES,
  type RegionalLanguageOption,
} from "@/lib/google-languages"
import {
  TemperatureUnit,
  StandardUnitPresetId,
  UnitOption,
  UnitPresetConfig,
  ExtendedSettings,
  TimeFormatOption,
  ThemeOptionId,
} from "./types"

export const METRIC_UNIT_PRESET: UnitPresetConfig["units"] = {
  tempUnit: "C",
  windUnit: "m/s",
  pressureUnit: "hPa",
  precipUnit: "mm",
} as const

export const IMPERIAL_UNIT_PRESET: UnitPresetConfig["units"] = {
  tempUnit: "F",
  windUnit: "mph",
  pressureUnit: "inHg",
  precipUnit: "in",
} as const

export const UNIT_PRESETS: Record<StandardUnitPresetId, UnitPresetConfig> = {
  metric: {
    id: "metric",
    label: `Metric`,
    units: METRIC_UNIT_PRESET,
  },
  imperial: {
    id: "imperial",
    label: `Imperial`,
    units: IMPERIAL_UNIT_PRESET,
  },
} as const

export const DEFAULT_UNIT_PRESET = METRIC_UNIT_PRESET

export const DEFAULT_FALLBACK_TEMP_BY_UNIT = {
  C: 0,
  F: 20,
} as const

export const TEMPERATURE_UNIT_OPTIONS: UnitOption<TemperatureUnit>[] = [
  { value: "C", label: "Celsius (°C)" },
  { value: "F", label: "Fahrenheit (°F)" },
]

export const WIND_SPEED_UNIT_OPTIONS: UnitOption<WindSpeedUnit>[] = [
  { value: "m/s", label: "Meters per second (m/s)" },
  { value: "km/h", label: "Kilometers per hour (km/h)" },
  { value: "mph", label: "Miles per hour (mph)" },
  { value: "knots", label: "Knots (knots)" },
]

export const PRESSURE_UNIT_OPTIONS: UnitOption<PressureUnit>[] = [
  { value: "hPa", label: "Hectopascals (hPa)" },
  { value: "inHg", label: "Inches of Mercury (inHg)" },
  { value: "mmHg", label: "Millimeters of Mercury (mmHg)" },
]

export const PRECIPITATION_UNIT_OPTIONS: UnitOption<PrecipitationUnit>[] = [
  { value: "mm", label: "Millimeters (mm)" },
  { value: "in", label: "Inches (in)" },
]

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

export const POPULAR_CITIES: string[] = CONFIG.location.popularCities

export const REGIONAL_LANGUAGES: RegionalLanguageOption[] = GOOGLE_LANGUAGES

export const DATE_FORMAT_OPTIONS = [
  {
    id: "iso" as const,
    label: "ISO 8601 (Synoptic)",
    format: "YYYY-MM-DD",
    dateFnsPattern: "yyyy-MM-dd",
    subtitle: "Scientific & Synoptic Standard",
    desc: "WMO meteorological observation consensus standard eliminating calendar ambiguity.",
  },
  {
    id: "intl" as const,
    label: "International Standard",
    format: "DD/MM/YYYY",
    dateFnsPattern: "dd/MM/yyyy",
    subtitle: "European & Global Consensus",
    desc: "Standard daily calendar convention across Europe, Latin America, Oceania & international stations.",
  },
  {
    id: "us" as const,
    label: "North American",
    format: "MM/DD/YYYY",
    dateFnsPattern: "MM/dd/yyyy",
    subtitle: "Civilian Standard",
    desc: "Conventional civilian calendar standard used widely across the United States & Canada.",
  },
] as const

export const COORDINATE_FORMAT_OPTIONS = [
  {
    id: "decimal" as const,
    label: "Decimal Degrees (DD)",
    subtitle: "GIS & GPS Coordinate Standard",
    example: "51.5074° N, 0.1278° W",
    desc: "Algorithmic NWP spatial grid & modern satellite geodetic positioning standard.",
  },
  {
    id: "dms" as const,
    label: "Degrees Minutes Seconds (DMS)",
    subtitle: "Marine & Aeronautical Charting",
    example: "51°30'27\" N, 0°07'40\" W",
    desc: "Traditional maritime navigation, geodesy & aeronautical air traffic charts.",
  },
] as const

export const THEME_OPTIONS = [
  {
    id: "dark" as const,
    title: "Dark Synoptic",
    subtitle: "Nocturnal Radar",
    desc: "Optimal for radar observation & low fatigue in dark environments.",
    icon: Moon,
    badge: "OLED Pitch",
  },
  {
    id: "light" as const,
    title: "Light Daylight",
    subtitle: "High Contrast",
    desc: "Crisp daytime telemetry engineered for high ambient solar glare.",
    icon: Sun,
    badge: "Daylight",
  },
  {
    id: "system" as const,
    title: "System Synced",
    subtitle: "OS Responsive",
    desc: "Dynamically synchronizes with your device's appearance schedule.",
    icon: Laptop,
    badge: "Adaptive",
  },
] as const

export const DEFAULT_THEME_ID: ThemeOptionId = THEME_OPTIONS[0].id

export const TIME_FORMAT_OPTIONS: TimeFormatOption[] = [
  { id: "24h", label: "24-Hour (Synoptic / Zulu Standard)", sublabel: "14:30" },
  { id: "12h", label: "12-Hour Civilian (AM/PM)", sublabel: "2:30 PM" },
]

export const DELIVERY_STYLES = [
  {
    id: "meteorological" as const,
    label: "Meteorological Anchor",
    badge: "Default",
    desc: "Professional, balanced and authoritative broadcast reading",
  },
  {
    id: "cheerful" as const,
    label: "Cheerful & Warm",
    badge: "Vocal Smile",
    desc: "Sunny, inviting, optimistic and upbeat morning delivery",
  },
  {
    id: "energetic" as const,
    label: "High Energy & Dynamic",
    badge: "Drive Time",
    desc: "Rapid tempo, enthusiastic pacing with heightened dynamism",
  },
  {
    id: "calm" as const,
    label: "Calm & Serene",
    badge: "Relaxing",
    desc: "Slow, soothing, tranquil and gentle evening cadence",
  },
  {
    id: "authoritative" as const,
    label: "Severe Weather Bulletin",
    badge: "Alert Mode",
    desc: "Direct, urgent, high-visibility articulation for critical alerts",
  },
] as const

export const DEFAULT_EXTENDED_SETTINGS: ExtendedSettings = {
  tempUnit: CONFIG.settings.defaultTempUnit,
  windUnit: CONFIG.settings.defaultWindUnit,
  pressureUnit: CONFIG.settings.defaultPressureUnit,
  precipUnit: CONFIG.settings.defaultPrecipUnit,
  timeFormat:
    TIME_FORMAT_OPTIONS.find((o) => o.id === CONFIG.settings.defaultTimeFormat)?.id ||
    TIME_FORMAT_OPTIONS[0].id,
  dateFormat:
    DATE_FORMAT_OPTIONS.find((o) => o.id === CONFIG.settings.defaultDateFormat)?.id ||
    DATE_FORMAT_OPTIONS[0].id,
  coordinateFormat:
    COORDINATE_FORMAT_OPTIONS.find((o) => o.id === CONFIG.settings.defaultCoordinateFormat)?.id ||
    COORDINATE_FORMAT_OPTIONS[0].id,
  language: CONFIG.settings.defaultLanguage || REGIONAL_LANGUAGES[0].code,
  speechRate: CONFIG.settings.defaultTtsSpeed,
  autoSpeakOnLoad: false,
  weatherSource: CONFIG.settings.defaultWeatherSource || WEATHER_DATA_PROVIDERS[0].id,
  forecastStation: CONFIG.settings.defaultForecastStation || FORECAST_STATION_MODELS[0].id,
  customApiKey: "",
  // Speech & Audio defaults
  speechConfigMode: "basic",
  googleTtsModel: CONFIG.settings.defaultTtsModel,
  googleTtsVoice: "Kore",
  googleTtsPitch: CONFIG.settings.defaultTtsPitch,
  googleTtsAudioProfile: CONFIG.settings.defaultTtsAudioProfile,
  googleTtsVolumeGain: CONFIG.settings.defaultTtsVolume,
  googleApiKey: DEFAULT_GOOGLE_AI_KEY,
  geminiVoice: "Kore",
  geminiModel: DEFAULT_GEMINI_TTS_MODEL,
  speechDeliveryStyle: "meteorological",
}
