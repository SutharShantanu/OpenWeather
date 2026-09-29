import type {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherAlert,
} from "@/lib/weather"
import { formatTemperature } from "@/lib/weather"
import type { DisplayPreferencesContextValue } from "@/components/display-preferences-provider"

/**
 * Compact, already unit-converted view of the live weather that the AI advisor
 * reasons over. Values are in the viewer's units so the model never converts.
 */
export interface AdvisorSnapshot {
  location: { city: string; country: string; lat: number; lon: number }
  /** Unix time of the observation; part of the cache key. */
  observedAt: number
  units: { temperature: string; wind: string; pressure: string }
  now: {
    condition: string
    temp: number
    feelsLike: number
    humidity: number
    wind: number
    windFromDeg: number
    gusts?: number
    uvIndex?: number
    pressure: number
    cloudCover: number
    visibilityKm: number
    airQualityIndex?: number
    sunrise: string
    sunset: string
  }
  next24h: {
    time: string
    condition: string
    temp: number
    rainChance: number
    wind: number
  }[]
  next7d: {
    day: string
    date: string
    condition: string
    min: number
    max: number
    rainChance: number
    uvMax?: number
  }[]
  alerts: { event: string; severity: string; headline: string }[]
}

export function buildAdvisorSnapshot(
  current: CurrentWeather,
  hourly: HourlyForecastItem[],
  daily: DailyForecastItem[],
  alerts: WeatherAlert[],
  unit: "C" | "F",
  prefs: DisplayPreferencesContextValue
): AdvisorSnapshot {
  const temp = (c: number) => formatTemperature(c, unit)
  const wind = (mps: number) => prefs.wind(mps).val
  const pct = (p: number) => Math.round(p * 100)

  return {
    location: {
      city: current.cityName,
      country: current.country,
      lat: Math.round(current.lat * 100) / 100,
      lon: Math.round(current.lon * 100) / 100,
    },
    observedAt: current.dt,
    units: {
      temperature: `°${unit}`,
      wind: prefs.wind(0).unitStr,
      pressure: prefs.pressure(1013).unitStr,
    },
    now: {
      condition: current.condition.description,
      temp: temp(current.temp),
      feelsLike: temp(current.feelsLike),
      humidity: current.humidity,
      wind: wind(current.windSpeed),
      windFromDeg: current.windDeg,
      gusts:
        current.windGusts !== undefined ? wind(current.windGusts) : undefined,
      uvIndex: current.uvIndex,
      pressure: prefs.pressure(current.pressure).val,
      cloudCover: current.clouds,
      visibilityKm: Math.round(current.visibility / 100) / 10,
      airQualityIndex: current.airQuality?.aqi,
      sunrise: prefs.time(current.sunrise),
      sunset: prefs.time(current.sunset),
    },
    next24h: hourly.slice(0, 24).map((h) => ({
      time: h.time,
      condition: h.description,
      temp: temp(h.temp),
      rainChance: pct(h.pop),
      wind: wind(h.windSpeed),
    })),
    next7d: daily.slice(0, 7).map((d) => ({
      day: d.day,
      date: d.date,
      condition: d.description,
      min: temp(d.tempMin),
      max: temp(d.tempMax),
      rainChance: pct(d.pop),
      uvMax: d.uvIndexMax,
    })),
    alerts: alerts
      .slice(0, 5)
      .map((a) => ({
        event: a.event,
        severity: a.severity,
        headline: a.headline,
      })),
  }
}

/** Identifies one location + observation + language + units; used for caching. */
export function snapshotKey(snapshot: AdvisorSnapshot, lang: string) {
  const { location, observedAt, units } = snapshot
  return [
    location.lat,
    location.lon,
    observedAt,
    lang,
    units.temperature,
    units.wind,
    units.pressure,
  ].join("|")
}

export interface AdvisorBriefing {
  summary: string
  alerts: {
    title: string
    detail: string
    action: string
    timing: string
    urgency: "HIGH" | "MEDIUM" | "INFO"
  }[]
  outlook: {
    period: string
    summary: string
    temperatureShift: string
    precipitationRisk: string
  }[]
}

/** Gemini responseSchema for AdvisorBriefing. */
export const BRIEFING_SCHEMA = {
  type: "OBJECT",
  properties: {
    summary: {
      type: "STRING",
      description: "1-2 sentence overview of conditions right now",
    },
    alerts: {
      type: "ARRAY",
      description:
        "Notable changes in the next 12 hours only; empty when conditions are stable",
      maxItems: 3,
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          detail: { type: "STRING" },
          action: { type: "STRING", description: "What the person should do" },
          timing: {
            type: "STRING",
            description: "Local time or window, e.g. 15:00-18:00",
          },
          urgency: { type: "STRING", enum: ["HIGH", "MEDIUM", "INFO"] },
        },
        required: ["title", "detail", "action", "timing", "urgency"],
      },
    },
    outlook: {
      type: "ARRAY",
      description: "Exactly two entries: tomorrow, then the coming weekend",
      minItems: 2,
      maxItems: 2,
      items: {
        type: "OBJECT",
        properties: {
          period: {
            type: "STRING",
            description: "e.g. Tomorrow, Weekend (in the reply language)",
          },
          summary: { type: "STRING" },
          temperatureShift: {
            type: "STRING",
            description: "Short badge, e.g. 2°F warmer",
          },
          precipitationRisk: {
            type: "STRING",
            description: "Short phrase, e.g. Mainly dry",
          },
        },
        required: [
          "period",
          "summary",
          "temperatureShift",
          "precipitationRisk",
        ],
      },
    },
  },
  required: ["summary", "alerts", "outlook"],
} as const
