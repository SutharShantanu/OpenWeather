"use client";

import React, { useState, useEffect } from "react";
import { Volume2, VolumeX, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CurrentWeather, DailyForecastItem, HourlyForecastItem } from "@/lib/weather";
import { generateWeatherBriefing, WeatherSpeechSynthesizer } from "@/lib/speech";

import { cn } from "@/lib/utils";

interface WeatherTtsButtonProps {
  current?: CurrentWeather;
  daily?: DailyForecastItem[];
  hourly?: HourlyForecastItem[];
  unit: "C" | "F";
  className?: string;
}

export function WeatherTtsButton({
  current,
  daily = [],
  hourly = [],
  unit,
  className,
}: WeatherTtsButtonProps) {
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

    const script = generateWeatherBriefing(current, daily, hourly, unit);
    WeatherSpeechSynthesizer.speak(script, {
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
          title={isPlaying ? "Stop Audio Briefing" : "Listen to Weather Briefing"}
        >
          {isPlaying ? (
            <>
              <Square className="size-3 fill-current" />
              <span className="hidden sm:inline text-mini">Speaking...</span>
            </>
          ) : (
            <>
              <Volume2 className="size-3.5 text-primary" />
              <span className="hidden sm:inline text-mini">Briefing</span>
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isPlaying ? "Click to Stop Audio Briefing" : "Listen to Spoken Weather Briefing"}
      </TooltipContent>
    </Tooltip>
  );
}
