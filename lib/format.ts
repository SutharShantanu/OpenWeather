import { format as formatDateFns, isValid } from "date-fns"
import { DATE_FORMAT_OPTIONS } from "@/components/settings/constants"
import type {
  CoordinateFormatOption,
  DateFormatOption,
} from "@/components/settings/types"
import type { TimeFormat } from "@/lib/weather"

export type DateInput = Date | number | string

/**
 * Normalizes a date-like input into a Date.
 * - numbers below 1e12 are treated as Unix seconds, larger ones as milliseconds
 * - "YYYY-MM-DD" strings are parsed as *local* calendar dates (no UTC shift)
 */
export function toDate(input: DateInput): Date {
  if (input instanceof Date) return input
  if (typeof input === "number") {
    return new Date(input < 1e12 ? input * 1000 : input)
  }
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim())
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
  }
  return new Date(input)
}

function resolveLocale(locale?: string): string | undefined {
  if (!locale) return undefined
  try {
    return Intl.DateTimeFormat.supportedLocalesOf(locale).length > 0 ? locale : undefined
  } catch {
    return undefined
  }
}

/**
 * Formats a clock time honoring the user's 12h/24h preference.
 * `timeZone` is optional (IANA name); defaults to the viewer's zone.
 */
export function formatTime(
  input: DateInput,
  timeFormat: TimeFormat = "24h",
  locale?: string,
  timeZone?: string,
  options: { showMinutes?: boolean } = {}
): string {
  const date = toDate(input)
  if (!isValid(date)) return "--:--"
  const { showMinutes = true } = options
  return date.toLocaleTimeString(resolveLocale(locale), {
    hour: "2-digit",
    ...(showMinutes ? { minute: "2-digit" } : {}),
    hour12: timeFormat === "12h",
    ...(timeZone ? { timeZone } : {}),
  })
}

/**
 * Re-formats an already-rendered "HH:mm" (24h) wall-clock string into the
 * user's preferred time format without any timezone conversion. Use this for
 * server-preformatted location-local times (e.g. HourlyForecastItem.time).
 */
export function formatClockString(
  clock: string,
  timeFormat: TimeFormat = "24h",
  options: { showMinutes?: boolean } = {}
): string {
  const match = /^(\d{1,2}):(\d{2})/.exec(clock.trim())
  if (!match) return clock
  const { showMinutes = true } = options
  const hours = Number(match[1])
  const minutes = match[2]
  if (timeFormat === "24h") {
    const hh = String(hours).padStart(2, "0")
    return showMinutes ? `${hh}:${minutes}` : hh
  }
  const suffix = hours >= 12 ? "PM" : "AM"
  const h12 = hours % 12 === 0 ? 12 : hours % 12
  return showMinutes ? `${h12}:${minutes} ${suffix}` : `${h12} ${suffix}`
}

/** Formats a calendar date using the pattern of the selected DATE_FORMAT_OPTIONS entry. */
export function formatDate(input: DateInput, dateFormat: DateFormatOption = "iso"): string {
  const date = toDate(input)
  if (!isValid(date)) return typeof input === "string" ? input : ""
  const pattern =
    DATE_FORMAT_OPTIONS.find((o) => o.id === dateFormat)?.dateFnsPattern ??
    DATE_FORMAT_OPTIONS[0].dateFnsPattern
  return formatDateFns(date, pattern)
}

/** Short day+month label (for compact axes), ordered according to the date format. */
export function formatShortDate(input: DateInput, dateFormat: DateFormatOption = "iso"): string {
  const date = toDate(input)
  if (!isValid(date)) return typeof input === "string" ? input : ""
  switch (dateFormat) {
    case "us":
      return formatDateFns(date, "MM/dd")
    case "intl":
      return formatDateFns(date, "dd/MM")
    case "iso":
    default:
      return formatDateFns(date, "MM-dd")
  }
}

function toDms(value: number): string {
  const abs = Math.abs(value)
  let deg = Math.floor(abs)
  let min = Math.floor((abs - deg) * 60)
  let sec = Math.round(((abs - deg) * 60 - min) * 60)
  if (sec === 60) {
    sec = 0
    min += 1
  }
  if (min === 60) {
    min = 0
    deg += 1
  }
  return `${deg}°${String(min).padStart(2, "0")}'${String(sec).padStart(2, "0")}"`
}

/**
 * Formats a coordinate pair.
 * decimal → "28.6542° N, 77.2373° E"
 * dms     → "28°39'15" N, 77°14'14" E"
 */
export function formatCoords(
  lat: number,
  lon: number,
  coordinateFormat: CoordinateFormatOption = "decimal",
  precision = 4
): string {
  const ns = lat >= 0 ? "N" : "S"
  const ew = lon >= 0 ? "E" : "W"
  if (coordinateFormat === "dms") {
    return `${toDms(lat)} ${ns}, ${toDms(lon)} ${ew}`
  }
  return `${Math.abs(lat).toFixed(precision)}° ${ns}, ${Math.abs(lon).toFixed(precision)}° ${ew}`
}
