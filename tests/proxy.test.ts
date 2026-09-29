import { describe, expect, it } from "vitest"
import { NextRequest } from "next/server"
import { proxy } from "@/proxy"

const hit = (path: string, ip: string) =>
  proxy(new NextRequest(`http://localhost${path}`, { headers: { "x-forwarded-for": ip } }))

describe("API rate limiting", () => {
  it("allows 60 requests per minute, then returns 429 with Retry-After", () => {
    for (let i = 0; i < 60; i++) expect(hit("/api/weather", "1.1.1.1").status).not.toBe(429)
    const blocked = hit("/api/weather", "1.1.1.1")
    expect(blocked.status).toBe(429)
    expect(Number(blocked.headers.get("Retry-After"))).toBeGreaterThan(0)
  })

  it("counts each IP separately", () => {
    expect(hit("/api/weather", "2.2.2.2").status).not.toBe(429)
  })

  it("applies the stricter TTS limit", () => {
    for (let i = 0; i < 20; i++) hit("/api/tts", "3.3.3.3")
    expect(hit("/api/tts", "3.3.3.3").status).toBe(429)
    expect(hit("/api/search", "3.3.3.3").status).not.toBe(429)
  })
})
