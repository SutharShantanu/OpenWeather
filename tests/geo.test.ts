import { afterEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { detectLocationFromRequest } from "@/lib/geo"

const req = (headers: Record<string, string>) =>
  new NextRequest("http://localhost/api/location", { headers })

afterEach(() => vi.unstubAllGlobals())

describe("detectLocationFromRequest", () => {
  it("does not throw on a malformed URL-encoded geo header", async () => {
    const loc = await detectLocationFromRequest(
      req({ "x-vercel-ip-city": "%E0%A4", "x-vercel-ip-latitude": "28.6", "x-vercel-ip-longitude": "77.2" })
    )
    expect(loc).toMatchObject({ city: "%E0%A4", lat: 28.6, source: "vercel_headers" })
  })

  it("decodes Cloudflare headers", async () => {
    const loc = await detectLocationFromRequest(
      req({ "cf-ipcity": "S%C3%A3o%20Paulo", "cf-iplatitude": "-23.5", "cf-iplongitude": "-46.6" })
    )
    expect(loc).toMatchObject({ city: "São Paulo", source: "cloudflare_headers" })
  })

  it.each(["172.20.1.5", "10.0.0.1", "192.168.1.2", "fd00::1"])(
    "does not send private IP %s to the IP lookup",
    async (ip) => {
      const fetchMock = vi.fn().mockResolvedValue(Response.json({}))
      vi.stubGlobal("fetch", fetchMock)
      await detectLocationFromRequest(req({ "x-forwarded-for": ip }))
      expect(fetchMock.mock.calls[0][0]).not.toContain("ip=")
    }
  )

  it("sends a public IP to the IP lookup", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({ city: "Paris", countryName: "France", latitude: 48.8, longitude: 2.3 })
    )
    vi.stubGlobal("fetch", fetchMock)
    const loc = await detectLocationFromRequest(req({ "x-forwarded-for": "8.8.8.8, 10.0.0.1" }))
    expect(fetchMock.mock.calls[0][0]).toContain("ip=8.8.8.8")
    expect(loc).toMatchObject({ city: "Paris", source: "bigdatacloud_ip" })
  })
})
