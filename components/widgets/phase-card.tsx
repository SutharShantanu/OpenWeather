"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** Shared shell for dashboard widgets: titled header with a badge slot, optional side panel. */
export function PhaseCard({
  icon: Icon,
  title,
  subtitle,
  badge,
  iconClassName = "text-warning-foreground dark:text-warning",
  children,
  className,
  panel,
  panelOpen = false,
}: {
  icon: React.ElementType
  title: string
  subtitle?: React.ReactNode
  badge?: React.ReactNode
  iconClassName?: string
  children: React.ReactNode
  className?: string
  /** Slides in from the right over the card body; the card grows to fit it. */
  panel?: React.ReactNode
  panelOpen?: boolean
}) {
  return (
    <Card className={cn("w-full min-w-0 overflow-hidden", className)}>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <Icon className={cn("size-3.5", iconClassName)} />
            <CardTitle className="font-heading text-sm font-semibold tracking-tight">
              {title}
            </CardTitle>
          </div>
          {subtitle && (
            <CardDescription className="text-xs">{subtitle}</CardDescription>
          )}
        </div>
        {badge}
      </CardHeader>
      <CardContent
        className={cn(
          "pt-4",
          panel
            ? cn(
                "grid items-start transition-[grid-template-columns,gap] duration-300 ease-out motion-reduce:transition-none",
                panelOpen
                  ? "gap-4 md:grid-cols-[2fr_3fr]"
                  : "gap-0 md:grid-cols-[1fr_0fr]"
              )
            : "space-y-3"
        )}
      >
        <div className="min-w-0 space-y-3">{children}</div>
        {panel && (
          <div
            inert={!panelOpen}
            aria-hidden={!panelOpen}
            className={cn(
              "min-w-0 overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none",
              panelOpen ? "max-h-[80rem]" : "max-h-0",
              !panelOpen && "max-md:hidden"
            )}
          >
            {/* fixed floor keeps the calendar from reflowing while the column grows from 0 */}
            <div className="md:min-w-96">{panel}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
