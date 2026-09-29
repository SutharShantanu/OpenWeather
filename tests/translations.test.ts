import { describe, expect, it } from "vitest"
import en from "@/messages/en.json"
import {
  SUPPORTED_UI_LANGUAGES,
  getTranslation,
  loadMessages,
  resolveUiLanguage,
  translateCondition,
} from "@/lib/translations"

const flatKeys = (o: object, p = ""): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === "object" ? flatKeys(v, `${p}${k}.`) : [`${p}${k}`]
  )
const placeholders = (s: string) => (s.match(/\{\w+/g) ?? []).sort()

describe("translations", () => {
  it.each(SUPPORTED_UI_LANGUAGES.filter((l) => l !== "en"))(
    "%s has every English key and the same placeholders",
    async (lang) => {
      const messages = await loadMessages(lang)
      expect(flatKeys(messages).sort()).toEqual(flatKeys(en).sort())
      const get = (o: object, key: string) =>
        key.split(".").reduce<unknown>((a, k) => (a as Record<string, unknown>)[k], o) as string
      for (const key of flatKeys(en)) {
        // English may use ICU plurals ({count, plural, ...}); compare argument names only.
        const expected = [...new Set(placeholders(get(en, key)))]
        expect([...new Set(placeholders(get(messages, key)))], `${lang}:${key}`).toEqual(expected)
      }
    }
  )

  it("formats parameterised strings and ICU plurals through next-intl", () => {
    const t = getTranslation("en")
    expect(t.alerts.activeAlerts(1)).toBe("1 Active Alert")
    expect(t.alerts.activeAlerts(3)).toBe("3 Active Alerts")
    expect(t.settingsDialog.speech.pitchValueText(-1.5)).toBe("-1.5 semitones")
  })

  it("falls back to English until a locale is loaded, then caches it", async () => {
    expect(resolveUiLanguage("pt-BR")).toBe("pt")
    await loadMessages("de")
    expect(getTranslation("de").common.refresh).toBe("Aktualisieren")
    expect(getTranslation("de")).toBe(getTranslation("de"))
  })

  it("translates weather conditions with keyword fallbacks", async () => {
    await loadMessages("fr")
    expect(translateCondition("light rain", "fr")).not.toBe("light rain")
    expect(translateCondition("", "fr")).toBe("")
  })
})
