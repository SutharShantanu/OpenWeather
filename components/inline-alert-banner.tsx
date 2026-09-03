"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  Volume2,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Clock,
  Building2,
} from "lucide-react";
import { CurrentWeather, WeatherAlert } from "@/lib/weather";

interface InlineAlertBannerProps {
  current: CurrentWeather;
  alerts?: WeatherAlert[];
}

export function InlineAlertBanner({ current, alerts: propAlerts }: InlineAlertBannerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [checkedProtocols, setCheckedProtocols] = useState<Record<string, boolean>>({});

  // Use alerts from props if provided, or derive from current telemetry
  const activeAlerts: WeatherAlert[] = propAlerts && propAlerts.length > 0
    ? propAlerts
    : [];

  // Fallback heuristic if none in props
  if (activeAlerts.length === 0) {
    const cond = current.condition.description.toLowerCase();
    if (cond.includes("storm") || cond.includes("thunder")) {
      activeAlerts.push({
        id: "storm",
        source: "Doppler Severe Weather Radar",
        event: "Severe Thunderstorm Watch",
        headline: "Atmospheric instability and localized electrical discharge detected in radar vector.",
        severity: "Severe",
        instruction: "Seek shelter indoors. Avoid elevated structures and disconnect sensitive equipment.",
      });
    }
    if (current.temp >= 35) {
      activeAlerts.push({
        id: "heat",
        source: "WMO Global Alert System",
        event: "Excessive Heat Advisory",
        headline: `Ambient temperature has exceeded 35°C (Observed: ${current.temp.toFixed(1)}°C).`,
        severity: "Severe",
        instruction: "Hydrate frequently, avoid direct midday sun exposure, limit strenuous outdoor activities.",
      });
    } else if (current.temp <= 0) {
      activeAlerts.push({
        id: "freeze",
        source: "Synoptic Warning Bureau",
        event: "Sub-Zero Freeze Hazard",
        headline: `Temperature at ${current.temp.toFixed(1)}°C. Black ice formation possible on transit routes.`,
        severity: "Moderate",
        instruction: "Exercise caution while driving; protect exposed plumbing and warm shelters.",
      });
    }
    if (current.windSpeed >= 13.9) {
      activeAlerts.push({
        id: "wind",
        source: "Marine & Terrestrial Wind Service",
        event: "High Wind Velocity Warning",
        headline: `Sustained wind velocities exceeding ${current.windSpeed.toFixed(1)} m/s.`,
        severity: "Moderate",
        instruction: "Secure loose exterior items, inspect balcony furniture, watch for falling tree branches.",
      });
    }
  }

  const hasCritical = activeAlerts.some((a) => a.severity === "Extreme" || a.severity === "Severe");

  // Web Audio Synthesizer Chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      setIsPlaying(true);

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(hasCritical ? 880 : 587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(hasCritical ? 440 : 440, ctx.currentTime + 0.35);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      setTimeout(() => setIsPlaying(false), 400);
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleProtocol = (id: string) => {
    setCheckedProtocols((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (activeAlerts.length === 0) {
    return (
      <div className="w-full p-2.5 bg-muted/20 border border-border flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>All Synoptic Systems Nominal — No active weather alerts for {current.cityName}.</span>
        </div>
        <Badge variant="outline" className="text-[9px] font-mono text-emerald-500 border-emerald-500/30">
          CLEAR
        </Badge>
      </div>
    );
  }

  return (
    <Card className={`w-full border-l-4 ${hasCritical ? "border-l-destructive border-border" : "border-l-amber-500 border-border"}`}>
      <CardHeader className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 border border-border shrink-0 ${hasCritical ? "bg-destructive/10 text-destructive" : "bg-amber-500/10 text-amber-500"}`}>
            <AlertTriangle className="size-4" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-heading font-semibold tracking-tight">
                Meteorological Advisory Bulletin
              </CardTitle>
              <Badge
                variant={hasCritical ? "destructive" : "outline"}
                className="font-mono text-[10px]"
              >
                {activeAlerts.length} Active {activeAlerts.length === 1 ? "Alert" : "Alerts"}
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Official severe weather warning & public safety directives for {current.cityName}
            </CardDescription>
          </div>
        </div>

        <CardAction className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={playChime}
            disabled={isPlaying}
            className="h-6 px-2 font-mono text-[10px] gap-1"
          >
            <Volume2 className="size-3 text-primary" />
            <span>Sound Chime</span>
          </Button>

          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 px-2 font-mono text-[10px] gap-1 text-muted-foreground hover:text-foreground"
          >
            <span>{isExpanded ? "Collapse" : "Expand Directives"}</span>
            {isExpanded ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </Button>
        </CardAction>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t border-border p-3 sm:p-4 space-y-3 divide-y divide-border/60">
          {activeAlerts.map((alert) => {
            const isChecked = checkedProtocols[alert.id] || false;
            return (
              <div key={alert.id} className="pt-3 first:pt-0 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-foreground">
                      {alert.event}
                    </span>
                    <Badge
                      variant={alert.severity === "Extreme" || alert.severity === "Severe" ? "destructive" : "outline"}
                      className="text-[9px] font-mono uppercase"
                    >
                      {alert.severity}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-mono text-muted-foreground">
                    <Building2 className="size-2.5 text-primary" />
                    <span>{alert.source}</span>
                    {alert.expires && (
                      <>
                        <span>•</span>
                        <Clock className="size-2.5" />
                        <span>Expires: {alert.expires}</span>
                      </>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {alert.headline}
                </p>

                {/* Safety Protocol Checklist */}
                <div
                  onClick={() => toggleProtocol(alert.id)}
                  className={`p-2.5 border cursor-pointer transition-colors flex items-start gap-2.5 text-xs font-mono ${
                    isChecked
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                      : "bg-muted/20 border-border text-foreground hover:bg-muted/40"
                  }`}
                >
                  {isChecked ? (
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="size-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <span className="font-semibold text-[11px] block mb-0.5">
                      Safety Protocol: {isChecked ? "Acknowledged" : "Action Required"}
                    </span>
                    <span className="text-[11px] leading-relaxed text-muted-foreground">
                      {alert.instruction}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      )}
    </Card>
  );
}
