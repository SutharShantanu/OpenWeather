"use client"

import { useState, useMemo } from "react"
import {
  TtsVoiceInfo,
  TTS_VOICES,
  MAX_VOICES_PER_GENDER,
  resolveTtsVoice,
} from "@/lib/edge-tts"
import { STORAGE_KEYS } from "@/lib/constants"
import { TabBaseProps } from "../types"

export interface UseSpeechTabProps {
  settings: TabBaseProps["settings"]
  onUpdateSettings: TabBaseProps["onUpdateSettings"]
  onStopPreview?: () => void
}

export function useSpeechTab({
  settings,
  onUpdateSettings,
  onStopPreview,
}: UseSpeechTabProps) {
  // Maintain recently chosen voices in local state & localStorage
  const [recentVoiceIds, setRecentVoiceIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(STORAGE_KEYS.RECENT_VOICES)
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) return parsed
        }
      } catch { }
    }
    return [
      "en-US-AvaMultilingualNeural",
      "en-US-AndrewMultilingualNeural",
      "en-US-EmmaMultilingualNeural",
    ]
  })

  // ttsVoice is the single source of truth for the narrator voice.
  const activeVoiceId = resolveTtsVoice(settings.ttsVoice)
  const activeVoice = TTS_VOICES.find((v) => v.id === activeVoiceId)!

  const [selectedTone, setSelectedTone] = useState<string | null>(null)

  const availableTones = useMemo(() => {
    return Array.from(new Set(TTS_VOICES.map((v) => v.tone))).sort()
  }, [])

  const maleVoices = useMemo(
    () =>
      TTS_VOICES.filter((v) => v.gender === "MALE").slice(
        0,
        MAX_VOICES_PER_GENDER
      ),
    []
  )
  const femaleVoices = useMemo(
    () =>
      TTS_VOICES.filter((v) => v.gender === "FEMALE").slice(
        0,
        MAX_VOICES_PER_GENDER
      ),
    []
  )

  const filteredAllVoices = useMemo(() => {
    const all = [...maleVoices, ...femaleVoices]
    if (!selectedTone) return all
    return all.filter((v) => v.tone === selectedTone)
  }, [maleVoices, femaleVoices, selectedTone])

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
      .map((id) => TTS_VOICES.find((v) => v.id === id))
      .filter(Boolean) as TtsVoiceInfo[]
    return list.length > 0 ? list : [TTS_VOICES[0], TTS_VOICES[1]]
  }, [recentVoiceIds])

  const handleSelectVoice = (voiceId: string) => {
    if (onStopPreview) {
      onStopPreview()
    }
    const voice = TTS_VOICES.find((v) => v.id === voiceId)
    if (!voice) return

    setRecentVoiceIds((prev) => {
      const updated = [voiceId, ...prev.filter((id) => id !== voiceId)].slice(
        0,
        4
      )
      try {
        localStorage.setItem(
          STORAGE_KEYS.RECENT_VOICES,
          JSON.stringify(updated)
        )
      } catch { }
      return updated
    })

    onUpdateSettings({ ttsVoice: voiceId })
  }

  return {
    recentVoiceIds,
    activeVoiceId,
    activeVoice,
    selectedTone,
    setSelectedTone,
    availableTones,
    maleVoices,
    femaleVoices,
    filteredAllVoices,
    filteredMaleVoices,
    filteredFemaleVoices,
    recentVoices,
    handleSelectVoice,
  }
}
