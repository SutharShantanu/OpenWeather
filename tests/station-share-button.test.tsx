// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { StationShareButton } from "@/components/station-share-button"
import type { CurrentWeather } from "@/lib/weather"

const mockCurrent: CurrentWeather = {
  temp: 22,
  feelsLike: 21,
  tempMin: 18,
  tempMax: 25,
  pressure: 1013,
  humidity: 60,
  dewPoint: 14,
  windSpeed: 4.5,
  windDeg: 180,
  clouds: 20,
  visibility: 10000,
  uvIndex: 4,
  dt: 1700000000,
  lat: 28.6139,
  lon: 77.209,
  cityName: "New Delhi",
  country: "India",
  sunrise: 1700000000,
  sunset: 1700040000,
  condition: {
    main: "Clear",
    description: "clear sky",
    icon: "01d",
    type: "SUNNY",
  },
}

beforeAll(() => {
  window.HTMLElement.prototype.scrollIntoView = vi.fn()
  window.HTMLElement.prototype.hasPointerCapture = vi.fn()
  window.HTMLElement.prototype.setPointerCapture = vi.fn()
  window.HTMLElement.prototype.releasePointerCapture = vi.fn()
})

beforeEach(() => {
  Object.defineProperty(window, "location", {
    value: {
      origin: "https://openweather.app",
      pathname: "/",
      search: "",
    },
    writable: true,
  })

  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined),
    },
  })
})

afterEach(cleanup)

describe("StationShareButton", () => {
  it("renders trigger button with shareStation label and opens menu", async () => {
    render(<StationShareButton current={mockCurrent} unit="C" />)

    const trigger = screen.getByRole("button", { name: /share/i })
    expect(trigger).toBeDefined()
    expect(trigger.getAttribute("title")).toBe("Share")

    // Radix dropdown triggers open on pointerDown or space/enter
    fireEvent.pointerDown(trigger, { pointerId: 1, button: 0 })
    fireEvent.keyDown(trigger, { key: "ArrowDown" })

    await waitFor(() => {
      expect(screen.getByText("New Delhi Telemetry")).toBeDefined()
      expect(screen.getByText("Copy Station Link")).toBeDefined()
      expect(screen.getByText("Share on X")).toBeDefined()
      expect(screen.getByText("Share on WhatsApp")).toBeDefined()
      expect(screen.getByText("Share on Telegram")).toBeDefined()
      expect(screen.getByText("Send via Email")).toBeDefined()
    })

    // Verify X (Twitter) redirect link contains correct canonical station params
    const xLink = screen.getByRole("menuitem", { name: /Share on X/i }).querySelector("a") || screen.getByRole("menuitem", { name: /Share on X/i })
    const xHref = xLink.getAttribute("href") || ""
    expect(xHref).toContain("twitter.com/intent/tweet")
    expect(xHref).toContain("28.6139")
    expect(xHref).toContain("77.2090")
    expect(decodeURIComponent(xHref)).toContain("New Delhi")

    // Verify WhatsApp redirect link
    const waLink = screen.getByRole("menuitem", { name: /Share on WhatsApp/i }).querySelector("a") || screen.getByRole("menuitem", { name: /Share on WhatsApp/i })
    const waHref = waLink.getAttribute("href") || ""
    expect(waHref).toContain("whatsapp.com/send")
    expect(decodeURIComponent(waHref)).toContain("New Delhi")

    // Verify Telegram redirect link
    const tgLink = screen.getByRole("menuitem", { name: /Share on Telegram/i }).querySelector("a") || screen.getByRole("menuitem", { name: /Share on Telegram/i })
    const tgHref = tgLink.getAttribute("href") || ""
    expect(tgHref).toContain("t.me/share/url")
  })

  it("copies canonical deep link with coordinates to clipboard", async () => {
    render(<StationShareButton current={mockCurrent} unit="C" />)

    const trigger = screen.getByRole("button", { name: /share/i })
    fireEvent.pointerDown(trigger, { pointerId: 1, button: 0 })
    fireEvent.keyDown(trigger, { key: "ArrowDown" })

    const copyItem = await screen.findByText("Copy Station Link")
    fireEvent.click(copyItem)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "https://openweather.app/?lat=28.6139&lon=77.2090&city=New+Delhi"
      )
    })
  })
})
