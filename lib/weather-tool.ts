// Server-only: the AI advisor's weather lookup tool (Gemini function calling).
import { CONFIG } from "@/lib/config"
import { mapWmoCode } from "@/lib/weather"
import type { GeminiFunctionDeclaration } from "@/lib/gemini"

export const WEATHER_TOOL: GeminiFunctionDeclaration = {
  name: "get_weather",
  description:
    "Weather for any place and date range: forecast up to 16 days ahead, or observed history for past dates. " +
    "Use it whenever the question is about a place or date not covered by the live data already provided.",
  parameters: {
    type: "OBJECT",
    properties: {
      location: {
        type: "STRING",
        description:
          "Place name, ideally with country, e.g. 'Tokyo, Japan' or 'Paris'",
      },
      start_date: {
        type: "STRING",
        description: "First local date, YYYY-MM-DD. Defaults to today.",
      },
      end_date: {
        type: "STRING",
        description:
          "Last local date, YYYY-MM-DD (inclusive). Defaults to start_date. Max 16 days after start_date.",
      },
    },
    required: ["location"],
  },
}

/** Display units of the viewer, as shown in the advisor snapshot. */
export interface ToolUnits {
  temperature: string // "°C" | "°F"
  wind: string // "km/h" | "m/s" | "mph" | "knots"
  precipitation: string // "mm" | "in"
}

const FORECAST_DAYS = 16
const MAX_RANGE_DAYS = 16
const HOURLY_MAX_DAYS = 2
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}
const daysBetween = (a: string, b: string) =>
  Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000
  )

function unitParams(units: ToolUnits) {
  const wind = /mph/i.test(units.wind)
    ? "mph"
    : /m\/s/i.test(units.wind)
      ? "ms"
      : /kn/i.test(units.wind)
        ? "kn"
        : "kmh"
  return [
    `temperature_unit=${units.temperature.includes("F") ? "fahrenheit" : "celsius"}`,
    `wind_speed_unit=${wind}`,
    `precipitation_unit=${/in/i.test(units.precipitation) ? "inch" : "mm"}`,
  ].join("&")
}

/** One retry: upstream connections occasionally time out (seen in dev). */
async function fetchWithRetry(url: string, timeoutMs: number) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (res.ok || res.status < 500) return res
  } catch {
    // fall through to the retry
  }
  return fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
}

const round1 = (n: unknown) =>
  typeof n === "number" ? Math.round(n * 10) / 10 : undefined
const label = (code: unknown) =>
  typeof code === "number" ? mapWmoCode(code).label : undefined

/**
 * Runs get_weather. Always resolves: errors come back as `{ error }` so the
 * model can explain them instead of the request failing.
 */
export async function runWeatherTool(
  args: Record<string, unknown>,
  units: ToolUnits
): Promise<Record<string, unknown>> {
  const location =
    typeof args.location === "string" ? args.location.trim().slice(0, 100) : ""
  if (!location) return { error: "A location is required." }

  try {
    // 1. Place -> coordinates (first match; "City, Country" narrows by country name)
    const [name, ...rest] = location.split(",").map((p) => p.trim())
    const geoRes = await fetchWithRetry(`${CONFIG.api.openMeteoGeoBaseUrl}/search?name=${encodeURIComponent(name)}&count=5&language=en&format=json`, 5000)
    const results: Record<string, unknown>[] = geoRes.ok
      ? ((await geoRes.json()).results ?? [])
      : []
    const hint = rest.join(" ").toLowerCase()
    const place =
      (hint &&
        results.find((r) =>
          [r.country, r.admin1, r.country_code].some(
            (v) => typeof v === "string" && hint.includes(v.toLowerCase())
          )
        )) ||
      results[0]
    if (!place) return { error: `Could not find a place called "${location}".` }

    // 2. Dates (local to the place; "today" from UTC is close enough to choose the API)
    const today = new Date().toISOString().slice(0, 10)
    const start =
      typeof args.start_date === "string" && DATE_RE.test(args.start_date)
        ? args.start_date
        : today
    let end =
      typeof args.end_date === "string" && DATE_RE.test(args.end_date)
        ? args.end_date
        : start
    if (daysBetween(start, end) < 0) end = start
    if (daysBetween(start, end) >= MAX_RANGE_DAYS)
      end = addDays(start, MAX_RANGE_DAYS - 1)
    if (daysBetween(today, start) >= FORECAST_DAYS) {
      return {
        error: `Forecasts only reach ${FORECAST_DAYS} days ahead (until ${addDays(today, FORECAST_DAYS - 1)}).`,
      }
    }

    // 3. Forecast API covers the last ~3 months and the next 16 days; older dates use the archive.
    const historical = daysBetween(end, today) > 90
    const withHourly = daysBetween(start, end) < HOURLY_MAX_DAYS
    const daily = historical
      ? "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,wind_speed_10m_max,sunrise,sunset"
      : "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,uv_index_max,sunrise,sunset"
    const hourly =
      "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m" +
      (historical ? "" : ",precipitation_probability")
    const base = historical
      ? `${CONFIG.api.openMeteoArchiveBaseUrl}/archive`
      : `${CONFIG.api.openMeteoApiBaseUrl}/forecast`
    const url =
      `${base}?latitude=${place.latitude}&longitude=${place.longitude}&timezone=auto` +
      `&start_date=${start}&end_date=${end}&daily=${daily}${withHourly ? `&hourly=${hourly}` : ""}&${unitParams(units)}`
    const res = await fetchWithRetry(url, 8000)
    if (!res.ok)
      return { error: `Weather data is unavailable for ${start}–${end}.` }
    const data = await res.json()
    const d = data.daily ?? {}
    const h = data.hourly ?? {}

    return {
      location: {
        name: place.name,
        region: place.admin1,
        country: place.country,
        timezone: data.timezone,
      },
      kind: historical
        ? "observed"
        : daysBetween(end, today) >= 0
          ? "observed/recent"
          : "forecast",
      units: {
        temperature: units.temperature,
        wind: units.wind,
        precipitation: units.precipitation,
      },
      daily: ((d.time as string[]) ?? []).map((date, i) => ({
        date,
        condition: label(d.weather_code?.[i]),
        high: round1(d.temperature_2m_max?.[i]),
        low: round1(d.temperature_2m_min?.[i]),
        feelsLikeHigh: round1(d.apparent_temperature_max?.[i]),
        feelsLikeLow: round1(d.apparent_temperature_min?.[i]),
        precipitation: round1(d.precipitation_sum?.[i]),
        rainChance: d.precipitation_probability_max?.[i],
        windMax: round1(d.wind_speed_10m_max?.[i]),
        uvMax: round1(d.uv_index_max?.[i]),
        sunrise: d.sunrise?.[i]?.slice(11, 16),
        sunset: d.sunset?.[i]?.slice(11, 16),
      })),
      // Every third hour keeps the payload small but still shows the day's shape.
      hourly: withHourly
        ? ((h.time as string[]) ?? [])
            .map((time, i) => ({
              time: time.replace("T", " "),
              condition: label(h.weather_code?.[i]),
              temp: round1(h.temperature_2m?.[i]),
              feelsLike: round1(h.apparent_temperature?.[i]),
              humidity: h.relative_humidity_2m?.[i],
              precipitation: round1(h.precipitation?.[i]),
              rainChance: h.precipitation_probability?.[i],
              wind: round1(h.wind_speed_10m?.[i]),
            }))
            .filter((_, i) => i % 3 === 0)
        : undefined,
    }
  } catch (err) {
    console.warn("get_weather tool failed:", err)
    return { error: "The weather service did not respond." }
  }
}
