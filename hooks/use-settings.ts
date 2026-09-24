"use client"

import { useState, useEffect, useCallback } from "react"
import { DEFAULT_EXTENDED_SETTINGS } from "@/components/settings/constants"
import type { ExtendedSettings } from "@/components/settings/types"
import { STORAGE_KEYS } from "@/lib/constants"

/**
 * Merges persisted settings over the defaults, dropping unknown keys and any
 * value whose type doesn't match the default (guards against stale or corrupt storage).
 */
function parseStoredSettings(raw: string | null): ExtendedSettings {
  if (!raw) return DEFAULT_EXTENDED_SETTINGS
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return DEFAULT_EXTENDED_SETTINGS
    }
    const merged: Record<string, unknown> = { ...DEFAULT_EXTENDED_SETTINGS }
    for (const [key, value] of Object.entries(parsed)) {
      if (!(key in DEFAULT_EXTENDED_SETTINGS)) continue
      const fallback = merged[key]
      if (fallback === undefined || typeof value === typeof fallback) {
        merged[key] = value
      }
    }
    return merged as unknown as ExtendedSettings
  } catch {
    return DEFAULT_EXTENDED_SETTINGS
  }
}

function persistSettings(settings: ExtendedSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
  } catch {
    // LocalStorage quota or access error
  }
}

/**
 * Custom hook to manage application settings with persistent localStorage sync.
 */
export function useSettings() {
  const [settings, setSettings] = useState<ExtendedSettings>(DEFAULT_EXTENDED_SETTINGS)

  // Restore from localStorage after hydration (unavailable during SSR), and
  // keep other open tabs in sync.
  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from external storage
      setSettings(parseStoredSettings(localStorage.getItem(STORAGE_KEYS.SETTINGS)))
    } catch {
      // LocalStorage access may fail in restricted environments
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.SETTINGS) {
        setSettings(parseStoredSettings(event.newValue))
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const updateSettings = useCallback((newPartial: Partial<ExtendedSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial }
      persistSettings(updated)
      return updated
    })
  }, [])

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_EXTENDED_SETTINGS)
    persistSettings(DEFAULT_EXTENDED_SETTINGS)
  }, [])

  const toggleUnit = useCallback(() => {
    setSettings((prev) => {
      const updated: ExtendedSettings = {
        ...prev,
        tempUnit: prev.tempUnit === "C" ? "F" : "C",
      }
      persistSettings(updated)
      return updated
    })
  }, [])

  return {
    settings,
    unit: settings.tempUnit,
    updateSettings,
    resetSettings,
    toggleUnit,
  }
}
