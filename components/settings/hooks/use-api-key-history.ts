"use client"

import { useState, useEffect, useCallback } from "react"
import { STORAGE_KEYS } from "@/lib/constants"

export type ApiKeyProvider = "openweathermap" | "carto"

export interface ApiKeyHistoryEntry {
  id: string
  provider: ApiKeyProvider
  key: string
  maskedKey: string
  addedAt: number
  lastUsedAt: number
}

export function maskApiKey(key: string): string {
  const trimmed = key.trim()
  if (!trimmed) return ""
  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}••••${trimmed.slice(-2)}`
  }
  if (trimmed.startsWith("cb1_")) {
    return `${trimmed.slice(0, 8)}••••••••${trimmed.slice(-4)}`
  }
  return `${trimmed.slice(0, 6)}••••••••${trimmed.slice(-4)}`
}

function loadHistoryFromStorage(): ApiKeyHistoryEntry[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_KEYS_HISTORY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is ApiKeyHistoryEntry =>
          Boolean(item && item.id && item.provider && item.key)
      )
    }
  } catch {
    // LocalStorage parse error fallback
  }
  return []
}

function saveHistoryToStorage(entries: ApiKeyHistoryEntry[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEYS.API_KEYS_HISTORY, JSON.stringify(entries))
  } catch {
    // LocalStorage quota or access error
  }
}

interface UseApiKeyHistoryOptions {
  activeOwmKey?: string
  activeCartoKey?: string
}

export function useApiKeyHistory({
  activeOwmKey,
  activeCartoKey,
}: UseApiKeyHistoryOptions = {}) {
  const [history, setHistory] = useState<ApiKeyHistoryEntry[]>([])

  // Restore from localStorage after hydration (unavailable during SSR)
  useEffect(() => {
    try {
      const stored = loadHistoryFromStorage()
      const now = Date.now()
      const updated = [...stored]

      const trimmedOwm = activeOwmKey?.trim()
      if (
        trimmedOwm &&
        trimmedOwm.length >= 8 &&
        !updated.some((e) => e.provider === "openweathermap" && e.key === trimmedOwm)
      ) {
        updated.unshift({
          id: `owm_${now}_${Math.random().toString(36).slice(2, 7)}`,
          provider: "openweathermap",
          key: trimmedOwm,
          maskedKey: maskApiKey(trimmedOwm),
          addedAt: now,
          lastUsedAt: now,
        })
      }

      const trimmedCarto = activeCartoKey?.trim()
      if (
        trimmedCarto &&
        trimmedCarto.length >= 8 &&
        !updated.some((e) => e.provider === "carto" && e.key === trimmedCarto)
      ) {
        updated.unshift({
          id: `carto_${now}_${Math.random().toString(36).slice(2, 7)}`,
          provider: "carto",
          key: trimmedCarto,
          maskedKey: maskApiKey(trimmedCarto),
          addedAt: now,
          lastUsedAt: now,
        })
      }

      if (updated.length !== stored.length) {
        saveHistoryToStorage(updated)
      }

      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore and seed from external storage
      setHistory(updated)
    } catch {
      // Storage access error fallback
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEYS.API_KEYS_HISTORY) {
        setHistory(loadHistoryFromStorage())
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Explicit record function when user submits or validates a key
  const recordKey = useCallback((provider: ApiKeyProvider, key: string) => {
    const trimmed = key.trim()
    if (!trimmed || trimmed.length < 8) return

    setHistory((prev) => {
      const now = Date.now()
      const existingIdx = prev.findIndex(
        (e) => e.provider === provider && e.key === trimmed
      )
      let next: ApiKeyHistoryEntry[]
      if (existingIdx >= 0) {
        next = prev.map((item, idx) =>
          idx === existingIdx
            ? { ...item, lastUsedAt: now, maskedKey: maskApiKey(trimmed) }
            : item
        )
      } else {
        next = [
          {
            id: `${provider}_${now}_${Math.random().toString(36).slice(2, 7)}`,
            provider,
            key: trimmed,
            maskedKey: maskApiKey(trimmed),
            addedAt: now,
            lastUsedAt: now,
          },
          ...prev,
        ]
      }
      saveHistoryToStorage(next)
      return next
    })
  }, [])

  // Delete a specific entry
  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((e) => e.id !== id)
      saveHistoryToStorage(next)
      return next
    })
  }, [])

  // Clear all history or by provider
  const clearHistory = useCallback((provider?: ApiKeyProvider) => {
    setHistory((prev) => {
      const next = provider ? prev.filter((e) => e.provider !== provider) : []
      saveHistoryToStorage(next)
      return next
    })
  }, [])

  return {
    history,
    recordKey,
    removeEntry,
    clearHistory,
    owmHistory: history.filter((e) => e.provider === "openweathermap"),
    cartoHistory: history.filter((e) => e.provider === "carto"),
  }
}
