"use client"

import React, { createContext, useContext, useMemo } from "react"
import {
  Translations,
  getTranslation,
  translateCondition as translateConditionFn,
  translateDay as translateDayFn,
  SupportedLanguage,
} from "@/lib/translations"

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
  const value = useMemo<LanguageContextType>(() => {
    const t = getTranslation(language)
    return {
      language,
      t,
      translateCondition: (cond: string) => translateConditionFn(cond, language),
      translateDay: (day: string) => translateDayFn(day, language),
    }
  }, [language])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
