// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { useAiAdvisor } from "@/hooks/use-ai-advisor"
import type {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
} from "@/lib/weather"

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
  condition: {
    type: "SUNNY",
    main: "Clear",
    description: "clear sky",
    icon: "01d",
  },
  sunrise: 1,
  sunset: 2,
  dt: 1790678000,
} as CurrentWeather
const hourly: HourlyForecastItem[] = []
const daily: DailyForecastItem[] = []

/** Routes fetches: climate normals, briefing JSON, streamed answers. */
function mockApi(answers: string[]) {
  const bodies: Record<string, unknown>[] = []
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.startsWith("/api/climate"))
      return Response.json({ error: "x" }, { status: 503 })
    const body = JSON.parse(String(init?.body))
    bodies.push(body)
    if (body.mode === "briefing")
      return Response.json({ summary: "Clear.", alerts: [], outlook: [] })
    return new Response(answers.shift() ?? "ok")
  })
  vi.stubGlobal("fetch", fetchMock)
  return bodies
}

const setup = () =>
  renderHook(() =>
    useAiAdvisor({
      enabled: true,
      current,
      hourly,
      daily,
      unit: "C",
      language: "en",
      fallbackAnswer: () => "rule-based answer",
    })
  )

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("useAiAdvisor", () => {
  it("loads the briefing once normals have been looked up", async () => {
    mockApi([])
    const { result } = setup()
    await waitFor(() => expect(result.current.briefingStatus).toBe("ready"))
    expect(result.current.briefing?.summary).toBe("Clear.")
  })

  it("sends only the replied-to turn as history when replying", async () => {
    const bodies = mockApi([
      "Carry an umbrella.",
      "Wear light clothes.",
      "Around 19:00.",
    ])
    const { result } = setup()
    await act(() => result.current.ask("Umbrella?"))
    await act(() => result.current.ask("What to wear?"))
    const umbrella = result.current.answers.find(
      (a) => a.question === "Umbrella?"
    )!

    await act(() => result.current.ask("When exactly?", umbrella.id))
    const last = bodies.at(-1)!
    expect(last.history).toEqual([{ q: "Umbrella?", a: "Carry an umbrella." }])
    expect(result.current.answers[0]).toMatchObject({
      question: "When exactly?",
      replyToId: umbrella.id,
      status: "done",
    })
  })

  it("toggles reactions", async () => {
    mockApi(["Yes."])
    const { result } = setup()
    await act(() => result.current.ask("Umbrella?"))
    const id = result.current.answers[0].id
    act(() => result.current.react(id, "up"))
    expect(result.current.answers[0].reaction).toBe("up")
    act(() => result.current.react(id, "down"))
    expect(result.current.answers[0].reaction).toBe("down")
    act(() => result.current.react(id, "down"))
    expect(result.current.answers[0].reaction).toBeUndefined()
  })

  it("stop() keeps the partial answer, or drops the turn if nothing arrived", async () => {
    // A stream that sends one chunk, then waits until aborted.
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        if (url.startsWith("/api/climate")) return Response.json({}, { status: 503 })
        const body = JSON.parse(String(init?.body))
        if (body.mode === "briefing") return Response.json({ summary: "", alerts: [], outlook: [] })
        const signal = init!.signal!
        const stream = new ReadableStream<Uint8Array>({
          start(controller) {
            if (body.question === "partial") controller.enqueue(new TextEncoder().encode("Carry an"))
            signal.addEventListener("abort", () => controller.error(new DOMException("aborted", "AbortError")))
          },
        })
        if (signal.aborted) throw new DOMException("aborted", "AbortError")
        return new Response(stream)
      })
    )
    const { result } = setup()

    let pending: Promise<void>
    act(() => {
      pending = result.current.ask("partial")
    })
    await waitFor(() => expect(result.current.answers[0]?.answer).toBe("Carry an"))
    expect(result.current.isAsking).toBe(true)
    await act(async () => {
      result.current.stop()
      await pending
    })
    expect(result.current.answers[0]).toMatchObject({ answer: "Carry an", status: "done" })
    expect(result.current.isAsking).toBe(false)

    act(() => {
      pending = result.current.ask("empty")
    })
    await act(async () => {
      result.current.stop()
      await pending
    })
    expect(result.current.answers.map((a) => a.question)).toEqual(["partial"])
  })

  it("falls back to the rule-based answer when the AI fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({}, { status: 503 }))
    )
    const { result } = setup()
    await act(() => result.current.ask("Umbrella?"))
    expect(result.current.answers[0]).toMatchObject({
      answer: "rule-based answer",
      status: "fallback",
    })
  })
})
