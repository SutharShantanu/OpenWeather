"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  BellOff,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Send,
  Trash2,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WeatherAlert, CurrentWeather } from "@/lib/weather";

interface NotificationsPopoverProps {
  alerts?: WeatherAlert[];
  current?: CurrentWeather;
}

export function NotificationsPopover({ alerts = [], current }: NotificationsPopoverProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (!supported) return;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === "granted") {
        new Notification("OpenWeather Notifications Enabled", {
          body: `You will receive push bulletins for severe weather alerts in ${current?.cityName || "your area"}.`,
          icon: "/favicon.ico",
        });
      }
    } catch (err) {
      console.warn("Failed to request notification permission", err);
    }
  };

  const handleSendTestPush = () => {
    if (!supported || permission !== "granted") return;
    new Notification(`Weather Alert • ${current?.cityName || "London"}`, {
      body: `Immediate synoptic update: ${current?.condition.description || "Overcast"}. Wind at ${current?.windSpeed.toFixed(1) || 4} m/s.`,
      icon: "/favicon.ico",
    });
  };

  const activeAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));
  const unreadCount = activeAlerts.length;

  const handleDismissAlert = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const handleClearAll = () => {
    setDismissedIds(alerts.map((a) => a.id));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon-sm"
          className="size-8 relative"
          title="Notification Center & Push Alerts"
        >
          {unreadCount > 0 ? (
            <BellRing className="size-3.5 text-primary" />
          ) : (
            <Bell className="size-3.5 text-muted-foreground" />
          )}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-4 bg-destructive text-destructive-foreground text-micro font-mono font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 sm:w-96 p-3.5 space-y-3.5 font-mono text-xs">
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

        {/* Web Push Notification Status Box */}
        <div className="p-2.5 bg-muted/20 border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-tiny uppercase font-bold text-muted-foreground">
              Desktop Push Alerts
            </span>
            <Badge
              variant={permission === "granted" ? "default" : "outline"}
              className="text-micro font-mono"
            >
              {permission === "granted"
                ? "Active"
                : permission === "denied"
                ? "Blocked in Browser"
                : "Not Configured"}
            </Badge>
          </div>

          <p className="text-mini text-muted-foreground leading-relaxed">
            {permission === "granted"
              ? "Browser push permissions active. You will receive native system alerts for sudden squalls, storms, and rapid freezes."
              : "Enable browser push notifications to receive real-time weather advisories even when the tab is running in the background."}
          </p>

          <div className="flex items-center gap-2 pt-0.5">
            {permission !== "granted" ? (
              <Button
                variant="default"
                size="xs"
                onClick={handleRequestPermission}
                className="font-mono text-xs h-7 w-full"
              >
                Enable Push Notifications
              </Button>
            ) : (
              <Button
                variant="outline"
                size="xs"
                onClick={handleSendTestPush}
                className="font-mono text-xs h-7 w-full gap-1"
              >
                <Send className="size-2.5" />
                <span>Test Desktop Push Alert</span>
              </Button>
            )}
          </div>
        </div>

        {/* Active Weather Bulletins */}
        <div className="space-y-2">
          <div className="text-tiny uppercase font-bold text-muted-foreground">
            Current Station Bulletins
          </div>

          {activeAlerts.length > 0 ? (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-0.5">
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
            <div className="p-3 bg-muted/10 border border-border text-center text-muted-foreground text-mini flex flex-col items-center gap-1">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>All clear. No active weather alerts for {current?.cityName || "London"}.</span>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
