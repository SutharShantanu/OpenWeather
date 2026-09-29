"use client"

import React, { useCallback, useRef, useState } from "react"
import {
  Sparkles,
  AlertCircle,
  Send,
  Bot,
  Reply,
  ThumbsUp,
  ThumbsDown,
  X,
} from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"
import { useAiAdvisor, type AdvisorAnswer } from "@/hooks/use-ai-advisor"
import { UniversalDialog } from "@/components/universal-dialog"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { IconTile } from "@/components/ui/icon-tile"
import { Bubble, BubbleContent, BubbleReactions } from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
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
  const [replyTo, setReplyTo] = useState<AdvisorAnswer | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

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

  const { briefing, briefingStatus, answers, ask, react } = useAiAdvisor({
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
    void ask(q, replyTo?.id)
    setQuestion("")
    setReplyTo(null)
  }

  const startReply = (item: AdvisorAnswer) => {
    setReplyTo(item)
    inputRef.current?.focus()
  }

  const byId = new Map(answers.map((a) => [a.id, a]))
  const snippet = (text: string) =>
    text.length > 90 ? `${text.slice(0, 90)}…` : text

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

      {/* Conversation: questions on the end side, AI answers with an avatar.
          Actions appear on hover/focus (always on touch screens). */}
      {answers.length > 0 && (
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <MessageScroller className="h-80 border border-border bg-muted/10">
            <MessageScrollerViewport>
              <MessageScrollerContent
                aria-busy={answers.some((a) => a.status === "streaming")}
                className="gap-3 p-3"
              >
                {[...answers].reverse().map((item) => {
                  const repliedTo = item.replyToId
                    ? byId.get(item.replyToId)
                    : undefined
                  return (
                    <React.Fragment key={item.id}>
                      <MessageScrollerItem
                        messageId={`${item.id}-q`}
                        scrollAnchor
                      >
                        <Message align="end">
                          <MessageContent>
                            {repliedTo && (
                              <MessageHeader className="gap-1 font-normal">
                                <Reply className="size-3 shrink-0 -scale-x-100 rtl:scale-x-100" />
                                <span className="truncate">
                                  {ai.replyingTo}: {snippet(repliedTo.answer)}
                                </span>
                              </MessageHeader>
                            )}
                            <Bubble>
                              <BubbleContent>{item.question}</BubbleContent>
                            </Bubble>
                            <MessageFooter className={HOVER_ACTIONS}>
                              <WithTooltip label={ai.copy}>
                                <CopyButton
                                  value={item.question}
                                  variant="ghost"
                                  size="icon-xs"
                                  title=""
                                  aria-label={ai.copy}
                                  copyLabel={ai.copy}
                                  copiedLabel={ai.copied}
                                />
                              </WithTooltip>
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>

                      <MessageScrollerItem messageId={`${item.id}-a`}>
                        <Message>
                          <MessageAvatar>
                            <IconTile variant="soft" size="xs">
                              <Bot />
                            </IconTile>
                          </MessageAvatar>
                          <MessageContent>
                            {item.status === "streaming" && !item.answer ? (
                              <TypingIndicator label={ai.typing} />
                            ) : (
                              <Bubble variant="muted">
                                <BubbleContent className="leading-relaxed whitespace-pre-line">
                                  {item.answer}
                                  {item.status === "streaming" && (
                                    <span
                                      aria-hidden
                                      className="ms-0.5 inline-block h-3 w-1.5 animate-pulse bg-primary align-middle"
                                    />
                                  )}
                                </BubbleContent>
                                {item.reaction && (
                                  <BubbleReactions align="start" className="rounded-full">
                                    <span
                                      role="img"
                                      aria-label={
                                        item.reaction === "up"
                                          ? ai.helpful
                                          : ai.notHelpful
                                      }
                                      className="text-xs"
                                    >
                                      {item.reaction === "up" ? "👍" : "👎"}
                                    </span>
                                  </BubbleReactions>
                                )}
                              </Bubble>
                            )}
                            {item.status !== "streaming" && (
                              <MessageFooter
                                className={`gap-0.5 ${HOVER_ACTIONS}`}
                              >
                                <ActionButton
                                  label={ai.helpful}
                                  aria-pressed={item.reaction === "up"}
                                  onClick={() => react(item.id, "up")}
                                  className={
                                    item.reaction === "up" ? "text-primary" : ""
                                  }
                                >
                                  <ThumbsUp />
                                </ActionButton>
                                <ActionButton
                                  label={ai.notHelpful}
                                  aria-pressed={item.reaction === "down"}
                                  onClick={() => react(item.id, "down")}
                                  className={
                                    item.reaction === "down"
                                      ? "text-destructive"
                                      : ""
                                  }
                                >
                                  <ThumbsDown />
                                </ActionButton>
                                <WithTooltip label={ai.copy}>
                                  <CopyButton
                                    value={item.answer}
                                    variant="ghost"
                                    size="icon-xs"
                                    title=""
                                    aria-label={ai.copy}
                                    copyLabel={ai.copy}
                                    copiedLabel={ai.copied}
                                  />
                                </WithTooltip>
                                {item.status === "done" && (
                                  <ActionButton
                                    label={ai.reply}
                                    onClick={() => startReply(item)}
                                  >
                                    <Reply />
                                  </ActionButton>
                                )}
                                {item.status === "fallback" && (
                                  <Badge
                                    variant="outline"
                                    className="ms-1 font-mono text-nano uppercase"
                                  >
                                    {ai.basicBadge}
                                  </Badge>
                                )}
                              </MessageFooter>
                            )}
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    </React.Fragment>
                  )
                })}
              </MessageScrollerContent>
            </MessageScrollerViewport>
            <MessageScrollerButton />
          </MessageScroller>
        </MessageScrollerProvider>
      )}

      {/* Reply target shown above the composer */}
      {replyTo && (
        <div className="flex items-center gap-2 border-s-2 border-primary bg-muted/30 px-2.5 py-1.5 text-mini">
          <Reply className="size-3 shrink-0 -scale-x-100 text-primary rtl:scale-x-100" />
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            <span className="font-semibold text-foreground">
              {ai.replyingTo}:
            </span>{" "}
            {snippet(replyTo.answer)}
          </span>
          <ActionButton label={ai.cancelReply} onClick={() => setReplyTo(null)}>
            <X />
          </ActionButton>
        </div>
      )}

      <form onSubmit={handleSubmit} className="pt-1">
        <InputGroup>
          <InputGroupAddon>
            <Sparkles className="text-primary" aria-hidden />
          </InputGroupAddon>
          <InputGroupInput
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={ai.chatPlaceholder}
            aria-label={ai.chatPlaceholder}
            maxLength={500}
            className="font-mono text-xs"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="submit"
              variant="default"
              disabled={!question.trim()}
              className="font-mono"
            >
              <Send />
              <span>{ai.askButton}</span>
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>
    </UniversalDialog>
  )
}

/** Hover/focus reveal for message actions; always visible without a hover-capable pointer. */
const HOVER_ACTIONS =
  "opacity-0 transition-opacity group-hover/message:opacity-100 group-focus-within/message:opacity-100 [@media(hover:none)]:opacity-100"

/** Wraps a control with a tooltip showing `label`. */
function WithTooltip({
  label,
  children,
}: {
  label: string
  children: React.ReactElement
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

/** Ghost icon button for message actions; `label` is its tooltip and accessible name. */
function ActionButton({
  label,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { label: string }) {
  return (
    <WithTooltip label={label}>
      <Button variant="ghost" size="icon-xs" aria-label={label} {...props}>
        {children}
      </Button>
    </WithTooltip>
  )
}

/** Three pulsing dots shown until the first words of an answer arrive. */
function TypingIndicator({ label }: { label: string }) {
  return (
    <Bubble variant="muted">
      <BubbleContent
        role="status"
        aria-label={label}
        className="flex h-7 items-center gap-1"
      >
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            aria-hidden
            style={{ animationDelay: `${delay}ms` }}
            className="size-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-pulse"
          />
        ))}
      </BubbleContent>
    </Bubble>
  )
}
