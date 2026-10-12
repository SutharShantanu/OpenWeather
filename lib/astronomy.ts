import {
  Body,
  Illumination,
  MoonPhase,
  NextMoonQuarter,
  SearchMoonPhase,
  SearchMoonQuarter,
} from "astronomy-engine"
import { getMoonTimes, getTimes } from "suncalc"

const DAY_MS = 86_400_000
const SYNODIC_DAYS = 29.530_588_77

/** Moon phase 0..1 (0 new, 0.5 full) and illuminated percent at an instant. */
function moonAt(date: Date) {
  return {
    phase: MoonPhase(date) / 360,
    illumination: Math.round(
      Illumination(Body.Moon, date).phase_fraction * 100
    ),
  }
}

export const MOON_PHASES = [
  "newMoon",
  "waxingCrescent",
  "firstQuarter",
  "waxingGibbous",
  "fullMoon",
  "waningGibbous",
  "lastQuarter",
  "waningCrescent",
] as const
export type MoonPhaseKey = (typeof MOON_PHASES)[number]

/** Phase 0..1 (0 new, 0.5 full) -> one of eight named phases. */
export function moonPhaseKey(phase: number): MoonPhaseKey {
  const p = ((phase % 1) + 1) % 1
  if (p < 0.03 || p >= 0.97) return "newMoon"
  if (p < 0.22) return "waxingCrescent"
  if (p < 0.28) return "firstQuarter"
  if (p < 0.47) return "waxingGibbous"
  if (p < 0.53) return "fullMoon"
  if (p < 0.72) return "waningGibbous"
  if (p < 0.78) return "lastQuarter"
  return "waningCrescent"
}

export type SunState = "normal" | "polarDay" | "polarNight"
export type MoonState = "normal" | "alwaysUp" | "alwaysDown"

export interface SunMoon {
  sun: {
    sunrise: Date | null
    solarNoon: Date
    sunset: Date | null
    state: SunState
    dayLengthSec: number | null
    /** Today's day length minus yesterday's, seconds. */
    dayLengthDeltaSec: number | null
  }
  /** Twilight and golden-hour boundaries; null where the sun never reaches that angle. */
  light: {
    astronomicalDawn: Date | null
    nauticalDawn: Date | null
    dawn: Date | null
    goldenMorningEnd: Date | null
    goldenEveningStart: Date | null
    dusk: Date | null
    nauticalDusk: Date | null
    astronomicalDusk: Date | null
  }
  moon: {
    phase: number
    phaseKey: MoonPhaseKey
    /** Illuminated fraction, 0..100. */
    illumination: number
    waxing: boolean
    /** Days since the last new moon. */
    ageDays: number
    rise: Date | null
    set: Date | null
    state: MoonState
  }
  next: { newMoon: Date; fullMoon: Date }
}

/** Exact instant of the next new (`full` false) or full moon after `from`. */
function nextSyzygy(from: Date, full: boolean): Date {
  // A new or full moon always falls within one synodic month (29.5 days).
  return SearchMoonPhase(full ? 180 : 0, from, 40)!.date
}

function dayLengthSec(rise: Date | null, set: Date | null): number | null {
  return rise && set ? (set.getTime() - rise.getTime()) / 1000 : null
}

/**
 * Sun, twilight and moon data for the civil day containing `date` at a place.
 * `utcOffsetMin` is the place's offset from UTC in minutes (east positive), so
 * "today" is the place's day, not the viewer's. All returned dates are UTC instants.
 */
export function getSunMoon(
  date: Date,
  lat: number,
  lon: number,
  utcOffsetMin = 0
): SunMoon {
  const t = getTimes(date, lat, lon, 0, utcOffsetMin)
  const yesterday = getTimes(
    new Date(date.getTime() - DAY_MS),
    lat,
    lon,
    0,
    utcOffsetMin
  )
  const m = getMoonTimes(date, lat, lon, utcOffsetMin)
  const moon = moonAt(date)

  const todayLength = dayLengthSec(t.sunrise, t.sunset)
  const yesterdayLength = dayLengthSec(yesterday.sunrise, yesterday.sunset)

  return {
    sun: {
      sunrise: t.sunrise,
      solarNoon: t.solarNoon,
      sunset: t.sunset,
      state: t.alwaysUp ? "polarDay" : t.alwaysDown ? "polarNight" : "normal",
      dayLengthSec: todayLength,
      dayLengthDeltaSec:
        todayLength !== null && yesterdayLength !== null
          ? todayLength - yesterdayLength
          : null,
    },
    light: {
      astronomicalDawn: t.nightEnd,
      nauticalDawn: t.nauticalDawn,
      dawn: t.dawn,
      goldenMorningEnd: t.goldenHourEnd,
      goldenEveningStart: t.goldenHour,
      dusk: t.dusk,
      nauticalDusk: t.nauticalDusk,
      astronomicalDusk: t.night,
    },
    moon: {
      phase: moon.phase,
      phaseKey: moonPhaseKey(moon.phase),
      illumination: moon.illumination,
      waxing: moon.phase < 0.5,
      ageDays: moon.phase * SYNODIC_DAYS,
      rise: m.rise ?? null,
      set: m.set ?? null,
      state: m.alwaysUp ? "alwaysUp" : m.alwaysDown ? "alwaysDown" : "normal",
    },
    next: {
      newMoon: nextSyzygy(date, false),
      fullMoon: nextSyzygy(date, true),
    },
  }
}

export interface MoonDay {
  /** Day of month, 1-based. */
  day: number
  phase: number
  phaseKey: MoonPhaseKey
  /** Illuminated fraction, 0..100, at the station's local noon. */
  illumination: number
  /** Set on the day an exact new, first quarter, full or last quarter moon occurs. */
  principal: MoonPhaseKey | null
}

export interface MoonMonth {
  days: MoonDay[]
  /** Weekday of the 1st, 0 = Sunday. */
  firstWeekday: number
}

const QUARTER_KEYS: MoonPhaseKey[] = [
  "newMoon",
  "firstQuarter",
  "fullMoon",
  "lastQuarter",
]

/** Day of month -> exact principal phase that occurs on that local day. */
function principalDays(
  year: number,
  month: number,
  utcOffsetMin: number
): Map<number, MoonPhaseKey> {
  const offset = utcOffsetMin * 60_000
  const end = Date.UTC(year, month + 1, 1) - offset
  const out = new Map<number, MoonPhaseKey>()
  let q = SearchMoonQuarter(
    new Date(Date.UTC(year, month, 1) - offset - DAY_MS)
  )
  while (q.time.date.getTime() < end) {
    const local = new Date(q.time.date.getTime() + offset)
    if (local.getUTCFullYear() === year && local.getUTCMonth() === month) {
      out.set(local.getUTCDate(), QUARTER_KEYS[q.quarter])
    }
    q = NextMoonQuarter(q)
  }
  return out
}

/** UTC instant of local noon on a calendar day at a place `utcOffsetMin` east of UTC. */
export function localNoon(
  year: number,
  month: number,
  day: number,
  utcOffsetMin: number
): Date {
  return new Date(Date.UTC(year, month, day, 12) - utcOffsetMin * 60_000)
}

/** Moon phase for every day of a month (`month` is 0-based), taken at local noon. */
export function getMoonMonth(
  year: number,
  month: number,
  utcOffsetMin = 0
): MoonMonth {
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const principal = principalDays(year, month, utcOffsetMin)
  const days: MoonDay[] = []
  for (let day = 1; day <= count; day++) {
    const { phase, illumination } = moonAt(
      localNoon(year, month, day, utcOffsetMin)
    )
    days.push({
      day,
      phase,
      phaseKey: moonPhaseKey(phase),
      illumination,
      principal: principal.get(day) ?? null,
    })
  }
  return { days, firstWeekday: new Date(Date.UTC(year, month, 1)).getUTCDay() }
}

/** Moon phase for a single calendar day at a place `utcOffsetMin` east of UTC. */
export function getMoonDayForDate(
  date: Date,
  utcOffsetMin = 0
): MoonDay {
  const y = date.getFullYear()
  const m = date.getMonth()
  const d = date.getDate()
  const { phase, illumination } = moonAt(localNoon(y, m, d, utcOffsetMin))
  return {
    day: d,
    phase,
    phaseKey: moonPhaseKey(phase),
    illumination,
    principal: null,
  }
}

