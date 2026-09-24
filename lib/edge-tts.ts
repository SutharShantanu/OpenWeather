export interface TtsVoiceInfo {
  id: string
  name: string
  gender: "FEMALE" | "MALE"
  tone: string
  description: string
}

/**
 * Free Microsoft Edge "Read Aloud" neural voices (no key, no billing), served
 * through the msedge-tts package. The endpoint is unofficial and may change;
 * the browser Web Speech voice is the fallback when it fails.
 */
export const TTS_ENGINE_NAME = "Edge Neural TTS"

/**
 * 5 male + 5 female Multilingual voices: each speaks every app language
 * (en, hi, es, fr, de, ja), detected from the text. `gender` is Microsoft's
 * label; `tone` reuses the tone ids translated in lib/translations.ts.
 * Keep at most MAX_VOICES_PER_GENDER per gender.
 */
export const MAX_VOICES_PER_GENDER = 5

export const TTS_VOICES: TtsVoiceInfo[] = [
  // Male voices (5)
  {
    id: "en-US-AndrewMultilingualNeural",
    name: "Andrew",
    gender: "MALE",
    tone: "Warm",
    description: "Warm, confident and authentic (US English base)",
  },
  {
    id: "en-US-BrianMultilingualNeural",
    name: "Brian",
    gender: "MALE",
    tone: "Casual",
    description: "Approachable, casual and sincere (US English base)",
  },
  {
    id: "de-DE-FlorianMultilingualNeural",
    name: "Florian",
    gender: "MALE",
    tone: "Friendly",
    description: "Friendly and positive (German base)",
  },
  {
    id: "fr-FR-RemyMultilingualNeural",
    name: "Remy",
    gender: "MALE",
    tone: "Lively",
    description: "Lively and positive (French base)",
  },
  {
    id: "en-AU-WilliamMultilingualNeural",
    name: "William",
    gender: "MALE",
    tone: "Easy-going",
    description: "Easy-going and positive (Australian English base)",
  },

  // Female voices (5)
  {
    id: "en-US-AvaMultilingualNeural",
    name: "Ava",
    gender: "FEMALE",
    tone: "Warm",
    description: "Expressive, caring and pleasant (US English base)",
  },
  {
    id: "en-US-EmmaMultilingualNeural",
    name: "Emma",
    gender: "FEMALE",
    tone: "Clear",
    description: "Cheerful, clear and conversational (US English base)",
  },
  {
    id: "de-DE-SeraphinaMultilingualNeural",
    name: "Seraphina",
    gender: "FEMALE",
    tone: "Friendly",
    description: "Friendly and positive (German base)",
  },
  {
    id: "fr-FR-VivienneMultilingualNeural",
    name: "Vivienne",
    gender: "FEMALE",
    tone: "Bright",
    description: "Bright and positive (French base)",
  },
  {
    id: "pt-BR-ThalitaMultilingualNeural",
    name: "Thalita",
    gender: "FEMALE",
    tone: "Upbeat",
    description: "Upbeat and positive (Brazilian Portuguese base)",
  },
]

export const DEFAULT_TTS_VOICE = "en-US-AvaMultilingualNeural"

/** Returns the canonical voice id for `id` (case-insensitive), or the default voice. */
export function resolveTtsVoice(id?: string): string {
  const lower = id?.trim().toLowerCase()
  return (
    TTS_VOICES.find((v) => v.id.toLowerCase() === lower)?.id ??
    DEFAULT_TTS_VOICE
  )
}

export const TTS_PITCH_PRESETS = [
  { value: -4.0, label: "-4st", desc: "Deep" },
  { value: -2.0, label: "-2st", desc: "Warm" },
  { value: 0.0, label: "0st", desc: "Natural" },
  { value: 2.0, label: "+2st", desc: "Bright" },
  { value: 4.0, label: "+4st", desc: "Crisp" },
]

// Playback volume is applied in the browser, which can attenuate but not
// amplify, so presets stop at 0 dB (full volume).
export const TTS_VOLUME_PRESETS = [
  { value: -12.0, label: "-12 dB", desc: "Soft" },
  { value: -6.0, label: "-6 dB", desc: "Quiet" },
  { value: -3.0, label: "-3 dB", desc: "Low" },
  { value: 0.0, label: "0 dB", desc: "Full" },
]
