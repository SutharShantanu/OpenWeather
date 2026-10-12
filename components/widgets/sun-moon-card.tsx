"use client"

import React, { useMemo, useState } from "react"
import NumberFlow from "@number-flow/react"
import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  Moon,
  Sun,
  Sunrise,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"
import { PhaseCard } from "@/components/widgets/phase-card"
import { MoonDisc } from "@/components/widgets/moon-disc"
import { MoonCalendar, type YMD } from "@/components/widgets/moon-calendar"
import { getSunMoon, localNoon } from "@/lib/astronomy"
import type { CurrentWeather } from "@/lib/weather"

const NO_TIME = "--:--"

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-xs">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-mono font-semibold text-foreground tabular-nums">
        {value}
      </dd>
    </div>
  )
}

/** Day arc with the sun's current position, shown while the sun is up. */
function SunArc({ progress }: { progress: number | null }) {
  const t = progress === null ? null : Math.max(0, Math.min(1, progress))
  const x =
    t === null
      ? 0
      : (1 - t) * (1 - t) * 15 + 2 * (1 - t) * t * 100 + t * t * 185
  const y =
    t === null ? 0 : (1 - t) * (1 - t) * 75 + 2 * (1 - t) * t * 15 + t * t * 75
  return (
    <svg
      viewBox="0 0 200 85"
      className="h-16 w-full overflow-visible"
      aria-hidden
    >
      <line
        x1="10"
        y1="75"
        x2="190"
        y2="75"
        stroke="currentColor"
        strokeOpacity={0.2}
        strokeDasharray="2 2"
      />
      <path
        d="M 15 75 Q 100 15 185 75"
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.3}
        strokeWidth="1.5"
      />
      {t !== null && <circle cx={x} cy={y} r="5" className="fill-warning" />}
    </svg>
  )
}

interface SunMoonCardProps {
  current: CurrentWeather
  /** Cards for the left column, beside the sun and moon cards. */
  children?: React.ReactNode
}

/** Sun, light phases, moon and upcoming moon events for the station, structured into standard widget cards. */
export function SunMoonCard({ current, children }: SunMoonCardProps) {
  const { t } = useTranslation()
  const s = t.widgets.solar
  const prefs = useDisplayPreferences()

  const offsetSec =
    current.utcOffsetSeconds ?? -new Date().getTimezoneOffset() * 60
  const now = current.dt * 1000
  const southern = current.lat < 0

  // The station's calendar day today; `null` selection means "follow today".
  const todayLocal = new Date(now + offsetSec * 1000)
  const today: YMD = {
    year: todayLocal.getUTCFullYear(),
    month: todayLocal.getUTCMonth(),
    day: todayLocal.getUTCDate(),
  }
  // Side panel inside the Moon card: closed, calendar (no pick yet) or the picked day's data.
  const [panelOpen, setPanelOpen] = useState(false)
  const [picked, setPicked] = useState<YMD | null>(null)
  const [view, setView] = useState<{ year: number; month: number }>({
    year: today.year,
    month: today.month,
  })
  const closePanel = () => {
    setPanelOpen(false)
    setPicked(null)
  }

  const data = useMemo(
    () => getSunMoon(new Date(now), current.lat, current.lon, offsetSec / 60),
    [now, current.lat, current.lon, offsetSec]
  )
  const pickedData = useMemo(
    () =>
      picked
        ? getSunMoon(
            localNoon(picked.year, picked.month, picked.day, offsetSec / 60),
            current.lat,
            current.lon,
            offsetSec / 60
          )
        : null,
    [picked, current.lat, current.lon, offsetSec]
  )

  /** A Date whose local fields read as the station's wall clock, for the shared formatters. */
  const wall = (d: Date) => {
    const x = new Date(d.getTime() + offsetSec * 1000)
    return new Date(
      x.getUTCFullYear(),
      x.getUTCMonth(),
      x.getUTCDate(),
      x.getUTCHours(),
      x.getUTCMinutes()
    )
  }
  const time = (d: Date | null) => (d ? prefs.time(wall(d)) : NO_TIME)

  const { sun, light, moon, next } = data
  const dayUp =
    sun.state === "polarDay" ||
    (sun.sunrise && sun.sunset
      ? now >= sun.sunrise.getTime() && now <= sun.sunset.getTime()
      : false)
  const progress =
    sun.sunrise && sun.sunset && dayUp
      ? (now - sun.sunrise.getTime()) /
        (sun.sunset.getTime() - sun.sunrise.getTime())
      : null

  const hm = (sec: number) =>
    `${Math.floor(sec / 3600)}h ${Math.floor((sec % 3600) / 60)}m`
  const ms = (sec: number) =>
    `${Math.floor(sec / 60)}m ${Math.round(sec % 60)}s`
  const delta = sun.dayLengthDeltaSec
  const dayLengthSec = sun.dayLengthSec

  /** Sun, light and moon figures for the day picked in the side panel, grouped by category. */
  const renderPicked = (d: NonNullable<typeof pickedData>) => {
    const group = (label: string, body: React.ReactNode) => (
      <section className="space-y-2 border border-border bg-muted/20 p-3">
        <h4 className="font-mono text-micro tracking-wide text-muted-foreground uppercase">
          {label}
        </h4>
        {body}
      </section>
    )
    const pl = d.light
    const pickedLight: [string, Date | null, Date | null][] = [
      [s.astronomical, pl.astronomicalDawn, pl.astronomicalDusk],
      [s.nautical, pl.nauticalDawn, pl.nauticalDusk],
      [s.civil, pl.dawn, pl.dusk],
      [s.goldenHour, pl.goldenMorningEnd, pl.goldenEveningStart],
    ]
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <MoonDisc phase={d.moon.phase} flip={southern} />
          <div>
            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-3xl font-bold text-foreground">
                <NumberFlow value={Math.round(d.moon.illumination)} />
              </span>
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <span className="font-mono text-xs font-semibold text-primary">
              {s.phases[d.moon.phaseKey]}
            </span>
            <p className="font-mono text-xs text-muted-foreground">
              {s.moonAge(d.moon.ageDays.toFixed(1))}
            </p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {group(
            s.groupSun,
            <dl className="space-y-1.5">
              <Row label={s.sunrise} value={time(d.sun.sunrise)} />
              <Row label={s.solarNoon} value={time(d.sun.solarNoon)} />
              <Row label={s.sunset} value={time(d.sun.sunset)} />
              {d.sun.dayLengthSec !== null && (
                <Row label={s.dayLength} value={hm(d.sun.dayLengthSec)} />
              )}
            </dl>
          )}
          {group(
            s.groupMoon,
            <dl className="space-y-1.5">
              <Row
                label={s.moonrise}
                value={
                  d.moon.state === "alwaysDown"
                    ? s.moonAlwaysDown
                    : time(d.moon.rise)
                }
              />
              <Row
                label={s.moonset}
                value={
                  d.moon.state === "alwaysUp"
                    ? s.moonAlwaysUp
                    : time(d.moon.set)
                }
              />
            </dl>
          )}
        </div>
        {group(
          s.groupLight,
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1.5 text-xs">
            <span />
            <span className="text-end font-mono text-micro text-muted-foreground uppercase">
              {s.morning}
            </span>
            <span className="text-end font-mono text-micro text-muted-foreground uppercase">
              {s.evening}
            </span>
            {pickedLight.map(([label, am, pm]) => (
              <React.Fragment key={label}>
                <span className="text-muted-foreground">{label}</span>
                <span className="text-end font-mono font-semibold tabular-nums">
                  {time(am)}
                </span>
                <span className="text-end font-mono font-semibold tabular-nums">
                  {time(pm)}
                </span>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    )
  }

  const lightRows: [string, Date | null, Date | null][] = [
    [s.astronomical, light.astronomicalDawn, light.astronomicalDusk],
    [s.nautical, light.nauticalDawn, light.nauticalDusk],
    [s.civil, light.dawn, light.dusk],
    [s.goldenHour, light.goldenMorningEnd, light.goldenEveningStart],
  ]

  return (
    // Two stacks; opening the calendar widens the sun/moon stack in place to 2/3
    <div
      className={cn(
        "grid items-start gap-4 transition-[grid-template-columns] duration-300 ease-out motion-reduce:transition-none",
        panelOpen ? "md:grid-cols-[34fr_66fr]" : "md:grid-cols-[50fr_50fr]"
      )}
    >
      <div className="flex min-w-0 flex-col gap-4">{children}</div>
      <div className="flex min-w-0 flex-col gap-4">
        <PhaseCard
          icon={Sun}
          title={s.groupSun}
          subtitle={s.subtitle}
          iconClassName="text-amber-700 dark:text-amber-500"
          badge={
            <Badge
              variant="outline"
              className={cn(
                "font-mono text-tiny",
                dayUp
                  ? "text-amber-700 dark:text-amber-500"
                  : "text-muted-foreground"
              )}
            >
              {sun.state === "polarDay"
                ? s.sunNeverSets
                : sun.state === "polarNight"
                  ? s.sunNeverRises
                  : dayUp
                    ? s.sunAboveHorizon
                    : s.nightCycle}
            </Badge>
          }
        >
          {sun.state === "normal" && <SunArc progress={progress} />}
          <dl className="space-y-1.5">
            <Row label={s.sunrise} value={time(sun.sunrise)} />
            <Row label={s.solarNoon} value={time(sun.solarNoon)} />
            <Row label={s.sunset} value={time(sun.sunset)} />
            {dayLengthSec !== null && (
              <Row label={s.dayLength} value={hm(dayLengthSec)} />
            )}
          </dl>
          {delta !== null && Math.abs(delta) >= 1 && (
            <div className="flex items-center justify-between border border-border bg-muted/20 p-2.5 font-mono text-xs">
              <span className="text-muted-foreground">{s.dayLength}</span>
              <span className="font-bold text-foreground">
                {delta > 0
                  ? s.daylightLonger(ms(delta))
                  : s.daylightShorter(ms(-delta))}
              </span>
            </div>
          )}
        </PhaseCard>

        <PhaseCard
          icon={Moon}
          title={s.groupMoon}
          subtitle={s.lunarPhase}
          iconClassName="text-indigo-700 dark:text-indigo-400"
          className={cn(panelOpen && "md:w-2/3 md:[column-span:all]")}
          panelOpen={panelOpen}
          panel={
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {picked && (
                    <Button
                      variant="outline"
                      size="icon-xs"
                      aria-label={s.groupCalendar}
                      onClick={() => setPicked(null)}
                    >
                      <ChevronLeft />
                    </Button>
                  )}
                  <span className="truncate font-mono text-xs font-semibold">
                    {picked
                      ? prefs.date(
                          new Date(picked.year, picked.month, picked.day)
                        )
                      : s.groupCalendar}
                  </span>
                </div>
                <Button
                  hidden
                  variant="destructive"
                  size="icon-xs"
                  aria-label={s.backToToday}
                  onClick={closePanel}
                >
                  <X />
                </Button>
              </div>
              {pickedData ? (
                renderPicked(pickedData)
              ) : (
                <MoonCalendar
                  view={view}
                  onViewChange={setView}
                  today={today}
                  selected={picked ?? today}
                  onSelect={setPicked}
                  utcOffsetMin={offsetSec / 60}
                  southern={southern}
                />
              )}
            </div>
          }
          badge={
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="font-mono text-tiny text-indigo-700 dark:text-indigo-400"
              >
                {s.phases[moon.phaseKey]}
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={panelOpen ? "destructive" : "outline"}
                    size="icon-xs"
                    aria-label={panelOpen ? s.backToToday : s.groupCalendar}
                    aria-expanded={panelOpen}
                    onClick={panelOpen ? closePanel : () => setPanelOpen(true)}
                  >
                    {panelOpen ? <X /> : <CalendarDays />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {panelOpen ? s.backToToday : s.groupCalendar}
                </TooltipContent>
              </Tooltip>
            </div>
          }
        >
          <div className="flex items-baseline justify-between">
            <div className="flex items-center gap-3">
              <MoonDisc phase={moon.phase} flip={southern} />
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold text-foreground">
                    <NumberFlow value={Math.round(moon.illumination)} />
                  </span>
                  <span className="font-mono text-sm text-muted-foreground">
                    %
                  </span>
                </div>
                <span className="font-mono text-xs font-semibold text-primary">
                  {s.phases[moon.phaseKey]}
                </span>
              </div>
            </div>
            <div className="text-end font-mono text-xs text-muted-foreground">
              <span>{s.moonAge(moon.ageDays.toFixed(1))}</span>
            </div>
          </div>

          {/* Progress bar matching humidity widget */}
          <div className="relative h-1.5 w-full overflow-hidden bg-muted">
            <div
              className="h-full bg-indigo-500 transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, moon.illumination))}%`,
              }}
            />
          </div>

          <dl className="space-y-1.5">
            <Row
              label={s.moonrise}
              value={
                moon.state === "alwaysDown" ? s.moonAlwaysDown : time(moon.rise)
              }
            />
            <Row
              label={s.moonset}
              value={
                moon.state === "alwaysUp" ? s.moonAlwaysUp : time(moon.set)
              }
            />
          </dl>
        </PhaseCard>

        <PhaseCard
          icon={Sunrise}
          title={s.groupLight}
          subtitle={`${s.astronomical}, ${s.nautical}, ${s.civil}`}
          iconClassName="text-amber-700 dark:text-amber-500"
          badge={
            <Badge
              variant="outline"
              className="font-mono text-tiny text-muted-foreground"
            >
              {s.morning} / {s.evening}
            </Badge>
          }
        >
          <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-1.5 text-xs">
            <span />
            <span className="text-end font-mono text-micro text-muted-foreground uppercase">
              {s.morning}
            </span>
            <span className="text-end font-mono text-micro text-muted-foreground uppercase">
              {s.evening}
            </span>
            {lightRows.map(([label, morning, evening]) => (
              <React.Fragment key={label}>
                <span className="text-muted-foreground">{label}</span>
                <span className="text-end font-mono font-semibold tabular-nums">
                  {time(morning)}
                </span>
                <span className="text-end font-mono font-semibold tabular-nums">
                  {time(evening)}
                </span>
              </React.Fragment>
            ))}
          </div>
        </PhaseCard>

        <PhaseCard
          icon={CalendarClock}
          title={s.groupNext}
          subtitle={`${s.nextNewMoon} & ${s.nextFullMoon}`}
          iconClassName="text-teal-700 dark:text-teal-500"
          badge={
            <Badge
              variant="outline"
              className="font-mono text-tiny text-teal-700 dark:text-teal-500"
            >
              {s.lunarPhase}
            </Badge>
          }
        >
          <div className="space-y-2 font-mono text-xs">
            <div className="flex items-center gap-3 border border-border bg-muted/20 p-2.5">
              <MoonDisc phase={0} flip={southern} className="size-9" />
              <span className="flex-1 text-muted-foreground">
                {s.nextNewMoon}
              </span>
              <span className="font-bold text-foreground tabular-nums">
                {prefs.date(wall(next.newMoon))}
              </span>
            </div>
            <div className="flex items-center gap-3 border border-border bg-muted/20 p-2.5">
              <MoonDisc phase={0.5} flip={southern} className="size-9" />
              <span className="flex-1 text-muted-foreground">
                {s.nextFullMoon}
              </span>
              <span className="font-bold text-foreground tabular-nums">
                {prefs.date(wall(next.fullMoon))}
              </span>
            </div>
          </div>
        </PhaseCard>
      </div>
    </div>
  )
}
