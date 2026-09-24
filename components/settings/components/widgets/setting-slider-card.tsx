"use client"

import React from "react"
import { Slider as SliderPrimitive } from "radix-ui"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

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
  /** Spoken value for assistive tech (e.g. "1.20 times speed"). Defaults to badgeText. */
  valueText?: string
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
  valueText,
}: SettingSliderCardProps) {
  const titleId = React.useId()
  const descriptionId = React.useId()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-xs font-semibold text-foreground">
          {Icon && <Icon className="size-4 text-primary" aria-hidden="true" />}
          <span id={titleId}>{title}</span>
        </CardTitle>
        {description && (
          <CardDescription
            id={descriptionId}
            className="text-xs text-muted-foreground"
          >
            {description}
          </CardDescription>
        )}
        <CardAction>
          <Badge
            variant="primary-outline"
            className="font-mono text-xs uppercase"
            aria-hidden="true"
          >
            {badgeText}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        <SliderPrimitive.Root
          data-slot="slider"
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(val) => {
            if (val[0] !== undefined)
              onValueChange(Number(val[0].toFixed(decimals)))
          }}
          className="relative flex w-full touch-none items-center py-1 select-none data-disabled:opacity-50"
        >
          <SliderPrimitive.Track
            data-slot="slider-track"
            className="relative h-1 w-full grow overflow-hidden rounded-none bg-muted"
          >
            <SliderPrimitive.Range
              data-slot="slider-range"
              className="absolute h-full bg-primary select-none"
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            aria-labelledby={titleId}
            aria-describedby={description ? descriptionId : undefined}
            aria-valuetext={valueText ?? badgeText}
            className="relative block size-3 shrink-0 rounded-none border border-ring bg-white ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-1 focus-visible:ring-1 focus-visible:outline-hidden active:ring-1 disabled:pointer-events-none disabled:opacity-50"
          />
        </SliderPrimitive.Root>
        <div
          className="flex justify-between gap-1 pt-1"
          role="group"
          aria-labelledby={titleId}
        >
          {presets.map((p) => (
            <Button
              key={p.value}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onValueChange(p.value)}
              aria-pressed={value === p.value}
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
