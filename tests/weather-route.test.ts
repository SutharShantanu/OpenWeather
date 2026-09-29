import { afterEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { GET } from "@/app/api/weather/route"

const get = (qs: string, headers?: Record<string, string>) =>
  GET(new NextRequest(`http://localhost/api/weather?${qs}`, { headers }))

afterEach(() => vi.unstubAllGlobals())

describe("/api/weather input validation", () => {
  it.each([
    ["lat=999&lon=10", /lat must be within/],
    ["lat=10", /lat must be within/],
    ["city=Paris&source=bogus", /Unknown source/],
    ["city=Paris&station=best_match%26foo%3D1", /Unknown station/],
    [`city=${"x".repeat(101)}`, /too long/],
  ])("rejects %s with 400", async (qs, message) => {
    const res = await get(qs)
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(message)
  })
})

describe("/api/weather upstream failures", () => {
  it("returns 502 instead of simulated data when Open-Meteo fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")))
    // Coordinates unique to this test so the route's in-memory cache is cold.
    const res = await get("lat=12.345&lon=67.891&city=Testville")
    expect(res.status).toBe(502)
    expect(await res.json()).toEqual({ error: expect.stringMatching(/unavailable/) })
  })

  it("returns 404 for a city the geocoder cannot find", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({ results: [] }))
    )
    const res = await get("city=zzqxnotacity")
    expect(res.status).toBe(404)
  })

  it("returns 502 with a key hint when OpenWeatherMap has no key", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("unused")))
    const res = await get("city=Paris&source=openweathermap")
    expect(res.status).toBe(502)
    expect((await res.json()).error).toMatch(/API key/)
  })

  it("serves simulated data only when explicitly requested", async () => {
    const res = await get("city=Paris&source=simulation")
    expect(res.status).toBe(200)
    expect((await res.json()).current.cityName).toBe("Paris")
  })
})
