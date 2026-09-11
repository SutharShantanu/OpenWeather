"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CurrentWeather, DailyForecastItem, HourlyForecastItem } from "@/lib/weather";
import { generateWeatherBriefing, WeatherSpeechSynthesizer } from "@/lib/speech";

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
}

export function WeatherTtsButton({
  current,
  daily = [],
  hourly = [],
  unit,
  settings,
  className,
}: WeatherTtsButtonProps) {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(WeatherSpeechSynthesizer.isSupported());
  }, []);

  const handleToggleSpeak = () => {
    if (!current || !supported) return;

    if (isPlaying) {
      WeatherSpeechSynthesizer.stop();
      setIsPlaying(false);
      return;
    }

    const script = generateWeatherBriefing(
      current,
      daily,
      hourly,
      unit,
      settings?.language || "en"
    );
    WeatherSpeechSynthesizer.speak(script, {
      rate: settings?.speechRate,
      pitch: settings?.googleTtsPitch,
      lang: settings?.language,
      voiceName: settings?.googleTtsVoice,
      model: settings?.googleTtsModel,
      audioProfile: settings?.googleTtsAudioProfile,
      volumeGainDb: settings?.googleTtsVolumeGain,
      googleApiKey: settings?.googleApiKey,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  if (!supported) return null;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isPlaying ? "default" : "outline"}
          size="sm"
          disabled={!current}
          onClick={handleToggleSpeak}
          className={cn(
            "font-mono text-xs gap-1.5 h-8 px-2.5 transition-all",
            isPlaying && "bg-primary text-primary-foreground animate-pulse",
            className
          )}
          title={isPlaying ? t.common.playing : t.common.briefing}
        >
          {isPlaying ? (
            <>
              <Square className="size-3 fill-current" />
              <span className="hidden sm:inline text-mini">{t.common.playing}</span>
            </>
          ) : (
            <>
              <Volume2 className="size-3.5 text-primary" />
              <span className="hidden sm:inline text-mini">{t.common.briefing}</span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isPlaying ? t.common.playing : t.common.briefing}
      </TooltipContent>
    </Tooltip>
  );
}
