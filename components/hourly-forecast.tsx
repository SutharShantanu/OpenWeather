"use client";

import React, { useState } from "react";
import NumberFlow from "@number-flow/react";
import { Clock, TrendingUp, CloudRain, SunMedium, Wind } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { HourlyForecastItem, formatTemperature } from "@/lib/weather";
import { WeatherIcon } from "@/components/weather-icon";
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HourlyForecastProps {
  hourly: HourlyForecastItem[];
  unit: "C" | "F";
}

export function HourlyForecast({ hourly, unit }: HourlyForecastProps) {
  const [showChart, setShowChart] = useState(false);
  const [hoursLimit, setHoursLimit] = useState<24 | 48>(24);

  const displayedHourly = hourly.slice(0, hoursLimit);

  const chartData = displayedHourly.map((item) => ({
    time: item.time,
    temp: formatTemperature(item.temp, unit),
    feelsLike: formatTemperature(item.feelsLike, unit),
    pop: Math.round(item.pop * 100),
    wind: item.windSpeed,
    uv: item.uvIndex ?? 0,
  }));

  return (
    <Card className="w-full">
      <CardHeader className="border-b border-border pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 text-primary" />
            <CardTitle className="text-sm font-heading font-semibold tracking-tight">
              Hourly Trajectory
            </CardTitle>
            <Badge variant="outline" className="text-tiny font-mono">
              1-Hour Precision
            </Badge>
          </div>
          <CardDescription className="text-xs">
            Chronological thermal, precipitation and wind sequence
          </CardDescription>
        </div>

        <CardAction className="flex items-center gap-2">
          {hourly.length > 24 && (
            <div className="flex items-center border border-border p-0.5 text-xs font-mono">
              <Button
                variant={hoursLimit === 24 ? "default" : "ghost"}
                size="xs"
                onClick={() => setHoursLimit(24)}
                className="h-6 px-2 font-mono text-tiny"
              >
                24H
              </Button>
              <Button
                variant={hoursLimit === 48 ? "default" : "ghost"}
                size="xs"
                onClick={() => setHoursLimit(48)}
                className="h-6 px-2 font-mono text-tiny"
              >
                48H
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="font-mono text-xs gap-1.5 h-7"
          >
            <TrendingUp className="size-3" />
            <span>{showChart ? "Cards" : "Curve"}</span>
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="pt-4">
        {showChart ? (
          <div className="h-44 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="time"
                  stroke="currentColor"
                  className="text-tiny font-mono text-muted-foreground"
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-popover border border-border p-2.5 shadow-md text-xs font-mono">
                          <div className="font-semibold text-foreground">{data.time}</div>
                          <div className="text-primary font-bold">{data.temp}°{unit}</div>
                          <div className="text-tiny text-muted-foreground">Precip: {data.pop}%</div>
                          <div className="text-tiny text-muted-foreground">Wind: {data.wind} m/s</div>
                          {data.uv > 0 && (
                            <div className="text-tiny text-amber-500">UV: {data.uv}</div>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="temp"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {displayedHourly.map((item, idx) => {
              const formattedTemp = formatTemperature(item.temp, unit);
              const popPercent = Math.round(item.pop * 100);

              return (
                <div
                  key={idx}
                  className="flex flex-col items-center justify-between gap-2 min-w-[5.25rem] p-2.5 bg-muted/20 border border-border hover:bg-muted/40 transition-colors text-center shrink-0"
                >
                  <span className="text-tiny font-mono text-muted-foreground font-medium">
                    {item.time}
                  </span>

                  <div className="size-7 bg-background border border-border flex items-center justify-center">
                    <WeatherIcon type={item.conditionType} size={15} />
                  </div>

                  <span className="text-sm font-mono font-bold text-foreground">
                    <NumberFlow value={formattedTemp} />°
                  </span>

                  {popPercent > 10 ? (
                    <div className="flex items-center gap-0.5 text-tiny font-mono text-sky-500 font-semibold">
                      <CloudRain className="size-2.5" />
                      <span>{popPercent}%</span>
                    </div>
                  ) : (
                    <span className="text-tiny font-mono text-muted-foreground/60">
                      0%
                    </span>
                  )}

                  <div className="flex items-center gap-1 text-micro font-mono text-muted-foreground pt-1 border-t border-border/40 w-full justify-center">
                    <Wind className="size-2.5 text-muted-foreground" />
                    <span>{item.windSpeed.toFixed(0)}m/s</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
