"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/components/language-provider"
import { formatAudioTime, getAudioBarHeight } from "../../utils"

export interface AudioToneVisualizerProps {
  status: "idle" | "loading" | "playing" | "paused"
  tone: string
  /** Semitone pitch; omit when the active engine ignores pitch. */
  pitch?: number
  speed: number
  currentTime: number
  duration: number
  onSeek: (percentage: number) => void
  /** Live spectrum (0..1 per bar) of the playing audio; null when it can't be analysed. */
  readLevels?: (bars: number) => number[] | null
  /** Exact playhead, polled per frame for a smooth progress bar. */
  getPosition?: () => { currentTime: number; duration: number } | null
}

const NUM_BARS = 28

/** Map an analyser level (0..1) to a bar height %, keeping a small floor so silence still reads as bars. */
function levelToHeight(level: number): number {
  return Math.round(8 + Math.min(1, level) * 87)
}

export function AudioToneVisualizer({
  status,
  tone,
  pitch,
  speed,
  currentTime,
  duration,
  onSeek,
  readLevels,
  getPosition,
}: AudioToneVisualizerProps) {
  const { t } = useTranslation()
  const speech = t.settingsDialog.speech
  const text = speech.visualizer
  const toneLabel = (speech.tones as Record<string, string>)[tone] ?? tone
  const [tick, setTick] = useState(0)
  // True while bars are driven by the real audio spectrum (DOM is written directly, no re-renders)
  const [isLive, setIsLive] = useState(false)
  const barRefs = useRef<(HTMLDivElement | null)[]>([])
  const progressRef = useRef<HTMLDivElement | null>(null)
  const timeRef = useRef<HTMLSpanElement | null>(null)
  const showLive = isLive && (status === "playing" || status === "paused")

  // Real-time sync: poll the analyser + playhead every animation frame while playing
  useEffect(() => {
    if (status !== "playing" || !readLevels) return
    let frame = 0
    const render = () => {
      const levels = readLevels(NUM_BARS)
      if (levels) {
        setIsLive(true)
        levels.forEach((level, i) => {
          const bar = barRefs.current[i]
          if (bar) bar.style.height = `${levelToHeight(level)}%`
        })
      } else {
        setIsLive(false)
      }
      const position = getPosition?.()
      if (position && position.duration > 0) {
        const pct = Math.min(100, Math.max(0, (position.currentTime / position.duration) * 100))
        if (progressRef.current) progressRef.current.style.width = `${pct}%`
        if (timeRef.current) {
          timeRef.current.textContent = `${formatAudioTime(position.currentTime)} / ${formatAudioTime(position.duration)}`
        }
      }
      frame = requestAnimationFrame(render)
    }
    frame = requestAnimationFrame(render)
    return () => cancelAnimationFrame(frame)
  }, [status, readLevels, getPosition])

  // Simulated motion only when there's no live spectrum (loading, or browser-voice fallback)
  useEffect(() => {
    if (status === "loading" || (status === "playing" && !isLive)) {
      const interval = setInterval(() => {
        setTick((t) => (t + 1) % 1000)
      }, 45)
      return () => clearInterval(interval)
    }
  }, [status, isLive])

  const numBars = NUM_BARS
  const hasDuration = duration > 0
  const progressPercent =
    duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0

  return (
    <Card className="gap-2 rounded-none border border-primary/20 bg-background/50 p-2.5 py-2.5 w-full shadow-none ring-0">
      {/* Telemetry Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-nano text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              "size-1.5 rounded-full transition-colors",
              status === "playing"
                ? "bg-primary animate-ping"
                : status === "paused"
                ? "bg-amber-500"
                : status === "loading"
                ? "bg-primary animate-pulse"
                : "bg-muted-foreground/50"
            )}
          />
          <span className="font-semibold uppercase tracking-wider text-foreground/80">
            {status === "playing"
              ? text.live
              : status === "paused"
              ? text.paused
              : status === "loading"
              ? text.synthesizing
              : text.idle}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span>
            {text.tone}: <strong className="text-foreground">{toneLabel}</strong>
          </span>
          {pitch !== undefined && (
            <>
              <span>•</span>
              <span>
                {text.pitch}:{" "}
                <strong className="text-foreground">
                  {pitch > 0 ? `+${pitch.toFixed(1)}` : `${pitch.toFixed(1)}`}st
                </strong>
              </span>
            </>
          )}
          <span>•</span>
          <span>
            {text.rate}: <strong className="text-foreground">{speed.toFixed(2)}x</strong>
          </span>
        </div>
      </div>

      {/* Visualizer Frequency Bars */}
      <div className="flex h-10 w-full items-end justify-between gap-1 px-1 py-1 select-none">
        {Array.from({ length: numBars }).map((_, i) => {
          const height = getAudioBarHeight(
            i,
            numBars,
            tick,
            status,
            tone,
            pitch ?? 0,
            speed
          )
          return (
            <div
              key={i}
              ref={(el) => {
                barRefs.current[i] = el
              }}
              className={cn(
                "w-full rounded-xs transition-[height] duration-75 ease-out",
                status === "playing"
                  ? "bg-primary shadow-2xs shadow-primary/30"
                  : status === "paused"
                  ? "bg-amber-500/50"
                  : status === "loading"
                  ? "bg-primary/50"
                  : "bg-muted-foreground/30"
              )}
              // While live, heights come from the analyser (paused keeps the last real frame)
              style={showLive ? undefined : { height: `${height}%` }}
            />
          )
        })}
      </div>

      {/* Progress Track & Interactive Scrubber */}
      <div className="flex items-center justify-between gap-2.5 pt-1">
        <div
          role="slider"
          tabIndex={0}
          aria-label={text.positionAria}
          aria-valuenow={Math.round(currentTime)}
          aria-valuemin={0}
          aria-valuemax={Math.max(1, Math.round(duration))}
          aria-valuetext={
            hasDuration
              ? text.positionText(formatAudioTime(currentTime), formatAudioTime(duration))
              : text.noAudio
          }
          aria-disabled={!hasDuration}
          onClick={(e) => {
            if (!hasDuration) return
            const rect = e.currentTarget.getBoundingClientRect()
            const clickX = e.clientX - rect.left
            const pct = Math.max(0, Math.min(1, clickX / rect.width))
            onSeek(pct)
          }}
          onKeyDown={(e) => {
            if (!hasDuration) return
            let target: number | null = null
            if (e.key === "ArrowRight" || e.key === "ArrowUp") {
              target = Math.min(1, (currentTime + 1) / duration)
            } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
              target = Math.max(0, (currentTime - 1) / duration)
            } else if (e.key === "Home") {
              target = 0
            } else if (e.key === "End") {
              target = 1
            }
            if (target !== null) {
              e.preventDefault()
              onSeek(target)
            }
          }}
          className="group relative h-2.5 flex-1 cursor-pointer aria-disabled:cursor-default overflow-hidden rounded-full bg-border/70 hover:bg-border transition-colors select-none"
        >
          <div
            ref={progressRef}
            className={cn(
              "h-full relative",
              status === "playing"
                ? "bg-primary shadow-xs"
                : status === "paused"
                ? "bg-amber-500"
                : status === "loading"
                ? "bg-primary/60 animate-pulse"
                : "bg-muted-foreground/40"
            )}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 size-2.5 rounded-full bg-foreground shadow-xs opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Formatted Elapsed Time / Total Duration */}
        <span ref={timeRef} className="font-mono text-nano text-muted-foreground shrink-0 tabular-nums">
          {formatAudioTime(currentTime)} / {formatAudioTime(duration || 0)}
        </span>
      </div>
    </Card>
  )
}
