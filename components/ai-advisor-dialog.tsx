"use client"

import React, { useCallback, useEffect, useId, useRef, useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useOnlineStatus } from "@/hooks/use-online-status"
import {
  Sparkles,
  AlertCircle,
  Send,
  Bot,
  Reply,
  ThumbsUp,
  ThumbsDown,
  X,
  Check,
  Square,
  ChevronDown,
} from "lucide-react"
import { CopyButton } from "@/components/ui/copy-button"
import { Shimmer } from "@/components/ui/shimmer"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Spinner } from "@/components/ui/spinner"
import { useAiAdvisor, type AdvisorAnswer } from "@/hooks/use-ai-advisor"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { AiButtonPosition } from "@/components/settings/types"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item"
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
  useMessageScroller,
} from "@/components/ui/message-scroller"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
} from "@/components/ui/empty"
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
  /** Floating button corner; "hidden" keeps the panel reachable from the header. */
  buttonPosition?: AiButtonPosition
}

/**
 * Global AI advisor: a floating bot button (bottom corner of every view) that
 * opens a non-modal chat panel anchored to it. Clicking outside does not close
 * it, so the dashboard stays usable while chatting; Escape or ✕ closes it.
 */
export function AiAdvisorDialog({
  open,
  onOpenChange,
  current,
  hourly,
  daily,
  alerts,
  unit,
  buttonPosition = "bottom-right",
}: AiAdvisorDialogProps) {
  const { t, translateCondition, language } = useTranslation()
  const ai = t.aiAdvisor
  const prefs = useDisplayPreferences()
  const [question, setQuestion] = useState("")
  const [replyTo, setReplyTo] = useState<AdvisorAnswer | null>(null)
  const [briefingOpen, setBriefingOpen] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

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

  const online = useOnlineStatus()
  const { briefing, briefingStatus, answers, ask, react, stop, isAsking } =
    useAiAdvisor({
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
  // Quick questions already asked for this location are disabled.
  const askedQuestions = new Set(
    answers.map((a) => a.question.trim().toLowerCase())
  )
  const snippet = (text: string) =>
    text.length > 90 ? `${text.slice(0, 90)}…` : text

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (question.trim() && !isAsking && online) {
      answerQuery(question.trim())
    }
  }

  const reduceMotion = useReducedMotion()
  const isLeft = buttonPosition === "bottom-left"
  const panelId = useId()
  const titleId = useId()
  const briefingId = useId()
  const fabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Non-modal panel: Escape closes it (unless a modal dialog has focus), focus
  // moves into it on open and back to the floating button on close.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const fab = fabRef.current
    panel?.focus()
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return
      const target = e.target as Element | null
      if (target?.closest('[role="dialog"]') && !panel?.contains(target)) return
      onOpenChange(false)
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      if (panel?.contains(document.activeElement)) fab?.focus()
    }
  }, [open, onOpenChange])

  return (
    <>
      {buttonPosition !== "hidden" && (
        <WithTooltip label={t.header.aiAdvisor}>
          <Button
            ref={fabRef}
            size="icon"
            aria-label={t.header.aiAdvisor}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => onOpenChange(!open)}
            className={`fixed bottom-4 z-45 size-12 rounded-full shadow-lg ${FAB_MOTION} ${isLeft ? "left-4" : "right-4"}`}
          >
            {/* Bot and close icons swap with a spin as the panel opens */}
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={open ? "close" : "bot"}
                initial={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.5, rotate: -90 }
                }
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={
                  reduceMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.5, rotate: 90 }
                }
                transition={ICON_SPRING}
                className="flex"
              >
                {open ? <X className="size-6" /> : <Bot className="size-6" />}
              </motion.span>
            </AnimatePresence>
          </Button>
        </WithTooltip>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            key="ai-advisor-panel"
            ref={panelRef}
            id={panelId}
            role="dialog"
            aria-modal={false}
            aria-labelledby={titleId}
            tabIndex={-1}
            initial={reduceMotion ? { opacity: 0 } : PANEL_HIDDEN}
            animate={PANEL_SHOWN}
            exit={reduceMotion ? { opacity: 0 } : PANEL_HIDDEN}
            transition={reduceMotion ? { duration: 0.15 } : PANEL_SPRING}
            style={{ transformOrigin: isLeft ? "bottom left" : "bottom right" }}
            className={`fixed z-45 w-[min(28rem,calc(100vw-2rem))] overflow-hidden bg-popover font-mono text-popover-foreground shadow-2xl ring-1 ring-foreground/10 outline-none ${buttonPosition === "hidden" ? "bottom-4" : "bottom-20"} ${isLeft ? "left-4" : "right-4"}`}
          >
            {/* Card layout (per shadcn's chat example): the provider wraps the whole
                card so the composer can drive the scroller (jump to message). */}
            <MessageScrollerProvider autoScroll defaultScrollPosition="end">
              <Card className="h-[min(38rem,calc(100dvh-8rem))] gap-0 py-0 ring-0">
                <CardHeader className="gap-1 border-b border-border py-3">
                  <CardTitle
                    id={titleId}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Sparkles className="size-3.5 text-primary" />
                    {ai.dialogTitle}
                  </CardTitle>
                  <CardDescription className="line-clamp-1 text-xs">
                    {ai.dialogDesc(current.cityName)}
                  </CardDescription>
                  <CardAction>
                    <ActionButton
                      label={t.settingsDialog.assistant.close}
                      onClick={() => onOpenChange(false)}
                    >
                      <X />
                    </ActionButton>
                  </CardAction>
                </CardHeader>

                {/* Today's briefing: one summary row; details expand with a height animation */}
                <div className="shrink-0 border-b border-border px-(--card-spacing) py-2">
                  <Button
                    variant="ghost"
                    aria-expanded={briefingOpen}
                    aria-controls={briefingId}
                    onClick={() => setBriefingOpen((v) => !v)}
                    className="h-auto w-full items-start justify-start gap-2 px-1.5 py-1 text-start font-normal whitespace-normal"
                  >
                    <span className="min-w-0 flex-1 space-y-0.5">
                      <span className="block font-mono text-nano font-bold tracking-wider text-muted-foreground uppercase">
                        {ai.briefingLabel}
                      </span>
                      <span
                        role="status"
                        aria-live="polite"
                        className="line-clamp-2 block text-mini"
                      >
                        {briefingStatus === "loading" ? (
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <Spinner className="size-3" />
                            {ai.analyzing}
                          </span>
                        ) : briefingStatus === "fallback" ? (
                          <span className="text-muted-foreground">
                            {ai.fallbackNotice}
                          </span>
                        ) : (
                          briefing?.summary
                        )}
                      </span>
                    </span>
                    {shortRangeAlerts.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="shrink-0 gap-1 font-mono text-nano"
                      >
                        <AlertCircle className="size-3" />
                        {shortRangeAlerts.length}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className={`shrink-0 font-mono text-nano uppercase ${briefingStatus === "ready" ? "border-primary/30 text-primary" : ""}`}
                    >
                      {briefingStatus === "ready"
                        ? ai.liveBadge
                        : ai.basicBadge}
                    </Badge>
                    <ChevronDown
                      className={`mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none ${briefingOpen ? "rotate-180" : ""}`}
                    />
                  </Button>
                  <AnimatePresence initial={false}>
                    {briefingOpen && (
                      <motion.div
                        id={briefingId}
                        key="briefing-details"
                        initial={reduceMotion ? { opacity: 0 } : COLLAPSED}
                        animate={EXPANDED}
                        exit={reduceMotion ? { opacity: 0 } : COLLAPSED}
                        transition={
                          reduceMotion ? { duration: 0.15 } : HEIGHT_SPRING
                        }
                        style={{ transformOrigin: "top" }}
                        className="overflow-hidden"
                      >
                        <div className="max-h-56 space-y-3 overflow-y-auto pt-2">
                          {/* Next 12h: compact alerts, or one quiet line when stable */}
                          <section className="space-y-1.5">
                            <h3 className="font-mono text-nano font-bold tracking-wider text-muted-foreground uppercase">
                              {ai.shortRangeDisturbances}
                            </h3>
                            {shortRangeAlerts.length > 0 ? (
                              shortRangeAlerts.map((alert, idx) => (
                                <Alert
                                  key={`${alert.title}-${idx}`}
                                  variant="destructive"
                                  className="gap-y-0.5 px-2.5 py-2"
                                >
                                  <AlertCircle />
                                  <AlertTitle className="flex items-center justify-between gap-2 text-xs">
                                    <span className="truncate">
                                      {alert.title}
                                    </span>
                                    <Badge
                                      variant="destructive"
                                      className="shrink-0 font-mono text-nano"
                                    >
                                      {alert.timing}
                                    </Badge>
                                  </AlertTitle>
                                  <AlertDescription className="text-mini">
                                    <p className="line-clamp-2 text-foreground">
                                      {alert.detail}
                                    </p>
                                    <p className="line-clamp-2">
                                      <span className="font-semibold text-foreground">
                                        {ai.guidanceLabel}
                                      </span>{" "}
                                      {alert.action}
                                    </p>
                                  </AlertDescription>
                                </Alert>
                              ))
                            ) : (
                              <p className="text-mini text-muted-foreground">
                                {ai.stabilityHigh}
                              </p>
                            )}
                          </section>

                          {/* Tomorrow / weekend: two compact items side by side */}
                          <section className="space-y-1.5">
                            <h3 className="font-mono text-nano font-bold tracking-wider text-muted-foreground uppercase">
                              {ai.plannedShiftsTitle}
                            </h3>
                            <ItemGroup className="grid grid-cols-2 gap-1.5">
                              {outlook.map((shift, idx) => (
                                <Item
                                  key={idx}
                                  variant="outline"
                                  size="xs"
                                  className="items-start"
                                >
                                  <ItemContent className="min-w-0 gap-1">
                                    <ItemTitle className="flex w-full items-center justify-between gap-1.5">
                                      <span className="truncate">
                                        {shift.period}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="shrink-0 border-primary/30 font-mono text-nano text-primary"
                                      >
                                        {shift.temperatureShift}
                                      </Badge>
                                    </ItemTitle>
                                    <ItemDescription className="line-clamp-2 text-mini text-foreground">
                                      {shift.summary}
                                    </ItemDescription>
                                    <p className="truncate text-nano text-muted-foreground">
                                      {ai.precipRiskLabel}{" "}
                                      <span className="text-foreground">
                                        {shift.precipitationRisk}
                                      </span>
                                    </p>
                                  </ItemContent>
                                </Item>
                              ))}
                            </ItemGroup>
                          </section>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <CardContent
                  data-lenis-prevent
                  className="min-h-0 flex-1 overflow-hidden p-0"
                >
                  {answers.length === 0 ? (
                    <Empty className="h-full border-0">
                      <EmptyHeader>
                        <EmptyMedia variant="icon">
                          <Bot />
                        </EmptyMedia>
                        <EmptyDescription>{ai.greeting}</EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  ) : (
                    // Conversation: questions on the end side, AI answers with an
                    // avatar; actions appear on hover/focus (always on touch).
                    <MessageScroller>
                      <MessageScrollerViewport>
                        <MessageScrollerContent
                          aria-busy={answers.some(
                            (a) => a.status === "streaming"
                          )}
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
                                        <MessageHeader className="font-normal">
                                          <JumpToMessage
                                            messageId={`${repliedTo.id}-a`}
                                            className="h-auto max-w-full gap-1 px-1.5 py-0.5 font-normal text-muted-foreground"
                                          >
                                            <Reply className="size-3 shrink-0 -scale-x-100 rtl:scale-x-100" />
                                            <span className="truncate">
                                              {ai.replyingTo}:{" "}
                                              {snippet(repliedTo.answer)}
                                            </span>
                                          </JumpToMessage>
                                        </MessageHeader>
                                      )}
                                      <Bubble>
                                        <BubbleContent>
                                          {item.question}
                                        </BubbleContent>
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
                                    <MessageAvatar className="size-8 rounded-full bg-primary/10 text-primary">
                                      <Bot className="size-5" />
                                    </MessageAvatar>
                                    <MessageContent>
                                      {/* Before the first words arrive: typing status in a bubble */}
                                      {!item.answer &&
                                        item.status === "streaming" && (
                                          <Bubble variant="muted">
                                            <BubbleContent
                                              role="status"
                                              className="flex items-center gap-1.5 text-muted-foreground"
                                            >
                                              <TypingStatus label={ai.typing} />
                                            </BubbleContent>
                                          </Bubble>
                                        )}
                                      {item.answer && (
                                        <Bubble variant="muted">
                                          <BubbleContent className="leading-relaxed whitespace-pre-line">
                                            <StreamingText
                                              text={item.answer}
                                              streaming={
                                                item.status === "streaming"
                                              }
                                            />
                                          </BubbleContent>
                                          {item.reaction && (
                                            <BubbleReactions
                                              align="start"
                                              className="rounded-full"
                                            >
                                              <span
                                                role="img"
                                                aria-label={
                                                  item.reaction === "up"
                                                    ? ai.helpful
                                                    : ai.notHelpful
                                                }
                                                className="text-xs"
                                              >
                                                {item.reaction === "up"
                                                  ? "👍"
                                                  : "👎"}
                                              </span>
                                            </BubbleReactions>
                                          )}
                                        </Bubble>
                                      )}
                                      {item.answer &&
                                        item.status === "streaming" && (
                                          <MessageFooter
                                            role="status"
                                            className="gap-1.5 font-normal"
                                          >
                                            <TypingStatus label={ai.typing} />
                                          </MessageFooter>
                                        )}
                                      {item.status !== "streaming" && (
                                        <MessageFooter
                                          className={`gap-0.5 ${HOVER_ACTIONS}`}
                                        >
                                          <ActionButton
                                            label={ai.helpful}
                                            aria-pressed={
                                              item.reaction === "up"
                                            }
                                            onClick={() => react(item.id, "up")}
                                            className={
                                              item.reaction === "up"
                                                ? "text-primary"
                                                : ""
                                            }
                                          >
                                            <ThumbsUp />
                                          </ActionButton>
                                          <ActionButton
                                            label={ai.notHelpful}
                                            aria-pressed={
                                              item.reaction === "down"
                                            }
                                            onClick={() =>
                                              react(item.id, "down")
                                            }
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
                  )}
                </CardContent>

                <CardFooter className="shrink-0 flex-col gap-2 border-t border-border py-3">
                  {/* Quick questions: one scrollable row */}
                  <div className="flex w-full [scrollbar-width:none] gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                    {[
                      ai.quickQuestionUmbrella,
                      ai.quickQuestionWear,
                      ai.quickQuestionExercise,
                      ai.quickQuestionTomorrow,
                    ].map((q, idx) => {
                      const asked = askedQuestions.has(q.trim().toLowerCase())
                      return (
                        <Button
                          key={idx}
                          variant="accent"
                          size="xs"
                          disabled={asked || isAsking || !online}
                          onClick={() => answerQuery(q)}
                          className="rounded-full font-mono text-mini"
                        >
                          {asked && (
                            <Check className="text-primary" aria-hidden />
                          )}
                          {q}
                        </Button>
                      )
                    })}
                  </div>
                  {/* Reply target: click to jump to the original answer */}
                  {replyTo && (
                    <div className="flex w-full items-center gap-1 border-s-2 border-primary bg-muted/30 ps-1.5 text-mini">
                      <Reply className="size-3 shrink-0 -scale-x-100 text-primary rtl:scale-x-100" />
                      <JumpToMessage
                        messageId={`${replyTo.id}-a`}
                        className="h-auto min-w-0 flex-1 justify-start px-1 py-1 text-mini font-normal text-muted-foreground"
                      >
                        <span className="truncate">
                          <span className="font-semibold text-foreground">
                            {ai.replyingTo}:
                          </span>{" "}
                          {snippet(replyTo.answer)}
                        </span>
                      </JumpToMessage>
                      <ActionButton
                        label={ai.cancelReply}
                        onClick={() => setReplyTo(null)}
                      >
                        <X />
                      </ActionButton>
                    </div>
                  )}
                  <form onSubmit={handleSubmit} className="w-full">
                    {/* States: offline = disabled; asking = spinner + Stop; empty = Ask
                        disabled; counter near the limit. Enter sends, Shift+Enter = newline. */}
                    <InputGroup data-disabled={!online} aria-busy={isAsking}>
                      <InputGroupTextarea
                        ref={inputRef}
                        rows={2}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            !e.nativeEvent.isComposing
                          ) {
                            e.preventDefault()
                            e.currentTarget.form?.requestSubmit()
                          } else if (e.key === "Escape" && replyTo) {
                            e.preventDefault()
                            setReplyTo(null)
                          }
                        }}
                        disabled={!online}
                        placeholder={
                          online ? ai.chatPlaceholder : ai.offlinePlaceholder
                        }
                        aria-label={ai.chatPlaceholder}
                        maxLength={MAX_QUESTION_LENGTH}
                        className="max-h-32 min-h-14 font-mono text-xs"
                      />
                      <InputGroupAddon align="block-end" className="gap-2 pt-1">
                        {isAsking ? (
                          <Spinner className="text-primary" />
                        ) : (
                          <Sparkles className="text-primary" aria-hidden />
                        )}
                        {question.length > MAX_QUESTION_LENGTH * 0.8 && (
                          <span
                            aria-live="polite"
                            className={`font-mono text-nano tabular-nums ${question.length >= MAX_QUESTION_LENGTH ? "text-destructive" : ""}`}
                          >
                            {question.length}/{MAX_QUESTION_LENGTH}
                          </span>
                        )}
                        {isAsking ? (
                          <InputGroupButton
                            type="button"
                            variant="outline"
                            onClick={stop}
                            className="ms-auto font-mono"
                          >
                            <Square className="fill-current" />
                            <span>{ai.stop}</span>
                          </InputGroupButton>
                        ) : (
                          <InputGroupButton
                            type="submit"
                            variant="default"
                            disabled={!online || !question.trim()}
                            className="ms-auto font-mono"
                          >
                            <Send />
                            <span>{ai.askButton}</span>
                          </InputGroupButton>
                        )}
                      </InputGroupAddon>
                    </InputGroup>
                  </form>
                </CardFooter>
              </Card>
            </MessageScrollerProvider>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Panel grows out of the button's corner: spring on scale/opacity with a
// slight rise and blur. Reduced motion falls back to a short fade.
const PANEL_HIDDEN = {
  opacity: 0,
  scale: 0.9,
  y: 16,
  height: 0,
  filter: "blur(4px)",
}
const PANEL_SHOWN = {
  opacity: 1,
  scale: 1,
  y: 0,
  height: "auto",
  filter: "blur(0px)",
}
// Briefing details: height 0 -> auto with scale/opacity.
const COLLAPSED = { height: 0, opacity: 0, scale: 0.97 }
const EXPANDED = { height: "auto", opacity: 1, scale: 1 }
const HEIGHT_SPRING = { type: "spring", stiffness: 420, damping: 36 } as const
const PANEL_SPRING = {
  type: "spring",
  stiffness: 380,
  damping: 30,
  mass: 0.8,
} as const
const ICON_SPRING = { type: "spring", stiffness: 500, damping: 28 } as const

/** Floating button: pops in on mount, lifts on hover, presses on click. */
const FAB_MOTION =
  "animate-in fade-in-0 zoom-in-75 duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transition-transform hover:scale-105 active:scale-95 motion-reduce:animate-none motion-reduce:transition-none"

/** Matches the server's limit in /api/advisor. */
const MAX_QUESTION_LENGTH = 500

/** Hover/focus reveal for message actions; always visible without a hover-capable pointer. */
const HOVER_ACTIONS =
  "opacity-0 transition-opacity group-hover/message:opacity-100 group-focus-within/message:opacity-100 [@media(hover:none)]:opacity-100"

/**
 * Smooth-scrolls the chat to a message and briefly highlights its bubble.
 * Must render inside MessageScrollerProvider.
 */
function JumpToMessage({
  messageId,
  className,
  children,
}: {
  messageId: string
  className?: string
  children: React.ReactNode
}) {
  const { scrollToMessage } = useMessageScroller()
  const reduceMotion = useReducedMotion()
  return (
    <Button
      variant="ghost"
      size="xs"
      className={className}
      onClick={() => {
        scrollToMessage(messageId, {
          align: "center",
          behavior: reduceMotion ? "auto" : "smooth",
        })
        const bubble = document.querySelector<HTMLElement>(
          `[data-message-id="${CSS.escape(messageId)}"] [data-slot="bubble-content"]`
        )
        if (!bubble) return
        bubble.classList.add(...JUMP_HIGHLIGHT)
        setTimeout(() => bubble.classList.remove(...JUMP_HIGHLIGHT), 1600)
      }}
    >
      {children}
    </Button>
  )
}

const JUMP_HIGHLIGHT = ["ring-2", "ring-primary"]

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

/** "AI is typing" + animated dots; the label's own trailing ellipsis is dropped. */
function TypingStatus({ label }: { label: string }) {
  return (
    <>
      <Shimmer>{label.replace(/[.…]+$/, "")}</Shimmer>
      <TypingDots />
    </>
  )
}

/** Three bouncing dots (pulse with reduced motion) for the typing status. */
function TypingDots({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-flex items-center gap-1 ${className}`}>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground motion-reduce:animate-pulse"
        />
      ))}
    </span>
  )
}

/**
 * Reveals streamed text progressively. Gemini sends whole sentences at a time,
 * so this types them out, catching up faster the further behind it is.
 */
export function StreamingText({
  text,
  streaming,
}: {
  text: string
  streaming: boolean
}) {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  // Answers already complete when mounted (e.g. dialog reopened) show at once.
  const [shown, setShown] = useState(() => (streaming ? 0 : text.length))

  useEffect(() => {
    if (reduceMotion || shown >= text.length) return
    const frame = requestAnimationFrame(() =>
      setShown((n) =>
        Math.min(
          text.length,
          n + Math.max(1, Math.ceil((text.length - n) / 12))
        )
      )
    )
    return () => cancelAnimationFrame(frame)
  }, [shown, text.length, reduceMotion])

  return <>{reduceMotion ? text : text.slice(0, shown)}</>
}
