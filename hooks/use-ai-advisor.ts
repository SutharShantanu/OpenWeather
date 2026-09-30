"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  buildAdvisorSnapshot,
  snapshotKey,
  type AdvisorBriefing,
  type ClimateNormals,
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
  /** The answer this question replies to, if any. */
  replyToId?: number
  reaction?: AdvisorReaction
}

export type AdvisorReaction = "up" | "down"

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
// Climate normals per location (null = unavailable); they change once a day.
const normalsCache = new Map<string, ClimateNormals | null>()
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

  // Today's long-term averages give the AI a "warmer/cooler than normal" baseline.
  const normalsKey = `${current.lat.toFixed(2)},${current.lon.toFixed(2)}`
  const [, setNormalsLoaded] = useState<string | null>(null)
  const normals = normalsCache.get(normalsKey) // undefined = not fetched yet
  useEffect(() => {
    if (!enabled || normalsCache.has(normalsKey)) return
    const controller = new AbortController()
    fetch(`/api/climate?lat=${current.lat}&lon=${current.lon}`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .catch(() => null)
      .then((data: ClimateNormals | null) => {
        if (controller.signal.aborted) return
        normalsCache.set(
          normalsKey,
          data && typeof data.avgHigh === "number" ? data : null
        )
        setNormalsLoaded(normalsKey)
      })
    return () => controller.abort()
  }, [enabled, normalsKey, current.lat, current.lon])

  const snapshot = useMemo(
    () =>
      buildAdvisorSnapshot(
        current,
        hourly,
        daily,
        alerts,
        unit,
        prefs,
        normals
      ),
    [current, hourly, daily, alerts, unit, prefs, normals]
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
    // Wait for the normals lookup (success or failure) so the briefing includes them.
    if (!enabled || briefingCache.has(key) || normals === undefined) return
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
  }, [enabled, key, language, snapshot, normals])

  const [answers, setAnswers] = useState<AdvisorAnswer[]>([])
  const answersRef = useRef(answers)
  useEffect(() => {
    answersRef.current = answers
  }, [answers])
  const nextId = useRef(0)
  const controllers = useRef(new Set<AbortController>())
  // Aborts started by stop() (vs. unmount) keep the partial answer.
  const stoppedByUser = useRef(new WeakSet<AbortController>())
  useEffect(() => {
    const active = controllers.current
    return () => active.forEach((c) => c.abort())
  }, [])

  const ask = useCallback(
    async (question: string, replyToId?: number) => {
      const id = ++nextId.current
      const update = (patch: Partial<AdvisorAnswer>) =>
        setAnswers((prev) =>
          prev.map((a) => (a.id === id ? { ...a, ...patch } : a))
        )
      // Context for follow-ups: the replied-to turn when replying, otherwise
      // the most recent completed turns for this location.
      const done = answersRef.current.filter(
        (a) => a.locationKey === locationKey && a.status === "done"
      )
      const repliedTo = done.find((a) => a.id === replyToId)
      const history = (
        repliedTo ? [repliedTo] : done.slice(0, 3).reverse()
      ).map((a) => ({ q: a.question, a: a.answer }))
      setAnswers((prev) => [
        {
          id,
          question,
          answer: "",
          status: "streaming",
          locationKey,
          replyToId: repliedTo?.id,
        },
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
        if ((err as Error).name === "AbortError") {
          if (!stoppedByUser.current.has(controller)) return // unmounted
          // Stopped: keep what was written so far; drop the turn if nothing was.
          if (answer.trim()) update({ answer, status: "done" })
          else setAnswers((prev) => prev.filter((a) => a.id !== id))
          return
        }
        update({ answer: fallbackAnswer(question), status: "fallback" })
      } finally {
        controllers.current.delete(controller)
      }
    },
    [language, snapshot, locationKey, fallbackAnswer]
  )

  /** Toggles a reaction on an answer (choosing the same one again clears it). */
  /** Stops any answer that is still being generated. */
  const stop = useCallback(() => {
    controllers.current.forEach((c) => {
      stoppedByUser.current.add(c)
      c.abort()
    })
  }, [])

  const react = useCallback((id: number, reaction: AdvisorReaction) => {
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, reaction: a.reaction === reaction ? undefined : reaction }
          : a
      )
    )
  }, [])

  return {
    briefing: cached,
    briefingStatus,
    answers: answers.filter((a) => a.locationKey === locationKey),
    ask,
    react,
    stop,
    isAsking: answers.some((a) => a.status === "streaming"),
  }
}
