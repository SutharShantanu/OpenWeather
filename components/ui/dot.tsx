import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const KNOWN_COLOR_VARIANTS = [
    "default",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "danger",
    "destructive",
    "muted",
    "neutral",
    "current",
    "white",
    "black",
] as const

export type DotColorVariant = (typeof KNOWN_COLOR_VARIANTS)[number]

const KNOWN_SIZE_VARIANTS = ["xs", "sm", "md", "lg", "xl"] as const
export type DotSizeVariant = (typeof KNOWN_SIZE_VARIANTS)[number]

const KNOWN_RADIUS_VARIANTS = [
    "none",
    "xs",
    "sm",
    "md",
    "lg",
    "full",
] as const
export type DotRadiusVariant = (typeof KNOWN_RADIUS_VARIANTS)[number]

const DotVariants = cva(
    "inline-flex shrink-0",
    {
        variants: {
            variant: {
                default: "bg-primary/60",
                primary: "bg-primary",
                secondary: "bg-secondary",
                info: "bg-blue-500 dark:bg-blue-500",
                success: "bg-emerald-500 dark:bg-emerald-500",
                warning: "bg-amber-500 dark:bg-amber-500",
                danger: "bg-red-500 dark:bg-red-500",
                destructive: "bg-destructive",
                muted: "bg-muted-foreground/60",
                neutral: "bg-muted-foreground",
                current: "bg-current",
                white: "bg-white",
                black: "bg-black",
            },
            size: {
                xs: "size-1",
                sm: "size-1.5",
                md: "size-2",
                lg: "size-2.5",
                xl: "size-3",
            },
            radius: {
                none: "rounded-none",
                xs: "rounded-xs",
                sm: "rounded-sm",
                md: "rounded-md",
                lg: "rounded-lg",
                full: "rounded-full",
            },
            pulse: {
                true: "animate-pulse",
                false: "",
            },
            ping: {
                true: "animate-ping",
                false: "",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "md",
            radius: "full",
            pulse: false,
            ping: false,
        },
    }
)

export interface DotProps
    extends Omit<React.ComponentProps<"span">, "color"> {
    variant?: DotColorVariant
    color?: DotColorVariant | (string & {})
    size?: DotSizeVariant | number | (string & {})
    radius?: DotRadiusVariant | number | (string & {})
    pulse?: boolean
    ping?: boolean
}

function Dot({
    className,
    variant,
    color,
    size,
    radius,
    pulse,
    ping,
    style,
    ...props
}: DotProps) {
    // 1. Resolve variant / color
    let resolvedVariant: DotColorVariant | undefined = variant
    let customBgColor: string | undefined = undefined

    if (!resolvedVariant && color) {
        if (KNOWN_COLOR_VARIANTS.includes(color as DotColorVariant)) {
            resolvedVariant = color as DotColorVariant
        } else {
            customBgColor = color
        }
    }

    // If no variant or color was specified, inspect className for text color or background
    if (!resolvedVariant && !customBgColor) {
        if (className?.includes("text-") && !className?.includes("bg-")) {
            resolvedVariant = "current"
        } else if (className?.includes("bg-")) {
            resolvedVariant = undefined
        } else {
            resolvedVariant = "default"
        }
    }

    // 2. Resolve size
    let resolvedSize: DotSizeVariant | undefined = undefined
    let customSizeStyle: React.CSSProperties = {}

    if (typeof size === "number") {
        customSizeStyle = { width: size, height: size }
    } else if (typeof size === "string") {
        if (KNOWN_SIZE_VARIANTS.includes(size as DotSizeVariant)) {
            resolvedSize = size as DotSizeVariant
        } else {
            customSizeStyle = { width: size, height: size }
        }
    } else {
        const hasCustomSizeClass =
            className?.includes("size-") ||
            (className?.includes("h-") && className?.includes("w-"))
        resolvedSize = hasCustomSizeClass ? undefined : "md"
    }

    // 3. Resolve radius
    let resolvedRadius: DotRadiusVariant | undefined = undefined
    let customRadiusStyle: React.CSSProperties = {}

    if (typeof radius === "number") {
        customRadiusStyle = { borderRadius: radius }
    } else if (typeof radius === "string") {
        if (KNOWN_RADIUS_VARIANTS.includes(radius as DotRadiusVariant)) {
            resolvedRadius = radius as DotRadiusVariant
        } else {
            customRadiusStyle = { borderRadius: radius }
        }
    } else {
        const hasCustomRadiusClass = className?.includes("rounded")
        resolvedRadius = hasCustomRadiusClass ? undefined : "full"
    }

    const mergedStyle: React.CSSProperties = {
        ...(customBgColor ? { backgroundColor: customBgColor } : {}),
        ...customSizeStyle,
        ...customRadiusStyle,
        ...style,
    }

    return (
        <span
            aria-hidden
            data-slot="dot"
            className={cn(
                DotVariants({
                    variant: resolvedVariant,
                    size: resolvedSize,
                    radius: resolvedRadius,
                    pulse,
                    ping,
                }),
                className
            )}
            style={Object.keys(mergedStyle).length > 0 ? mergedStyle : undefined}
            {...props}
        />
    )
}

export { Dot, DotVariants }

