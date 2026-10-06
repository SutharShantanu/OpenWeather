"use client"

import React, { useState } from "react"
import {
  Bell,
  BellRing,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/empty-state"
import { WeatherAlert, CurrentWeather } from "@/lib/weather"
import { useTranslation } from "@/components/language-provider"
import { useAlertChime, playDismissSound } from "@/hooks/use-alert-chime"

/** Swipe-out duration; keep in sync with the `duration-200` classes below. */
const SWIPE_MS = 200

interface NotificationsPopoverProps {
  alerts?: WeatherAlert[]
  current?: CurrentWeather
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function NotificationsPopover({
  alerts = [],
  current,
  open,
  onOpenChange,
}: NotificationsPopoverProps) {
  const { t } = useTranslation()
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  useAlertChime(alerts)

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id))
  const unreadCount = activeAlerts.length

  // Ids mid-swipe: they slide out and collapse, then move to `dismissedIds`.
  const [leavingIds, setLeavingIds] = useState<string[]>([])

  const dismiss = (ids: string[]) => {
    playDismissSound()
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    setLeavingIds((prev) => [...prev, ...ids])
    setTimeout(
      () => {
        setDismissedIds((prev) => [...prev, ...ids])
        setLeavingIds((prev) => prev.filter((id) => !ids.includes(id)))
      },
      reduceMotion ? 0 : SWIPE_MS
    )
  }

  const handleDismissAlert = (id: string) => dismiss([id])

  const handleClearAll = () => dismiss(activeAlerts.map((a) => a.id))

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="relative size-8"
          title={t.notifications.title}
        >
          {unreadCount > 0 ? (
            <BellRing className="size-3.5 text-primary" />
          ) : (
            <Bell className="size-3.5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -end-1.5 -top-1.5 flex size-4 items-center justify-center border border-destructive/30 p-0 font-mono text-micro font-bold"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(20rem,calc(100vw-2rem))] space-y-3 p-3.5 font-mono text-xs sm:w-96"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-1.5 font-heading font-semibold text-foreground">
            <Bell className="size-3.5 text-primary" />
            <span>{t.notifications.title}</span>
            {unreadCount > 0 && (
              <Badge variant="outline" className="ms-1 font-mono text-micro">
                {t.notifications.activeCount(unreadCount)}
              </Badge>
            )}
          </div>

          {activeAlerts.length > 0 && (
            <Button
              variant="destructive"
              size="icon-xs"
              onClick={handleClearAll}
              aria-label={t.common.clear}
              title={t.common.clear}
            >
              <Trash2 />
            </Button>
          )}
        </div>

        {/* Active Weather Bulletins */}
        <div className="space-y-2">
          <div className="text-tiny font-bold text-muted-foreground uppercase">
            {t.notifications.currentBulletins}
          </div>

          {activeAlerts.length > 0 ? (
            <div className="max-h-64 overflow-x-hidden overflow-y-auto pe-0.5">
              {activeAlerts.map((alert) => {
                const isLeaving = leavingIds.includes(alert.id)
                return (
                  <div
                    key={alert.id}
                    className={`group/row grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none ${isLeaving ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="pb-2 group-last/row:pb-0">
                        <div
                          className={`space-y-1.5 border border-border bg-muted/20 p-2.5 transition-[transform,opacity] duration-200 ease-in motion-reduce:transition-none ${isLeaving ? "translate-x-full opacity-0 rtl:-translate-x-full" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <AlertTriangle className="size-3 shrink-0 text-amber-700 dark:text-amber-500" />
                              <span className="text-mini font-bold text-foreground">
                                {alert.event}
                              </span>
                            </div>
                            <Badge
                              variant="outline"
                              className="font-mono text-nano"
                            >
                              {alert.severity}
                            </Badge>
                          </div>

                          <p className="text-mini leading-snug text-muted-foreground">
                            {alert.headline}
                          </p>

                          <div className="flex items-center justify-between border-t border-border/40 pt-1 text-micro text-muted-foreground">
                            <span>{alert.source}</span>
                            <Button
                              variant="warning"
                              size="icon-xs"
                              onClick={() => handleDismissAlert(alert.id)}
                              aria-label={t.notifications.dismiss}
                              title={t.notifications.dismiss}
                            >
                              <X />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyState
              variant="muted"
              size="sm"
              icon={
                <ShieldCheck className="size-4 text-emerald-700 dark:text-emerald-500" />
              }
              iconStackClassName="text-emerald-700 dark:text-emerald-500"
              title={t.notifications.allClearTitle}
              description={t.notifications.allClearDesc(
                current?.cityName || t.common.stationTelemetry
              )}
            />
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
