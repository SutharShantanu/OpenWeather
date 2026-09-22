"use client"

import React from "react"
import {
  Square,
  Play,
  Check,
  Server,
  CloudLightning,
  Globe,
  Cpu,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { WeatherDataSource } from "@/lib/weather"
import {
  GoogleTtsModel,
  GoogleTtsVoiceInfo,
  GOOGLE_TTS_MODELS,
} from "@/lib/google-tts"
import { getGoogleLanguage } from "@/lib/google-languages"
import { LIVE_CLOCK_INTERVAL_MS } from "@/lib/constants"
import { UnitOption } from "./types"

// ============================================================================
// TAB TRIGGERS & SECTION HEADERS
// ============================================================================

export interface SettingsTabTriggerProps
  extends React.ComponentProps<typeof TabsTrigger> {
  value: string
  label: string
  badge?: React.ReactNode
}

export function SettingsTabTrigger({
  value,
  label,
  badge,
  className,
  ...props
}: SettingsTabTriggerProps) {
  return (
    <TabsTrigger value={value} className={cn("gap-1.5", className)} {...props}>
      <span>{label}</span>
      {badge}
    </TabsTrigger>
  )
}

export interface SettingsTabPanelProps
  extends React.ComponentProps<typeof TabsContent> {
  value: string
  children: React.ReactNode
}

export function SettingsTabPanel({
  value,
  className,
  children,
  ...props
}: SettingsTabPanelProps) {
  return (
    <TabsContent
      value={value}
      className={cn(
        "min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5 pb-8 sm:pb-10 focus-visible:outline-none",
        className
      )}
      {...props}
    >
      {children}
    </TabsContent>
  )
}

export function TabSectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {Icon && <Icon className="size-3.5 text-primary" />}
          <span>{title}</span>
        </div>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

// ============================================================================
// FORM & CARD WIDGETS
// ============================================================================

export interface UnitSettingCardProps<T extends string = string> {
  icon: React.ComponentType<{ className?: string }>
  iconColor?: string
  title: string
  description: string
  badgeText: string
  badgeVariant?: "primary-outline" | "primary-light" | "outline" | "secondary"
  badgeClassName?: string
  value: T
  onValueChange: (val: T) => void
  placeholder: string
  options: UnitOption<T>[]
}

export function UnitSettingCard<T extends string>({
  icon: Icon,
  iconColor,
  title,
  description,
  badgeText,
  badgeVariant = "primary-outline",
  badgeClassName = "font-mono text-xs uppercase",
  value,
  onValueChange,
  placeholder,
  options,
}: UnitSettingCardProps<T>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
          <Icon className={cn("size-4", iconColor || "text-primary")} />
          <span>{title}</span>
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground">
          {description}
        </CardDescription>
        <CardAction className="flex items-center gap-2">
          <Badge variant={badgeVariant} className={badgeClassName}>
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <Select
          value={value}
          onValueChange={(val) => {
            if (val) onValueChange(val as T)
          }}
        >
          <SelectTrigger className="w-full justify-between border-border bg-background/60 font-mono text-xs">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent position="popper">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

export interface SliderPreset {
  value: number
  label: string
}

export interface SettingSliderCardProps {
  icon?: React.ElementType
  title: string
  description?: string
  badgeText: string
  value: number
  min: number
  max: number
  step: number
  decimals?: number
  onValueChange: (val: number) => void
  presets: SliderPreset[]
}

export function SettingSliderCard({
  icon: Icon,
  title,
  description,
  badgeText,
  value,
  min,
  max,
  step,
  decimals = 1,
  onValueChange,
  presets,
}: SettingSliderCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
          {Icon && <Icon className="size-4 text-primary" />}
          <span>{title}</span>
        </CardTitle>
        {description && (
          <CardDescription className="text-xs text-muted-foreground">
            {description}
          </CardDescription>
        )}
        <CardAction>
          <Badge
            variant="primary-outline"
            className="font-mono text-xs uppercase"
          >
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(val) => {
            if (val[0] !== undefined)
              onValueChange(Number(val[0].toFixed(decimals)))
          }}
          className="py-1"
        />
        <div className="flex justify-between gap-1 pt-1">
          {presets.map((p) => (
            <Button
              key={p.value}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onValueChange(p.value)}
              className={cn(
                "flex-1 font-mono text-tiny",
                value === p.value
                  ? "border-primary bg-primary/10 font-bold text-primary"
                  : "border-border bg-muted/20 text-muted-foreground hover:bg-muted/40"
              )}
            >
              <span>{p.label}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function SelectionCheckIndicator({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <div className="flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
        <Check className="size-3 stroke-[2.5]" />
      </div>
    )
  }
  return (
    <div className="size-4.5 shrink-0 rounded-full border border-border group-hover:border-primary/40" />
  )
}

export function getProviderIcon(id: WeatherDataSource) {
  switch (id) {
    case "open-meteo":
      return <CloudLightning className="size-3.5 text-sky-500" />
    case "openweathermap":
      return <Globe className="size-3.5 text-amber-500" />
    case "simulation":
      return <Cpu className="size-3.5 text-purple-500" />
    case "auto":
      return <ShieldCheck className="size-3.5 text-emerald-500" />
    default:
      return <Server className="size-3.5 text-primary" />
  }
}

export interface VoicePlayButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> {
  isPlaying: boolean
  label: string
  onTogglePlay: () => void
}

export function VoicePlayButton({
  isPlaying,
  label,
  onTogglePlay,
  size = "icon-sm",
  variant,
  className,
  ...props
}: VoicePlayButtonProps) {
  const Icon = isPlaying ? Square : Play
  const action = isPlaying ? "Stop" : "Play"

  return (
    <Button
      type="button"
      variant={variant ?? (isPlaying ? "default" : "outline")}
      size={size}
      aria-label={`${action} ${label}`}
      title={`${action} preview (${label})`}
      onClick={(e) => {
        e.stopPropagation()
        e.preventDefault()
        onTogglePlay()
      }}
      className={cn(
        "shrink-0 cursor-pointer shadow-2xs transition-all select-none",
        isPlaying
          ? "animate-pulse shadow-xs ring-2 ring-primary/40 bg-primary text-primary-foreground"
          : "border-border/80 bg-background/80 text-foreground group-hover:border-primary/40 hover:scale-105 hover:border-primary hover:bg-primary/15 hover:text-primary active:scale-95",
        className
      )}
      {...props}
    >
      <Icon
        className={cn(
          "size-3.5 fill-current",
          !isPlaying && "ml-0.5 text-primary group-hover:text-primary"
        )}
      />
    </Button>
  )
}

export const subscribeToClock = (callback: () => void) => {
  const timer = setInterval(callback, LIVE_CLOCK_INTERVAL_MS)
  return () => clearInterval(timer)
}

export function useLiveTime(): Date | null {
  const seconds = React.useSyncExternalStore(
    subscribeToClock,
    () => Math.floor(Date.now() / 1000),
    () => null
  )
  return seconds !== null ? new Date(seconds * 1000) : null
}

export function getGoogleModelPreviewText(
  model: GoogleTtsModel,
  lang: string
): string {
  const modelInfo = GOOGLE_TTS_MODELS.find((m) => m.id === model)
  const langConfig = getGoogleLanguage(lang)

  const modelLabel = modelInfo
    ? `${modelInfo.name} (${modelInfo.badge})`
    : model
  return `${modelLabel}: ${langConfig.speechPreviewText}`
}

export function getGoogleVoicePreviewText(
  voice: GoogleTtsVoiceInfo,
  lang: string
): string {
  const langConfig = getGoogleLanguage(lang || voice.languageCode)

  return `${voice.name}. ${voice.description}. ${langConfig.speechPreviewText}`
}
