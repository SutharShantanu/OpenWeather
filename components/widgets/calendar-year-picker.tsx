"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

/*
 * Month/year selection for the Calendar, adapted from ReUI's c-calendar-13:
 * the caption becomes a button that opens a year list, then a month grid.
 */

interface CaptionLabelProps extends React.HTMLAttributes<HTMLSpanElement> {
  isYearView: boolean
  onToggle: () => void
  variant?: React.ComponentProps<typeof Button>["variant"]
}

export function CaptionLabel({
  children,
  isYearView,
  onToggle,
  variant = "outline",
}: CaptionLabelProps) {
  return (
    <Button
      className="flex items-center gap-1.5 text-xs font-medium capitalize data-[state=open]:text-muted-foreground/80"
      data-state={isYearView ? "open" : "closed"}
      onClick={onToggle}
      size="default"
      variant={variant}
    >
      {children}
      <ChevronDownIcon
        aria-hidden="true"
        className={cn(
          "shrink-0 text-muted-foreground/80 transition-transform duration-200",
          isYearView ? "-rotate-180" : "rotate-0"
        )}
      />
    </Button>
  )
}

interface YearMonthGridProps {
  className?: string
  children: React.ReactNode
  isYearView: boolean
  startYear: number
  endYear: number
  currentYear: number
  currentMonth: number
  /** Year whose months are on show, or null while the year list is on show. */
  selectedYear: number | null
  onSelectYear: (year: number | null) => void
  onMonthSelect: (year: number, month: number) => void
  /** Short month label for a 0-based month index. */
  monthLabel: (month: number) => string
}

/** The day grid, with a year list / month grid laid over it while `isYearView`. */
export function YearMonthGrid({
  className,
  children,
  isYearView,
  startYear,
  endYear,
  currentYear,
  currentMonth,
  selectedYear,
  onSelectYear,
  onMonthSelect,
  monthLabel,
}: YearMonthGridProps) {
  const scrollRef = React.useRef<HTMLDivElement>(null)

  // Group years into 10-year decades (e.g. 1990s: 1990–1999)
  const decades = React.useMemo(() => {
    const decadeStart = Math.floor(startYear / 10) * 10
    const decadeEnd = Math.floor(endYear / 10) * 10
    const groups: { decade: number; years: number[] }[] = []

    for (let d = decadeStart; d <= decadeEnd; d += 10) {
      const decadeYears: number[] = []
      for (let y = d; y < d + 10; y++) {
        decadeYears.push(y)
      }
      groups.push({ decade: d, years: decadeYears })
    }
    return groups
  }, [startYear, endYear])

  // Bring the current year into view when the list opens.
  React.useEffect(() => {
    if (isYearView && selectedYear === null) {
      scrollRef.current
        ?.querySelector<HTMLElement>("[data-active='true']")
        ?.scrollIntoView({ block: "center" })
    }
  }, [isYearView, selectedYear])

  return (
    <div className="relative w-full">
      <table className={className}>{children}</table>
      {isYearView && (
        <div className="absolute inset-0 z-20 rounded-md bg-popover">
          <div className="h-full" ref={scrollRef}>
            <ScrollArea className="h-full">
              <div className="min-h-full w-full">
                <div className="w-full">
                  {selectedYear === null ? (
                    <div className="flex w-full flex-col gap-3.5 py-1">
                      {decades.map(({ decade, years: decadeYears }) => {
                        const isCurrentDecade =
                          currentYear >= decade && currentYear < decade + 10

                        return (
                          <div
                            key={decade}
                            className="flex w-full flex-col gap-1.5"
                          >
                            <div className="flex items-center gap-2 px-0.5">
                              <span
                                className={cn(
                                  "font-mono text-xs font-semibold tracking-wider",
                                  isCurrentDecade
                                    ? "text-primary"
                                    : "text-muted-foreground/80"
                                )}
                              >
                                {decade}s
                              </span>
                              <Separator
                                className={cn(
                                  "flex-1",
                                  isCurrentDecade && "bg-primary/30"
                                )}
                              />
                            </div>
                            <div className="grid w-full grid-cols-5 gap-1.5 sm:grid-cols-10 sm:gap-2">
                              {decadeYears.map((y) => {
                                const isCurrent = y === currentYear
                                return (
                                  <Button
                                    key={y}
                                    variant={isCurrent ? "default" : "accent"}
                                    className="h-9 font-mono text-xs font-semibold tabular-nums sm:h-10 sm:text-sm"
                                    data-active={isCurrent}
                                    onClick={() => onSelectYear(y)}
                                  >
                                    {y}
                                  </Button>
                                )
                              })}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex w-full flex-col gap-2.5 py-1">
                      <div className="flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 font-mono text-xs font-semibold tabular-nums sm:text-sm"
                          onClick={() => onSelectYear(null)}
                        >
                          <ChevronDownIcon className="size-4 rotate-90 rtl:-rotate-90" />
                          {selectedYear}
                        </Button>
                        <span className="text-xs font-medium text-muted-foreground">
                          Select month
                        </span>
                      </div>
                      <Separator />
                      <div className="flex w-full flex-wrap gap-2 sm:gap-2.5">
                        {Array.from({ length: 12 }, (_, m) => {
                          const isCurrent =
                            m === currentMonth && selectedYear === currentYear
                          return (
                            <Button
                              key={m}
                              variant={isCurrent ? "default" : "accent"}
                              className="flex-1 text-xs font-semibold capitalize sm:text-sm"
                              data-active={isCurrent}
                              onClick={() => onMonthSelect(selectedYear, m)}
                            >
                              {monthLabel(m)}
                            </Button>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      )}
    </div>
  )
}
