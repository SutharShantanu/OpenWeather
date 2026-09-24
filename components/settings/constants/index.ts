import { Moon, Sun, Laptop } from "lucide-react"
import { CONFIG } from "@/lib/config"
import { DEFAULT_TTS_VOICE } from "@/lib/edge-tts"
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
  SpeechDeliveryStyle,
} from "../types"

export const METRIC_UNIT_PRESET: UnitPresetConfig["units"] = {
  tempUnit: "C",
  windUnit: "km/h",
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
  metric: { id: "metric", units: METRIC_UNIT_PRESET },
  imperial: { id: "imperial", units: IMPERIAL_UNIT_PRESET },
} as const

// Option labels live in translations: t.settingsDialog.units.options.<kind>[value]
export const TEMPERATURE_UNIT_OPTIONS: UnitOption<TemperatureUnit>[] = [
  { value: "C" },
  { value: "F" },
]

export const WIND_SPEED_UNIT_OPTIONS: UnitOption<WindSpeedUnit>[] = [
  { value: "m/s" },
  { value: "km/h" },
  { value: "mph" },
  { value: "knots" },
]

export const PRESSURE_UNIT_OPTIONS: UnitOption<PressureUnit>[] = [
  { value: "hPa" },
  { value: "inHg" },
  { value: "mmHg" },
]

export const PRECIPITATION_UNIT_OPTIONS: UnitOption<PrecipitationUnit>[] = [
  { value: "mm" },
  { value: "in" },
]

export const POPULAR_CITIES: string[] = CONFIG.location.popularCities

export const REGIONAL_LANGUAGES: RegionalLanguageOption[] = GOOGLE_LANGUAGES

// Labels live in translations: t.settingsDialog.regional.dateFormats[id]
export const DATE_FORMAT_OPTIONS = [
  { id: "iso" as const, format: "YYYY-MM-DD", dateFnsPattern: "yyyy-MM-dd" },
  { id: "intl" as const, format: "DD/MM/YYYY", dateFnsPattern: "dd/MM/yyyy" },
  { id: "us" as const, format: "MM/DD/YYYY", dateFnsPattern: "MM/dd/yyyy" },
] as const

// Labels live in translations: t.settingsDialog.regional.coordFormats[id]
export const COORDINATE_FORMAT_OPTIONS = [
  { id: "decimal" as const },
  { id: "dms" as const },
] as const

// Text lives in translations: t.settingsDialog.theme.<id>{Title,Subtitle,Desc,Badge}
export const THEME_OPTIONS = [
  { id: "dark" as const, icon: Moon },
  { id: "light" as const, icon: Sun },
  { id: "system" as const, icon: Laptop },
] as const

// Must match `defaultTheme` on the ThemeProvider in app/layout.tsx
export const DEFAULT_THEME_ID: ThemeOptionId = "system"

// Labels live in translations: t.settingsDialog.regional.time{24,12}Label
export const TIME_FORMAT_OPTIONS: TimeFormatOption[] = [{ id: "24h" }, { id: "12h" }]

// Labels live in translations: t.settingsDialog.speech.deliveryStyles[id]
export const DELIVERY_STYLES: readonly SpeechDeliveryStyle[] = [
  "meteorological",
  "calm",
  "cheerful",
  "energetic",
  "authoritative",
]

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
  googleTtsPitch: CONFIG.settings.defaultTtsPitch,
  googleTtsVolumeGain: CONFIG.settings.defaultTtsVolume,
  ttsVoice: DEFAULT_TTS_VOICE,
  speechDeliveryStyle: "meteorological",
}
