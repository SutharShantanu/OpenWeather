"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertCircle,
  Calendar,
  Send,
  HelpCircle,
  CloudRain,
  Sun,
  Wind,
  Shirt,
  X,
  Bot,
} from "lucide-react";
import { UniversalDialog } from "@/components/universal-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CurrentWeather, DailyForecastItem, HourlyForecastItem, formatTemperature } from "@/lib/weather";
import { analyzeWeatherWithAi, AiWeatherAnalysis } from "@/lib/ai-weather-advisor";

interface AiAdvisorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  unit: "C" | "F";
}

export function AiAdvisorDialog({
  open,
  onOpenChange,
  current,
  hourly,
  daily,
  unit,
}: AiAdvisorDialogProps) {
  const [question, setQuestion] = useState("");
  const [customAnswers, setCustomAnswers] = useState<{ q: string; a: string }[]>([]);
  const analysis: AiWeatherAnalysis = analyzeWeatherWithAi(current, hourly, daily, unit);

  const answerQuery = (q: string) => {
    const lower = q.toLowerCase();
    let reply = "";

    if (lower.includes("umbrella") || lower.includes("rain")) {
      const willRain = hourly.slice(0, 12).some((h) => (h.pop ?? 0) > 0.35);
      const rainHour = hourly.slice(0, 12).find((h) => (h.pop ?? 0) > 0.35);
      reply = willRain
        ? `Yes, keep an umbrella handy. Precipitation probability exceeds 35% around ${rainHour?.time || "today"}.`
        : `Precipitation probability is below 20% for the next 12 hours. You likely do not need an umbrella.`;
    } else if (lower.includes("wear") || lower.includes("dress") || lower.includes("clothing") || lower.includes("jacket")) {
      const temp = formatTemperature(current.temp, unit);
      if (current.temp < 12) {
        reply = `It is currently ${temp}°${unit}. We recommend a warm insulated coat or fleece jacket, long trousers, and closed-toe footwear.`;
      } else if (current.temp > 25) {
        reply = `It is currently ${temp}°${unit}. Wear light, breathable clothing (linen/cotton), UV-protection sunglasses, and apply sunscreen.`;
      } else {
        reply = `It is a mild ${temp}°${unit}. Comfortable layers (a light cardigan, hoodie, or windbreaker over a t-shirt) are ideal.`;
      }
    } else if (lower.includes("run") || lower.includes("workout") || lower.includes("exercise") || lower.includes("sport") || lower.includes("cycling")) {
      const bestHour = hourly.slice(0, 12).reduce((best, cur) => (cur.temp < best.temp ? cur : best), hourly[0]);
      reply = `The best window for outdoor exercise is around ${bestHour?.time || "early morning"}, with cooler temperatures (${formatTemperature(bestHour?.temp || current.temp, unit)}°${unit}) and lower thermal stress.`;
    } else if (lower.includes("tomorrow")) {
      const tom = daily[1];
      if (tom) {
        reply = `Tomorrow in ${current.cityName}: ${tom.description}. High of ${formatTemperature(tom.tempMax, unit)}°${unit}, low of ${formatTemperature(tom.tempMin, unit)}°${unit}, and a ${Math.round(tom.pop * 100)}% chance of rain.`;
      } else {
        reply = "Tomorrow is expected to remain consistent with current synoptic trends.";
      }
    } else if (lower.includes("weekend")) {
      const weekend = daily.filter((d) => d.day === "SAT" || d.day === "SUN");
      if (weekend.length > 0) {
        reply = `Weekend synoptic outlook: Saturday (${weekend[0].description}, max ${formatTemperature(weekend[0].tempMax, unit)}°${unit}), Sunday (${weekend[1]?.description || weekend[0].description}, max ${formatTemperature(weekend[1]?.tempMax || weekend[0].tempMax, unit)}°${unit}).`;
      } else {
        reply = "The extended weekend forecast will be available as we approach the end of the week.";
      }
    } else {
      reply = `Synoptic evaluation for ${current.cityName}: Atmospheric pressure is ${current.pressure} hPa with humidity at ${current.humidity}%. Condition is ${current.condition.description}. Expected 24-hour diurnal range is ${formatTemperature(daily[0]?.tempMin || current.temp - 3, unit)}° to ${formatTemperature(daily[0]?.tempMax || current.temp + 4, unit)}°${unit}.`;
    }

    setCustomAnswers((prev) => [{ q, a: reply }, ...prev]);
    setQuestion("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      answerQuery(question.trim());
    }
  };

  return (
    <UniversalDialog
      open={open}
      onOpenChange={onOpenChange}
      icon={<Sparkles className="size-3.5" />}
      title="AI Synoptic Weather Intelligence"
      description={`Predictive pattern analytics for sudden shifts, lifestyle planning & advisory for ${current.cityName}`}
      contentClassName="font-mono"
      bodyClassName="space-y-4"
      scrollable={true}
    >
          {/* Sudden Shifts Section */}
          <div className="space-y-2">
            <div className="text-tiny font-mono uppercase text-muted-foreground font-bold tracking-wider">
              Short-Range Sudden Disturbances (Next 6-12h)
            </div>
            {analysis.suddenAlerts.length > 0 ? (
              analysis.suddenAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 bg-destructive/10 border border-destructive/30 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-destructive flex items-center gap-1.5">
                      <AlertCircle className="size-3.5" />
                      <span>{alert.title}</span>
                    </span>
                    <Badge variant="destructive" className="text-micro font-mono">
                      {alert.timing}
                    </Badge>
                  </div>
                  <p className="text-foreground">{alert.detail}</p>
                  <p className="text-muted-foreground text-mini">
                    <span className="font-semibold text-foreground">Guidance:</span> {alert.action}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-3 bg-muted/20 border border-border text-muted-foreground">
                Atmospheric stability is high. No sudden cold fronts, squalls, or rapid precipitation onset detected.
              </div>
            )}
          </div>

          {/* Planned Shifts Section */}
          <div className="space-y-2">
            <div className="text-tiny font-mono uppercase text-muted-foreground font-bold tracking-wider">
              Planned Synoptic Shifts & Multi-Day Trend
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.plannedShifts.map((shift, idx) => (
                <div key={idx} className="p-3 bg-muted/20 border border-border space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{shift.period}</span>
                    <Badge variant="outline" className="text-micro font-mono text-primary border-primary/30">
                      {shift.temperatureShift}
                    </Badge>
                  </div>
                  <p className="text-mini text-foreground">{shift.summary}</p>
                  <div className="text-tiny text-muted-foreground">
                    Precipitation Risk: <span className="text-foreground">{shift.precipitationRisk}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Questions Chips */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="text-tiny font-mono uppercase text-muted-foreground font-bold tracking-wider">
              Quick AI Consultation
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                "Should I carry an umbrella today?",
                "What should I wear right now?",
                "Best time for outdoor exercise?",
                "How will tomorrow feel?",
              ].map((q, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="xs"
                  onClick={() => answerQuery(q)}
                  className="text-mini h-6 font-mono"
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

          {/* Interactive Chat Input */}
          <form onSubmit={handleSubmit} className="flex gap-2 pt-1">
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask AI about commute, apparel, rain window..."
              className="h-8 text-xs font-mono rounded-none"
            />
            <Button type="submit" size="sm" className="h-8 px-3 font-mono text-xs gap-1">
              <Send className="size-3" />
              <span>Ask</span>
            </Button>
          </form>

          {/* Conversation history */}
          {customAnswers.length > 0 && (
            <div className="space-y-2.5 pt-2 border-t border-border max-h-48 overflow-y-auto">
              {customAnswers.map((item, idx) => (
                <div key={idx} className="p-2.5 bg-muted/20 border border-border space-y-1">
                  <div className="font-semibold text-primary flex items-center gap-1.5">
                    <Bot className="size-3" />
                    <span>Q: {item.q}</span>
                  </div>
                  <p className="text-foreground leading-relaxed pl-4 border-l border-primary/30">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          )}
    </UniversalDialog>
  );
}
