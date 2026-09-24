"use client"

import { useCallback } from "react"
import type { TtsVoiceInfo } from "@/lib/edge-tts"
import type { ExtendedSettings } from "@/components/settings-dialog"
import {
  useTtsPlayer,
  type PlaybackStatus,
  type TtsProvider,
} from "@/hooks/use-tts-player"

export type { PlaybackStatus }
/** Which engine produced the audio currently loaded in the preview. */
export type PreviewProvider = TtsProvider

export const PREVIEW_SAMPLE_TEXT =
  "Atmospheric barometric pressure is 1014 hectopascals under clear skies, delivering live weather telemetry with precision."

interface UseSpeechPreviewOptions {
  settings: ExtendedSettings
}

/**
 * Voice audition for the Speech settings tab, built on the shared TTS player
 * (so an audition and the header briefing never play over each other).
 */
export function useSpeechPreview({ settings }: UseSpeechPreviewOptions) {
  const player = useTtsPlayer({
    rate: settings.speechRate,
    volumeGainDb: settings.googleTtsVolumeGain,
    cacheSize: 10,
  })

  const language = settings.language || "en"
  const deliveryStyle = settings.speechDeliveryStyle
  const pitch = settings.googleTtsPitch
  const { toggle } = player

  const handleTogglePreviewVoice = useCallback(
    (voice: TtsVoiceInfo) =>
      toggle({
        text: PREVIEW_SAMPLE_TEXT,
        voiceName: voice.id,
        language,
        deliveryStyle,
        pitch,
      }),
    [toggle, language, deliveryStyle, pitch]
  )

  return {
    playbackStatus: player.status,
    currentTime: player.currentTime,
    duration: player.duration,
    activeProvider: player.provider,
    readLevels: player.readLevels,
    getPosition: player.getPosition,
    handleTogglePreviewVoice,
    handleStopPreview: player.stop,
    handlePausePreview: player.pause,
    handleResumePreview: player.resume,
    handleSeek: player.seek,
  }
}
