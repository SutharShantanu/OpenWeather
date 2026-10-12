import { describe, expect, it } from "vitest"
import {
  getMoonDayForDate,
  getMoonMonth,
  getSunMoon,
  localNoon,
  moonPhaseKey,
} from "@/lib/astronomy"

describe("moonPhaseKey", () => {
  it("names the eight phases at their centres", () => {
    expect(
      [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875].map(moonPhaseKey)
    ).toEqual([
      "newMoon",
      "waxingCrescent",
      "firstQuarter",
      "waxingGibbous",
      "fullMoon",
      "waningGibbous",
      "lastQuarter",
      "waningCrescent",
    ])
  })
  it("wraps negative and >1 values", () => {
    expect(moonPhaseKey(1)).toBe("newMoon")
    expect(moonPhaseKey(-0.5)).toBe("fullMoon")
  })
})

describe("getSunMoon", () => {
  it("finds the next full and new moon near their real dates", () => {
    // Full moon 2024-01-25 17:54 UTC, new moon 2024-02-09 22:59 UTC.
    const r = getSunMoon(new Date("2024-01-20T12:00:00Z"), 0, 0)
    expect(
      Math.abs(r.next.fullMoon.getTime() - Date.parse("2024-01-25T17:54:00Z"))
    ).toBeLessThan(15 * 60_000)
    expect(
      Math.abs(r.next.newMoon.getTime() - Date.parse("2024-02-09T22:59:00Z"))
    ).toBeLessThan(15 * 60_000)
  })

  it("puts equinox sunrise on the equator at about 06:00 local", () => {
    const r = getSunMoon(new Date("2024-03-20T12:00:00Z"), 0, 0)
    expect(
      Math.abs(r.sun.sunrise!.getTime() - Date.parse("2024-03-20T06:00:00Z"))
    ).toBeLessThan(15 * 60_000)
    expect(r.sun.state).toBe("normal")
  })

  it("applies the place's UTC offset to pick the civil day", () => {
    // 2024-03-20 23:00 UTC is already Mar 21 in UTC+5:30; sunrise must be Mar 21's.
    const r = getSunMoon(new Date("2024-03-20T23:00:00Z"), 28.6, 77.2, 330)
    const localSunrise = new Date(r.sun.sunrise!.getTime() + 330 * 60_000)
    expect(localSunrise.getUTCDate()).toBe(21)
  })

  it("reports polar day and polar night without times", () => {
    const day = getSunMoon(new Date("2024-06-21T12:00:00Z"), 78.2, 15.6)
    expect(day.sun.state).toBe("polarDay")
    expect(day.sun.sunset).toBeNull()
    expect(day.sun.dayLengthSec).toBeNull()
    const night = getSunMoon(new Date("2024-12-21T12:00:00Z"), 78.2, 15.6)
    expect(night.sun.state).toBe("polarNight")
  })

  it("shows days lengthening after the winter solstice", () => {
    const r = getSunMoon(new Date("2024-02-01T12:00:00Z"), 51.5, 0)
    expect(r.sun.dayLengthDeltaSec!).toBeGreaterThan(0)
  })
})

describe("getMoonMonth", () => {
  it("covers every day and starts on the right weekday", () => {
    const m = getMoonMonth(2026, 9) // October 2026
    expect(m.days).toHaveLength(31)
    expect(m.firstWeekday).toBe(4) // Thursday
    expect(
      m.days.every((d) => d.illumination >= 0 && d.illumination <= 100)
    ).toBe(true)
  })

  it("flags the new and full moon days", () => {
    const m = getMoonMonth(2026, 9)
    const flagged = (key: string) =>
      m.days.filter((d) => d.principal === key).map((d) => d.day)
    // New moon 2026-10-10, full moon 2026-10-26 (UTC).
    expect(flagged("newMoon")).toEqual([10])
    expect(flagged("fullMoon")).toEqual([26])
  })

  it("finds each principal phase 12 or 13 times in a year", () => {
    const counts: Record<string, number> = {}
    for (let month = 0; month < 12; month++) {
      for (const d of getMoonMonth(2026, month).days) {
        if (d.principal) counts[d.principal] = (counts[d.principal] ?? 0) + 1
      }
    }
    expect(Object.keys(counts).sort()).toEqual([
      "firstQuarter",
      "fullMoon",
      "lastQuarter",
      "newMoon",
    ])
    for (const n of Object.values(counts)) {
      expect(n).toBeGreaterThanOrEqual(12)
      expect(n).toBeLessThanOrEqual(13)
    }
  })

  it("localNoon is noon on the station's calendar day", () => {
    // Noon on Mar 21 in UTC+5:30 is 06:30 UTC.
    expect(localNoon(2024, 2, 21, 330).toISOString()).toBe(
      "2024-03-21T06:30:00.000Z"
    )
  })

  it("calculates moon day data for arbitrary date via getMoonDayForDate", () => {
    const day = getMoonDayForDate(new Date("2026-10-07T12:00:00Z"))
    expect(day.day).toBe(7)
    expect(day.phase).toBeGreaterThanOrEqual(0)
    expect(day.illumination).toBeGreaterThanOrEqual(0)
    expect(day.illumination).toBeLessThanOrEqual(100)
    expect(day.phaseKey).toBeDefined()
  })
})
