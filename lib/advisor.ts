import type {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherAlert,
} from "@/lib/weather"
import { formatTemperature } from "@/lib/weather"
import type { DisplayPreferencesContextValue } from "@/components/display-preferences-provider"

/** Climate normals for today's date, as returned by /api/climate (°C). */
export interface ClimateNormals {
  avgHigh: number
  avgLow: number
  avgPrecipitation: number
  sampleYears: number
  recordHigh: { temp: number; year: string }
  recordLow: { temp: number; year: string }
}

/**
 * Compact, already unit-converted view of the live weather that the AI advisor
 * reasons over. Values are in the viewer's units so the model never converts.
 * Times are local to the location.
 */
export interface AdvisorSnapshot {
  location: { city: string; country: string; lat: number; lon: number }
  /** Unix time of the observation; part of the cache key. */
  observedAt: number
  units: {
    temperature: string
    wind: string
    pressure: string
    precipitation: string
    visibility: "km"
  }
  now: {
    condition: string
    temp: number
    feelsLike: number
    humidity: number
    dewPoint?: number
    precipitation?: number
    wind: number
    windFromDeg: number
    gusts?: number
    uvIndex?: number
    pressure: number
    cloudCover: number
    visibility: number
    airQuality?: {
      index1to5: number
      usAqi?: number
      pm2_5: number
      pm10: number
    }
    sunrise: string
    sunset: string
  }
  next24h: {
    time: string
    condition: string
    temp: number
    feelsLike: number
    humidity: number
    rainChance: number
    precipitation?: number
    wind: number
    gusts?: number
    uvIndex?: number
    cloudCover?: number
    visibility?: number
    pressure?: number
  }[]
  next7d: {
    day: string
    date: string
    condition: string
    min: number
    max: number
    feelsLikeMin?: number
    feelsLikeMax?: number
    humidity: number
    rainChance: number
    precipitationTotal?: number
    windMax: number
    gustsMax?: number
    uvMax?: number
  }[]
  /** Averages over the forecast windows above. */
  averages: {
    next24h: {
      temp: number
      feelsLike: number
      humidity: number
      wind: number
      totalPrecipitation: number
    }
    next7d: {
      high: number
      low: number
      totalPrecipitation: number
      rainyDays: number
    }
  }
  /** Long-term averages for today's date (for "warmer/cooler than normal"). */
  climateNormals?: {
    avgHigh: number
    avgLow: number
    avgPrecipitation: number
    recordHigh: string
    recordLow: string
    years: number
  }
  alerts: { event: string; severity: string; headline: string }[]
}

const round1 = (n: number) => Math.round(n * 10) / 10
const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0

export function buildAdvisorSnapshot(
  current: CurrentWeather,
  hourly: HourlyForecastItem[],
  daily: DailyForecastItem[],
  alerts: WeatherAlert[],
  unit: "C" | "F",
  prefs: DisplayPreferencesContextValue,
  normals?: ClimateNormals | null
): AdvisorSnapshot {
  const temp = (c: number) => formatTemperature(c, unit)
  const optTemp = (c?: number) => (c === undefined ? undefined : temp(c))
  const wind = (mps: number) => prefs.wind(mps).val
  const optWind = (mps?: number) => (mps === undefined ? undefined : wind(mps))
  const precip = (mm?: number) =>
    mm === undefined ? undefined : prefs.precip(mm).val
  const km = (m?: number) => (m === undefined ? undefined : round1(m / 1000))
  const pressure = (hpa?: number) =>
    hpa === undefined ? undefined : prefs.pressure(hpa).val
  const pct = (p: number) => Math.round(p * 100)

  // Hourly entries carry both the local "HH:mm" and a Unix time; their
  // difference is the location's UTC offset, used for sunrise/sunset.
  const offsetMin = (() => {
    const first = hourly[0]
    if (!first) return null
    const [h, m] = first.time.split(":").map(Number)
    const utc = new Date(first.timestamp * 1000)
    const diff = h * 60 + m - (utc.getUTCHours() * 60 + utc.getUTCMinutes())
    return ((((diff + 720) % 1440) + 1440) % 1440) - 720
  })()
  const localClock = (unix: number) => {
    if (offsetMin === null) return prefs.time(unix)
    const d = new Date((unix + offsetMin * 60) * 1000)
    return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`
  }

  const next24 = hourly.slice(0, 24)
  const next7 = daily.slice(0, 7)

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
      precipitation: prefs.precip(0).unitStr,
      visibility: "km",
    },
    now: {
      condition: current.condition.description,
      temp: temp(current.temp),
      feelsLike: temp(current.feelsLike),
      humidity: current.humidity,
      dewPoint: optTemp(current.dewPoint),
      precipitation: precip(current.precipitation),
      wind: wind(current.windSpeed),
      windFromDeg: current.windDeg,
      gusts: optWind(current.windGusts),
      uvIndex: current.uvIndex,
      pressure: prefs.pressure(current.pressure).val,
      cloudCover: current.clouds,
      visibility: round1(current.visibility / 1000),
      airQuality: current.airQuality && {
        index1to5: current.airQuality.aqi,
        usAqi: current.airQuality.usAqi,
        pm2_5: current.airQuality.pm2_5,
        pm10: current.airQuality.pm10,
      },
      sunrise: localClock(current.sunrise),
      sunset: localClock(current.sunset),
    },
    next24h: next24.map((h) => ({
      time: h.time,
      condition: h.description,
      temp: temp(h.temp),
      feelsLike: temp(h.feelsLike),
      humidity: h.humidity,
      rainChance: pct(h.pop),
      precipitation: precip(h.precipitation),
      wind: wind(h.windSpeed),
      gusts: optWind(h.windGusts),
      uvIndex: h.uvIndex,
      cloudCover: h.cloudCover,
      visibility: km(h.visibility),
      pressure: pressure(h.pressure),
    })),
    next7d: next7.map((d) => ({
      day: d.day,
      date: d.date,
      condition: d.description,
      min: temp(d.tempMin),
      max: temp(d.tempMax),
      feelsLikeMin: optTemp(d.feelsLikeMin),
      feelsLikeMax: optTemp(d.feelsLikeMax),
      humidity: d.humidity,
      rainChance: pct(d.pop),
      precipitationTotal: precip(d.precipitationSum),
      windMax: wind(d.windSpeed),
      gustsMax: optWind(d.windGusts),
      uvMax: d.uvIndexMax,
    })),
    averages: {
      next24h: {
        temp: temp(avg(next24.map((h) => h.temp))),
        feelsLike: temp(avg(next24.map((h) => h.feelsLike))),
        humidity: Math.round(avg(next24.map((h) => h.humidity))),
        wind: round1(wind(avg(next24.map((h) => h.windSpeed)))),
        totalPrecipitation: round1(
          precip(next24.reduce((sum, h) => sum + (h.precipitation ?? 0), 0)) ??
            0
        ),
      },
      next7d: {
        high: temp(avg(next7.map((d) => d.tempMax))),
        low: temp(avg(next7.map((d) => d.tempMin))),
        totalPrecipitation: round1(
          precip(
            next7.reduce((sum, d) => sum + (d.precipitationSum ?? 0), 0)
          ) ?? 0
        ),
        rainyDays: next7.filter((d) => d.pop >= 0.5).length,
      },
    },
    climateNormals: normals
      ? {
          avgHigh: temp(normals.avgHigh),
          avgLow: temp(normals.avgLow),
          avgPrecipitation: precip(normals.avgPrecipitation) ?? 0,
          recordHigh: `${temp(normals.recordHigh.temp)} (${normals.recordHigh.year})`,
          recordLow: `${temp(normals.recordLow.temp)} (${normals.recordLow.year})`,
          years: normals.sampleYears,
        }
      : undefined,
    alerts: alerts.slice(0, 5).map((a) => ({
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
    units.precipitation,
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
