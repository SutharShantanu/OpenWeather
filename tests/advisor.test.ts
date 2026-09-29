import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { NextRequest } from "next/server"
import { POST } from "@/app/api/advisor/route"
import type { AdvisorSnapshot } from "@/lib/advisor"

let observedAt = 1_000
const snapshot = (): AdvisorSnapshot => ({
  location: { city: "Dadri", country: "India", lat: 28.58, lon: 77.33 },
  observedAt: observedAt++, // unique per test so the route cache starts cold
  units: {
    temperature: "°C",
    wind: "km/h",
    pressure: "hPa",
    precipitation: "mm",
    visibility: "km",
  },
  now: {
    condition: "clear sky",
    temp: 31,
    feelsLike: 33,
    humidity: 58,
    wind: 7,
    windFromDeg: 290,
    pressure: 1007,
    cloudCover: 5,
    visibility: 4,
    sunrise: "06:11",
    sunset: "18:06",
  },
  next24h: [
    {
      time: "19:00",
      condition: "light rain",
      temp: 26,
      feelsLike: 27,
      humidity: 80,
      rainChance: 60,
      precipitation: 1.2,
      wind: 18,
    },
  ],
  next7d: [
    {
      day: "TODAY",
      date: "2026-09-29",
      condition: "clear sky",
      min: 23,
      max: 32,
      humidity: 55,
      rainChance: 60,
      windMax: 20,
    },
  ],
  averages: {
    next24h: {
      temp: 28,
      feelsLike: 30,
      humidity: 62,
      wind: 10,
      totalPrecipitation: 1.2,
    },
    next7d: { high: 32, low: 24, totalPrecipitation: 1.2, rainyDays: 1 },
  },
  alerts: [],
})

const post = (body: unknown) =>
  POST(
    new NextRequest("http://localhost/api/advisor", {
      method: "POST",
      body: JSON.stringify(body),
    })
  )

const briefing = {
  summary: "Hot and clear.",
  alerts: [
    {
      title: "Rain",
      detail: "60% at 19:00",
      action: "Umbrella",
      timing: "19:00",
      urgency: "MEDIUM",
    },
  ],
  outlook: [
    {
      period: "Tomorrow",
      summary: "Dry",
      temperatureShift: "+1°C",
      precipitationRisk: "Low",
    },
    {
      period: "Weekend",
      summary: "Hot",
      temperatureShift: "+3°C",
      precipitationRisk: "Dry",
    },
  ],
}
const geminiJson = (text: string) =>
  Response.json({ candidates: [{ content: { parts: [{ text }] } }] })
const geminiSse = (...chunks: string[]) =>
  new Response(
    chunks
      .map(
        (c) =>
          `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: c }] } }] })}\r\n\r\n`
      )
      .join("")
  )

beforeEach(() => vi.stubEnv("GEMINI_API_KEY", "test-key"))
afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("/api/advisor", () => {
  it("returns 503 when no Gemini key is configured", async () => {
    vi.stubEnv("GEMINI_API_KEY", "")
    expect(
      (await post({ mode: "briefing", lang: "en", snapshot: snapshot() }))
        .status
    ).toBe(503)
  })

  it.each([
    [{ mode: "nope", snapshot: snapshot() }],
    [{ mode: "briefing", snapshot: {} }],
    [{ mode: "ask", snapshot: snapshot(), question: "" }],
    [{ mode: "ask", snapshot: snapshot(), question: "x".repeat(501) }],
  ])("rejects invalid input %#", async (body) => {
    expect((await post(body)).status).toBe(400)
  })

  it("returns a structured briefing grounded in the snapshot and caches it", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(geminiJson(JSON.stringify(briefing)))
    vi.stubGlobal("fetch", fetchMock)
    const body = { mode: "briefing", lang: "hi", snapshot: snapshot() }

    const first = await post(body)
    expect(first.status).toBe(200)
    expect(await first.json()).toEqual(briefing)
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(sent.systemInstruction.parts[0].text).toContain("Hindi")
    expect(sent.contents[0].parts[0].text).toContain('"city":"Dadri"')
    expect(sent.generationConfig.responseMimeType).toBe("application/json")

    await post(body)
    expect(fetchMock).toHaveBeenCalledTimes(1) // second request served from cache
  })

  it("falls back to the next model when the first is overloaded", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        Response.json({ error: { message: "busy" } }, { status: 503 })
      )
      .mockResolvedValueOnce(geminiJson(JSON.stringify(briefing)))
    vi.stubGlobal("fetch", fetchMock)
    const res = await post({
      mode: "briefing",
      lang: "en",
      snapshot: snapshot(),
    })
    expect(res.status).toBe(200)
    expect(fetchMock.mock.calls[0][0]).not.toBe(fetchMock.mock.calls[1][0])
  })

  it("returns 502 when every model fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(Response.json({}, { status: 503 }))
    )
    expect(
      (await post({ mode: "briefing", lang: "en", snapshot: snapshot() }))
        .status
    ).toBe(502)
  })

  it("streams answers chunk by chunk (CRLF-separated SSE) and caches fresh questions", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        geminiSse("Yes, ", "carry an umbrella ", "after 19:00.")
      )
    vi.stubGlobal("fetch", fetchMock)
    const body = {
      mode: "ask",
      lang: "en",
      snapshot: snapshot(),
      question: "Umbrella?",
    }

    const res = await post(body)
    expect(res.headers.get("content-type")).toContain("text/plain")
    expect(await res.text()).toBe("Yes, carry an umbrella after 19:00.")
    expect(await (await post(body)).text()).toBe(
      "Yes, carry an umbrella after 19:00."
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("does not stall when an SSE event is split across network chunks", async () => {
    const event = `data: ${JSON.stringify({ candidates: [{ content: { parts: [{ text: "Stay dry." }] } }] })}\r\n\r\n`
    const encoder = new TextEncoder()
    const pieces = [event.slice(0, 10), event.slice(10, 30), event.slice(30)] // no complete event until the last piece
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        pieces.forEach((p) => controller.enqueue(encoder.encode(p)))
        controller.close()
      },
    })
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)))
    const res = await post({
      mode: "ask",
      lang: "en",
      snapshot: snapshot(),
      question: "Split?",
    })
    expect(await res.text()).toBe("Stay dry.")
  })

  it("sends follow-up history to Gemini and does not cache it", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementation(async () => geminiSse("Around 19:00."))
    vi.stubGlobal("fetch", fetchMock)
    const body = {
      mode: "ask",
      lang: "en",
      snapshot: snapshot(),
      question: "When exactly?",
      history: [{ q: "Umbrella?", a: "Yes." }],
    }
    await (await post(body)).text()
    await (await post(body)).text()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const roles = JSON.parse(fetchMock.mock.calls[0][1].body).contents.map(
      (c: { role: string }) => c.role
    )
    expect(roles).toEqual(["user", "model", "user", "model", "user"])
  })
})
