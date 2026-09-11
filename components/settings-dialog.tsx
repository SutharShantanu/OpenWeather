"use client"

import React, { useState, useEffect } from "react"
import {
  Settings,
  MapPin,
  Globe,
  Volume2,
  Moon,
  Sun,
  Laptop,
  Check,
  RotateCcw,
  Plus,
  Trash2,
  Radio,
  Server,
  Cpu,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Square,
  Sliders,
  Headphones,
  Thermometer,
  Wind,
  Gauge,
  CloudRain,
  CloudLightning,
  ShieldCheck,
  Clock,
  SunMoon,
  Play,
  ArrowRight,
  Calendar,
  Compass,
  Languages,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { IconStack } from "@/components/reui/icon-stack"
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { Dot } from "@/components/ui/dot"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"
import {
  WindSpeedUnit,
  PressureUnit,
  PrecipitationUnit,
  TimeFormat,
  WeatherDataSource,
  ForecastStationModel,
  FORECAST_STATION_MODELS,
  WEATHER_DATA_PROVIDERS,
  cToF,
} from "@/lib/weather"
import {
  GoogleTtsModel,
  GoogleTtsAudioProfile,
  GoogleTtsVoiceInfo,
  GOOGLE_TTS_MODELS,
  GOOGLE_TTS_AUDIO_PROFILES,
  GOOGLE_TTS_VOICES,
  GOOGLE_TTS_PITCH_PRESETS,
  GOOGLE_TTS_VOLUME_PRESETS,
  getAvailableGoogleVoices,
} from "@/lib/google-tts"
import { WeatherSpeechSynthesizer } from "@/lib/speech"
import { useMounted } from "@/hooks/use-mount"
import { useTranslation } from "@/components/language-provider"
import { format } from "date-fns"
import { UniversalDialog } from "@/components/universal-dialog"

// ============================================================================
// TYPES & CONFIGURATIONS
// ============================================================================

export type TemperatureUnit = "C" | "F"

export type UnitPresetId = "metric" | "imperial"

export interface UnitOption<T extends string = string> {
  value: T
  label: string
}

export interface UnitPresetConfig {
  id: UnitPresetId
  label: string
  units: {
    tempUnit: TemperatureUnit
    windUnit: WindSpeedUnit
    pressureUnit: PressureUnit
    precipUnit: PrecipitationUnit
  }
}

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

export const UNIT_PRESETS: Record<UnitPresetId, UnitPresetConfig> = {
  metric: {
    id: "metric",
    label: `Metric (°${METRIC_UNIT_PRESET.tempUnit}, ${METRIC_UNIT_PRESET.windUnit}, ${METRIC_UNIT_PRESET.pressureUnit}, ${METRIC_UNIT_PRESET.precipUnit})`,
    units: METRIC_UNIT_PRESET,
  },
  imperial: {
    id: "imperial",
    label: `Imperial (°${IMPERIAL_UNIT_PRESET.tempUnit}, ${IMPERIAL_UNIT_PRESET.windUnit}, ${IMPERIAL_UNIT_PRESET.pressureUnit}, ${IMPERIAL_UNIT_PRESET.precipUnit})`,
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

export const POPULAR_CITIES = [
  "London",
  "Tokyo",
  "New York",
  "Paris",
  "Zurich",
  "Sydney",
  "Singapore",
  "Reykjavik",
] as const

export type PopularCity = (typeof POPULAR_CITIES)[number]

export interface RegionalLanguageOption {
  code: string
  label: string
  englishName: string
  region: string
  scriptGlyph: string
  flag: string
  weatherConditionSample: string
  speechPreviewText: string
  voiceHighlights: string
  advisoryPreview: string
  lexicon: { key: string; val: string }[]
}

const REGIONAL_LANGUAGES: RegionalLanguageOption[] = [
  {
    code: "en",
    label: "English",
    englishName: "International English",
    region: "WMO Global & Aviation Standard",
    scriptGlyph: "Aa",
    flag: "🌐",
    weatherConditionSample: "Partly Cloudy • 22°C • WNW 14 km/h",
    speechPreviewText:
      "Google Text-to-Speech: Atmospheric barometric pressure is steady at 1013 millibars with partly cloudy skies.",
    voiceHighlights: "13 Voices • Journey & Studio",
    advisoryPreview:
      "High-pressure ridge maintaining stable tropospheric stratification. Moderate UV irradiance index across metropolitan observation basin during peak solar hours.",
    lexicon: [
      { key: "Precipitation", val: "Precipitation Probability" },
      { key: "Severe Alert", val: "Severe Thunderstorm Warning" },
      { key: "Barometer", val: "Barometric Tendency" },
    ],
  },
  {
    code: "es",
    label: "Español",
    englishName: "Spanish",
    region: "España & Latinoamérica",
    scriptGlyph: "Ñ",
    flag: "🇪🇸",
    weatherConditionSample: "Parcialmente Nublado • 22°C • ONO 14 km/h",
    speechPreviewText:
      "Google Text-to-Speech: Presión atmosférica estable en 1013 milibares con cielos parcialmente cubiertos.",
    voiceHighlights: "5 Voices • Journey & Neural2",
    advisoryPreview:
      "Dorsal de alta presión manteniendo condiciones troposféricas estables. Índice de radiación UV moderado en la cuenca metropolitana durante las horas solares pico.",
    lexicon: [
      { key: "Precipitación", val: "Probabilidad de Precipitación" },
      { key: "Alerta Severa", val: "Alerta de Tormenta Severa" },
      { key: "Barómetro", val: "Tendencia Barométrica" },
    ],
  },
  {
    code: "fr",
    label: "Français",
    englishName: "French",
    region: "France & Francophonie",
    scriptGlyph: "Ç",
    flag: "🇫🇷",
    weatherConditionSample: "Partiellement Nuageux • 22°C • ONO 14 km/h",
    speechPreviewText:
      "Google Text-to-Speech: Pression barométrique stable à 1013 millibars avec passages nuageux modérés.",
    voiceHighlights: "5 Voices • Journey & Studio",
    advisoryPreview:
      "Dorsale anticyclonique maintenant des conditions troposphériques stables. Indice de rayonnement UV modéré sur le bassin métropolitain aux heures solaires de pointe.",
    lexicon: [
      { key: "Précipitations", val: "Probabilité de Précipitations" },
      { key: "Alerte Météo", val: "Alerte aux Orages Violents" },
      { key: "Baromètre", val: "Tendance de la Pression" },
    ],
  },
  {
    code: "de",
    label: "Deutsch",
    englishName: "German",
    region: "Deutschland, Österreich & Schweiz",
    scriptGlyph: "Ä",
    flag: "🇩🇪",
    weatherConditionSample: "Teilweise Bewölkt • 22°C • WNW 14 km/h",
    speechPreviewText:
      "Google Text-to-Speech: Luftdruck stabil bei 1013 Millibar mit wechselnder Bewölkung.",
    voiceHighlights: "3 Voices • Journey & Studio",
    advisoryPreview:
      "Hochdruckkeil sorgt für stabile troposphärische Verhältnisse. Mäßiger UV-Strahlungsindex im großstädtischen Beobachtungsbecken während der Sonnenhöchststände.",
    lexicon: [
      { key: "Niederschlag", val: "Niederschlagswahrscheinlichkeit" },
      { key: "Unwetter", val: "Schwere Unwetterwarnung" },
      { key: "Barometer", val: "Luftdruck-Entwicklungstendenz" },
    ],
  },
  {
    code: "ja",
    label: "日本語",
    englishName: "Japanese",
    region: "日本・東日本 & 西日本",
    scriptGlyph: "あ",
    flag: "🇯🇵",
    weatherConditionSample: "時々曇り • 22°C • 西北西 14 km/h",
    speechPreviewText:
      "Google Text-to-Speech: 気圧は1013ミリバールで安定しており、時々雲が広がる概況です。",
    voiceHighlights: "2 Voices • Neural2 Studio",
    advisoryPreview:
      "高気圧の気圧稜が安定した対流圏状態を維持しています。日中の日照ピーク時には大都市観測盆地全体で中程度の紫外線指数が予測されます。",
    lexicon: [
      { key: "降水確率", val: "雨・雪の発生確率" },
      { key: "気象警報", val: "激しい雷雨警報" },
      { key: "気圧配置", val: "気圧変化傾向" },
    ],
  },
  {
    code: "hi",
    label: "हिन्दी",
    englishName: "Hindi",
    region: "भारत (India Synoptic Telemetry)",
    scriptGlyph: "अ",
    flag: "🇮🇳",
    weatherConditionSample: "आंशिक रूप से बादल • 22°C • प.उ.प. 14 किमी/घं",
    speechPreviewText:
      "गूगल टेक्स्ट-टू-स्पीच: वायुमंडलीय दबाव 1013 मिलीबार पर स्थिर एवं आंशिक रूप से बादल छाए रहेंगे।",
    voiceHighlights: "5 Voices • Neural2 & WaveNet",
    advisoryPreview:
      "उच्च दबाव कटक स्थिर क्षोभमंडलीय स्थिति बनाए हुए है। सौर चरम घंटों के दौरान महानगरीय अवलोकन बेसिन में मध्यम पराबैंगनी विकिरण सूचकांक दर्ज किया गया।",
    lexicon: [
      { key: "वर्षा संभावना", val: "वर्षा की संभावना" },
      { key: "मौसम चेतावनी", val: "भीषण आंधी-तूफान चेतावनी" },
      { key: "वायुदाब", val: "वायुमंडलीय दबाव प्रवृत्ति" },
    ],
  },
]

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

export type DateFormatOption = (typeof DATE_FORMAT_OPTIONS)[number]["id"]

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

export type CoordinateFormatOption = (typeof COORDINATE_FORMAT_OPTIONS)[number]["id"]

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

export type ThemeOptionId = (typeof THEME_OPTIONS)[number]["id"]
export const DEFAULT_THEME_ID: ThemeOptionId = THEME_OPTIONS[0].id

export interface TimeFormatOption {
  id: TimeFormat
  label: string
  sublabel: string
}

export const TIME_FORMAT_OPTIONS: TimeFormatOption[] = [
  { id: "24h", label: "24-Hour (Synoptic / Zulu Standard)", sublabel: "14:30" },
  { id: "12h", label: "12-Hour Civilian (AM/PM)", sublabel: "2:30 PM" },
]

export type SpeechConfigMode = "basic" | "advanced"

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
  // Google Text-to-Speech configurations
  speechConfigMode?: SpeechConfigMode
  googleTtsModel: GoogleTtsModel
  googleTtsVoice: string
  googleTtsPitch: number
  googleTtsAudioProfile: GoogleTtsAudioProfile
  googleTtsVolumeGain: number
  googleApiKey?: string
}

export const DEFAULT_EXTENDED_SETTINGS: ExtendedSettings = {
  ...DEFAULT_UNIT_PRESET,
  timeFormat: TIME_FORMAT_OPTIONS[0].id,
  dateFormat: DATE_FORMAT_OPTIONS[0].id,
  coordinateFormat: COORDINATE_FORMAT_OPTIONS[0].id,
  language: REGIONAL_LANGUAGES[0].code,
  speechRate: 1.0,
  autoSpeakOnLoad: false,
  weatherSource: WEATHER_DATA_PROVIDERS[0].id,
  forecastStation: FORECAST_STATION_MODELS[0].id,
  customApiKey: "",
  // Google TTS defaults
  speechConfigMode: "basic",
  googleTtsModel: GOOGLE_TTS_MODELS[0].id,
  googleTtsVoice: GOOGLE_TTS_VOICES[0]?.id || "en-US-Journey-F",
  googleTtsPitch: 0.0,
  googleTtsAudioProfile: GOOGLE_TTS_AUDIO_PROFILES[0].id,
  googleTtsVolumeGain: 0.0,
  googleApiKey: "",
}

// ============================================================================
// REUSABLE TAB & SECTION PRIMITIVES
// ============================================================================

export interface SettingsTabTriggerProps extends React.ComponentProps<
  typeof TabsTrigger
> {
  value: string
  label: string
  badge?: React.ReactNode
}

export function SettingsTabTrigger({
  value,
  label,
  badge,
  className,
  ...props
}: SettingsTabTriggerProps) {
  return (
    <TabsTrigger value={value} className={cn("gap-1.5", className)} {...props}>
      <span>{label}</span>
      {badge}
    </TabsTrigger>
  )
}

export interface SettingsTabPanelProps extends React.ComponentProps<
  typeof TabsContent
> {
  value: string
  children: React.ReactNode
}

export function SettingsTabPanel({
  value,
  className,
  children,
  ...props
}: SettingsTabPanelProps) {
  return (
    <TabsContent
      value={value}
      className={cn(
        "min-h-0 flex-1 space-y-4 overflow-y-auto focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </TabsContent>
  )
}

export function TabSectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {Icon && <Icon className="size-3.5 text-primary" />}
          <span>{title}</span>
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// ============================================================================
// REUSABLE FORM & CARD WIDGETS
// ============================================================================

interface UnitSettingCardProps<T extends string = string> {
  icon: React.ComponentType<{ className?: string }>
  iconColor?: string
  title: string
  description: string
  badgeText: string
  badgeVariant?: "primary-outline" | "primary-light" | "outline" | "secondary"
  badgeClassName?: string
  badgeExtra?: React.ReactNode
  value: T
  onValueChange: (val: T) => void
  placeholder: string
  options: UnitOption<T>[]
}

function UnitSettingCard<T extends string>({
  icon: Icon,
  iconColor,
  title,
  description,
  badgeText,
  badgeVariant = "primary-outline",
  badgeClassName = "font-mono text-xs uppercase",
  badgeExtra,
  value,
  onValueChange,
  placeholder,
  options,
}: UnitSettingCardProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
          <Icon className={cn("size-4", iconColor || "text-primary")} />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          {badgeExtra}
          <Badge variant={badgeVariant} className={badgeClassName}>
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Select
          value={value}
          onValueChange={(val) => {
            if (val) onValueChange(val as T)
          }}
        >
          <SelectTrigger className="h-8.5 w-full justify-between border-border bg-background/60 font-mono text-xs">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent position="popper">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

interface SliderPreset {
  value: number
  label: string
}

interface SettingSliderCardProps {
  icon?: React.ElementType
  title: string
  description?: string
  badgeText: string
  value: number
  min: number
  max: number
  step: number
  decimals?: number
  onValueChange: (val: number) => void
  presets: SliderPreset[]
}

function SettingSliderCard({
  icon: Icon,
  title,
  description,
  badgeText,
  value,
  min,
  max,
  step,
  decimals = 1,
  onValueChange,
  presets,
}: SettingSliderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
          {Icon && <Icon className="size-4 text-primary" />}
          <span>{title}</span>
        </CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
        <CardAction>
          <Badge
            variant="primary-outline"
            className="font-mono text-xs uppercase"
          >
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(val) => {
            if (val[0] !== undefined)
              onValueChange(Number(val[0].toFixed(decimals)))
          }}
          className="py-1"
        />
        <div className="flex justify-between gap-1 pt-1">
          {presets.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => onValueChange(p.value)}
              className={cn(
                "flex-1 cursor-pointer border py-1 text-center font-mono text-tiny transition-colors",
                value === p.value
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
              )}
            >
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SelectionCheckIndicator({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
        <Check className="size-3 stroke-[2.5]" />
      </div>
    )
  }
  return (
    <div className="size-4.5 shrink-0 rounded-full border border-border group-hover:border-primary/40" />
  )
}

function getProviderIcon(id: WeatherDataSource) {
  switch (id) {
    case "open-meteo":
      return <CloudLightning className="size-3.5 text-sky-500" />
    case "openweathermap":
      return <Globe className="size-3.5 text-amber-500" />
    case "simulation":
      return <Cpu className="size-3.5 text-purple-500" />
    case "auto":
      return <ShieldCheck className="size-3.5 text-emerald-500" />
    default:
      return <Server className="size-3.5 text-primary" />
  }
}

// ============================================================================
// TAB CONTENT COMPONENTS
// ============================================================================

interface TabBaseProps {
  settings: ExtendedSettings
  onUpdateSettings: (newSettings: Partial<ExtendedSettings>) => void
}

/** TAB 1: SOURCE & STATION */
function SourceTabContent({ settings, onUpdateSettings }: TabBaseProps) {
  const [showKey, setShowKey] = useState(false)
  const [testPingStatus, setTestPingStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle")
  const [testPingMsg, setTestPingMsg] = useState("")

  const handleTestApiKey = async () => {
    setTestPingStatus("loading")
    setTestPingMsg("Connecting to OpenWeather station...")
    try {
      const keyToTest = settings.customApiKey?.trim() || ""
      const url = keyToTest
        ? `/api/weather?city=London&source=openweathermap&apiKey=${encodeURIComponent(keyToTest)}`
        : `/api/weather?city=London&source=openweathermap`
      const res = await fetch(url)
      if (res.ok) {
        const json = await res.json()
        if (
          json.providerName?.includes("Failover") ||
          json.stationName?.includes("Failover")
        ) {
          setTestPingStatus("error")
          setTestPingMsg(
            "Authentication failed. Please verify your OpenWeather API key."
          )
        } else {
          setTestPingStatus("success")
          setTestPingMsg(
            `Handshake Verified! Live telemetry: ${json.current?.cityName || "London"} (${json.current?.temp}°C, ${json.current?.humidity}% humidity).`
          )
        }
      } else {
        setTestPingStatus("error")
        setTestPingMsg(`API responded with HTTP ${res.status}.`)
      }
    } catch {
      setTestPingStatus("error")
      setTestPingMsg("Network or gateway timeout testing station.")
    }
  }

  const activeForecastModel =
    FORECAST_STATION_MODELS.find(
      (m) => m.id === (settings.forecastStation || "best_match")
    ) || FORECAST_STATION_MODELS[0]

  return (
    <Card>
      <CardHeader>
        <Alert
          variant="default"
          className="flex flex-wrap items-center justify-between gap-3 border-border bg-card p-3.5 shadow-xs"
        >
          <div className="flex items-center gap-3">
            <Dot variant="success" size="lg" pulse />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-xs font-semibold tracking-tight text-foreground uppercase">
                  Active Telemetry Feed
                </span>
                <Badge variant="success-outline">LIVE</Badge>
              </div>
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                Real-time atmospheric modeling & observation synchronizer
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <Badge
              variant="secondary"
              className="font-semibold tracking-wider uppercase"
            >
              {settings.weatherSource}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <span className="font-sans text-xs text-muted-foreground">
              Model:{" "}
              <strong className="font-mono text-foreground">
                {activeForecastModel.name}
              </strong>
            </span>
          </div>
        </Alert>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SECTION 1: METEOROLOGICAL DATA PROVIDER */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Server className="size-4 text-primary" />
              <span>Meteorological Data Provider (Source)</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select the observation and primary synoptic data provider
            </CardDescription>
            <CardAction>
              <Badge
                variant="primary-outline"
                className="font-mono text-xs uppercase"
              >
                {settings.weatherSource || "open-meteo"}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ToggleGroup
              type="single"
              orientation="horizontal"
              className="flex-col sm:flex-row"
              value={settings.weatherSource || "open-meteo"}
              onValueChange={(val) => {
                if (val)
                  onUpdateSettings({ weatherSource: val as WeatherDataSource })
              }}
              spacing={0}
            >
              {WEATHER_DATA_PROVIDERS.map((provider) => {
                const isSelected =
                  (settings.weatherSource || "open-meteo") === provider.id
                return (
                  <ToggleGroupItem
                    key={provider.id}
                    value={provider.id}
                    className={cn(
                      "group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden p-2.5 text-left whitespace-normal transition-all sm:flex-1",
                      isSelected && "bg-primary/5 data-[state=on]:bg-primary/5"
                    )}
                  >
                    {/* Card Info */}
                    <div className="w-full">
                      <div className="flex items-start justify-between gap-1.5">
                        <div className="flex min-w-0 items-center gap-2">
                          <div
                            className={cn(
                              "flex size-6 shrink-0 items-center justify-center border transition-colors",
                              isSelected
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground"
                            )}
                          >
                            {getProviderIcon(provider.id)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="truncate font-heading text-xs font-semibold text-foreground">
                              {provider.name}
                            </div>
                            <div className="truncate font-mono text-nano text-muted-foreground">
                              {provider.provider}
                            </div>
                          </div>
                        </div>
                        <SelectionCheckIndicator isSelected={isSelected} />
                      </div>

                      <p className="mt-1.5 line-clamp-2 font-mono text-nano leading-tight text-muted-foreground">
                        {provider.description}
                      </p>
                    </div>

                    {/* Footer Profile Badge */}
                    <div className="mt-2 flex w-full items-center justify-between">
                      <Badge
                        variant={isSelected ? "primary-light" : "outline"}
                        size="xs"
                        className="h-4 px-1.5 py-0 font-mono text-nano tracking-wider uppercase"
                      >
                        {provider.requiresApiKey
                          ? "API Key Required"
                          : "Keyless"}
                      </Badge>
                    </div>
                  </ToggleGroupItem>
                )
              })}
            </ToggleGroup>
          </CardContent>
        </Card>

        {(settings.weatherSource === "openweathermap" ||
          settings.customApiKey) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Key className="size-4 text-primary" />
                <span>OpenWeatherMap API Key</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Leave blank to use the shared server environment key, or provide
                a personal key for dedicated quota.
              </CardDescription>
              <CardAction>
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {settings.customApiKey?.trim()
                    ? "Custom Set"
                    : "Server Shared"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-3">
              <InputGroup className="h-8">
                <InputGroupInput
                  type={showKey ? "text" : "password"}
                  value={settings.customApiKey || ""}
                  onChange={(e) =>
                    onUpdateSettings({ customApiKey: e.target.value })
                  }
                  placeholder="e.g. 4483c686af6e2e21072d875ed1e5be27"
                  className="font-mono text-xs"
                />
                <InputGroupAddon align="inline-end" className="px-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="cursor-pointer p-1 text-muted-foreground transition-colors hover:text-foreground"
                    title={showKey ? "Hide key" : "Show key"}
                  >
                    {showKey ? (
                      <EyeOff className="size-3.5" />
                    ) : (
                      <Eye className="size-3.5" />
                    )}
                  </button>
                </InputGroupAddon>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestApiKey}
                  disabled={testPingStatus === "loading"}
                  className="h-full shrink-0 gap-1.5 rounded-none border-y-0 border-r-0 border-l border-border px-3 font-mono text-xs"
                >
                  <RefreshCw
                    className={cn(
                      "size-3",
                      testPingStatus === "loading" &&
                        "animate-spin text-primary"
                    )}
                  />
                  <span>Test Handshake</span>
                </Button>
              </InputGroup>

              {testPingMsg && (
                <Alert
                  variant={
                    testPingStatus === "success" ? "success" : "destructive"
                  }
                  className="mt-1 py-2 text-xs"
                >
                  <AlertTitle className="text-xs font-semibold">
                    {testPingStatus === "success"
                      ? "Handshake Verified"
                      : "Authentication Failure"}
                  </AlertTitle>
                  <AlertDescription className="mt-0.5 text-xs">
                    {testPingMsg}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Cpu className="size-4 text-primary" />
              <span>Numerical Weather Prediction (NWP) Forecast Station</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Choose the atmospheric physics simulation station model for
              forecasting
            </CardDescription>
            <CardAction>
              <Badge
                variant="primary-outline"
                className="font-mono text-xs uppercase"
              >
                {activeForecastModel.name}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="space-y-3">
            {settings.weatherSource === "openweathermap" && (
              <Alert variant="warning" className="py-2 text-xs">
                <AlertTitle className="text-xs font-semibold">
                  Station Model Notice
                </AlertTitle>
                <AlertDescription className="mt-0.5 text-xs">
                  OpenWeatherMap uses OWM Station Consensus. Model selection
                  below applies when Open-Meteo or Auto Failover is active.
                </AlertDescription>
              </Alert>
            )}

            <Select
              value={settings.forecastStation || "best_match"}
              onValueChange={(val) => {
                if (val)
                  onUpdateSettings({
                    forecastStation: val as ForecastStationModel,
                  })
              }}
            >
              <SelectTrigger className="h-9 w-full justify-between border-border bg-background/60 font-mono text-xs">
                <SelectValue placeholder="Select NWP Station Model" />
              </SelectTrigger>
              <SelectContent position="popper" className="max-h-80">
                {FORECAST_STATION_MODELS.map((model) => (
                  <SelectItem
                    key={model.id}
                    value={model.id}
                    textValue={`${model.name} (${model.resolution})`}
                    className="py-2"
                  >
                    <div className="flex flex-col gap-0.5 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-xs font-semibold text-foreground">
                          {model.name}
                        </span>
                        <Badge
                          variant="outline"
                          size="xs"
                          className="h-3.5 bg-muted/30 px-1 py-0 font-mono text-[9px]"
                        >
                          {model.resolution}
                        </Badge>
                        <span className="font-mono text-nano text-muted-foreground">
                          • {model.coverage}
                        </span>
                      </div>
                      <div className="font-mono text-nano text-muted-foreground">
                        {model.agency}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeForecastModel && (
              <div className="border border-border/70 bg-muted/20 p-2.5 font-mono text-tiny text-muted-foreground">
                <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-border/40 pb-1">
                  <span className="font-semibold text-foreground">
                    {activeForecastModel.agency}
                  </span>
                  <span className="font-mono text-[10px] text-primary">
                    {activeForecastModel.resolution} •{" "}
                    {activeForecastModel.coverage}
                  </span>
                </div>
                <p className="mt-1 text-nano leading-relaxed text-muted-foreground">
                  {activeForecastModel.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}

/** TAB 2: UNITS */

interface UnitsTabProps extends TabBaseProps {
  currentTemp?: number
}

function UnitsTabContent({
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
  const tempConversion = isCelsius
    ? `${cVal}°C = ${fVal}°F`
    : `${fVal}°F = ${cVal}°C`

  const isMetric = matchesUnitPreset(settings, METRIC_UNIT_PRESET)
  const isImperial = matchesUnitPreset(settings, IMPERIAL_UNIT_PRESET)
  const activePreset: UnitPresetId | "" = isMetric
    ? "metric"
    : isImperial
      ? "imperial"
      : ""

  const applyPreset = (presetId: UnitPresetId) => {
    onUpdateSettings(UNIT_PRESETS[presetId].units)
  }

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
              {Object.values(UNIT_PRESETS).map((preset) => {
                const isSelected = activePreset === preset.id
                return (
                  <ToggleGroupItem
                    key={preset.id}
                    value={preset.id}
                    className={cn(
                      "w-fit cursor-pointer transition-all",
                      isSelected && "bg-primary/5 data-[state=on]:bg-primary/5"
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
          badgeExtra={
            <span className="font-mono text-xs text-muted-foreground">
              {tempConversion}
            </span>
          }
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

/** TAB 3: FAVORITES */
interface FavoritesTabProps {
  pinnedCities: string[]
  onAddPinnedCity: (city: string) => void
  onRemovePinnedCity: (city: string) => void
  onSelectCity: (city: string) => void
  onCloseDialog: () => void
}

function FavoritesTabContent({
  pinnedCities,
  onAddPinnedCity,
  onRemovePinnedCity,
  onSelectCity,
  onCloseDialog,
}: FavoritesTabProps) {
  const [newCityInput, setNewCityInput] = useState("")

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault()
    if (newCityInput.trim()) {
      onAddPinnedCity(newCityInput.trim())
      setNewCityInput("")
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <MapPin className="size-4 text-primary" />
            <span>Pinned Weather Stations</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Quick-access telemetry stations saved for rapid switching from the
            top telemetry header.
          </CardDescription>
          <CardAction>
            <Badge
              variant="primary-outline"
              className="font-mono text-xs uppercase"
            >
              {pinnedCities.length} Pinned
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleAddCity} className="flex gap-2">
            <div className="relative flex-1">
              <MapPin className="absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={newCityInput}
                onChange={(e) => setNewCityInput(e.target.value)}
                placeholder="Enter city or airport name (e.g. Madrid, Sydney, Zurich)..."
                className="h-8 pl-8 font-sans text-xs"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-3 text-xs"
            >
              <Plus className="size-3.5" />
              <span>Pin Station</span>
            </Button>
          </form>

          {/* Quick suggestions */}
          <div className="pt-1">
            <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
              Popular Meteorological Stations:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CITIES.filter((c) => !pinnedCities.includes(c))
                .slice(0, 6)
                .map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => onAddPinnedCity(city)}
                    className="flex cursor-pointer items-center gap-1 border border-border bg-muted/40 px-2 py-0.5 text-tiny text-foreground transition-colors hover:bg-muted"
                  >
                    <Plus className="size-2.5 text-muted-foreground" />
                    <span>{city}</span>
                  </button>
                ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* List of Pinned Cities */}
      <div className="space-y-2">
        {pinnedCities.length === 0 ? (
          <Empty className="rounded-lg border border-dashed border-border bg-card/40 py-8">
            <EmptyHeader>
              <EmptyMedia>
                <IconStack
                  aria-hidden="true"
                  className="h-20 w-18 text-primary"
                >
                  <MapPin className="size-4 text-primary" />
                </IconStack>
              </EmptyMedia>
              <EmptyTitle>No Pinned Stations</EmptyTitle>
              <EmptyDescription>
                Add frequent locations or research observatories above for
                instant one-click synoptic access.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          pinnedCities.map((cityName) => (
            <Card
              key={cityName}
              className="flex items-center justify-between border border-border bg-card p-3 transition-colors hover:border-border/80"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                  <MapPin className="size-3.5" />
                </div>
                <div>
                  <div className="font-heading text-xs font-semibold text-foreground">
                    {cityName}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    Ground Station Telemetry
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => {
                    onSelectCity(cityName)
                    onCloseDialog()
                  }}
                  className="h-7 gap-1 px-2.5 font-mono text-xs"
                >
                  <Radio className="size-3 text-primary" />
                  <span>Load Station</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemovePinnedCity(cityName)}
                  className="h-7 w-7 rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Remove from favorites"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  )
}

const subscribeToClock = (callback: () => void) => {
  const timer = setInterval(callback, 1000)
  return () => clearInterval(timer)
}

function useLiveTime(): Date | null {
  const seconds = React.useSyncExternalStore(
    subscribeToClock,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  return seconds !== null ? new Date(seconds * 1000) : null
}

/** Helpers for generating distinctive voice preview lines */
function getGoogleModelPreviewText(
  model: GoogleTtsModel,
  lang: string
): string {
  const modelInfo = GOOGLE_TTS_MODELS.find((m) => m.id === model)
  const langConfig =
    REGIONAL_LANGUAGES.find(
      (l) => l.code === (lang || "en").split("-")[0].toLowerCase()
    ) || REGIONAL_LANGUAGES[0]

  const modelLabel = modelInfo ? `${modelInfo.name} (${modelInfo.badge})` : model
  return `${modelLabel}: ${langConfig.speechPreviewText}`
}

function getGoogleVoicePreviewText(
  voice: GoogleTtsVoiceInfo,
  lang: string
): string {
  const langConfig =
    REGIONAL_LANGUAGES.find(
      (l) =>
        l.code ===
        (lang || voice.languageCode || "en").split("-")[0].toLowerCase()
    ) || REGIONAL_LANGUAGES[0]

  return `${voice.name}. ${voice.description}. ${langConfig.speechPreviewText}`
}

/** TAB 4: REGIONAL */
function RegionalTabContent({ settings, onUpdateSettings }: TabBaseProps) {
  const { t } = useTranslation()
  const currentTime = useLiveTime()
  const now = currentTime || new Date()
  const currentLang =
    REGIONAL_LANGUAGES.find((l) => l.code === settings.language) ||
    REGIONAL_LANGUAGES[0]

  const zuluDate = new Date(now.getTime() + now.getTimezoneOffset() * 60000)
  const zuluTime = format(zuluDate, "HH:mm:ss'Z'")
  const liveTime24 = format(now, "HH:mm:ss")
  const liveTime12 = format(now, "hh:mm:ss a")

  const activeDateFormat =
    DATE_FORMAT_OPTIONS.find((opt) => opt.id === settings.dateFormat) ||
    DATE_FORMAT_OPTIONS[0]
  const datePreview = format(now, activeDateFormat.dateFnsPattern)

  const handleSelectLanguage = (val: string) => {
    if (!val) return
    const availableVoices = getAvailableGoogleVoices(val)
    const defaultVoice = availableVoices[0]
    onUpdateSettings({
      language: val,
      ...(defaultVoice
        ? {
            googleTtsVoice: defaultVoice.id,
            googleTtsModel: defaultVoice.model,
          }
        : {}),
    })
  }

  return (
    <Card>
      <CardHeader>
        <Alert variant="default" className="flex items-center gap-3">
          <Dot variant="success" size="lg" pulse />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-xs font-semibold tracking-tight text-foreground uppercase">
                {t.settingsDialog.regional.headerTitle}
              </span>
            </div>
            <div className="text-tiny text-muted-foreground">
              {t.settingsDialog.regional.headerSubtitle}
            </div>
          </div>
        </Alert>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {/* 1. Language & Regional Dialect */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Languages className="size-4 text-primary" />
                <span>{t.settingsDialog.regional.langTitle}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t.settingsDialog.regional.langDesc}
              </CardDescription>
              <CardAction>
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {currentLang.flag} {settings.language.toUpperCase()}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select
                value={settings.language}
                onValueChange={handleSelectLanguage}
              >
                <SelectTrigger className="w-full justify-between font-mono text-xs">
                  <SelectValue
                    placeholder={
                      t.settingsDialog.regional.selectLanguagePlaceholder ||
                      "Select Language"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {REGIONAL_LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span className="flex items-center gap-2 font-mono">
                        <span>{lang.flag}</span>
                        <span className="font-semibold text-foreground">
                          {lang.label}
                        </span>
                        <span className="text-tiny text-muted-foreground">
                          ({lang.region})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Badge
                variant="outline"
                className="h-auto w-full justify-start truncate border-border/60 bg-muted/20 px-2.5 py-1.5 font-mono text-tiny font-normal text-muted-foreground"
              >
                <strong className="font-semibold text-foreground">
                  {currentLang.weatherConditionSample}
                </strong>
              </Badge>
            </CardContent>
          </Card>

          {/* 2. Time Representation & Chronometry */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Clock className="size-4 text-primary" />
                <span>{t.settingsDialog.regional.timeTitle}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t.settingsDialog.regional.timeDesc}
              </CardDescription>
              <CardAction>
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {settings.timeFormat.toUpperCase()}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select
                value={settings.timeFormat}
                onValueChange={(val) => {
                  if (val)
                    onUpdateSettings({ timeFormat: val as TimeFormat })
                }}
              >
                <SelectTrigger className="h-8.5 w-full justify-between border-border bg-background/60 font-mono text-xs">
                  <SelectValue placeholder="Select Time Format" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="24h">
                    <span className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-foreground">
                        {t.settingsDialog.regional.time24Label}
                      </span>
                      <span className="text-tiny text-muted-foreground">
                        ({t.settingsDialog.regional.time24Desc})
                      </span>
                    </span>
                  </SelectItem>
                  <SelectItem value="12h">
                    <span className="flex items-center gap-2 font-mono">
                      <span className="font-semibold text-foreground">
                        {t.settingsDialog.regional.time12Label}
                      </span>
                      <span className="text-tiny text-muted-foreground">
                        ({t.settingsDialog.regional.time12Desc})
                      </span>
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between border border-border/60 bg-muted/20 px-2.5 py-1.5 font-mono text-tiny text-muted-foreground">
                <span>
                  {t.settingsDialog.regional.clock || "Clock"}:{" "}
                  <strong className="font-bold tracking-wider text-foreground">
                    {settings.timeFormat === "24h" ? liveTime24 : liveTime12}
                  </strong>
                </span>
                <span>
                  {t.settingsDialog.regional.zulu || "Zulu"}:{" "}
                  <strong className="text-foreground">{zuluTime}</strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 3. Date Display Standard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Calendar className="size-4 text-primary" />
                <span>{t.settingsDialog.regional.dateTitle}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t.settingsDialog.regional.dateDesc}
              </CardDescription>
              <CardAction>
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {settings.dateFormat?.toUpperCase() || "ISO"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select
                value={settings.dateFormat || "iso"}
                onValueChange={(val) => {
                  if (val)
                    onUpdateSettings({
                      dateFormat: val as DateFormatOption,
                    })
                }}
              >
                <SelectTrigger className="h-8.5 w-full justify-between border-border bg-background/60 font-mono text-xs">
                  <SelectValue placeholder="Select Date Format" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {DATE_FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      <span className="flex items-center gap-2 font-mono">
                        <span className="font-semibold text-foreground">
                          {opt.label}
                        </span>
                        <span className="text-tiny text-muted-foreground">
                          ({opt.format})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between border border-border/60 bg-muted/20 px-2.5 py-1.5 font-mono text-tiny text-muted-foreground">
                <span>
                  Pattern:{" "}
                  <strong className="text-foreground">
                    {activeDateFormat.format}
                  </strong>
                </span>
                <span>
                  Preview:{" "}
                  <strong className="text-foreground">
                    {datePreview}
                  </strong>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 4. Coordinate & Geodetic Notation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Compass className="size-4 text-primary" />
                <span>{t.settingsDialog.regional.coordTitle}</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                {t.settingsDialog.regional.coordDesc}
              </CardDescription>
              <CardAction>
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {settings.coordinateFormat === "dms" ? "DMS" : "DD"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-2">
              <Select
                value={settings.coordinateFormat || "decimal"}
                onValueChange={(val) => {
                  if (val)
                    onUpdateSettings({
                      coordinateFormat: val as CoordinateFormatOption,
                    })
                }}
              >
                <SelectTrigger className="h-8.5 w-full justify-between border-border bg-background/60 font-mono text-xs">
                  <SelectValue placeholder="Select Coordinate Format" />
                </SelectTrigger>
                <SelectContent position="popper">
                  {COORDINATE_FORMAT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      <span className="flex items-center gap-2 font-mono">
                        <span className="font-semibold text-foreground">
                          {opt.label}
                        </span>
                        <span className="text-tiny text-muted-foreground">
                          ({opt.example})
                        </span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center justify-between border border-border/60 bg-muted/20 px-2.5 py-1.5 font-mono text-tiny text-muted-foreground">
                <span>
                  System:{" "}
                  <strong className="text-foreground">
                    {COORDINATE_FORMAT_OPTIONS.find(
                      (opt) =>
                        opt.id ===
                        (settings.coordinateFormat ||
                          COORDINATE_FORMAT_OPTIONS[0].id)
                    )?.subtitle || COORDINATE_FORMAT_OPTIONS[0].subtitle}
                  </strong>
                </span>
                <span>
                  Sample:{" "}
                  <strong className="text-foreground">
                    {COORDINATE_FORMAT_OPTIONS.find(
                      (opt) =>
                        opt.id ===
                        (settings.coordinateFormat ||
                          COORDINATE_FORMAT_OPTIONS[0].id)
                    )?.example || COORDINATE_FORMAT_OPTIONS[0].example}
                  </strong>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

/** TAB 5: SPEECH & AUDIO */

interface VoicePlayButtonProps extends Omit<
  React.ComponentProps<typeof Button>,
  "onClick" | "children" | "size"
> {
  isPlaying: boolean
  label: string
  onTogglePlay: () => void
  size?: React.ComponentProps<typeof Button>["size"] | "sm" | "md"
}

/** Reusable interactive Play / Stop button for speech auditioning */
function VoicePlayButton({
  isPlaying,
  label,
  onTogglePlay,
  size = "icon-sm",
  variant,
  className,
  ...props
}: VoicePlayButtonProps) {
  const Icon = isPlaying ? Square : Play
  const action = isPlaying ? "Stop" : "Play"
  const buttonSize =
    size === "md" ? "icon-sm" : size === "sm" ? "icon-xs" : size

  return (
    <Button
      asChild
      variant={variant ?? (isPlaying ? "default" : "outline")}
      size={buttonSize}
      className={cn(
        "shrink-0 shadow-2xs transition-all select-none cursor-pointer",
        isPlaying
          ? "animate-pulse shadow-xs ring-2 ring-primary/40"
          : "border-border/80 bg-background/80 text-foreground group-hover:border-primary/40 hover:scale-105 hover:border-primary hover:bg-primary/15 hover:text-primary active:scale-95",
        className
      )}
      {...props}
    >
      <span
        role="button"
        tabIndex={0}
        aria-label={`${action} ${label}`}
        title={`${action} preview (${label})`}
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          onTogglePlay()
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.stopPropagation()
            e.preventDefault()
            onTogglePlay()
          }
        }}
      >
        <Icon
          className={cn(
            "fill-current",
            buttonSize === "icon-xs" ? "size-2.5" : "size-3",
            !isPlaying && "ml-0.5 text-primary group-hover:text-primary"
          )}
        />
      </span>
    </Button>
  )
}

function SpeechTabContent({ settings, onUpdateSettings }: TabBaseProps) {
  const configMode = settings.speechConfigMode || "basic"
  const [genderFilter, setGenderFilter] = useState<"all" | "FEMALE" | "MALE">(
    "all"
  )
  const [previewingId, setPreviewingId] = useState<string | null>(null)

  // Clean up any ongoing speech synthesis when unmounting or switching tabs
  useEffect(() => {
    return () => {
      WeatherSpeechSynthesizer.stop()
    }
  }, [])

  const handleStopPreview = () => {
    WeatherSpeechSynthesizer.stop()
    setPreviewingId(null)
  }

  const handleSwitchMode = (mode: "basic" | "advanced") => {
    onUpdateSettings({ speechConfigMode: mode })
  }

  const handleTogglePreviewModel = async (modelId: GoogleTtsModel) => {
    const id = `model:${modelId}`
    if (previewingId === id) {
      handleStopPreview()
      return
    }

    WeatherSpeechSynthesizer.stop()
    setPreviewingId(id)

    // Find the primary representative voice for this model in the selected language
    const available = getAvailableGoogleVoices(settings.language, modelId)
    const voice = available[0] || getAvailableGoogleVoices("en", modelId)[0]
    const voiceName =
      voice?.id ||
      GOOGLE_TTS_VOICES.find((v) => v.model === modelId)?.id ||
      GOOGLE_TTS_VOICES[0]?.id ||
      "en-US-Journey-F"
    const sampleText = getGoogleModelPreviewText(modelId, settings.language)

    await WeatherSpeechSynthesizer.speak(sampleText, {
      rate: settings.speechRate,
      pitch: settings.googleTtsPitch,
      lang: voice?.languageCode || settings.language,
      voiceName,
      model: modelId,
      audioProfile: settings.googleTtsAudioProfile,
      volumeGainDb: settings.googleTtsVolumeGain,
      googleApiKey: settings.googleApiKey,
      onStart: () => setPreviewingId(id),
      onEnd: () => setPreviewingId((curr) => (curr === id ? null : curr)),
      onError: () => setPreviewingId((curr) => (curr === id ? null : curr)),
    })
  }

  const handleTogglePreviewVoice = async (voice: GoogleTtsVoiceInfo) => {
    const id = `voice:${voice.id}`
    if (previewingId === id) {
      handleStopPreview()
      return
    }

    WeatherSpeechSynthesizer.stop()
    setPreviewingId(id)

    const sampleText = getGoogleVoicePreviewText(voice, settings.language)

    await WeatherSpeechSynthesizer.speak(sampleText, {
      rate: settings.speechRate,
      pitch: settings.googleTtsPitch,
      lang: voice.languageCode || settings.language,
      voiceName: voice.id,
      model: voice.model,
      audioProfile: settings.googleTtsAudioProfile,
      volumeGainDb: settings.googleTtsVolumeGain,
      googleApiKey: settings.googleApiKey,
      onStart: () => setPreviewingId(id),
      onEnd: () => setPreviewingId((curr) => (curr === id ? null : curr)),
      onError: () => setPreviewingId((curr) => (curr === id ? null : curr)),
    })
  }

  const allVoicesForLang = getAvailableGoogleVoices(settings.language)
  const basicVoices =
    genderFilter === "all"
      ? allVoicesForLang
      : allVoicesForLang.filter((v) => v.gender === genderFilter)

  const advancedVoices = getAvailableGoogleVoices(
    settings.language,
    settings.googleTtsModel
  )

  return (
    <>
      {/* Engine Header & Configuration Mode Switcher */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              <span>Google Text-to-Speech Engine</span>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 font-mono text-tiny text-emerald-600 dark:text-emerald-400"
              >
                ONLINE
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {configMode === "basic"
                ? "Streamlined voice persona selection & essential playback settings."
                : "Deep neural synthesis architectures, transducer EQ curves, and acoustic modulation."}
            </CardDescription>
          </div>
          <CardAction className="flex items-center gap-2">
            {previewingId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleStopPreview}
                className="h-7 shrink-0 animate-pulse gap-1.5 border-primary/40 bg-primary/10 px-2.5 font-mono text-xs text-primary shadow-2xs transition-all hover:bg-primary/20"
              >
                <Square className="size-2.5 fill-current" />
                <span>Stop</span>
              </Button>
            )}
            <ToggleGroup
              type="single"
              value={configMode}
              onValueChange={(val) => {
                if (val) handleSwitchMode(val as "basic" | "advanced")
              }}
              className="h-7 shrink-0 rounded-md border border-border bg-muted/60 p-0.5"
            >
              <ToggleGroupItem
                value="basic"
                className={cn(
                  "h-6 cursor-pointer gap-1.5 px-2.5 font-heading text-tiny font-medium transition-all select-none",
                  configMode === "basic" &&
                    "bg-background font-semibold text-foreground shadow-2xs"
                )}
              >
                <Sliders className="size-3 text-primary" />
                <span>Basic</span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="advanced"
                className={cn(
                  "h-6 cursor-pointer gap-1.5 px-2.5 font-heading text-tiny font-medium transition-all select-none",
                  configMode === "advanced" &&
                    "bg-background font-semibold text-foreground shadow-2xs"
                )}
              >
                <Cpu className="size-3 text-primary" />
                <span>Advanced</span>
              </ToggleGroupItem>
            </ToggleGroup>
          </CardAction>
        </CardHeader>
      </Card>

      {/* ========================================================================= */}
      {/* BASIC CONFIGURATION LAYOUT */}
      {/* ========================================================================= */}
      {configMode === "basic" ? (
        <>
          {/* Voice Persona & Character with Play Icon Buttons */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-1">
                <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                  <Volume2 className="size-4 text-primary" />
                  <span>Voice Persona & Synoptic Cadence</span>
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Audition and select speech narrator timbre and personality for
                  live weather reports.
                </CardDescription>
              </div>
              <CardAction className="flex items-center gap-2">
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {settings.googleTtsVoice}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              {/* Gender quick filter */}
              <div className="mb-3 flex items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                <span className="font-mono text-tiny text-muted-foreground">
                  Narrator Profile:
                </span>
                <div className="flex items-center gap-1">
                  {(["all", "FEMALE", "MALE"] as const).map((g) => {
                    const count =
                      g === "all"
                        ? allVoicesForLang.length
                        : allVoicesForLang.filter((v) => v.gender === g).length
                    const isActive = genderFilter === g
                    return (
                      <Button
                        key={g}
                        type="button"
                        variant={isActive ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => setGenderFilter(g)}
                        className={cn(
                          "h-6 cursor-pointer px-2 font-mono text-tiny transition-all",
                          isActive &&
                            "bg-primary/15 font-semibold text-primary shadow-2xs"
                        )}
                      >
                        {g === "all"
                          ? "All"
                          : g === "FEMALE"
                            ? "Female"
                            : "Male"}{" "}
                        ({count})
                      </Button>
                    )
                  })}
                </div>
              </div>

              <ToggleGroup
                type="single"
                value={settings.googleTtsVoice}
                onValueChange={(val) => {
                  if (val) {
                    const voice = allVoicesForLang.find((v) => v.id === val)
                    onUpdateSettings({
                      googleTtsVoice: val,
                      ...(voice?.model ? { googleTtsModel: voice.model } : {}),
                    })
                  }
                }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {basicVoices.map((v) => {
                  const isSelected = settings.googleTtsVoice === v.id
                  const isPlaying = previewingId === `voice:${v.id}`
                  return (
                    <ToggleGroupItem
                      key={v.id}
                      value={v.id}
                      className={cn(
                        "group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden p-3 text-left whitespace-normal transition-all",
                        isSelected &&
                          "bg-primary/5 data-[state=on]:bg-primary/5",
                        isPlaying && "ring-1 ring-primary/50"
                      )}
                    >
                      <div className="w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <VoicePlayButton
                              isPlaying={isPlaying}
                              label={`${v.name} voice`}
                              onTogglePlay={() => handleTogglePreviewVoice(v)}
                            />
                            <div>
                              <div className="font-heading text-xs font-semibold text-nowrap text-foreground">
                                {v.name}
                              </div>
                              <div className="font-mono text-tiny text-nowrap text-muted-foreground">
                                {v.accent}
                              </div>
                            </div>
                          </div>
                          <SelectionCheckIndicator isSelected={isSelected} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-tiny leading-relaxed text-muted-foreground">
                          {v.description}
                        </p>
                      </div>
                      <div className="mt-2 flex w-full items-center justify-between font-mono text-tiny">
                        <Badge
                          variant={isSelected ? "primary-light" : "outline"}
                          className="font-mono text-tiny tracking-wider uppercase"
                        >
                          {v.gender}
                        </Badge>
                        <div className="flex items-center gap-1.5 font-mono text-tiny">
                          {isPlaying ? (
                            <span className="flex animate-pulse items-center gap-1 text-primary">
                              <Volume2 className="size-3 shrink-0" />
                              <span>Playing</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {v.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            </CardContent>
          </Card>

          {/* Speech Velocity */}
          <SettingSliderCard
            icon={Volume2}
            title="Speech Velocity"
            description="Narration playback speed rate"
            badgeText={`${settings.speechRate.toFixed(2)}x`}
            value={settings.speechRate}
            min={0.6}
            max={1.6}
            step={0.05}
            decimals={2}
            onValueChange={(speechRate) => onUpdateSettings({ speechRate })}
            presets={[
              { value: 0.8, label: "0.8x" },
              { value: 1.0, label: "1.0x" },
              { value: 1.2, label: "1.2x" },
              { value: 1.4, label: "1.4x" },
            ]}
          />

          {/* Automatic Audio Briefing Switch */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Volume2 className="size-4 text-primary" />
                <Label
                  htmlFor="auto-briefing-switch-basic"
                  className="cursor-pointer font-heading text-xs font-semibold text-foreground"
                >
                  Automatic Audio Meteorological Briefing
                </Label>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Read aloud synopsis automatically via Google Neural TTS upon
                station selection or initialization.
              </CardDescription>
              <CardAction>
                <Switch
                  id="auto-briefing-switch-basic"
                  checked={settings.autoSpeakOnLoad}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ autoSpeakOnLoad: checked })
                  }
                />
              </CardAction>
            </CardHeader>
          </Card>

          {/* Switch to Advanced Banner */}
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border/80 bg-muted/20 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded border border-border bg-background/80 text-muted-foreground">
                <Cpu className="size-3.5 text-primary" />
              </div>
              <div>
                <div className="font-heading text-xs font-medium text-foreground">
                  Need deeper acoustic engineering?
                </div>
                <p className="text-tiny text-muted-foreground">
                  Switch to Advanced to configure neural architecture models,
                  pitch semitones, decibel gain, and transducer EQ profiles.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSwitchMode("advanced")}
              className="h-7 shrink-0 cursor-pointer gap-1.5 font-mono text-tiny shadow-2xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <span>Advanced Mode</span>
              <ArrowRight className="size-3" />
            </Button>
          </div>
        </>
      ) : (
        /* ========================================================================= */
        /* ADVANCED CONFIGURATION LAYOUT */
        /* ========================================================================= */
        <>
          {/* 1. Google Model Architecture */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Cpu className="size-4 text-primary" />
                <span>Google TTS Model Architecture</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Neural synthesis architecture family governing phrasing
                fidelity, intonation, and latency.
              </CardDescription>
              <CardAction>
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {settings.googleTtsModel?.toUpperCase() || "JOURNEY"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ToggleGroup
                type="single"
                value={settings.googleTtsModel || GOOGLE_TTS_MODELS[0].id}
                onValueChange={(val) => {
                  if (val) {
                    const newModel = val as GoogleTtsModel
                    const matchingVoices = getAvailableGoogleVoices(
                      settings.language,
                      newModel
                    )
                    const bestVoice =
                      matchingVoices[0]?.id || settings.googleTtsVoice
                    onUpdateSettings({
                      googleTtsModel: newModel,
                      googleTtsVoice: bestVoice,
                    })
                  }
                }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
              >
                {GOOGLE_TTS_MODELS.map((m) => {
                  const isSelected =
                    (settings.googleTtsModel || GOOGLE_TTS_MODELS[0].id) ===
                    m.id
                  const isPlaying = previewingId === `model:${m.id}`
                  return (
                    <ToggleGroupItem
                      key={m.id}
                      value={m.id}
                      className={cn(
                        "group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden p-3 text-left whitespace-normal transition-all",
                        isSelected &&
                          "bg-primary/5 data-[state=on]:bg-primary/5",
                        isPlaying && "ring-1 ring-primary/50"
                      )}
                    >
                      <div className="w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <VoicePlayButton
                              isPlaying={isPlaying}
                              label={`${m.name} model`}
                              onTogglePlay={() =>
                                handleTogglePreviewModel(m.id)
                              }
                            />
                            <div>
                              <div className="font-heading text-xs font-semibold text-nowrap text-foreground">
                                {m.name}
                              </div>
                              <div className="font-mono text-tiny text-nowrap text-muted-foreground">
                                {m.badge}
                              </div>
                            </div>
                          </div>
                          <SelectionCheckIndicator isSelected={isSelected} />
                        </div>
                        <p className="mt-2 line-clamp-3 text-tiny leading-relaxed text-muted-foreground">
                          {m.description}
                        </p>
                      </div>
                      <div className="mt-2 flex w-full items-center justify-between font-mono text-tiny">
                        <Badge
                          variant={isSelected ? "primary-light" : "outline"}
                          className="font-mono text-tiny tracking-wider uppercase"
                        >
                          {m.badge}
                        </Badge>
                        {isPlaying ? (
                          <span className="flex animate-pulse items-center gap-1 font-mono text-tiny text-primary">
                            <Volume2 className="size-3 shrink-0" />
                            <span className="hidden sm:inline">Playing</span>
                          </span>
                        ) : (
                          <span className="font-mono text-tiny text-muted-foreground">
                            {m.badge}
                          </span>
                        )}
                      </div>
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            </CardContent>
          </Card>

          {/* 2. Voice Persona & Character */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Volume2 className="size-4 text-primary" />
                <span>Voice Persona & Synoptic Cadence</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Filtered speech narrators for {settings.googleTtsModel}{" "}
                architecture.
              </CardDescription>
              <CardAction>
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {settings.googleTtsVoice}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ToggleGroup
                type="single"
                value={settings.googleTtsVoice}
                onValueChange={(val) => {
                  if (val) {
                    const voice = advancedVoices.find((v) => v.id === val)
                    onUpdateSettings({
                      googleTtsVoice: val,
                      ...(voice?.model ? { googleTtsModel: voice.model } : {}),
                    })
                  }
                }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2"
              >
                {advancedVoices.map((v) => {
                  const isSelected = settings.googleTtsVoice === v.id
                  const isPlaying = previewingId === `voice:${v.id}`
                  return (
                    <ToggleGroupItem
                      key={v.id}
                      value={v.id}
                      className={cn(
                        "group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden p-3 text-left whitespace-normal transition-all",
                        isSelected &&
                          "bg-primary/5 data-[state=on]:bg-primary/5",
                        isPlaying && "ring-1 ring-primary/50"
                      )}
                    >
                      <div className="w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <VoicePlayButton
                              isPlaying={isPlaying}
                              label={`${v.name} voice`}
                              onTogglePlay={() => handleTogglePreviewVoice(v)}
                            />
                            <div>
                              <div className="font-heading text-xs font-semibold text-nowrap text-foreground">
                                {v.name}
                              </div>
                              <div className="font-mono text-tiny text-nowrap text-muted-foreground">
                                {v.accent}
                              </div>
                            </div>
                          </div>
                          <SelectionCheckIndicator isSelected={isSelected} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-tiny leading-relaxed text-muted-foreground">
                          {v.description}
                        </p>
                      </div>
                      <div className="mt-2 flex w-full items-center justify-between font-mono text-tiny">
                        <Badge
                          variant={isSelected ? "primary-light" : "outline"}
                          className="font-mono text-tiny tracking-wider uppercase"
                        >
                          {v.gender}
                        </Badge>
                        <div className="flex items-center gap-1.5 font-mono text-tiny">
                          {isPlaying ? (
                            <span className="flex animate-pulse items-center gap-1 text-primary">
                              <Volume2 className="size-3 shrink-0" />
                              <span>Playing</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground">
                              {v.model}
                            </span>
                          )}
                        </div>
                      </div>
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            </CardContent>
          </Card>

          {/* 3. Speed, Pitch & Volume Modulation Matrix */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <SettingSliderCard
              icon={Volume2}
              title="Speech Velocity"
              description="Playback speed rate"
              badgeText={`${settings.speechRate.toFixed(2)}x`}
              value={settings.speechRate}
              min={0.6}
              max={1.6}
              step={0.05}
              decimals={2}
              onValueChange={(speechRate) => onUpdateSettings({ speechRate })}
              presets={[
                { value: 0.8, label: "0.8x" },
                { value: 1.0, label: "1x" },
                { value: 1.2, label: "1.2x" },
                { value: 1.4, label: "1.4x" },
              ]}
            />

            <SettingSliderCard
              icon={Sliders}
              title="Voice Pitch"
              description="Semitone tonal modulation"
              badgeText={`${
                settings.googleTtsPitch > 0
                  ? `+${settings.googleTtsPitch}`
                  : settings.googleTtsPitch
              } st`}
              value={settings.googleTtsPitch}
              min={-6}
              max={6}
              step={0.5}
              decimals={1}
              onValueChange={(googleTtsPitch) =>
                onUpdateSettings({ googleTtsPitch })
              }
              presets={GOOGLE_TTS_PITCH_PRESETS}
            />

            <SettingSliderCard
              icon={Volume2}
              title="Volume Gain"
              description="Acoustic output decibels"
              badgeText={`${
                settings.googleTtsVolumeGain > 0
                  ? `+${settings.googleTtsVolumeGain}`
                  : settings.googleTtsVolumeGain
              } dB`}
              value={settings.googleTtsVolumeGain}
              min={-6}
              max={6}
              step={0.5}
              decimals={1}
              onValueChange={(googleTtsVolumeGain) =>
                onUpdateSettings({ googleTtsVolumeGain })
              }
              presets={GOOGLE_TTS_VOLUME_PRESETS}
            />
          </div>

          {/* 4. Acoustic Device Profile (EQ) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Headphones className="size-4 text-primary" />
                <span>Acoustic Device Profile (EQ)</span>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Equalisation curves calibrated to optimize speech
                intelligibility for target audio transducers.
              </CardDescription>
              <CardAction>
                <Badge
                  variant="primary-outline"
                  className="font-mono text-xs uppercase"
                >
                  {GOOGLE_TTS_AUDIO_PROFILES.find(
                    (p) =>
                      p.id ===
                      (settings.googleTtsAudioProfile ||
                        "headphone-class-device")
                  )?.label || "Headphones"}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent>
              <ToggleGroup
                type="single"
                value={
                  settings.googleTtsAudioProfile || "headphone-class-device"
                }
                onValueChange={(val) => {
                  if (val)
                    onUpdateSettings({
                      googleTtsAudioProfile: val as GoogleTtsAudioProfile,
                    })
                }}
                className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
              >
                {GOOGLE_TTS_AUDIO_PROFILES.map((prof) => {
                  const isSelected =
                    (settings.googleTtsAudioProfile ||
                      "headphone-class-device") === prof.id
                  return (
                    <ToggleGroupItem
                      key={prof.id}
                      value={prof.id}
                      className={cn(
                        "group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden p-3 text-left whitespace-normal transition-all",
                        isSelected &&
                          "bg-primary/5 data-[state=on]:bg-primary/5"
                      )}
                    >
                      <div className="w-full">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                "flex size-7 items-center justify-center border transition-colors",
                                isSelected
                                  ? "border-primary/40 bg-primary/10 text-primary"
                                  : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground"
                              )}
                            >
                              <Headphones className="size-3.5" />
                            </div>
                            <div>
                              <div className="font-heading text-xs font-semibold text-nowrap text-foreground">
                                {prof.label}
                              </div>
                            </div>
                          </div>
                          <SelectionCheckIndicator isSelected={isSelected} />
                        </div>
                        <p className="mt-2 line-clamp-2 text-tiny leading-relaxed text-muted-foreground">
                          {prof.description}
                        </p>
                      </div>
                      <div className="mt-2 flex w-full items-center justify-between font-mono text-tiny">
                        <Badge
                          variant={isSelected ? "primary-light" : "outline"}
                          className="font-mono text-tiny tracking-wider uppercase"
                        >
                          {prof.id
                            .replace("-device", "")
                            .replace("-speaker", "")}
                        </Badge>
                      </div>
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
            </CardContent>
          </Card>

          {/* 5. Automatic Audio Briefing Switch */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
                <Volume2 className="size-4 text-primary" />
                <Label
                  htmlFor="auto-briefing-switch-advanced"
                  className="cursor-pointer font-heading text-xs font-semibold text-foreground"
                >
                  Automatic Audio Meteorological Briefing
                </Label>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Read aloud synopsis automatically via Google Neural TTS upon
                station selection or initialization.
              </CardDescription>
              <CardAction>
                <Switch
                  id="auto-briefing-switch-advanced"
                  checked={settings.autoSpeakOnLoad}
                  onCheckedChange={(checked) =>
                    onUpdateSettings({ autoSpeakOnLoad: checked })
                  }
                />
              </CardAction>
            </CardHeader>
          </Card>

          {/* Switch to Basic Banner */}
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border/80 bg-muted/20 p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-7 shrink-0 items-center justify-center rounded border border-border bg-background/80 text-muted-foreground">
                <Sliders className="size-3.5 text-primary" />
              </div>
              <div>
                <div className="font-heading text-xs font-medium text-foreground">
                  Prefer a streamlined experience?
                </div>
                <p className="text-tiny text-muted-foreground">
                  Switch back to Basic mode for straightforward voice selection
                  and speed playback without acoustic engineering options.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSwitchMode("basic")}
              className="h-7 shrink-0 cursor-pointer gap-1.5 font-mono text-tiny shadow-2xs hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
            >
              <span>Basic Mode</span>
            </Button>
          </div>
        </>
      )}
    </>
  )
}

/** TAB 6: THEME / APPEARANCE */
function AppearanceTabContent() {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
          <SunMoon className="size-4 text-primary" />
          <span>{t.settingsDialog.theme.headerTitle}</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {t.settingsDialog.theme.headerSubtitle}
        </CardDescription>
        <CardAction>
          <Badge
            variant="primary-outline"
            className="font-mono text-xs uppercase"
          >
            {mounted ? theme : DEFAULT_THEME_ID}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ToggleGroup
          type="single"
          orientation="horizontal"
          className="flex-col sm:flex-row"
          value={mounted ? theme : DEFAULT_THEME_ID}
          onValueChange={(val) => {
            if (val) setTheme(val)
          }}
          spacing={0}
        >
          {THEME_OPTIONS.map((item) => {
            const isSelected = mounted && theme === item.id
            const Icon = item.icon
            return (
              <ToggleGroupItem
                key={item.id}
                value={item.id}
                className={cn(
                  "group relative flex h-full w-full cursor-pointer flex-col justify-between overflow-hidden p-3 text-left whitespace-normal transition-all",
                  isSelected && "bg-primary/5 data-[state=on]:bg-primary/5"
                )}
              >
                {/* Card Info */}
                <div className="w-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "flex size-7 items-center justify-center border transition-colors",
                          isSelected
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground"
                        )}
                      >
                        <Icon className="size-3.5" />
                      </div>
                      <div>
                        <div className="font-heading text-xs font-semibold text-nowrap text-foreground">
                          {item.title}
                        </div>
                        <div className="font-mono text-tiny text-nowrap text-muted-foreground">
                          {item.subtitle}
                        </div>
                      </div>
                    </div>
                    <SelectionCheckIndicator isSelected={isSelected} />
                  </div>

                  <p className="mt-2 line-clamp-3 text-tiny leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>

                {/* Footer Profile Badge */}
                <div className="flex w-full items-center justify-between font-mono text-tiny">
                  <Badge
                    variant={isSelected ? "primary-light" : "outline"}
                    className="font-mono text-tiny tracking-wider uppercase"
                  >
                    {item.badge}
                  </Badge>
                </div>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MAIN SETTINGS DIALOG
// ============================================================================

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  activeTab?: string
  onActiveTabChange?: (tab: string) => void
  settings: ExtendedSettings
  onUpdateSettings: (newSettings: Partial<ExtendedSettings>) => void
  onResetSettings: () => void
  pinnedCities: string[]
  onAddPinnedCity: (city: string) => void
  onRemovePinnedCity: (city: string) => void
  onSelectCity: (city: string) => void
  currentTemp?: number
  city?: string
  coords?: { lat: number; lon: number } | null
}

export function SettingsDialog({
  open,
  onOpenChange,
  activeTab = "source",
  onActiveTabChange,
  settings,
  onUpdateSettings,
  onResetSettings,
  pinnedCities,
  onAddPinnedCity,
  onRemovePinnedCity,
  onSelectCity,
  currentTemp,
}: SettingsDialogProps) {
  const { t } = useTranslation()

  // Reusable Tab Configurations
  const tabs: {
    id: string
    label: string
    badge?: React.ReactNode
    content: React.ReactNode
  }[] = [
    {
      id: "source",
      label: t.settingsDialog.tabSource || "Source & Station",
      content: (
        <SourceTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      ),
    },
    {
      id: "units",
      label: t.settingsDialog.tabUnits || "Units",
      content: (
        <UnitsTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
          currentTemp={currentTemp}
        />
      ),
    },
    {
      id: "favorites",
      label: t.settingsDialog.tabFavorites || "Favorites",
      badge: (
        <Badge
          variant="primary-outline"
          className="rounded-full font-mono text-tiny"
        >
          {pinnedCities.length}
        </Badge>
      ),
      content: (
        <FavoritesTabContent
          pinnedCities={pinnedCities}
          onAddPinnedCity={onAddPinnedCity}
          onRemovePinnedCity={onRemovePinnedCity}
          onSelectCity={onSelectCity}
          onCloseDialog={() => onOpenChange(false)}
        />
      ),
    },
    {
      id: "localization",
      label: t.settingsDialog.tabRegional || "Regional",
      content: (
        <RegionalTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      ),
    },
    {
      id: "speech",
      label: t.settingsDialog.tabSpeech || "Speech & Audio",
      content: (
        <SpeechTabContent
          settings={settings}
          onUpdateSettings={onUpdateSettings}
        />
      ),
    },
    {
      id: "appearance",
      label: t.settingsDialog.tabTheme || "Theme",
      content: <AppearanceTabContent />,
    },
  ]

  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Settings className="size-4.5" />}
      title={t.settingsDialog.title || "Station & Application Preferences"}

      description={
        t.settingsDialog.subtitle ||
        "Configure meteorological data feeds, numerical forecast models, measurement standards & voice telemetry"
      }
      scrollable={false}
      footer={
        <>
          <Button
            variant="accent"
            onClick={onResetSettings}
            className="gap-1.5 font-sans text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5" />
            <span>{t.common.reset || "Reset"}</span>
          </Button>

          <Button
            onClick={() => onOpenChange(false)}
            className="gap-1.5 text-xs"
          >
            <Check className="size-3.5" />
            <span>{t.common.done || "Done"}</span>
          </Button>
        </>
      }
    >
      {/* REUSABLE TABS SYSTEM */}
      <Tabs
        value={activeTab}
        onValueChange={onActiveTabChange}
        className="flex min-h-0 w-full flex-1 flex-col gap-0 overflow-hidden"
      >
        <TabsList className="w-full shrink-0 flex-nowrap justify-start gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <SettingsTabTrigger
              key={tab.id}
              value={tab.id}
              label={tab.label}
              badge={tab.badge}
            />
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <SettingsTabPanel key={tab.id} value={tab.id}>
            {tab.content}
          </SettingsTabPanel>
        ))}
      </Tabs>
    </UniversalDialog>
  )
}
