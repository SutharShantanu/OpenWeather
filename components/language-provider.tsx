"use client"

import React, { createContext, useContext, useMemo } from "react"
import { NextIntlClientProvider } from "next-intl"
import {
  Translations,
  getTranslation,
  getMessagesForLocale,
  resolveUiLanguage,
  translateCondition as translateConditionFn,
  translateDay as translateDayFn,
} from "@/lib/translations"

export { useTranslations } from "next-intl"

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
  const resolvedLang = resolveUiLanguage(language) ?? "en"
  const messages = useMemo(() => getMessagesForLocale(resolvedLang), [resolvedLang])
  const t = useMemo(() => getTranslation(resolvedLang), [resolvedLang])

  const value = useMemo<LanguageContextType>(() => {
    return {
      language,
      t,
      translateCondition: (cond: string) => translateConditionFn(cond, language),
      translateDay: (day: string) => translateDayFn(day, language),
    }
  }, [language, t])

  return (
    <NextIntlClientProvider locale={resolvedLang} messages={messages}>
      <LanguageContext.Provider value={value}>
        {children}
      </LanguageContext.Provider>
    </NextIntlClientProvider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
