"use client"

import * as React from "react"
import Link from "next/link"
import { cva, type VariantProps } from "class-variance-authority"
import { IconStack } from "@/components/reui/icon-stack"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"

const emptyStateVariants = cva(
  "flex w-full min-w-0 flex-1 flex-col items-center justify-center text-center text-balance transition-all",
  {
    variants: {
      variant: {
        /** Card with dashed border & subtle background tint (Default) */
        dashed:
          "rounded-lg border border-dashed border-border bg-card/40 text-card-foreground",
        /** Solid bordered card container */
        card:
          "rounded-lg border border-border bg-card text-card-foreground shadow-xs",
        /** Subtle muted container for popovers, drawers & dialogs */
        muted:
          "rounded-lg border border-dashed border-border/80 bg-muted/10 text-foreground",
        /** Clean transparent borderless state */
        ghost: "border-none bg-transparent text-foreground",
        /** Full width container designed for table row injection */
        table: "w-full border-none bg-transparent text-foreground",
      },
      size: {
        sm: "py-5 px-3 gap-2.5",
        default: "py-8 px-6 gap-3.5",
        lg: "py-12 px-6 gap-4",
      },
    },
    defaultVariants: {
      variant: "dashed",
      size: "default",
    },
  }
)

export type EmptyStateSize = "sm" | "default" | "lg"

export interface EmptyStateAction {
  label: React.ReactNode
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  icon?: React.ReactNode | React.ComponentType<{ className?: string }>
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  href?: string
  className?: string
  disabled?: boolean
}

export type EmptyStateIconProp =
  | React.ReactNode
  | React.ComponentType<{ className?: string }>

export interface EmptyStateProps
  extends Omit<React.ComponentProps<"div">, "title">,
    VariantProps<typeof emptyStateVariants> {
  /** Title text or custom heading node */
  title?: React.ReactNode
  titleClassName?: string

  /** Description text or custom explanatory node */
  description?: React.ReactNode
  descriptionClassName?: string

  /** Icon component (e.g. MapPin) or pre-configured JSX element (e.g. <MapPin className="size-4 text-primary" />) */
  icon?: EmptyStateIconProp
  iconClassName?: string
  iconStackClassName?: string

  /** Whether to wrap the icon in the ReUI 3D isometric IconStack container (default: true) */
  withIconStack?: boolean

  /** Completely custom media or illustration node (takes precedence over icon) */
  media?: React.ReactNode

  /** Primary call-to-action button or custom ReactNode */
  primaryAction?: EmptyStateAction | React.ReactNode

  /** Secondary call-to-action button or custom ReactNode */
  secondaryAction?: EmptyStateAction | React.ReactNode

  /** Custom actions container or additional button controls */
  actions?: React.ReactNode

  /** ColSpan when variant="table" (defaults to 100 to span all columns) */
  colSpan?: number

  /** Class applied to the <tr> element when variant="table" */
  rowClassName?: string

  /** Class applied to the <td> element when variant="table" */
  cellClassName?: string

  /** Custom class for the internal EmptyHeader */
  headerClassName?: string

  /** Custom class for the internal EmptyContent / actions row */
  contentClassName?: string
}

function renderAction(
  action: EmptyStateAction | React.ReactNode,
  defaultVariant: ButtonProps["variant"],
  defaultSize: ButtonProps["size"]
) {
  if (!action) return null

  if (React.isValidElement(action)) {
    return action
  }

  const act = action as EmptyStateAction

  const renderIcon = () => {
    if (!act.icon) return null
    if (React.isValidElement(act.icon)) {
      return <span className="mr-1.5 shrink-0">{act.icon}</span>
    }
    if (typeof act.icon === "function" || (typeof act.icon === "object" && act.icon !== null)) {
      const IconComp = act.icon as React.ComponentType<{ className?: string }>
      return <IconComp className="mr-1.5 size-3.5 shrink-0" />
    }
    return null
  }

  const buttonElement = (
    <Button
      type="button"
      size={act.size ?? defaultSize}
      variant={act.variant ?? defaultVariant}
      onClick={act.onClick}
      disabled={act.disabled}
      className={act.className}
      asChild={Boolean(act.href)}
    >
      {act.href ? (
        <Link href={act.href}>
          {renderIcon()}
          {act.label}
        </Link>
      ) : (
        <>
          {renderIcon()}
          {act.label}
        </>
      )}
    </Button>
  )

  return buttonElement
}

export function EmptyState({
  variant = "dashed",
  size = "default",
  title,
  titleClassName,
  description,
  descriptionClassName,
  icon,
  iconClassName,
  iconStackClassName,
  withIconStack = true,
  media,
  primaryAction,
  secondaryAction,
  actions,
  colSpan = 100,
  rowClassName,
  cellClassName,
  headerClassName,
  contentClassName,
  className,
  children,
  ...props
}: EmptyStateProps) {
  const currentSize = size ?? "default"

  // IconStack dimensions based on size
  const iconStackSizeMap: Record<EmptyStateSize, string> = {
    sm: "h-16 w-14 text-muted-foreground/70",
    default: "h-20 w-18 text-primary",
    lg: "h-24 w-22 text-primary",
  }

  // Fallback inner icon size based on size
  const iconSizeMap: Record<EmptyStateSize, string> = {
    sm: "size-3.5 text-muted-foreground",
    default: "size-4 text-primary",
    lg: "size-5 text-primary",
  }

  // Title typography
  const titleSizeMap: Record<EmptyStateSize, string> = {
    sm: "text-xs font-medium",
    default: "text-sm font-medium",
    lg: "text-base font-semibold",
  }

  // Description typography
  const descriptionSizeMap: Record<EmptyStateSize, string> = {
    sm: "text-tiny text-muted-foreground",
    default: "text-xs/relaxed text-muted-foreground",
    lg: "text-sm/relaxed text-muted-foreground",
  }

  const renderIconNode = () => {
    if (!icon) return null

    if (React.isValidElement(icon)) {
      return icon
    }

    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComponent = icon as React.ComponentType<{ className?: string }>
      return <IconComponent className={cn(iconSizeMap[currentSize], iconClassName)} />
    }

    return icon
  }

  const mediaNode = media ? (
    <EmptyMedia>{media}</EmptyMedia>
  ) : icon ? (
    <EmptyMedia>
      {withIconStack ? (
        <IconStack
          aria-hidden="true"
          className={cn(iconStackSizeMap[currentSize], iconStackClassName)}
        >
          {renderIconNode()}
        </IconStack>
      ) : (
        <div className="flex items-center justify-center p-2 rounded-full bg-muted/50">
          {renderIconNode()}
        </div>
      )}
    </EmptyMedia>
  ) : null

  const hasActions = Boolean(primaryAction || secondaryAction || actions)
  const defaultActionSize: ButtonProps["size"] = currentSize === "sm" ? "xs" : "sm"

  const mainContent = (
    <>
      {(mediaNode || title || description) && (
        <EmptyHeader className={headerClassName}>
          {mediaNode}
          {title && (
            <EmptyTitle className={cn(titleSizeMap[currentSize], titleClassName)}>
              {title}
            </EmptyTitle>
          )}
          {description && (
            <EmptyDescription className={cn(descriptionSizeMap[currentSize], descriptionClassName)}>
              {description}
            </EmptyDescription>
          )}
        </EmptyHeader>
      )}

      {hasActions && (
        <EmptyContent className={cn("flex-row flex-wrap justify-center gap-2 pt-1", contentClassName)}>
          {renderAction(primaryAction, "default", defaultActionSize)}
          {renderAction(secondaryAction, "outline", defaultActionSize)}
          {actions}
        </EmptyContent>
      )}

      {children}
    </>
  )

  // When used inside HTML / TanStack / Radix <table>
  if (variant === "table") {
    return (
      <tr className={cn("hover:bg-transparent border-b border-border/40", rowClassName)}>
        <td
          colSpan={colSpan}
          className={cn("p-0 text-center align-middle", cellClassName)}
        >
          <Empty
            data-slot="empty-state"
            data-variant={variant}
            data-size={size}
            className={cn(emptyStateVariants({ variant, size }), className)}
            {...props}
          >
            {mainContent}
          </Empty>
        </td>
      </tr>
    )
  }

  return (
    <Empty
      data-slot="empty-state"
      data-variant={variant}
      data-size={size}
      className={cn(emptyStateVariants({ variant, size }), className)}
      {...props}
    >
      {mainContent}
    </Empty>
  )
}

// Re-export underlying primitive components for advanced composition
export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
}
