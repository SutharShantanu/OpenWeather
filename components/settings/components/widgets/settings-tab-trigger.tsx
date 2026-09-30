"use client"

import React from "react"
import { TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface SettingsTabTriggerProps extends React.ComponentProps<
  typeof TabsTrigger
> {
  value: string
  label: string
  badge?: React.ReactNode
  icon?: React.ReactNode
}

export function SettingsTabTrigger({
  value,
  label,
  badge,
  icon,
  className,
  ...props
}: SettingsTabTriggerProps) {
  return (
    <TabsTrigger
      value={value}
      className={cn("shrink-0 gap-1.5 whitespace-nowrap", className)}
      {...props}
    >
      {icon}
      <span className="truncate">{label}</span>
      {badge}
    </TabsTrigger>
  )
}
