"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { WeatherSpeechSynthesizer } from "@/lib/speech"

export type PlaybackStatus = "idle" | "loading" | "playing" | "paused"

/** Which engine produced the audio currently loaded in a player. */
export type TtsProvider =
  | "edge-tts"
  | "web-speech"

export interface TtsRequest {
  text: string
  voiceName?: string
  language?: string
  deliveryStyle?: string
  /** Semitones; only the browser Web Speech fallback can apply it. */
  pitch?: number
}

interface UseTtsPlayerOptions {
  /** Playback rate and volume are applied client-side, live, to loaded audio. */
  rate?: number
  volumeGainDb?: number
  /** Max generated clips kept in memory (data URIs can be large). */
  cacheSize?: number
}

interface CachedClip {
  src: string
  provider: TtsProvider
}

function clampPlaybackRate(rate: number | undefined): number {
  return Math.max(0.5, Math.min(2.0, rate || 1.0))
}

/** dB gain -> HTMLMediaElement volume. Element volume can't exceed 1 (0 dB). */
function gainToVolume(gainDb: number | undefined): number {
  return Math.max(0, Math.min(1.0, Math.pow(10, (gainDb ?? 0) / 20)))
}

// Only one player may be audible app-wide; starting one stops whichever was active.
let activePlayer: { owner: object; stop: () => void } | null = null

/** audio element → gain (live volume) → analyser (visualizer) → speakers */
interface AudioGraph {
  source: MediaElementAudioSourceNode
  gain: GainNode
  analyser: AnalyserNode
}

// One AudioContext for the whole app (browsers cap how many can exist)
let sharedAudioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const Ctor =
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!sharedAudioContext || sharedAudioContext.state === "closed") {
    sharedAudioContext = new Ctor()
  }
  return sharedAudioContext
}

function dbToGain(gainDb: number | undefined): number {
  return Math.pow(10, (gainDb ?? 0) / 20)
}

/**
 * Routes an audio element through Web Audio so it can be analysed. Returns null
 * (caller plays the element directly) if the context isn't running or routing fails.
 */
function connectAudioGraph(audio: HTMLAudioElement, gainDb: number | undefined): AudioGraph | null {
  const ctx = getAudioContext()
  if (!ctx || ctx.state !== "running") return null
  try {
    const source = ctx.createMediaElementSource(audio)
    const gain = ctx.createGain()
    gain.gain.value = dbToGain(gainDb)
    const analyser = ctx.createAnalyser()
    // ~23 Hz bins at 48 kHz: fine enough to separate the low voice band into distinct bars
    analyser.fftSize = 2048
    analyser.smoothingTimeConstant = 0.68
    // Calibrated for spoken voice so bars neither saturate nor stay flat
    analyser.minDecibels = -90
    analyser.maxDecibels = -20
    source.connect(gain).connect(analyser).connect(ctx.destination)
    return { source, gain, analyser }
  } catch (err) {
    console.warn("Audio analyser unavailable, playing without it:", err)
    return null
  }
}

function disconnectAudioGraph(graph: AudioGraph | null) {
  if (!graph) return
  for (const node of [graph.source, graph.gain, graph.analyser]) {
    try {
      node.disconnect()
    } catch {}
  }
}

/**
 * Plays text through /api/tts (Edge neural TTS) with a browser Web Speech
 * fallback. Exposes one status machine — idle → loading → playing ⇄ paused → idle —
 * so callers can't start overlapping playback.
 */
export function useTtsPlayer({ rate, volumeGainDb, cacheSize = 5 }: UseTtsPlayerOptions = {}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const cacheRef = useRef<Map<string, CachedClip>>(new Map())
  const abortRef = useRef<AbortController | null>(null)
  // Incremented on every start/stop; async work checks it before touching audio.
  const generationRef = useRef(0)
  const usingWebSpeechRef = useRef(false)
  // Mirrors `status` synchronously so rapid clicks can't race React re-renders.
  const statusRef = useRef<PlaybackStatus>("idle")
  // Stable identity of this hook instance for the app-wide active-player slot
  const ownerRef = useRef<object>({})
  const isActiveOwner = () => activePlayer?.owner === ownerRef.current
  const graphRef = useRef<AudioGraph | null>(null)
  const levelsBufferRef = useRef<Uint8Array<ArrayBuffer> | null>(null)

  const [status, setStatusState] = useState<PlaybackStatus>("idle")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [provider, setProvider] = useState<TtsProvider | null>(null)

  const setStatus = useCallback((next: PlaybackStatus) => {
    statusRef.current = next
    setStatusState(next)
  }, [])

  /** Tear down any in-flight request and loaded audio without touching React state. */
  const release = useCallback(() => {
    generationRef.current++
    abortRef.current?.abort()
    abortRef.current = null
    const audio = audioRef.current
    if (audio) {
      audio.onloadedmetadata = null
      audio.onplay = null
      audio.onpause = null
      audio.ontimeupdate = null
      audio.onended = null
      audio.onerror = null
      audio.pause()
      audio.removeAttribute("src")
      audio.load()
      audioRef.current = null
    }
    disconnectAudioGraph(graphRef.current)
    graphRef.current = null
    if (usingWebSpeechRef.current) {
      usingWebSpeechRef.current = false
      WeatherSpeechSynthesizer.stop()
    }
  }, [])

  const stop = useCallback(() => {
    release()
    if (isActiveOwner()) activePlayer = null
    setStatus("idle")
    setCurrentTime(0)
    setDuration(0)
  }, [release, setStatus])

  // Unmount (tab switch, dialog close, layout change): silence this player.
  useEffect(
    () => () => {
      release()
      if (isActiveOwner()) activePlayer = null
    },
    [release]
  )

  // Apply rate/volume changes to audio that is already loaded (takes effect immediately).
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.playbackRate = clampPlaybackRate(rate)
    const graph = graphRef.current
    if (graph) {
      graph.gain.gain.setTargetAtTime(dbToGain(volumeGainDb), graph.gain.context.currentTime, 0.02)
    } else {
      audio.volume = gainToVolume(volumeGainDb)
    }
  }, [rate, volumeGainDb])

  /**
   * Live spectrum of the playing voice, as `bars` levels in 0..1 (speech band,
   * log-spaced). Returns null when nothing analysable is playing (e.g. browser voice).
   * Meant to be polled from requestAnimationFrame — it doesn't cause re-renders.
   */
  const readLevels = useCallback((bars: number): number[] | null => {
    const analyser = graphRef.current?.analyser
    if (!analyser) return null
    if (!levelsBufferRef.current || levelsBufferRef.current.length !== analyser.frequencyBinCount) {
      levelsBufferRef.current = new Uint8Array(analyser.frequencyBinCount)
    }
    const data = levelsBufferRef.current
    analyser.getByteFrequencyData(data)
    // Voice band 80 Hz – 5 kHz, split into log-spaced bars (like an EQ display)
    const binHz = analyser.context.sampleRate / 2 / data.length
    const minHz = 80
    const maxHz = 5000
    const levels: number[] = []
    for (let i = 0; i < bars; i++) {
      const fromHz = minHz * Math.pow(maxHz / minHz, i / bars)
      const toHz = minHz * Math.pow(maxHz / minHz, (i + 1) / bars)
      const start = Math.max(1, Math.floor(fromHz / binHz))
      const end = Math.max(start + 1, Math.ceil(toHz / binHz))
      let peak = 0
      for (let b = start; b < end && b < data.length; b++) peak = Math.max(peak, data[b])
      // Voice energy falls off with frequency; tilt so upper bars stay visible
      const tilt = 0.8 + 0.45 * (i / (bars - 1))
      levels.push(Math.min(1, (peak / 255) * tilt))
    }
    return levels
  }, [])

  /** Exact playhead of the loaded audio (for smooth per-frame progress UIs). */
  const getPosition = useCallback((): { currentTime: number; duration: number } | null => {
    const audio = audioRef.current
    if (!audio) return null
    const total = Number.isFinite(audio.duration) ? audio.duration : 0
    return { currentTime: audio.currentTime, duration: total }
  }, [])

  const pause = useCallback(() => {
    if (statusRef.current !== "playing") return
    if (audioRef.current) {
      audioRef.current.pause()
    } else if (usingWebSpeechRef.current) {
      WeatherSpeechSynthesizer.pause()
    }
    setStatus("paused")
  }, [setStatus])

  const resume = useCallback(() => {
    if (statusRef.current !== "paused") return
    if (audioRef.current) {
      audioRef.current
        .play()
        .then(() => setStatus("playing"))
        .catch((err) => {
          console.warn("TTS resume failed:", err)
          stop()
        })
    } else if (usingWebSpeechRef.current) {
      WeatherSpeechSynthesizer.resume()
      setStatus("playing")
    }
  }, [setStatus, stop])

  const seek = useCallback(
    (percentage: number) => {
      const audio = audioRef.current
      if (audio && duration > 0) {
        const target = Math.max(0, Math.min(duration, percentage * duration))
        audio.currentTime = target
        setCurrentTime(target)
      }
    },
    [duration]
  )

  const play = useCallback(
    async (request: TtsRequest) => {
      if (!request.text) return

      release()
      // Silence any other player (header briefing vs settings audition)
      if (activePlayer && !isActiveOwner()) activePlayer.stop()
      activePlayer = { owner: ownerRef.current, stop }

      // Unlock Web Audio while we're still inside the click's user gesture
      const audioContext = getAudioContext()
      const contextReady =
        audioContext && audioContext.state !== "running"
          ? audioContext.resume().catch(() => {})
          : Promise.resolve()

      const generation = generationRef.current
      const isCurrent = () => generation === generationRef.current
      const controller = new AbortController()
      abortRef.current = controller

      setStatus("loading")
      setCurrentTime(0)
      setDuration(0)

      const finish = () => {
        if (!isCurrent()) return
        usingWebSpeechRef.current = false
        audioRef.current = null
        disconnectAudioGraph(graphRef.current)
        graphRef.current = null
        if (isActiveOwner()) activePlayer = null
        setStatus("idle")
        setCurrentTime(0)
      }

      const startWebSpeech = () => {
        usingWebSpeechRef.current = true
        setProvider("web-speech")
        WeatherSpeechSynthesizer.speakWithWebSpeech(request.text, {
          rate,
          pitch: request.pitch,
          lang: request.language,
          voiceName: request.voiceName,
          volumeGainDb,
          onStart: () => {
            if (isCurrent()) setStatus("playing")
          },
          onEnd: finish,
          onError: finish,
        })
      }

      // Rate and volume are client-side, so they're not part of the cache key
      const cacheKey = JSON.stringify([
        request.text,
        request.voiceName,
        request.language,
        request.deliveryStyle ?? "",
      ])
      const cache = cacheRef.current

      try {
        let clip = cache.get(cacheKey)
        if (clip) {
          // Refresh LRU position
          cache.delete(cacheKey)
          cache.set(cacheKey, clip)
        } else {
          const res = await fetch("/api/tts", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: request.text,
              voiceName: request.voiceName,
              languageCode: request.language,
              deliveryStyle: request.deliveryStyle,
            }),
            signal: controller.signal,
          })
          const data = res.ok ? await res.json() : null
          if (!isCurrent()) return

          if (data?.audioContent) {
            clip = {
              src: `data:${data.mimeType || "audio/mpeg"};base64,${data.audioContent}`,
              provider: (data.provider as TtsProvider) || "edge-tts",
            }
            cache.set(cacheKey, clip)
            while (cache.size > cacheSize) {
              const oldest = cache.keys().next().value
              if (oldest === undefined) break
              cache.delete(oldest)
            }
          }
        }

        if (!isCurrent()) return
        abortRef.current = null

        // Route answered { fallback: true } (or failed): speak in the browser directly
        if (!clip) {
          startWebSpeech()
          return
        }

        const audio = new Audio(clip.src)
        audio.playbackRate = clampPlaybackRate(rate)
        setProvider(clip.provider)

        // Wait briefly for the context to unlock, then route through the analyser.
        // If it can't run, play the element directly (visualizer falls back to its idle animation).
        await Promise.race([contextReady, new Promise((r) => setTimeout(r, 300))])
        if (!isCurrent()) return
        const graph = connectAudioGraph(audio, volumeGainDb)
        graphRef.current = graph
        audio.volume = graph ? 1 : gainToVolume(volumeGainDb)

        const syncDuration = () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            setDuration(audio.duration)
          }
        }
        audio.onloadedmetadata = syncDuration
        audio.onplay = () => setStatus("playing")
        audio.onpause = () => {
          if (!audio.ended && audio.currentTime > 0) setStatus("paused")
        }
        audio.ontimeupdate = () => {
          if (!audio.ended) {
            setCurrentTime(audio.currentTime)
            syncDuration()
          }
        }
        audio.onended = finish
        audio.onerror = (e) => {
          console.warn("TTS audio playback error:", e)
          finish()
        }

        audioRef.current = audio
        try {
          await audio.play()
        } catch (err) {
          if (!isCurrent()) return
          // Chrome can reject play() with AbortError ("media was removed from the
          // document") for detached elements while playback still starts. Trust the
          // element: if it's playing (or a retry works), keep it and let its events drive state.
          if ((err as Error)?.name === "AbortError") {
            if (!audio.paused) return
            try {
              await audio.play()
              return
            } catch {
              if (!isCurrent() || !audio.paused) return
            }
          }
          // Autoplay blocked or undecodable audio. Fully silence and detach this
          // element first so it can never keep playing untracked, then use the browser voice.
          console.warn("TTS audio play failed, using browser speech:", err)
          audio.onplay = null
          audio.onpause = null
          audio.ontimeupdate = null
          audio.onended = null
          audio.onerror = null
          audio.pause()
          audioRef.current = null
          disconnectAudioGraph(graphRef.current)
          graphRef.current = null
          startWebSpeech()
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError" || !isCurrent()) return
        console.warn("TTS request failed, using browser speech:", err)
        startWebSpeech()
      }
    },
    [release, stop, setStatus, rate, volumeGainDb, cacheSize]
  )

  /** One-button control: start when idle, pause while playing, resume when paused. Ignored while loading. */
  const toggle = useCallback(
    (request: TtsRequest) => {
      switch (statusRef.current) {
        case "loading":
          return
        case "playing":
          pause()
          return
        case "paused":
          resume()
          return
        default:
          void play(request)
      }
    },
    [pause, resume, play]
  )

  return {
    status,
    currentTime,
    duration,
    provider,
    readLevels,
    getPosition,
    play,
    toggle,
    pause,
    resume,
    stop,
    seek,
  }
}
