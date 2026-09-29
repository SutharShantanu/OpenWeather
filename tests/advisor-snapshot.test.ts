import { describe, expect, it } from "vitest"
import { buildAdvisorSnapshot } from "@/lib/advisor"
import type {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
} from "@/lib/weather"
import type { DisplayPreferencesContextValue } from "@/components/display-preferences-provider"

// Minimal prefs: metric passthrough, km/h wind.
const prefs = {
  wind: (mps: number) => ({
    val: Math.round(mps * 3.6 * 10) / 10,
    unitStr: "km/h",
  }),
  pressure: (hpa: number) => ({ val: hpa, unitStr: "hPa" }),
  precip: (mm: number) => ({ val: mm, unitStr: "mm" }),
  time: () => "viewer-tz",
} as unknown as DisplayPreferencesContextValue

// 2026-09-29 16:00 in India (UTC+5:30) = 10:30 UTC
const t16 = Date.UTC(2026, 8, 29, 10, 30) / 1000
const hour = (
  i: number,
  temp: number,
  precipitation: number
): HourlyForecastItem => ({
  time: `${16 + i}:00`,
  timestamp: t16 + i * 3600,
  temp,
  feelsLike: temp + 2,
  humidity: 50 + i * 10,
  windSpeed: 5,
  precipitation,
  visibility: 9820,
  pressure: 986,
  conditionType: "SUNNY",
  description: "clear sky",
  pop: 0.2,
})

const current = {
  cityName: "Dadri",
  country: "India",
  lat: 28.5759,
  lon: 77.3345,
  temp: 31,
  feelsLike: 33,
  humidity: 56,
  pressure: 986,
  windSpeed: 2,
  windDeg: 290,
  clouds: 4,
  visibility: 9820,
  uvIndex: 2,
  dewPoint: 21.5,
  precipitation: 0,
  condition: {
    type: "SUNNY",
    main: "Clear",
    description: "clear sky",
    icon: "01d",
  },
  sunrise: Date.UTC(2026, 8, 29, 0, 42) / 1000, // 06:12 local
  sunset: Date.UTC(2026, 8, 29, 12, 39) / 1000, // 18:09 local
  dt: t16,
  airQuality: {
    aqi: 3,
    usAqi: 141,
    pm2_5: 77.8,
    pm10: 495.5,
    co: 0,
    no: 0,
    no2: 0,
    o3: 0,
    so2: 0,
    nh3: 0,
  },
} as CurrentWeather

const day = (
  max: number,
  min: number,
  pop: number,
  sum: number
): DailyForecastItem => ({
  day: "TODAY",
  date: "2026-09-29",
  tempMin: min,
  tempMax: max,
  feelsLikeMax: max + 2,
  feelsLikeMin: min,
  conditionType: "SUNNY",
  description: "clear sky",
  pop,
  humidity: 55,
  windSpeed: 5,
  precipitationSum: sum,
})

describe("buildAdvisorSnapshot", () => {
  const snap = buildAdvisorSnapshot(
    current,
    [hour(0, 30, 0), hour(1, 28, 1), hour(2, 26, 2)],
    [day(33, 25, 0.1, 0), day(35, 26, 0.6, 4.5)],
    [],
    "C",
    prefs,
    {
      avgHigh: 32.3,
      avgLow: 23.5,
      avgPrecipitation: 0.5,
      sampleYears: 10,
      recordHigh: { temp: 36.1, year: "2019" },
      recordLow: { temp: 19.8, year: "2016" },
    }
  )

  it("includes feels-like, humidity, precipitation, visibility and pressure", () => {
    expect(snap.now).toMatchObject({
      feelsLike: 33,
      dewPoint: 22,
      precipitation: 0,
      visibility: 9.8,
      pressure: 986,
    })
    expect(snap.now.airQuality).toEqual({
      index1to5: 3,
      usAqi: 141,
      pm2_5: 77.8,
      pm10: 495.5,
    })
    expect(snap.next24h[1]).toMatchObject({
      feelsLike: 30,
      humidity: 60,
      precipitation: 1,
      visibility: 9.8,
      pressure: 986,
    })
    expect(snap.next7d[1]).toMatchObject({
      feelsLikeMax: 37,
      precipitationTotal: 4.5,
    })
    expect(snap.units).toMatchObject({ precipitation: "mm", visibility: "km" })
  })

  it("computes averages over the forecast windows", () => {
    expect(snap.averages.next24h).toEqual({
      temp: 28,
      feelsLike: 30,
      humidity: 60,
      wind: 18,
      totalPrecipitation: 3,
    })
    expect(snap.averages.next7d).toEqual({
      high: 34,
      low: 26,
      totalPrecipitation: 4.5,
      rainyDays: 1,
    })
  })

  it("adds climate normals in display units", () => {
    expect(snap.climateNormals).toMatchObject({
      avgHigh: 32,
      avgLow: 24,
      recordHigh: "36 (2019)",
      years: 10,
    })
  })

  it("shows sunrise/sunset in the location's local time, not the viewer's", () => {
    expect(snap.now.sunrise).toBe("06:12")
    expect(snap.now.sunset).toBe("18:09")
  })
})
