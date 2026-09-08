"use client"

import * as React from "react"
import { IconStack } from "@/components/reui/icon-stack"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { DatabaseIcon, InboxIcon, UserPlusIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EmptyStateProps {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  primaryAction?: {
    label: React.ReactNode
    onClick?: () => void
    icon?: React.ReactNode
  }
  secondaryAction?: {
    label: React.ReactNode
    onClick?: () => void
    icon?: React.ReactNode
  }
  className?: string
  children?: React.ReactNode
}

export function EmptyState({
  title,
  description,
  icon = <InboxIcon className="text-primary size-5" />,
  primaryAction,
  secondaryAction,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div className={cn("flex items-center justify-center p-4", className)}>
      <Empty className="max-w-md py-10">
        <EmptyHeader>
          <EmptyMedia>
            <IconStack aria-hidden="true" className="text-primary h-24 w-22">
              {icon}
            </IconStack>
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          {description && <EmptyDescription>{description}</EmptyDescription>}
        </EmptyHeader>

        {(primaryAction || secondaryAction || children) && (
          <EmptyContent className="flex-row justify-center gap-2">
            {primaryAction && (
              <Button size="sm" onClick={primaryAction.onClick}>
                {primaryAction.icon && (
                  <span className="mr-1.5 shrink-0">{primaryAction.icon}</span>
                )}
                {primaryAction.label}
              </Button>
            )}
            {secondaryAction && (
              <Button variant="outline" size="sm" onClick={secondaryAction.onClick}>
                {secondaryAction.icon && (
                  <span className="mr-1.5 shrink-0">{secondaryAction.icon}</span>
                )}
                {secondaryAction.label}
              </Button>
            )}
            {children}
          </EmptyContent>
        )}
      </Empty>
    </div>
  )
}

export function Pattern() {
  return (
    <div className="flex items-center justify-center p-4">
      <Empty className="max-w-md py-10">
        <EmptyHeader>
          <EmptyMedia>
            <IconStack aria-hidden="true" className="text-primary h-24 w-22">
              <InboxIcon className="text-primary size-5" />
            </IconStack>
          </EmptyMedia>
          <EmptyTitle>Workspace is ready</EmptyTitle>
          <EmptyDescription>
            Invite teammates or connect a data source to start filling this
            view.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
          <Button size="sm">
            <UserPlusIcon data-icon="inline-start" />
            Invite team
          </Button>
          <Button variant="outline" size="sm">
            <DatabaseIcon data-icon="inline-start" />
            Connect source
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  )
}
