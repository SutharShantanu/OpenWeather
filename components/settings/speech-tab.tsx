"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import {
  Sparkles,
  Sliders,
  Volume2,
  ChevronDown,
  History,
  Check,
  Users,
  User,
  UserCheck,
  Play,
  Pause,
  Square,
  Headphones,
  CircleX,
  Loader2,
} from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Item,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemActions,
  ItemGroup,
} from "@/components/ui/item"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { WeatherSpeechSynthesizer } from "@/lib/speech"
import {
  GeminiVoiceInfo,
  GoogleTtsAudioProfile,
  GEMINI_TTS_VOICES,
  GOOGLE_TTS_AUDIO_PROFILES,
  GOOGLE_TTS_PITCH_PRESETS,
  GOOGLE_TTS_VOLUME_PRESETS,
  resolveGeminiVoice,
} from "@/lib/google-tts"
import {
  DEFAULT_GOOGLE_AI_KEY,
  DEFAULT_GEMINI_TTS_MODEL,
} from "@/lib/constants"
import { cn } from "@/lib/utils"
import { TabBaseProps } from "./types"
import {
  SettingSliderCard,
  SelectionCheckIndicator,
} from "./shared-widgets"
import { Dot } from "../ui/dot"
import { Spinner } from "../ui/spinner"
import { IconTile } from "@/components/reui/icon-tile"

function formatTime(seconds: number): string {
  if (!seconds || isNaN(seconds) || seconds < 0) return "0:00"
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`
}

function getBarHeight(
  i: number,
  total: number,
  tick: number,
  status: "idle" | "loading" | "playing" | "paused",
  tone: string,
  pitch: number,
  speed: number
): number {
  const x = i / (total - 1)

  if (status === "idle") {
    // Elegant resting acoustic bell curve
    const resting = 16 + Math.sin(x * Math.PI) * 22 + Math.sin(x * Math.PI * 3) * 6
    return Math.round(resting)
  }

  if (status === "loading") {
    // Dynamic sweeping wave while synthesizing/buffering
    const sweep = Math.sin(tick * 0.25 - x * 6) * 30 + 35
    return Math.max(12, Math.min(85, Math.round(sweep)))
  }

  if (status === "paused") {
    // Static snapshot of waveform with amber styling
    const frozen = 20 + Math.sin(x * Math.PI) * 35 + Math.cos(x * 8) * 12
    return Math.max(14, Math.min(80, Math.round(frozen)))
  }

  // Live modulated animation when playing
  const phase = tick * 0.2 * speed + i * 0.45
  let wave = Math.sin(phase)

  let toneMult = 1.0
  let toneNoise = 0
  if (tone === "Upbeat") {
    toneMult = 1.45
    toneNoise = Math.sin(tick * 0.45 * speed + i * 1.3) * 22
  } else if (tone === "Firm") {
    toneMult = 1.15
    toneNoise = (i % 2 === 0 ? 15 : -10) * Math.cos(tick * 0.28 * speed)
  } else if (tone === "Bright") {
    toneMult = 1.0 + x * 0.7
    toneNoise = Math.cos(tick * 0.35 * speed + i * 0.9) * 18
  } else if (tone === "Smooth") {
    toneMult = 0.85
    wave = Math.sin(tick * 0.12 * speed + x * Math.PI * 2)
  } else {
    toneMult = 1.0
    toneNoise = Math.sin(tick * 0.22 * speed + i * 0.7) * 12
  }

  const pitchBias = (x - 0.5) * (pitch / 4.0) * 35
  const baseHeight = 42 + wave * 28 * toneMult + toneNoise + pitchBias
  return Math.max(12, Math.min(95, Math.round(baseHeight)))
}

interface AudioToneVisualizerProps {
  status: "idle" | "loading" | "playing" | "paused"
  tone: string
  pitch: number
  speed: number
  currentTime: number
  duration: number
  onSeek: (percentage: number) => void
}

function AudioToneVisualizer({
  status,
  tone,
  pitch,
  speed,
  currentTime,
  duration,
  onSeek,
}: AudioToneVisualizerProps) {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (status !== "playing" && status !== "loading") return
    const interval = setInterval(() => {
      setTick((t) => (t + 1) % 1000)
    }, 45)
    return () => clearInterval(interval)
  }, [status])

  const numBars = 28
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0

  return (
    <Card className="gap-2 rounded-none border border-primary/20 bg-background/50 p-2.5 py-2.5 w-full shadow-none ring-0">
      {/* Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-nano text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-1.5 rounded-full transition-colors",
              status === "playing"
                ? "bg-primary animate-ping"
                : status === "paused"
                ? "bg-amber-500"
                : status === "loading"
                ? "bg-primary animate-pulse"
                : "bg-muted-foreground/50"
            )}
          />
          <span className="font-semibold uppercase tracking-wider text-foreground/80">
            {status === "playing"
              ? "Live Acoustic Telemetry"
              : status === "paused"
              ? "Playback Paused"
              : status === "loading"
              ? "Synthesizing Neural Audio..."
              : "Acoustic Spectrum Monitor"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>
            Tone: <strong className="text-foreground">{tone}</strong>
          </span>
          <span>•</span>
          <span>
            Pitch:{" "}
            <strong className="text-foreground">
              {pitch > 0 ? `+${pitch.toFixed(1)}` : `${pitch.toFixed(1)}`}st
            </strong>
          </span>
          <span>•</span>
          <span>
            Rate: <strong className="text-foreground">{speed.toFixed(2)}x</strong>
          </span>
        </div>
      </div>

      {/* Visualizer Frequency Bars */}
      <div className="flex h-10 w-full items-end justify-between gap-1 px-1 py-1 select-none">
        {Array.from({ length: numBars }).map((_, i) => {
          const height = getBarHeight(
            i,
            numBars,
            tick,
            status,
            tone,
            pitch,
            speed
          )
          return (
            <div
              key={i}
              className={cn(
                "w-full rounded-xs transition-[height] duration-75 ease-out",
                status === "playing"
                  ? "bg-primary shadow-2xs shadow-primary/30"
                  : status === "paused"
                  ? "bg-amber-500/50"
                  : status === "loading"
                  ? "bg-primary/50"
                  : "bg-muted-foreground/30"
              )}
              style={{ height: `${height}%` }}
            />
          )
        })}
      </div>

      {/* Progress Track & Interactive Scrubber */}
      <div className="flex items-center justify-between gap-2.5 pt-1">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Audio playback scrubber"
          aria-valuenow={currentTime}
          aria-valuemin={0}
          aria-valuemax={duration || 1}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const pct = Math.max(0, Math.min(1, clickX / rect.width))
            onSeek(pct)
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight" && duration > 0) {
              onSeek(Math.min(1, (currentTime + 1) / duration))
            } else if (e.key === "ArrowLeft" && duration > 0) {
              onSeek(Math.max(0, (currentTime - 1) / duration))
            }
          }}
          className="group relative h-2.5 flex-1 cursor-pointer overflow-hidden rounded-full bg-border/70 hover:bg-border transition-colors select-none"
        >
          <div
            className={cn(
              "h-full transition-all duration-75 relative",
              status === "playing"
                ? "bg-primary shadow-xs"
                : status === "paused"
                ? "bg-amber-500"
                : status === "loading"
                ? "bg-primary/60 animate-pulse"
                : "bg-muted-foreground/40"
            )}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-foreground shadow-xs opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Formatted Elapsed Time / Total Duration */}
        <span className="font-mono text-nano text-muted-foreground shrink-0 tabular-nums">
          {formatTime(currentTime)} / {formatTime(duration || 0)}
        </span>
      </div>
    </Card>
  )
}

export function SpeechTabContent({ settings, onUpdateSettings }: TabBaseProps) {
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const audioCacheRef = React.useRef<Map<string, string>>(new Map())
  const [playbackStatus, setPlaybackStatus] = useState<
    "idle" | "loading" | "playing" | "paused"
  >("idle")
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Maintain recently chosen voices in local state & localStorage
  const [recentVoiceIds, setRecentVoiceIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("openweather_recent_voices")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch { }
    }
    return ["Kore", "Puck", "Zephyr"]
  })

  // Clean up any ongoing speech synthesis when unmounting or switching tabs
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.src = ""
        audioRef.current = null
      }
      WeatherSpeechSynthesizer.stop()
    }
  }, [])

  const handleStopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    WeatherSpeechSynthesizer.stop()
    setPlaybackStatus("idle")
    setCurrentTime(0)
  }

  const handlePausePreview = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
    } else {
      WeatherSpeechSynthesizer.pause()
    }
    setPlaybackStatus("paused")
  }

  const handleResumePreview = () => {
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => {
          setPlaybackStatus("playing")
        })
        .catch(console.warn)
    } else {
      WeatherSpeechSynthesizer.resume()
      setPlaybackStatus("playing")
    }
  }

  const handleSeek = (percentage: number) => {
    if (audioRef.current && duration > 0) {
      const target = Math.max(0, Math.min(duration, percentage * duration))
      audioRef.current.currentTime = target
      setCurrentTime(target)
    }
  }

  const activeVoiceId =
    settings.geminiVoice ||
    resolveGeminiVoice(settings.googleTtsVoice) ||
    "Kore"
  const activeVoice =
    GEMINI_TTS_VOICES.find((v) => v.id === activeVoiceId) ||
    GEMINI_TTS_VOICES[0]

  const [selectedTone, setSelectedTone] = useState<string | null>(null)

  const availableTones = useMemo(() => {
    const toneOrder = ["Firm", "Upbeat", "Informative", "Bright", "Smooth"]
    const uniqueTones = Array.from(new Set(GEMINI_TTS_VOICES.map((v) => v.tone)))
    return uniqueTones.sort(
      (a, b) => toneOrder.indexOf(a) - toneOrder.indexOf(b)
    )
  }, [])

  const maleVoices = useMemo(
    () => GEMINI_TTS_VOICES.filter((v) => v.gender === "MALE"),
    []
  )
  const femaleVoices = useMemo(
    () => GEMINI_TTS_VOICES.filter((v) => v.gender === "FEMALE"),
    []
  )

  const filteredAllVoices = useMemo(() => {
    if (!selectedTone) return GEMINI_TTS_VOICES
    return GEMINI_TTS_VOICES.filter((v) => v.tone === selectedTone)
  }, [selectedTone])

  const filteredMaleVoices = useMemo(() => {
    if (!selectedTone) return maleVoices
    return maleVoices.filter((v) => v.tone === selectedTone)
  }, [maleVoices, selectedTone])

  const filteredFemaleVoices = useMemo(() => {
    if (!selectedTone) return femaleVoices
    return femaleVoices.filter((v) => v.tone === selectedTone)
  }, [femaleVoices, selectedTone])

  const recentVoices = useMemo(() => {
    const list = recentVoiceIds
      .map((id) => GEMINI_TTS_VOICES.find((v) => v.id === id))
      .filter(Boolean) as GeminiVoiceInfo[]
    return list.length > 0 ? list : [GEMINI_TTS_VOICES[0], GEMINI_TTS_VOICES[1]]
  }, [recentVoiceIds])

  const handleSelectVoice = (voiceId: string) => {
    handleStopPreview()
    const voice = GEMINI_TTS_VOICES.find((v) => v.id === voiceId)
    if (!voice) return

    setRecentVoiceIds((prev) => {
      const updated = [voiceId, ...prev.filter((id) => id !== voiceId)].slice(
        0,
        4
      )
      try {
        localStorage.setItem(
          "openweather_recent_voices",
          JSON.stringify(updated)
        )
      } catch { }
      return updated
    })

    onUpdateSettings({
      geminiVoice: voiceId,
      googleTtsVoice: voiceId,
    })
  }

  const handleTogglePreviewVoice = async (voice: GeminiVoiceInfo) => {
    // 1. If currently playing, pause
    if (playbackStatus === "playing") {
      handlePausePreview()
      return
    }

    // 2. If currently paused, resume
    if (playbackStatus === "paused") {
      handleResumePreview()
      return
    }

    // 3. Start fresh playback
    handleStopPreview()
    setPlaybackStatus("loading")
    setCurrentTime(0)
    setDuration(0)

    const sampleText =
      "Atmospheric barometric pressure is 1014 hectopascals under clear skies, delivering live weather telemetry with precision."
    const cacheKey = `${voice.id}-${settings.speechRate}-${settings.googleTtsPitch}-${settings.googleTtsVolumeGain}-${settings.googleTtsAudioProfile || ""}-${settings.language || "en"}`

    try {
      let audioSrc = audioCacheRef.current.get(cacheKey)

      if (!audioSrc) {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: sampleText,
            voiceName: voice.id,
            model: settings.geminiModel || DEFAULT_GEMINI_TTS_MODEL,
            languageCode: settings.language || "en",
            speakingRate: settings.speechRate,
            pitch: settings.googleTtsPitch,
            volumeGainDb: settings.googleTtsVolumeGain,
            effectsProfileId: settings.googleTtsAudioProfile,
            apiKey: settings.googleApiKey,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.audioContent) {
            const mime = data.mimeType || "audio/mpeg"
            audioSrc = `data:${mime};base64,${data.audioContent}`
            audioCacheRef.current.set(cacheKey, audioSrc)
          }
        }
      }

      if (!audioSrc) {
        WeatherSpeechSynthesizer.speak(sampleText, {
          rate: settings.speechRate,
          pitch: settings.googleTtsPitch,
          lang: settings.language,
          voiceName: voice.id,
          onStart: () => setPlaybackStatus("playing"),
          onEnd: () => {
            setPlaybackStatus("idle")
            setCurrentTime(0)
          },
          onError: () => {
            setPlaybackStatus("idle")
            setCurrentTime(0)
          },
        })
        return
      }

      const audio = new Audio(audioSrc)
      if (settings.speechRate && settings.speechRate !== 1.0) {
        audio.playbackRate = Math.max(0.5, Math.min(2.0, settings.speechRate))
      }
      if (settings.googleTtsVolumeGain !== undefined) {
        audio.volume = Math.max(
          0,
          Math.min(1.0, Math.pow(10, settings.googleTtsVolumeGain / 20))
        )
      }

      audio.onloadedmetadata = () => {
        if (
          audio.duration &&
          !isNaN(audio.duration) &&
          isFinite(audio.duration)
        ) {
          setDuration(audio.duration)
        }
      }

      audio.onplay = () => {
        setPlaybackStatus("playing")
      }

      audio.onpause = () => {
        if (!audio.ended && audio.currentTime > 0) {
          setPlaybackStatus("paused")
        }
      }

      audio.ontimeupdate = () => {
        if (!audio.ended) {
          setCurrentTime(audio.currentTime)
          if (
            audio.duration &&
            !isNaN(audio.duration) &&
            isFinite(audio.duration)
          ) {
            setDuration(audio.duration)
          }
        }
      }

      audio.onended = () => {
        setPlaybackStatus("idle")
        setCurrentTime(0)
      }

      audio.onerror = (e) => {
        console.warn("Audition audio playback error:", e)
        setPlaybackStatus("idle")
        setCurrentTime(0)
      }

      audioRef.current = audio
      await audio.play()
    } catch (err) {
      console.warn("Failed to play audition voice preview:", err)
      setPlaybackStatus("idle")
      setCurrentTime(0)
    }
  }

  return (
    <div className="space-y-4">
      {/* 1. Engine Header & Credentials Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Sparkles className="size-4 text-primary" />
              <span>Gemini Text-to-Speech Engine</span>
              <Badge
                variant="success-outline"
                className="font-mono text-tiny tracking-wider"
              >
                GEMINI 3.1 NATIVE
              </Badge>
            </CardTitle>

          </div>
        </CardHeader>
      </Card>

      {/* 2. Voice Persona Selection using DropdownMenu with Submenus */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-1">
            <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
              <Volume2 className="size-4 text-primary" />
              <span>Voice Persona & Timbre</span>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Select Gemini neural narrator persona and audition voice delivery.
            </CardDescription>
          </div>
          <CardAction>
            {/* SELECT-STYLE DROPDOWN SUB-MENU COMPONENT */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto min-w-56 justify-between gap-2"
                  />
                }
              >
                <div className="flex items-center gap-2 truncate text-left">
                  <div className="flex size-4.5 shrink-0 items-center justify-center rounded bg-primary/10 text-primary">
                    <Volume2 className="size-3" />
                  </div>
                  <span className="font-heading font-semibold text-foreground truncate">
                    {activeVoice.name}
                  </span>
                  <Badge
                    variant={
                      activeVoice.gender === "FEMALE"
                        ? "primary-light"
                        : "outline"
                    }
                    className="font-mono text-tiny uppercase"
                  >
                    {activeVoice.tone}
                  </Badge>
                  {selectedTone && (
                    <Badge variant="primary-light" className="font-mono text-nano uppercase">
                      {selectedTone}
                    </Badge>
                  )}
                </div>
                <ChevronDown className="size-3.5 opacity-60 shrink-0" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 sm:w-80 pt-2">
                {/* 1. Recent Choose Group */}
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 flex items-center gap-1.5 font-mono text-tiny text-muted-foreground uppercase tracking-wider">
                    <History className="size-3 text-primary" />
                    <span>Recent Voices</span>

                  </DropdownMenuLabel>
                  {recentVoices.map((v) => {
                    const isSelected = activeVoice.id === v.id
                    return (
                      <DropdownMenuItem
                        key={`recent-${v.id}`}
                        onClick={() => handleSelectVoice(v.id)}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-heading text-xs font-medium text-foreground truncate">
                            {v.name}
                          </span>
                          <span className="font-mono text-tiny text-muted-foreground">
                            ({v.tone})
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="size-3 text-primary shrink-0" />
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* 2. Badge-based Filter by Tone */}
                <DropdownMenuGroup>
                  <div className="px-2 py-1.5">
                    <div className="flex items-center justify-between gap-1 pb-1.5">
                      <DropdownMenuLabel className="p-0 flex items-center gap-1.5 font-mono text-tiny text-muted-foreground uppercase tracking-wider">
                        <Sparkles className="size-3 text-primary" />
                        <span>Filter by Tone</span>
                      </DropdownMenuLabel>
                      {selectedTone && (
                        <Button
                          type="button"
                          size="icon-xs"
                          variant="warning"
                          title="Clear Filter"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setSelectedTone(null)
                          }}
                          className="cursor-pointer uppercase text-tiny"
                        >
                          {/* {selectedTone} */}
                          <CircleX />
                        </Button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      <Badge
                        variant={selectedTone === null ? "default" : "outline"}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setSelectedTone(null)
                        }}
                        className="cursor-pointer text-nano transition-all select-none"
                      >
                        All
                      </Badge>
                      {availableTones.map((tone) => {
                        const isSelected = selectedTone === tone
                        return (
                          <Badge
                            key={tone}
                            variant={isSelected ? "default" : "outline"}
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedTone(isSelected ? null : tone)
                            }}
                            className="cursor-pointer font-mono text-nano px-1.5 py-0.5 transition-all select-none"
                          >
                            {tone}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* 3. Submenus: All, Male, Female (Filtered by Tone) */}
                <DropdownMenuGroup>
                  {/* All Voices Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center gap-2">
                        <Users className="size-3.5 text-primary" />
                        <span>All Voices</span>
                      </div>
                      <span className="font-mono text-nano text-muted-foreground ml-auto pr-1">
                        {filteredAllVoices.length}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-64 max-h-96 overflow-y-auto">
                        {filteredAllVoices.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            No voices found with tone &ldquo;{selectedTone}&rdquo;
                          </div>
                        ) : (
                          filteredAllVoices.map((v) => {
                            const isSelected = activeVoice.id === v.id
                            return (
                              <DropdownMenuItem
                                key={`all-${v.id}`}
                                onClick={() => handleSelectVoice(v.id)}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                                  <span className="font-heading text-xs font-medium text-foreground truncate">
                                    {v.name}
                                  </span>
                                  <Badge
                                    variant={
                                      v.gender === "FEMALE"
                                        ? "primary-light"
                                        : "outline"
                                    }
                                    className="font-mono text-nano px-1 py-0 uppercase"
                                  >
                                    {v.tone}
                                  </Badge>
                                </div>
                                {isSelected && (
                                  <Check className="size-3 text-primary shrink-0" />
                                )}
                              </DropdownMenuItem>
                            )
                          })
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  {/* Male Voices Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center gap-2">
                        <User className="size-3.5 text-sky-500" />
                        <span>Male Voices</span>
                      </div>
                      <span className="font-mono text-nano text-muted-foreground ml-auto pr-1">
                        {filteredMaleVoices.length}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-64 max-h-72 overflow-y-auto">
                        {filteredMaleVoices.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            No male voices with tone &ldquo;{selectedTone}&rdquo;
                          </div>
                        ) : (
                          filteredMaleVoices.map((v) => {
                            const isSelected = activeVoice.id === v.id
                            return (
                              <DropdownMenuItem
                                key={`male-${v.id}`}
                                onClick={() => handleSelectVoice(v.id)}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                                  <span className="font-heading text-xs font-medium text-foreground truncate">
                                    {v.name}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className="font-mono text-nano px-1 py-0 uppercase"
                                  >
                                    {v.tone}
                                  </Badge>
                                </div>
                                {isSelected && (
                                  <Check className="size-3 text-primary shrink-0" />
                                )}
                              </DropdownMenuItem>
                            )
                          })
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  {/* Female Voices Submenu */}
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <div className="flex items-center gap-2">
                        <UserCheck className="size-3.5 text-primary" />
                        <span>Female Voices</span>
                      </div>
                      <span className="font-mono text-nano text-muted-foreground ml-auto pr-1">
                        {filteredFemaleVoices.length}
                      </span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="w-64 max-h-72 overflow-y-auto">
                        {filteredFemaleVoices.length === 0 ? (
                          <div className="p-3 text-center text-xs text-muted-foreground">
                            No female voices with tone &ldquo;{selectedTone}&rdquo;
                          </div>
                        ) : (
                          filteredFemaleVoices.map((v) => {
                            const isSelected = activeVoice.id === v.id
                            return (
                              <DropdownMenuItem
                                key={`female-${v.id}`}
                                onClick={() => handleSelectVoice(v.id)}
                                className="flex items-center justify-between gap-2"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
                                  <span className="font-heading text-xs font-medium text-foreground truncate">
                                    {v.name}
                                  </span>
                                  <Badge
                                    variant="primary-light"
                                    className="font-mono text-nano px-1 py-0 uppercase"
                                  >
                                    {v.tone}
                                  </Badge>
                                </div>
                                {isSelected && (
                                  <Check className="size-3 text-primary shrink-0" />
                                )}
                              </DropdownMenuItem>
                            )
                          })
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Active Voice Showcase & Live Audition inside Alert */}
          <Alert
            variant="warning"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between w-full">
              <div className="flex items-center gap-3 min-w-0">
                {/* Voice Transducer Visual Indicator */}
                <IconTile
                  asChild
                  size="default"
                  variant={
                    playbackStatus === "playing"
                      ? "soft"
                      : playbackStatus === "paused"
                      ? "soft"
                      : "outline"
                  }
                  className={cn(
                    "cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50",
                    playbackStatus === "playing"
                      ? "text-primary shadow-xs ring-2 ring-primary/25"
                      : playbackStatus === "paused"
                      ? "text-amber-500"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <button
                    type="button"
                    onClick={() => handleTogglePreviewVoice(activeVoice)}
                    disabled={playbackStatus === "loading"}
                    title={
                      playbackStatus === "playing"
                        ? "Pause voice preview"
                        : playbackStatus === "paused"
                        ? "Resume voice preview"
                        : "Play voice preview"
                    }
                    aria-label={
                      playbackStatus === "playing"
                        ? "Pause voice preview"
                        : playbackStatus === "paused"
                        ? "Resume voice preview"
                        : "Play voice preview"
                    }
                  >
                    <Volume2
                      className={cn(
                        "size-5 transition-transform",
                        playbackStatus === "playing" && "animate-pulse scale-110"
                      )}
                    />
                  </button>
                </IconTile>

                {/* Voice Meta */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading text-sm font-semibold text-foreground">
                      {activeVoice.name}
                    </span>
                    <Badge
                      variant={
                        activeVoice.gender === "FEMALE"
                          ? "primary-light"
                          : "outline"
                      }
                      className="font-mono text-nano uppercase"
                    >
                      {activeVoice.tone}
                    </Badge>
                    <span className="font-mono text-nano text-muted-foreground">
                      • {activeVoice.gender === "FEMALE" ? "Female" : "Male"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {activeVoice.description}
                  </p>
                </div>
              </div>

              {/* Single, Realtime Action Controls */}
              <div className="flex items-center gap-2 self-end shrink-0">
                {playbackStatus === "loading" ? (
                  <Button
                    type="button"
                    disabled
                    variant="outline"
                    size="sm"
                    className="gap-1.5 font-mono text-xs cursor-wait"
                  >
                    <Spinner className="size-3.5" />
                    <span>Loading...</span>
                  </Button>
                ) : playbackStatus === "playing" ? (
                  <>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handlePausePreview}
                      className="gap-1.5 font-mono text-xs cursor-pointer"
                    >
                      <Pause className="size-3.5 fill-current" />
                      <span>Pause</span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleStopPreview}
                      className="gap-1.5 font-mono text-xs cursor-pointer"
                    >
                      <Square className="size-3 fill-current" />
                      <span>Stop</span>
                    </Button>
                  </>
                ) : playbackStatus === "paused" ? (
                  <>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleResumePreview}
                      className="gap-1.5 font-mono text-xs cursor-pointer"
                    >
                      <Play className="size-3.5 fill-current" />
                      <span>Resume</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleStopPreview}
                      className="gap-1.5 font-mono text-xs cursor-pointer"
                    >
                      <Square className="size-3 fill-current" />
                      <span>Stop</span>
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => handleTogglePreviewVoice(activeVoice)}
                    className="gap-1.5 font-mono text-xs cursor-pointer"
                  >
                    <Play className="size-3.5 fill-current" />
                    <span>Play Audition</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Realtime Audio Tone & Pitch Visualizer + Scrubber */}
            <AudioToneVisualizer
              status={playbackStatus}
              tone={activeVoice.tone}
              pitch={settings.googleTtsPitch}
              speed={settings.speechRate}
              currentTime={currentTime}
              duration={duration}
              onSeek={handleSeek}
            />

            {/* Sample Weather Script */}
            <div className="border-t border-primary/15 pt-2 flex items-baseline gap-2 text-foreground/80">
              <span className="font-mono text-nano uppercase tracking-wider text-primary font-semibold shrink-0">
                Script:
              </span>
              <p className="text-tiny italic font-serif leading-relaxed">
                &ldquo;Atmospheric barometric pressure is 1014 hectopascals under
                clear skies, delivering live weather telemetry with
                precision.&rdquo;
              </p>
            </div>
          </Alert>
        </CardContent>
      </Card>

      {/* 3 & 4. Speech Velocity & Pitch Modulation (Side by Side) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* 3. Speech Velocity (Google TTS Speaking Rate) */}
        <SettingSliderCard
          icon={Volume2}
          title="Speech Velocity"
          description="Narration playback speed rate provided by Google TTS"
          badgeText={`${settings.speechRate.toFixed(2)}x`}
          value={settings.speechRate}
          min={0.6}
          max={1.6}
          step={0.05}
          decimals={2}
          onValueChange={(speechRate) => onUpdateSettings({ speechRate })}
          presets={[
            { value: 0.8, label: "0.8x" },
            { value: 1.0, label: "1.0x" },
            { value: 1.2, label: "1.2x" },
            { value: 1.4, label: "1.4x" },
          ]}
        />

        {/* 4. Voice Pitch Modulation (Google TTS Pitch) */}
        <SettingSliderCard
          icon={Sliders}
          title="Voice Pitch Modulation"
          description="Acoustic fundamental frequency in semitones (st) provided by Google TTS"
          badgeText={`${settings.googleTtsPitch > 0 ? "+" : ""}${settings.googleTtsPitch.toFixed(1)}st`}
          value={settings.googleTtsPitch}
          min={-4.0}
          max={4.0}
          step={0.5}
          decimals={1}
          onValueChange={(googleTtsPitch) => onUpdateSettings({ googleTtsPitch })}
          presets={GOOGLE_TTS_PITCH_PRESETS}
        />
      </div>

      {/* 5. Volume Gain Calibration (Google TTS Volume Gain) */}
      <SettingSliderCard
        icon={Volume2}
        title="Volume Gain Calibration"
        description="Audio output gain adjustment in decibels (dB) provided by Google TTS"
        badgeText={`${settings.googleTtsVolumeGain > 0 ? "+" : ""}${settings.googleTtsVolumeGain.toFixed(1)} dB`}
        value={settings.googleTtsVolumeGain}
        min={-6.0}
        max={6.0}
        step={0.5}
        decimals={1}
        onValueChange={(googleTtsVolumeGain) =>
          onUpdateSettings({ googleTtsVolumeGain })
        }
        presets={GOOGLE_TTS_VOLUME_PRESETS}
      />

      {/* 5. Automatic Audio Briefing Switch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Volume2 className="size-4 text-primary" />
            <Label
              htmlFor="auto-briefing-switch"
              className="cursor-pointer font-heading text-xs font-semibold text-foreground"
            >
              Automatic Audio Meteorological Briefing
            </Label>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Read aloud synopsis automatically upon station selection or
            initialization.
          </CardDescription>
          <CardAction>
            <Switch
              id="auto-briefing-switch"
              checked={settings.autoSpeakOnLoad}
              onCheckedChange={(checked) =>
                onUpdateSettings({ autoSpeakOnLoad: checked })
              }
            />
          </CardAction>
        </CardHeader>
      </Card>

      {/* 6. Acoustic Device Profile (EQ) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
            <Headphones className="size-4 text-primary" />
            <span>Acoustic Device Profile (EQ)</span>
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Equalisation curves calibrated to optimize speech
            intelligibility for target audio transducers.
          </CardDescription>
          <CardAction>
            <Badge
              variant="primary-outline"
              className="font-mono text-xs uppercase"
            >
              {GOOGLE_TTS_AUDIO_PROFILES.find(
                (p) =>
                  p.id ===
                  (settings.googleTtsAudioProfile ||
                    "headphone-class-device")
              )?.label || "Headphones"}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ItemGroup className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {GOOGLE_TTS_AUDIO_PROFILES.map((prof) => {
              const isSelected =
                (settings.googleTtsAudioProfile ||
                  "headphone-class-device") === prof.id
              return (
                <Item
                  key={prof.id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    onUpdateSettings({
                      googleTtsAudioProfile: prof.id as GoogleTtsAudioProfile,
                    })
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      onUpdateSettings({
                        googleTtsAudioProfile: prof.id as GoogleTtsAudioProfile,
                      })
                    }
                  }}
                  className={cn(
                    "group relative flex flex-col justify-between p-3.5 border transition-all cursor-pointer rounded-none text-left whitespace-normal",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary/40"
                      : "border-border bg-card/60 hover:border-primary/40 hover:bg-muted/30"
                  )}
                >
                  <div className="w-full">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            "flex size-7 items-center justify-center border transition-colors",
                            isSelected
                              ? "border-primary/40 bg-primary/10 text-primary"
                              : "border-border bg-muted/60 text-muted-foreground group-hover:border-primary/30 group-hover:text-foreground"
                          )}
                        >
                          <Headphones className="size-3.5" />
                        </div>
                        <div>
                          <ItemTitle className="font-heading text-xs font-semibold text-nowrap text-foreground">
                            {prof.label}
                          </ItemTitle>
                        </div>
                      </div>
                      <SelectionCheckIndicator isSelected={isSelected} />
                    </div>
                    <p className="mt-2 line-clamp-2 text-tiny leading-relaxed text-muted-foreground">
                      {prof.description}
                    </p>
                  </div>
                  <div className="mt-3 flex w-full items-center justify-between font-mono text-tiny">
                    <Badge
                      variant={isSelected ? "primary-light" : "outline"}
                      className="font-mono text-nano tracking-wider uppercase"
                    >
                      {prof.id
                        .replace("-device", "")
                        .replace("-speaker", "")}
                    </Badge>
                  </div>
                </Item>
              )
            })}
          </ItemGroup>
        </CardContent>
      </Card>
    </div>
  )
}
