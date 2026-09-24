"use client"

import React from "react"
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
import { cn } from "@/lib/utils"
import type { UnitOption } from "../../types"

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
  options: (UnitOption<T> & { label: string })[]
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
          <SelectTrigger aria-label={title} className="w-full justify-between border-border bg-background/60 font-mono text-xs">
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
