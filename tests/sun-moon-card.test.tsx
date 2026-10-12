// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { SunMoonCard } from "@/components/widgets/sun-moon-card"
import { TooltipProvider } from "@/components/ui/tooltip"
import type { CurrentWeather } from "@/lib/weather"

afterEach(cleanup)

const mockCurrent: CurrentWeather = {
  dt: 1760000000,
  temp: 22,
  feelsLike: 22,
  tempMin: 18,
  tempMax: 26,
  pressure: 1013,
  humidity: 45,
  dewPoint: 10,
  uvIndex: 5,
  clouds: 20,
  visibility: 10000,
  windSpeed: 3.5,
  windDeg: 180,
  condition: {
    type: "SUNNY",
    main: "Clear",
    description: "clear sky",
    icon: "01d",
  },
  sunrise: 1759982400,
  sunset: 1760025600,
  cityName: "Test City",
  country: "TC",
  lat: 28.4595,
  lon: 77.0266,
  utcOffsetSeconds: 19800,
}

describe("SunMoonCard", () => {
  it("renders standard cards for sun and moon phases matching widget card layout", () => {
    const { container } = render(
      <TooltipProvider>
        <SunMoonCard current={mockCurrent} />
      </TooltipProvider>
    )

    // Verify each phase card heading
    expect(screen.getByRole("heading", { name: "Sun" })).toBeDefined()
    expect(screen.getByRole("heading", { name: "Light phases" })).toBeDefined()
    expect(screen.getByRole("heading", { name: "Moon" })).toBeDefined()
    expect(screen.getByRole("heading", { name: "Upcoming" })).toBeDefined()

    // Verify each phase card uses card header and card content
    const cardHeaders = container.querySelectorAll("[data-slot=card-header]")
    expect(cardHeaders.length).toBe(4)

    const cardContents = container.querySelectorAll("[data-slot=card-content]")
    expect(cardContents.length).toBe(4)
  })

  it("opens the calendar panel, then shows the picked day's data", () => {
    render(
      <TooltipProvider>
        <SunMoonCard current={mockCurrent} />
      </TooltipProvider>
    )
    fireEvent.click(screen.getByRole("button", { name: "Moon calendar" }))
    const day = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("aria-label")?.includes("15"))
    expect(day).toBeDefined()
    fireEvent.click(day!)
    // calendar replaced by the day's figures with a way back
    expect(screen.queryAllByRole("grid").length).toBe(0)
    expect(screen.getAllByText("Sunrise").length).toBeGreaterThan(1)
  })
})
