// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { act, cleanup, renderHook, waitFor } from "@testing-library/react"
import { useWeather } from "@/hooks/use-weather"
import { DEFAULT_EXTENDED_SETTINGS } from "@/components/settings/constants"

const weatherFor = (cityName: string) => ({ current: { cityName, lat: 1, lon: 2 } })

function setup(fetchImpl: (url: string) => Promise<Response>) {
  const fetchMock = vi.fn(fetchImpl)
  vi.stubGlobal("fetch", fetchMock)
  const hook = renderHook(() => useWeather({ settings: DEFAULT_EXTENDED_SETTINGS }))
  return { fetchMock, hook }
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

describe("useWeather", () => {
  it("loads weather and clears loading", async () => {
    const { hook } = setup(async () => Response.json(weatherFor("Paris")))
    await act(() => hook.result.current.fetchWeather("Paris"))
    expect(hook.result.current.weather?.current.cityName).toBe("Paris")
    expect(hook.result.current.loading).toBe(false)
    expect(hook.result.current.error).toBeNull()
  })

  it("releases loading when a repeat request is served from the dedupe cache", async () => {
    const { hook, fetchMock } = setup(async () => Response.json(weatherFor("Paris")))
    await act(() => hook.result.current.fetchWeather("Paris"))
    // Callers (Locate / Home) set loading before calling; a cache hit must clear it.
    act(() => hook.result.current.setLoading(true))
    await act(() => hook.result.current.fetchWeather("Paris"))
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(hook.result.current.loading).toBe(false)
  })

  it("refetch bypasses the dedupe cache", async () => {
    const { hook, fetchMock } = setup(async () => Response.json(weatherFor("Paris")))
    await act(() => hook.result.current.fetchWeather("Paris"))
    await act(() => hook.result.current.refetch())
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it("exposes the server error message on failure", async () => {
    const { hook } = setup(async () =>
      Response.json({ error: "Weather service is unavailable." }, { status: 502 })
    )
    await act(() => hook.result.current.fetchWeather("Paris"))
    expect(hook.result.current.error).toBe("Weather service is unavailable.")
    expect(hook.result.current.weather).toBeNull()
    expect(hook.result.current.loading).toBe(false)
  })

  it("keeps showing old data (no loading state) during a background refresh on reconnect", async () => {
    let resolveSecond: (r: Response) => void = () => {}
    let calls = 0
    const { hook } = setup(() => {
      calls++
      return calls === 1
        ? Promise.resolve(Response.json(weatherFor("Paris")))
        : new Promise<Response>((r) => (resolveSecond = r))
    })
    await act(() => hook.result.current.fetchWeather("Paris"))
    act(() => {
      window.dispatchEvent(new Event("online"))
    })
    await waitFor(() => expect(calls).toBe(2))
    expect(hook.result.current.loading).toBe(false)
    expect(hook.result.current.weather?.current.cityName).toBe("Paris")
    await act(async () => resolveSecond(Response.json(weatherFor("Paris 2"))))
    await waitFor(() => expect(hook.result.current.weather?.current.cityName).toBe("Paris 2"))
  })
})
