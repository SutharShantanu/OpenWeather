import { CurrentWeather, DailyForecastItem, HourlyForecastItem, formatTemperature } from "./weather";
import { TTS_VOICES } from "./edge-tts";
import { translateCondition } from "./translations";

export function generateWeatherBriefing(
  current: CurrentWeather,
  daily: DailyForecastItem[],
  hourly: HourlyForecastItem[],
  unit: "C" | "F",
  lang: string = "en"
): string {
  const temp = formatTemperature(current.temp, unit);
  const feelsLike = formatTemperature(current.feelsLike, unit);
  const tempMax = formatTemperature(current.tempMax, unit);
  const tempMin = formatTemperature(current.tempMin, unit);
  const pop = daily[0]?.pop ? Math.round(daily[0].pop * 100) : 0;
  const conditionDesc = translateCondition(current.condition.description, lang);

  if (lang === "hi") {
    const unitWord = unit === "C" ? "डिग्री सेल्सियस" : "डिग्री फ़ारेनहाइट";
    let script = `नमस्ते। प्रस्तुत है ${current.cityName}, ${current.country} के लिए मौसम रिपोर्ट। `;
    script += `वर्तमान में तापमान ${temp} ${unitWord} है और मौसम ${conditionDesc} है। `;
    script += `यह ${feelsLike} डिग्री जैसा महसूस हो रहा है। `;
    script += `आर्द्रता ${current.humidity} प्रतिशत है और हवा की गति ${current.windSpeed.toFixed(1)} मीटर प्रति सेकंड है। `;
    script += `आज का अधिकतम तापमान ${tempMax} डिग्री और न्यूनतम तापमान ${tempMin} डिग्री रहने की संभावना है। `;
    if (pop > 20) {
      script += `बारिश की संभावना ${pop} प्रतिशत है। छाता साथ रखने की सलाह दी जाती है। `;
    } else {
      script += `बारिश की संभावना ${pop} प्रतिशत है। `;
    }
    if (current.uvIndex !== undefined && current.uvIndex >= 6) {
      script += `पराबैंगनी किरणें उच्च स्तर पर हैं, इंडेक्स ${current.uvIndex.toFixed(1)}। धूप से सुरक्षा आवश्यक है। `;
    }
    return script;
  }

  if (lang === "es") {
    const unitWord = unit === "C" ? "grados Celsius" : "grados Fahrenheit";
    let script = `Buenos días. Aquí tiene el boletín meteorológico para ${current.cityName}, ${current.country}. `;
    script += `Actualmente la temperatura es de ${temp} ${unitWord} con ${conditionDesc}. `;
    script += `La sensación térmica es de ${feelsLike} grados. `;
    script += `La humedad se ubica en un ${current.humidity} por ciento, con vientos a ${current.windSpeed.toFixed(1)} metros por segundo. `;
    script += `La máxima prevista para hoy alcanzará los ${tempMax} grados y una mínima de ${tempMin} grados. `;
    if (pop > 20) {
      script += `La probabilidad de precipitaciones es del ${pop} por ciento. Se sugiere llevar paraguas. `;
    } else {
      script += `El riesgo de lluvia es bajo con un ${pop} por ciento. `;
    }
    if (current.uvIndex !== undefined && current.uvIndex >= 6) {
      script += `La radiación ultravioleta es alta con índice ${current.uvIndex.toFixed(1)}. Se recomienda protección solar. `;
    }
    return script;
  }

  if (lang === "fr") {
    const unitWord = unit === "C" ? "degrés Celsius" : "degrés Fahrenheit";
    let script = `Bonjour. Voici le bulletin météorologique pour ${current.cityName}, ${current.country}. `;
    script += `Actuellement, il fait ${temp} ${unitWord} avec ${conditionDesc}. `;
    script += `La température ressentie est de ${feelsLike} degrés. `;
    script += `Le taux d'humidité est de ${current.humidity} pour cent, avec un vent soufflant à ${current.windSpeed.toFixed(1)} mètres par seconde. `;
    script += `La température maximale atteindra ${tempMax} degrés pour une minimale de ${tempMin} degrés. `;
    if (pop > 20) {
      script += `La probabilité de précipitations est de ${pop} pour cent. Pensez à prendre un parapluie. `;
    } else {
      script += `Le risque de précipitations est faible à ${pop} pour cent. `;
    }
    if (current.uvIndex !== undefined && current.uvIndex >= 6) {
      script += `L'indice ultraviolet est élevé à ${current.uvIndex.toFixed(1)}. Une protection solaire est conseillée. `;
    }
    return script;
  }

  if (lang === "de") {
    const unitWord = unit === "C" ? "Grad Celsius" : "Grad Fahrenheit";
    let script = `Guten Tag. Hier ist der Wetterbericht für ${current.cityName}, ${current.country}. `;
    script += `Aktuell beträgt die Temperatur ${temp} ${unitWord} bei ${conditionDesc}. `;
    script += `Die gefühlte Temperatur liegt bei ${feelsLike} Grad. `;
    script += `Die Luftfeuchtigkeit beträgt ${current.humidity} Prozent bei Windgeschwindigkeiten von ${current.windSpeed.toFixed(1)} Metern pro Sekunde. `;
    script += `Die Höchsttemperatur erreicht heute ${tempMax} Grad, der Tiefstwert liegt bei ${tempMin} Grad. `;
    if (pop > 20) {
      script += `Die Niederschlagswahrscheinlichkeit liegt bei ${pop} Prozent. Ein Regenschirm wird empfohlen. `;
    } else {
      script += `Das Niederschlagsrisiko ist gering bei ${pop} Prozent. `;
    }
    if (current.uvIndex !== undefined && current.uvIndex >= 6) {
      script += `Die UV-Belastung ist mit Index ${current.uvIndex.toFixed(1)} erhöht. Sonnenschutz ist ratsam. `;
    }
    return script;
  }

  if (lang === "ja") {
    const unitWord = unit === "C" ? "度" : "華氏度";
    let script = `こんにちは。${current.cityName}、${current.country}の気象情報をお伝えします。`;
    script += `現在、気温は${temp}${unitWord}で、天気は${conditionDesc}です。`;
    script += `体感温度は${feelsLike}度です。`;
    script += `湿度は${current.humidity}パーセント、風速は秒速${current.windSpeed.toFixed(1)}メートルです。`;
    script += `本日の予想最高気温は${tempMax}度、最低気温は${tempMin}度です。`;
    if (pop > 20) {
      script += `降水確率は${pop}パーセントです。雨具の携行をお勧めします。`;
    } else {
      script += `降水確率は${pop}パーセントと低めです。`;
    }
    if (current.uvIndex !== undefined && current.uvIndex >= 6) {
      script += `紫外線指数は${current.uvIndex.toFixed(1)}と強くなっています。紫外線対策を行ってください。`;
    }
    return script;
  }

  // English fallback
  const unitWord = unit === "C" ? "Celsius" : "Fahrenheit";
  let script = `Good day. Here is your meteorological briefing for ${current.cityName}, ${current.country}. `;
  script += `Currently, it is ${temp} degrees ${unitWord} with ${conditionDesc}. `;
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
  volumeGainDb?: number;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnd?: () => void;
  onError?: (err?: unknown) => void;
}

export class WeatherSpeechSynthesizer {
  private static utterance: SpeechSynthesisUtterance | null = null;
  private static audio: HTMLAudioElement | null = null;
  private static abortController: AbortController | null = null;
  /** Incremented on every speak()/stop(); async work from an older session must not play. */
  private static generation = 0;
  /** Ends the active session exactly once (fires its onEnd) when it is stopped or superseded. */
  private static settleActive: (() => void) | null = null;

  /**
   * Starts a new playback session: invalidates any in-flight request and wraps
   * onEnd/onError so exactly one of them fires per session, including when
   * the session is cut short by stop() or a newer speak().
   */
  private static beginSession(options?: WeatherSpeechOptions) {
    this.stop();
    const generation = ++this.generation;
    let settled = false;
    const markSettled = () => {
      if (settled) return false;
      settled = true;
      if (this.settleActive === cancel) this.settleActive = null;
      return true;
    };
    const cancel = () => {
      if (markSettled()) options?.onEnd?.();
    };
    this.settleActive = cancel;

    const sessionOptions: WeatherSpeechOptions = {
      ...options,
      onEnd: () => {
        if (markSettled()) options?.onEnd?.();
      },
      onError: (err?: unknown) => {
        if (markSettled()) options?.onError?.(err);
      },
    };
    return {
      options: sessionOptions,
      isCurrent: () => generation === this.generation,
    };
  }

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

  /**
   * Speak directly with the browser's Web Speech API, skipping the /api/tts
   * round trip (e.g. after the route already answered `{ fallback: true }`).
   */
  public static speakWithWebSpeech(
    text: string,
    options?: WeatherSpeechOptions
  ): void {
    if (!this.isSupported() || !text) return;
    const session = this.beginSession(options);
    this.fallbackWebSpeech(text, session.options);
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
      if (options?.volumeGainDb !== undefined) {
        utterance.volume = Math.max(0, Math.min(1.0, Math.pow(10, options.volumeGainDb / 20)));
      }

      // Try to find matching voice in browser
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = (options?.lang || "en").split("-")[0].toLowerCase();
      const isMale =
        TTS_VOICES.find((v) => v.id === options?.voiceName)?.gender ===
        "MALE";

      const genderKeywords = isMale
        ? ["male", "david", "george", "guy", "james", "richard", "martin", "stefan", "daniel"]
        : ["female", "zira", "susan", "samantha", "victoria", "karen", "catherine", "helena"];

      const matchingGenderVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(langPrefix) &&
          genderKeywords.some((kw) => v.name.toLowerCase().includes(kw))
      );

      const googleVoice =
        matchingGenderVoice ||
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

  public static pause(): void {
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    } else if (typeof window !== "undefined" && window.speechSynthesis?.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public static resume(): void {
    if (this.audio && this.audio.paused) {
      this.audio.play().catch(console.warn);
    } else if (typeof window !== "undefined" && window.speechSynthesis?.paused) {
      window.speechSynthesis.resume();
    }
  }

  public static isPaused(): boolean {
    if (this.audio) return this.audio.paused;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      return window.speechSynthesis.paused;
    }
    return false;
  }

  public static stop(): void {
    if (typeof window === "undefined") return;

    this.generation++;
    const settleActive = this.settleActive;
    this.settleActive = null;

    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }

    if (this.audio) {
      try {
        this.audio.onplay = null;
        this.audio.onpause = null;
        this.audio.ontimeupdate = null;
        this.audio.onended = null;
        this.audio.onerror = null;
        this.audio.pause();
        this.audio.currentTime = 0;
      } catch {}
      this.audio = null;
    }

    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
      this.utterance = null;
    }

    // Tell the stopped session's owner it has ended (its audio handlers were detached above)
    settleActive?.();
  }
}
