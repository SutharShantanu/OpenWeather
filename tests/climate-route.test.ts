import { afterEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { GET } from "@/app/api/climate/route"

const get = (qs: string) => GET(new NextRequest(`http://localhost/api/climate?${qs}`))

afterEach(() => vi.unstubAllGlobals())

describe("/api/climate", () => {
  it("rejects out-of-range coordinates", async () => {
    expect((await get("lat=100&lon=0")).status).toBe(400)
  })

  it("returns 503 instead of invented normals when the archive fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("down")))
    const res = await get("lat=10&lon=10")
    expect(res.status).toBe(503)
  })

  it("computes today's normals from the archive over the last 10 full years", async () => {
    const now = new Date()
    const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        daily: {
          time: [`2020-${mmdd}`, `2021-${mmdd}`],
          temperature_2m_max: [30, 34],
          temperature_2m_min: [20, 18],
          precipitation_sum: [1, 3],
        },
      })
    )
    vi.stubGlobal("fetch", fetchMock)
    const res = await get("lat=10&lon=10")
    const body = await res.json()
    expect(res.status).toBe(200)
    expect(body).toMatchObject({
      sampleYears: 2,
      avgHigh: 32,
      avgLow: 19,
      recordHigh: { temp: 34, year: "2021" },
      recordLow: { temp: 18, year: "2021" },
    })
    const lastYear = now.getFullYear() - 1
    expect(fetchMock.mock.calls[0][0]).toContain(`start_date=${lastYear - 9}-01-01`)
    expect(fetchMock.mock.calls[0][0]).toContain(`end_date=${lastYear}-12-31`)
  })
})
