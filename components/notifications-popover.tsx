"use client";

import React, { useState } from "react";
import {
  Bell,
  BellRing,
  AlertTriangle,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { IconStack } from "@/components/reui/icon-stack";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
} from "@/components/ui/empty";
import { WeatherAlert, CurrentWeather } from "@/lib/weather";

interface NotificationsPopoverProps {
  alerts?: WeatherAlert[];
  current?: CurrentWeather;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function NotificationsPopover({
  alerts = [],
  current,
  open,
  onOpenChange,
}: NotificationsPopoverProps) {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));
  const unreadCount = activeAlerts.length;

  const handleDismissAlert = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleClearAll = () => {
    setDismissedIds(alerts.map((a) => a.id));
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="size-8 relative"
          title="Notification Center"
        >
          {unreadCount > 0 ? (
            <BellRing className="size-3.5 text-primary" />
          ) : (
            <Bell className="size-3.5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1.5 -right-1.5 size-4 p-0 text-micro font-mono font-bold flex items-center justify-center border border-destructive/30"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-3.5 space-y-3 font-mono text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <div className="flex items-center gap-1.5 font-heading font-semibold text-foreground">
            <Bell className="size-3.5 text-primary" />
            <span>Notification Center</span>
            {unreadCount > 0 && (
              <Badge variant="outline" className="text-micro font-mono ml-1">
                {unreadCount} Active
              </Badge>
            )}
          </div>

          {activeAlerts.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={handleClearAll}
              className="h-5 px-1.5 text-tiny text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="size-2.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active Weather Bulletins */}
        <div className="space-y-2">
          <div className="text-tiny uppercase font-bold text-muted-foreground">
            Current Station Bulletins
          </div>

          {activeAlerts.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-0.5">
              {activeAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-2.5 bg-muted/20 border border-border space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <AlertTriangle className="size-3 text-amber-500 shrink-0" />
                      <span className="font-bold text-foreground text-mini">
                        {alert.event}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-nano font-mono">
                      {alert.severity}
                    </Badge>
                  </div>

                  <p className="text-mini text-muted-foreground leading-snug">
                    {alert.headline}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-border/40 text-micro text-muted-foreground">
                    <span>{alert.source}</span>
                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      className="hover:text-foreground underline cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty className="py-6 border border-dashed border-border/80 bg-muted/10">
              <EmptyHeader>
                <EmptyMedia>
                  <IconStack aria-hidden="true" className="text-emerald-500 h-16 w-14">
                    <ShieldCheck className="text-emerald-500 size-4" />
                  </IconStack>
                </EmptyMedia>
                <EmptyTitle className="text-xs">All Systems Clear</EmptyTitle>
                <EmptyDescription className="text-xs">
                  No active weather bulletins or severe advisories for {current?.cityName || "London"}.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
