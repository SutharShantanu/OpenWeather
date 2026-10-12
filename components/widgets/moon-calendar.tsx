"use client"

import React, { useMemo, useState } from "react"
import type {
  CaptionLabelProps,
  DayButton,
  MonthGridProps,
} from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CalendarDayButton } from "@/components/ui/calendar"
import { MoonDisc } from "@/components/widgets/moon-disc"
import {
  CaptionLabel,
  YearMonthGrid,
} from "@/components/widgets/calendar-year-picker"
import { useTranslation } from "@/components/language-provider"
import { useDisplayPreferences } from "@/components/display-preferences-provider"
import { getMoonMonth, getMoonDayForDate } from "@/lib/astronomy"
import { cn } from "@/lib/utils"

export interface YMD {
  year: number
  /** 0-based month. */
  month: number
  day: number
}

/** Years either side of today the calendar can reach. */
const MAX_YEARS = 100

interface MoonCalendarProps {
  /** Month on show; independent of the selected day. */
  view: { year: number; month: number }
  onViewChange: (view: { year: number; month: number }) => void
  today: YMD
  selected: YMD
  onSelect: (day: YMD) => void
  utcOffsetMin: number
  /** Southern latitudes see the moon mirrored. */
  southern: boolean
}

function makeIntl(
  language: string,
  options: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
  try {
    return new Intl.DateTimeFormat(language, options)
  } catch {
    return new Intl.DateTimeFormat("en", options)
  }
}

const toYMD = (d: Date): YMD => ({
  year: d.getFullYear(),
  month: d.getMonth(),
  day: d.getDate(),
})

/** Month calendar with the moon's phase on every day; the caption opens a year and month picker. */
export function MoonCalendar({
  view,
  onViewChange,
  today,
  selected,
  onSelect,
  utcOffsetMin,
  southern,
}: MoonCalendarProps) {
  const { t } = useTranslation()
  const s = t.widgets.solar
  const prefs = useDisplayPreferences()

  const [isYearView, setIsYearView] = useState(false)
  const [pickerYear, setPickerYear] = useState<number | null>(null)

  const month = useMemo(
    () => getMoonMonth(view.year, view.month, utcOffsetMin),
    [view.year, view.month, utcOffsetMin]
  )

  const captionFmt = makeIntl(prefs.language, {
    month: "long",
    year: "numeric",
  })
  const monthShortFmt = makeIntl(prefs.language, { month: "short" })
  const weekdayFmt = makeIntl(prefs.language, { weekday: "short" })
  const dayFmt = makeIntl(prefs.language, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  const dayLabel = (date: Date) => {
    const isCurrent =
      date.getMonth() === view.month && date.getFullYear() === view.year
    const entry = isCurrent
      ? month.days[date.getDate() - 1]
      : getMoonDayForDate(date, utcOffsetMin)
    if (!entry) return dayFmt.format(date)
    return `${dayFmt.format(date)}, ${s.phases[entry.principal ?? entry.phaseKey]}, ${s.illumination(entry.illumination)}`
  }

  const startYear = today.year - MAX_YEARS
  const endYear = today.year + MAX_YEARS
  const closePicker = () => {
    setIsYearView(false)
    setPickerYear(null)
  }

  // Stable identity: an inline component would remount every day on each render.
  const components = useMemo(
    () => ({
      CaptionLabel: (props: CaptionLabelProps) => {
        const isTodaySelected =
          selected.year === today.year &&
          selected.month === today.month &&
          selected.day === today.day

        const handleJumpToToday = () => {
          closePicker()
          onViewChange({ year: today.year, month: today.month })
          onSelect(today)
        }

        return (
          <div className="flex flex-wrap items-center gap-2">
            <CaptionLabel
              isYearView={isYearView}
              onToggle={() => {
                setIsYearView((open) => !open)
                setPickerYear(null)
              }}
            >
              {props.children}
            </CaptionLabel>
            <Badge
              role="button"
              tabIndex={0}
              variant={isTodaySelected ? "default" : "outline"}
              size="xl"
              onClick={handleJumpToToday}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleJumpToToday()
                }
              }}
              className={cn(
                "h-7.5 cursor-pointer font-mono text-xs transition-colors select-none"
              )}
            >
              {s.today}
            </Badge>
            {!isTodaySelected && (
              <Badge
                variant="primary-light"
                size="default"
                className="h-7.5 font-mono text-tiny text-xs select-none"
              >
                {prefs.date(
                  new Date(selected.year, selected.month, selected.day)
                )}
              </Badge>
            )}
          </div>
        )
      },
      Nav: ({
        className,
        children,
        id,
        style,
        ...navProps
      }: React.ComponentProps<"nav">) => (
        <nav
          id={id}
          style={style}
          aria-label={navProps["aria-label"] ?? "Navigation bar"}
          className={cn(
            "pointer-events-none absolute top-0 right-0 z-10 flex items-center gap-1.5 [&>button]:pointer-events-auto",
            isYearView && "hidden",
            className
          )}
        >
          {children}
        </nav>
      ),
      MonthGrid: (props: MonthGridProps) => (
        <YearMonthGrid
          className={props.className}
          isYearView={isYearView}
          startYear={startYear}
          endYear={endYear}
          currentYear={view.year}
          currentMonth={view.month}
          selectedYear={pickerYear}
          onSelectYear={setPickerYear}
          onMonthSelect={(year, m) => {
            onViewChange({ year, month: m })
            closePicker()
          }}
          monthLabel={(m) => monthShortFmt.format(new Date(2024, m, 1))}
        >
          {props.children}
        </YearMonthGrid>
      ),
      DayButton: ({
        day,
        modifiers,
        ...props
      }: React.ComponentProps<typeof DayButton>) => {
        const isOutside =
          Boolean(modifiers.outside) ||
          day.date.getMonth() !== view.month ||
          day.date.getFullYear() !== view.year
        const entry = isOutside
          ? getMoonDayForDate(day.date, utcOffsetMin)
          : month.days[day.date.getDate() - 1]

        const isSelected = Boolean(modifiers.selected)
        const isToday = Boolean(modifiers.today)
        const isWeekend = day.date.getDay() === 0 || day.date.getDay() === 6

        return (
          <CalendarDayButton
            variant="ghost"
            day={day}
            modifiers={modifiers}
            {...props}
            className={cn(
              "flex aspect-auto h-auto min-h-14 w-full flex-col items-center justify-between gap-1 rounded-none px-0.5 py-1.5 transition-colors sm:min-h-16",
              // Weekend (Saturday and Sunday): light-warning variant
              isWeekend &&
                !isSelected &&
                !isToday &&
                (isOutside
                  ? "bg-warning/5 text-warning-foreground/60 opacity-40 hover:opacity-75 dark:bg-warning/10 dark:text-warning/60"
                  : "bg-warning/10 font-medium text-warning-foreground hover:bg-warning/20 dark:bg-warning/15 dark:text-warning dark:hover:bg-warning/25"),
              // Active / Selected: primary color variant
              isSelected &&
                "bg-primary font-semibold text-primary-foreground shadow-xs ring-0 hover:bg-primary/90",
              // Today (when not selected): bg-primary/20 (light-primary)
              isToday &&
                !isSelected &&
                "bg-primary/20 font-medium text-primary ring-1 ring-primary/40 ring-inset hover:bg-primary/30",
              // Outside month (non-weekend): muted color
              !isWeekend &&
                isOutside &&
                !isSelected &&
                "text-muted-foreground opacity-40 hover:opacity-75"
            )}
          >
            {entry && (
              <>
                <span
                  className={cn(
                    "flex items-center gap-1 font-mono tabular-nums",
                    isOutside && !isSelected && "text-muted-foreground/60",
                    isWeekend &&
                      !isSelected &&
                      !isOutside &&
                      "font-semibold text-warning-foreground dark:text-warning",
                    isSelected && "font-semibold text-primary-foreground"
                  )}
                >
                  {day.date.getDate()}
                  {/* Dot marks the day a new, quarter or full moon occurs. */}
                  {entry.principal && (
                    <span
                      className={cn(
                        "size-1.5 rounded-full bg-warning",
                        isSelected && "ring-1 ring-background"
                      )}
                    />
                  )}
                </span>
                <MoonDisc
                  phase={entry.phase}
                  flip={southern}
                  className={cn(
                    "size-5 sm:size-6",
                    isOutside && !isSelected && "opacity-40",
                    isSelected && "brightness-125"
                  )}
                />
              </>
            )}
          </CalendarDayButton>
        )
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- formatters and callbacks are rebuilt each render; these inputs decide what changes
    [
      month,
      southern,
      isYearView,
      pickerYear,
      view.year,
      view.month,
      selected.year,
      selected.month,
      selected.day,
      today.year,
      today.month,
      today.day,
      startYear,
      endYear,
      prefs.language,
      prefs.date,
      utcOffsetMin,
      s.today,
    ]
  )

  return (
    <div className="relative w-full">
      <Calendar
        mode="single"
        required
        showOutsideDays={true}
        month={new Date(view.year, view.month, 1)}
        onMonthChange={(m) =>
          onViewChange({ year: m.getFullYear(), month: m.getMonth() })
        }
        selected={new Date(selected.year, selected.month, selected.day)}
        onSelect={(date) => {
          onSelect(toYMD(date))
          if (
            date.getMonth() !== view.month ||
            date.getFullYear() !== view.year
          ) {
            onViewChange({ year: date.getFullYear(), month: date.getMonth() })
          }
        }}
        today={new Date(today.year, today.month, today.day)}
        startMonth={new Date(startYear, 0)}
        endMonth={new Date(endYear, 11)}
        // Sunday is the first day of the week.
        weekStartsOn={0}
        className="w-full bg-transparent p-0"
        classNames={{
          root: "relative w-full",
          months: "relative w-full",
          month: "w-full flex flex-col gap-2",
          month_caption:
            "justify-start px-0 border-b border-border/70 pb-2.5 pr-14 sm:pr-16",
          nav: cn(
            "pointer-events-none absolute top-0 right-0 z-10 flex items-center gap-1 [&>button]:pointer-events-auto",
            isYearView && "hidden"
          ),
          month_grid:
            "w-full table-fixed border-collapse border border-border/70",
          weekdays: "flex w-full border-b border-border/70 bg-muted/20",
          weekday:
            "flex-1 py-2.5 sm:py-3 text-center font-mono text-xs sm:text-sm font-semibold text-muted-foreground select-none first:bg-warning/10 first:text-warning-foreground dark:first:text-warning last:bg-warning/10 last:text-warning-foreground dark:last:text-warning",
          weeks: "w-full divide-y divide-border/70",
          week: "flex w-full divide-x divide-border/70 mt-0",
          day: "flex-1 h-auto p-0",
        }}
        formatters={{
          formatCaption: (d) => captionFmt.format(d),
          formatWeekdayName: (d) => weekdayFmt.format(d),
        }}
        labels={{
          labelPrevious: () => s.prevMonth,
          labelNext: () => s.nextMonth,
          labelDayButton: dayLabel,
        }}
        components={components}
      />
    </div>
  )
}
