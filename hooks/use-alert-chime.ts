"use client"

import { useEffect, useRef } from "react"
import type { WeatherAlert } from "@/lib/weather"

let ctx: AudioContext | null = null

function getContext() {
  const Ctor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  if (!Ctor) return null
  ctx ??= new Ctor()
  // Browsers keep a context suspended until the user has interacted with the
  // page; before that this stays silent instead of throwing.
  void ctx.resume().catch(() => {})
  return ctx
}

/** Soft "swoosh" for a dismissed notification: band-passed noise sweeping up. */
export function playDismissSound() {
  try {
    const ctx = getContext()
    if (!ctx) return
    const length = Math.floor(ctx.sampleRate * 0.22)
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.Q.value = 1.2
    const t0 = ctx.currentTime
    filter.frequency.setValueAtTime(500, t0)
    filter.frequency.exponentialRampToValueAtTime(3200, t0 + 0.2)
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t0)
    gain.gain.exponentialRampToValueAtTime(0.25, t0 + 0.06)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22)
    src.connect(filter).connect(gain).connect(ctx.destination)
    src.start(t0)
  } catch {
    // Audio is a nicety; never break the UI over it.
  }
}

/** Short synthesized two-step ping; higher pitch for Severe/Extreme alerts. */
function playChime(urgent: boolean) {
  try {
    const ctx = getContext()
    if (!ctx) return
    const t0 = ctx.currentTime
    const [first, second] = urgent ? [988, 740] : [659, 523]
    for (const [i, freq] of [first, second].entries()) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const start = t0 + i * 0.16
      osc.type = "sine"
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.3)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.3)
    }
  } catch {
    // Audio is a nicety; never break the UI over it.
  }
}

/** Plays one chime whenever alerts with ids not seen before arrive. */
export function useAlertChime(alerts: WeatherAlert[]) {
  const seen = useRef(new Set<string>())
  useEffect(() => {
    const fresh = alerts.filter((a) => !seen.current.has(a.id))
    if (fresh.length === 0) return
    fresh.forEach((a) => seen.current.add(a.id))
    playChime(
      fresh.some((a) => a.severity === "Extreme" || a.severity === "Severe")
    )
  }, [alerts])
}
