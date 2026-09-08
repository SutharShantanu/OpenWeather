import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-none border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/95 shadow-2xs",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 shadow-2xs",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground active:bg-secondary/90",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        "destructive-solid":
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-xs focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/80 dark:hover:bg-destructive/90",
        "destructive-outline":
          "border-destructive/30 text-destructive bg-background hover:bg-destructive/10 hover:border-destructive/50 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:border-destructive/40 dark:hover:bg-destructive/20",
        "destructive-ghost":
          "text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        success:
          "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs focus-visible:ring-emerald-500/30 dark:bg-emerald-600 dark:hover:bg-emerald-500",
        "success-soft":
          "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 focus-visible:ring-emerald-500/20",
        warning:
          "bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 focus-visible:ring-amber-500/20",
        muted:
          "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground dark:bg-muted/40 dark:hover:bg-muted/70",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/80",
        link:
          "text-primary underline-offset-4 hover:underline p-0 h-auto font-normal",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-none px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-none px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-4",
        xl: "h-10 gap-2 px-3.5 text-sm has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-4.5",
        icon: "size-8 p-0 [&_svg:not([class*='size-'])]:size-4",
        "icon-xs": "size-6 rounded-none p-0 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 rounded-none p-0 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-lg": "size-9 p-0 [&_svg:not([class*='size-'])]:size-4.5",
        "icon-xl": "size-10 p-0 [&_svg:not([class*='size-'])]:size-5",
      },
      shape: {
        default: "rounded-none",
        square: "rounded-none",
        rounded: "rounded-md",
        pill: "rounded-full",
      },
      fullWidth: {
        true: "w-full justify-center",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
      fullWidth: false,
    },
  }
)

const statusDots: Record<string, { dot: string; ping: string }> = {
  online: { dot: "bg-emerald-500", ping: "bg-emerald-400" },
  live: { dot: "bg-emerald-500", ping: "bg-emerald-400" },
  away: { dot: "bg-amber-500", ping: "bg-amber-400" },
  busy: { dot: "bg-rose-500", ping: "bg-rose-400" },
  offline: { dot: "bg-muted-foreground/60", ping: "bg-muted-foreground/30" },
}

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loadingText?: React.ReactNode
  spinnerPlacement?: "start" | "end"
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  icon?: React.ReactNode
  shortcut?: string | string[]
  status?: "online" | "offline" | "busy" | "away" | "live"
  badge?: React.ReactNode
  revealIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      shape = "default",
      fullWidth = false,
      asChild = false,
      loading = false,
      loadingText,
      spinnerPlacement = "start",
      leftIcon,
      rightIcon,
      icon,
      shortcut,
      status,
      badge,
      revealIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    // If asChild is enabled, Radix Slot expects exactly a single child element
    if (asChild) {
      return (
        <Slot.Root
          data-slot="button"
          data-variant={variant}
          data-size={size}
          data-shape={shape}
          className={cn(
            buttonVariants({ variant, size, shape, fullWidth, className })
          )}
          {...props}
        >
          {children}
        </Slot.Root>
      )
    }

    const resolvedLeftIcon = leftIcon ?? icon
    const showStartSpinner = loading && spinnerPlacement === "start"
    const showEndSpinner = loading && spinnerPlacement === "end"

    const spinnerElement = (
      <svg
        data-slot="button-spinner"
        data-icon={showStartSpinner ? "inline-start" : "inline-end"}
        className="animate-spin shrink-0 size-3.5"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    )

    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-loading={loading ? "true" : undefined}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(
          buttonVariants({ variant, size, shape, fullWidth, className }),
          revealIcon && "group/sliding relative overflow-hidden"
        )}
        {...props}
      >
        {/* Status Dot */}
        {status && statusDots[status] && (
          <span
            data-slot="button-status"
            aria-hidden="true"
            className="relative flex size-2 shrink-0 items-center justify-center mr-0.5"
          >
            {(status === "live" || status === "online") && (
              <span
                className={cn(
                  "absolute inline-flex size-full animate-ping rounded-full opacity-75 duration-1000",
                  statusDots[status].ping
                )}
              />
            )}
            <span
              className={cn(
                "relative inline-flex size-2 rounded-full",
                statusDots[status].dot
              )}
            />
          </span>
        )}

        {/* Start Icon or Spinner */}
        {showStartSpinner ? (
          spinnerElement
        ) : resolvedLeftIcon ? (
          <span
            data-icon="inline-start"
            className="inline-flex shrink-0 items-center"
          >
            {resolvedLeftIcon}
          </span>
        ) : null}

        {/* Main Content */}
        {loading && loadingText ? (
          <span>{loadingText}</span>
        ) : revealIcon ? (
          <span className="inline-flex items-center transition-transform duration-300 group-hover/sliding:-translate-x-2">
            {children}
          </span>
        ) : (
          children
        )}

        {/* End Icon or Spinner */}
        {showEndSpinner ? (
          spinnerElement
        ) : rightIcon ? (
          <span
            data-icon="inline-end"
            className="inline-flex shrink-0 items-center"
          >
            {rightIcon}
          </span>
        ) : null}

        {/* Sliding Reveal Icon */}
        {revealIcon && (
          <span
            data-icon="inline-end"
            aria-hidden="true"
            className="absolute right-2.5 translate-x-8 opacity-0 transition-all duration-300 group-hover/sliding:translate-x-0 group-hover/sliding:opacity-100"
          >
            {revealIcon}
          </span>
        )}

        {/* Counter / Inline Badge */}
        {badge !== undefined && badge !== null && (
          <span
            data-slot="button-badge"
            className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-medium font-mono leading-none bg-muted/80 text-foreground/80 border border-border/50 rounded-none ml-1"
          >
            {badge}
          </span>
        )}

        {/* Keyboard Shortcut */}
        {shortcut && (
          <span
            data-slot="button-shortcut"
            aria-hidden="true"
            className="ml-auto pointer-events-none inline-flex items-center gap-0.5 pl-1.5"
          >
            {Array.isArray(shortcut) ? (
              shortcut.map((key, i) => (
                <kbd
                  key={i}
                  className="font-mono text-[10px] uppercase text-muted-foreground bg-muted/70 px-1 py-0.5 border border-border/40 rounded-none leading-none select-none"
                >
                  {key}
                </kbd>
              ))
            ) : (
              <kbd className="font-mono text-[10px] uppercase text-muted-foreground bg-muted/70 px-1 py-0.5 border border-border/40 rounded-none leading-none select-none">
                {shortcut}
              </kbd>
            )}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = "Button"

export { Button, buttonVariants }
