// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from "vitest"
import { cleanup, render, waitFor } from "@testing-library/react"
import { StreamingText } from "@/components/ai-advisor-dialog"

// jsdom has no matchMedia; report "no reduced motion".
beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia
})
afterEach(cleanup)

describe("StreamingText", () => {
  it("types streamed text out progressively, then drops the typing dots", async () => {
    const text = "Carry an umbrella after 19:00; rain chance rises to 60%."
    const { container, rerender } = render(<StreamingText text={text} streaming />)
    expect(container.textContent).toBe("") // starts empty, dots only
    expect(container.querySelector(".animate-bounce")).not.toBeNull()

    await waitFor(() => expect(container.textContent!.length).toBeGreaterThan(0))
    expect(container.textContent!.length).toBeLessThan(text.length) // partially revealed

    rerender(<StreamingText text={text} streaming={false} />)
    await waitFor(() => expect(container.textContent).toBe(text))
    expect(container.querySelector(".animate-bounce")).toBeNull()
  })

  it("shows completed answers immediately", () => {
    const { container } = render(<StreamingText text="Done." streaming={false} />)
    expect(container.textContent).toBe("Done.")
    expect(container.querySelector(".animate-bounce")).toBeNull()
  })
})
