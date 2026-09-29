"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  buildAdvisorSnapshot,
  snapshotKey,
  type AdvisorBriefing,
} from "@/lib/advisor"
import type {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherAlert,
} from "@/lib/weather"
import { useDisplayPreferences } from "@/components/display-preferences-provider"

export type BriefingStatus = "loading" | "ready" | "fallback"

export interface AdvisorAnswer {
  id: number
  question: string
  answer: string
  /** "fallback" = Gemini unavailable, answer came from the local rules. */
  status: "streaming" | "done" | "fallback"
  locationKey: string
}

interface UseAiAdvisorOptions {
  /** Only fetch while the advisor is visible. */
  enabled: boolean
  current: CurrentWeather
  hourly: HourlyForecastItem[]
  daily: DailyForecastItem[]
  alerts?: WeatherAlert[]
  unit: "C" | "F"
  language: string
  /** Rule-based answer used when the AI is unavailable. */
  fallbackAnswer: (question: string) => string
}

// Briefings per location + observation + language, kept for the session so
// reopening the dialog does not call the API again.
const briefingCache = new Map<string, AdvisorBriefing>()
const NO_ALERTS: WeatherAlert[] = []

/**
 * Gemini-backed weather advisor for the current location. The briefing is
 * fetched once per observation; questions stream their answers as they are
 * generated. Falls back to local rules when the AI is unavailable.
 */
export function useAiAdvisor({
  enabled,
  current,
  hourly,
  daily,
  alerts = NO_ALERTS,
  unit,
  language,
  fallbackAnswer,
}: UseAiAdvisorOptions) {
  const prefs = useDisplayPreferences()
  const snapshot = useMemo(
    () => buildAdvisorSnapshot(current, hourly, daily, alerts, unit, prefs),
    [current, hourly, daily, alerts, unit, prefs]
  )
  const key = snapshotKey(snapshot, language)
  const locationKey = `${snapshot.location.lat},${snapshot.location.lon}`

  const [failedKey, setFailedKey] = useState<string | null>(null)
  const [, setLoadedKey] = useState<string | null>(null)
  const cached = briefingCache.get(key) ?? null
  const briefingStatus: BriefingStatus = cached
    ? "ready"
    : failedKey === key
      ? "fallback"
      : "loading"

  useEffect(() => {
    if (!enabled || briefingCache.has(key)) return
    const controller = new AbortController()
    fetch("/api/advisor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: "briefing", lang: language, snapshot }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Advisor returned ${res.status}`)
        briefingCache.set(key, (await res.json()) as AdvisorBriefing)
        setLoadedKey(key)
      })
      .catch((err) => {
        if ((err as Error).name !== "AbortError") setFailedKey(key)
      })
    return () => controller.abort()
  }, [enabled, key, language, snapshot])

  const [answers, setAnswers] = useState<AdvisorAnswer[]>([])
  const answersRef = useRef(answers)
  useEffect(() => {
    answersRef.current = answers
  }, [answers])
  const nextId = useRef(0)
  const controllers = useRef(new Set<AbortController>())
  useEffect(() => {
    const active = controllers.current
    return () => active.forEach((c) => c.abort())
  }, [])

  const ask = useCallback(
    async (question: string) => {
      const id = ++nextId.current
      const update = (patch: Partial<AdvisorAnswer>) =>
        setAnswers((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
        )
      // Recent completed turns for this location give follow-ups context.
      const history = answersRef.current
        .filter((a) => a.locationKey === locationKey && a.status === "done")
        .slice(0, 3)
        .reverse()
        .map((a) => ({ q: a.question, a: a.answer }))
      setAnswers((prev) => [
        { id, question, answer: "", status: "streaming", locationKey },
        ...prev,
      ])

      const controller = new AbortController()
      controllers.current.add(controller)
      let answer = ""
      try {
        const res = await fetch("/api/advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "ask",
            lang: language,
            snapshot,
            question,
            history,
          }),
          signal: controller.signal,
        })
        if (!res.ok || !res.body)
          throw new Error(`Advisor returned ${res.status}`)
        const reader = res.body.pipeThrough(new TextDecoderStream()).getReader()
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          answer += value
          update({ answer })
        }
        if (!answer.trim()) throw new Error("Empty answer")
        update({ status: "done" })
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        update({ answer: fallbackAnswer(question), status: "fallback" })
      } finally {
        controllers.current.delete(controller)
      }
    },
    [language, snapshot, locationKey, fallbackAnswer]
  )

  return {
    briefing: cached,
    briefingStatus,
    answers: answers.filter((a) => a.locationKey === locationKey),
    ask,
  }
}
