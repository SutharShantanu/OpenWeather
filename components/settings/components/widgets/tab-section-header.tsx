"use client"

import React from "react"

export interface TabSectionHeaderProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: React.ReactNode
}

export function TabSectionHeader({
  icon: Icon,
  title,
  description,
  action,
}: TabSectionHeaderProps) {
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
