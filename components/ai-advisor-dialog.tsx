"use client";

import React, { useState } from "react";
import {
  Sparkles,
  AlertCircle,
  Send,
  Bot,
} from "lucide-react";
import { UniversalDialog } from "@/components/universal-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CurrentWeather, DailyForecastItem, HourlyForecastItem, formatTemperature } from "@/lib/weather";
import { analyzeWeatherWithAi, AiWeatherAnalysis } from "@/lib/ai-weather-advisor";
import { useDisplayPreferences } from "@/components/display-preferences-provider";
import { useTranslation } from "@/components/language-provider";

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
  const { t, translateCondition } = useTranslation();
  const ai = t.aiAdvisor;
  const prefs = useDisplayPreferences();
  const [question, setQuestion] = useState("");
  const [customAnswers, setCustomAnswers] = useState<{ q: string; a: string }[]>([]);
  const analysis: AiWeatherAnalysis = analyzeWeatherWithAi(current, hourly, daily, unit, t);

  const answerQuery = (q: string) => {
    const lower = q.toLowerCase();
    let reply = "";

    if (lower.includes("umbrella") || lower.includes("rain")) {
      const willRain = hourly.slice(0, 12).some((h) => (h.pop ?? 0) > 0.35);
      const rainHour = hourly.slice(0, 12).find((h) => (h.pop ?? 0) > 0.35);
      reply = willRain
        ? ai.answerUmbrellaYes(rainHour?.time ? prefs.clock(rainHour.time) : t.common.today)
        : ai.answerUmbrellaNo;
    } else if (lower.includes("wear") || lower.includes("dress") || lower.includes("clothing") || lower.includes("jacket")) {
      const temp = formatTemperature(current.temp, unit);
      if (current.temp < 12) {
        reply = ai.answerWearCold(String(temp), unit);
      } else if (current.temp > 25) {
        reply = ai.answerWearHot(String(temp), unit);
      } else {
        reply = ai.answerWearMild(String(temp), unit);
      }
    } else if (lower.includes("run") || lower.includes("workout") || lower.includes("exercise") || lower.includes("sport") || lower.includes("cycling")) {
      const bestHour = hourly.slice(0, 12).reduce((best, cur) => (cur.temp < best.temp ? cur : best), hourly[0]);
      reply = ai.answerExercise(
        bestHour?.time ? prefs.clock(bestHour.time) : t.common.today,
        String(formatTemperature(bestHour?.temp || current.temp, unit)),
        unit
      );
    } else if (lower.includes("tomorrow")) {
      const tom = daily[1];
      if (tom) {
        reply = ai.answerTomorrow(
          current.cityName,
          translateCondition(tom.description),
          String(formatTemperature(tom.tempMax, unit)),
          String(formatTemperature(tom.tempMin, unit)),
          unit,
          Math.round(tom.pop * 100)
        );
      } else {
        reply = ai.answerTomorrowFallback;
      }
    } else if (lower.includes("weekend")) {
      const weekend = daily.filter((d) => d.day === "SAT" || d.day === "SUN");
      if (weekend.length > 0) {
        reply = ai.answerWeekend(
          translateCondition(weekend[0].description),
          String(formatTemperature(weekend[0].tempMax, unit)),
          translateCondition(weekend[1]?.description || weekend[0].description),
          String(formatTemperature(weekend[1]?.tempMax || weekend[0].tempMax, unit)),
          unit
        );
      } else {
        reply = ai.answerWeekendFallback;
      }
    } else {
      reply = ai.answerGeneral(
        current.cityName,
        prefs.pressureText(current.pressure),
        current.humidity,
        translateCondition(current.condition.description),
        String(formatTemperature(daily[0]?.tempMin || current.temp - 3, unit)),
        String(formatTemperature(daily[0]?.tempMax || current.temp + 4, unit)),
        unit
      );
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
      title={ai.dialogTitle}
      description={ai.dialogDesc(current.cityName)}
      contentClassName="font-mono"
      bodyClassName="space-y-4"
      scrollable={true}
    >
      {/* Sudden Shifts Section */}
      <div className="space-y-2">
        <div className="text-tiny font-mono uppercase text-muted-foreground font-bold tracking-wider">
          {ai.shortRangeDisturbances}
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
                <span className="font-semibold text-foreground">{ai.guidanceLabel}</span> {alert.action}
              </p>
            </div>
          ))
        ) : (
          <div className="p-3 bg-muted/20 border border-border text-muted-foreground">
            {ai.stabilityHigh}
          </div>
        )}
      </div>

      {/* Planned Shifts Section */}
      <div className="space-y-2">
        <div className="text-tiny font-mono uppercase text-muted-foreground font-bold tracking-wider">
          {ai.plannedShiftsTitle}
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
                {ai.precipRiskLabel} <span className="text-foreground">{shift.precipitationRisk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Questions Chips */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="text-tiny font-mono uppercase text-muted-foreground font-bold tracking-wider">
          {ai.quickConsultationTitle}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            ai.quickQuestionUmbrella,
            ai.quickQuestionWear,
            ai.quickQuestionExercise,
            ai.quickQuestionTomorrow,
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
          placeholder={ai.chatPlaceholder}
          className="h-8 text-xs font-mono rounded-none"
        />
        <Button type="submit" size="sm" className="h-8 px-3 font-mono text-xs gap-1">
          <Send className="size-3" />
          <span>{ai.askButton}</span>
        </Button>
      </form>

      {/* Conversation history */}
      {customAnswers.length > 0 && (
        <div className="space-y-2.5 pt-2 border-t border-border max-h-48 overflow-y-auto">
          {customAnswers.map((item, idx) => (
            <div key={idx} className="p-2.5 bg-muted/20 border border-border space-y-1">
              <div className="font-semibold text-primary flex items-center gap-1.5">
                <Bot className="size-3" />
                <span>{ai.consultationPrefix}{item.q}</span>
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
