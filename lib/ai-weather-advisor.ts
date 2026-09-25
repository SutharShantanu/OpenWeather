import { CurrentWeather, DailyForecastItem, HourlyForecastItem, formatTemperature } from "./weather";
import { Translations, getTranslation, translateCondition } from "./translations";

export interface SuddenChangeAlert {
  id: string;
  type: "RAIN_INBOUND" | "RAPID_COOLING" | "RAPID_HEATING" | "WIND_SURGE" | "UV_SPIKE";
  urgency: "HIGH" | "MEDIUM" | "INFO";
  title: string;
  detail: string;
  action: string;
  timing: string;
}

export interface PlannedWeatherShift {
  period: string;
  headline: string;
  summary: string;
  temperatureShift: string;
  precipitationRisk: string;
}

export interface LifestyleRecommendation {
  category: "CLOTHING" | "COMMUTE" | "OUTDOOR_SPORTS" | "HOME_ENERGY";
  score?: number; // 1 to 10
  advice: string;
}

export interface AiWeatherAnalysis {
  generatedAt: string;
  suddenAlerts: SuddenChangeAlert[];
  plannedShifts: PlannedWeatherShift[];
  recommendations: LifestyleRecommendation[];
  overallSynopticSummary: string;
}

export function analyzeWeatherWithAi(
  current: CurrentWeather,
  hourly: HourlyForecastItem[],
  daily: DailyForecastItem[],
  unit: "C" | "F",
  t?: Translations
): AiWeatherAnalysis {
  const trans = t || getTranslation("en");
  const ai = trans.aiAdvisor;
  const suddenAlerts: SuddenChangeAlert[] = [];
  const plannedShifts: PlannedWeatherShift[] = [];
  const recommendations: LifestyleRecommendation[] = [];

  const next12Hours = hourly.slice(0, 12);

  // 1. Check for Sudden Rain Inbound (Probability jump in next 4 hours)
  const currentPop = (hourly[0]?.pop ?? 0) * 100;
  for (let i = 1; i < Math.min(6, next12Hours.length); i++) {
    const futurePop = Math.round((next12Hours[i].pop ?? 0) * 100);
    if (futurePop >= 45 && futurePop - currentPop >= 25) {
      suddenAlerts.push({
        id: "ai-sudden-rain",
        type: "RAIN_INBOUND",
        urgency: "HIGH",
        title: ai.suddenRainTitle,
        detail: ai.suddenRainDetail(Math.round(currentPop), futurePop, next12Hours[i].time),
        action: ai.suddenRainAction,
        timing: ai.timingAround(next12Hours[i].time),
      });
      break;
    }
  }

  // 2. Check for Rapid Cooling (e.g. > 3.5°C drop in 3-4 hours)
  if (next12Hours.length >= 4) {
    const t0 = next12Hours[0].temp;
    for (let i = 2; i < Math.min(6, next12Hours.length); i++) {
      const drop = t0 - next12Hours[i].temp;
      if (drop >= 3.5) {
        suddenAlerts.push({
          id: "ai-rapid-cooling",
          type: "RAPID_COOLING",
          urgency: "MEDIUM",
          title: ai.rapidCoolingTitle,
          detail: ai.rapidCoolingDetail(formatTemperature(drop, unit), unit, i),
          action: ai.rapidCoolingAction,
          timing: ai.timingBy(next12Hours[i].time),
        });
        break;
      }
    }
  }

  // 3. Check for Wind Surge / Gust Spike
  for (let i = 0; i < Math.min(8, next12Hours.length); i++) {
    const item = next12Hours[i];
    if ((item.windGusts && item.windGusts >= 14) || item.windSpeed >= 11) {
      suddenAlerts.push({
        id: "ai-wind-surge",
        type: "WIND_SURGE",
        urgency: "MEDIUM",
        title: ai.windSurgeTitle,
        detail: ai.windSurgeDetail((item.windGusts || item.windSpeed * 1.5).toFixed(1), item.time),
        action: ai.windSurgeAction,
        timing: ai.timingAround(item.time),
      });
      break;
    }
  }

  // 4. Planned Changes: Tomorrow vs Today
  if (daily.length >= 2) {
    const today = daily[0];
    const tomorrow = daily[1];
    const todayMax = formatTemperature(today.tempMax, unit);
    const tomMax = formatTemperature(tomorrow.tempMax, unit);
    const diff = tomMax - todayMax;

    let shiftText = ai.tomorrowConsistent;
    if (diff >= 2) shiftText = ai.tomorrowWarmer(diff, unit);
    else if (diff <= -2) shiftText = ai.tomorrowCooler(Math.abs(diff), unit);

    const tomDesc = translateCondition(tomorrow.description);
    plannedShifts.push({
      period: ai.tomorrowPeriod,
      headline: `${ai.tomorrowPeriod} ${current.cityName}: ${tomDesc}`,
      summary: `${trans.climate.normalHigh} ${tomMax}°${unit}, ${trans.climate.normalLow} ${formatTemperature(tomorrow.tempMin, unit)}°${unit}.`,
      temperatureShift: shiftText,
      precipitationRisk: Math.round(tomorrow.pop * 100) > 25 ? ai.tomorrowRainChance(Math.round(tomorrow.pop * 100)) : ai.tomorrowMainlyDry,
    });
  }

  // 5. Planned Changes: Coming Weekend
  const weekendDays = daily.filter((d) => d.day === "SAT" || d.day === "SUN");
  if (weekendDays.length > 0) {
    const sat = weekendDays[0];
    const sun = weekendDays[1] || sat;
    const avgWeekendTemp = Math.round((sat.tempMax + sun.tempMax) / 2);
    const weekendRain = Math.max(sat.pop, sun.pop) > 0.3;

    plannedShifts.push({
      period: ai.weekendPeriod,
      headline: ai.weekendHeadline,
      summary: weekendRain ? ai.weekendSummaryRain(formatTemperature(avgWeekendTemp, unit), unit) : ai.weekendSummaryDry(formatTemperature(avgWeekendTemp, unit), unit),
      temperatureShift: ai.weekendHighsNear(formatTemperature(avgWeekendTemp, unit), unit),
      precipitationRisk: weekendRain ? ai.weekendPrecipProbable : ai.weekendPrecipMinimal,
    });
  }

  // 6. Lifestyle & Activity Recommendations
  const isCold = current.temp < 12;
  const isHot = current.temp > 28;
  const willRain = next12Hours.some((h) => (h.pop ?? 0) > 0.4);

  // Clothing
  let clothing = ai.clothingMild;
  if (isCold) clothing = ai.clothingCold;
  else if (isHot) clothing = ai.clothingHot;
  if (willRain) clothing += ai.clothingRain;
  recommendations.push({ category: "CLOTHING", advice: clothing });

  // Outdoor sports index
  let sportScore = 9;
  if (willRain) sportScore -= 3;
  if (current.windSpeed > 10) sportScore -= 2;
  if (isHot || isCold) sportScore -= 2;
  sportScore = Math.max(2, Math.min(10, sportScore));

  recommendations.push({
    category: "OUTDOOR_SPORTS",
    score: sportScore,
    advice:
      sportScore >= 8
        ? ai.sportSuperb
        : sportScore >= 5
        ? ai.sportAcceptable
        : ai.sportAdverse,
  });

  // Commute
  recommendations.push({
    category: "COMMUTE",
    advice: willRain ? ai.commuteRain : ai.commuteDry,
  });

  const condDesc = translateCondition(current.condition.description);
  const overallSummary = `${current.cityName}: ${condDesc}, ${formatTemperature(current.temp, unit)}°${unit}. ${
    suddenAlerts.length > 0
      ? `${suddenAlerts[0].title}. `
      : `${ai.summarySteady} `
  }`;

  return {
    generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    suddenAlerts,
    plannedShifts,
    recommendations,
    overallSynopticSummary: overallSummary,
  };
}
