"use client"

import React from "react"
import { TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

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
