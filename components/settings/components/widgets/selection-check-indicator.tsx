"use client"

import React from "react"
import { Check } from "lucide-react"

export function SelectionCheckIndicator({ isSelected }: { isSelected: boolean }) {
  if (isSelected) {
    return (
      <span className="inline-flex size-4.5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xs">
        <Check className="size-3 stroke-[2.5]" />
      </span>
    )
  }
  return (
    <span className="size-4.5 shrink-0 rounded-full border border-border group-hover:border-primary/40" />
  )
}
