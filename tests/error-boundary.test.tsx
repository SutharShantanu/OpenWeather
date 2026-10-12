// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import ErrorPage from "@/app/error"
import GlobalErrorPage from "@/app/global-error"

afterEach(cleanup)

describe("Error components", () => {
  it("renders Error and calls retry when Try Again is clicked", () => {
    const retryMock = vi.fn()
    const errorMock = new Error("Test error message")

    render(<ErrorPage error={errorMock} retry={retryMock} />)

    expect(screen.getByText("Something went wrong")).toBeDefined()

    const retryButton = screen.getByRole("button", { name: /try again/i })
    fireEvent.click(retryButton)

    expect(retryMock).toHaveBeenCalledTimes(1)
  })

  it("falls back to reset if retry is not provided in Error", () => {
    const resetMock = vi.fn()
    const errorMock = new Error("Test error message")

    render(<ErrorPage error={errorMock} reset={resetMock} />)

    const retryButton = screen.getByRole("button", { name: /try again/i })
    fireEvent.click(retryButton)

    expect(resetMock).toHaveBeenCalledTimes(1)
  })

  it("renders GlobalError and calls retry when clicked", () => {
    const retryMock = vi.fn()
    const errorMock = new Error("Global error message")

    render(<GlobalErrorPage error={errorMock} retry={retryMock} />)

    expect(screen.getByText("The app failed to load. Please try again.")).toBeDefined()

    const retryButton = screen.getByRole("button", { name: /try again/i })
    fireEvent.click(retryButton)

    expect(retryMock).toHaveBeenCalledTimes(1)
  })
})
