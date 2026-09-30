import { describe, expect, it } from "vitest"
import { searchSettings, type SettingsSearchEntry } from "@/components/settings/components/widgets/settings-search"

const Icon = () => null
const entries: SettingsSearchEntry[] = [
  { tab: "units", title: "Temperature Unit", tabLabel: "Preferences › Units", icon: Icon, keywords: "celsius fahrenheit" },
  { tab: "units", title: "Wind Speed Unit", tabLabel: "Preferences › Units", icon: Icon, keywords: "kmh mph" },
  { tab: "appearance", title: "Display theme", tabLabel: "Preferences › Theme", icon: Icon, keywords: "dark light mode" },
  { tab: "localization", title: "Idioma y dialecto", tabLabel: "Preferencias › Región", icon: Icon },
]

describe("searchSettings", () => {
  it("returns nothing for an empty query", () => {
    expect(searchSettings(entries, "   ")).toEqual([])
  })

  it("matches keywords that are not in the title", () => {
    expect(searchSettings(entries, "fahrenheit").map((e) => e.title)).toEqual(["Temperature Unit"])
    expect(searchSettings(entries, "dark mode").map((e) => e.title)).toEqual(["Display theme"])
  })

  it("requires every word and ranks title prefix matches first", () => {
    expect(searchSettings(entries, "unit").map((e) => e.title)).toEqual(["Temperature Unit", "Wind Speed Unit"])
    expect(searchSettings(entries, "wind").map((e) => e.title)).toEqual(["Wind Speed Unit"])
    expect(searchSettings(entries, "wind celsius")).toEqual([])
  })

  it("ignores case and accents", () => {
    expect(searchSettings(entries, "REGION").map((e) => e.tab)).toEqual(["localization"])
  })
})
