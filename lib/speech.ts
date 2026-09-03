import { CurrentWeather, DailyForecastItem, HourlyForecastItem, formatTemperature } from "./weather";

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

export class WeatherSpeechSynthesizer {
  private static utterance: SpeechSynthesisUtterance | null = null;

  public static isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public static isSpeaking(): boolean {
    if (!this.isSupported()) return false;
    return window.speechSynthesis.speaking;
  }

  public static speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      lang?: string;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (!this.isSupported()) return;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options?.rate ?? 1.0;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.lang = options?.lang ?? "en-US";

    if (options?.onStart) {
      utterance.onstart = options.onStart;
    }
    if (options?.onEnd) {
      utterance.onend = options.onEnd;
    }
    if (options?.onError) {
      utterance.onerror = options.onError;
    }

    this.utterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  public static stop(): void {
    if (!this.isSupported()) return;
    window.speechSynthesis.cancel();
    this.utterance = null;
  }
}
