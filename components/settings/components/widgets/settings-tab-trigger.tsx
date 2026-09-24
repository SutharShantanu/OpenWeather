"use client"

import React from "react"
import { TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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
    <TabsTrigger
      value={value}
      className={cn("gap-1.5 shrink-0 whitespace-nowrap", className)}
      {...props}
    >
      <span>{label}</span>
      {badge}
    </TabsTrigger>
  )
}
