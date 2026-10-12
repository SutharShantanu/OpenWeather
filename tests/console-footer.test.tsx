// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest"
import { cleanup, render, screen } from "@testing-library/react"
import { ConsoleFooter } from "@/components/console-footer"

afterEach(cleanup)

describe("ConsoleFooter", () => {
  it("renders console footer title and author github link", () => {
    render(<ConsoleFooter footerText="OpenWeather Precision Meteorological Console" />)

    expect(
      screen.getByText("OpenWeather Precision Meteorological Console")
    ).toBeDefined()
    expect(screen.getByText("Shantanu")).toBeDefined()
    expect(screen.getByText("@SutharShantanu")).toBeDefined()

    const authorLink = screen.getByRole("link", { name: /Shantanu/i })
    expect(authorLink.getAttribute("href")).toBe("https://github.com/SutharShantanu")
    expect(authorLink.getAttribute("target")).toBe("_blank")
  })

  it("renders repo and portfolio icon buttons without license or tech badges", () => {
    const { container } = render(<ConsoleFooter />)

    const repoButton = screen.getByRole("link", { name: /GitHub Repository/i })
    expect(repoButton.getAttribute("href")).toBe("https://github.com/SutharShantanu/OpenWeather")

    const portfolioButton = screen.getByRole("link", { name: /Portfolio/i })
    expect(portfolioButton.getAttribute("href")).toBe("https://sutharshantanu.github.io")

    // Verify license and tech stack are NOT rendered
    expect(container.textContent).not.toMatch(/license/i)
    expect(container.textContent).not.toMatch(/Next\.js 16/i)
    expect(container.textContent).not.toMatch(/Tailwind CSS/i)
  })

  it("renders localized text under a different language", async () => {
    const { loadMessages } = await import("@/lib/translations")
    const { LanguageProvider } = await import("@/components/language-provider")
    await loadMessages("es")

    render(
      <LanguageProvider language="es">
        <ConsoleFooter />
      </LanguageProvider>
    )

    expect(screen.getByText("Consola OpenWeather")).toBeDefined()
    expect(screen.getByText(/Todos los derechos reservados\./i)).toBeDefined()
    expect(screen.getByRole("link", { name: /Repositorio de GitHub/i })).toBeDefined()
  })
})
