import {
  WindSpeedUnit,
  PressureUnit,
  PrecipitationUnit,
  TimeFormat,
  WeatherDataSource,
  ForecastStationModel,
  GeocodingResult,
  NearbyCity,
} from "@/lib/weather"
import { GoogleTtsModel, GoogleTtsAudioProfile } from "@/lib/google-tts"

export type TemperatureUnit = "C" | "F"

export type UnitPresetId = "metric" | "imperial" | "custom"
export type StandardUnitPresetId = "metric" | "imperial"

export interface UnitOption<T extends string = string> {
  value: T
  label: string
}

export interface UnitPresetConfig {
  id: StandardUnitPresetId
  label: string
  units: {
    tempUnit: TemperatureUnit
    windUnit: WindSpeedUnit
    pressureUnit: PressureUnit
    precipUnit: PrecipitationUnit
  }
}

export type DateFormatOption = "iso" | "intl" | "us"
export type CoordinateFormatOption = "decimal" | "dms"
export type ThemeOptionId = "dark" | "light" | "system"

export interface TimeFormatOption {
  id: TimeFormat
  label: string
  sublabel: string
}

export type SpeechConfigMode = "basic" | "advanced"

export type SpeechDeliveryStyle =
  | "meteorological"
  | "cheerful"
  | "energetic"
  | "calm"
  | "authoritative"

export interface ExtendedSettings {
  tempUnit: TemperatureUnit
  windUnit: WindSpeedUnit
  pressureUnit: PressureUnit
  precipUnit: PrecipitationUnit
  timeFormat: TimeFormat
  dateFormat?: DateFormatOption
  coordinateFormat?: CoordinateFormatOption
  language: string
  speechRate: number
  autoSpeakOnLoad: boolean
  weatherSource: WeatherDataSource
  forecastStation: ForecastStationModel
  customApiKey?: string
  // Speech & Audio configurations
  speechConfigMode?: SpeechConfigMode
  googleTtsModel: GoogleTtsModel
  googleTtsVoice: string
  googleTtsPitch: number
  googleTtsAudioProfile: GoogleTtsAudioProfile
  googleTtsVolumeGain: number
  googleApiKey?: string
  geminiVoice?: string
  geminiModel?: string
  speechDeliveryStyle?: SpeechDeliveryStyle
}

export interface TabBaseProps {
  settings: ExtendedSettings
  onUpdateSettings: (newSettings: Partial<ExtendedSettings>) => void
  city?: string
  coords?: { lat: number; lon: number } | null
}

export interface LocationsTabProps {
  pinnedCities: string[]
  onAddPinnedCity: (city: string) => void
  onRemovePinnedCity: (city: string) => void
  onSelectCity: (city: string) => void
  onCloseDialog: () => void
  coords?: { lat: number; lon: number } | null
  city?: string
}

export type FavoritesTabProps = LocationsTabProps

export type PopularCity = string

export type { GeocodingResult, NearbyCity }
