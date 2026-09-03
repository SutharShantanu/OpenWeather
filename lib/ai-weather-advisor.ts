import { CurrentWeather, DailyForecastItem, HourlyForecastItem, formatTemperature } from "./weather";

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
  period: "TOMORROW" | "WEEKEND" | "WEEKLY_TREND";
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
  unit: "C" | "F"
): AiWeatherAnalysis {
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
        title: "Sudden Rain Approaching",
        detail: `Precipitation probability surges from ${Math.round(currentPop)}% to ${futurePop}% at approximately ${next12Hours[i].time}.`,
        action: "Take an umbrella and plan for wet transit conditions.",
        timing: `Around ${next12Hours[i].time}`,
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
          title: "Rapid Thermal Drop Anticipated",
          detail: `Temperatures will drop by ${formatTemperature(drop, unit)}°${unit} within ${i} hours.`,
          action: "Carry a sweater or jacket if staying out past twilight.",
          timing: `By ${next12Hours[i].time}`,
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
        title: "Sudden Wind Velocity Surge",
        detail: `Strong wind gusts up to ${(item.windGusts || item.windSpeed * 1.5).toFixed(1)} m/s detected around ${item.time}.`,
        action: "Secure outdoor furniture and watch for crosswinds during highway transit.",
        timing: `Around ${item.time}`,
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

    let shiftText = "Consistent temperature";
    if (diff >= 2) shiftText = `${diff}°${unit} warmer`;
    else if (diff <= -2) shiftText = `${Math.abs(diff)}°${unit} cooler`;

    plannedShifts.push({
      period: "TOMORROW",
      headline: `Tomorrow in ${current.cityName}: ${tomorrow.description}`,
      summary: `Expected high of ${tomMax}°${unit} and low of ${formatTemperature(tomorrow.tempMin, unit)}°${unit}.`,
      temperatureShift: shiftText,
      precipitationRisk: Math.round(tomorrow.pop * 100) > 25 ? `${Math.round(tomorrow.pop * 100)}% chance of rain` : "Mainly dry",
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
      period: "WEEKEND",
      headline: "Weekend Climatological Outlook",
      summary: `Expect ${weekendRain ? "sporadic precipitation" : "favorable synoptic stability"} with temperatures hovering around ${formatTemperature(avgWeekendTemp, unit)}°${unit}.`,
      temperatureShift: `Highs near ${formatTemperature(avgWeekendTemp, unit)}°${unit}`,
      precipitationRisk: weekendRain ? "Precipitation probable" : "Minimal precipitation risk",
    });
  }

  // 6. Lifestyle & Activity Recommendations
  const isCold = current.temp < 12;
  const isHot = current.temp > 28;
  const willRain = next12Hours.some((h) => (h.pop ?? 0) > 0.4);

  // Clothing
  let clothing = "Light layers with comfortable breathable clothing.";
  if (isCold) clothing = "Thermal insulated jacket, scarf, and layered garments advised.";
  else if (isHot) clothing = "Ultra-light breathable fabrics, wide-brim hat, and sunglasses recommended.";
  if (willRain) clothing += " Waterproof outer shell or compact umbrella essential.";
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
        ? "Superb conditions for outdoor running, cycling, or recreation."
        : sportScore >= 5
        ? "Acceptable outdoor conditions; schedule activities before precipitation onset."
        : "Adverse meteorological conditions; indoor training recommended.",
  });

  // Commute
  recommendations.push({
    category: "COMMUTE",
    advice: willRain
      ? "Expect vehicular congestion and slick pavement during peak transit intervals."
      : "Dry conditions with nominal transit predictability across the city grid.",
  });

  const overallSummary = `Synoptic analysis for ${current.cityName}: ${current.condition.description} with ambient temperature at ${formatTemperature(current.temp, unit)}°${unit}. ${
    suddenAlerts.length > 0
      ? `Attention: ${suddenAlerts[0].title}. `
      : "Atmospheric equilibrium is currently steady across the short-range trajectory. "
  }`;

  return {
    generatedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    suddenAlerts,
    plannedShifts,
    recommendations,
    overallSynopticSummary: overallSummary,
  };
}
