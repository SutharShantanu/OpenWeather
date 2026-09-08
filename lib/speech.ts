import { CurrentWeather, DailyForecastItem, HourlyForecastItem, formatTemperature } from "./weather";
import { GoogleTtsAudioProfile, GoogleTtsModel } from "./google-tts";

export function generateWeatherBriefing(
  current: CurrentWeather,
  daily: DailyForecastItem[],
  hourly: HourlyForecastItem[],
  unit: "C" | "F"
): string {
  const temp = formatTemperature(current.temp, unit);
  const feelsLike = formatTemperature(current.feelsLike, unit);
  const tempMax = formatTemperature(current.tempMax, unit);
  const tempMin = formatTemperature(current.tempMin, unit);
  const pop = daily[0]?.pop ? Math.round(daily[0].pop * 100) : 0;
  const unitWord = unit === "C" ? "Celsius" : "Fahrenheit";

  let script = `Good day. Here is your meteorological briefing for ${current.cityName}, ${current.country}. `;
  script += `Currently, it is ${temp} degrees ${unitWord} with ${current.condition.description}. `;
  script += `It feels like ${feelsLike} degrees. `;
  script += `Humidity is at ${current.humidity} percent, with winds blowing at ${current.windSpeed.toFixed(1)} meters per second. `;
  script += `Today's temperature will peak at ${tempMax} degrees with an expected low of ${tempMin} degrees. `;

  if (pop > 20) {
    script += `Precipitation probability is elevated at ${pop} percent. An umbrella is recommended. `;
  } else {
    script += `Precipitation risk is low at ${pop} percent. `;
  }

  if (current.uvIndex !== undefined && current.uvIndex >= 6) {
    script += `Ultraviolet radiation is high at index ${current.uvIndex.toFixed(1)}. Solar photoprotection is advised. `;
  }

  return script;
}

export interface WeatherSpeechOptions {
  rate?: number;
  pitch?: number; // semitones (-4.0 to +4.0)
  lang?: string;
  voiceName?: string;
  model?: GoogleTtsModel;
  audioProfile?: GoogleTtsAudioProfile;
  volumeGainDb?: number;
  googleApiKey?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
}

export class WeatherSpeechSynthesizer {
  private static utterance: SpeechSynthesisUtterance | null = null;
  private static audio: HTMLAudioElement | null = null;
  private static abortController: AbortController | null = null;

  public static isSupported(): boolean {
    return typeof window !== "undefined";
  }

  public static isSpeaking(): boolean {
    if (typeof window === "undefined") return false;
    const isAudioPlaying = this.audio !== null && !this.audio.paused && !this.audio.ended;
    const isUtteranceSpeaking =
      typeof window.speechSynthesis !== "undefined" &&
      window.speechSynthesis.speaking;
    return isAudioPlaying || isUtteranceSpeaking;
  }

  public static async speak(
    text: string,
    options?: WeatherSpeechOptions
  ): Promise<void> {
    if (!this.isSupported() || !text) return;

    this.stop();

    // 1. Try Google Text-to-Speech API route first
    try {
      this.abortController = new AbortController();

      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          voiceName: options?.voiceName || "en-US-Journey-F",
          model: options?.model || "Journey",
          languageCode: options?.lang || "en-US",
          speakingRate: options?.rate ?? 1.0,
          pitch: options?.pitch ?? 0.0,
          volumeGainDb: options?.volumeGainDb ?? 0.0,
          effectsProfileId: options?.audioProfile || "headphone-class-device",
          apiKey: options?.googleApiKey,
        }),
        signal: this.abortController.signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioContent) {
          const audio = new Audio("data:audio/mp3;base64," + data.audioContent);
          if (options?.rate && options.rate !== 1.0) {
            audio.playbackRate = Math.max(0.5, Math.min(2.0, options.rate));
          }

          audio.onplay = () => {
            options?.onStart?.();
          };

          audio.onended = () => {
            this.audio = null;
            options?.onEnd?.();
          };

          audio.onerror = (e) => {
            console.warn("Google TTS audio playback error, falling back to Web Speech API:", e);
            this.audio = null;
            this.fallbackWebSpeech(text, options);
          };

          this.audio = audio;
          await audio.play();
          return;
        }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }
      console.warn("Google Cloud TTS fetch error, falling back to Web Speech API:", err);
    }

    // 2. Fallback to Browser Web Speech API with Google voice preference
    this.fallbackWebSpeech(text, options);
  }

  private static fallbackWebSpeech(
    text: string,
    options?: WeatherSpeechOptions
  ): void {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      options?.onError?.("Speech synthesis not supported in this browser");
      return;
    }

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options?.rate ?? 1.0;
      
      // Convert semitones (-4.0 to +4.0) into pitch (0.5 to 1.5)
      const semitones = options?.pitch ?? 0.0;
      utterance.pitch = Math.max(0.5, Math.min(1.8, 1.0 + semitones / 8));
      utterance.lang = options?.lang ?? "en-US";

      // Try to find native Google voice in browser
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = (options?.lang || "en").split("-")[0].toLowerCase();
      const googleVoice =
        voices.find(
          (v) =>
            v.name.toLowerCase().includes("google") &&
            v.lang.toLowerCase().startsWith(langPrefix)
        ) ||
        voices.find((v) => v.name.toLowerCase().includes("google")) ||
        voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));

      if (googleVoice) {
        utterance.voice = googleVoice;
      }

      if (options?.onStart) utterance.onstart = options.onStart;
      if (options?.onEnd) utterance.onend = options.onEnd;
      if (options?.onError) utterance.onerror = options.onError;

      this.utterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      options?.onError?.(err);
    }
  }

  public static stop(): void {
    if (typeof window === "undefined") return;

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = "";
      } catch {}
      this.audio = null;
    }

    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      this.utterance = null;
    }
  }
}
