"use client";

import React, { useSyncExternalStore } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CurrentWeather, DailyForecastItem, HourlyForecastItem } from "@/lib/weather";
import { generateWeatherBriefing, WeatherSpeechSynthesizer } from "@/lib/speech";
import { useTtsPlayer } from "@/hooks/use-tts-player";
import { cn } from "@/lib/utils";
import type { ExtendedSettings } from "@/components/settings-dialog";
import { useTranslation } from "@/components/language-provider";

interface WeatherTtsButtonProps {
  current?: CurrentWeather;
  daily?: DailyForecastItem[];
  hourly?: HourlyForecastItem[];
  unit: "C" | "F";
  settings?: ExtendedSettings;
  className?: string;
  /** Icon sizes render icon-only (label moves to the tooltip / aria-label). */
  size?: "default" | "sm" | "icon" | "icon-sm";
}

const subscribeNoop = () => () => {};

/**
 * Spoken weather briefing. One button drives the shared TTS player:
 * idle → (press) preparing [disabled] → playing → (press) paused → (press) playing → idle.
 * A press can never start a second briefing while one is loaded.
 */
export function WeatherTtsButton({
  current,
  daily = [],
  hourly = [],
  unit,
  settings,
  className,
  size = "default",
}: WeatherTtsButtonProps) {
  const isIconOnly = size === "icon" || size === "icon-sm";
  const { t } = useTranslation();
  const { status, toggle } = useTtsPlayer({
    rate: settings?.speechRate,
    volumeGainDb: settings?.googleTtsVolumeGain,
    cacheSize: 2,
  });
  // Client-only capability: false during SSR/hydration, real value afterwards.
  const supported = useSyncExternalStore(
    subscribeNoop,
    () => WeatherSpeechSynthesizer.isSupported(),
    () => false
  );

  const handleClick = () => {
    if (!current) return;
    const language = settings?.language || "en";
    toggle({
      text: generateWeatherBriefing(current, daily, hourly, unit, language),
      voiceName: settings?.ttsVoice,
      language,
      deliveryStyle: settings?.speechDeliveryStyle,
      pitch: settings?.googleTtsPitch,
    });
  };

  if (!supported) return null;

  const speechText = t.settingsDialog.speech;
  const view = {
    idle: { icon: <Volume2 className="text-primary" />, label: t.common.briefing },
    loading: { icon: <Spinner />, label: t.common.preparing },
    playing: { icon: <Pause className="fill-current" />, label: speechText.pause },
    paused: { icon: <Play className="fill-current text-primary" />, label: speechText.resume },
  }[status];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={status === "playing" ? "default" : "outline"}
          size={size}
          disabled={!current || status === "loading"}
          onClick={handleClick}
          aria-label={view.label}
          aria-busy={status === "loading"}
          aria-pressed={status === "playing" || status === "paused"}
          className={cn("font-mono transition-all", className)}
        >
          {view.icon}
          {!isIconOnly && <span className="text-mini">{view.label}</span>}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{view.label}</TooltipContent>
    </Tooltip>
  );
}
