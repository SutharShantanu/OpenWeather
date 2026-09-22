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

export interface GeminiVoiceInfo {
  id: string;
  name: string;
  gender: "FEMALE" | "MALE";
  tone: string;
  description: string;
}

export const GEMINI_TTS_VOICES: GeminiVoiceInfo[] = [
  // Male voices (5)
  { id: "Puck", name: "Puck", gender: "MALE", tone: "Upbeat", description: "Upbeat, energetic and charismatic broadcast delivery" },
  { id: "Charon", name: "Charon", gender: "MALE", tone: "Informative", description: "Informative, steady, meteorological authority" },
  { id: "Orus", name: "Orus", gender: "MALE", tone: "Firm", description: "Firm, structured and crisp articulation" },
  { id: "Fenrir", name: "Fenrir", gender: "MALE", tone: "Bright", description: "Bright, dynamic and charismatic cadence" },
  { id: "Enceladus", name: "Enceladus", gender: "MALE", tone: "Smooth", description: "Smooth, relaxed and soothing cadence" },

  // Female voices (5)
  { id: "Kore", name: "Kore", gender: "FEMALE", tone: "Firm", description: "Firm, decisive and authoritative weather broadcast" },
  { id: "Zephyr", name: "Zephyr", gender: "FEMALE", tone: "Bright", description: "Bright, cheerful, sunny and highly expressive" },
  { id: "Laomedeia", name: "Laomedeia", gender: "FEMALE", tone: "Upbeat", description: "Upbeat, optimistic morning forecast delivery" },
  { id: "Erinome", name: "Erinome", gender: "FEMALE", tone: "Informative", description: "Informative, articulate broadcast telemetry" },
  { id: "Algieba", name: "Algieba", gender: "FEMALE", tone: "Smooth", description: "Smooth, velvety, calm and serene evening reports" },
];

export const VALID_GEMINI_VOICES = new Set(GEMINI_TTS_VOICES.map((v) => v.id));

/**
 * Maps any legacy voice name, generic gender token, or Google Cloud voice id
 * to a canonical Gemini neural voice persona.
 */
export function resolveGeminiVoice(name?: string): string {
  if (!name) return "Kore";
  // Exact match
  for (const v of VALID_GEMINI_VOICES) {
    if (v.toLowerCase() === name.toLowerCase()) return v;
  }
  // Heuristic mappings
  const lower = name.toLowerCase();
  if (lower.includes("puck") || lower.includes("cheerful") || lower.includes("upbeat")) return "Puck";
  if (lower.includes("charon") || lower.includes("broadcast") || lower.includes("studio") || lower.includes("rasalgethi")) return "Charon";
  if (lower.includes("orus") || lower.includes("alnilam") || lower.includes("firm")) return "Orus";
  if (lower.includes("fenrir") || lower.includes("achird") || lower.includes("bright")) return "Fenrir";
  if (lower.includes("enceladus") || lower.includes("umbriel") || lower.includes("iapetus") || lower.includes("male") || lower.endsWith("-d") || lower.endsWith("-q") || lower.endsWith("-b")) return "Enceladus";

  if (lower.includes("kore") || lower.includes("authoritative")) return "Kore";
  if (lower.includes("zephyr") || lower.includes("autonoe") || lower.includes("sunny") || lower.includes("journey")) return "Zephyr";
  if (lower.includes("laomedeia") || lower.includes("leda") || lower.includes("lively")) return "Laomedeia";
  if (lower.includes("erinome") || lower.includes("clear") || lower.includes("despina")) return "Erinome";
  if (lower.includes("algieba") || lower.includes("calm") || lower.includes("smooth") || lower.includes("gentle")) return "Algieba";

  return "Kore";
}

export interface GeminiModelInfo {
  id: string;
  name: string;
  badge: string;
  description: string;
}

export const GEMINI_TTS_MODELS: GeminiModelInfo[] = [
  {
    id: "gemini-2.5-flash-preview-tts",
    name: "Gemini 2.5 Flash TTS",
    badge: "Recommended",
    description: "High-speed neural speech synthesis with natural prosody and dependable generation quotas.",
  },
  {
    id: "gemini-3.1-flash-tts-preview",
    name: "Gemini 3.1 Flash TTS",
    badge: "Experimental",
    description: "Ultra-fast preview neural speech synthesis with fine-grained controllable cadence.",
  },
  {
    id: "gemini-2.5-pro-preview-tts",
    name: "Gemini 2.5 Pro TTS",
    badge: "Studio Pro",
    description: "Deepest acoustic nuance, complex prosody reasoning and high-fidelity pronunciation.",
  },
];

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

  // Italian
  {
    id: "it-IT-Neural2-A",
    name: "Neural2 A (Femminile)",
    model: "Neural2",
    languageCode: "it",
    gender: "FEMALE",
    accent: "Italiano",
    description: "Voce fluida per previsioni meteo",
  },
  {
    id: "it-IT-Neural2-C",
    name: "Neural2 C (Maschile)",
    model: "Neural2",
    languageCode: "it",
    gender: "MALE",
    accent: "Italiano",
    description: "Voce radiofonica chiara e precisa",
  },
  {
    id: "it-IT-Standard-A",
    name: "Standard A (Femminile)",
    model: "Standard",
    languageCode: "it",
    gender: "FEMALE",
    accent: "Italiano",
    description: "Sintesi standard per bollettini",
  },

  // Portuguese (Brazil)
  {
    id: "pt-BR-Journey-F",
    name: "Journey F (Feminino)",
    model: "Journey",
    languageCode: "pt",
    gender: "FEMALE",
    accent: "Português Brasil",
    description: "Voz calorosa e expressiva para previsão",
  },
  {
    id: "pt-BR-Neural2-A",
    name: "Neural2 A (Feminino)",
    model: "Neural2",
    languageCode: "pt",
    gender: "FEMALE",
    accent: "Português Brasil",
    description: "Pronúncia nítida para notícias meteorológicas",
  },
  {
    id: "pt-BR-Neural2-B",
    name: "Neural2 B (Masculino)",
    model: "Neural2",
    languageCode: "pt",
    gender: "MALE",
    accent: "Português Brasil",
    description: "Tom firme e profissional",
  },

  // Russian
  {
    id: "ru-RU-Neural2-C",
    name: "Neural2 C (Женский)",
    model: "Neural2",
    languageCode: "ru",
    gender: "FEMALE",
    accent: "Русский",
    description: "Четкое метеорологическое звучание",
  },
  {
    id: "ru-RU-Neural2-D",
    name: "Neural2 D (Мужской)",
    model: "Neural2",
    languageCode: "ru",
    gender: "MALE",
    accent: "Русский",
    description: "Уверенный дикторский голос",
  },
  {
    id: "ru-RU-Standard-C",
    name: "Standard C (Женский)",
    model: "Standard",
    languageCode: "ru",
    gender: "FEMALE",
    accent: "Русский",
    description: "Быстрый синтез синоптической сводки",
  },

  // Korean
  {
    id: "ko-KR-Neural2-A",
    name: "Neural2 A (여성)",
    model: "Neural2",
    languageCode: "ko",
    gender: "FEMALE",
    accent: "한국어",
    description: "자연스럽고 부드러운 기상 예보",
  },
  {
    id: "ko-KR-Neural2-B",
    name: "Neural2 B (여성)",
    model: "Neural2",
    languageCode: "ko",
    gender: "FEMALE",
    accent: "한국어",
    description: "명확한 전달력의 아나운서 톤",
  },
  {
    id: "ko-KR-Neural2-C",
    name: "Neural2 C (남성)",
    model: "Neural2",
    languageCode: "ko",
    gender: "MALE",
    accent: "한국어",
    description: "신뢰감 있는 남성 내레이션",
  },

  // Chinese (Mandarin)
  {
    id: "cmn-CN-Neural2-A",
    name: "Neural2 A (女声)",
    model: "Neural2",
    languageCode: "zh",
    gender: "FEMALE",
    accent: "普通话",
    description: "清晰流畅的气象广播",
  },
  {
    id: "cmn-CN-Neural2-B",
    name: "Neural2 B (男声)",
    model: "Neural2",
    languageCode: "zh",
    gender: "MALE",
    accent: "普通话",
    description: "沉稳专业的新闻配音",
  },
  {
    id: "cmn-CN-Neural2-C",
    name: "Neural2 C (男声)",
    model: "Neural2",
    languageCode: "zh",
    gender: "MALE",
    accent: "普通话",
    description: "权威气象台专职音色",
  },

  // Arabic
  {
    id: "ar-XA-Neural2-A",
    name: "Neural2 A (أنثى)",
    model: "Neural2",
    languageCode: "ar",
    gender: "FEMALE",
    accent: "العربية الفصحى",
    description: "نبرة إذاعية واضحة ومخارج دقيقة",
  },
  {
    id: "ar-XA-Neural2-B",
    name: "Neural2 B (ذكر)",
    model: "Neural2",
    languageCode: "ar",
    gender: "MALE",
    accent: "العربية الفصحى",
    description: "صوت إخباري جهوري ورصين",
  },

  // Dutch
  {
    id: "nl-NL-Neural2-A",
    name: "Neural2 A (Vrouwelijk)",
    model: "Neural2",
    languageCode: "nl",
    gender: "FEMALE",
    accent: "Nederlands",
    description: "Natuurlijke stem voor weersverwachting",
  },
  {
    id: "nl-NL-Neural2-B",
    name: "Neural2 B (Mannelijk)",
    model: "Neural2",
    languageCode: "nl",
    gender: "MALE",
    accent: "Nederlands",
    description: "Helder radiostudio bericht",
  },

  // Turkish
  {
    id: "tr-TR-Neural2-A",
    name: "Neural2 A (Kadın)",
    model: "Neural2",
    languageCode: "tr",
    gender: "FEMALE",
    accent: "Türkçe",
    description: "Net ve doğal hava durumu sunumu",
  },
  {
    id: "tr-TR-Neural2-B",
    name: "Neural2 B (Erkek)",
    model: "Neural2",
    languageCode: "tr",
    gender: "MALE",
    accent: "Türkçe",
    description: "Otoriter radyo spikeri tonu",
  },

  // Polish
  {
    id: "pl-PL-Neural2-A",
    name: "Neural2 A (Żeński)",
    model: "Neural2",
    languageCode: "pl",
    gender: "FEMALE",
    accent: "Polski",
    description: "Czysty i naturalny komunikat synoptyczny",
  },
  {
    id: "pl-PL-Neural2-B",
    name: "Neural2 B (Męski)",
    model: "Neural2",
    languageCode: "pl",
    gender: "MALE",
    accent: "Polski",
    description: "Spokojna narracja pogodowa",
  },

  // Indonesian
  {
    id: "id-ID-Neural2-A",
    name: "Neural2 A (Wanita)",
    model: "Neural2",
    languageCode: "id",
    gender: "FEMALE",
    accent: "Bahasa Indonesia",
    description: "Siaran cuaca ramah dan jernih",
  },
  {
    id: "id-ID-Neural2-B",
    name: "Neural2 B (Pria)",
    model: "Neural2",
    languageCode: "id",
    gender: "MALE",
    accent: "Bahasa Indonesia",
    description: "Penyampaian data meteorologi akurat",
  },

  // Vietnamese
  {
    id: "vi-VN-Neural2-A",
    name: "Neural2 A (Nữ)",
    model: "Neural2",
    languageCode: "vi",
    gender: "FEMALE",
    accent: "Tiếng Việt",
    description: "Giọng đọc bản tin khí tượng truyền cảm",
  },

  // Thai
  {
    id: "th-TH-Neural2-C",
    name: "Neural2 C (หญิง)",
    model: "Neural2",
    languageCode: "th",
    gender: "FEMALE",
    accent: "ไทย",
    description: "เสียงรายงานสภาพอากาศธรรมชาติ",
  },

  // Swedish
  {
    id: "sv-SE-Neural2-A",
    name: "Neural2 A (Kvinna)",
    model: "Neural2",
    languageCode: "sv",
    gender: "FEMALE",
    accent: "Svenska",
    description: "Tydlig och professionell väderprognos",
  },
];

export function getAvailableGoogleVoices(lang: string, model?: GoogleTtsModel): GoogleTtsVoiceInfo[] {
  const shortLang = (lang || "en").split("-")[0].toLowerCase();
  let filtered = GOOGLE_TTS_VOICES.filter((v) => v.languageCode === shortLang);
  
  if (filtered.length === 0) {
    const langUpper = shortLang.toUpperCase();
    filtered = [
      {
        id: `${shortLang}-Neural2-A`,
        name: `Neural2 A (${langUpper})`,
        model: "Neural2",
        languageCode: shortLang,
        gender: "FEMALE",
        accent: `${langUpper} Standard`,
        description: `Google Neural2 voice for ${langUpper}`,
      },
      {
        id: `${shortLang}-Neural2-B`,
        name: `Neural2 B (${langUpper})`,
        model: "Neural2",
        languageCode: shortLang,
        gender: "MALE",
        accent: `${langUpper} Standard`,
        description: `Google Neural2 voice for ${langUpper}`,
      },
      {
        id: `${shortLang}-Standard-A`,
        name: `Standard A (${langUpper})`,
        model: "Standard",
        languageCode: shortLang,
        gender: "FEMALE",
        accent: `${langUpper} Standard`,
        description: `Google Standard speech for ${langUpper}`,
      },
    ];
  }

  if (model) {
    const modelFiltered = filtered.filter((v) => v.model === model);
    if (modelFiltered.length > 0) return modelFiltered;
  }
  return filtered;
}
