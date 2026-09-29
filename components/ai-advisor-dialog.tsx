"use client"

import React, { useCallback, useState } from "react"
import { Sparkles, AlertCircle, Send, Bot } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { useAiAdvisor } from "@/hooks/use-ai-advisor"
import { UniversalDialog } from "@/components/universal-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  WeatherAlert,
  formatTemperature,
} from "@/lib/weather"
import {
  analyzeWeatherWithAi,
  AiWeatherAnalysis,
} from "@/lib/ai-weather-advisor"
import { useDisplayPreferences } from "@/components/display-preferences-provider"
import { useTranslation } from "@/components/language-provider"

interface AiAdvisorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  current: CurrentWeather
  hourly: HourlyForecastItem[]
  daily: DailyForecastItem[]
  alerts?: WeatherAlert[]
  unit: "C" | "F"
}

export function AiAdvisorDialog({
  open,
  onOpenChange,
  current,
  hourly,
  daily,
  alerts,
  unit,
}: AiAdvisorDialogProps) {
  const { t, translateCondition, language } = useTranslation()
  const ai = t.aiAdvisor
  const prefs = useDisplayPreferences()
  const [question, setQuestion] = useState("")

  /** Rule-based answer, used when the AI advisor is unavailable. */
  const fallbackAnswer = useCallback(
    (q: string) => {
      const lower = q.toLowerCase()
      let reply = ""

      if (lower.includes("umbrella") || lower.includes("rain")) {
        const willRain = hourly.slice(0, 12).some((h) => (h.pop ?? 0) > 0.35)
        const rainHour = hourly.slice(0, 12).find((h) => (h.pop ?? 0) > 0.35)
        reply = willRain
          ? ai.answerUmbrellaYes(
              rainHour?.time ? prefs.clock(rainHour.time) : t.common.today
            )
          : ai.answerUmbrellaNo
      } else if (
        lower.includes("wear") ||
        lower.includes("dress") ||
        lower.includes("clothing") ||
        lower.includes("jacket")
      ) {
        const temp = formatTemperature(current.temp, unit)
        if (current.temp < 12) {
          reply = ai.answerWearCold(String(temp), unit)
        } else if (current.temp > 25) {
          reply = ai.answerWearHot(String(temp), unit)
        } else {
          reply = ai.answerWearMild(String(temp), unit)
        }
      } else if (
        lower.includes("run") ||
        lower.includes("workout") ||
        lower.includes("exercise") ||
        lower.includes("sport") ||
        lower.includes("cycling")
      ) {
        const bestHour = hourly
          .slice(0, 12)
          .reduce((best, cur) => (cur.temp < best.temp ? cur : best), hourly[0])
        reply = ai.answerExercise(
          bestHour?.time ? prefs.clock(bestHour.time) : t.common.today,
          String(formatTemperature(bestHour?.temp || current.temp, unit)),
          unit
        )
      } else if (lower.includes("tomorrow")) {
        const tom = daily[1]
        if (tom) {
          reply = ai.answerTomorrow(
            current.cityName,
            translateCondition(tom.description),
            String(formatTemperature(tom.tempMax, unit)),
            String(formatTemperature(tom.tempMin, unit)),
            unit,
            Math.round(tom.pop * 100)
          )
        } else {
          reply = ai.answerTomorrowFallback
        }
      } else if (lower.includes("weekend")) {
        const weekend = daily.filter((d) => d.day === "SAT" || d.day === "SUN")
        if (weekend.length > 0) {
          reply = ai.answerWeekend(
            translateCondition(weekend[0].description),
            String(formatTemperature(weekend[0].tempMax, unit)),
            translateCondition(
              weekend[1]?.description || weekend[0].description
            ),
            String(
              formatTemperature(weekend[1]?.tempMax || weekend[0].tempMax, unit)
            ),
            unit
          )
        } else {
          reply = ai.answerWeekendFallback
        }
      } else {
        reply = ai.answerGeneral(
          current.cityName,
          prefs.pressureText(current.pressure),
          current.humidity,
          translateCondition(current.condition.description),
          String(
            formatTemperature(daily[0]?.tempMin || current.temp - 3, unit)
          ),
          String(
            formatTemperature(daily[0]?.tempMax || current.temp + 4, unit)
          ),
          unit
        )
      }

      return reply
    },
    [ai, current, daily, hourly, prefs, t, translateCondition, unit]
  )

  const { briefing, briefingStatus, answers, ask } = useAiAdvisor({
    enabled: open,
    current,
    hourly,
    daily,
    alerts,
    unit,
    language,
    fallbackAnswer,
  })

  // Gemini briefing when available; the local rule-based analysis otherwise.
  const ruleBased: AiWeatherAnalysis | null =
    briefingStatus === "ready"
      ? null
      : analyzeWeatherWithAi(current, hourly, daily, unit, t)
  const shortRangeAlerts = briefing ? briefing.alerts : ruleBased!.suddenAlerts
  const outlook = briefing ? briefing.outlook : ruleBased!.plannedShifts

  const answerQuery = (q: string) => {
    void ask(q)
    setQuestion("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim()) {
      answerQuery(question.trim())
    }
  }

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
      {/* Source of the analysis: live Gemini briefing or the local fallback */}
      <div
        role="status"
        aria-live="polite"
        className="flex items-start justify-between gap-2 text-mini"
      >
        {briefingStatus === "loading" ? (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Spinner className="size-3" />
            {ai.analyzing}
          </span>
        ) : briefingStatus === "fallback" ? (
          <span className="text-muted-foreground">{ai.fallbackNotice}</span>
        ) : (
          <span className="text-foreground">{briefing?.summary}</span>
        )}
        <Badge
          variant="outline"
          className={`shrink-0 font-mono text-nano uppercase ${briefingStatus === "ready" ? "border-primary/30 text-primary" : ""}`}
        >
          {briefingStatus === "ready" ? ai.liveBadge : ai.basicBadge}
        </Badge>
      </div>

      {/* Sudden Shifts Section */}
      <div className="space-y-2">
        <div className="font-mono text-tiny font-bold tracking-wider text-muted-foreground uppercase">
          {ai.shortRangeDisturbances}
        </div>
        {shortRangeAlerts.length > 0 ? (
          shortRangeAlerts.map((alert, idx) => (
            <div
              key={`${alert.title}-${idx}`}
              className="space-y-1 border border-destructive/30 bg-destructive/10 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold text-destructive">
                  <AlertCircle className="size-3.5" />
                  <span>{alert.title}</span>
                </span>
                <Badge variant="destructive" className="font-mono text-micro">
                  {alert.timing}
                </Badge>
              </div>
              <p className="text-foreground">{alert.detail}</p>
              <p className="text-mini text-muted-foreground">
                <span className="font-semibold text-foreground">
                  {ai.guidanceLabel}
                </span>{" "}
                {alert.action}
              </p>
            </div>
          ))
        ) : (
          <div className="border border-border bg-muted/20 p-3 text-muted-foreground">
            {ai.stabilityHigh}
          </div>
        )}
      </div>

      {/* Planned Shifts Section */}
      <div className="space-y-2">
        <div className="font-mono text-tiny font-bold tracking-wider text-muted-foreground uppercase">
          {ai.plannedShiftsTitle}
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {outlook.map((shift, idx) => (
            <div
              key={idx}
              className="space-y-1.5 border border-border bg-muted/20 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-foreground">
                  {shift.period}
                </span>
                <Badge
                  variant="outline"
                  className="border-primary/30 font-mono text-micro text-primary"
                >
                  {shift.temperatureShift}
                </Badge>
              </div>
              <p className="text-mini text-foreground">{shift.summary}</p>
              <div className="text-tiny text-muted-foreground">
                {ai.precipRiskLabel}{" "}
                <span className="text-foreground">
                  {shift.precipitationRisk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Questions Chips */}
      <div className="space-y-2 border-t border-border pt-2">
        <div className="font-mono text-tiny font-bold tracking-wider text-muted-foreground uppercase">
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
              className="h-6 font-mono text-mini"
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
          className="h-8 rounded-none font-mono text-xs"
        />
        <Button
          type="submit"
          size="sm"
          className="h-8 gap-1 px-3 font-mono text-xs"
        >
          <Send className="size-3" />
          <span>{ai.askButton}</span>
        </Button>
      </form>

      {/* Conversation history */}
      {answers.length > 0 && (
        <div
          aria-live="polite"
          className="max-h-64 space-y-2.5 overflow-y-auto border-t border-border pt-2"
        >
          {answers.map((item) => (
            <div
              key={item.id}
              className="space-y-1 border border-border bg-muted/20 p-2.5"
            >
              <div className="flex items-center gap-1.5 font-semibold text-primary">
                <Bot className="size-3 shrink-0" />
                <span>
                  {ai.consultationPrefix}
                  {item.question}
                </span>
                {item.status === "fallback" && (
                  <Badge
                    variant="outline"
                    className="ms-auto shrink-0 font-mono text-nano uppercase"
                  >
                    {ai.basicBadge}
                  </Badge>
                )}
              </div>
              <p className="border-s border-primary/30 ps-4 leading-relaxed whitespace-pre-line text-foreground">
                {item.answer}
                {item.status === "streaming" &&
                  (item.answer ? (
                    <span
                      aria-hidden
                      className="ms-0.5 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle"
                    />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Spinner className="size-3" />
                      {ai.analyzing}
                    </span>
                  ))}
              </p>
            </div>
          ))}
        </div>
      )}
    </UniversalDialog>
  )
}
