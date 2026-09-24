"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useTranslation } from "@/components/language-provider"
import type { Translations } from "@/lib/translations"

type ApiKeysText = Translations["settingsDialog"]["apiKeys"]

export type ApiKeyTestStatus = "idle" | "loading" | "success" | "error"

const KEY_TEST_TIMEOUT_MS = 10000

interface UseApiKeyValidationOptions {
  customApiKey?: string
  city?: string
}

interface KeyTestResult {
  /** The exact key text this result belongs to. */
  key: string
  status: ApiKeyTestStatus
  message: string
}

const IDLE_RESULT: KeyTestResult = { key: "", status: "idle", message: "" }

/**
 * Runs one key test at a time: aborts the previous request on re-test, key
 * edit or unmount, times out after KEY_TEST_TIMEOUT_MS, and ignores stale
 * responses. Results are tied to the key text they were produced for, so any
 * edit to the key immediately resets the displayed status.
 */
function useKeyTest(currentKey: string, text: ApiKeysText) {
  const [result, setResult] = useState<KeyTestResult>(IDLE_RESULT)
  const controllerRef = useRef<AbortController | null>(null)

  // Abort an in-flight test when the key text changes or on unmount.
  useEffect(() => {
    return () => {
      controllerRef.current?.abort()
      controllerRef.current = null
    }
  }, [currentKey])

  const run = useCallback(
    async (
      request: (signal: AbortSignal) => Promise<{
        status: "success" | "error"
        message: string
      }>,
      loadingMessage: string
    ) => {
      controllerRef.current?.abort()
      const controller = new AbortController()
      controllerRef.current = controller
      const timeout = setTimeout(() => controller.abort("timeout"), KEY_TEST_TIMEOUT_MS)
      const key = currentKey

      setResult({ key, status: "loading", message: loadingMessage })
      try {
        const outcome = await request(controller.signal)
        if (controllerRef.current !== controller) return
        setResult({ key, ...outcome })
      } catch {
        if (controllerRef.current !== controller) return
        setResult({
          key,
          status: "error",
          message:
            controller.signal.reason === "timeout"
              ? text.testTimedOut(KEY_TEST_TIMEOUT_MS / 1000)
              : text.networkError,
        })
      } finally {
        clearTimeout(timeout)
        if (controllerRef.current === controller) controllerRef.current = null
      }
    },
    [currentKey, text]
  )

  const visible = result.key === currentKey ? result : IDLE_RESULT
  return { status: visible.status, message: visible.message, run }
}

/**
 * Custom hook to manage API key visibility toggles and explicit key tests
 * for OpenWeather credentials. Keys are sent in
 * request headers, never in query strings.
 */
export function useApiKeyValidation({
  customApiKey,
  city,
}: UseApiKeyValidationOptions) {
  const { t } = useTranslation()
  const text = t.settingsDialog.apiKeys
  const [showOwmKey, setShowOwmKey] = useState(false)

  const owmKey = customApiKey?.trim() || ""

  const owmTest = useKeyTest(owmKey, text)
  const runOwmTest = owmTest.run

  const handleTestOpenWeatherKey = useCallback(() => {
    if (!owmKey) return
    const params = new URLSearchParams({ action: "validate" })
    if (city) params.set("city", city)
    return runOwmTest(async (signal) => {
      const res = await fetch(`/api/weather?${params.toString()}`, {
        headers: { "x-owm-api-key": owmKey },
        signal,
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.status === "ok") {
        const place = data.cityName || city || text.testLocationFallback
        const reading =
          typeof data.tempC === "number"
            ? ` ${text.liveReading(
                place,
                `${data.tempC.toFixed(1)}°C / ${((data.tempC * 9) / 5 + 32).toFixed(1)}°F${typeof data.humidity === "number" ? `, ${text.humidityValue(data.humidity)}` : ""}`
              )}`
            : ""
        return {
          status: "success",
          message: `${data.message || text.owmAccepted}${reading}`,
        }
      }
      return {
        status: "error",
        message: data.message || data.error || text.testFailedHttp(res.status),
      }
    }, text.contactingOwm)
  }, [owmKey, city, runOwmTest, text])

  return {
    showOwmKey,
    setShowOwmKey,
    owmTestStatus: owmTest.status,
    owmTestMsg: owmTest.message,
    hasCustomOwm: Boolean(owmKey),
    handleTestOpenWeatherKey,
  }
}
