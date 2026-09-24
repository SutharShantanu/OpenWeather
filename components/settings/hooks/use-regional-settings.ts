"use client"

import { useState, useEffect, useCallback } from "react"
import {
  type RegionalLanguageOption,
  fetchLiveGoogleLanguages,
} from "@/lib/google-languages"
import { REGIONAL_LANGUAGES } from "../constants"
import type { ExtendedSettings } from "../types"

interface UseRegionalSettingsOptions {
  onUpdateSettings: (newSettings: Partial<ExtendedSettings>) => void
}

/**
 * Custom hook to manage dynamic regional languages fetching and language
 * selection.
 */
export function useRegionalSettings({
  onUpdateSettings,
}: UseRegionalSettingsOptions) {
  const [availableLanguages, setAvailableLanguages] =
    useState<RegionalLanguageOption[]>(REGIONAL_LANGUAGES)

  useEffect(() => {
    let cancelled = false
    fetchLiveGoogleLanguages()
      .then((list: RegionalLanguageOption[]) => {
        if (!cancelled && list.length > 0) setAvailableLanguages(list)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  // Neural voices are multilingual, so changing the language never overrides
  // the user's chosen voice.
  const handleSelectLanguage = useCallback(
    (val: string) => {
      if (!val) return
      onUpdateSettings({ language: val })
    },
    [onUpdateSettings]
  )

  return {
    availableLanguages,
    handleSelectLanguage,
  }
}
