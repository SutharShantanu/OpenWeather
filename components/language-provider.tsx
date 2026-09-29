"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import { NextIntlClientProvider } from "next-intl"
import {
  Translations,
  getTranslation,
  getLoadedMessages,
  loadMessages,
  resolveUiLanguage,
  translateCondition as translateConditionFn,
  translateDay as translateDayFn,
} from "@/lib/translations"
import { DirectionProvider } from "@/components/ui/direction"

export { useTranslations } from "next-intl"

const RTL_LANGUAGES = new Set(["ar", "he", "fa", "ur"])

/**
 * Loads (once, then cached) the messages for `language` and returns the locale
 * whose messages are ready: English until the requested locale has arrived.
 */
export function useActiveLocale(language: string) {
  const requested = resolveUiLanguage(language) ?? "en"
  const [, setLoadedLocale] = useState<string | null>(null)

  useEffect(() => {
    if (getLoadedMessages(requested)) return
    let cancelled = false
    loadMessages(requested).then(() => {
      if (!cancelled) setLoadedLocale(requested)
    })
    return () => {
      cancelled = true
    }
  }, [requested])

  return getLoadedMessages(requested) ? requested : "en"
}

interface LanguageContextType {
  language: string
  t: Translations
  translateCondition: (condition: string) => string
  translateDay: (day: string) => string
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  t: getTranslation("en"),
  translateCondition: (cond) => translateConditionFn(cond, "en"),
  translateDay: (day) => translateDayFn(day, "en"),
})

export function LanguageProvider({
  language,
  children,
}: {
  language: string
  children: React.ReactNode
}) {
  const locale = useActiveLocale(language)
  const messages = getLoadedMessages(locale)!
  const t = useMemo(() => getTranslation(locale), [locale])

  // The root layout is static and renders lang="en"; keep <html> in step with
  // the displayed language so screen readers and text direction follow it.
  const dir = RTL_LANGUAGES.has(locale) ? "rtl" : "ltr"
  useEffect(() => {
    const root = document.documentElement
    root.lang = locale
    root.dir = dir
  }, [locale, dir])

  const value = useMemo<LanguageContextType>(() => {
    return {
      language,
      t,
      translateCondition: (cond: string) => translateConditionFn(cond, locale),
      translateDay: (day: string) => translateDayFn(day, locale),
    }
  }, [language, locale, t])

  return (
    // timeZone only matters for next-intl date formatting, which the app does
    // not use (dates go through lib/format); fixed to avoid SSR/client mismatch.
    <NextIntlClientProvider locale={locale} messages={messages} timeZone="UTC">
      <LanguageContext.Provider value={value}>
        {/* Radix primitives (menus, tabs, sliders) read direction from here. */}
        <DirectionProvider dir={dir}>{children}</DirectionProvider>
      </LanguageContext.Provider>
    </NextIntlClientProvider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
