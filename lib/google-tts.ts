export type GoogleTtsModel = "Journey" | "Studio" | "Neural2" | "WaveNet" | "Standard";

export type GoogleTtsAudioProfile =
  | "headphone-class-device"
  | "high-fidelity-speaker"
  | "small-bluetooth-speaker"
  | "telephony-class-device";

export interface GoogleTtsModelInfo {
  id: GoogleTtsModel;
  name: string;
  description: string;
  badge: string;
}

export interface GoogleTtsVoiceInfo {
  id: string;
  name: string;
  model: GoogleTtsModel;
  languageCode: string;
  gender: "FEMALE" | "MALE";
  accent: string;
  description: string;
}

export interface GoogleAudioProfileInfo {
  id: GoogleTtsAudioProfile;
  label: string;
  description: string;
}

export const GOOGLE_TTS_MODELS: GoogleTtsModelInfo[] = [
  {
    id: "Journey",
    name: "Journey",
    description: "Conversational, emotionally nuanced & highly realistic phrasing",
    badge: "Human-Like",
  },
  {
    id: "Studio",
    name: "Studio",
    description: "Studio-grade radio & meteorological broadcast narration",
    badge: "Broadcast",
  },
  {
    id: "Neural2",
    name: "Neural2",
    description: "Deep neural network synthesis with balanced pitch and natural cadence",
    badge: "High-Fi",
  },
  {
    id: "WaveNet",
    name: "WaveNet",
    description: "DeepMind raw-waveform neural synthesis architecture",
    badge: "DeepMind",
  },
  {
    id: "Standard",
    name: "Standard",
    description: "Lightweight, ultra-fast concatenative speech generation",
    badge: "Fast",
  },
];

export const GOOGLE_TTS_AUDIO_PROFILES: GoogleAudioProfileInfo[] = [
  {
    id: "headphone-class-device",
    label: "Headphones",
    description: "Optimized for stereo earbuds & studio headphones",
  },
  {
    id: "high-fidelity-speaker",
    label: "Studio Hi-Fi",
    description: "Wide frequency range for desktop & high-fidelity monitors",
  },
  {
    id: "small-bluetooth-speaker",
    label: "Portable BT",
    description: "Mid-boosted presence for small Bluetooth & smart speakers",
  },
  {
    id: "telephony-class-device",
    label: "Automotive",
    description: "Narrow-band clarity optimized for vehicle & hands-free speakers",
  },
];

export const GOOGLE_TTS_PITCH_PRESETS = [
  { value: -4.0, label: "-4st", desc: "Deep" },
  { value: -2.0, label: "-2st", desc: "Warm" },
  { value: 0.0, label: "0st", desc: "Natural" },
  { value: 2.0, label: "+2st", desc: "Bright" },
  { value: 4.0, label: "+4st", desc: "Crisp" },
];

export const GOOGLE_TTS_VOLUME_PRESETS = [
  { value: -3.0, label: "-3 dB", desc: "Quiet" },
  { value: 0.0, label: "0 dB", desc: "Standard" },
  { value: 3.0, label: "+3 dB", desc: "Boost" },
  { value: 6.0, label: "+6 dB", desc: "Max" },
];

export const GOOGLE_TTS_VOICES: GoogleTtsVoiceInfo[] = [
  // English (US)
  {
    id: "en-US-Journey-F",
    name: "Journey F (Female)",
    model: "Journey",
    languageCode: "en",
    gender: "FEMALE",
    accent: "US English",
    description: "Warm, conversational & highly expressive",
  },
  {
    id: "en-US-Journey-D",
    name: "Journey D (Male)",
    model: "Journey",
    languageCode: "en",
    gender: "MALE",
    accent: "US English",
    description: "Calm, smooth conversational voice",
  },
  {
    id: "en-US-Journey-O",
    name: "Journey O (Female)",
    model: "Journey",
    languageCode: "en",
    gender: "FEMALE",
    accent: "US English",
    description: "Engaging dynamic narration",
  },
  {
    id: "en-US-Studio-O",
    name: "Studio O (Female)",
    model: "Studio",
    languageCode: "en",
    gender: "FEMALE",
    accent: "US English",
    description: "High-fidelity radio broadcast anchor",
  },
  {
    id: "en-US-Studio-Q",
    name: "Studio Q (Male)",
    model: "Studio",
    languageCode: "en",
    gender: "MALE",
    accent: "US English",
    description: "Deep, authoritative news presenter",
  },
  {
    id: "en-US-Neural2-C",
    name: "Neural2 C (Female)",
    model: "Neural2",
    languageCode: "en",
    gender: "FEMALE",
    accent: "US English",
    description: "Crisp, articulate meteorological cadence",
  },
  {
    id: "en-US-Neural2-D",
    name: "Neural2 D (Male)",
    model: "Neural2",
    languageCode: "en",
    gender: "MALE",
    accent: "US English",
    description: "Authoritative, technical delivery",
  },
  {
    id: "en-US-Neural2-F",
    name: "Neural2 F (Female)",
    model: "Neural2",
    languageCode: "en",
    gender: "FEMALE",
    accent: "US English",
    description: "Balanced, friendly synoptic guide",
  },
  {
    id: "en-US-Neural2-J",
    name: "Neural2 J (Male)",
    model: "Neural2",
    languageCode: "en",
    gender: "MALE",
    accent: "US English",
    description: "Clear, grounded radar telemetry",
  },
  {
    id: "en-US-Wavenet-C",
    name: "WaveNet C (Female)",
    model: "WaveNet",
    languageCode: "en",
    gender: "FEMALE",
    accent: "US English",
    description: "DeepMind natural synthesis",
  },
  {
    id: "en-US-Wavenet-D",
    name: "WaveNet D (Male)",
    model: "WaveNet",
    languageCode: "en",
    gender: "MALE",
    accent: "US English",
    description: "DeepMind resonant male voice",
  },
  {
    id: "en-US-Standard-C",
    name: "Standard C (Female)",
    model: "Standard",
    languageCode: "en",
    gender: "FEMALE",
    accent: "US English",
    description: "Fast concatenative standard",
  },
  {
    id: "en-US-Standard-D",
    name: "Standard D (Male)",
    model: "Standard",
    languageCode: "en",
    gender: "MALE",
    accent: "US English",
    description: "Fast concatenative standard",
  },

  // Hindi (India)
  {
    id: "hi-IN-Neural2-A",
    name: "Neural2 A (महिला)",
    model: "Neural2",
    languageCode: "hi",
    gender: "FEMALE",
    accent: "Hindi",
    description: "स्पष्ट एवं प्राकृतिक मौसम प्रसारण",
  },
  {
    id: "hi-IN-Neural2-B",
    name: "Neural2 B (पुरुष)",
    model: "Neural2",
    languageCode: "hi",
    gender: "MALE",
    accent: "Hindi",
    description: "गंभीर एवं प्रभावी स्वर",
  },
  {
    id: "hi-IN-Neural2-D",
    name: "Neural2 D (महिला)",
    model: "Neural2",
    languageCode: "hi",
    gender: "FEMALE",
    accent: "Hindi",
    description: "मधुर एवं स्पष्ट उच्चारण",
  },
  {
    id: "hi-IN-Wavenet-A",
    name: "WaveNet A (महिला)",
    model: "WaveNet",
    languageCode: "hi",
    gender: "FEMALE",
    accent: "Hindi",
    description: "मानक वेवनेट मौसम आवाज",
  },
  {
    id: "hi-IN-Wavenet-B",
    name: "WaveNet B (पुरुष)",
    model: "WaveNet",
    languageCode: "hi",
    gender: "MALE",
    accent: "Hindi",
    description: "मानक वेवनेट पुरुष आवाज",
  },

  // Spanish
  {
    id: "es-ES-Journey-F",
    name: "Journey F (Femenino)",
    model: "Journey",
    languageCode: "es",
    gender: "FEMALE",
    accent: "Español",
    description: "Locución cálida y natural",
  },
  {
    id: "es-ES-Studio-C",
    name: "Studio C (Femenino)",
    model: "Studio",
    languageCode: "es",
    gender: "FEMALE",
    accent: "Español",
    description: "Narración meteorológica profesional",
  },
  {
    id: "es-ES-Neural2-A",
    name: "Neural2 A (Femenino)",
    model: "Neural2",
    languageCode: "es",
    gender: "FEMALE",
    accent: "Español",
    description: "Pronunciación clara y precisa",
  },
  {
    id: "es-ES-Neural2-B",
    name: "Neural2 B (Masculino)",
    model: "Neural2",
    languageCode: "es",
    gender: "MALE",
    accent: "Español",
    description: "Voz firme para radio",
  },
  {
    id: "es-ES-Wavenet-B",
    name: "WaveNet B (Masculino)",
    model: "WaveNet",
    languageCode: "es",
    gender: "MALE",
    accent: "Español",
    description: "WaveNet natural español",
  },

  // French
  {
    id: "fr-FR-Journey-F",
    name: "Journey F (Féminin)",
    model: "Journey",
    languageCode: "fr",
    gender: "FEMALE",
    accent: "Français",
    description: "Voix fluide et expressive",
  },
  {
    id: "fr-FR-Studio-A",
    name: "Studio A (Féminin)",
    model: "Studio",
    languageCode: "fr",
    gender: "FEMALE",
    accent: "Français",
    description: "Diffusion studio haute fidélité",
  },
  {
    id: "fr-FR-Neural2-A",
    name: "Neural2 A (Féminin)",
    model: "Neural2",
    languageCode: "fr",
    gender: "FEMALE",
    accent: "Français",
    description: "Articulation météorologique claire",
  },
  {
    id: "fr-FR-Neural2-B",
    name: "Neural2 B (Masculin)",
    model: "Neural2",
    languageCode: "fr",
    gender: "MALE",
    accent: "Français",
    description: "Voix posée et professionnelle",
  },

  // German
  {
    id: "de-DE-Journey-F",
    name: "Journey F (Weiblich)",
    model: "Journey",
    languageCode: "de",
    gender: "FEMALE",
    accent: "Deutsch",
    description: "Lebendige und sympathische Stimme",
  },
  {
    id: "de-DE-Studio-B",
    name: "Studio B (Männlich)",
    model: "Studio",
    languageCode: "de",
    gender: "MALE",
    accent: "Deutsch",
    description: "Professioneller Rundfunksprecher",
  },
  {
    id: "de-DE-Neural2-A",
    name: "Neural2 A (Weiblich)",
    model: "Neural2",
    languageCode: "de",
    gender: "WEIBLICH" as unknown as "FEMALE",
    accent: "Deutsch",
    description: "Präzise Wetteransage",
  },

  // Japanese
  {
    id: "ja-JP-Neural2-B",
    name: "Neural2 B (女性)",
    model: "Neural2",
    languageCode: "ja",
    gender: "FEMALE",
    accent: "日本語",
    description: "明瞭で聞き取りやすい気象情報",
  },
  {
    id: "ja-JP-Neural2-C",
    name: "Neural2 C (男性)",
    model: "Neural2",
    languageCode: "ja",
    gender: "MALE",
    accent: "日本語",
    description: "落ち着いたニュース解説風",
  },
];

export function getAvailableGoogleVoices(lang: string, model?: GoogleTtsModel): GoogleTtsVoiceInfo[] {
  const shortLang = (lang || "en").split("-")[0].toLowerCase();
  let filtered = GOOGLE_TTS_VOICES.filter((v) => v.languageCode === shortLang);
  if (filtered.length === 0) {
    filtered = GOOGLE_TTS_VOICES.filter((v) => v.languageCode === "en");
  }
  if (model) {
    const modelFiltered = filtered.filter((v) => v.model === model);
    if (modelFiltered.length > 0) return modelFiltered;
  }
  return filtered;
}
