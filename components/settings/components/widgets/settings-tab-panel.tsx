"use client"

import React from "react"
import { TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export interface SettingsTabPanelProps extends React.ComponentProps<
  typeof TabsContent
> {
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
        "min-h-0 flex-1 space-y-4 overflow-y-auto p-4 pb-8 focus-visible:outline-none sm:p-5 sm:pb-10",
        className
      )}
      {...props}
    >
      {children}
    </TabsContent>
  )
}
